import fs from 'fs/promises';
import { QueuedMessage } from '../types/message';
import crypto from 'crypto';

export class QueueManager {
  private queuePath: string;
  private queue: QueuedMessage[];

  constructor(queuePath: string = './messageQueue.json') {
    this.queuePath = queuePath;
    this.queue = [];
  }

  async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.queuePath, 'utf8');
      const parsed = JSON.parse(data);
      this.queue = parsed.queue || [];
    } catch (error) {
      console.error('Error loading queue:', error);
      this.queue = [];
      await this.save();
    }
  }

  private async save(): Promise<void> {
    await fs.writeFile(this.queuePath, JSON.stringify({ queue: this.queue }, null, 2));
  }

  async add(message: Omit<QueuedMessage, 'id' | 'status' | 'attempts'>): Promise<void> {
    const newMessage: QueuedMessage = {
      ...message,
      id: crypto.randomUUID(),
      status: 'pending',
      attempts: 0
    };
    this.queue.push(newMessage);
    await this.save();
  }

  async getPendingMessages(): Promise<QueuedMessage[]> {
    console.log(`getPendingMessages out of all messages:${JSON.stringify(this.queue,null,2)}`)
    return this.queue.filter(m => m.status === 'pending');
  }

  async markAsSent(id: string): Promise<void> {
    const message = this.queue.find(m => m.id === id);
    if (message) {
      message.status = 'sent';
      await this.save();
    }
  }

  async removeMessage(id: string): Promise<void> {
    this.queue = this.queue.filter(m => m.id !== id);
    await this.save();
  }
}