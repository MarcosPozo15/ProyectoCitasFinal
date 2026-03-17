import { Injectable } from '@nestjs/common';
import {
  BookingChatProviderInput,
  BookingChatProviderOutput,
} from '../types/booking-ai.types';

@Injectable()
export class BookingAiMockProvider {
  async generate(
    input: BookingChatProviderInput,
  ): Promise<BookingChatProviderOutput> {
    const { businessName, suggestedText, quickReplies } = input;

    const optionsText =
      quickReplies.length > 0
        ? `\n\nOpciones rápidas:\n${quickReplies
            .map((item) => `- ${item.label}`)
            .join('\n')}`
        : '';

    return {
      text: `Asistente de reservas de ${businessName}:\n\n${suggestedText}${optionsText}`,
    };
  }
}