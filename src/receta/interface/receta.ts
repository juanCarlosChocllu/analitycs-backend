import { Types } from 'mongoose';

export interface recetaI {
  codigoMia: string;
  sucursal:Types.ObjectId
  detalleMedico: Types.ObjectId;

  material: Types.ObjectId;

  tratamiento: Types.ObjectId;

  tipoLente: Types.ObjectId;

  tipoColor: Types.ObjectId;

  colorLente: Types.ObjectId;

  rango: Types.ObjectId;

  marcaLente: Types.ObjectId;

  codigoReceta: string;

  esfericoLejosD: string;

  esfericoLejosI: string;

  esfericoCercaD: string;

  esfericoCercaI: string;

  cilindricoLejosD: string;

  cilindricoLejosI: string;

  cilindricoCercaD: string;

  cilindricoCercaI: string;

  ejeLejosD: string;

  ejeLejosI: string;

  ejeCercaD: string;

  ejeCercaI: string;

  altura: string;

  distanciaLejosD: string;

  distanciaLejosI: string;

  distanciaCercaD: string;

  distanciaCercaI: string;

  dpLejos: string;

  dpCerca: string;

  addLejos: string;

  addCerca: string;

  fecha: Date;

  observacion: string;

  tipo: string;

  tipoLenteTexto: string;

  tipoCreacion: string;

  recomenacionLentePrincipal: string;

  recomenacionLenteComplementario: string;

  recomendacionProteccionDeSol: string;

  recomendacionLenteDeContacto: string;

  lcEsferaOd: string;

  lcCilindroOd: string;

  lcEjeOd: string;

  lcCurvaBaseOd: string;

  lcDiametroOd: string;

  lcEsferaOi: string;

  lcCilindroOi: string;

  lcEjeOi: string;

  lcCurvaBaseOi: string;

  lcDiametroOi: string;
}
