import crypto from 'crypto';
import { QueuedMessage } from '../types/message.ts';

export class QueueManager {
  private queue: QueuedMessage[];

  constructor() {
    // Initialize the in-memory queue with some default values if needed
    this.queue = [
      {
        id: "1234-5678-90ab-cdef",
        type: "note",
        content: "CHADBot is baaaaaaack.",
        scheduledTime: new Date("2025-01-25T19:30:00.000Z"), // Use a Date object
        status: "pending",
        attempts: 0,
        tags: []
      }
    ];
  }

  // Load is a no-op since data is stored in memory
  async load(): Promise<void> {
    console.log("QueueManager: Loaded in-memory queue");
  }

  // Save is a no-op since data is stored in memory
  private async save(): Promise<void> {
    console.log("QueueManager: Saving queue is not required for in-memory storage");
  }

  async add(message: Omit<QueuedMessage, 'id' | 'status' | 'attempts'>): Promise<void> {
    const newMessage: QueuedMessage = {
      ...message,
      id: crypto.randomUUID(),
      status: 'pending',
      attempts: 0
    };
    this.queue.push(newMessage);
    console.log(`QueueManager: Added message ${JSON.stringify(newMessage, null, 2)}`);
  }

  async getPendingMessages(): Promise<QueuedMessage[]> {
    const pendingMessages = this.queue.filter(m => m.status === 'pending');
    console.log(`QueueManager: Retrieved pending messages ${JSON.stringify(pendingMessages, null, 2)}`);
    return pendingMessages;
  }

  async markAsSent(id: string): Promise<void> {
    const message = this.queue.find(m => m.id === id);
    if (message) {
      message.status = 'sent';
      console.log(`QueueManager: Marked message as sent ${id}`);
    } else {
      console.warn(`QueueManager: No message found with id ${id}`);
    }
  }

  async removeMessage(id: string): Promise<void> {
    this.queue = this.queue.filter(m => m.id !== id);
    console.log(`QueueManager: Removed message with id ${id}`);
  }
}
