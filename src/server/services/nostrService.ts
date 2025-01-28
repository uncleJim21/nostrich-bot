import { getPublicKey, finalizeEvent, nip19 } from 'nostr-tools';
import { relayPool } from '../config/relayPool.ts';
import store from '../config/store.ts';
import WebSocket from 'ws';

interface NostrEvent {
  kind: number;
  pubkey: string;
  created_at: number;
  tags: string[][];
  content: string;
  id?: string;
  sig?: string;
}

export class NostrService {
  private privateKey: Uint8Array | null = null;

  constructor() {
    this.initializePrivateKey();
  }

  public validateNsec(nsec:string):Boolean{
    try {
      const { type, data } = nip19.decode(nsec);
      if (type === 'nsec' && data instanceof Uint8Array) {
        return true;
      } else {
        throw new Error('Invalid nsec format');
      }
    } catch (e) {
      this.privateKey = null;
      console.error('Failed to initialize private key:', e);
    }

    return false;
  }

  private initializePrivateKey(): void {
    const nsec = store.get('nsec');
    if (!nsec) {
      this.privateKey = null;
      return;
    }

    try {
      const { type, data } = nip19.decode(nsec);
      if (type === 'nsec' && data instanceof Uint8Array) {
        this.privateKey = data;
      } else {
        throw new Error('Invalid nsec format');
      }
    } catch (e) {
      this.privateKey = null;
      console.error('Failed to initialize private key:', e);
    }
  }

  private ensurePrivateKey(): void {
    if (!this.privateKey) {
      // Re-try initialization in case nsec was added after construction
      this.initializePrivateKey();
      if (!this.privateKey) {
        throw new Error('NostrService: No valid nsec configured. Please set up your nsec in settings.');
      }
    }
  }

  private async publishToRelay(event: NostrEvent): Promise<void> {
    this.ensurePrivateKey();
    let successCount = 0;
    const promises = relayPool.map((relay) => {
      return new Promise<void>((resolve, reject) => {
        try {
          const ws = new WebSocket(relay);
          let handled = false;

          ws.on('open', () => {
            console.log(`Connected to ${relay}`);
            ws.send(JSON.stringify(['EVENT', event]));
          });

          ws.on('message', (message) => {
            const response = JSON.parse(message.toString());
            if (!handled && response[0] === 'OK' && response[1] === event.id) {
              handled = true;
              console.log(`✓ Published to ${relay}`);
              successCount++;
              ws.close();
              resolve();
            }
          });

          ws.on('error', (error) => {
            if (!handled) {
              handled = true;
              console.error(`✗ Error with ${relay}:`, error);
              ws.close();
              reject(error);
            }
          });

          setTimeout(() => {
            if (!handled) {
              handled = true;
              console.log(`⚠ Timeout for ${relay}`);
              ws.close();
              resolve();
            }
          }, 5000);
        } catch (error) {
          reject(error);
        }
      });
    });

    await Promise.allSettled(promises);
    console.log(`Published to ${successCount}/${relayPool.length} relays`);
  }

  async sendNote(content: string, tags: string[][] = []): Promise<void> {
    this.ensurePrivateKey();
    const eventTemplate = {
      kind: 1,
      pubkey: getPublicKey(this.privateKey!), // Safe to use ! here because of ensurePrivateKey
      created_at: Math.floor(Date.now() / 1000),
      tags,
      content,
    };

    const event = finalizeEvent(eventTemplate, this.privateKey!);
    await this.publishToRelay(event);
  }

  async sendDM(content: string, recipientPubkey: string): Promise<void> {
    this.ensurePrivateKey();
    const eventTemplate = {
      kind: 4,
      pubkey: getPublicKey(this.privateKey!),
      created_at: Math.floor(Date.now() / 1000),
      tags: [['p', recipientPubkey]],
      content: await this.encryptDM(content, recipientPubkey),
    };

    const event = finalizeEvent(eventTemplate, this.privateKey!);
    await this.publishToRelay(event);
  }

  private async encryptDM(content: string, recipientPubkey: string): Promise<string> {
    this.ensurePrivateKey();
    // Implement DM encryption logic here
    return content;
  }

  // Optional: Add method to check if service is ready
  isReady(): boolean {
    return this.privateKey !== null;
  }

  // Optional: Add method to reinitialize if nsec changes
  reinitialize(): void {
    this.initializePrivateKey();
  }
}