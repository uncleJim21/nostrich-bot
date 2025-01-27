import { NostrService } from '../services/nostrService.ts';
import { QueueManager } from '../config/queueManager.ts';


export class MessageScheduler {
  private nostrService: NostrService;
  public queueManager: QueueManager;

  constructor(privateKey: string) {
    this.nostrService = new NostrService(privateKey);
    this.queueManager = new QueueManager(); // Pass full path from index.ts directly
}

  async processQueue(): Promise<void> {
    console.log("processQueue running");
    await this.queueManager.load(); // Ensure queue is loaded
    const messages = await this.queueManager.getPendingMessages();
    console.log("Pending messages:", messages);
    const now = new Date();
    console.log(`processQueue running`)
    for (const message of messages) {
      console.log(`message scheduled time:${message.scheduledTime}`)
      if (new Date(message.scheduledTime) <= now) {
        try {
          if (message.type === 'note') {
            await this.nostrService.sendNote(message.content, message.tags);
          } else if (message.type === 'dm' && message.recipientPubkey) {
            await this.nostrService.sendDM(message.content, message.recipientPubkey);
          }
          await this.queueManager.removeMessage(message.id);
          console.log(`Successfully processed ${message.type}:`, message.content);
        } catch (error) {
          console.error(`Failed to process message:`, error);
        }
      }
    }
    console.log(`processQueue ended.`)
  }
}