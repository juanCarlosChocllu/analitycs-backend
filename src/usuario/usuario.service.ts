import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario } from './schema/usuario.schema';
import { Model, Types } from 'mongoose';
import * as argon2 from 'argon2';

import { Request } from 'express';
import { Flag } from 'src/sucursal/enums/flag.enum';
import { RolE } from './enum/rol';
import { ResetearContrasena } from './dto/resetar-contrasena.dto';
import { AsesorService } from 'src/asesor/asesor.service';
import { rutaArchivoUpload } from 'src/core-app/utils/coreAppUtils';
import * as ExcelJS from 'exceljs';
import { flagEnum } from 'src/core-app/enum/coreEnum';
@Injectable()
export class UsuarioService {
  private readonly opcionesArgon2: argon2.Options = {
    type: argon2.argon2id,
    timeCost: 6,
    memoryCost: 2 ** 16,
    parallelism: 1,
    hashLength: 50,
  };
  constructor(
    @InjectModel(Usuario.name) private readonly usuario: Model<Usuario>,
    private readonly asesorService: AsesorService,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const username = await this.usuario.findOne({
      username: createUsuarioDto.username,
      flag: Flag.nuevo,
    });
    if (username) {
      throw new ConflictException('El usuario ya existe ');
    }
    createUsuarioDto.password = await argon2.hash(
      createUsuarioDto.password,
      this.opcionesArgon2,
    );
    if (createUsuarioDto.rol != RolE.ADMINISTRADOR) {
      await this.asesorService.marcarConAsesorAsesor(
        createUsuarioDto.asesor,
        true,
      );
      createUsuarioDto.asesor = new Types.ObjectId(createUsuarioDto.asesor);
    }
    await this.usuario.create(createUsuarioDto);
    return { status: HttpStatus.CREATED };
  }

  async buscarUsuaurio(username: string) {
    const usuario = await this.usuario
      .findOne({ username: username, flag: Flag.nuevo })
      .select('+password');
    return usuario;
  }
  async buscarUsuarioPorId(id: Types.ObjectId) {
    const usuario = await this.usuario.findOne({
      _id: new Types.ObjectId(id),
      flag: Flag.nuevo,
    });
    return usuario;
  }
  async listarusuarios() {
    const usuario = await this.usuario.aggregate([
      {
        $match: {
          flag: Flag.nuevo,
          rol: { $eq: 'ADMINISTRADOR' },
        },
      },

      {
        $project: {
          _id: 1,
          nombre: 1,
          apellidos: 1,
          username: 1,
          asesor: 1,
          rol: 1,
        },
      },
    ]);

    return usuario;
  }

  async listarusuariosAsesor() {
    const usuario = await this.usuario.aggregate([
      {
        $match: {
          flag: Flag.nuevo,
          rol: { $ne: 'ADMINISTRADOR' },
        },
      },
      {
        $lookup: {
          from: 'DetalleAsesor',
          foreignField: '_id',
          localField: 'detalleAsesor',
          as: 'detalleAsesor',
        },
      },

      { $unwind: { path: '$detalleAsesor', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'Sucursal',
          foreignField: '_id',
          localField: 'detalleAsesor.sucursal',
          as: 'sucursal',
        },
      },
      { $unwind: { path: '$sucursal', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          nombre: { $first: '$nombre' },
          apellidos: { $first: '$apellidos' },
          asesor: { $first: '$asesor' },
          username: { $first: '$username' },
          rol: { $first: '$rol' },
          sucursales: {
            $push: {
              sucursal: '$sucursal.nombre',
              asesor: '$asesorArr._id',
            },
          },
        },
      },
    ]);

    return usuario;
  }

  async findOne(id: Types.ObjectId) {
    const usuario = await this.usuario.findOne({
      _id: new Types.ObjectId(id),
      flag: Flag.nuevo,
    });
    if (!usuario) {
      throw new NotFoundException();
    }
    return usuario;
  }

  async actualizar(id: Types.ObjectId, updateUsuarioDto: UpdateUsuarioDto) {
    try {
      const usuario = await this.usuario.findOne({
        _id: new Types.ObjectId(id),
        flag: Flag.nuevo,
      });
      if (!usuario) {
        throw new NotFoundException();
      }

      updateUsuarioDto.asesor = new Types.ObjectId(updateUsuarioDto.asesor);

      await this.usuario.updateOne(
        { _id: new Types.ObjectId(id) },
        updateUsuarioDto,
      );

      return { status: HttpStatus.OK };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async softDelete(id: Types.ObjectId) {
    const usuario = await this.usuario.findOne({
      _id: new Types.ObjectId(id),
      flag: Flag.nuevo,
    });
    if (!usuario) {
      throw new NotFoundException();
    }
    if (usuario.rol != RolE.ADMINISTRADOR) {
      await this.asesorService.marcarConAsesorAsesor(usuario.asesor, false);
    }
    await this.usuario.updateOne(
      { _id: new Types.ObjectId(id) },
      { flag: Flag.eliminado },
    );

    return { status: HttpStatus.OK };
  }

  async asignarSucursalAusuario(
    detalleAsesor: Types.ObjectId,
    usuario: Types.ObjectId,
  ) {
    await this.usuario.updateOne(
      { _id: new Types.ObjectId(usuario) },
      { detalleAsesor: new Types.ObjectId(detalleAsesor) },
    );
    return { status: HttpStatus.OK };
  }

  async verificarRol(request: Request) {
    const usuario = await this.usuario.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(request.usuario.idUsuario),
        },
      },
      {
        $lookup: {
          from: 'DetalleAsesor',
          foreignField: '_id',
          localField: 'detalleAsesor',
          as: 'detalleAsesor',
        },
      },

      {
        $lookup: {
          from: 'Asesor',
          foreignField: '_id',
          localField: 'detalleAsesor.0.asesor',
          as: 'asesor',
        },
      },

      {
        $lookup: {
          from: 'Sucursal',
          foreignField: '_id',
          localField: 'detalleAsesor.0.sucursal',
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
          _id: 1,
          rol: 1,
          sucursal: { $arrayElemAt: ['$sucursal.nombre', 0] },
          empresa: { $arrayElemAt: ['$empresa.nombre', 0] },
          idEmpresa: { $arrayElemAt: ['$empresa._id', 0] },
          idSucursal: { $arrayElemAt: ['$sucursal._id', 0] },
          nombre: { $arrayElemAt: ['$asesor.nombre', 0] },
        },
      },
    ]);
    return usuario[0];
  }
  async perfil(idUsuario: Types.ObjectId) {
    const usuario = await this.usuario.findById(idUsuario);
    return usuario;
  }
  async resetarContrasenaUsuario(
    resetearContrasena: ResetearContrasena,
    id: Types.ObjectId,
  ) {
    const usuario = await this.usuario.findById(id);
    if (!usuario) {
      throw new NotFoundException();
    }
    resetearContrasena.password = await argon2.hash(
      resetearContrasena.password,
      this.opcionesArgon2,
    );
    await this.usuario.findByIdAndUpdate(id, {
      $set: { password: resetearContrasena.password },
    });
    return {
      status: HttpStatus.OK,
      message: 'La contraseña se ha cambiado con éxito.',
    };
  }

  async asesorExcel(archivo: string) {
    const ruta = rutaArchivoUpload(archivo);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(ruta);
    const hoja = workbook.worksheets[0];
    hoja.eachRow(async (fila, _) => {
      const idAsesor = fila.getCell(1).value?.toLocaleString();
      const nombre = fila.getCell(2).value;
      const apellidos = fila.getCell(3).value;
      const username = fila.getCell(4).value;
      const password = fila.getCell(5).value?.toLocaleString();
      const idDetalleAsesor = fila.getCell(6).value?.toLocaleString();
      const rol = fila.getCell(8).value;

      if (rol == 'GESTOR' || (rol == 'ASESOR' && password)) {
        const usuario = await this.usuario.findOne({
          username: username,
          flag: flagEnum.nuevo,
        });

        if (!usuario) {
          const hash = await argon2.hash(String(password), this.opcionesArgon2);
          const asesor = new Types.ObjectId(idAsesor);
          await this.usuario.create({
            nombre: nombre,
            apellidos: apellidos,
            asesor: asesor,
            detalleAsesor: new Types.ObjectId(idDetalleAsesor),
            rol: rol,
            username: username,
            password: hash,
          });

          await this.asesorService.marcarConAsesorAsesor(asesor, true);
        }
      }
    });
  }
}
