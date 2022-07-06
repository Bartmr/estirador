import { JSONData, SerializableJSONData } from '../../json-types';
import { TransportFailure } from '../../transported-data/transport-failures';

export type JsonHttpResponseBase = {
  status: number;
  body: JSONData | undefined;
};

export type JsonHttpResponse<R> =
  | {
      failure?: undefined;
      logAndReturnAsUnexpected: () => {
        failure: TransportFailure.UnexpectedResponse;
        status: number;
      };
      response: R;
      headers: Headers;
    }
  | {
      failure: Exclude<TransportFailure, TransportFailure.UnexpectedResponse>;
    }
  | {
      failure: TransportFailure.UnexpectedResponse;
      status: number;
    };

export type JsonHttpHEADResponse = JsonHttpResponse<{
  status: number;
  body: undefined;
}>;

export type JsonHttpOutgoingBody = SerializableJSONData | FormData | undefined;
