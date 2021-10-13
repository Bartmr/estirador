import bcrypt from 'bcrypt';

export async function hashPassword(password: string) {
  const passwordSalt = await bcrypt.genSalt();

  const passwordHash = await bcrypt.hash(password, passwordSalt);

  return {
    passwordSalt,
    passwordHash,
  };
}
