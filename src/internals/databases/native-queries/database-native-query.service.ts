import { InferType, Schema } from 'not-me/lib/schemas/schema';
import { Client } from 'pg';
import { LoggingService } from 'src/internals/logging/logging.service';
import { QueryRunner } from 'typeorm-bartmr';
import { EnvironmentVariablesService } from '../../environment/environment-variables.service';

type SupportedSchema = Schema<Array<{ [key: string]: string | number | null }>>;
type SupportedParameter = string | number | boolean;

export class DatabaseNativeQueryService {
  constructor(private client: Client, private loggingService: LoggingService) {}

  async query<S extends SupportedSchema>(
    schema: S,
    sql: string,
    parameters: SupportedParameter[],
    options?: { queryRunner?: QueryRunner },
  ): Promise<InferType<S>> {
    if (EnvironmentVariablesService.variables.LOG_DATABASES) {
      this.loggingService.logDebug('database-queries:query', {
        sql,
        parameters,
      });
    }

    const results = options?.queryRunner
      ? ((await options.queryRunner.query(sql, parameters)) as {
          [key: string]: unknown;
        })
      : (await this.client.query(sql, parameters)).rows;

    if (EnvironmentVariablesService.variables.LOG_DATABASES) {
      this.loggingService.logDebug('database-queries:query:result', {
        results,
      });
    }

    return this.parseRows(schema, results);
  }

  parseRows<S extends SupportedSchema>(schema: S, rows: unknown): InferType<S> {
    const result = schema.validate(rows);

    if (result.errors) {
      const error = new Error();

      this.loggingService.logError(
        'database-native-query:schema-mismatch',
        error,
        result,
      );

      throw new Error();
    } else {
      return result.value;
    }
  }
}
