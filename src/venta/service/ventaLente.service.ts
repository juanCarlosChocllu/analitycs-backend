import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { DetalleVenta } from "../schema/detalleVenta";
import { Venta } from "../schema/venta.schema";
import { Model } from "mongoose";

@Injectable()
export class VentaLentService{
     constructor(
        @InjectModel(Venta.name)
        private readonly venta: Model<Venta>,
         @InjectModel(DetalleVenta.name)
        private readonly detalleVenta: Model<DetalleVenta>,
        
          
      ) {}
} 
