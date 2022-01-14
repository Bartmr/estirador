import { Readable } from 'stream';

export abstract class StorageService {
  abstract saveStream(key: string, stream: Readable): Promise<void>;
  abstract saveBuffer(key: string, buffer: Buffer): Promise<void>;
  abstract saveText(key: string, text: string): Promise<void>;
  abstract removeFile(key: string): Promise<void>;
  abstract getHostUrl(): string;
}
