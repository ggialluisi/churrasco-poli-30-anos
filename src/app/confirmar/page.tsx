"use client";

import { FormEvent, useState } from "react";
import type { AttendanceStatus, ParticipantInput } from "@/models/event";
import { eventApi } from "@/services/event-api";

const initial: ParticipantInput = { name: "", email: "", phone: "", attendanceStatus: "confirmed", adultGuests: 0, childGuests: 0, dietaryRestrictions: "", notes: "" };

export default function ConfirmPage() {
  const [form, setForm] = useState(initial);
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const set = <K extends keyof ParticipantInput>(key: K, value: ParticipantInput[K]) => setForm((old) => ({ ...old, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault(); setState("sending"); setMessage("");
    try {
      await eventApi.confirmAttendance(form);
      setState("success"); setMessage("Presença registrada! A organização já recebeu sua resposta."); setForm(initial);
    } catch (error) { setState("error"); setMessage(error instanceof Error ? error.message : "Não foi possível enviar."); }
  }

  return (
    <section className="pageShell narrow">
      <div className="pageIntro"><div className="eyebrow dark">CONFIRMAÇÃO</div><h1>Você vem?</h1><p>Preencha uma resposta por família. Os contatos serão vistos somente pela organização.</p></div>
      <form className="formCard" onSubmit={submit}>
        <div className="field full"><label htmlFor="name">Nome completo</label><input id="name" required value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div className="field"><label htmlFor="email">E-mail</label><input id="email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
        <div className="field"><label htmlFor="phone">Telefone / WhatsApp</label><input id="phone" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
        <fieldset className="field full"><legend>Resposta</legend><div className="choiceRow">
          {[["confirmed", "Sim, estarei lá"], ["maybe", "Ainda não sei"], ["declined", "Não poderei ir"]].map(([value, label]) => <label className="choice" key={value}><input type="radio" name="attendance" checked={form.attendanceStatus === value} onChange={() => set("attendanceStatus", value as AttendanceStatus)} />{label}</label>)}
        </div></fieldset>
        <div className="field"><label htmlFor="adults">Acompanhantes adultos</label><input id="adults" type="number" min="0" max="10" value={form.adultGuests} onChange={(e) => set("adultGuests", Number(e.target.value))} /></div>
        <div className="field"><label htmlFor="children">Crianças</label><input id="children" type="number" min="0" max="10" value={form.childGuests} onChange={(e) => set("childGuests", Number(e.target.value))} /></div>
        <div className="field full"><label htmlFor="diet">Restrições alimentares</label><textarea id="diet" rows={3} value={form.dietaryRestrictions} onChange={(e) => set("dietaryRestrictions", e.target.value)} placeholder="Vegetariano, alergias, intolerâncias..." /></div>
        <div className="field full"><label htmlFor="notes">Observações</label><textarea id="notes" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
        {message && <div className={`formMessage ${state}`}>{message}</div>}
        <button className="button primary" disabled={state === "sending"}>{state === "sending" ? "Enviando..." : "Enviar confirmação"}</button>
      </form>
    </section>
  );
}
