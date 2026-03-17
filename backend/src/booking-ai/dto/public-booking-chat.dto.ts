import { BookingChatMessage, BookingChatState } from '../types/booking-ai.types';

export class PublicBookingChatDto {
  message!: string;
  messages?: BookingChatMessage[];
  state?: BookingChatState;
}