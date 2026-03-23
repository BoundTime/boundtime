import { Container } from "@/components/Container";
import { AuthForm } from "@/components/AuthForm";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";

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
