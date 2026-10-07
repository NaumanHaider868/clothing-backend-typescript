const toPublicUser = <T extends { password?: string; verificationCode?: string | null }>(user: T) => {
  const rest = { ...user };
  delete rest.password;
  delete rest.verificationCode;
  return rest;
};

export { toPublicUser };
