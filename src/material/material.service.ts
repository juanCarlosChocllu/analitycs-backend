import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Material } from './schema/material.schema';
import { Model } from 'mongoose';

@Injectable()
export class MaterialService {
  constructor(
    @InjectModel(Material.name)
    private readonly materialSchema: Model<Material>,
  ) {}
  public async guardarMaterial(material: string) {
    const mate = await this.materialSchema.findOne({ nombre: material });
    if (!mate) {
      return this.materialSchema.create({ nombre: material });
    }
    return mate;
  }
}
