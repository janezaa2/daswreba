type BadgeProps = {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
};

export function Badge({
  active,
  activeLabel = "აქტიური",
  inactiveLabel = "არააქტიური",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
