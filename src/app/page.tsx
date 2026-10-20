"use client";

import Link from "next/link";
import { useEvent } from "@/components/EventProvider";
import { formatCurrency, formatDate } from "@/lib/format";

export default function HomePage() {
  const { config, summary, warning } = useEvent();
  const wazeUrl = config.eventAddress
    ? `https://waze.com/ul?q=${encodeURIComponent(config.eventAddress)}&navigate=yes&utm_source=churrasco_poli_30_anos`
    : "";
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
        <article>
          <span className="factIcon">03</span>
          <small>LOCAL</small>
          <strong>{config.eventAddress}</strong>
          {wazeUrl && <a className="factLink" href={wazeUrl} target="_blank" rel="noopener noreferrer">Abrir no Waze</a>}
        </article>
        <article>
          <span className="factIcon">04</span>
          <small>CONTRIBUIÇÃO</small>
          <strong>
            {config.pricePerAdult ? `${formatCurrency(config.pricePerAdult)} por adulto` : "A confirmar"}
            <br />
            Crianças: {config.pricePerChild ? formatCurrency(config.pricePerChild) : "grátis"}
          </strong>
        </article>
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
