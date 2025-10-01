import { SetMetadata } from "@nestjs/common";
import { ROLES_KEY } from "./keys";
import { RolesE } from "../enum/coreEnum";

export const ROLE = (roles:RolesE[]) => SetMetadata(ROLES_KEY, roles)