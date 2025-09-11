import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE')||"";
  }

  get port(): string {
    return this.configService.get<string>('PORT') || "3000";
  }

  get key(): string {
    return this.configService.get<string>('KEY') || "";
  }

  get apiMia(): string {
    return this.configService.get<string>('API_MIA') || "";
  }

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET') || "";
  }
    get tokenMia(): string {
    return this.configService.get<string>('TOKEN_MIA') || "";
  }
  
}