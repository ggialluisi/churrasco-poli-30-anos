"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { AdminDashboard } from "@/models/event";
import { eventApi } from "@/services/event-api";

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function AdminPage() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState("");
  const [googleReady, setGoogleReady] = useState(false);

  const initialize = useCallback(() => {
    if (!clientId || !window.google || !buttonRef.current) return;
    window.google.accounts.id.initialize({ client_id: clientId, callback: ({ credential }) => {
      setError("");
      eventApi.getAdminDashboard(credential).then(setDashboard).catch((e: Error) => setError(e.message));
    }});
    buttonRef.current.replaceChildren();
    window.google.accounts.id.renderButton(buttonRef.current, { theme: "outline", size: "large", text: "signin_with", locale: "pt-BR" });
  }, []);

  useEffect(() => { if (googleReady) initialize(); }, [googleReady, initialize]);

  if (!clientId) return <section className="pageShell narrow"><div className="pageIntro"><div className="eyebrow dark">ORGANIZAÇÃO</div><h1>Área administrativa</h1></div><div className="notice">Configure <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> para habilitar o acesso administrativo.</div></section>;

  return (
    <section className="pageShell">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={() => setGoogleReady(true)} />
      <div className="pageIntro"><div className="eyebrow dark">ORGANIZAÇÃO</div><h1>Painel administrativo</h1><p>Entre com a conta Google autorizada para ver contatos e informações operacionais.</p></div>
      {!dashboard && <div className="loginCard"><div ref={buttonRef} /><p>Somente o Gmail definido no Apps Script terá acesso.</p>{error && <div className="formMessage error">{error}</div>}</div>}
      {dashboard && <>
        <div className="moneyGrid compact">
          <article><small>PESSOAS</small><strong>{dashboard.summary.totalPeople}</strong></article>
          <article><small>RECEBIDO</small><strong>{formatCurrency(dashboard.summary.confirmedRevenue)}</strong></article>
          <article><small>DESPESAS</small><strong>{formatCurrency(dashboard.summary.actualExpenses)}</strong></article>
          <article className="accent"><small>COMPRAS</small><strong>{dashboard.purchases.length}</strong></article>
        </div>
        <div className="adminSection"><h2>Participantes</h2><div className="tableWrap"><table><thead><tr><th>Nome</th><th>Contato</th><th>Resposta</th><th>Grupo</th><th>Restrições</th></tr></thead><tbody>{dashboard.participants.map((p) => <tr key={p.id}><td>{p.name}</td><td>{p.email}<br /><small>{p.phone}</small></td><td>{p.attendanceStatus}</td><td>{1 + p.adultGuests + p.childGuests}</td><td>{p.dietaryRestrictions || "—"}</td></tr>)}</tbody></table></div></div>
        <div className="adminColumns"><div className="adminSection"><h2>Despesas</h2>{dashboard.expenses.length ? dashboard.expenses.map((e) => <div className="listRow" key={e.id}><span>{e.item}<small>{e.category}</small></span><strong>{formatCurrency(e.actualAmount || e.plannedAmount)}</strong></div>) : <p>Nenhuma despesa cadastrada.</p>}</div><div className="adminSection"><h2>Compras</h2>{dashboard.purchases.length ? dashboard.purchases.map((p) => <div className="listRow" key={p.id}><span>{p.item}<small>{p.responsible || "Sem responsável"}</small></span><strong>{p.quantity} {p.unit}</strong></div>) : <p>Nenhuma compra cadastrada.</p>}</div></div>
      </>}
    </section>
  );
}
