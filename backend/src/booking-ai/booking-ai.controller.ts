import { Body, Controller, Param, Post } from '@nestjs/common';
import { BookingAiService } from './booking-ai.service';
import { PublicBookingChatDto } from './dto/public-booking-chat.dto';

@Controller('public/businesses/:businessId/booking-chat')
export class BookingAiController {
  constructor(private readonly bookingAiService: BookingAiService) {}

  @Post()
  async chat(
    @Param('businessId') businessId: string,
    @Body() dto: PublicBookingChatDto,
  ) {
    return this.bookingAiService.chat(businessId, dto);
  }
}