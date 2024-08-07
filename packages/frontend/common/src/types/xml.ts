export type TXmlToJsonArray<T> = T | T[];

export type TXmlFormatted<T> = T extends object
    ? {
          [P in keyof T]?: T[P] extends TXmlToJsonArray<infer TArrayItem>
              ? TXmlFormatted<TArrayItem>[]
              : TXmlFormatted<T[P]>;
      }
    : T;
