/**
 * If it returns `unknown`, it means the Comparator is not equal to T.
 * Comparator problably has more properties or more types in its union types
 *
 * To check what properties are not being compatible,
 * just reverse the generic parameters order
 */
export type TypeIsEqualTo<
  Comparator,
  T extends Comparator,
> = Comparator extends T ? T : unknown;
