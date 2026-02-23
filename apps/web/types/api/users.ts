export type UserLoginSend = {
  name: string;
  password: string;
};

/** user receives a cookie with the auth_token */
export type UserLoginReceive = {
  message: string;
};

export type User = {
  id: number;
  name: string;
  password: string;
  createdAt: string;
  updatedAt: string;
};