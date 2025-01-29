export interface QueuedMessage {
  id: string;  // Unique identifier
  type: 'dm' | 'note';
  content: string;
  recipientPubkey?: string;
  scheduledTime: Date;
  tags?: string[][];
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
}