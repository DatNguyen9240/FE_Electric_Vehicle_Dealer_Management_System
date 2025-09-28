export type RegisterRequest = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
};

export interface User {
  name: string;
  email: string;
  phone: string;
  role: string;
}
