import { Module } from '@nestjs/common';
import { AppointmentsModule } from '../appointments/appointments.module';
import { BusinessesModule } from '../businesses/businesses.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { WaitlistModule } from '../waitlist/waitlist.module';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { ServicePackagesModule } from '../service-packages/service-packages.module';

@Module({
  imports: [
    AppointmentsModule,
    BusinessesModule,
    WaitlistModule,
    PromotionsModule,
    ServicePackagesModule,
  ],
  controllers: [PublicController],
  providers: [PublicService],
  exports: [PublicService],
})
export class PublicModule {}