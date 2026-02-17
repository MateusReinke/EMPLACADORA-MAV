import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown, fallback = "Ocorreu um erro inesperado."): string {
  if (!error) return fallback;

  if (typeof error === "string") return error;

  if (error instanceof Error) {
    const msg = error.message || fallback;

    if (msg.includes('multiple assignments to same column "updated_at"')) {
      return "Não foi possível salvar porque houve conflito interno de atualização. Tente novamente.";
    }

    if (msg.toLowerCase().includes("estoque insuficiente")) {
      return msg;
    }

    return msg;
  }

  if (typeof error === "object") {
    const maybe = error as { message?: unknown; error?: { message?: unknown } };

    if (typeof maybe.message === "string" && maybe.message.trim()) {
      return maybe.message;
    }

    if (maybe.error && typeof maybe.error.message === "string" && maybe.error.message.trim()) {
      return maybe.error.message;
    }
  }

  return fallback;
}
