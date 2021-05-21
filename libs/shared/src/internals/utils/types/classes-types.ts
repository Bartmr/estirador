import type { Abstract, Type } from '@nestjs/common';

export type ClassType<T = unknown> = Type<T> | Abstract<T>;
