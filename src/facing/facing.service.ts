import { Injectable } from '@nestjs/common';
import { CreateFacingDto } from './dto/create-facing.dto';
import { UpdateFacingDto } from './dto/update-facing.dto';
import { Facing } from './schema/facing.schema';
import { Model, PipelineStage, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Flag } from 'src/sucursal/enums/flag.enum';
import { BuscadorFacingDto } from './dto/BuscadorFacingDto';
import { rutaArchivoUpload } from 'src/core-app/utils/coreAppUtils';
import * as ExcelJS from 'exceljs';
import { ExhibicionService } from 'src/exhibicion/exhibicion.service';
import { SucursalService } from 'src/sucursal/sucursal.service';
import { MarcasService } from 'src/marcas/marcas.service';
@Injectable()
export class FacingService {
  constructor(
    @InjectModel(Facing.name)
    private readonly facing: Model<Facing>,
    private readonly exhibicionService: ExhibicionService,
    private readonly sucursalService: SucursalService,
    private readonly marcasService: MarcasService,
  ) {}

  async create(createFacingDto: CreateFacingDto) {
    for (const sucursal of createFacingDto.sucursal) {
      for (const item of createFacingDto.marca) {
        await this.facing.create({
          cantidad: createFacingDto.cantidad,
          exhibicion: new Types.ObjectId(createFacingDto.exhibicion),
          marca: new Types.ObjectId(item),
          sucursal: new Types.ObjectId(sucursal),
        });
      }
    }
  }
  async listarFacing(buscadorFacingDto: BuscadorFacingDto) {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          flag: Flag.nuevo,
          sucursal: {
            $in: buscadorFacingDto.sucursal.map(
              (item) => new Types.ObjectId(item),
            ),
          },
          fechaCreacion: {
            $gte: buscadorFacingDto.fechaInicio,
            $lte: buscadorFacingDto.fechaFin,
          },
        },
      },
      {
        $lookup: {
          from: 'Exhibicion',
          foreignField: '_id',
          localField: 'exhibicion',
          as: 'exhibicion',
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
          from: 'Marca',
          foreignField: '_id',
          localField: 'marca',
          as: 'marca',
        },
      },
      {
        $project: {
          _id: 1,
          cantidad: 1,
          sucursal: { $arrayElemAt: ['$sucursal.nombre', 0] },
          exhibicion: { $arrayElemAt: ['$exhibicion.nombre', 0] },
          marca: { $arrayElemAt: ['$marca.nombre', 0] },
          fechaCreacion: 1,
        },
      },
    ];
    const facing = await this.facing.aggregate(pipeline);

    return facing;
  }

  async cantidadDeFacing(
    marca: Types.ObjectId,
    sucursal: Types.ObjectId,
    fechaInicio: Date,
    fechaFin: Date,
  ) {
    const data = await this.facing.aggregate([
      {
        $match: {
          marca: new Types.ObjectId(marca),
          sucursal: new Types.ObjectId(sucursal),
          fechaCreacion: { $gte: fechaInicio, $lte: fechaFin },
          flag: Flag.nuevo,
        },
      },
      {
        $group: {
          _id: null,
          cantidad: { $sum: '$cantidad' },
        },
      },
    ]);

    return data[0]?.cantidad || 0;
  }

  async eliminarFacing(id: Types.ObjectId) {
    return this.facing.findOneAndUpdate({ _id: id }, { flag: Flag.eliminado });
  }

  async cargaMasiva(file: Express.Multer.File) {
    const path = rutaArchivoUpload(file.filename);
    const workbook = new ExcelJS.stream.xlsx.WorkbookReader(path, {
      entries: 'emit',
    });
    let contador: number = 0;
    for await (const hojas of workbook) {
      for await (const hoja of hojas) {
        contador++;
        if (contador == 1) {
          continue;
        }
        const sucursal = hoja.getCell(1).value;
        const exhibición = hoja.getCell(2).value;
        const marca = hoja.getCell(3).value;
        const cantidad = hoja.getCell(4).value;

        if (
          sucursal &&
          exhibición &&
          marca &&
          cantidad &&
          Number(cantidad) > 0
        ) {
          const [sucur, mar, exhi] = await Promise.all([
            this.sucursalService.buscarSucursal(
              sucursal.toString().toUpperCase(),
            ),

            this.marcasService.listarMarcaProducto(
              marca.toString().toUpperCase(),
            ),
            this.exhibicionService.gurardarExhibicion(
              exhibición.toString().toUpperCase(),
            ),
          ]);
         

          if (sucur && mar && exhi) {
            await this.facing.create({
              cantidad: Number(cantidad),
              exhibicion: exhi._id,
              marca: mar._id,
              sucursal: sucur._id,
            });
          }
        }
      }
    }
  }
}
