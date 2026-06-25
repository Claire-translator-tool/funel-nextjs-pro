"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CmsCaseStudy } from "@/lib/types";

type CasesManagerProps = {
  cases: CmsCaseStudy[];
};

function formToPayload(form: HTMLFormElement) {
  const formData = new FormData(form);

  return {
    title: formData.get("title"),
    industry: formData.get("industry"),
    product_slug: formData.get("product_slug"),
    summary: formData.get("summary"),
    result: formData.get("result"),
    image_url: formData.get("image_url"),
    published: formData.get("published") === "on",
  };
}

export default function CasesManager({ cases }: CasesManagerProps) {
  const router = useRouter();
  const [saving, setSaving] = useState("");

  async function saveCase(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const id = form.dataset.id;
    setSaving(id || "new");

    await fetch(id ? `/api/admin/cases/${id}` : "/api/admin/cases", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formToPayload(form)),
    });

    setSaving("");
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-green-200 bg-green-50 p-5">
        <h2 className="mb-4 text-xl font-bold text-green-950">Add case</h2>
        <CaseForm onSubmit={saveCase} saving={saving === "new"} />
      </section>
      {cases.map((item) => (
        <section
          key={item.id || item.title}
          className="rounded-lg border border-slate-200 bg-white p-5"
        >
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-green-950">
                {item.title}
              </h2>
              <p className="text-sm text-slate-500">{item.industry}</p>
            </div>
            {!item.id ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                Seed fallback
              </span>
            ) : null}
          </div>
          <CaseForm
            item={item}
            onSubmit={saveCase}
            saving={saving === item.id}
          />
        </section>
      ))}
    </div>
  );
}

function CaseForm({
  item,
  onSubmit,
  saving,
}: {
  item?: CmsCaseStudy;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  saving: boolean;
}) {
  return (
    <form data-id={item?.id} onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Title</span>
          <input
            required
            name="title"
            defaultValue={item?.title}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Industry</span>
          <input
            required
            name="industry"
            defaultValue={item?.industry}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
      </div>
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">
          Related product slug
        </span>
        <input
          name="product_slug"
          defaultValue={item?.product_slug || ""}
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">Summary</span>
        <textarea
          name="summary"
          rows={3}
          defaultValue={item?.summary || ""}
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">Result</span>
        <textarea
          required
          name="result"
          rows={4}
          defaultValue={item?.result}
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">Image URL</span>
        <input
          name="image_url"
          defaultValue={item?.image_url || ""}
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            name="published"
            defaultChecked={item?.published ?? true}
          />
          Published
        </label>
        <button
          type="submit"
          disabled={saving || (!item?.id && Boolean(item))}
          className="rounded-lg bg-green-700 px-5 py-2 font-bold text-white hover:bg-green-800 disabled:bg-slate-400"
        >
          {saving ? "Saving..." : item?.id ? "Save case" : "Create case"}
        </button>
      </div>
    </form>
  );
}
