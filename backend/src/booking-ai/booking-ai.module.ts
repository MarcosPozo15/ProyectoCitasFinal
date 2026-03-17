import { Module } from '@nestjs/common';
import { PublicModule } from '../public/public.module';
import { BookingAiController } from './booking-ai.controller';
import { BookingAiService } from './booking-ai.service';
import { BookingAiMockProvider } from './providers/booking-ai.mock.provider';
import { BookingAiOpenAiProvider } from './providers/booking-ai.openai.provider';

@Module({
  imports: [PublicModule],
  controllers: [BookingAiController],
  providers: [
    BookingAiService,
    BookingAiMockProvider,
    BookingAiOpenAiProvider,
  ],
})
export class BookingAiModule {}