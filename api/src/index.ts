import { Server } from './server';
import { FileSystemStorage } from './storage/FileSystemStorage';
import path from 'path';

async function main() {
  try {
    // Initialize storage with directory path
    const storage = new FileSystemStorage(
      path.join(__dirname, '..', 'data')
    );

    // Create and start server
    const server = new Server(storage);
    server.start(5000);
    
    console.log('Server started successfully');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
