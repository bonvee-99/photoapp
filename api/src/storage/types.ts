export interface PhotoEntry {
  id: string;
  timestamp: Date;
  filePath: string;
}

export interface Storage {
  savePhoto(photoData: Buffer, timestamp: Date): Promise<PhotoEntry>;
  getPhoto(id: string): Promise<PhotoEntry>;
  getPhotoFile(id: string): Promise<Buffer>;
  listPhotos(startDate?: Date, endDate?: Date): Promise<PhotoEntry[]>;
}
