"use client";

import { useState, type ReactNode } from "react";

export type AdminField<T> = {
  key: keyof T;
  label: string;
  type?: "text" | "number" | "date" | "textarea" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
  min?: number;
  step?: number;
  placeholder?: string;
  full?: boolean;
};

export type AdminColumn<T> = {
  label: string;
  render: (record: T) => ReactNode;
};

type Props<T extends { id: string }> = {
  title: string;
  singular: string;
  records: T[];
  columns: AdminColumn<T>[];
  fields: AdminField<T>[];
  createEmpty: () => T;
  busy: boolean;
  canCreate?: boolean;
  createBlockedMessage?: string;
  onSave: (record: T) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function AdminCrudSection<T extends { id: string }>({
  title,
  singular,
  records,
  columns,
  fields,
  createEmpty,
  busy,
  canCreate = true,
  createBlockedMessage,
  onSave,
  onDelete,
}: Props<T>) {
  const [draft, setDraft] = useState<T | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    try {
      await onSave(draft);
      setDraft(null);
    } catch {
      // The parent displays the API error and the editor remains open.
    }
  }

  async function remove(record: T) {
    if (!window.confirm(`Excluir este registro de ${singular.toLowerCase()}?`)) return;
    try {
      await onDelete(record.id);
      if (draft?.id === record.id) setDraft(null);
    } catch {
      // The parent displays the API error and preserves the current state.
    }
  }

  return (
    <section className="adminSection adminCrud">
      <div className="adminToolbar">
        <div>
          <h2>{title}</h2>
          <p>{records.length} {records.length === 1 ? "registro" : "registros"}</p>
        </div>
        <button className="button primary small" disabled={busy || !canCreate} onClick={() => setDraft(createEmpty())}>
          Adicionar {singular.toLowerCase()}
        </button>
      </div>

      {!canCreate && createBlockedMessage && <div className="notice compact">{createBlockedMessage}</div>}

      <div className="tableWrap">
        <table>
          <thead><tr>{columns.map((column) => <th key={column.label}>{column.label}</th>)}<th>Ações</th></tr></thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                {columns.map((column) => <td key={column.label}>{column.render(record)}</td>)}
                <td><div className="rowActions">
                  <button className="textButton" disabled={busy} onClick={() => setDraft({ ...record })}>Editar</button>
                  <button className="textButton danger" disabled={busy} onClick={() => remove(record)}>Excluir</button>
                </div></td>
              </tr>
            ))}
            {!records.length && <tr><td className="emptyCell" colSpan={columns.length + 1}>Nenhum registro cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>

      {draft && (
        <form className="adminEditor" onSubmit={submit}>
          <h3>{draft.id ? `Editar: ${singular}` : `Adicionar: ${singular}`}</h3>
          <div className="adminEditorGrid">
            {fields.map((field) => {
              const value = String(draft[field.key] ?? "");
              const update = (next: string) => setDraft((current) => current ? ({
                ...current,
                [field.key]: field.type === "number" ? Number(next) : next,
              } as T) : current);
              return <div className={`field ${field.full ? "full" : ""}`} key={String(field.key)}>
                <label htmlFor={`${title}-${String(field.key)}`}>{field.label}</label>
                {field.type === "textarea" ? (
                  <textarea id={`${title}-${String(field.key)}`} rows={3} value={value} required={field.required} placeholder={field.placeholder} onChange={(event) => update(event.target.value)} />
                ) : field.type === "select" ? (
                  <select id={`${title}-${String(field.key)}`} value={value} required={field.required} onChange={(event) => update(event.target.value)}>
                    {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                ) : (
                  <input id={`${title}-${String(field.key)}`} type={field.type || "text"} value={value} required={field.required} min={field.min} step={field.step} placeholder={field.placeholder} onChange={(event) => update(event.target.value)} />
                )}
              </div>;
            })}
          </div>
          <div className="editorActions">
            <button className="button primary" disabled={busy}>{busy ? "Salvando..." : "Salvar"}</button>
            <button className="button outline" type="button" disabled={busy} onClick={() => setDraft(null)}>Cancelar</button>
          </div>
        </form>
      )}
    </section>
  );
}
