export enum Sender {
  USER = 'USER',
  BOT = 'BOT'
}

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  status?: MessageStatus;
}

export interface TrainingExample {
  id: string;
  userQuery: string;
  agentResponse: string;
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  content: string; // Text content or Base64 string
  type: 'text' | 'file';
  mimeType?: string; // e.g., 'application/pdf', 'image/png'
  uploadDate: Date;
}

// Meta removed, only Evolution remains or potentially others in future
export type IntegrationType = 'evolution';

export interface AgentConfig {
  id: string; // Unique ID for the agent
  lastModified: Date;
  name: string;
  companyName: string;
  role: string;
  tone: string;
  systemInstructions: string;
  maxResponseLength: number; // Max characters per message
  responseDelayMin: number; // Seconds
  responseDelayMax: number; // Seconds
  documents: KnowledgeDocument[];
  examples: TrainingExample[];
  websites: string[]; // List of URLs for grounding
  
  // Integration Settings
  integrationType: IntegrationType;
  evolutionUrl?: string;
  evolutionApiKey?: string;
  evolutionInstanceName?: string;
}