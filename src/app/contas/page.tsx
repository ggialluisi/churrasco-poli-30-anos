"use client";

import { useEvent } from "@/components/EventProvider";
import { formatCurrency } from "@/lib/format";

export default function AccountsPage() {
  const { config, summary } = useEvent();
  const remaining = summary.confirmedRevenue - summary.actualExpenses;
  return (
    <section className="pageShell">
      <div className="pageIntro"><div className="eyebrow dark">TRANSPARÊNCIA</div><h1>Prestação de contas</h1><p>Valores informativos atualizados pela comissão. Os pagamentos são realizados externamente via PIX.</p></div>
      <div className="moneyGrid">
        <article><small>ARRECADAÇÃO PREVISTA</small><strong>{formatCurrency(summary.expectedRevenue)}</strong></article>
        <article><small>PAGAMENTOS CONFIRMADOS</small><strong>{formatCurrency(summary.confirmedRevenue)}</strong></article>
        <article><small>DESPESAS REALIZADAS</small><strong>{formatCurrency(summary.actualExpenses)}</strong></article>
        <article className={remaining < 0 ? "negative" : "accent"}><small>SALDO ATUAL</small><strong>{formatCurrency(remaining)}</strong></article>
      </div>
      <div className="infoCard"><div><small>PIX PARA PAGAMENTO</small><strong>{config.pixKey}</strong></div><div><small>PRAZO</small><strong>{config.paymentDeadline || "A confirmar"}</strong></div></div>
      <p className="privacyNote">Este site não processa pagamentos nem consulta contas bancárias. A comissão registra manualmente os valores recebidos.</p>
    </section>
  );
}
