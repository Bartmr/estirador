import { SetFieldsOnGraphQLNodeTypeArgs } from 'gatsby';
import { GraphQLString } from 'gatsby/graphql';
import type {
  GQLFileFields,
  Maybe,
} from '_graphql-generated_/typescript/types';

export async function setFieldsOnGraphQLNodeType({
  type,
}: SetFieldsOnGraphQLNodeTypeArgs) {
  if (type.name === `File`) {
    return {
      contents: {
        type: GraphQLString,
        resolve: (source: { fields?: Maybe<GQLFileFields> }) => {
          return source.fields?.contents;
        },
      },
    };
  } else {
    return {};
  }
}
