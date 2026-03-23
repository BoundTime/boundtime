import { Container } from "@/components/Container";
import { AuthForm } from "@/components/AuthForm";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";

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
