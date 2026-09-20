"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdminCrudSection, type AdminField } from "@/components/AdminCrudSection";
import { formatCurrency } from "@/lib/format";
import type { AdminDashboard, Expense, Payment, Purchase } from "@/models/event";
import { eventApi } from "@/services/event-api";

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const credentialStorageKey = "churrasco-poli-admin-credential";

function credentialIsCurrent(credential: string): boolean {
  try {
    const encodedPayload = credential.split(".")[1];
    const normalized = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const payload = JSON.parse(window.atob(padded)) as { exp?: number };
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now() + 60_000;
  } catch {
    return false;
  }
}

const paymentStatusLabels = { pending: "Pendente", reported: "Informado", confirmed: "Confirmado" } as const;
const expenseStatusLabels = { planned: "Planejada", approved: "Aprovada", paid: "Paga", cancelled: "Cancelada" } as const;
const purchaseStatusLabels = { planned: "Planejada", assigned: "Atribuída", purchased: "Comprada", cancelled: "Cancelada" } as const;

const expenseFields: AdminField<Expense>[] = [
  { key: "item", label: "Item", required: true },
  { key: "category", label: "Categoria", required: true },
  { key: "supplier", label: "Fornecedor" },
  { key: "status", label: "Status", type: "select", required: true, options: Object.entries(expenseStatusLabels).map(([value, label]) => ({ value, label })) },
  { key: "plannedAmount", label: "Valor planejado", type: "number", min: 0, step: 0.01, required: true },
  { key: "actualAmount", label: "Valor realizado", type: "number", min: 0, step: 0.01, required: true },
  { key: "notes", label: "Observações", type: "textarea", full: true },
];

const purchaseFields: AdminField<Purchase>[] = [
  { key: "item", label: "Item", required: true },
  { key: "category", label: "Categoria", required: true },
  { key: "quantity", label: "Quantidade", type: "number", min: 0, step: 0.01, required: true },
  { key: "unit", label: "Unidade", type: "select", required: true, options: [
    { value: "kg", label: "kg" }, { value: "L", label: "litros" }, { value: "un", label: "unidades" },
    { value: "pack", label: "pacotes" }, { value: "bag", label: "sacos" },
  ] },
  { key: "responsible", label: "Responsável" },
  { key: "status", label: "Status", type: "select", required: true, options: Object.entries(purchaseStatusLabels).map(([value, label]) => ({ value, label })) },
  { key: "notes", label: "Observações", type: "textarea", full: true },
];

function emptyExpense(): Expense {
  return { id: "", item: "", category: "", supplier: "", plannedAmount: 0, actualAmount: 0, status: "planned", notes: "", createdAt: "", updatedAt: "" };
}

function emptyPurchase(): Purchase {
  return { id: "", item: "", category: "", quantity: 1, unit: "un", responsible: "", status: "planned", notes: "", createdAt: "", updatedAt: "" };
}

export default function AdminPage() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [credential, setCredential] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  const initialize = useCallback(() => {
    if (!clientId || !window.google || !buttonRef.current) return;
    window.google.accounts.id.initialize({ client_id: clientId, callback: async ({ credential: token }) => {
      setError("");
      setBusy(true);
      try {
        setDashboard(await eventApi.getAdminDashboard(token));
        setCredential(token);
        window.sessionStorage.setItem(credentialStorageKey, token);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Não foi possível entrar.");
      } finally { setBusy(false); }
    }});
    buttonRef.current.replaceChildren();
    window.google.accounts.id.renderButton(buttonRef.current, { theme: "outline", size: "large", text: "signin_with", locale: "pt-BR" });
  }, []);

  useEffect(() => {
    const storedCredential = window.sessionStorage.getItem(credentialStorageKey) || "";
    if (!storedCredential) return;
    if (!credentialIsCurrent(storedCredential)) {
      window.sessionStorage.removeItem(credentialStorageKey);
      return;
    }
    eventApi.getAdminDashboard(storedCredential)
      .then((data) => { setDashboard(data); setCredential(storedCredential); })
      .catch(() => {
        window.sessionStorage.removeItem(credentialStorageKey);
        setError("Sua sessão administrativa expirou. Entre novamente.");
      })
      .finally(() => setBusy(false));
  }, []);

  useEffect(() => { if (googleReady && !dashboard) initialize(); }, [googleReady, dashboard, initialize]);

  function logout() {
    window.sessionStorage.removeItem(credentialStorageKey);
    window.google?.accounts.id.disableAutoSelect();
    setDashboard(null); setCredential(""); setError(""); setMessage("");
  }

  async function mutate(operation: () => Promise<AdminDashboard>, successMessage: string) {
    setBusy(true); setError(""); setMessage("");
    try {
      setDashboard(await operation());
      setMessage(successMessage);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível concluir a operação.");
      throw caught;
    } finally { setBusy(false); }
  }

  if (!clientId) return <section className="pageShell narrow"><div className="pageIntro"><div className="eyebrow dark">ORGANIZAÇÃO</div><h1>Área administrativa</h1></div><div className="notice">Configure <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> para habilitar o acesso administrativo.</div></section>;

  const paymentFields: AdminField<Payment>[] = dashboard ? [
    { key: "participantId", label: "Participante", type: "select", required: true, options: [
      { value: "", label: "Selecione um participante" },
      ...dashboard.participants.map((participant) => ({ value: participant.id, label: participant.name })),
    ] },
    { key: "status", label: "Status", type: "select", required: true, options: Object.entries(paymentStatusLabels).map(([value, label]) => ({ value, label })) },
    { key: "expectedAmount", label: "Valor esperado", type: "number", min: 0, step: 0.01, required: true },
    { key: "reportedAmount", label: "Valor informado", type: "number", min: 0, step: 0.01, required: true },
    { key: "paymentDate", label: "Data do pagamento", type: "date" },
    { key: "notes", label: "Observações", type: "textarea", full: true },
  ] : [];

  const emptyPayment = (): Payment => ({
    id: "", participantId: dashboard?.participants[0]?.id || "", expectedAmount: 0, reportedAmount: 0,
    status: "pending", paymentDate: "", notes: "", createdAt: "", updatedAt: "",
  });

  return (
    <section className="pageShell">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={() => setGoogleReady(true)} />
      <div className="adminPageHeading">
        <div className="pageIntro"><div className="eyebrow dark">ORGANIZAÇÃO</div><h1>Painel administrativo</h1><p>Gerencie participantes, pagamentos, despesas e compras do evento.</p></div>
        {dashboard && <button className="button outline small" onClick={logout}>Sair</button>}
      </div>
      {!dashboard && <div className="loginCard"><div ref={buttonRef} /><p>Somente o Gmail definido no Apps Script terá acesso.</p>{busy && <p>Carregando painel...</p>}{error && <div className="formMessage error">{error}</div>}</div>}
      {dashboard && <>
        <div className="moneyGrid compact">
          <article><small>PESSOAS</small><strong>{dashboard.summary.totalPeople}</strong></article>
          <article><small>RECEBIDO</small><strong>{formatCurrency(dashboard.summary.confirmedRevenue)}</strong></article>
          <article><small>DESPESAS</small><strong>{formatCurrency(dashboard.summary.actualExpenses)}</strong></article>
          <article className="accent"><small>COMPRAS</small><strong>{dashboard.purchases.length}</strong></article>
        </div>

        {message && <div className="formMessage success adminMessage">{message}</div>}
        {error && <div className="formMessage error adminMessage">{error}</div>}

        <div className="adminSection"><h2>Participantes</h2><div className="tableWrap"><table><thead><tr><th>Nome</th><th>Contato</th><th>Resposta</th><th>Grupo</th><th>Restrições</th></tr></thead><tbody>{dashboard.participants.map((participant) => <tr key={participant.id}><td>{participant.name}</td><td>{participant.email}<br /><small>{participant.phone}</small></td><td>{participant.attendanceStatus}</td><td>{1 + participant.adultGuests + participant.childGuests}</td><td>{participant.dietaryRestrictions || "—"}</td></tr>)}</tbody></table></div></div>

        <AdminCrudSection
          title="Pagamentos" singular="Pagamento" records={dashboard.payments} fields={paymentFields} busy={busy}
          canCreate={dashboard.participants.length > 0} createBlockedMessage="Cadastre ao menos um participante antes de registrar pagamentos."
          createEmpty={emptyPayment}
          columns={[
            { label: "Participante", render: (payment) => payment.participantName || "—" },
            { label: "Esperado", render: (payment) => formatCurrency(payment.expectedAmount) },
            { label: "Informado", render: (payment) => formatCurrency(payment.reportedAmount) },
            { label: "Status", render: (payment) => paymentStatusLabels[payment.status] },
            { label: "Data", render: (payment) => payment.paymentDate || "—" },
          ]}
          onSave={(payment) => mutate(() => eventApi.savePayment(payment, credential), "Pagamento salvo com sucesso.")}
          onDelete={(id) => mutate(() => eventApi.deletePayment(id, credential), "Pagamento excluído.")}
        />

        <AdminCrudSection
          title="Despesas" singular="Despesa" records={dashboard.expenses} fields={expenseFields} busy={busy} createEmpty={emptyExpense}
          columns={[
            { label: "Item", render: (expense) => <>{expense.item}<small className="cellDetail">{expense.category}</small></> },
            { label: "Fornecedor", render: (expense) => expense.supplier || "—" },
            { label: "Planejado", render: (expense) => formatCurrency(expense.plannedAmount) },
            { label: "Realizado", render: (expense) => formatCurrency(expense.actualAmount) },
            { label: "Status", render: (expense) => expenseStatusLabels[expense.status] },
          ]}
          onSave={(expense) => mutate(() => eventApi.saveExpense(expense, credential), "Despesa salva com sucesso.")}
          onDelete={(id) => mutate(() => eventApi.deleteExpense(id, credential), "Despesa excluída.")}
        />

        <AdminCrudSection
          title="Compras" singular="Compra" records={dashboard.purchases} fields={purchaseFields} busy={busy} createEmpty={emptyPurchase}
          columns={[
            { label: "Item", render: (purchase) => <>{purchase.item}<small className="cellDetail">{purchase.category}</small></> },
            { label: "Quantidade", render: (purchase) => `${purchase.quantity} ${purchase.unit}` },
            { label: "Responsável", render: (purchase) => purchase.responsible || "—" },
            { label: "Status", render: (purchase) => purchaseStatusLabels[purchase.status] },
          ]}
          onSave={(purchase) => mutate(() => eventApi.savePurchase(purchase, credential), "Compra salva com sucesso.")}
          onDelete={(id) => mutate(() => eventApi.deletePurchase(id, credential), "Compra excluída.")}
        />
      </>}
    </section>
  );
}
