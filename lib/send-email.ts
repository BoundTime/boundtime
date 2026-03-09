/**
 * E-Mail-Versand für Cuckymode (Bestätigung, Passwort vergessen).
 * Nutzt entweder Resend (API) oder SMTP (z. B. IONOS).
 *
 * Resend: RESEND_API_KEY + optional RESEND_FROM_EMAIL
 * SMTP (IONOS etc.): SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */

export type SendEmailOptions = {
  to: string;
  subject: string;
  text: string;
  from?: string;
};

export async function sendEmail(options: SendEmailOptions): Promise<{ ok: boolean; error?: string }> {
  const { to, subject, text, from } = options;

  // 1. Resend (wenn API-Key gesetzt)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const fromEmail = from ?? process.env.RESEND_FROM_EMAIL ?? "noreply@boundtime.app";
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({ from: fromEmail, to: [to], subject, text }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("Resend sendEmail:", res.status, err);
        return { ok: false, error: "E-Mail konnte nicht versendet werden" };
      }
      return { ok: true };
    } catch (e) {
      console.error("Resend sendEmail:", e);
      return { ok: false, error: "E-Mail konnte nicht versendet werden" };
    }
  }

  // 2. SMTP (z. B. IONOS)
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (smtpHost && smtpUser && smtpPass) {
    try {
      const nodemailer = await import("nodemailer");
      const port = Number(process.env.SMTP_PORT) || 587;
      const secure = process.env.SMTP_SECURE === "true";
      const fromEmail = from ?? process.env.SMTP_FROM ?? smtpUser;
      const transporter = nodemailer.default.createTransport({
        host: smtpHost,
        port,
        secure,
        requireTLS: port === 587,
        auth: { user: smtpUser, pass: smtpPass },
      });
      await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        text,
      });
      return { ok: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("SMTP sendEmail:", msg, e);
      return { ok: false, error: `E-Mail konnte nicht versendet werden. ${msg}` };
    }
  }

  // Kein E-Mail-Dienst konfiguriert
  return { ok: true };
}
