import type { EventConfig } from "@/models/event";

export const defaultEventConfig: EventConfig = {
  eventName: "POLI — Engenharia Química",
  eventSubtitle: "Churrasco de 30 anos de formados",
  eventDate: "",
  eventStartTime: "12:00",
  eventEndTime: "20:00",
  eventAddress: "Local a confirmar",
  mapsUrl: "",
  pricePerAdult: 0,
  pricePerChild: 0,
  pixKey: "A confirmar",
  paymentDeadline: "",
  confirmationDeadline: "",
  organizerName: "Comissão organizadora",
  organizerContact: "",
};

export const emptySummary = {
  confirmedParticipants: 0,
  confirmedGuests: 0,
  totalPeople: 0,
  expectedRevenue: 0,
  confirmedRevenue: 0,
  plannedExpenses: 0,
  actualExpenses: 0,
};
