import { useState } from "react";

// ─── TIPOS ────────────────────────────────────────────────────────────────────
type Screen =
  | "login"
  | "pending"
  | "admin"
  | "home"
  | "scan"
  | "results"
  | "plans"
  | "services";

type User = {
  email: string;
  status: "active" | "revoked";
  date: string;
  initials: string;
  color: string;
};

type PricingMode = "monthly" | "annual";
type FilterMode  = "all" | "active" | "revoked";

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const ADMIN_EMAIL = "ellaevoluciona.s@gmail.com";

const INITIAL_USERS: User[] = [];

const SCAN_MESSAGES = [
  "Centra tu rostro en el oval",
  "Detectando puntos de analisis...",
  "Mapeando 18 zonas faciales...",
  "Analizando hidratacion y elasticidad...",
  "Detectando imperfecciones...",
  "Calculando edad aparente de la piel...",
  "Generando puntuacion Glowia...",
  "Analisis completo — 98.4% de precision",
];

const PRICING = {
  monthly: { pro: "$19.99", ultra: "$39.99", period: "/mes" },
  annual:  { pro: "$12.99", ultra: "$24.99", period: "/mes · facturado anual" },
};

const PALETTE = ["#ff9a6c","#ff6e91","#c47dff","#64b4ff","#32dc82","#ffd27d"];
const MONTHS  = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

// ─── ESTILOS BASE ─────────────────────────────────────────────────────────────
const S = {
  // contenedores
  screen: "w-full min-h-screen flex flex-col" as const,
  scroll: "flex-1 overflow-y-auto pb-5" as const,
  // textos
  heading:  "text-white text-xl font-medium" as const,
  muted:    "text-white/45 text-xs" as const,
  label:    "text-white/40 text-xs tracking-widest uppercase px-5 pb-2" as const,
  // botones
  btnPrimary:   "w-full flex items-center justify-center gap-2 text-white font-medium text-sm py-4 rounded-2xl border-none cursor-pointer",
  btnSecondary: "w-full flex items-center justify-center gap-2 text-sm py-3 rounded-2xl cursor-pointer border",
  // nav
  navBar:  "flex justify-around py-3 pb-7 border-t border-white/7 mt-auto flex-shrink-0" as const,
  navItem: "flex flex-col items-center gap-1 border-none bg-transparent cursor-pointer px-2" as const,
} as const;

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]       = useState<Screen>("login");
  const [users,  setUsers]        = useState<User[]>(INITIAL_USERS);
  const [pricing, setPricing]     = useState<PricingMode>("annual");
  const [filter,  setFilter]      = useState<FilterMode>("all");
  const [search,  setSearch]      = useState("");
  const [newEmail, setNewEmail]   = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass,  setLoginPass]  = useState("");
  const [loginError, setLoginError] = useState(false);
  const [addMsg,  setAddMsg]      = useState<"" | "success" | "error">("");
  const [addErrTxt, setAddErrTxt] = useState("Email invalido");
  const [scanMsg, setScanMsg]     = useState(SCAN_MESSAGES[0]);
  const [scanning, setScanning]   = useState(false);
  const [isAdmin,  setIsAdmin]    = useState(false);

  const go = (s: Screen) => setScreen(s);

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = () => {
    const email = loginEmail.trim().toLowerCase();
    setLoginError(false);
    if (email === ADMIN_EMAIL.toLowerCase()) {
      setIsAdmin(true); go("home"); return;
    }
    const ok = users.find(u => u.email.toLowerCase() === email && u.status === "active");
    if (ok) { setIsAdmin(false); go("home"); }
    else setLoginError(true);
  };

  // ── Admin: agregar usuario ─────────────────────────────────────────────────
  const handleAddUser = () => {
    const email = newEmail.trim().toLowerCase();
    setAddMsg("");
    if (!email || !email.includes("@") || !email.includes(".")) {
      setAddErrTxt("Ingresa un email valido"); setAddMsg("error"); return;
    }
    if (email === ADMIN_EMAIL.toLowerCase()) {
      setAddErrTxt("Este es el email administrador"); setAddMsg("error"); return;
    }
    if (users.find(u => u.email.toLowerCase() === email)) {
      setAddErrTxt("Este email ya tiene acceso"); setAddMsg("error"); return;
    }
    const now = new Date();
    setUsers(prev => [...prev, {
      email,
      status: "active",
      date: `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
      initials: email.split("@")[0].slice(0, 2).toUpperCase(),
      color: PALETTE[users.length % PALETTE.length],
    }]);
    setNewEmail("");
    setAddMsg("success");
    setTimeout(() => setAddMsg(""), 3000);
  };

  // ── Admin: toggle acceso ───────────────────────────────────────────────────
  const toggleAccess = (email: string) => {
    setUsers(prev => prev.map(u =>
      u.email === email ? { ...u, status: u.status === "active" ? "revoked" : "active" } : u
    ));
  };

  // ── Scan ───────────────────────────────────────────────────────────────────
  const doScan = () => {
    if (scanning) return;
    setScanning(true);
    let i = 0;
    const iv = setInterval(() => {
      setScanMsg(SCAN_MESSAGES[i]);
      i++;
      if (i >= SCAN_MESSAGES.length) {
        clearInterval(iv);
        setTimeout(() => { setScanning(false); go("results"); }, 600);
      }
    }, 700);
  };

  // ── Usuarios filtrados ─────────────────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    const matchFilter = filter === "all" || u.status === filter;
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const activeCount  = users.filter(u => u.status === "active").length;
  const revokedCount = users.filter(u => u.status === "revoked").length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "#0f0a0e", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ══════════════ LOGIN ══════════════ */}
      {screen === "login" && (
        <div className={S.screen} style={{ background: "radial-gradient(ellipse at 50% 25%, #2a1520 0%, #0f0a0e 70%)", alignItems: "center", justifyContent: "center" }}>
          <StatusBar />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px", width: "100%" }}>
            <Logo />
            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 500, textAlign: "center", marginBottom: 6, fontFamily: "Georgia, serif" }}>Bienvenida a Glowia</h1>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, textAlign: "center", marginBottom: 28 }}>Ingresa tu email para continuar</p>

            {loginError && (
              <div style={{ background: "rgba(255,85,85,0.1)", border: "1px solid rgba(255,85,85,0.25)", borderRadius: 12, padding: "12px 14px", color: "#ff9999", fontSize: 12, textAlign: "center", marginBottom: 14, lineHeight: 1.5, width: "100%" }}>
                Este email no tiene acceso a Glowia.<br/>Contacta a la administradora para solicitar acceso.
              </div>
            )}

            <FormInput type="email"    placeholder="tu@email.com"  value={loginEmail} onChange={setLoginEmail} />
            <FormInput type="password" placeholder="Contrasena"    value={loginPass}  onChange={setLoginPass}  />

            <button
              onClick={handleLogin}
              style={{ width: "100%", background: "linear-gradient(135deg,#ff9a6c,#ff6e91)", color: "#fff", border: "none", borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 500, cursor: "pointer", marginTop: 4 }}
            >
              Ingresar a Glowia
            </button>

            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, textAlign: "center", marginTop: 18 }}>
              No tienes acceso?{" "}
              <span onClick={() => go("pending")} style={{ color: "#ff9a6c", cursor: "pointer", textDecoration: "underline" }}>
                Solicitar acceso
              </span>
            </p>

            <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
              {["Privado","IA Avanzada","4.9 ★"].map(b => (
                <div key={b} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "5px 12px", fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{b}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ ACCESO PENDIENTE ══════════════ */}
      {screen === "pending" && (
        <div className={S.screen} style={{ background: "radial-gradient(ellipse at 50% 20%, #1a1020 0%, #0f0a0e 70%)", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <StatusBar />
          <div style={{ fontSize: 52, textAlign: "center", marginBottom: 20 }}>🔐</div>
          <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 500, textAlign: "center", marginBottom: 10 }}>Acceso restringido</h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, textAlign: "center", lineHeight: 1.7, marginBottom: 24 }}>
            Glowia es una plataforma de acceso exclusivo. Tu email aun no esta registrado en nuestra base de usuarios aprobados.
          </p>
          <div style={{ background: "rgba(255,154,108,0.1)", border: "1px solid rgba(255,154,108,0.25)", borderRadius: 12, padding: "10px 20px", color: "#ff9a6c", fontSize: 12, marginBottom: 28 }}>
            tu@email.com
          </div>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
            {[
              "Contacta a la administradora de Glowia y proporciona tu email para solicitar acceso.",
              "Una vez que tu email sea aprobado, recibiras una confirmacion.",
              "Regresa aqui e inicia sesion con tu email y contrasena.",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 14px" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,154,108,0.15)", color: "#ff9a6c", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 600 }}>{i + 1}</div>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, lineHeight: 1.6 }}>{text}</p>
              </div>
            ))}
          </div>
          <button onClick={() => go("login")} style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, cursor: "pointer", border: "none", background: "none", textDecoration: "underline" }}>
            Volver al inicio de sesion
          </button>
        </div>
      )}

      {/* ══════════════ ADMIN ══════════════ */}
      {screen === "admin" && (
        <div className={S.screen} style={{ background: "#0f0a0e" }}>
          <StatusBar />
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 20px 8px" }}>
            <BackBtn onClick={() => go("login")} />
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 500 }}>Panel de administracion</span>
          </div>

          <div className={S.scroll}>
            {/* header */}
            <div style={{ padding: "8px 20px 16px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,210,125,0.12)", border: "1px solid rgba(255,210,125,0.3)", borderRadius: 20, padding: "5px 12px", fontSize: 10, color: "#ffd27d", marginBottom: 10 }}>
                🛡 Administradora
              </div>
              <div style={{ color: "#fff", fontSize: 20, fontWeight: 500 }}>Control de accesos</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 3 }}>{ADMIN_EMAIL}</div>
              <button
                onClick={() => go("home")}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14, background: "linear-gradient(135deg,#ff9a6c,#ff6e91)", color: "#fff", border: "none", borderRadius: 12, padding: "10px 18px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
              >
                ✨ Entrar a la aplicacion
              </button>
            </div>

            {/* stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: "0 20px 16px" }}>
              {[
                { n: users.length, label: "Total usuarios",  color: "#fff" },
                { n: activeCount,  label: "Activos",         color: "#32dc82" },
                { n: revokedCount, label: "Revocados",       color: "#ff5555" },
              ].map(s => (
                <div key={s.label} style={{ background: "#1e1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 26, fontWeight: 500, color: s.color }}>{s.n}</div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* agregar */}
            <div style={{ padding: "0 20px 16px" }}>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 500, marginBottom: 10 }}>➕ Dar acceso a un email</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="email"
                  placeholder="email@ejemplo.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 12, outline: "none" }}
                />
                <button
                  onClick={handleAddUser}
                  style={{ background: "linear-gradient(135deg,#ff9a6c,#ff6e91)", color: "#fff", border: "none", borderRadius: 12, padding: "12px 16px", fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  + Agregar
                </button>
              </div>
              {addMsg === "success" && (
                <div style={{ background: "rgba(50,220,130,0.1)", border: "1px solid rgba(50,220,130,0.2)", borderRadius: 10, padding: "8px 12px", color: "#32dc82", fontSize: 11, marginTop: 8 }}>
                  ✓ Acceso otorgado correctamente
                </div>
              )}
              {addMsg === "error" && (
                <div style={{ background: "rgba(255,85,85,0.1)", border: "1px solid rgba(255,85,85,0.2)", borderRadius: 10, padding: "8px 12px", color: "#ff9999", fontSize: 11, marginTop: 8 }}>
                  ✗ {addErrTxt}
                </div>
              )}
            </div>

            {/* buscar */}
            <div style={{ padding: "0 20px 10px", position: "relative" }}>
              <span style={{ position: "absolute", left: 32, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", fontSize: 16, pointerEvents: "none" }}>🔍</span>
              <input
                placeholder="Buscar por email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 14px 10px 36px", color: "#fff", fontSize: 12, outline: "none" }}
              />
            </div>

            {/* lista */}
            <div style={{ padding: "0 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>Usuarios registrados</span>
                <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 10 }}>{filteredUsers.length} emails</span>
              </div>

              {/* filtros */}
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {(["all","active","revoked"] as FilterMode[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{ padding: "5px 12px", borderRadius: 20, fontSize: 10, cursor: "pointer", border: `1px solid ${filter === f ? "rgba(255,154,108,0.4)" : "rgba(255,255,255,0.08)"}`, background: filter === f ? "rgba(255,154,108,0.15)" : "none", color: filter === f ? "#ff9a6c" : "rgba(255,255,255,0.45)" }}
                  >
                    {f === "all" ? "Todos" : f === "active" ? "Activos" : "Revocados"}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filteredUsers.length === 0 && (
                  <div style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 12, padding: "24px 0" }}>No se encontraron usuarios</div>
                )}
                {filteredUsers.map(u => (
                  <div key={u.email} style={{ display: "flex", alignItems: "center", gap: 12, background: "#1e1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 14px" }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: u.color + "22", color: u.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                      {u.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "#fff", fontSize: 11, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, marginTop: 2 }}>{u.date}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 10, background: u.status === "active" ? "rgba(50,220,130,0.1)" : "rgba(255,85,85,0.1)", color: u.status === "active" ? "#32dc82" : "#ff9999" }}>
                        {u.status === "active" ? "Activo" : "Revocado"}
                      </span>
                      <button
                        onClick={() => toggleAccess(u.email)}
                        style={{ background: "none", border: `1px solid ${u.status === "active" ? "rgba(255,85,85,0.25)" : "rgba(50,220,130,0.25)"}`, borderRadius: 8, padding: "4px 9px", fontSize: 9, color: u.status === "active" ? "#ff9999" : "#32dc82", cursor: "pointer" }}
                      >
                        {u.status === "active" ? "Revocar" : "Restaurar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ HOME ══════════════ */}
      {screen === "home" && (
        <div className={S.screen} style={{ background: "#0f0a0e" }}>
          <StatusBar />
          {isAdmin && (
            <div style={{ margin: "0 20px", marginTop: 8 }}>
              <button
                onClick={() => go("admin")}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,210,125,0.08)", border: "1px solid rgba(255,210,125,0.3)", borderRadius: 14, padding: "10px 16px", cursor: "pointer" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#ffd27d", fontSize: 12, fontWeight: 500 }}>🛡 Panel de administracion</span>
                <span style={{ color: "rgba(255,210,125,0.6)", fontSize: 12 }}>→</span>
              </button>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px 14px" }}>
            <div>
              <div style={{ color: "#fff", fontSize: 20, fontWeight: 500 }}>Hola ✨</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2 }}>Tu piel esta mejorando</div>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ width: 40, height: 40, background: "#1e1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, cursor: "pointer" }}>🔔</div>
              <div style={{ position: "absolute", top: 3, right: 3, width: 8, height: 8, background: "#ff9a6c", borderRadius: "50%", border: "2px solid #0f0a0e" }} />
            </div>
          </div>

          <div className={S.scroll}>
            {/* score card */}
            <div onClick={() => go("results")} style={{ margin: "0 20px 16px", background: "linear-gradient(135deg,#2a1828,#1e1020)", border: "1px solid rgba(255,154,108,0.2)", borderRadius: 24, padding: 20, cursor: "pointer", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, background: "radial-gradient(circle,rgba(255,154,108,0.15),transparent 70%)", borderRadius: "50%" }} />
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>Puntuacion Glowia</div>
                  <div style={{ fontSize: 52, fontWeight: 500, color: "#fff", lineHeight: 1, display: "flex", alignItems: "flex-end", gap: 5 }}>
                    78<span style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", fontWeight: 400, paddingBottom: 8 }}>/ 100</span>
                  </div>
                </div>
                <div style={{ background: "rgba(50,220,130,0.12)", border: "1px solid rgba(50,220,130,0.25)", borderRadius: 20, padding: "5px 12px", fontSize: 11, color: "#32dc82" }}>↑ +5 esta semana</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[{n:"Hidrat.",v:82,c:"#ff9a6c"},{n:"Elast.",v:71,c:"#ff6e91"},{n:"Unifor.",v:65,c:"#c47dff"},{n:"Brillo",v:58,c:"#64b4ff"}].map(b => (
                  <div key={b.n} style={{ flex: 1 }}>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, marginBottom: 5 }}>{b.n}</div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${b.v}%`, background: b.c, borderRadius: 2 }} />
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, marginTop: 4 }}>{b.v}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* racha */}
            <div style={{ margin: "0 20px 16px", background: "#1e1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 500, color: "#ff9a6c" }}>12</div>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>dias de racha</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, marginTop: 2 }}>Sigue asi, lo estas haciendo genial</div>
              </div>
              <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                {["L","M","X","J","V","S","D"].map((d, i) => (
                  <div key={d} style={{ width: 24, height: 24, borderRadius: "50%", background: i < 5 ? "rgba(255,154,108,0.2)" : i === 5 ? "rgba(255,154,108,0.15)" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: i < 6 ? "#ff9a6c" : "rgba(255,255,255,0.4)" }}>
                    {d}
                  </div>
                ))}
              </div>
            </div>

            {/* servicios */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px", marginBottom: 12 }}>
              <span style={{ color: "#fff", fontSize: 15, fontWeight: 500 }}>Servicios Glowia</span>
              <button onClick={() => go("services")} style={{ color: "#ff9a6c", fontSize: 12, background: "none", border: "none", cursor: "pointer" }}>Ver todos</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 20px", marginBottom: 16 }}>
              {[
                { icon:"🔬", name:"Escaneo IA",          desc:"18 indicadores de tu piel", tag:"Disponible", tagColor:"rgba(50,220,130,0.1)", tagText:"#32dc82", screen:"scan" as Screen },
                { icon:"💊", name:"Scanner Ingredientes", desc:"Analiza cualquier producto",  tag:"Pro",        tagColor:"rgba(255,210,125,0.1)", tagText:"#ffd27d", screen:"services" as Screen },
                { icon:"📈", name:"Tracker de progreso",  desc:"Evolucion semana a semana",  tag:"Pro",        tagColor:"rgba(255,210,125,0.1)", tagText:"#ffd27d", screen:"services" as Screen },
                { icon:"👩‍⚕️", name:"Dermatologa IA",    desc:"Consulta 24/7 con IA",       tag:"Ultra",      tagColor:"rgba(196,125,255,0.1)", tagText:"#c47dff", screen:"services" as Screen },
              ].map(f => (
                <div key={f.name} onClick={() => go(f.screen)} style={{ background: "#1e1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 16, cursor: "pointer" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,154,108,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 12 }}>{f.icon}</div>
                  <div style={{ color: "#fff", fontSize: 12, fontWeight: 500, marginBottom: 3 }}>{f.name}</div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, lineHeight: 1.4 }}>{f.desc}</div>
                  <div style={{ display: "inline-block", marginTop: 8, fontSize: 9, padding: "3px 9px", borderRadius: 12, background: f.tagColor, color: f.tagText }}>{f.tag}</div>
                </div>
              ))}
            </div>

            {/* promo */}
            <div onClick={() => go("plans")} style={{ margin: "0 20px 24px", background: "linear-gradient(135deg,#2a1828,#1e1020)", border: "1px solid rgba(255,154,108,0.25)", borderRadius: 20, padding: 18, cursor: "pointer", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -25, right: -25, width: 90, height: 90, background: "radial-gradient(circle,rgba(255,154,108,0.2),transparent)", borderRadius: "50%" }} />
              <div style={{ color: "#ffd27d", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Desbloquea Glowia Pro</div>
              <div style={{ color: "#fff", fontSize: 14, fontWeight: 500, marginBottom: 10 }}>Accede a todos los servicios de IA avanzada</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
                {["Rutina IA personalizada","Scanner ingredientes","Consultas ilimitadas"].map(t => (
                  <span key={t} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 20, padding: "4px 10px", fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{t}</span>
                ))}
              </div>
              <button style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg,#ff9a6c,#ff6e91)", border: "none", borderRadius: 20, padding: "9px 18px", fontSize: 12, color: "#fff", fontWeight: 500, cursor: "pointer" }}>
                Ver planes →
              </button>
            </div>
          </div>

          <NavBar active="home" onNav={go} />
        </div>
      )}

      {/* ══════════════ SCAN ══════════════ */}
      {screen === "scan" && (
        <div className={S.screen} style={{ background: "#000" }}>
          <div style={{ background: "rgba(0,0,0,0.4)", position: "absolute", top: 0, left: 0, right: 0, zIndex: 5, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BackBtn onClick={() => go("home")} white />
              <span style={{ color: "#fff", fontSize: 15, fontWeight: 500 }}>Escaneo Glowia IA</span>
            </div>
            <span style={{ color: "#ff9a6c", fontSize: 12 }}>18 puntos</span>
          </div>

          <div style={{ flex: 1, background: "radial-gradient(ellipse at 50% 40%,#1a0e18 0%,#050306 100%)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {/* grid */}
            <div style={{ position: "absolute", inset: 0, opacity: 0.08, backgroundImage: "linear-gradient(rgba(255,154,108,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,154,108,0.5) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
            {/* oval */}
            <div style={{ width: 200, height: 250, borderRadius: "50%", border: "2px solid rgba(255,154,108,0.6)", position: "absolute", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: "-5%", right: "-5%", height: 2, background: "linear-gradient(90deg,transparent,rgba(255,154,108,0.9),transparent)", animation: "scanLine 2.2s ease-in-out infinite" }} />
            </div>
            {/* badge */}
            <div style={{ position: "absolute", top: 64, left: "50%", transform: "translateX(-50%)", background: "rgba(255,154,108,0.15)", border: "1px solid rgba(255,154,108,0.35)", borderRadius: 20, padding: "5px 16px", whiteSpace: "nowrap" }}>
              <span style={{ color: "#ff9a6c", fontSize: 11 }}>IA activa — detectando zonas faciales</span>
            </div>
            {/* esquinas */}
            {[
              {top:60,left:20,bt:"2px solid #ff9a6c",bl:"2px solid #ff9a6c"},
              {top:60,right:20,bt:"2px solid #ff9a6c",br:"2px solid #ff9a6c"},
              {bottom:0,left:20,bb:"2px solid #ff9a6c",bl:"2px solid #ff9a6c"},
              {bottom:0,right:20,bb:"2px solid #ff9a6c",br:"2px solid #ff9a6c"},
            ].map((s, i) => (
              <div key={i} style={{ position: "absolute", width: 22, height: 22, ...s as any }} />
            ))}
          </div>

          <div style={{ background: "rgba(10,5,10,0.88)", padding: "18px 24px 32px", flexShrink: 0 }}>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, textAlign: "center", marginBottom: 12 }}>{scanMsg}</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 18 }}>
              {["Sin maquillaje","Luz natural","Expresion neutra"].map(t => (
                <div key={t} style={{ background: "rgba(255,154,108,0.1)", border: "1px solid rgba(255,154,108,0.2)", borderRadius: 20, padding: "4px 12px", color: "rgba(255,255,255,0.65)", fontSize: 10 }}>{t}</div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 30 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, cursor: "pointer" }}>⏱</div>
              <button onClick={doScan} style={{ width: 72, height: 72, borderRadius: "50%", background: "#fff", border: "4px solid rgba(255,255,255,0.25)", outline: "4px solid rgba(255,255,255,0.12)", outlineOffset: 2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                🔬
              </button>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, cursor: "pointer" }}>🔄</div>
            </div>
          </div>

          <style>{`@keyframes scanLine { 0%{top:0;opacity:0} 15%{opacity:1} 85%{opacity:1} 100%{top:100%;opacity:0} }`}</style>
        </div>
      )}

      {/* ══════════════ RESULTS ══════════════ */}
      {screen === "results" && (
        <div className={S.screen} style={{ background: "#0f0a0e" }}>
          <StatusBar />
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 20px 8px" }}>
            <BackBtn onClick={() => go("home")} />
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 500 }}>Resultados del analisis</span>
          </div>
          <div className={S.scroll}>
            {/* hero */}
            <div style={{ padding: "12px 20px 16px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 70, height: 70, borderRadius: "50%", background: "linear-gradient(135deg,rgba(255,154,108,0.3),rgba(255,110,145,0.2))", border: "2px solid rgba(255,154,108,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 }}>🧖</div>
              <div>
                <div style={{ color: "#fff", fontSize: 16, fontWeight: 500 }}>Analisis Glowia IA</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 3 }}>18 zonas · 8 indicadores · hoy 9:42 am</div>
                <span style={{ background: "rgba(50,220,130,0.1)", border: "1px solid rgba(50,220,130,0.2)", borderRadius: 12, padding: "3px 10px", fontSize: 10, color: "#32dc82", display: "inline-block", marginTop: 7 }}>98.4% de precision</span>
              </div>
            </div>

            {/* score */}
            <div style={{ margin: "0 20px 16px", background: "linear-gradient(135deg,rgba(255,154,108,0.12),rgba(255,110,145,0.06))", border: "1px solid rgba(255,154,108,0.2)", borderRadius: 20, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 64, fontWeight: 500, color: "#ff9a6c", lineHeight: 1 }}>78</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 5 }}>Puntuacion global de piel</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 12 }}>
                {["Tipo: Mixta","Sensibilidad: Media","Edad aparente: 26"].map(p => (
                  <div key={p} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "4px 12px", fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{p}</div>
                ))}
              </div>
            </div>

            {/* metricas */}
            <div className={S.label}>Metricas detalladas</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 20px 16px" }}>
              {[{n:"Hidratacion",v:82,c:"#ff9a6c"},{n:"Elasticidad",v:71,c:"#ff6e91"},{n:"Uniformidad tono",v:65,c:"#c47dff"},{n:"Control de sebo",v:58,c:"#64b4ff"}].map(m => (
                <div key={m.n} style={{ background: "#1e1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 14px" }}>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, marginBottom: 8 }}>{m.n}</div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, marginBottom: 5, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${m.v}%`, background: m.c, borderRadius: 3 }} />
                  </div>
                  <div style={{ color: "#fff", fontSize: 12, fontWeight: 500 }}>{m.v}%</div>
                </div>
              ))}
            </div>

            {/* problemas */}
            <div className={S.label}>Preocupaciones detectadas</div>
            <div style={{ padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon:"🔴", name:"Rojez leve",       zone:"Zona nasal y mejillas", sev:"Media",   bg:"rgba(240,100,100,0.1)", color:"#f06464" },
                { icon:"⭕", name:"Poros dilatados",  zone:"Zona T",               sev:"Leve",    bg:"rgba(212,165,116,0.1)", color:"#d4a574" },
                { icon:"💧", name:"Deshidratacion",   zone:"Contorno de ojos",     sev:"Leve",    bg:"rgba(100,180,255,0.1)", color:"#64b4ff" },
              ].map(i => (
                <div key={i.name} style={{ display: "flex", alignItems: "center", gap: 12, background: "#1e1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "12px 14px" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: i.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{i.icon}</div>
                  <div>
                    <div style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>{i.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, marginTop: 2 }}>{i.zone}</div>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 9, padding: "4px 10px", borderRadius: 12, background: i.bg, color: i.color, whiteSpace: "nowrap" }}>{i.sev}</span>
                </div>
              ))}
            </div>

            {/* rutina */}
            <div style={{ margin: "0 20px 10px", background: "#1e1520", border: "1px solid rgba(255,150,100,0.25)", borderRadius: 18, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>✨</span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>Rutina recomendada por IA</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "Limpiador suave con acido hialuronico — AM/PM",
                  "Serum con niacinamida 10% para reducir rojez — AM",
                  "Hidratante con ceramidas para barrera cutanea — AM/PM",
                  "Protector solar SPF 50+ — AM obligatorio",
                ].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,154,108,0.15)", color: "#ff9a6c", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 600 }}>{i + 1}</div>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, lineHeight: 1.5, paddingTop: 4 }}>{t}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: "10px 20px 6px" }}>
              <button style={{ width: "100%", background: "linear-gradient(135deg,#ff9a6c,#ff6e91)", color: "#fff", border: "none", borderRadius: 14, padding: 16, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                ✨ Ver rutina completa personalizada
              </button>
            </div>
            <div style={{ padding: "0 20px 20px" }}>
              <button onClick={() => go("plans")} style={{ width: "100%", background: "none", border: "1px solid rgba(255,154,108,0.3)", color: "#ff9a6c", borderRadius: 14, padding: 13, fontSize: 13, cursor: "pointer" }}>
                👑 Desbloquear analisis detallado Pro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ PLANES ══════════════ */}
      {screen === "plans" && (
        <div className={S.screen} style={{ background: "#0f0a0e", overflowY: "auto" }}>
          <StatusBar />
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 20px 8px" }}>
            <BackBtn onClick={() => go("home")} />
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 500 }}>Planes Glowia</span>
          </div>

          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, textAlign: "center", padding: "4px 24px 16px", lineHeight: 1.6 }}>Invierte en tu piel. Cancela cuando quieras.</p>

          {/* toggle */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <div style={{ display: "flex", background: "#1e1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 50, padding: 4 }}>
              {(["monthly","annual"] as PricingMode[]).map(m => (
                <button key={m} onClick={() => setPricing(m)} style={{ padding: "8px 22px", borderRadius: 50, fontSize: 12, border: "none", cursor: "pointer", background: pricing === m ? "linear-gradient(135deg,#ff9a6c,#ff6e91)" : "none", color: pricing === m ? "#fff" : "rgba(255,255,255,0.45)" }}>
                  {m === "monthly" ? "Mensual" : <span>Anual <span style={{ background: "rgba(50,220,130,0.12)", color: "#32dc82", fontSize: 9, padding: "2px 8px", borderRadius: 10, marginLeft: 4 }}>-40%</span></span>}
                </button>
              ))}
            </div>
          </div>

          {/* comparacion */}
          <div style={{ margin: "0 20px 18px", background: "rgba(255,50,50,0.05)", border: "1px solid rgba(255,100,100,0.15)", borderRadius: 16, padding: "14px 16px" }}>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, marginBottom: 10 }}>⚠️ La competencia cobra:</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>Primeros 3 meses</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,160,160,0.9)" }}>$19/mes</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>Despues del mes 3</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,100,100,0.95)" }}>$70/mes</span>
            </div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 10, color: "rgba(255,154,108,0.85)" }}>
              Con Glowia pagas lo mismo siempre. Sin sorpresas ni letra pequena.
            </div>
          </div>

          {/* cards */}
          <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
            {/* basico */}
            <div style={{ background: "#1e1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 18 }}>
              <div style={{ color: "#fff", fontSize: 16, fontWeight: 500 }}>Basico</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginBottom: 10 }}>Para empezar tu viaje</div>
              <div style={{ fontSize: 32, fontWeight: 500, color: "#ff9a6c", marginBottom: 14 }}>Gratis</div>
              <PlanFeatures items={[
                { ok:true,  text:"3 escaneos IA por mes" },
                { ok:true,  text:"Puntuacion de piel" },
                { ok:true,  text:"Rutina basica" },
                { ok:false, text:"Scanner de ingredientes" },
                { ok:false, text:"Dermatologa IA" },
              ]} />
              <button style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 14, fontSize: 13, cursor: "pointer", marginTop: 16 }}>Plan actual</button>
            </div>

            {/* pro */}
            <div style={{ background: "#1e1520", border: "1px solid rgba(255,154,108,0.5)", borderRadius: 20, padding: 18, position: "relative" }}>
              <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#ff9a6c,#ff6e91)", color: "#fff", fontSize: 10, padding: "5px 16px", borderRadius: "0 0 12px 12px", fontWeight: 500 }}>Mas popular</div>
              <div style={{ color: "#fff", fontSize: 16, fontWeight: 500, marginTop: 12 }}>Pro</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginBottom: 10 }}>La experiencia completa</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 14 }}>
                <span style={{ fontSize: 32, fontWeight: 500, color: "#ff9a6c" }}>{PRICING[pricing].pro}</span>
                <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{PRICING[pricing].period}</span>
              </div>
              <PlanFeatures items={[
                { ok:true,  text:"Escaneos IA ilimitados" },
                { ok:true,  text:"18 indicadores de piel" },
                { ok:true,  text:"Scanner de ingredientes" },
                { ok:true,  text:"Rutina IA personalizada" },
                { ok:true,  text:"Tracker de progreso" },
                { ok:false, text:"Dermatologa IA 24/7" },
              ]} />
              <button style={{ width: "100%", background: "linear-gradient(135deg,#ff9a6c,#ff6e91)", color: "#fff", border: "none", borderRadius: 12, padding: 14, fontSize: 13, fontWeight: 500, cursor: "pointer", marginTop: 16 }}>Empezar Pro</button>
            </div>

            {/* ultra */}
            <div style={{ background: "#1e1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 18 }}>
              <div style={{ color: "#fff", fontSize: 16, fontWeight: 500 }}>Ultra</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginBottom: 10 }}>Para pieles que exigen lo mejor</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 14 }}>
                <span style={{ fontSize: 32, fontWeight: 500, color: "#ff9a6c" }}>{PRICING[pricing].ultra}</span>
                <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{PRICING[pricing].period}</span>
              </div>
              <PlanFeatures items={[
                { ok:true, text:"Todo lo de Pro incluido" },
                { ok:true, text:"Dermatologa IA 24/7" },
                { ok:true, text:"Analisis hormonal y ciclo" },
                { ok:true, text:"Dieta y piel personalizada" },
                { ok:true, text:"Reporte PDF mensual" },
              ]} />
              <button style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 14, fontSize: 13, cursor: "pointer", marginTop: 16 }}>Ver Ultra</button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 20, padding: "0 20px 32px" }}>
            {["Sin contrato","Cancela facil","Pago seguro"].map(t => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.45)", fontSize: 10 }}>🛡 {t}</div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ SERVICIOS ══════════════ */}
      {screen === "services" && (
        <div className={S.screen} style={{ background: "#0f0a0e" }}>
          <StatusBar />
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 20px 8px" }}>
            <BackBtn onClick={() => go("home")} />
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 500 }}>Todos los servicios</span>
          </div>
          <div className={S.scroll}>
            <p style={{ padding: "4px 20px 16px", color: "rgba(255,255,255,0.45)", fontSize: 12 }}>Powered by Glowia AI · Actualizado constantemente</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px" }}>
              {[
                { icon:"🔬", name:"Escaneo facial IA",     plan:"Incluido gratis", planBg:"rgba(50,220,130,0.1)",  planColor:"#32dc82", desc:"Analiza 18 indicadores con tu camara. Deteccion de rojez, poros, arrugas, manchas, hidratacion y mas.", screen:"scan" as Screen },
                { icon:"💊", name:"Scanner ingredientes",  plan:"Plan Pro",        planBg:"rgba(255,210,125,0.1)", planColor:"#ffd27d", desc:"Escanea la etiqueta de cualquier producto. Detecta ingredientes daninos, comedogenicos o incompatibles con tu piel.", screen:null },
                { icon:"📈", name:"Tracker de progreso",   plan:"Plan Pro",        planBg:"rgba(255,210,125,0.1)", planColor:"#ffd27d", desc:"Compara tu piel semana a semana con graficas detalladas. Ve exactamente como evoluciona cada indicador.", screen:null },
                { icon:"👩‍⚕️", name:"Dermatologa IA 24/7", plan:"Plan Ultra",      planBg:"rgba(196,125,255,0.1)", planColor:"#c47dff", desc:"Consulta ilimitada con IA especializada en dermatologia. Identifica patologias y recibe orientacion profesional.", screen:null },
                { icon:"🌙", name:"Analisis hormonal",     plan:"Plan Ultra",      planBg:"rgba(196,125,255,0.1)", planColor:"#c47dff", desc:"Correlaciona tu ciclo menstrual con el estado de tu piel. Anticipa brotes hormonales y ajusta tu rutina.", screen:null },
                { icon:"🥗", name:"Dieta y piel",          plan:"Plan Ultra",      planBg:"rgba(255,210,125,0.1)", planColor:"#ffd27d", desc:"La IA detecta que alimentos afectan tu piel y crea planes nutricionales personalizados.", screen:null },
              ].map(s => (
                <div key={s.name} onClick={() => s.screen && go(s.screen as Screen)} style={{ background: "#1e1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 18, display: "flex", alignItems: "flex-start", gap: 16, cursor: s.screen ? "pointer" : "default", position: "relative" }}>
                  {s.plan !== "Incluido gratis" && (
                    <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,210,125,0.15)", border: "1px solid rgba(255,210,125,0.3)", borderRadius: 12, padding: "3px 9px", fontSize: 9, color: "#ffd27d" }}>👑 {s.plan}</div>
                  )}
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(255,154,108,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{s.icon}</div>
                  <div>
                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{s.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, lineHeight: 1.6 }}>{s.desc}</div>
                    <div style={{ display: "inline-block", marginTop: 9, fontSize: 9, padding: "3px 9px", borderRadius: 12, background: s.planBg, color: s.planColor }}>{s.plan}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "16px 20px 24px" }}>
              <button onClick={() => go("plans")} style={{ width: "100%", background: "linear-gradient(135deg,#ff9a6c,#ff6e91)", color: "#fff", border: "none", borderRadius: 14, padding: 16, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                👑 Ver planes y precios
              </button>
            </div>
          </div>
          <NavBar active="services" onNav={go} />
        </div>
      )}

    </div>
  );
}

// ─── COMPONENTES REUTILIZABLES ────────────────────────────────────────────────

function StatusBar() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px 4px", fontSize: 12, fontWeight: 600, color: "#fff", flexShrink: 0 }}>
      <span>9:41</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ fontSize: 14 }}>📶</span>
        <div style={{ width: 22, height: 11, border: "1.5px solid rgba(255,255,255,0.5)", borderRadius: 3, display: "flex", alignItems: "center", padding: "1.5px", position: "relative" }}>
          <div style={{ background: "#fff", height: "100%", width: "75%", borderRadius: 1 }} />
          <div style={{ width: 2, height: 6, background: "rgba(255,255,255,0.5)", position: "absolute", right: -5, borderRadius: "0 2px 2px 0" }} />
        </div>
      </div>
    </div>
  );
}

function BackBtn({ onClick, white }: { onClick: () => void; white?: boolean }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", color: white ? "#fff" : "rgba(255,255,255,0.45)", fontSize: 22, cursor: "pointer", padding: 4 }}>←</button>
  );
}

function Logo() {
  return (
    <div style={{ position: "relative", width: 88, height: 88, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(255,154,108,0.2)" }} />
      <div style={{ position: "absolute", inset: 12, borderRadius: "50%", border: "1px solid rgba(255,154,108,0.3)" }} />
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#ff8c50,#ff5535)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(255,100,145,0.3)" }} />
        <span style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: "#fff", position: "relative", zIndex: 1 }}>G</span>
        <span style={{ fontSize: 11, position: "absolute", top: -3, right: -5, zIndex: 2 }}>✨</span>
      </div>
    </div>
  );
}

function FormInput({ type, placeholder, value, onChange }: { type: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "15px 16px", color: "#fff", fontSize: 14, marginBottom: 12, outline: "none" }}
    />
  );
}

function PlanFeatures({ items }: { items: { ok: boolean; text: string }[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map(i => (
        <div key={i.text} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: i.ok ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.2)" }}>
          <span style={{ fontSize: 14, color: i.ok ? "#ff9a6c" : "rgba(255,255,255,0.2)" }}>{i.ok ? "✓" : "✗"}</span>
          {i.text}
        </div>
      ))}
    </div>
  );
}

function NavBar({ active, onNav }: { active: string; onNav: (s: Screen) => void }) {
  const items = [
    { id: "home",     icon: "🏠", label: "Inicio" },
    { id: "scan",     icon: "🔬", label: "Escanear" },
    { id: "services", icon: "✨", label: "Servicios" },
    { id: "plans",    icon: "👑", label: "Pro" },
    { id: "profile",  icon: "👤", label: "Perfil" },
  ];
  return (
    <div style={{ display: "flex", justifyContent: "space-around", padding: "12px 0 28px", background: "rgba(15,10,14,0.97)", borderTop: "0.5px solid rgba(255,255,255,0.07)", marginTop: "auto", flexShrink: 0 }}>
      {items.map(item => (
        <button key={item.id} onClick={() => item.id !== "profile" && onNav(item.id as Screen)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: "none", background: "none", cursor: "pointer", padding: "0 10px" }}>
          <span style={{ fontSize: 22, opacity: active === item.id ? 1 : 0.28, filter: active === item.id ? "none" : "grayscale(100%)" }}>{item.icon}</span>
          <span style={{ fontSize: 9, color: active === item.id ? "#ff9a6c" : "rgba(255,255,255,0.28)" }}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
