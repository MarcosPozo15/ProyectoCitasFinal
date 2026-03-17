import { Injectable } from '@nestjs/common';
import { APP_DEFAULTS } from './common/constants/app.constants.js';

@Injectable()
export class AppService {
  getHealth() {
    return {
      ok: true,
      service: process.env.APP_NAME || APP_DEFAULTS.NAME,
      version: process.env.APP_VERSION || APP_DEFAULTS.VERSION,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}