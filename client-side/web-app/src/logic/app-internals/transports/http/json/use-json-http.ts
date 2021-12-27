import { JSONData } from '@app/shared/internals/transports/json-types';
import { Logger } from 'src/logic/app-internals/logging/logger';
import { TransportFailure } from '../../transported-data/transport-failures';
import { OutgoingHeaders } from '../http-types';
import {
  JsonHttpHEADResponse,
  JsonHttpOutgoingBody,
  JsonHttpResponse,
  JsonHttpResponseBase,
} from './json-http-types';

function logError({
  errorKey,
  error,
  url,
  method,
  status,
  requestBody,
  responseText,
  withCredentials,
}: {
  errorKey: string;
  error: unknown;
  url: string;
  method: string;
  status: number;
  requestBody: JsonHttpOutgoingBody;
  responseText: string;
  withCredentials: boolean | undefined;
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
    withCredentials,
  });
}

async function makeJsonHttpRequest({
  method,
  url,
  headers: customHeaders,
  body: uncategorizedBody,
  acceptableStatusCodes,
  withCredentials,
}: {
  url: string;
  headers: OutgoingHeaders;
  acceptableStatusCodes: readonly number[];
  withCredentials: boolean | undefined;
} & (
  | { method: 'HEAD' | 'GET' | 'DELETE'; body?: undefined }
  | { method: 'POST' | 'PATCH' | 'PUT'; body: JsonHttpOutgoingBody }
)): Promise<JsonHttpResponse<{ status: number; body: JSONData | undefined }>> {
  const headers: { [key: string]: string } = {
    Accept: 'application/json',
  };

  let body: FormData | undefined | string;

  if (uncategorizedBody instanceof FormData) {
    body = uncategorizedBody;
  } else if (typeof uncategorizedBody === 'undefined') {
    body = undefined;
  } else if (typeof uncategorizedBody === 'string') {
    headers['Content-Type'] = 'text/plain';
    body = uncategorizedBody;
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(uncategorizedBody);
  }

  for (const key of Object.keys(customHeaders)) {
    const value = customHeaders[key];

    if (typeof value === 'string') {
      headers[key] = value;
    }
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers,
      credentials: withCredentials ? 'include' : undefined,
      body,
    });
  } catch (err: unknown) {
    return {
      failure: TransportFailure.ConnectionFailure,
    };
  }

  const responseText = await response.text();

  let parsedBody;

  try {
    parsedBody =
      responseText && method !== 'HEAD'
        ? (JSON.parse(responseText) as JsonHttpResponseBase['body'])
        : undefined;
  } catch (error: unknown) {
    logError({
      errorKey: 'could-not-parse-json-http-response',
      error,
      url,
      method,
      status: response.status,
      requestBody: body,
      responseText: responseText,
      withCredentials,
    });

    return {
      failure: TransportFailure.UnexpectedResponse,
      status: response.status,
    };
  }

  const logAndReturnAsUnexpected = () => {
    logError({
      errorKey: 'unexpected-json-http-response',
      error: new Error(),
      url,
      method,
      status: response.status,
      requestBody: body,
      responseText: responseText,
      withCredentials,
    });

    return {
      failure: TransportFailure.UnexpectedResponse,
      status: response.status,
    } as const;
  };

  if (acceptableStatusCodes.includes(response.status)) {
    return {
      response: {
        status: response.status,
        body: parsedBody,
      },
      logAndReturnAsUnexpected,
      headers: response.headers,
    };
  } else {
    const unexpectedResponseFailure = logAndReturnAsUnexpected();

    return unexpectedResponseFailure;
  }
}

class JSONHttp {
  async get<R extends JsonHttpResponseBase = never>({
    url,
    headers,
    acceptableStatusCodes,
    withCredentials,
  }: {
    url: string;
    headers: OutgoingHeaders;
    acceptableStatusCodes: readonly R['status'][];
    withCredentials: boolean | undefined;
  }): Promise<JsonHttpResponse<R>> {
    const res = (await makeJsonHttpRequest({
      url,
      method: 'GET',
      headers,
      acceptableStatusCodes,
      withCredentials,
    })) as JsonHttpResponse<R>;

    return res;
  }

  async post<R extends JsonHttpResponseBase = never>({
    url,
    headers,
    body,
    acceptableStatusCodes,
    withCredentials,
  }: {
    url: string;
    headers: OutgoingHeaders;
    body: JsonHttpOutgoingBody;
    acceptableStatusCodes: readonly R['status'][];
    withCredentials: boolean | undefined;
  }): Promise<JsonHttpResponse<R>> {
    const res = (await makeJsonHttpRequest({
      url,
      method: 'POST',
      headers,
      body,
      acceptableStatusCodes,
      withCredentials,
    })) as JsonHttpResponse<R>;

    return res;
  }

  async put<R extends JsonHttpResponseBase = never>({
    url,
    headers,
    body,
    acceptableStatusCodes,
    withCredentials,
  }: {
    url: string;
    headers: OutgoingHeaders;
    body: JsonHttpOutgoingBody;
    acceptableStatusCodes: readonly R['status'][];
    withCredentials: boolean | undefined;
  }): Promise<JsonHttpResponse<R>> {
    const res = (await makeJsonHttpRequest({
      url,
      method: 'PUT',
      headers,
      body,
      acceptableStatusCodes,
      withCredentials,
    })) as JsonHttpResponse<R>;

    return res;
  }

  async patch<R extends JsonHttpResponseBase = never>({
    url,
    headers,
    body,
    acceptableStatusCodes,
    withCredentials,
  }: {
    url: string;
    headers: OutgoingHeaders;
    body: JsonHttpOutgoingBody;
    acceptableStatusCodes: readonly R['status'][];
    withCredentials: boolean | undefined;
  }): Promise<JsonHttpResponse<R>> {
    const res = (await makeJsonHttpRequest({
      url,
      method: 'PATCH',
      headers,
      body,
      acceptableStatusCodes,
      withCredentials,
    })) as JsonHttpResponse<R>;

    return res;
  }

  async delete<R extends JsonHttpResponseBase = never>({
    url,
    headers,
    acceptableStatusCodes,
    withCredentials,
  }: {
    url: string;
    headers: OutgoingHeaders;
    acceptableStatusCodes: readonly R['status'][];
    withCredentials: boolean | undefined;
  }): Promise<JsonHttpResponse<R>> {
    const res = (await makeJsonHttpRequest({
      url,
      method: 'DELETE',
      headers,
      acceptableStatusCodes,
      withCredentials,
    })) as JsonHttpResponse<R>;

    return res;
  }

  async head({
    url,
    headers,
    acceptableStatusCodes,
    withCredentials,
  }: {
    url: string;
    headers: OutgoingHeaders;
    acceptableStatusCodes: number[];
    withCredentials: boolean | undefined;
  }): Promise<JsonHttpHEADResponse> {
    const res = (await makeJsonHttpRequest({
      url,
      method: 'HEAD',
      headers,
      acceptableStatusCodes,
      withCredentials,
    })) as JsonHttpHEADResponse;

    return res;
  }
}

export function useJSONHttp() {
  return new JSONHttp();
}
