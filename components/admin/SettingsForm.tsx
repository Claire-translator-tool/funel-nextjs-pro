"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSetting } from "@/lib/types";

type SettingsFormProps = {
  settings: SiteSetting[];
};

export default function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 text-left"
    >
      {settings.map((item) => (
        <label key={item.key} className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">{item.key}</span>
          <input
            name={item.key}
            defaultValue={item.value}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </label>
      ))}
      <div className="text-right">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-green-700 px-5 py-2 font-bold text-white hover:bg-green-800 disabled:bg-slate-400"
        >
          {saving ? "Saving..." : "Save settings"}
        </button>
      </div>
    </form>
  );
}
