import express from 'express';
import dotenv from 'dotenv';
import { MessageScheduler } from './scheduler/messageScheduler';
import cors from 'cors';
import path from 'path';

dotenv.config();

export function createServer() {
  const app = express();
  const port = process.env.PORT || 3000;
  const NOSTR_PRIVATE_KEY = process.env.NOSTR_PRIVATE_KEY;

  if (!NOSTR_PRIVATE_KEY) {
    throw new Error('NOSTR_PRIVATE_KEY environment variable is required');
  }

  const queuePath = path.join(__dirname, 'config', 'messageQueue.json');
  const scheduler = new MessageScheduler(NOSTR_PRIVATE_KEY, queuePath);

  app.use(cors());
  app.use(express.json());

  // Run scheduler every 5 minutes
  setInterval(() => {
    scheduler.processQueue().catch(console.error);
  }, 1 * 15 * 1000);

  app.get('/health', (req, res) => {
    res.send('OK');
  });

  app.post('/schedule', async (req, res) => {
    const { content, scheduledTime, type, tags } = req.body;
    try {
      await scheduler.queueManager.add({
        content,
        scheduledTime: new Date(scheduledTime),
        type,
        tags,
      });
      res.status(200).json({ message: 'Post scheduled' });
    } catch (error) {
      console.error('Failed to schedule post:', error);
      res.status(500).json({ error: 'Failed to schedule post' });
    }
  });

  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    scheduler.processQueue().catch(console.error);
  });

  return server;
}
