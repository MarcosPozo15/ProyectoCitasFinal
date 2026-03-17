import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BookingChatAiExtraction,
  BookingChatProviderInput,
  BookingChatProviderOutput,
} from '../types/booking-ai.types';

@Injectable()
export class BookingAiOpenAiProvider {
  private readonly logger = new Logger(BookingAiOpenAiProvider.name);

  constructor(private readonly configService: ConfigService) {}

  private getConfig() {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const model =
      this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4.1-mini';
    const apiUrl =
      this.configService.get<string>('OPENAI_API_URL') ??
      'https://api.openai.com/v1/chat/completions';

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY no configurada');
    }

    return { apiKey, model, apiUrl };
  }

  async generate(
    input: BookingChatProviderInput,
  ): Promise<BookingChatProviderOutput> {
    const { apiKey, model, apiUrl } = this.getConfig();

    const systemPrompt = [
      'Eres un asistente de reservas.',
      'Responde siempre en español.',
      'Sé breve, claro y útil.',
      'No inventes horarios, servicios ni empleados.',
      'Usa únicamente la información decidida por el backend.',
    ].join(' ');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(input, null, 2) },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`OpenAI error: ${errorText}`);
      throw new Error('No se pudo obtener respuesta del provider OpenAI');
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };

    const text = data.choices?.[0]?.message?.content?.trim();

    if (!text) {
      throw new Error('Respuesta vacía del provider OpenAI');
    }

    return { text };
  }

  async extractBookingData(input: {
    businessName: string;
    userMessage: string;
    currentState: Record<string, unknown>;
    services: string[];
    employees: string[];
  }): Promise<BookingChatAiExtraction> {
    const { apiKey, model, apiUrl } = this.getConfig();

    const systemPrompt = [
      'Extrae datos estructurados para una reserva.',
      'Devuelve SOLO JSON válido.',
      'No expliques nada.',
      'No uses markdown.',
      'Si falta un dato, omítelo.',
      'Campos permitidos:',
      'intent, serviceName, employeeName, date, time, customerFirstName, customerLastName, customerEmail, customerPhone, customerNotes, confirm.',
      'La fecha debe ir como YYYY-MM-DD.',
      'La hora debe ir como HH:mm.',
      'confirm debe ser true solo si el usuario expresa confirmación clara.',
    ].join(' ');

    const userPrompt = JSON.stringify(input, null, 2);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`OpenAI extraction error: ${errorText}`);
      throw new Error('No se pudo extraer información con OpenAI');
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };

    const raw = data.choices?.[0]?.message?.content?.trim();

    if (!raw) {
      throw new Error('OpenAI no devolvió extracción');
    }

    try {
      return JSON.parse(raw) as BookingChatAiExtraction;
    } catch (error) {
      this.logger.error(`JSON extraction parse error: ${raw}`);
      throw new Error('La extracción de OpenAI no devolvió JSON válido');
    }
  }
}