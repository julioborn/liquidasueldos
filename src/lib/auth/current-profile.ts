import { createClient } from "@/lib/supabase/server";

export type Rol = "administrador" | "liquidador" | "consulta";

export interface Profile {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
}

/** Usuario autenticado + su perfil (profiles.nombre/rol). Null si no hay sesión. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre, rol")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    nombre: profile.nombre,
    rol: profile.rol as Rol,
  };
}
