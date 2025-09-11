import { Prop } from "@nestjs/mongoose";
import { flagEnum } from "../enum/coreEnum";

export class BaseSchema {

    @Prop({type:String, enum:flagEnum, default:flagEnum.nuevo})
    flag:flagEnum

    @Prop({type:Date,  default:()=> Date.now()})
    fechaCreacion:Date
} 