import express from 'express';
import fs from 'fs';
import dotenv from 'dotenv';
import { MessageScheduler } from './scheduler/messageScheduler.ts';
import cors from 'cors';
import path from 'path';
import Database from 'better-sqlite3';

dotenv.config();



export async function initializeDatabase(sendTestMessage:Boolean=false): Promise<string> {
    // Resolve the absolute path to the database directory and file
    const dbDir = path.resolve(__dirname, 'config');
    const dbPath = path.join(dbDir, 'messages.db');
  
    // Ensure the directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`Created directory: ${dbDir}`);
    }
  
    const db = new Database(dbPath);
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          content TEXT NOT NULL,
          scheduledTime TEXT NOT NULL,
          status TEXT NOT NULL,
          attempts INTEGER NOT NULL DEFAULT 0,
          tags TEXT
        )
      `);
      console.log(`Database initialized with messages table at ${dbPath}.`);
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }

    if(sendTestMessage){
        const query = `
        INSERT INTO messages (id, type, content, scheduledTime, status, attempts, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
        const id = 'hihihi';
        const scheduledTime = new Date().toISOString(); // Current time as ISO string
        const tags = JSON.stringify([]); // Empty array for tags

        try {
            db.prepare(query).run(id, 'note', 'Hello World', scheduledTime, 'pending', 0, tags);
            console.log(`Hello World message added with ID: ${id}`);
        } catch (error) {
            console.error('Failed to add Hello World message:', error);
        }
    }
  
    // Return the path for consistency
    return dbPath;
  }

export async function createServer() {
    console.log(`createServer initializeDatabase now`);
  const dbPath = await initializeDatabase();
  console.log(`createServer initializeDatabase done:${dbPath}`);
  const app = express();
  const port = process.env.PORT || 3000;
  const NOSTR_PRIVATE_KEY = process.env.NOSTR_PRIVATE_KEY;

  if (!NOSTR_PRIVATE_KEY) {
    throw new Error('NOSTR_PRIVATE_KEY environment variable is required');
  }

  const scheduler = new MessageScheduler(NOSTR_PRIVATE_KEY,dbPath);

  app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  }));
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
