import { defaultEventConfig, emptySummary } from "@/config/defaults";
import type {
  AdminDashboard,
  EventConfig,
  Expense,
  ParticipantInput,
  Payment,
  PublicParticipant,
  PublicSummary,
  Purchase,
} from "@/models/event";

const apiUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;

type ApiEnvelope<T> = { ok: true; data: T } | { ok: false; error: string };

async function parseResponse<T>(response: Response): Promise<T> {
  const envelope = (await response.json()) as ApiEnvelope<T>;
  if (!envelope.ok) throw new Error(envelope.error || "Não foi possível concluir a operação.");
  return envelope.data;
}

async function get<T>(action: string): Promise<T> {
  if (!apiUrl) throw new Error("A integração com o Google Sheets ainda não foi configurada.");
  const url = new URL(apiUrl);
  url.searchParams.set("action", action);
  return parseResponse<T>(await fetch(url.toString(), { cache: "no-store" }));
}

async function post<T>(action: string, payload: unknown, credential = ""): Promise<T> {
  if (!apiUrl) throw new Error("A integração com o Google Sheets ainda não foi configurada.");
  const body = new URLSearchParams({ action, payload: JSON.stringify(payload) });
  if (credential) body.set("credential", credential);
  return parseResponse<T>(
    await fetch(apiUrl, { method: "POST", body, redirect: "follow" }),
  );
}

export const eventApi = {
  isConfigured: Boolean(apiUrl),
  async getConfig(): Promise<EventConfig> {
    if (!apiUrl) return defaultEventConfig;
    return get<EventConfig>("config");
  },
  async getSummary(): Promise<PublicSummary> {
    if (!apiUrl) return emptySummary;
    return get<PublicSummary>("summary");
  },
  async getParticipants(): Promise<PublicParticipant[]> {
    if (!apiUrl) return [];
    return get<PublicParticipant[]>("participants");
  },
  confirmAttendance(input: ParticipantInput): Promise<{ id: string }> {
    return post("confirmAttendance", input);
  },
  getAdminDashboard(credential: string): Promise<AdminDashboard> {
    return post("adminDashboard", {}, credential);
  },
  savePayment(payment: Payment, credential: string): Promise<AdminDashboard> {
    return post("adminSavePayment", payment, credential);
  },
  deletePayment(id: string, credential: string): Promise<AdminDashboard> {
    return post("adminDeletePayment", { id }, credential);
  },
  saveExpense(expense: Expense, credential: string): Promise<AdminDashboard> {
    return post("adminSaveExpense", expense, credential);
  },
  deleteExpense(id: string, credential: string): Promise<AdminDashboard> {
    return post("adminDeleteExpense", { id }, credential);
  },
  savePurchase(purchase: Purchase, credential: string): Promise<AdminDashboard> {
    return post("adminSavePurchase", purchase, credential);
  },
  deletePurchase(id: string, credential: string): Promise<AdminDashboard> {
    return post("adminDeletePurchase", { id }, credential);
  },
};
