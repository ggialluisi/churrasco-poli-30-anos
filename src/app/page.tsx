"use client";

import Link from "next/link";
import { useEvent } from "@/components/EventProvider";
import { formatCurrency, formatDate } from "@/lib/format";

export default function HomePage() {
  const { config, summary, warning } = useEvent();
  return (
    <>
      <section className="hero">
        <div className="eyebrow">REENCONTRO DA TURMA</div>
        <h1>Trinta anos merecem<br /><em>um grande encontro.</em></h1>
        <p>{config.eventName}<br />{config.eventSubtitle}</p>
        <div className="heroActions">
          <Link className="button primary" href="/confirmar">Confirmar presença</Link>
          <Link className="button secondary" href="/participantes">Ver quem vai</Link>
        </div>
      </section>

      {warning && <div className="notice">{warning} A página está exibindo os dados iniciais.</div>}

      <section className="factGrid" aria-label="Informações do evento">
        <article><span className="factIcon">01</span><small>DATA</small><strong>{formatDate(config.eventDate)}</strong></article>
        <article><span className="factIcon">02</span><small>HORÁRIO</small><strong>{config.eventStartTime} — {config.eventEndTime}</strong></article>
        <article><span className="factIcon">03</span><small>LOCAL</small><strong>{config.eventAddress}</strong></article>
        <article><span className="factIcon">04</span><small>VALOR POR ADULTO</small><strong>{config.pricePerAdult ? formatCurrency(config.pricePerAdult) : "A confirmar"}</strong></article>
      </section>

      <section className="section split">
        <div>
          <div className="eyebrow dark">NOSSA HISTÓRIA CONTINUA</div>
          <h2>Da sala de aula para uma tarde de boas histórias.</h2>
        </div>
        <div>
          <p>Confirme sua presença, acompanhe quem já está na lista e consulte a prestação de contas da organização.</p>
          <div className="stats">
            <div><strong>{summary.totalPeople}</strong><span>pessoas confirmadas</span></div>
            <div><strong>{summary.confirmedParticipants}</strong><span>colegas da turma</span></div>
          </div>
        </div>
      </section>
    </>
  );
}
