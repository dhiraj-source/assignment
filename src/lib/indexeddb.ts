import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ProductDraft } from '@/types';

interface ProductDB extends DBSchema {
  drafts: {
    key: string;
    value: ProductDraft;
  };
}

class IndexedDBService {
  private dbName = 'ProductManagerDB';
  private version = 1;
  private db: IDBPDatabase<ProductDB> | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<ProductDB>(this.dbName, this.version, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('drafts')) {
          db.createObjectStore('drafts', { keyPath: 'id' });
        }
      },
    });
  }

  async saveDraft(draft: ProductDraft): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const draftWithId = {
      ...draft,
      id: draft.id || `draft_${Date.now()}`,
      updatedAt: new Date(),
    };

    await this.db.put('drafts', draftWithId);
  }

  async getDraft(id: string): Promise<ProductDraft | undefined> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.get('drafts', id);
  }

  async getAllDrafts(): Promise<ProductDraft[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.getAll('drafts');
  }

  async deleteDraft(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.delete('drafts', id);
  }

  async clearAllDrafts(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.clear('drafts');
  }
}

export const indexedDBService = new IndexedDBService();