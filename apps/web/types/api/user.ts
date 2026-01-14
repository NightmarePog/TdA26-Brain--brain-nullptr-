export type userLoginSend = {
  nameOrEmail: string;
  password: string;
};

/** user receives a cookie with the auth_token */
export type userLoginReceive = {
  message: string;
};
