import { Readable } from 'stream';

export enum ContentType {
  JSON = 'application/json',
  PlainText = 'text/plain',
  PNG = 'image/png',
  JPEG = 'image/jpeg',
}

export abstract class StorageService {
  abstract saveStream(
    key: string,
    stream: Readable,
    opts: {
      contentType: ContentType;
    },
  ): Promise<void>;
  abstract saveBuffer(
    key: string,
    buffer: Buffer,
    opts: {
      contentType: ContentType;
    },
  ): Promise<void>;
  abstract saveText(
    key: string,
    text: string,
    opts: {
      contentType: ContentType;
    },
  ): Promise<void>;
  abstract removeFile(key: string): Promise<void>;
  abstract getHostUrl(): string;
}
