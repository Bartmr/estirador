import { InferType, Schema } from 'not-me/lib/schemas/schema';
import {
  JSONData,
  JSONPrimitive,
  SerializableJSONData,
} from '@app/shared/internals/transports/json-types';
import axios from 'axios';
import querystring from 'querystring';
import { LoggingService } from '../logging/logging.service';
import { Injectable } from '@nestjs/common';

export type JSONResponseSchema = Schema<{
  status: number;
  body?: JSONData | undefined;
}>;

export type JsonHEADResponseSchema = Schema<{
  status: number;
}>;

export type QueryParams = {
  [key: string]: undefined | JSONPrimitive;
};

export type OutgoingHeaders = { [key: string]: string | undefined };

@Injectable()
export abstract class JSONApiBase {
  public abstract apiUrl: string;
  public abstract getDefaultHeaders: () => OutgoingHeaders;

  constructor(private loggingService: LoggingService) {}

  private async _doRequest<S extends JSONResponseSchema>(
    schema: S,
    {
      method,
      path,
      body,
      queryParams,
      headers,
    }: {
      path: string;
      queryParams?: QueryParams | undefined;
      headers?: OutgoingHeaders | undefined;
    } & (
      | {
          method: 'get' | 'delete' | 'head';
          body?: undefined;
        }
      | {
          method: 'post' | 'put' | 'patch';
          body?: SerializableJSONData;
        }
    ),
  ): Promise<InferType<S>> {
    const url = `${this.apiUrl}${path}${
      queryParams ? `?${querystring.encode(queryParams)}` : ''
    }`;
    const response = await axios({
      method,
      url,
      headers: {
        ...this.getDefaultHeaders(),
        ...headers,
      },
      data: body,
      validateStatus: () => true,
    });

    const responseValidation = schema.validate(
      {
        status: response.status,
        body: response.data as unknown,
      },
      {
        abortEarly: true,
      },
    );

    if (responseValidation.errors) {
      const error = new Error();
      this.loggingService.logError('invalid-api-response', error, {
        url,
        method,
        requestBody: body,
        status: response.status,
        responseBody: response.data as unknown,
        errorMessagesTree: responseValidation.messagesTree,
      });
      throw error;
    } else {
      return responseValidation.value;
    }
  }

  async get<S extends JSONResponseSchema>(
    schema: S,
    args: {
      path: string;
      queryParams?: QueryParams;
      headers?: OutgoingHeaders;
    },
  ): Promise<InferType<S>> {
    return this._doRequest(schema, { method: 'get', ...args });
  }

  async post<S extends JSONResponseSchema>(
    schema: S,
    args: {
      path: string;
      queryParams?: QueryParams;
      headers?: OutgoingHeaders;
      body?: SerializableJSONData;
    },
  ): Promise<InferType<S>> {
    return this._doRequest(schema, { method: 'post', ...args });
  }

  async put<S extends JSONResponseSchema>(
    schema: S,
    args: {
      path: string;
      queryParams?: QueryParams;
      headers?: OutgoingHeaders;
      body?: SerializableJSONData;
    },
  ): Promise<InferType<S>> {
    return this._doRequest(schema, { method: 'put', ...args });
  }

  async patch<S extends JSONResponseSchema>(
    schema: S,
    args: {
      path: string;
      queryParams?: QueryParams;
      headers?: OutgoingHeaders;
      body?: SerializableJSONData;
    },
  ): Promise<InferType<S>> {
    return this._doRequest(schema, { method: 'patch', ...args });
  }

  async delete<S extends JSONResponseSchema>(
    schema: S,
    args: {
      path: string;
      queryParams?: QueryParams;
      headers?: OutgoingHeaders;
    },
  ): Promise<InferType<S>> {
    return this._doRequest(schema, { method: 'delete', ...args });
  }

  async head<S extends JsonHEADResponseSchema>(
    schema: S,
    args: {
      path: string;
      queryParams?: QueryParams;
      headers?: OutgoingHeaders;
    },
  ): Promise<InferType<S>> {
    return this._doRequest(schema, { method: 'head', ...args });
  }
}
