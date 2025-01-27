import { getPublicKey, getEventHash, getSignature, nip19} from 'nostr-tools';
import { relayPool } from '../config/relayPool';
import { NostrMessage } from '../config/messageQueue';
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
  private privateKey: string;

  constructor(nsec: string) {
    // Decode nsec to hex private key
    try {
      const { data: privateKey } = nip19.decode(nsec);
      this.privateKey = privateKey as string;
    } catch (e) {
      throw new Error('Invalid nsec format');
    }
  }

  private async publishToRelay(event: any): Promise<void> {
    let successCount = 0;
    const promises = relayPool.map(relay => {
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
    const pubkey = getPublicKey(this.privateKey);
    
    const event: NostrEvent = {
      kind: 1,
      pubkey,
      created_at: Math.floor(Date.now() / 1000),
      tags,
      content
    };

    event.id = getEventHash(event);
    event.sig = await getSignature(event, this.privateKey);

    await this.publishToRelay(event);
  }

  async sendDM(content: string, recipientPubkey: string): Promise<void> {
    const pubkey = getPublicKey(this.privateKey);
      
    const event: NostrEvent = {
      kind: 4,
      pubkey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [['p', recipientPubkey]],
      content: await this.encryptDM(content, recipientPubkey)
    };
   
    event.id = getEventHash(event);
    event.sig = await getSignature(event, this.privateKey);
   
    await this.publishToRelay(event);
   }

  private async encryptDM(content: string, recipientPubkey: string): Promise<string> {
    // Implement DM encryption logic here
    // For now, returning unencrypted content for demo
    return content;
  }
}