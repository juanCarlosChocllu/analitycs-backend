import { ConflictException, Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Asesor } from './schema/asesor.schema';
import { Model, Types, PipelineStage } from 'mongoose';
import { DetalleAsesor } from './schema/detalleAsesor';
import { JornadaService } from 'src/jornada/jornada.service';
import { BuscadorAsesorDto } from './dto/BuscadorAsesor.dto';
import { calcularPaginas, skip } from 'src/core-app/utils/coreAppUtils';
import { asesorYsucursalI } from './interface/asesor';

@Injectable()
export class AsesorService {
  constructor(
    @InjectModel(Asesor.name)
    private readonly asesor: Model<Asesor>,
    @InjectModel(DetalleAsesor.name)
    private readonly detalleAsesor: Model<DetalleAsesor>,
    private readonly jornadaService: JornadaService,
  ) {}

  async guardarAsesor(nombre: string) {
    const asesor = await this.asesor.findOne({ nombre: nombre });
    if (!asesor) {
      return this.asesor.create({ nombre: nombre });
    }
    return asesor;
  }

  async guardarDetalleAsesor(asesor: Types.ObjectId, sucursal: Types.ObjectId) {
    const detalle = await this.detalleAsesor.findOne({
      sucursal: new Types.ObjectId(sucursal),
      asesor: new Types.ObjectId(asesor),
    });
    if (!detalle) {
      return this.detalleAsesor.create({
        sucursal: new Types.ObjectId(sucursal),
        asesor: new Types.ObjectId(asesor),
      });
    }
    return detalle;
  }
  async listar() {    
    const asesor = await this.asesor.aggregate([
      {
        $match:{
          tieneUsuario:{$ne:true}
        }
      },
      {
        $lookup:{
          from:'DetalleAsesor',
          foreignField:'asesor',
          localField:'_id',
          as:'detalleAsesor'
        }
      },
      {
        $unwind:{path:'$detalleAsesor', preserveNullAndEmptyArrays:false} 
      },
        {
        $lookup:{
          from:'Sucursal',
          foreignField:'_id',
          localField:'detalleAsesor.sucursal',
          as:'sucursal'
        }
      },
        {
        $unwind:{path:'$sucursal', preserveNullAndEmptyArrays:false} 
      },
      {
        $group:{
          _id:'$_id',
          nombre:{$first:'$nombre'},
          sucursal:{$push:{ idSucursal:'$sucursal._id', idDetalle:'$detalleAsesor._id',nombre:'$sucursal.nombre' }}
        }
      },
      {
        $project:{
          _id:1,
          nombre:1,
          sucursal:1,
        }
      }

    ])

    return asesor
  }

  async listarAsesorPorSucursalDiasTrabajo(
    detaelleAsesor: Types.ObjectId | null,
    buscadorAsesorDto: BuscadorAsesorDto,
  ) {
    const filter = {};
    if (detaelleAsesor) {
      const detalle = await this.detalleAsesor.findOne({
        _id: new Types.ObjectId(detaelleAsesor),
      });
      if (detalle) {
        filter['sucursal'] = detalle.sucursal;
      }
    }
    const pipeline: PipelineStage[] = [
      {
        $match: {
          ...filter,
        },
      },

      {
        $lookup: {
          from: 'Asesor',
          foreignField: '_id',
          localField: 'asesor',
          as: 'asesor',
        },
      },
      {
        $unwind: { path: '$asesor', preserveNullAndEmptyArrays: false },
      },
      {
        $lookup: {
          from: 'Sucursal',
          foreignField: '_id',
          localField: 'sucursal',
          as: 'sucursal',
        },
      },
      ...(buscadorAsesorDto.nombre
        ? [
            {
              $match: {
                'asesor.nombre': new RegExp(buscadorAsesorDto.nombre, 'i'),
              },
            },
          ]
        : []),
      {
        $skip: skip(buscadorAsesorDto.pagina, buscadorAsesorDto.pagina),
      },
      {
        $limit: buscadorAsesorDto.limite,
      },
      {
        $project: {
          _id: 1,
          nombre: '$asesor.nombre',
          sucursal: { $arrayElemAt: ['$sucursal.nombre', 0] },
        },
      },
    ];

    const [asesor, countDocuments] = await Promise.all([
      this.detalleAsesor.aggregate(pipeline),
      this.detalleAsesor.countDocuments({ ...filter }),
    ]);
    const data = await Promise.all(
      asesor.map(async (item) => {
        const jornada = await this.jornadaService.listarJornadaPorAsesor(
          item._id,
        );
        return {
          ...item,
          jornada,
        };
      }),
    );

    const pagina = calcularPaginas(countDocuments, buscadorAsesorDto.limite);
    return { data, pagina };
  }

  async listarAsesorPorSucursal(sucursal: Types.ObjectId) {
    const asesor = await this.detalleAsesor.aggregate<asesorYsucursalI>([
      {
        $match: {
          sucursal: new Types.ObjectId(sucursal),
        },
      },
      {
        $lookup: {
          from: 'Asesor',
          foreignField: '_id',
          localField: 'asesor',
          as: 'asesor',
        },
      },
      {
        $lookup: {
          from: 'Sucursal',
          foreignField: '_id',
          localField: 'sucursal',
          as: 'sucursal',
        },
      },

      {
        $project: {
          _id: 1,
          nombre: { $arrayElemAt: ['$asesor.nombre', 0] },
          sucursalNombre: { $arrayElemAt: ['$sucursal.nombre', 0] },
          idSucursal: { $arrayElemAt: ['$sucursal._id', 0] },
        },
      },
    ]);

    return asesor;
  }

  public async asignarUsuarioAsesor(
    id: Types.ObjectId,
    usuario: Types.ObjectId,
  ) {
    const asesor = await this.asesor.findOne({ _id: id });
    if (asesor) {
      return this.asesor.updateOne(
        { _id: new Types.ObjectId(id) },
        { usuario: usuario },
      );
    }
  }
  async listarSucursalesAsesores(asesor: Types.ObjectId) {
    
    const sucursales = await this.detalleAsesor.aggregate([
      {
        $match: {
          asesor: new Types.ObjectId(asesor),
        },
      },
      {
        $lookup: {
          from: 'Sucursal',
          foreignField: '_id',
          localField: 'sucursal',
          as: 'sucursal',
        },
      },
      {
        $project: {
          _id: 0,
          asesor: '$_id',
          nombreSucursal: { $arrayElemAt: ['$sucursal.nombre', 0] },
        },
      },
    ]);
    return sucursales;
  }

  async asesorFindOne(asesor: Types.ObjectId) {
    const a = await this.asesor.findOne({ _id: asesor }).select('nombre');
    return a;
  }

  async mostrarSucursalUsuario(detalleAsesor: Types.ObjectId | null) {
    if (detalleAsesor) {
      const sucursal = await this.detalleAsesor.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(detalleAsesor),
          },
        },
        {
          $lookup: {
            from: 'Sucursal',
            foreignField: '_id',
            localField: 'sucursal',
            as: 'sucursal',
          },
        },

        {
          $lookup: {
            from: 'Empresa',
            foreignField: '_id',
            localField: 'sucursal.0.empresa',
            as: 'empresa',
          },
        },
        {
          $project: {
            _id: { $arrayElemAt: ['$sucursal._id', 0] },
            sucursal: { $arrayElemAt: ['$sucursal.nombre', 0] },
            empresa: { $arrayElemAt: ['$empresa.nombre', 0] },
          },
        },
      ]);
      return sucursal[0];
    }
  }

  async marcarConAsesorAsesor(asesor: Types.ObjectId, tieneUsuario:boolean) {
    const ase = await this.asesor.findOne({ _id: new Types.ObjectId(asesor) });
    if (ase) {
      return this.asesor.updateOne(
        { _id: new Types.ObjectId(asesor) },
        { tieneUsuario: tieneUsuario },
      );
    }
  }

  async nuevoDetalle(asesor :Types.ObjectId , sucursal:Types.ObjectId){
    const detalle = await this.detalleAsesor.findOne({sucursal:new Types.ObjectId(sucursal), asesor:new Types.ObjectId(asesor)})
    if(!detalle){
        return this.detalleAsesor.create({sucursal:new Types.ObjectId(sucursal), asesor:new Types.ObjectId(asesor)})
    }
    throw new ConflictException('Este asesor ya tiene esta sucursal asignada')
    
  }
}
