export interface SummaryResult {
  summary: {
    short: string;
    detailed: string;
  };
  keywords: string[];
  actionItems: ActionItem[];
  keySentences: string[];
  sentiment?: string;
  speakers?: Speaker[];
  language?: string;
  translatedSummary?: {
    short: string;
    detailed: string;
  };
}

export interface ActionItem {
  task: string;
  responsible?: string;
  deadline?: string;
}

export interface Speaker {
  name: string;
  content: string;
}

export interface ProcessRequest {
  text?: string;
  file?: File;
}

export interface Meeting {
  id: string;
  title: string;
  content: string;
  summary: SummaryResult;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  fileName?: string;
  fileType?: string;
}

export interface ChatMessage {
  id: string;
  meetingId: string;
  userId: string;
  message: string;
  response: string;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
}