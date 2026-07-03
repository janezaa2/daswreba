export function FingerprintIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 11c0 3.5-.3 6.4-1.6 9" />
      <path d="M8.5 20a17.6 17.6 0 0 0 1.7-8" />
      <path d="M5.6 17.5c.6-1.8.9-3.6.9-6.5a5.5 5.5 0 0 1 11 0c0 .8-.05 1.5-.13 2.2" />
      <path d="M15.5 20a24.5 24.5 0 0 0 .5-4.5" />
      <path d="M3.3 14c.13-.9.2-1.85.2-3a8.5 8.5 0 0 1 17 0c0 .3 0 .6-.02.9" />
      <path d="M9 11a3 3 0 0 1 6 0c0 3.2-.3 5.7-1 7.9" />
      <path d="M12 3a8.5 8.5 0 0 0-4.5 1.3" />
    </svg>
  );
}
