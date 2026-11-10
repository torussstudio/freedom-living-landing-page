import { CONTACT } from "../data/content.js";

/**
 * Sends a lead to /api/lead (which saves it to the Google Sheet and emails the team).
 * Resolves { ok: true } or { ok: false, message } with a message that is safe to show visitors.
 */
export async function postLead(lead, honeypot = "") {
  try {
    const r = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...lead, company: honeypot }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.ok) throw new Error(data.error || "send failed");
    return { ok: true };
  } catch {
    return {
      ok: false,
      message: `Sorry, we couldn't send that just now. Please try again, or call / WhatsApp us on ${CONTACT.phone}.`,
    };
  }
}
