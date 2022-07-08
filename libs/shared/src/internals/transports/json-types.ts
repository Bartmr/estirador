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
    | SerializableJSONValue
    | SerializableJSONObject
    | SerializableJSONArray;
};

export type SerializableJSONArray = Array<
  | undefined
  | SerializableJSONValue
  | SerializableJSONObject
  | SerializableJSONArray
>;

export type SerializableJSONValue = Date | JSONPrimitive;

export type SerializableJSONData =
  | SerializableJSONValue
  | SerializableJSONObject
  | SerializableJSONArray;
