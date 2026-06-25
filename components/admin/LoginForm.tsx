"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(event: any) {
    event.preventDefault();
    setError(""); setLoading(true);
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(formData)) });
    setLoading(false);
    if (!response.ok) { setError("Login failed."); return; }
    router.push("/admin"); router.refresh();
  }
  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <input name="email" type="email" placeholder="Email" required className="input" />
      <input name="password" type="password" placeholder="Password" required className="input" />
      <button type="submit" disabled={loading} className="btn primary">{loading ? "Signing in..." : "Sign in"}</button>
    </form>
  );
}
