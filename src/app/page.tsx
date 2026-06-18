import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-16 text-center">
      <h1 className="text-2xl font-semibold">Liquidasueldos</h1>
      <p className="max-w-md text-muted-foreground">
        Sistema interno de liquidación de sueldos y cargas sociales. Uso exclusivo del estudio.
      </p>
      <Link href="/login" className="underline">
        Iniciar sesión
      </Link>
    </main>
  );
}
