import path from 'path';

export function resolveLocalTemporaryFilesPath(...segments: string[]) {
  return path.resolve(path.resolve(process.cwd(), '_tmp', ...segments));
}
