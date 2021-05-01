export type EnumBase =
  | {
      [key: string]: string | number;
    }
  | {
      [key: number]: string | number;
    };
