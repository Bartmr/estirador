import { Logger } from 'src/logic/app-internals/logging/logger';
import { TransportFailure } from '../../transported-data/transport-failures';
import { OutgoingHeaders } from '../http-types';
import {
  JsonHttpHEADResponse,
  JsonHttpOutgoingBody,
  JsonHttpResponse,
  JsonHttpResponseBase,
} from './json-http-types';

function setRequestHeaders(request: XMLHttpRequest, headers: OutgoingHeaders) {
  Object.keys(headers).forEach((key) => {
    const value = headers[key];

    if (typeof value === 'string') {
      request.setRequestHeader(key, value);
    }
  });
}

function logError({
  errorKey,
  error,
  url,
  method,
  status,
  requestBody,
  responseText,
}: {
  errorKey: string;
  error: unknown;
  url: string;
  method: string;
  status: number;
  requestBody: JsonHttpOutgoingBody;
  responseText: string;
}) {
  const requestBodyForLogger =
    requestBody instanceof FormData
      ? (() => {
          const formDataAsObj: { [key: string]: string } = {};

          requestBody.forEach((value, key) => {
            formDataAsObj[key] = typeof value === 'string' ? value : '<File>';
          });

          return formDataAsObj;
        })()
      : requestBody;

  Logger.logError(errorKey, error, {
    url,
    method,
    status,
    requestBody: requestBodyForLogger,
    responseText: responseText,
  });
}

function makeJsonHttpRequest({
  method,
  url,
  headers,
  body,
  acceptableStatusCodes,
}: {
  url: string;
  headers: OutgoingHeaders;
  acceptableStatusCodes: readonly number[];
} & (
  | { method: 'HEAD' | 'GET' | 'DELETE'; body?: undefined }
  | { method: 'POST' | 'PATCH' | 'PUT'; body: JsonHttpOutgoingBody }
)) {
  return new Promise<JsonHttpResponse<JsonHttpResponseBase>>((resolve) => {
    const request = new XMLHttpRequest();
    const headersToAdd = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    };
    const bodyToSend =
      body instanceof FormData
        ? body
        : typeof body === 'undefined'
        ? undefined
        : typeof body === 'string'
        ? body
        : JSON.stringify(body);

    request.onreadystatechange = () => {
      if (request.readyState !== 4) {
        return;
      }

      let parsedBody;
      try {
        parsedBody =
          request.responseText && method !== 'HEAD'
            ? (JSON.parse(request.responseText) as JsonHttpResponseBase['body'])
            : undefined;
      } catch (error: unknown) {
        logError({
          errorKey: 'could-not-parse-json-http-response',
          error,
          url,
          method,
          status: request.status,
          requestBody: body,
          responseText: request.responseText,
        });

        return resolve({
          failure: TransportFailure.UnexpectedResponse,
          status: request.status,
        });
      }

      if (!request.status) {
        return resolve({
          failure: TransportFailure.ConnectionFailure,
        });
      } else {
        const logAndReturnAsUnexpected = () => {
          logError({
            errorKey: 'unexpected-json-http-response',
            error: new Error(),
            url,
            method,
            status: request.status,
            requestBody: body,
            responseText: request.responseText,
          });

          return {
            failure: TransportFailure.UnexpectedResponse,
            status: request.status,
          } as const;
        };

        if (acceptableStatusCodes.includes(request.status)) {
          return resolve({
            response: {
              status: request.status,
              body: parsedBody,
            },
            logAndReturnAsUnexpected,
          });
        } else {
          const unexpectedResponseFailure = logAndReturnAsUnexpected();

          return resolve(unexpectedResponseFailure);
        }
      }
    };

    request.open(method, url);

    setRequestHeaders(request, headersToAdd);

    if (method === 'GET' || method === 'HEAD' || method === 'DELETE') {
      request.send();
    } else {
      request.send(bodyToSend);
    }
  });
}

class JSONHttp {
  async get<R extends JsonHttpResponseBase = never>({
    url,
    headers,
    acceptableStatusCodes,
  }: {
    url: string;
    headers: OutgoingHeaders;
    acceptableStatusCodes: readonly R['status'][];
  }): Promise<JsonHttpResponse<R>> {
    const res = (await makeJsonHttpRequest({
      url,
      method: 'GET',
      headers,
      acceptableStatusCodes,
    })) as JsonHttpResponse<R>;

    return res;
  }

  async post<R extends JsonHttpResponseBase = never>({
    url,
    headers,
    body,
    acceptableStatusCodes,
  }: {
    url: string;
    headers: OutgoingHeaders;
    body: JsonHttpOutgoingBody;
    acceptableStatusCodes: readonly R['status'][];
  }): Promise<JsonHttpResponse<R>> {
    const res = (await makeJsonHttpRequest({
      url,
      method: 'POST',
      headers,
      body,
      acceptableStatusCodes,
    })) as JsonHttpResponse<R>;

    return res;
  }

  async put<R extends JsonHttpResponseBase = never>({
    url,
    headers,
    body,
    acceptableStatusCodes,
  }: {
    url: string;
    headers: OutgoingHeaders;
    body: JsonHttpOutgoingBody;
    acceptableStatusCodes: readonly R['status'][];
  }): Promise<JsonHttpResponse<R>> {
    const res = (await makeJsonHttpRequest({
      url,
      method: 'PUT',
      headers,
      body,
      acceptableStatusCodes,
    })) as JsonHttpResponse<R>;

    return res;
  }

  async patch<R extends JsonHttpResponseBase = never>({
    url,
    headers,
    body,
    acceptableStatusCodes,
  }: {
    url: string;
    headers: OutgoingHeaders;
    body: JsonHttpOutgoingBody;
    acceptableStatusCodes: readonly R['status'][];
  }): Promise<JsonHttpResponse<R>> {
    const res = (await makeJsonHttpRequest({
      url,
      method: 'PATCH',
      headers,
      body,
      acceptableStatusCodes,
    })) as JsonHttpResponse<R>;

    return res;
  }

  async delete<R extends JsonHttpResponseBase = never>({
    url,
    headers,
    acceptableStatusCodes,
  }: {
    url: string;
    headers: OutgoingHeaders;
    acceptableStatusCodes: readonly R['status'][];
  }): Promise<JsonHttpResponse<R>> {
    const res = (await makeJsonHttpRequest({
      url,
      method: 'DELETE',
      headers,
      acceptableStatusCodes,
    })) as JsonHttpResponse<R>;

    return res;
  }

  async head({
    url,
    headers,
    acceptableStatusCodes,
  }: {
    url: string;
    headers: OutgoingHeaders;
    acceptableStatusCodes: number[];
  }): Promise<JsonHttpHEADResponse> {
    const res = (await makeJsonHttpRequest({
      url,
      method: 'HEAD',
      headers,
      acceptableStatusCodes,
    })) as JsonHttpHEADResponse;

    return res;
  }
}

export function useJSONHttp() {
  return new JSONHttp();
}
