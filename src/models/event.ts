export type AttendanceStatus = "confirmed" | "maybe" | "declined";
export type PaymentStatus = "pending" | "reported" | "confirmed";

export interface EventConfig {
  eventName: string;
  eventSubtitle: string;
  eventDate: string;
  eventStartTime: string;
  eventEndTime: string;
  eventAddress: string;
  mapsUrl: string;
  pricePerAdult: number;
  pricePerChild: number;
  pixKey: string;
  paymentDeadline: string;
  confirmationDeadline: string;
  organizerName: string;
  organizerContact: string;
}

export interface ParticipantInput {
  name: string;
  email: string;
  phone: string;
  attendanceStatus: AttendanceStatus;
  adultGuests: number;
  childGuests: number;
  dietaryRestrictions: string;
  notes: string;
}

export interface PublicParticipant {
  id: string;
  displayName: string;
  attendanceStatus: AttendanceStatus;
  partySize: number;
}

export interface PublicSummary {
  confirmedParticipants: number;
  confirmedGuests: number;
  totalPeople: number;
  expectedRevenue: number;
  confirmedRevenue: number;
  plannedExpenses: number;
  actualExpenses: number;
}

export interface AdminParticipant extends ParticipantInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  participantId: string;
  participantName?: string;
  expectedAmount: number;
  reportedAmount: number;
  status: PaymentStatus;
  paymentDate: string;
  notes: string;
}

export interface Expense {
  id: string;
  item: string;
  category: string;
  supplier: string;
  plannedAmount: number;
  actualAmount: number;
  status: string;
  notes: string;
}

export interface Purchase {
  id: string;
  item: string;
  category: string;
  quantity: number;
  unit: string;
  responsible: string;
  status: string;
  notes: string;
}

export interface AdminDashboard {
  summary: PublicSummary;
  participants: AdminParticipant[];
  payments: Payment[];
  expenses: Expense[];
  purchases: Purchase[];
}
