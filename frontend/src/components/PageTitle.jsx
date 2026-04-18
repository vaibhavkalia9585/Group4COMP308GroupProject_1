export default function PageTitle({ label, title, children }) {
  return (
    <div className="mb-8">
      {label && (
        <p className="mb-2 font-mono text-label uppercase tracking-widest text-ink-mute">
          {label}
        </p>
      )}
      <h1 className="font-semibold text-ink text-display-lg">{title}</h1>
      {children && <div className="mt-2 text-body text-ink-mute">{children}</div>}
    </div>
  );
}
