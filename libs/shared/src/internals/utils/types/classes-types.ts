import type { Abstract, Type } from '@nestjs/common';

export type ConcreteClass<T = unknown> = Type<T>;

export type AbstractClass<T = unknown> = Abstract<T>;

export type Class<T = unknown> = ConcreteClass<T> | AbstractClass<T>;
