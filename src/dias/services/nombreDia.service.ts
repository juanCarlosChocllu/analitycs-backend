import { forwardRef, HttpStatus, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";


import { NombreDia } from "../schema/nombreDia.schema";


import { Type } from "class-transformer";
import { DiasService } from "./dias.service";
import { Flag } from "src/sucursal/enums/flag.enum";

@Injectable()
export class NombreDiaService{
    constructor(
    @InjectModel(NombreDia.name) private  readonly nombreDia:Model<NombreDia>,
    @Inject(forwardRef(() => DiasService)) private readonly diaService: DiasService,
    
    ){}
    async   crearNombreDia(nombre:string, tipo:string){
        const nombreDia = await this.nombreDia.create({nombre:nombre, tipo:tipo})
        return nombreDia
    }

    async   listarNombreDia(){
        const nombreDia = await this.nombreDia.find({flag:Flag.nuevo})
        return nombreDia
    }

    async delete (id:Types.ObjectId){
        const nombreDia = await this.nombreDia.findOne({_id:new Types.ObjectId(id), flag:Flag.nuevo})

        if(!nombreDia){
            throw new NotFoundException()
        }
        await this.nombreDia.updateOne({_id:new Types.ObjectId(id)}, {flag:Flag.eliminado})
        await this.diaService.borrarTodoDia(nombreDia._id)
        return {status:HttpStatus.OK}

    }


}