import { pgTable } from "drizzle-orm/pg-core";

export const sessions: ReturnType<typeof pgTable>;
export const users: ReturnType<typeof pgTable>;

export type UpsertUser = {
  id?: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type User = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};
