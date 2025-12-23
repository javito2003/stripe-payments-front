import { Navbar } from '@/components/Navbar';

export function Shell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <>
      <Navbar />
      <div style={{ height: 16 }} />
      <div className="card">
        <h1 className="h1">{title}</h1>
        {subtitle ? <p className="muted" style={{ marginTop: 0 }}>{subtitle}</p> : null}
      </div>
      <div style={{ height: 16 }} />
      {children}
    </>
  );
}
