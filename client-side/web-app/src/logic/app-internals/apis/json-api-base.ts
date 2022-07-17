import { toQueryString } from '@app/shared/internals/urls/to-query-string';
import { TransportFailure } from 'src/logic/app-internals/transports/transported-data/transport-failures';
import { UnparsedRequestHeaders } from '../transports/http/http-types';
import {
  JsonHttpOutgoingBody,
  JsonHttpResponse,
  JsonHttpResponseBase,
} from '../transports/http/json/json-http-types';
import { useJSONHttp } from '../transports/http/json/use-json-http';
import {
  SerializableJSONArray,
  SerializableJSONObject,
  SerializableJSONValue,
} from '../transports/json-types';

export type SupportedRequestQueryParams = {
  [key: string]: undefined | SerializableJSONValue | SerializableJSONValue[];
};
export type SupportedRequestBody =
  | SerializableJSONObject
  | SerializableJSONArray
  | FormData
  | undefined;

export abstract class JSONApiBase {
  private jsonHttp: ReturnType<typeof useJSONHttp>;
  private apiUrl: string;
  private getHeaders: () => UnparsedRequestHeaders;
  private onInvalidAuthToken: null | (() => Promise<void>);

  constructor(params: {
    jsonHttp: JSONApiBase['jsonHttp'];
    apiUrl: JSONApiBase['apiUrl'];
    getHeaders: JSONApiBase['getHeaders'];
    onInvalidAuthToken: JSONApiBase['onInvalidAuthToken'];
  }) {
    this.jsonHttp = params.jsonHttp;
    this.apiUrl = params.apiUrl;
    this.getHeaders = params.getHeaders;
    this.onInvalidAuthToken = params.onInvalidAuthToken;
  }

  private async doRequest<R extends JsonHttpResponseBase>(
    params:
      | {
          method: 'get' | 'delete' | 'head';
          path: string;
          query: SupportedRequestQueryParams | undefined;
          acceptableStatusCodes: readonly R['status'][];
        }
      | {
          method: 'post' | 'put' | 'patch';
          path: string;
          query: SupportedRequestQueryParams | undefined;
          body: JsonHttpOutgoingBody;
          acceptableStatusCodes: readonly R['status'][];
        },
  ): Promise<JsonHttpResponse<R>> {
    const originallyAcceptableStatusCodes = params.acceptableStatusCodes;

    const transformedRequestParams = {
      headers: {
        ...this.getHeaders(),
      },
      acceptableStatusCodes: [
        ...originallyAcceptableStatusCodes,
        401,
        403,
        404,
      ],
      url: `${this.apiUrl}${params.path}${
        params.query ? toQueryString(params.query) : ''
      }`,
      withCredentials: true,
    };

    const res = await (() => {
      if (
        params.method === 'post' ||
        params.method === 'put' ||
        params.method === 'patch'
      ) {
        return this.jsonHttp[params.method]<R>({
          ...transformedRequestParams,
          body: params.body,
        });
      } else if (params.method === 'head') {
        return this.jsonHttp.head(transformedRequestParams) as Promise<
          JsonHttpResponse<R>
        >;
      } else {
        return this.jsonHttp[params.method]<R>(transformedRequestParams);
      }
    })();

    if (res.failure) {
      return res;
    } else if (originallyAcceptableStatusCodes.includes(res.response.status)) {
      return res;
    } else {
      if (res.response.status === 404) {
        if (res.headers.get('X-Resource-Not-Found') === 'true') {
          return { failure: TransportFailure.NotFound };
        }
      }

      if (res.response.status === 403) {
        return { failure: TransportFailure.Forbidden };
      }

      if (res.response.status === 401 && this.onInvalidAuthToken) {
        await this.onInvalidAuthToken();

        return { failure: TransportFailure.AbortedAndDealtWith };
      }

      return res.logAndReturnAsUnexpected();
    }
  }

  get<
    Response extends JsonHttpResponseBase = never,
    QueryParams extends SupportedRequestQueryParams | undefined = never,
  >(params: {
    path: string;
    query: QueryParams;
    acceptableStatusCodes: readonly Response['status'][];
  }): Promise<JsonHttpResponse<Response>> {
    return this.doRequest({
      method: 'get',
      ...params,
    });
  }

  post<
    Response extends JsonHttpResponseBase = never,
    QueryParams extends SupportedRequestQueryParams | undefined = never,
    RequestBody extends SupportedRequestBody = never,
  >(params: {
    path: string;
    query: QueryParams;
    body: RequestBody;
    acceptableStatusCodes: readonly Response['status'][];
  }): Promise<JsonHttpResponse<Response>> {
    return this.doRequest({
      method: 'post',
      ...params,
    });
  }
  put<
    Response extends JsonHttpResponseBase = never,
    QueryParams extends SupportedRequestQueryParams | undefined = never,
    RequestBody extends SupportedRequestBody = never,
  >(params: {
    path: string;
    query: QueryParams;
    body: RequestBody;
    acceptableStatusCodes: readonly Response['status'][];
  }): Promise<JsonHttpResponse<Response>> {
    return this.doRequest({
      method: 'put',
      ...params,
    });
  }
  patch<
    Response extends JsonHttpResponseBase = never,
    QueryParams extends SupportedRequestQueryParams | undefined = never,
    RequestBody extends SupportedRequestBody = never,
  >(params: {
    path: string;
    query: QueryParams;
    body: RequestBody;
    acceptableStatusCodes: readonly Response['status'][];
  }): Promise<JsonHttpResponse<Response>> {
    return this.doRequest({
      method: 'patch',
      ...params,
    });
  }
  delete<
    Response extends JsonHttpResponseBase = never,
    QueryParams extends SupportedRequestQueryParams | undefined = never,
  >(params: {
    path: string;
    query: QueryParams;
    acceptableStatusCodes: readonly Response['status'][];
  }): Promise<JsonHttpResponse<Response>> {
    return this.doRequest({
      method: 'delete',
      ...params,
    });
  }
  head<
    Response extends { status: number; body: undefined } = never,
    QueryParams extends SupportedRequestQueryParams | undefined = never,
  >(params: {
    path: string;
    query: QueryParams;
    acceptableStatusCodes: readonly Response['status'][];
  }): Promise<JsonHttpResponse<Response>> {
    return this.doRequest({
      method: 'head',
      ...params,
    });
  }
}
