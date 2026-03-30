import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { AuthForm } from "@/components/AuthForm";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { SITE_NAME } from "@/lib/seo/site-config";

export const metadata: Metadata = {
  title: "Registrieren",
  description: `Kostenlose Registrierung bei der deutschsprachigen Community ${SITE_NAME}.`,
  alternates: { canonical: "/register" },
  openGraph: { title: `Registrieren · ${SITE_NAME}` },
};

export default function RegisterPage() {
  return (
    <Container className="py-12 md:py-16">
      <div className="mx-auto w-full max-w-md">
        <PublicPageHeader
          title="Registrieren"
          subtitle="In drei kurzen Schritten – du kannst jederzeit abbrechen und später weitermachen."
        />
        <AuthForm mode="register" />
      </div>
    </Container>
  );
}
