import { Module } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service';
import { AutenticacionController } from './autenticacion.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './Constants/jwtConstants';
import { UsuarioModule } from 'src/usuario/usuario.module';

@Module({
  imports:[
    JwtModule.register(({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '4h' },
    })),
    UsuarioModule
  ],
  controllers: [AutenticacionController],
  providers: [AutenticacionService],
})
export class AutenticacionModule {}
