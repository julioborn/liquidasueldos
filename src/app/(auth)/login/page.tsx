import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-16">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Iniciar sesión</h1>
        <p className="text-sm text-muted-foreground">Liquidasueldos — uso interno del estudio</p>
      </div>
      <LoginForm />
    </main>
  );
}
