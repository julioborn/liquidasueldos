import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { NavLinks } from "@/components/nav-links";
import { logout } from "./actions";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const initials = profile.nombre
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
            <span className="text-sm font-bold text-primary-foreground">$</span>
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Liquidasueldos</p>
            <p className="text-xs text-muted-foreground">Estudio contable</p>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>

        {/* User */}
        <div className="border-t border-border p-3">
          <div className="rounded-xl bg-muted px-3 py-2.5">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <span className="text-xs font-semibold text-primary">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{profile.nombre}</p>
                <p className="text-xs capitalize text-muted-foreground">{profile.rol}</p>
              </div>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="text-xs text-muted-foreground transition-colors hover:text-destructive"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
