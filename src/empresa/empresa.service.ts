import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Empresa} from './schemas/empresa.schema';
import { Model } from 'mongoose';

@Injectable()
export class EmpresaService {
  constructor(
    @InjectModel(Empresa.name)
    private readonly EmpresaSchema: Model<Empresa>,
  ) {}


  async empresas() {
    const empresas = await this.EmpresaSchema.find();
    return empresas;
  }

  async buscarEmpresa(id:string){
    const empresa=  await this.EmpresaSchema.findById(id)
    return empresa
  }


}
