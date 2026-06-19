import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

const NAV = [
  { href: "/empresas", label: "Empresas" },
  { href: "/empleados", label: "Empleados" },
  { href: "/convenios", label: "Convenios" },
  { href: "/parametros", label: "Parámetros" },
  { href: "/periodos", label: "Períodos" },
  { href: "/liquidaciones", label: "Liquidaciones" },
];

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // El proxy ya redirige a /login sin sesión; este chequeo es la segunda
  // capa (cada página/Server Action verifica por su cuenta, no solo el proxy).
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("nombre, rol").eq("id", user.id).single();

  return (
    <div className="flex flex-1">
      <aside className="flex w-56 flex-col border-r p-4">
        <p className="mb-4 font-semibold">Liquidasueldos</p>
        <nav className="flex flex-col gap-2 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 pt-4 text-sm">
          <p className="truncate text-muted-foreground">
            {profile?.nombre ?? user.email} — {profile?.rol ?? "sin rol"}
          </p>
          <form action={logout}>
            <button type="submit" className="text-left hover:underline">
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
