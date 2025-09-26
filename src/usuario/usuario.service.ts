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

import { AsesorService } from 'src/asesor/asesor.service';
import { Request } from 'express';
import { Flag } from 'src/sucursal/enums/flag.enum';
import { RolE } from './enum/rol';
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
    @InjectModel(Usuario.name) private readonly usuario: Model<Usuario>
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
    if(createUsuarioDto.rol != RolE.ADMINISTRADOR){
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
    console.log(detalleAsesor, usuario);

    await this.usuario.updateOne(
      { _id: new Types.ObjectId(usuario) },
      { detalleAsesor: new Types.ObjectId(detalleAsesor) },
    );
    return { status: HttpStatus.OK };
  }

  async verificarRol(request: Request) {
    const usuario = await this.usuario
      .findOne({ _id: new Types.ObjectId(request.usuario.idUsuario) })
      .select('rol');

    return usuario;
  }
}
