import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, usuariosSchema } from './schema/usuario.schema';
import { AsesorModule } from 'src/asesor/asesor.module';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: Usuario.name,
          schema:usuariosSchema ,
        },
      ]
    ),
    AsesorModule
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports:[UsuarioService]
})
export class UsuarioModule {}
