import type { Abstract, Type } from '@nestjs/common';

export type ClassToObjectLiteral<T extends {}> = { [K in keyof T]: T[K] };

export type ClassType<T = unknown> = Type<T> | Abstract<T>;
