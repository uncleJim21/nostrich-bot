import Database from 'better-sqlite3';
import type { Database as SQLiteDatabase } from 'better-sqlite3';
import { QueuedMessage } from '../types/message.ts';

export class QueueManager {
  private db: SQLiteDatabase;

  constructor(databasePath: string) {
    this.db = new Database(databasePath);
  }

  async load(): Promise<void> {
    console.log('QueueManager: Database is used; no loading needed.');
  }

  async add(message: Omit<QueuedMessage, 'id' | 'status' | 'attempts'>): Promise<void> {
    const id = crypto.randomUUID();
    const query = `
      INSERT INTO messages (id, type, content, scheduledTime, status, tags)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    try {
      this.db.prepare(query).run(
        id,
        message.type,
        message.content,
        message.scheduledTime.toISOString(),
        'pending',
        JSON.stringify(message.tags || [])
      );
      console.log(`Message ${id} added to the database.`);
    } catch (error) {
      console.error('Error adding message to the database:', error);
      throw error;
    }
  }

  async getPendingMessages(): Promise<QueuedMessage[]> {
    try {
      const rows = this.db.prepare(`
        SELECT * FROM messages WHERE status = 'pending'
      `).all();
      return rows.map((row) => ({
        ...row,
        scheduledTime: new Date(row.scheduledTime),
        tags: JSON.parse(row.tags || '[]'),
      }));
    } catch (error) {
      console.error('Error retrieving pending messages:', error);
      throw error;
    }
  }

  async markAsSent(id: string): Promise<void> {
    try {
      this.db.prepare(`
        UPDATE messages SET status = 'sent' WHERE id = ?
      `).run(id);
      console.log(`Message ${id} marked as sent.`);
    } catch (error) {
      console.error(`Error marking message ${id} as sent:`, error);
      throw error;
    }
  }

  async removeMessage(id: string): Promise<void> {
    try {
      this.db.prepare(`
        DELETE FROM messages WHERE id = ?
      `).run(id);
      console.log(`Message ${id} removed from the database.`);
    } catch (error) {
      console.error(`Error removing message ${id}:`, error);
      throw error;
    }
  }
}
