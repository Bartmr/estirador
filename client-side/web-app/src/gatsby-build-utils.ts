import { promisify } from 'util';
import fs from 'fs';
import { getIntrospectionQuery, graphql, GraphQLSchema } from 'gatsby/graphql';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);

export const GRAPHQL_TYPESCRIPT_GENERATOR_COMMAND =
  'graphql-codegen --config codegen.yml';

export async function pathExists(path: string) {
  try {
    await access(path, fs.constants.F_OK);
    return true;
  } catch (err: unknown) {
    return false;
  }
}

export type GatsbyBuildTimeStore = {
  getState: () => { schema?: GraphQLSchema };
};

export async function saveGraphQLSchemaToFile(store: GatsbyBuildTimeStore) {
  const { schema } = store.getState();
  if (!schema) throw new Error();

  const graphQlSchema = await graphql(schema, getIntrospectionQuery());

  const dir = '_graphql-generated_';

  if (!(await pathExists(dir))) {
    await mkdir(dir);
  }
  await writeFile(`${dir}/schema.json`, JSON.stringify(graphQlSchema));
}
