"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CmsPage } from "@/lib/types";

type PagesManagerProps = {
  pages: CmsPage[];
};

export default function PagesManager({ pages }: PagesManagerProps) {
  const router = useRouter();
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");

  async function savePage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const id = form.dataset.id;

    if (!id) {
      return;
    }

    const formData = new FormData(form);
    setSaving(id);
    const response = await fetch(`/api/admin/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        blocks: formData.get("blocks"),
        seo_title: formData.get("seo_title"),
        seo_description: formData.get("seo_description"),
        published: formData.get("published") === "on",
      }),
    });

    setSaving("");

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      setError(data.error || "Could not save page.");
      return;
    }

    router.refresh();
  }

  if (!pages.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-slate-600">
        No CMS pages yet.
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}
      {pages.map((page) => (
        <form
          key={page.id || page.slug}
          data-id={page.id}
          onSubmit={savePage}
          className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-green-950">{page.title}</h2>
              <p className="text-sm text-slate-500">/{page.slug}</p>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                name="published"
                defaultChecked={page.published !== false}
              />
              Published
            </label>
          </div>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Title</span>
            <input
              name="title"
              defaultValue={page.title}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Content blocks JSON
            </span>
            <textarea
              name="blocks"
              rows={10}
              defaultValue={JSON.stringify(page.blocks || {}, null, 2)}
              className="font-mono rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                SEO title
              </span>
              <input
                name="seo_title"
                defaultValue={page.seo_title || ""}
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                SEO description
              </span>
              <textarea
                name="seo_description"
                rows={2}
                defaultValue={page.seo_description || ""}
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          </div>
          <div className="text-right">
            <button
              type="submit"
              disabled={saving === page.id || !page.id}
              className="rounded-lg bg-green-700 px-5 py-2 font-bold text-white hover:bg-green-800 disabled:bg-slate-400"
            >
              {saving === page.id ? "Saving..." : "Save page"}
            </button>
          </div>
        </form>
      ))}
    </div>
  );
}
