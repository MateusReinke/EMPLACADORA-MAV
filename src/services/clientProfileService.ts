import { db } from "@/lib/dbClient";
import { User } from "@/types";

const tryFindClientId = async (column: string, value?: string | null) => {
  if (!value) return null;

  const { data, error } = await db
    .from("clients")
    .select("id")
    .eq(column, value)
    .maybeSingle();

  if (error) return null;
  return data?.id ?? null;
};

export const resolveClientIdForUser = async (user: User | null): Promise<string | null> => {
  if (!user) return null;

  return (
    (await tryFindClientId("user_id", user.id)) ||
    (await tryFindClientId("created_by", user.id)) ||
    (await tryFindClientId("email", user.email)) ||
    null
  );
};
