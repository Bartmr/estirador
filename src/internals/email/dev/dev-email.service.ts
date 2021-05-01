import util from 'util';
import fs from 'fs';
import path from 'path';
import { resolveLocalTemporaryFilesPath } from 'src/internals/local-temporary-files/local-temporary-files-path';
import { Email, EmailService } from '../email.service';
import { LoggingService } from 'src/internals/logging/logging.service';
import { generateRandomUUID } from 'src/internals/utils/generate-random-uuid';
import { throwError } from 'src/internals/utils/throw-error';
import { HttpAdapterHost } from '@nestjs/core';
import { AppServerHttpAdapter } from 'src/internals/server/types/app-server-http-adapter-types';
import { Injectable } from '@nestjs/common';

const writeFile = util.promisify(fs.writeFile);
const mkDir = util.promisify(fs.mkdir);

@Injectable()
export class DevEmailService extends EmailService {
  constructor(
    private loggingService: LoggingService,
    private httpAdapterHost: HttpAdapterHost<AppServerHttpAdapter>,
  ) {
    super();
  }

  async sendEmail(email: Email): Promise<void> {
    const emailFileName = `${generateRandomUUID()}.html`;

    const emailsDirectoryPath = resolveLocalTemporaryFilesPath('dev-email');

    await mkDir(emailsDirectoryPath, { recursive: true });

    const emailPath = path.resolve(emailsDirectoryPath, emailFileName);

    await writeFile(emailPath, this.renderEmail(email), { encoding: 'utf8' });

    const address = this.httpAdapterHost.httpAdapter.getHttpServer().address();

    const port =
      address === null || typeof address === 'string'
        ? throwError()
        : address.port;

    this.loggingService.logInfo(
      'dev-email-service:send-mail',
      `Email saved as file in ${emailPath},
being served from http://localhost:${port}/tmp/dev-email/${emailFileName}`,
      {
        ...email,
        // Already rendered and saved in temporary files
        body: undefined,
        emailPath,
      },
    );
  }
}
