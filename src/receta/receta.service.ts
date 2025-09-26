import { Injectable } from '@nestjs/common';
import { Receta } from './schema/receta.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { recetaI, RecetaMedicoI } from './interface/receta';
import { BuscadorRecetaDto } from 'src/venta/dto/BuscadorReceta.dto';

@Injectable()
export class RecetaService {
  constructor(
    @InjectModel(Receta.name)
    private readonly receta: Model<Receta>,
  ) {}

  async regitrarReceta(data: recetaI) {
    const receta = await this.receta.findOne({ codigoMia: data.codigoMia });    
    if (!receta) {
      return this.receta.create(data);
    }
    return receta;
  }
   public async listarRecetaMedicos(
    buscadorRecetaDto: BuscadorRecetaDto,
  ): Promise<RecetaMedicoI[]> {
    const recetas = await this.receta.aggregate([
      {
        $match: {
          fecha: {
            $gte: buscadorRecetaDto.fechaInicio,
            $lte: buscadorRecetaDto.fechaFin,
          },
        },
      },
     {
        $match:{
           codigoReceta: { $nin: ["", null] }
        }
      },
         {
        $lookup: {
          from: 'DetalleMedico',
          foreignField: '_id',
          localField: 'detalleMedico',
          as: 'detalleMedico',
        },
      },
       {
        $unwind: { path: '$detalleMedico', preserveNullAndEmptyArrays: false },
      },
     {
        $lookup: {
          from: 'Medico',
          foreignField: '_id',
          localField: 'detalleMedico.medico',
          as: 'medico',
        },
      },
      {
        $unwind: { path: '$medico', preserveNullAndEmptyArrays: false },
      },
      {
        $group: {
          _id: {
            nombre: '$medico.nombre',
            especialidad: '$detalleMedico.especialidad',
          },
          data: { $push: {codigo:'$codigoReceta' , fecha:'$fecha'} },
          recetas: { $sum: 1 },
          idMedico: { $first: '$medico._id' },
        },
      },
      {
        $project: {
          _id:0,
          idMedico: 1,
          nombre: '$_id.nombre',
          especialidad: '$_id.especialidad',
          data: 1,
          recetas: 1,
          fecha:1,
        },
      },
    ]);    
    return recetas;
  }
}
