export type BookingChatQuickReply = {
  label: string;
  value: string;
};

export type BookingChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type BookingChatState = {
  serviceId?: string;
  serviceName?: string;
  employeeId?: string;
  employeeName?: string;
  date?: string;
  startsAt?: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerNotes?: string;
};

export type BookingChatStage =
  | 'choose_service'
  | 'choose_employee'
  | 'choose_date'
  | 'choose_slot'
  | 'collect_customer'
  | 'confirm'
  | 'done';

export type BookingChatProviderInput = {
  businessName: string;
  stage: BookingChatStage;
  state: BookingChatState;
  userMessage: string;
  suggestedText: string;
  quickReplies: BookingChatQuickReply[];
};

export type BookingChatProviderOutput = {
  text: string;
};

export type BookingChatResponse = {
  ok: boolean;
  stage: BookingChatStage;
  provider: 'mock' | 'openai';
  text: string;
  quickReplies: BookingChatQuickReply[];
  state: BookingChatState;
  availableSlots?: Array<{
    startsAt: string;
    endsAt: string;
    startTime: string;
    endTime: string;
  }>;
  appointmentCreated?: boolean;
};

export type BookingChatAiExtraction = {
  intent?: 'book_appointment' | 'provide_info' | 'confirm' | 'unknown';
  serviceName?: string;
  employeeName?: string;
  date?: string;
  time?: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerNotes?: string;
  confirm?: boolean;
};