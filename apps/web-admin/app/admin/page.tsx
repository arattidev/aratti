import Link from "next/link";

import { fetchBackend } from "../../src/lib/backend-api";

interface PendingBusiness {
  id: string;
  name: string;
  category: string;
  city: string;
  province: string;
  createdAt: string;
}

export default async function AdminPage() {
  let pendingBusinesses: PendingBusiness[] = [];
  let errorMessage = "";

  try {
    const data = await fetchBackend<{ data: PendingBusiness[] }>("/api/admin/businesses/pending");
    pendingBusinesses = data.data;
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "No se pudo cargar pending businesses";
  }

  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px 72px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 48 }}>Admin Console</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/admin/refunds" style={pillLink}>
            Refunds
          </Link>
          <Link href="/admin/fraud" style={pillLink}>
            Fraude
          </Link>
        </div>
      </header>

      <section style={{ borderRadius: 20, padding: 22, background: "var(--surface-lowest)" }}>
        <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 30 }}>Locales pendientes de verificación</h2>

        {errorMessage ? <p style={{ color: "var(--error)" }}>{errorMessage}</p> : null}

        {pendingBusinesses.length === 0 ? (
          <p style={{ color: "#5c5c5c", margin: 0 }}>No hay locales pendientes por ahora.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {pendingBusinesses.map((item) => (
              <article
                key={item.id}
                style={{
                  borderRadius: 14,
                  background: "var(--surface-low)",
                  padding: "14px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div>
                  <strong style={{ fontSize: 20 }}>{item.name}</strong>
                  <p style={{ margin: "4px 0 0", color: "#5f5f5f" }}>
                    {item.category} · {item.city}, {item.province}
                  </p>
                </div>
                <button style={approveButton}>Verificar</button>
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

const approveButton: React.CSSProperties = {
  minHeight: 40,
  borderRadius: 10,
  border: "none",
  background: "var(--primary)",
  color: "#382f00",
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: 1,
  textTransform: "uppercase",
  padding: "0 14px",
};
