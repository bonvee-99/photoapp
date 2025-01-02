import { Storage, PhotoEntry } from './types';
import fs from 'fs/promises';
import path from 'path';

export class FileSystemStorage implements Storage {
  private baseDir: string;
  private photosDir: string;
  private metadataPath: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
    this.photosDir = path.join(baseDir, 'photos');
    this.metadataPath = path.join(baseDir, 'metadata.json');
    this.ensureDirectories().catch(console.error);
  }

  private async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
      await fs.mkdir(this.photosDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create storage directories:', error);
      throw error;
    }
  }

  async savePhoto(photoData: Buffer, timestamp: Date): Promise<PhotoEntry> {
    await this.ensureDirectories(); // Ensure directories exist before saving
    
    const id = timestamp.toISOString().replace(/[:.]/g, '-');
    const fileName = `${id}.jpg`;
    const filePath = path.join(this.photosDir, fileName);

    // Save photo file
    await fs.writeFile(filePath, photoData);

    // Create entry
    const entry: PhotoEntry = {
      id,
      timestamp,
      filePath,
    };

    // Save metadata
    await this.saveMetadata(entry);

    return entry;
  }

  async getPhoto(id: string): Promise<PhotoEntry> {
    const entries = await this.readMetadata();
    const entry = entries.find(e => e.id === id);
    
    if (!entry) {
      throw new Error('Photo not found');
    }

    return entry;
  }

  async getPhotoFile(id: string): Promise<Buffer> {
    const entry = await this.getPhoto(id);
    return fs.readFile(entry.filePath);
  }

  async listPhotos(startDate?: Date, endDate?: Date): Promise<PhotoEntry[]> {
    const entries = await this.readMetadata();
    
    return entries.filter(entry => {
      if (startDate && entry.timestamp < startDate) return false;
      if (endDate && entry.timestamp > endDate) return false;
      return true;
    });
  }

  private async saveMetadata(newEntry: PhotoEntry): Promise<void> {
    const entries = await this.readMetadata();
    entries.push(newEntry);
    
    await fs.writeFile(
      this.metadataPath, 
      JSON.stringify(entries, null, 2)
    );
  }

  private async readMetadata(): Promise<PhotoEntry[]> {
    try {
      const data = await fs.readFile(this.metadataPath, 'utf-8');
      const entries = JSON.parse(data);
      // Convert string dates back to Date objects
      return entries.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }
}
