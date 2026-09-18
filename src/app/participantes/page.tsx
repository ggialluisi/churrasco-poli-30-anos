"use client";

import { useEffect, useState } from "react";
import type { PublicParticipant } from "@/models/event";
import { eventApi } from "@/services/event-api";

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<PublicParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { eventApi.getParticipants().then(setParticipants).catch((e: Error) => setError(e.message)).finally(() => setLoading(false)); }, []);
  return (
    <section className="pageShell">
      <div className="pageIntro"><div className="eyebrow dark">LISTA DA TURMA</div><h1>Quem já confirmou</h1><p>A lista pública mostra apenas o nome e o total de pessoas de cada confirmação.</p></div>
      {loading ? <div className="emptyState">Carregando participantes...</div> : error ? <div className="notice">{error}</div> : participants.length === 0 ? <div className="emptyState"><strong>A lista começa aqui.</strong><p>As confirmações aparecerão após a integração com a planilha.</p></div> : (
        <div className="peopleGrid">{participants.map((person) => <article key={person.id}><span>{person.displayName.slice(0, 1)}</span><div><strong>{person.displayName}</strong><small>{person.partySize} {person.partySize === 1 ? "pessoa" : "pessoas"}</small></div></article>)}</div>
      )}
    </section>
  );
}
