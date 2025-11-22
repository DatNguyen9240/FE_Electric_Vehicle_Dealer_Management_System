export interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  note?: string;
  handledBy?: string;
  handledAt?: string;
}

export type { User } from "./Auth";
