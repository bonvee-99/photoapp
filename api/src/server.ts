import express from 'express';
import multer from 'multer';
import { Storage } from './storage/types';
import { randomInt } from 'crypto';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export class Server {
  private app: express.Application;
  private storage: Storage;

  constructor(storage: Storage) {
    this.app = express();
    this.storage = storage;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(express.json());
  }

  private setupRoutes() {
    this.app.get('/status', (req, res) => {
      res.sendStatus(200);
    })

    // Upload photo
    this.app.post('/photos', upload.single('photo'), async (req, res) => {
      try {
        if (!req.file) {
          res.status(400).json({ error: 'No photo provided' });
          return;
        }

        const entry = await this.storage.savePhoto(
          req.file.buffer,
          new Date()
        );

        res.json(entry);
      } catch (error) {
        console.error('Error saving photo:', error);
        res.status(500).json({ error: 'Failed to save photo' });
      }
    });

    // Get photo
    this.app.get('/photos/:id', async (req, res) => {
      try {
        const photoData = await this.storage.getPhotoFile(req.params.id);
        res.contentType('image/jpeg').send(photoData);
      } catch (error) {
        console.error('Error retrieving photo:', error);
        res.status(404).json({ error: 'Photo not found' });
      }
    });

    // Get random trigger time
    // this.app.post('/trigger', (req, res) => {
    //   const now = new Date();
    //   const tomorrow = new Date(now);
    //   tomorrow.setDate(tomorrow.getDate() + 1);
    //   tomorrow.setHours(0, 0, 0, 0);
    //
    //   let triggerTime: Date;
    //   
    //   if (now.getHours() >= 23) {
    //     // If it's late, schedule for tomorrow
    //     triggerTime = new Date(tomorrow);
    //     triggerTime.setHours(randomInt(24), randomInt(60));
    //   } else {
    //     // Random time between now and end of day
    //     const endOfDay = new Date(now);
    //     endOfDay.setHours(23, 59, 59, 999);
    //     
    //     const timeRange = endOfDay.getTime() - now.getTime();
    //     const randomTime = now.getTime() + randomInt(timeRange);
    //     triggerTime = new Date(randomTime);
    //   }
    //
    //   res.json({ trigger_time: triggerTime });
    // });
  }

  public start(port: number): void {
    this.app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }
}
