import {
  JSONData,
  SerializableJSONArray,
  SerializableJSONData,
  SerializableJSONObject,
} from '@app/shared/internals/transports/json-types';
import { toQueryString } from '@app/shared/internals/urls/to-query-string';
import axios from 'axios';
import { Logger } from 'src/logic/app-internals/logging/logger';

export type JSONResponse = {
  status: number;
  body?: JSONData | undefined;
};

export type JsonHEADResponse = {
  status: number;
};

export type OutgoingHeaders = { [key: string]: string | undefined };

type SupportedRequestQueryParams = {
  [key: string]: undefined | null | string | number;
};

type SupportedRequestBody =
  | SerializableJSONObject
  | SerializableJSONArray
  | undefined;

export abstract class ServerSideJSONApiBase {
  public abstract apiUrl: string;
  public abstract getDefaultHeaders: () => OutgoingHeaders;

  private async _doRequest<S extends JSONResponse>({
    method,
    path,
    body,
    queryParams,
    headers,
    acceptableStatusCodes,
  }: {
    path: string;
    queryParams?: SupportedRequestQueryParams;
    headers?: OutgoingHeaders;
    acceptableStatusCodes: readonly number[];
  } & (
    | {
        method: 'get' | 'delete' | 'head';
        body?: undefined;
      }
    | {
        method: 'post' | 'put' | 'patch';
        body?: SerializableJSONData;
      }
  )): Promise<S> {
    const url = `${this.apiUrl}${path}${
      queryParams ? toQueryString(queryParams) : ''
    }`;
    const response = await axios({
      method,
      url,
      headers: Object.entries({
        ...this.getDefaultHeaders(),
        ...headers,
      }).reduce<{ [key: string]: string }>((acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key] = value;
        }

        return acc;
      }, {}),
      data: body,
      validateStatus: () => true,
    });

    if (acceptableStatusCodes.includes(response.status)) {
      return {
        status: response.status,
        body: response.data as unknown,
      } as S;
    } else {
      const error = new Error();
      Logger.logError('invalid-api-response', error, {
        url,
        method,
        requestBody: body,
        status: response.status,
        responseBody: response.data as unknown,
      });
      throw error;
    }
  }

  async get<
    S extends JSONResponse = never,
    QueryParams extends SupportedRequestQueryParams | undefined = never,
  >(args: {
    acceptableStatusCodes: readonly S['status'][];
    path: string;
    queryParams: QueryParams;
    headers?: OutgoingHeaders;
  }): Promise<S> {
    return this._doRequest({ method: 'get', ...args });
  }

  async post<
    S extends JSONResponse = never,
    QueryParams extends SupportedRequestQueryParams | undefined = never,
    RequestBody extends SupportedRequestBody = never,
  >(args: {
    acceptableStatusCodes: readonly S['status'][];
    path: string;
    queryParams: QueryParams;
    headers?: OutgoingHeaders;
    body: RequestBody;
  }): Promise<S> {
    return this._doRequest({ method: 'post', ...args });
  }

  async put<
    S extends JSONResponse = never,
    QueryParams extends SupportedRequestQueryParams | undefined = never,
    RequestBody extends SupportedRequestBody = never,
  >(args: {
    acceptableStatusCodes: readonly S['status'][];
    path: string;
    queryParams: QueryParams;
    headers?: OutgoingHeaders;
    body: RequestBody;
  }): Promise<S> {
    return this._doRequest({ method: 'put', ...args });
  }

  async patch<
    S extends JSONResponse = never,
    QueryParams extends SupportedRequestQueryParams | undefined = never,
    RequestBody extends SupportedRequestBody = never,
  >(args: {
    acceptableStatusCodes: readonly S['status'][];
    path: string;
    queryParams: QueryParams;
    headers?: OutgoingHeaders;
    body: RequestBody;
  }): Promise<S> {
    return this._doRequest({ method: 'patch', ...args });
  }

  async delete<
    S extends JSONResponse = never,
    QueryParams extends SupportedRequestQueryParams | undefined = never,
  >(args: {
    acceptableStatusCodes: readonly S['status'][];
    path: string;
    queryParams: QueryParams;
    headers?: OutgoingHeaders;
  }): Promise<S> {
    return this._doRequest({ method: 'delete', ...args });
  }

  async head<
    S extends JsonHEADResponse,
    QueryParams extends SupportedRequestQueryParams | undefined = never,
  >(args: {
    acceptableStatusCodes: readonly S['status'][];
    path: string;
    queryParams: QueryParams;
    headers?: OutgoingHeaders;
  }): Promise<S> {
    return this._doRequest({ method: 'head', ...args });
  }
}
