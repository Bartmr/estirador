import {
  JSONApiBase,
  SupportedRequestBody,
  SupportedRequestQueryParams,
} from './json-api-base';
import { Schema, InferType } from 'not-me/lib/schemas/schema';
import {
  JsonHttpHEADResponse,
  JsonHttpResponse,
} from '../transports/http/json/json-http-types';

type JsonHttpResponseBase = {
  status: number;
  body?: unknown;
};

export class ExternalJSONApi {
  private jsonApi: JSONApiBase;

  constructor(args: { jsonApi: JSONApiBase }) {
    this.jsonApi = args.jsonApi;
  }

  async get<
    S extends Schema<JsonHttpResponseBase>,
    I extends JsonHttpResponseBase = InferType<S>,
  >(
    schema: S,
    params: {
      acceptableStatusCodes: Array<I['status']>;
      path: string;
      query: SupportedRequestQueryParams | undefined;
    },
  ): Promise<JsonHttpResponse<I>> {
    const res = await this.jsonApi.get(params);

    if (res.failure) {
      return res;
    } else {
      const validationResult = schema.validate(res.response);

      if (validationResult.errors) {
        return res.logAndReturnAsUnexpected();
      } else {
        return {
          ...res,
          response: validationResult.value as I,
        };
      }
    }
  }

  async post<
    S extends Schema<JsonHttpResponseBase>,
    I extends JsonHttpResponseBase = InferType<S>,
  >(
    schema: S,
    params: {
      acceptableStatusCodes: Array<I['status']>;
      path: string;
      query: SupportedRequestQueryParams | undefined;
      body: SupportedRequestBody;
    },
  ): Promise<JsonHttpResponse<I>> {
    const res = await this.jsonApi.post(params);

    if (res.failure) {
      return res;
    } else {
      const validationResult = schema.validate(res.response);

      if (validationResult.errors) {
        return res.logAndReturnAsUnexpected();
      } else {
        return {
          ...res,
          response: validationResult.value as I,
        };
      }
    }
  }

  async put<
    S extends Schema<JsonHttpResponseBase>,
    I extends JsonHttpResponseBase = InferType<S>,
  >(
    schema: S,
    params: {
      acceptableStatusCodes: Array<I['status']>;
      path: string;
      query: SupportedRequestQueryParams | undefined;
      body: SupportedRequestBody;
    },
  ): Promise<JsonHttpResponse<I>> {
    const res = await this.jsonApi.put(params);

    if (res.failure) {
      return res;
    } else {
      const validationResult = schema.validate(res.response);

      if (validationResult.errors) {
        return res.logAndReturnAsUnexpected();
      } else {
        return {
          ...res,
          response: validationResult.value as I,
        };
      }
    }
  }

  async patch<
    S extends Schema<JsonHttpResponseBase>,
    I extends JsonHttpResponseBase = InferType<S>,
  >(
    schema: S,
    params: {
      acceptableStatusCodes: Array<I['status']>;
      path: string;
      query: SupportedRequestQueryParams | undefined;
      body: SupportedRequestBody;
    },
  ): Promise<JsonHttpResponse<I>> {
    const res = await this.jsonApi.patch(params);

    if (res.failure) {
      return res;
    } else {
      const validationResult = schema.validate(res.response);

      if (validationResult.errors) {
        return res.logAndReturnAsUnexpected();
      } else {
        return {
          ...res,
          response: validationResult.value as I,
        };
      }
    }
  }

  async delete<
    S extends Schema<JsonHttpResponseBase>,
    I extends JsonHttpResponseBase = InferType<S>,
  >(
    schema: S,
    params: {
      acceptableStatusCodes: Array<I['status']>;
      path: string;
      query: SupportedRequestQueryParams | undefined;
    },
  ): Promise<JsonHttpResponse<I>> {
    const res = await this.jsonApi.delete(params);

    if (res.failure) {
      return res;
    } else {
      const validationResult = schema.validate(res.response);

      if (validationResult.errors) {
        return res.logAndReturnAsUnexpected();
      } else {
        return {
          ...res,
          response: validationResult.value as I,
        };
      }
    }
  }

  async head(params: {
    path: string;
    query: SupportedRequestQueryParams | undefined;
    acceptableStatusCodes: number[];
  }): Promise<JsonHttpHEADResponse> {
    return this.jsonApi.head(params);
  }
}
