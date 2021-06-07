import { throwError } from '@app/shared/internals/utils/throw-error';
import { Class } from '@app/shared/internals/utils/types/classes-types';

export function EnforceParameterDecoratorTypesafety(
  parameterClass: Class,
): ParameterDecorator {
  const enchancer: ParameterDecorator = (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) => {
    const parametersTypes = Reflect.getMetadata(
      'design:paramtypes',
      target,
      propertyKey,
    ) as Class[];

    const targetDescription = `Parameter [${parameterIndex}] from method ${propertyKey.toString()} in ${
      target.constructor.name
    }`;

    const parameterType =
      parametersTypes[parameterIndex] ||
      throwError(`${targetDescription} does not have a type defined`);

    if (parameterType !== parameterClass) {
      throw new Error(`${targetDescription} must have its type defined as ${parameterClass.name}.
If it's an optional parameter, declare it as 'parameterName?: ${parameterClass.name}'`);
    }
  };

  return enchancer;
}
