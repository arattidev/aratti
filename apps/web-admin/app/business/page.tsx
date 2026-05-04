"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { fetchBackend } from "../../src/lib/backend-api";

interface AuthSession {
  accessToken: string;
  userId: string;
  role: string;
  expiresAt?: string;
}

interface BusinessContext {
  userId: string;
  role: string;
  businessIds: string[];
}

interface OfferRow {
  id: string;
  businessId: string;
  title: string;
  status: string;
  quantityAvailable: number;
  rescuePriceArs: number;
}

interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  totalArs: number;
  offerTitle: string;
}

interface AvailabilityRow {
  id: string;
  offerId: string;
  offerTitle: string;
  date: string;
  quantityPublished: number;
  quantityAvailable: number;
  status: string;
}

interface PayoutRow {
  id: string;
  amountArs: number;
  status: string;
  provider: string;
  createdAt: string;
}

const TOKEN_KEY = "aratti_business_token";

export default function BusinessPage() {
  const [token, setToken] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [availability, setAvailability] = useState<AvailabilityRow[]>([]);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [magicToken, setMagicToken] = useState("");

  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    name: "",
    businessName: "",
  });
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [offerForm, setOfferForm] = useState({
    title: "Surprise bag del día",
    description: "Pack sorpresa con excedentes frescos del día",
    category: "OTHER",
    originalPriceArs: 3500,
    rescuePriceArs: 1700,
    quantityTotal: 20,
  });
  const [availabilityForm, setAvailabilityForm] = useState({
    offerId: "",
    date: new Date().toISOString().slice(0, 10),
    quantityPublished: 10,
  });
  const [payoutForm, setPayoutForm] = useState({
    amountArs: 15000,
  });

  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_KEY);
    if (stored) {
      setToken(stored);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }
    void refreshDashboard(token);
  }, [token]);

  async function refreshDashboard(activeToken: string) {
    setLoading(true);
    try {
      const context = await fetchBackend<BusinessContext>("/api/auth/me", {
        token: activeToken,
      });

      const currentBusinessId = context.businessIds?.[0] ?? null;
      setBusinessId(currentBusinessId);

      const [offersData, ordersData, availabilityData, payoutsData] = await Promise.all([
        fetchBackend<{ data: OfferRow[] }>("/api/business/offers?limit=20", { token: activeToken }),
        fetchBackend<{ data: OrderRow[] }>("/api/business/orders?limit=20", { token: activeToken }),
        fetchBackend<{ data: AvailabilityRow[] }>("/api/business/availability?limit=30", { token: activeToken }),
        fetchBackend<{ data: PayoutRow[] }>("/api/business/payouts?limit=20", { token: activeToken }),
      ]);

      setOffers(offersData.data);
      setOrders(ordersData.data);
      setAvailability(availabilityData.data);
      setPayouts(payoutsData.data);

      const firstOffer = offersData.data.at(0);
      if (firstOffer) {
        setAvailabilityForm((prev) => ({ ...prev, offerId: firstOffer.id }));
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo cargar el dashboard");
    } finally {
      setLoading(false);
    }
  }

  function persistSession(session: AuthSession) {
    window.localStorage.setItem(TOKEN_KEY, session.accessToken);
    setToken(session.accessToken);
    setMessage("Sesión iniciada correctamente.");
  }

  async function register() {
    const session = await fetchBackend<AuthSession>("/api/auth/register", {
      method: "POST",
      body: registerForm,
    });
    persistSession(session);
  }

  async function login() {
    const session = await fetchBackend<AuthSession>("/api/auth/login", {
      method: "POST",
      body: loginForm,
    });
    persistSession(session);
  }

  async function loginGoogleMock() {
    const session = await fetchBackend<AuthSession>("/api/auth/oauth/google", {
      method: "POST",
      body: {
        provider: "google",
        email: registerForm.email || loginForm.email,
        name: registerForm.name || "Business User",
      },
    });
    persistSession(session);
  }

  async function requestMagicLink() {
    const response = await fetchBackend<{ token: string }>("/api/auth/magic-link/request", {
      method: "POST",
      body: {
        email: loginForm.email,
      },
    });
    setMagicToken(response.token);
    setMessage(`Magic token de bypass: ${response.token}`);
  }

  async function verifyMagicLink() {
    const session = await fetchBackend<AuthSession>("/api/auth/magic-link/verify", {
      method: "POST",
      body: {
        email: loginForm.email,
        token: magicToken,
      },
    });
    persistSession(session);
  }

  async function createOffer() {
    if (!token || !businessId) return;

    const now = new Date();
    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    await fetchBackend("/api/business/offers", {
      method: "POST",
      token,
      body: {
        businessId,
        ...offerForm,
        pickupStartAt: now.toISOString(),
        pickupEndAt: end.toISOString(),
        imageUrls: [],
        tags: [],
      },
    });

    await refreshDashboard(token);
    setMessage("Oferta creada.");
  }

  async function publishAvailability() {
    if (!token || !businessId || !availabilityForm.offerId) return;

    await fetchBackend("/api/business/availability", {
      method: "POST",
      token,
      body: {
        businessId,
        offerId: availabilityForm.offerId,
        date: availabilityForm.date,
        quantityPublished: availabilityForm.quantityPublished,
        status: "PUBLISHED",
      },
    });

    await refreshDashboard(token);
    setMessage("Disponibilidad diaria publicada.");
  }

  async function createPayout() {
    if (!token || !businessId) return;

    await fetchBackend("/api/business/payouts", {
      method: "POST",
      token,
      body: {
        businessId,
        amountArs: payoutForm.amountArs,
      },
    });

    await refreshDashboard(token);
    setMessage("Payout generado (mock).");
  }

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setBusinessId(null);
    setOffers([]);
    setOrders([]);
    setAvailability([]);
    setPayouts([]);
    setMessage("Sesión cerrada.");
  }

  const soldToday = orders.reduce((sum, order) => sum + order.totalArs, 0);

  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 20px 80px", display: "grid", gap: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: 46 }}>Business Dashboard</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {token ? <button style={buttonGhost} onClick={logout}>Cerrar sesión</button> : null}
          <Link href="/" style={buttonGhost}>
            Back
          </Link>
        </div>
      </header>

      {message ? <section style={noticeStyle}>{message}</section> : null}

      {!token ? (
        <section style={cardStyle}>
          <h2 style={h2Style}>Acceso Business</h2>
          <div style={grid2}>
            <article>
              <h3 style={h3Style}>Registro email + password</h3>
              <input style={inputStyle} placeholder="Email" value={registerForm.email} onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))} />
              <input style={inputStyle} placeholder="Password" type="password" value={registerForm.password} onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))} />
              <input style={inputStyle} placeholder="Nombre" value={registerForm.name} onChange={(event) => setRegisterForm((prev) => ({ ...prev, name: event.target.value }))} />
              <input style={inputStyle} placeholder="Nombre del negocio" value={registerForm.businessName} onChange={(event) => setRegisterForm((prev) => ({ ...prev, businessName: event.target.value }))} />
              <button style={buttonPrimary} onClick={() => void register()}>
                Registrarme
              </button>
            </article>

            <article>
              <h3 style={h3Style}>Login</h3>
              <input style={inputStyle} placeholder="Email" value={loginForm.email} onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))} />
              <input style={inputStyle} placeholder="Password" type="password" value={loginForm.password} onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))} />
              <button style={buttonPrimary} onClick={() => void login()}>
                Ingresar
              </button>
              <button style={buttonGhost} onClick={() => void loginGoogleMock()}>
                Google OAuth (mock)
              </button>
              <button style={buttonGhost} onClick={() => void requestMagicLink()}>
                Magic Link (generar)
              </button>
              {magicToken ? (
                <>
                  <input style={inputStyle} placeholder="Token magic link" value={magicToken} onChange={(event) => setMagicToken(event.target.value)} />
                  <button style={buttonGhost} onClick={() => void verifyMagicLink()}>
                    Verificar magic link
                  </button>
                </>
              ) : null}
            </article>
          </div>
        </section>
      ) : (
        <>
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            <article style={kpiStyle}>
              <p style={kpiLabel}>Ventas</p>
              <h3 style={kpiValue}>${soldToday.toLocaleString("es-AR")}</h3>
            </article>
            <article style={kpiStyle}>
              <p style={kpiLabel}>Ofertas</p>
              <h3 style={kpiValue}>{offers.length}</h3>
            </article>
            <article style={kpiStyle}>
              <p style={kpiLabel}>Órdenes</p>
              <h3 style={kpiValue}>{orders.length}</h3>
            </article>
            <article style={kpiStyle}>
              <p style={kpiLabel}>Payouts</p>
              <h3 style={kpiValue}>{payouts.length}</h3>
            </article>
          </section>

          <section style={cardStyle}>
            <h2 style={h2Style}>Crear surprise bag</h2>
            <div style={grid2}>
              <input style={inputStyle} placeholder="Título" value={offerForm.title} onChange={(event) => setOfferForm((prev) => ({ ...prev, title: event.target.value }))} />
              <input style={inputStyle} placeholder="Categoría" value={offerForm.category} onChange={(event) => setOfferForm((prev) => ({ ...prev, category: event.target.value }))} />
              <input style={inputStyle} placeholder="Precio original" type="number" value={offerForm.originalPriceArs} onChange={(event) => setOfferForm((prev) => ({ ...prev, originalPriceArs: Number(event.target.value) }))} />
              <input style={inputStyle} placeholder="Precio rescate" type="number" value={offerForm.rescuePriceArs} onChange={(event) => setOfferForm((prev) => ({ ...prev, rescuePriceArs: Number(event.target.value) }))} />
              <input style={inputStyle} placeholder="Cantidad" type="number" value={offerForm.quantityTotal} onChange={(event) => setOfferForm((prev) => ({ ...prev, quantityTotal: Number(event.target.value) }))} />
              <input style={inputStyle} placeholder="Descripción" value={offerForm.description} onChange={(event) => setOfferForm((prev) => ({ ...prev, description: event.target.value }))} />
            </div>
            <button style={buttonPrimary} onClick={() => void createOffer()}>
              Crear oferta
            </button>
          </section>

          <section style={cardStyle}>
            <h2 style={h2Style}>Publicar disponibilidad diaria</h2>
            <div style={grid2}>
              <select style={inputStyle} value={availabilityForm.offerId} onChange={(event) => setAvailabilityForm((prev) => ({ ...prev, offerId: event.target.value }))}>
                <option value="">Seleccionar oferta</option>
                {offers.map((offer) => (
                  <option key={offer.id} value={offer.id}>
                    {offer.title}
                  </option>
                ))}
              </select>
              <input style={inputStyle} type="date" value={availabilityForm.date} onChange={(event) => setAvailabilityForm((prev) => ({ ...prev, date: event.target.value }))} />
              <input style={inputStyle} type="number" value={availabilityForm.quantityPublished} onChange={(event) => setAvailabilityForm((prev) => ({ ...prev, quantityPublished: Number(event.target.value) }))} />
            </div>
            <button style={buttonPrimary} onClick={() => void publishAvailability()}>
              Publicar disponibilidad
            </button>
          </section>

          <section style={cardStyle}>
            <h2 style={h2Style}>Payouts (mock)</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <input style={inputStyle} type="number" value={payoutForm.amountArs} onChange={(event) => setPayoutForm({ amountArs: Number(event.target.value) })} />
              <button style={buttonPrimary} onClick={() => void createPayout()}>
                Generar payout
              </button>
            </div>
            {payouts.map((row) => (
              <article key={row.id} style={rowStyle}>
                <strong>${row.amountArs.toLocaleString("es-AR")}</strong>
                <span>{row.status}</span>
                <span>{row.provider}</span>
              </article>
            ))}
          </section>

          <section style={cardStyle}>
            <h2 style={h2Style}>Órdenes recientes</h2>
            {orders.map((row) => (
              <article key={row.id} style={rowStyle}>
                <strong>#{row.orderNumber}</strong>
                <span>{row.offerTitle}</span>
                <span>{row.status}</span>
                <span>${row.totalArs.toLocaleString("es-AR")}</span>
              </article>
            ))}
          </section>

          <section style={cardStyle}>
            <h2 style={h2Style}>Disponibilidad publicada</h2>
            {availability.map((row) => (
              <article key={row.id} style={rowStyle}>
                <strong>{row.date}</strong>
                <span>{row.offerTitle}</span>
                <span>
                  {row.quantityAvailable}/{row.quantityPublished}
                </span>
                <span>{row.status}</span>
              </article>
            ))}
          </section>
        </>
      )}

      {loading ? <p style={{ color: "#777", margin: 0 }}>Cargando...</p> : null}
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  borderRadius: 16,
  padding: 16,
  background: "var(--surface-lowest)",
  display: "grid",
  gap: 10,
};

const noticeStyle: React.CSSProperties = {
  borderRadius: 12,
  background: "#e9f6e9",
  color: "#1f5b22",
  padding: "10px 12px",
};

const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 10,
};

const inputStyle: React.CSSProperties = {
  minHeight: 42,
  borderRadius: 10,
  border: "1px solid #ddd",
  padding: "0 10px",
  fontSize: 14,
};

const buttonPrimary: React.CSSProperties = {
  minHeight: 42,
  borderRadius: 10,
  border: "none",
  background: "var(--primary)",
  color: "#2f2800",
  fontWeight: 700,
  padding: "0 12px",
};

const buttonGhost: React.CSSProperties = {
  minHeight: 42,
  borderRadius: 10,
  border: "none",
  background: "var(--surface-low)",
  color: "#111",
  fontWeight: 700,
  padding: "0 12px",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const kpiStyle: React.CSSProperties = {
  borderRadius: 14,
  padding: 14,
  background: "var(--surface-lowest)",
};

const kpiLabel: React.CSSProperties = {
  margin: 0,
  color: "#656565",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 1,
};

const kpiValue: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 32,
};

const h2Style: React.CSSProperties = {
  margin: 0,
  fontSize: 24,
};

const h3Style: React.CSSProperties = {
  margin: "0 0 10px",
  fontSize: 18,
};

const rowStyle: React.CSSProperties = {
  borderRadius: 10,
  padding: 12,
  background: "var(--surface-low)",
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
};
