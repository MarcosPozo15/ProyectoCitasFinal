import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppointmentsModule } from './appointments/appointments.module';
import { AuthModule } from './auth/auth.module';
import { AvailabilityModule } from './availability/availability.module';
import { BookingAiModule } from './booking-ai/booking-ai.module';
import { BusinessesModule } from './businesses/businesses.module';
import { CommonModule } from './common/common.module';
import { EmployeeServicesModule } from './employee-services/employee-services.module';
import { EmployeesModule } from './employees/employees.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PromotionsModule } from './promotions/promotions.module';
import { PublicModule } from './public/public.module';
import { ServicesModule } from './services/services.module';
import { UsersModule } from './users/users.module';
import { WaitlistModule } from './waitlist/waitlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CommonModule,
    UsersModule,
    AuthModule,
    BusinessesModule,
    EmployeesModule,
    ServicesModule,
    EmployeeServicesModule,
    AvailabilityModule,
    AppointmentsModule,
    PublicModule,
    BookingAiModule,
    WaitlistModule,
    PromotionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}