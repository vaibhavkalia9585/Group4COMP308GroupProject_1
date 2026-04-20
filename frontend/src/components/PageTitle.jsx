export default function PageTitle({ label, title, children }) {
  return (
    <div className="mb-8">
      {label && (
        <p className="mb-2 font-mono text-label uppercase tracking-widest text-text-secondary">
          {label}
        </p>
      )}
      <h1 className="text-display-lg font-semibold text-text-primary">{title}</h1>
      {children && <div className="mt-2 text-body text-text-secondary">{children}</div>}
    </div>
  );
}
