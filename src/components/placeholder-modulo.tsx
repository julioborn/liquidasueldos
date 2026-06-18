interface PlaceholderModuloProps {
  titulo: string;
  descripcion: string;
}

export function PlaceholderModulo({ titulo, descripcion }: PlaceholderModuloProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium">{titulo}</h2>
      <p className="text-muted-foreground">{descripcion}</p>
      <p className="text-sm text-muted-foreground">Módulo en construcción.</p>
    </div>
  );
}
