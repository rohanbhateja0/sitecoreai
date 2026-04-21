"use client";

import { useState } from "react";
import { getEngageBrowser } from "@/lib/engage/engage-browser";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type PropertyListingsIdentityFormProps = {
  locale: string;
};

/**
 * Collects email and sends a CDP IDENTITY event via Engage so the browser guest can be linked as a known customer.
 */
export function PropertyListingsIdentityForm({ locale }: PropertyListingsIdentityFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  if (!process.env.NEXT_PUBLIC_CDP_CLIENT_KEY) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }

    setStatus("submitting");
    setMessage(null);

    try {
      const engage = await getEngageBrowser();
      const pointOfSale = process.env.NEXT_PUBLIC_CDP_POINT_OF_SALE ?? "CBRE";

      await engage.identity(
        {
          channel: "WEB",
          currency: "USD",
          language: locale,
          page: "Property Listings",
          pointOfSale,
          email: trimmed,
          identifiers: [{ id: trimmed.toLowerCase(), provider: "email" }],
        },
        { source: "property_listings_email_form" }
      );

      setStatus("success");
      setMessage("Thanks — your profile has been saved.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="mb-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">Stay in the loop</p>
      <p className="mt-1 text-sm text-slate-600">
        Enter your email to save this session to your profile in CDP.
      </p>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSubmit}>
        <label className="min-w-0 flex-1 text-sm text-slate-700">
          <span className="sr-only">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            disabled={status === "submitting"}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-emerald-600 focus:border-emerald-600 focus:ring-2 disabled:bg-slate-50"
          />
        </label>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="shrink-0 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {status === "submitting" ? "Saving…" : "Submit"}
        </button>
      </form>
      {message ? (
        <p
          className={`mt-3 text-sm ${status === "success" ? "text-emerald-800" : "text-red-700"}`}
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
