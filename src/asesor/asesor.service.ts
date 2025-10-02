import { Injectable } from '@nestjs/common';
import { CreateAsesorDto } from './dto/create-asesor.dto';
import { UpdateAsesorDto } from './dto/update-asesor.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Asesor } from './schema/asesor.schema';
import { Model, Types } from 'mongoose';
import { DetalleAsesor } from './schema/detalleAsesor';

@Injectable()
export class AsesorService {
  constructor(
    @InjectModel(Asesor.name)
    private readonly asesor: Model<Asesor>,
    @InjectModel(DetalleAsesor.name)
    private readonly detalleAsesor: Model<DetalleAsesor>,
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
  listar(){
    return this.asesor.find()
  }

  async listarAsesorPorSucursal(sucursal:Types.ObjectId) {
    const asesor = await this.detalleAsesor.aggregate<{
      _id: Types.ObjectId;
      nombre: string;
      sucursalNombre: string;
      idSucursal: Types.ObjectId;
    }>([
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

  
  public async  asignarUsuarioAsesor(id:Types.ObjectId, usuario:Types.ObjectId){
    const asesor= await this.asesor.findOne({_id:id})
    if(asesor){
      return this.asesor.updateOne({_id:new Types.ObjectId(id)},{usuario:usuario})
    }
  }
 async  listarSucursalesAsesores(asesor:Types.ObjectId){
    const sucursales = await this.detalleAsesor.aggregate([
      {
        $match:{
          asesor:new  Types.ObjectId(asesor)
        }
      },
      {
        $lookup:{
          from:'Sucursal',
          foreignField:'_id',
          localField:'sucursal',
          as:'sucursal'
        }
      },
      {
        $project:{
          _id:0,
          asesor:'$_id',
           nombreSucursal:{$arrayElemAt: [ '$sucursal.nombre', 0 ]}
        }
      }
    ])
  
    
    return sucursales
  }

}
