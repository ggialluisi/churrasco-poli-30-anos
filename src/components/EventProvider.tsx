"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { defaultEventConfig, emptySummary } from "@/config/defaults";
import type { EventConfig, PublicSummary } from "@/models/event";
import { eventApi } from "@/services/event-api";

type EventContextValue = { config: EventConfig; summary: PublicSummary; loading: boolean; warning: string };
const EventContext = createContext<EventContextValue>({ config: defaultEventConfig, summary: emptySummary, loading: true, warning: "" });

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState(defaultEventConfig);
  const [summary, setSummary] = useState(emptySummary);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    Promise.all([eventApi.getConfig(), eventApi.getSummary()])
      .then(([nextConfig, nextSummary]) => { setConfig(nextConfig); setSummary(nextSummary); })
      .catch((error: Error) => setWarning(error.message))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({ config, summary, loading, warning }), [config, summary, loading, warning]);
  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEvent() { return useContext(EventContext); }
