import { Global, Module } from '@nestjs/common';
import { BusinessAccessService } from './services/business-access.service';

@Global()
@Module({
  providers: [BusinessAccessService],
  exports: [BusinessAccessService],
})
export class CommonModule {}