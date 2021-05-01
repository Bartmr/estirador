import { CreateNodeArgs } from 'gatsby';
import fs from 'fs';
import { GQLFile } from '_graphql-generated_/typescript/types';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

export async function onCreateNode(args: CreateNodeArgs) {
  const { node, actions } = args;

  if (node.internal.type === 'File') {
    const fileNode = (node as unknown) as GQLFile;

    const fileContents = await readFile(fileNode.absolutePath, {
      encoding: 'utf8',
    });

    actions.createNodeField({ node, name: `contents`, value: fileContents });
  }
}
