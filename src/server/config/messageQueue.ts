export interface NostrMessage {
  type: 'dm' | 'note';
  content: string;
  recipientPubkey?: string; // Required for DMs
  scheduledTime: Date;
  tags?: string[][]; // For mentions or other tags
}

export const messageQueue: NostrMessage[] = [
  {
    type: 'note',
    content: 'test',
    scheduledTime: new Date(Date.now() + 12000), // 5 minutes from now
    tags: []
  },
//   {
//     type: 'dm',
//     content: 'Test scheduled DM',
//     recipientPubkey: '32250A052B014F...',
//     scheduledTime: new Date(Date.now() + 600000), // 10 minutes from now
//   }
];