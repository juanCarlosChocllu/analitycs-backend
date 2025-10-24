import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJornadaDto } from './dto/create-jornada.dto';
import { UpdateJornadaDto } from './dto/update-jornada.dto';
import { Jornada } from './schema/jornada.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Flag } from 'src/sucursal/enums/flag.enum';
import { flagEnum } from 'src/core-app/enum/coreEnum';

@Injectable()
export class JornadaService {
  constructor(
    @InjectModel(Jornada.name)
    private readonly jornada: Model<Jornada>,
  ) {}
  create(createJornadaDto: CreateJornadaDto) {
    const fechaInicio = new Date(createJornadaDto.fechaInicio);
    const fechaFin = new Date(createJornadaDto.fechaFin);
    let diasTrabajados: number = 0;
    const mes = fechaFin.getMonth() + 1;
    const aqo = fechaFin.getFullYear();

    for (
      let d = new Date(fechaInicio);
      d <= fechaFin;
      d.setDate(d.getDate() + 1)
    ) {
      if (d.getDay() != 0) {
        diasTrabajados++;
      }
    }

    createJornadaDto.detalleAsesor = new Types.ObjectId(
      createJornadaDto.detalleAsesor,
    );
    return this.jornada.create({
      ...createJornadaDto,
      diasLaborales: diasTrabajados,
      meses: mes,
      aqo: aqo,
    });
  }

  listarJornadaPorAsesor(detalleAsesor: Types.ObjectId) {
    const date = new Date();
    const mes = date.getMonth() + 1;
    const aqo = date.getFullYear();

    return this.jornada.findOne(
      {
        detalleAsesor: new Types.ObjectId(detalleAsesor),
        flag: Flag.nuevo,
        meses: mes,
        aqo: aqo,
      },
      {},
      { sort: { fechaCreacion: -1 } },
    );
  }

  async eliminar(id: Types.ObjectId) {
    const jornada = await this.jornada.findOne({ _id: new Types.ObjectId(id) });
    if (!jornada) {
      throw new NotFoundException();
    }
    await this.jornada.updateOne(
      { _id: new Types.ObjectId(id) },
      { flag: flagEnum.eliminado },
    );
  }

  async buscarDiasTrabajados(
    fechaInicio: Date,
    fechaFin: Date,
    detalleAsesor: Types.ObjectId,
  ) {
    const jornada = await this.jornada.find({
      detalleAsesor: detalleAsesor,
      flag: Flag.nuevo,
      fechaInicio: { $gte: fechaInicio},
     
    });
    let dias: number = 0;
    for (const item of jornada) {
      dias += item.diasLaborales;
    }

    return dias;
  }
}
