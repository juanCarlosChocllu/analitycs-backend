import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Medico } from './schema/medicoSchema';
import { Model, Types } from 'mongoose';
import { DetalleMedico } from './schema/detalleMedico';

@Injectable()
export class MedicoService {
  constructor(
    @InjectModel(Medico.name)
    private readonly medico: Model<Medico>,
    @InjectModel(DetalleMedico.name)
    private readonly detalleMedico: Model<DetalleMedico>,
  ) {}

  async guardarMedico(nombre: string) {
    const asesor = await this.medico.findOne({ nombre: nombre });
    if (!asesor) {
      return this.medico.create({ nombre: nombre });
    }
    return asesor;
  }

  async guardarDetalleMedico(medico: Types.ObjectId, especialidad: string) {
    const detalle = await this.detalleMedico.findOne({
      medico: new Types.ObjectId(medico),
      especialidad: especialidad,
      //sucursal:new Types.ObjectId(sucursal)
    });
    if (!detalle) {
      return this.detalleMedico.create({
        medico: new Types.ObjectId(medico),
        especialidad: especialidad,
          //sucursal:new Types.ObjectId(sucursal)
        
      });
    }
    return detalle;
  }
}
