import { ClassWithContructor } from '@app/shared/internals/utils/types/classes-types';

export function cloneTypeormEntity<Entity>(
  entity: Entity,
  EntityClass: ClassWithContructor<Entity>,
): Entity {
  const clonedEntity = new EntityClass();

  Object.assign(clonedEntity, entity);

  return clonedEntity;
}
