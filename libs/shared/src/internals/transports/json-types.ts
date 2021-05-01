export type JSONPrimitive = string | number | boolean | null;

export type JSONObject = {
  [x: string]: undefined | JSONPrimitive | JSONObject | JSONArray;
};

export type JSONArray = Array<JSONPrimitive | JSONObject | JSONArray>;

export type JSONData = JSONPrimitive | JSONObject | JSONArray;

//
//

export type SerializableJSONObject = {
  [x: string]:
    | undefined
    | JSONPrimitive
    | SerializableJSONObject
    | SerializableJSONArray
    | Date;
};

export type SerializableJSONArray = Array<
  | undefined
  | JSONPrimitive
  | SerializableJSONObject
  | SerializableJSONArray
  | Date
>;

export type SerializableJSONValue = Date | JSONPrimitive;

export type SerializableJSONData =
  | SerializableJSONValue
  | SerializableJSONObject
  | SerializableJSONArray;
