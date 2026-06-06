interface ImpostorCardProps {
  name: string;
  label: string;
}

export function ImpostorCard(props: ImpostorCardProps) {
  const { name, label } = props;

  return (
    <div className="rounded-2xl border border-primary/30 bg-accent p-4 text-accent-foreground">
      <span className="text-sm">{label}</span>
      <p className="font-display text-2xl">{name}</p>
    </div>
  );
}
