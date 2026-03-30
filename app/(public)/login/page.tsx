import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { AuthForm } from "@/components/AuthForm";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { SITE_NAME } from "@/lib/seo/site-config";

export const metadata: Metadata = {
  title: "Anmelden",
  description: `Anmeldung bei ${SITE_NAME} mit E-Mail und Passwort.`,
  alternates: { canonical: "/login" },
  openGraph: { title: `Anmelden · ${SITE_NAME}` },
};

export default function LoginPage() {
  return (
    <Container className="py-12 md:py-16">
      <div className="mx-auto w-full max-w-md">
        <PublicPageHeader
          title="Anmelden"
          subtitle="Willkommen zurück – mit E-Mail und Passwort einloggen."
        />
        <AuthForm mode="login" />
      </div>
    </Container>
  );
}
