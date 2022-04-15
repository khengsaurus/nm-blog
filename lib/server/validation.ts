import bcrypt from "bcrypt";

function hashPassword(pw: string) {
  return bcrypt.hashSync(pw, Number(process.env.SALT_ROUNDS));
}

function verifyPassword(pw: string, hash: string) {
  return bcrypt.compareSync(pw, hash);
}

export { hashPassword, verifyPassword };
