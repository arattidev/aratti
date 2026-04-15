import Link from "next/link";

import { fetchBackend } from "../../../src/lib/backend-api";

interface FraudFlag {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  riskScore: number;
  createdAt: string;
}

export default async function AdminFraudPage() {
  let flags: FraudFlag[] = [];
  let errorMessage = "";

  try {
    const data = await fetchBackend<{ data: FraudFlag[] }>("/api/admin/fraud/flags");
    flags = data.data;
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "No se pudo cargar señales de fraude";
  }

  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px 72px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 44 }}>Fraud flags</h1>
        <Link href="/admin" style={pillLink}>
          Volver
        </Link>
      </header>

      <section style={{ borderRadius: 20, padding: 20, background: "var(--surface-lowest)" }}>
        {errorMessage ? <p style={{ color: "var(--error)" }}>{errorMessage}</p> : null}

        {flags.length === 0 ? (
          <p style={{ margin: 0, color: "#5d5d5d" }}>No hay flags críticas en este momento.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {flags.map((flag) => (
              <article
                key={flag.id}
                style={{
                  borderRadius: 14,
                  background: "var(--surface-low)",
                  padding: "14px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{flag.action}</strong>
                  <p style={{ margin: "4px 0 0", color: "#5c5c5c" }}>
                    {flag.entityType} · {flag.entityId}
                  </p>
                </div>
                <span style={{ fontWeight: 700, color: flag.riskScore >= 80 ? "var(--error)" : "#9a7f00" }}>
                  RISK {flag.riskScore}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

const pillLink: React.CSSProperties = {
  minHeight: 42,
  padding: "0 14px",
  borderRadius: 999,
  background: "var(--surface-low)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: 1,
  textTransform: "uppercase",
};
