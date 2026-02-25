import { Container } from "@/components/Container";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <Container className="py-16">
      <div className="flex flex-col items-center">
        <AuthForm mode="login" />
      </div>
    </Container>
  );
}
