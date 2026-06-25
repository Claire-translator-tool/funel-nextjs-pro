"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Inquiry, InquiryNote, LeadStatus } from "@/lib/types";

type InquiryBoardProps = {
  inquiries: Inquiry[];
  notesByInquiry: Record<string, InquiryNote[]>;
};

const statuses: Array<{ value: LeadStatus; label: string }> = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "Following" },
  { value: "won", label: "Won" },
];

export default function InquiryBoard({
  inquiries,
  notesByInquiry,
}: InquiryBoardProps) {
  const router = useRouter();
  const [saving, setSaving] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesStatus =
      statusFilter === "all" || inquiry.status === statusFilter;
    const searchable = [
      inquiry.name,
      inquiry.email,
      inquiry.company,
      inquiry.country,
      inquiry.product_interest,
      inquiry.message,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matchesStatus && (!normalizedQuery || searchable.includes(normalizedQuery));
  });

  async function updateStatus(id: string, status: LeadStatus) {
    setSaving(id);
    await fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaving("");
    router.refresh();
  }

  async function addNote(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const note = String(formData.get("note") || "").trim();

    if (!note) {
      return;
    }

    setSaving(id);
    await fetch(`/api/admin/inquiries/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    form.reset();
    setSaving("");
    router.refresh();
  }

  if (!inquiries.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">
        No inquiries yet. New form submissions will appear here after Supabase
        is configured.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[1fr_220px]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Search name, email, company, country, product, or message"
        />
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as LeadStatus | "all")
          }
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="all">All statuses</option>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {!filteredInquiries.length ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
          No inquiries match the current filter.
        </div>
      ) : null}

      {filteredInquiries.map((inquiry) => (
        <article
          key={inquiry.id}
          className="rounded-lg border border-slate-200 bg-white p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-green-950">
                  {inquiry.name}
                </h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600">
                  {inquiry.status.replace("_", " ")}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {new Date(inquiry.created_at).toLocaleString()} ·{" "}
                {inquiry.country}
              </p>
            </div>
            <select
              value={inquiry.status}
              disabled={saving === inquiry.id}
              onChange={(event) =>
                updateStatus(inquiry.id, event.target.value as LeadStatus)
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold lg:w-40"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="font-semibold text-slate-500">Email</p>
              <a
                href={`mailto:${inquiry.email}`}
                className="break-words font-bold text-green-800"
              >
                {inquiry.email}
              </a>
            </div>
            <div>
              <p className="font-semibold text-slate-500">Company</p>
              <p className="text-slate-800">{inquiry.company || "-"}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-500">Product</p>
              <p className="text-slate-800">{inquiry.product_interest || "-"}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-500">Quantity</p>
              <p className="text-slate-800">{inquiry.quantity || "-"}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-500">Phone</p>
              <p className="text-slate-800">{inquiry.phone || "-"}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-500">WhatsApp</p>
              <p className="text-slate-800">{inquiry.whatsapp || "-"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="font-semibold text-slate-500">Source</p>
              <p className="text-slate-800">{inquiry.source_page || "-"}</p>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            <p className="mb-2 font-semibold text-slate-500">Project details</p>
            <p className="whitespace-pre-wrap">{inquiry.message}</p>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-sm font-bold text-green-950">Notes</p>
            <div className="grid gap-2">
              {(notesByInquiry[inquiry.id] || []).map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border border-slate-200 bg-white p-3 text-sm"
                >
                  <p className="whitespace-pre-wrap text-slate-700">{note.note}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {note.created_by || "Admin"} ·{" "}
                    {new Date(note.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <form
              onSubmit={(event) => addNote(event, inquiry.id)}
              className="mt-3 flex flex-col gap-2 sm:flex-row"
            >
              <input
                name="note"
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Add follow-up note"
              />
              <button
                type="submit"
                disabled={saving === inquiry.id}
                className="rounded-lg bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800 disabled:bg-slate-400"
              >
                Add note
              </button>
            </form>
          </div>
        </article>
      ))}
    </div>
  );
    }
