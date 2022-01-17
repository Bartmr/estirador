import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { promisify } from 'util';
import { EnvironmentVariablesService } from '../environment/environment-variables.service';
import { LOCAL_TEMPORARY_FILES_PATH } from '../local-temporary-files/local-temporary-files-path';
import { StorageService } from './storage.service';

const writeFile = promisify(fs.writeFile);
const removeFile = promisify(fs.rm);

const mkdir = promisify(fs.mkdir);

export class DevStorageService implements StorageService {
  async createDirectory(key: string) {
    const directoryFragments = key.split('/');
    directoryFragments.pop();

    await mkdir(
      path.join(LOCAL_TEMPORARY_FILES_PATH, 'storage', ...directoryFragments),
      {
        recursive: true,
      },
    );
  }
  async saveStream(key: string, stream: Readable) {
    await this.createDirectory(key);

    const fsStream = fs.createWriteStream(
      path.resolve(LOCAL_TEMPORARY_FILES_PATH, 'storage', key),
    );

    await new Promise((resolve, reject) => {
      stream.pipe(fsStream);
      fsStream.on('error', reject);
      fsStream.on('finish', resolve);
    });
  }

  async saveBuffer(key: string, buffer: Buffer) {
    await this.createDirectory(key);

    await writeFile(
      path.resolve(LOCAL_TEMPORARY_FILES_PATH, 'storage', key),
      buffer,
    );
  }

  async saveText(key: string, text: string) {
    await this.createDirectory(key);

    const filePath = path.resolve(LOCAL_TEMPORARY_FILES_PATH, 'storage', key);

    await writeFile(filePath, text);
  }

  async removeFile(key: string): Promise<void> {
    const filePath = path.resolve(LOCAL_TEMPORARY_FILES_PATH, 'storage', key);

    await removeFile(filePath);
  }

  getHostUrl() {
    return `http://localhost:${EnvironmentVariablesService.variables.API_PORT}/tmp/storage`;
  }
}
