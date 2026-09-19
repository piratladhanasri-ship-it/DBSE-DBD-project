import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const API = "http://localhost:5000";
const api = axios.create({ baseURL: API });
const socket = io(API, { autoConnect: true });

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const imageUrl = (url) => {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API}${url}`;
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#fff9fc 0%,#fff4f8 48%,#fff 100%)",
    color: "#241a22",
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  nav: {
    height: 76,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 clamp(22px,6vw,90px)",
    background: "rgba(255,255,255,.92)",
    backdropFilter: "blur(18px)",
    borderBottom: "1px solid rgba(222,76,133,.12)",
    position: "sticky",
    top: 0,
    zIndex: 20,
  },
  btn: {
    border: 0,
    borderRadius: 999,
    padding: "12px 20px",
    cursor: "pointer",
    fontWeight: 750,
    fontSize: 14,
  },
  pink: {
    background: "linear-gradient(135deg,#e25591,#c93675)",
    color: "#fff",
    boxShadow: "0 10px 24px rgba(201,54,117,.22)",
  },
  white: {
    background: "#fff",
    color: "#bd3a70",
    border: "1px solid #efc8d9",
  },
  section: {
    padding: "clamp(55px,7vw,95px) clamp(22px,6vw,90px)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: 24,
  },
  card: {
    background: "rgba(255,255,255,.94)",
    border: "1px solid #f2dce7",
    borderRadius: 28,
    overflow: "hidden",
    boxShadow: "0 16px 45px rgba(92,37,62,.08)",
  },
  body: { padding: 20 },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid #ead3df",
    marginBottom: 12,
    background: "#fff",
    outline: "none",
    fontSize: 15,
    color: "#241a22",
  },
  panel: {
    maxWidth: 850,
    margin: "45px auto",
    background: "rgba(255,255,255,.96)",
    border: "1px solid #f0dce7",
    borderRadius: 28,
    padding: 30,
    boxShadow: "0 18px 50px rgba(92,37,62,.07)",
  },
};

function GlobalStyles() {
  return (
    <style>{`
      *{box-sizing:border-box}
      html{scroll-behavior:smooth}
      body{margin:0;background:#fff9fc}
      button,input,select,textarea{font-family:inherit}
      input:focus,select:focus,textarea:focus{border-color:#dc5b91!important;box-shadow:0 0 0 4px rgba(220,91,145,.10)}
      .lusso-card{transition:transform .25s ease,box-shadow .25s ease}
      .lusso-card:hover{transform:translateY(-7px);box-shadow:0 24px 55px rgba(92,37,62,.13)}
      .lusso-btn{transition:transform .2s ease,box-shadow .2s ease}
      .lusso-btn:hover{transform:translateY(-2px)}
      .lusso-navbtn:hover{background:#fff0f6!important;color:#c93675}
      @media(max-width:800px){
        .hero-grid{grid-template-columns:1fr!important}
        .hero-visual{min-height:390px!important}
        .nav-actions{gap:4px!important}
        .nav-actions button{padding:9px 12px!important}
        .hide-mobile{display:none!important}
      }
    `}</style>
  );
}

function Nav({ user, setPage, setAuthMode, logout }) {
  return (
    <nav style={styles.nav}>
      <b
        style={{ fontSize: 25, letterSpacing: 4, cursor: "pointer", fontFamily: "Georgia,serif" }}
        onClick={() => setPage("home")}
      >
        LUSSO.
      </b>

      <div className="nav-actions" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button className="lusso-navbtn" style={styles.btn} onClick={() => setPage("home")}>Home</button>

        {user?.role === "BUYER" && (
          <>
            <button className="lusso-navbtn" style={styles.btn} onClick={() => setPage("buyer")}>Dashboard</button>
            <button className="lusso-navbtn" style={styles.btn} onClick={() => setPage("watch")}>♡ Watchlist</button>
          </>
        )}

        {user?.role === "SELLER" && (
          <button className="lusso-navbtn" style={styles.btn} onClick={() => setPage("seller")}>Sell</button>
        )}

        {user?.role === "ADMIN" && (
          <button className="lusso-navbtn" style={styles.btn} onClick={() => setPage("admin")}>Admin</button>
        )}

        {user ? (
          <button className="lusso-btn" style={{ ...styles.btn, ...styles.white }} onClick={logout}>Logout</button>
        ) : (
          <button className="lusso-btn" style={{ ...styles.btn, ...styles.pink }} onClick={() => { setAuthMode("login"); setPage("auth"); }}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

function AuthPage({ authMode, setAuthMode, auth, setAuth, submitAuth }) {
  return (
    <section style={{ ...styles.section, minHeight: "calc(100vh - 76px)", display: "grid", placeItems: "center" }}>
      <div style={{ ...styles.panel, width: "min(850px,100%)", margin: 0 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ color: "#d44782", letterSpacing: 3, fontSize: 12, fontWeight: 800, marginBottom: 10 }}>WELCOME TO LUSSO</div>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(32px,5vw,46px)", fontWeight: 500, margin: 0 }}>
            {authMode === "login" ? "Welcome back" : "Create your LUSSO account"}
          </h2>
          <p style={{ color: "#806976", marginBottom: 0 }}>
            {authMode === "login" ? "Sign in to continue bidding." : "Join the world of beautiful finds."}
          </p>
        </div>

        <form onSubmit={submitAuth}>
          {authMode === "signup" && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={auth.name}
                onChange={(e) => setAuth((prev) => ({ ...prev, name: e.target.value }))}
                style={styles.input}
                autoComplete="name"
                required
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={auth.phone}
                onChange={(e) => setAuth((prev) => ({ ...prev, phone: e.target.value }))}
                style={styles.input}
                autoComplete="tel"
                required
              />

              <select
                name="role"
                value={auth.role}
                onChange={(e) => setAuth((prev) => ({ ...prev, role: e.target.value }))}
                style={styles.input}
              >
                <option value="BUYER">BUYER</option>
                <option value="SELLER">SELLER</option>
              </select>
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={auth.email}
            onChange={(e) => setAuth((prev) => ({ ...prev, email: e.target.value }))}
            style={styles.input}
            autoComplete="email"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={auth.password}
            onChange={(e) => setAuth((prev) => ({ ...prev, password: e.target.value }))}
            style={styles.input}
            autoComplete={authMode === "login" ? "current-password" : "new-password"}
            required
          />

          <button className="lusso-btn" type="submit" style={{ ...styles.btn, ...styles.pink, width: "100%", padding: 15, fontSize: 16 }}>
            {authMode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        <p style={{ color: "#806976", marginTop: 24, marginBottom: 0 }}>
          {authMode === "login" ? "New here?" : "Already registered?"}
          <button
            type="button"
            onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
            style={{ border: 0, background: "transparent", color: "#d44782", fontWeight: 800, cursor: "pointer", marginLeft: 5, fontSize: 15 }}
          >
            {authMode === "login" ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </section>
  );
}

function AuctionCard({ a, user, watchlist, toggleWatch, setSelected }) {
  const watched = watchlist.some((w) => Number(w.auction_id) === Number(a.auction_id));
  return (
    <div className="lusso-card" style={styles.card}>
      {a.image_url ? (
        <img src={imageUrl(a.image_url)} alt={a.product_name} style={{ width: "100%", height: 230, objectFit: "cover" }} />
      ) : (
        <div style={{ height: 230, display: "grid", placeItems: "center", fontSize: 70, background: "linear-gradient(135deg,#f9eaf2,#f5d7e5)" }}>✦</div>
      )}
      <div style={styles.body}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <small style={{ color: "#c83d76", fontWeight: 800, letterSpacing: 1 }}>{a.category || "COLLECTION"}</small>
          {user?.role === "BUYER" && (
            <button onClick={() => toggleWatch(a)} style={{ border: 0, background: "none", fontSize: 27, cursor: "pointer", color: "#d44782" }}>
              {watched ? "♥" : "♡"}
            </button>
          )}
        </div>
        <h3 style={{ fontFamily: "Georgia,serif", fontSize: 24, margin: "12px 0 8px" }}>{a.product_name}</h3>
        <p style={{ color: "#876d7b", minHeight: 44, lineHeight: 1.5 }}>{a.description || "A beautiful piece waiting for its next owner."}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 14 }}>
          <div><small style={{ color: "#876d7b" }}>Current bid</small><br /><b style={{ fontSize: 22 }}>{money(a.current_price || a.starting_price)}</b></div>
          <small style={{ color: "#876d7b" }}>{a.status}</small>
        </div>
        <button className="lusso-btn" style={{ ...styles.btn, ...styles.pink, width: "100%" }} onClick={() => setSelected(a)}>View & Bid</button>
      </div>
    </div>
  );
}

function Home({ auctions, search, setSearch, cat, setCat, categories, user, watchlist, toggleWatch, setSelected, setPage, setAuthMode }) {
  const shown = auctions.filter((a) =>
    (a.product_name || "").toLowerCase().includes(search.toLowerCase()) &&
    (cat === "ALL" || a.category === cat)
  );
  const featured = auctions.slice(0, 3);

  return (
    <>
      <section style={{ ...styles.section, paddingTop: 70, paddingBottom: 70, background: "radial-gradient(circle at 85% 30%,#f8d5e5 0%,#fff5f9 34%,#fff9fc 70%)" }}>
        <div className="hero-grid" style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-block", border: "1px solid #edc5d8", borderRadius: 999, padding: "10px 15px", color: "#c93675", fontWeight: 800, fontSize: 12, letterSpacing: 1.5, background: "#fff" }}>✦ CURATED AUCTIONS</div>
            <h1 style={{ fontFamily: "Georgia,serif", fontWeight: 500, fontSize: "clamp(55px,7vw,90px)", lineHeight: .93, margin: "28px 0 24px", letterSpacing: -3 }}>
              Bid on things<br /><i style={{ color: "#d44782" }}>you love.</i>
            </h1>
            <p style={{ color: "#806976", fontSize: 18, lineHeight: 1.7, maxWidth: 650 }}>
              Discover rare finds, beautiful pieces and everyday favourites. Save what catches your eye and join live bidding on LUSSO.
            </p>
            <button className="lusso-btn" style={{ ...styles.btn, ...styles.pink, padding: "15px 25px", fontSize: 15, marginTop: 12 }} onClick={() => document.getElementById("auctions")?.scrollIntoView({ behavior: "smooth" })}>
              Explore Auctions →
            </button>
            <div style={{ display: "flex", gap: 45, marginTop: 45 }}>
              <div><b style={{ fontSize: 23 }}>{auctions.length}+</b><br /><small style={{ color: "#806976" }}>Live listings</small></div>
              <div><b style={{ fontSize: 23 }}>24/7</b><br /><small style={{ color: "#806976" }}>Bidding</small></div>
              <div><b style={{ fontSize: 23 }}>100%</b><br /><small style={{ color: "#806976" }}>Online</small></div>
            </div>
          </div>

          <div className="hero-visual" style={{ minHeight: 520, borderRadius: 34, position: "relative", overflow: "hidden", background: "linear-gradient(145deg,#fff,#fde8f1)", border: "1px solid #f1d8e4", boxShadow: "0 25px 70px rgba(92,37,62,.12)", padding: 25 }}>
            <div style={{ position: "absolute", width: 250, height: 250, borderRadius: "50%", background: "#f9cfe0", right: -50, top: -60, opacity: .65 }} />
            {featured.length > 0 ? (
              <div style={{ position: "relative", zIndex: 1, height: "100%", display: "grid", gridTemplateColumns: "1.4fr .75fr", gap: 15 }}>
                <div style={{ position: "relative", borderRadius: 26, overflow: "hidden", background: "#f5d9e6", minHeight: 460 }}>
                  {featured[0].image_url ? <img src={imageUrl(featured[0].image_url)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "grid", placeItems: "center", fontSize: 110 }}>✦</div>}
                  <div style={{ position: "absolute", top: 18, left: 18, background: "#fff", color: "#d44782", borderRadius: 999, padding: "9px 13px", fontSize: 12, fontWeight: 800 }}>LIVE NOW</div>
                  <div style={{ position: "absolute", left: 18, right: 18, bottom: 18, background: "rgba(255,255,255,.92)", borderRadius: 18, padding: 14 }}>
                    <b style={{ fontFamily: "Georgia,serif", fontSize: 20 }}>{featured[0].product_name}</b><br /><span style={{ color: "#c93675", fontWeight: 800 }}>{money(featured[0].current_price || featured[0].starting_price)}</span>
                  </div>
                </div>
                <div style={{ display: "grid", gap: 15 }}>
                  {featured.slice(1, 3).map((a) => (
                    <div key={a.auction_id} style={{ background: "#fff", borderRadius: 22, padding: 10, boxShadow: "0 14px 30px rgba(92,37,62,.09)" }}>
                      {a.image_url ? <img src={imageUrl(a.image_url)} alt="" style={{ width: "100%", height: 145, objectFit: "cover", borderRadius: 16 }} /> : <div style={{ height: 145, borderRadius: 16, background: "#f9e8f0", display: "grid", placeItems: "center", fontSize: 50 }}>✦</div>}
                      <div style={{ fontWeight: 750, fontSize: 13, marginTop: 9 }}>{a.product_name}</div>
                      <small style={{ color: "#c83d76", fontWeight: 800 }}>{money(a.current_price || a.starting_price)}</small>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ height: "100%", display: "grid", placeItems: "center", position: "relative", zIndex: 1, textAlign: "center" }}>
                <div><div style={{ fontSize: 100 }}>✦</div><h3 style={{ fontFamily: "Georgia,serif", fontSize: 32, fontWeight: 500 }}>Something beautiful<br />is waiting.</h3><p style={{ color: "#806976" }}>Be the first to list an item.</p></div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="auctions" style={{ ...styles.section, paddingTop: 70 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, flexWrap: "wrap", marginBottom: 30 }}>
            <div>
              <div style={{ color: "#c83d76", fontSize: 12, fontWeight: 850, letterSpacing: 2 }}>THE COLLECTION</div>
              <h2 style={{ fontFamily: "Georgia,serif", fontWeight: 500, fontSize: 42, margin: "7px 0" }}>Live Auctions</h2>
              <p style={{ color: "#806976", margin: 0 }}>Find something special and make it yours.</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input className="lusso-search" style={{ ...styles.input, width: 230, margin: 0 }} placeholder="Search pieces..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <select className="lusso-search" style={{ ...styles.input, width: 145, margin: 0 }} value={cat} onChange={(e) => setCat(e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
            </div>
          </div>

          <div style={styles.grid}>
            {shown.length ? shown.map((a) => <AuctionCard key={a.auction_id} a={a} user={user} watchlist={watchlist} toggleWatch={toggleWatch} setSelected={setSelected} />) : (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 80, color: "#806976", background: "#fff", borderRadius: 28, border: "1px solid #f2dce7" }}>
                No auctions found yet.
                {user?.role === "SELLER" && <div><button style={{ ...styles.btn, ...styles.pink, marginTop: 15 }} onClick={() => setPage("seller")}>Create an auction</button></div>}
                {!user && <div><button style={{ ...styles.btn, ...styles.pink, marginTop: 15 }} onClick={() => { setAuthMode("signup"); setPage("auth"); }}>Join LUSSO</button></div>}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Watch({ watchlist, auctions, setSelected, toggleWatch }) {
  return (
    <section style={styles.section}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ marginBottom: 30 }}><div style={{ color: "#c83d76", fontSize: 12, fontWeight: 850, letterSpacing: 2 }}>SAVED PIECES</div><h2 style={{ fontFamily: "Georgia,serif", fontWeight: 500, fontSize: 42 }}>My Watchlist</h2></div>
        <div style={styles.grid}>
          {watchlist.length ? watchlist.map((w) => {
            const a = auctions.find((x) => Number(x.auction_id) === Number(w.auction_id)) || w;
            return <div style={styles.card} key={w.watchlist_id}>
              {w.image_url ? <img src={imageUrl(w.image_url)} alt={w.product_name} style={{ width: "100%", height: 220, objectFit: "cover" }} /> : <div style={{ height: 220, background: "#f9e8f0", display: "grid", placeItems: "center", fontSize: 65 }}>♡</div>}
              <div style={styles.body}><h3 style={{ fontFamily: "Georgia,serif" }}>{w.product_name}</h3><b style={{ fontSize: 22 }}>{money(w.current_price || w.starting_price)}</b><p style={{ color: "#806976" }}>{w.status}</p><button style={{ ...styles.btn, ...styles.pink }} onClick={() => a && setSelected(a)}>Bid Now</button><button style={{ ...styles.btn, ...styles.white, marginLeft: 8 }} onClick={() => toggleWatch(w)}>Remove</button></div>
            </div>;
          }) : <div style={{ padding: 70, color: "#806976" }}>Your watchlist is empty. Tap ♡ on an auction to save it.</div>}
        </div>
      </div>
    </section>
  );
}

function Buyer({ bids, watchlist, wins, notes, payment, setPayment, pay, dispute, setDispute, openDispute, markRead }) {
  const cards = [["My Bids", bids.length], ["Watchlist", watchlist.length], ["Won Auctions", wins.length], ["Unread", notes.filter((n) => !n.is_read).length]];
  return (
    <section style={styles.section}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ marginBottom: 30 }}><div style={{ color: "#c83d76", fontSize: 12, fontWeight: 850, letterSpacing: 2 }}>YOUR LUSSO</div><h2 style={{ fontFamily: "Georgia,serif", fontWeight: 500, fontSize: 42 }}>Buyer Dashboard</h2></div>
        <div style={styles.grid}>{cards.map(([name, value]) => <div style={styles.card} key={name}><div style={styles.body}><small style={{ color: "#806976" }}>{name}</small><h2 style={{ fontSize: 38, margin: "8px 0" }}>{value}</h2></div></div>)}</div>

        <div style={styles.panel}><h3>My Bids</h3>{bids.length ? bids.slice(0, 12).map((b) => <p key={b.bid_id} style={{ borderBottom: "1px solid #f2dce7", paddingBottom: 10 }}>{b.product_name} — <b>{money(b.bid_amount)}</b></p>) : <p style={{ color: "#806976" }}>No bids yet.</p>}</div>

        <div style={styles.panel}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h3>Notifications</h3><button style={{ ...styles.btn, ...styles.white }} onClick={markRead}>Mark all read</button></div>{notes.length ? notes.slice(0, 12).map((n) => <p key={n.notification_id} style={{ color: n.is_read ? "#806976" : "#241a22", fontWeight: n.is_read ? 400 : 700 }}>{n.message}</p>) : <p style={{ color: "#806976" }}>No notifications.</p>}</div>

        <div style={styles.panel}><h3>Payment Record</h3><form onSubmit={pay}><input style={styles.input} type="number" placeholder="Auction ID" value={payment.auction_id} onChange={(e) => setPayment((p) => ({ ...p, auction_id: e.target.value }))} required /><input style={styles.input} type="number" placeholder="Amount" value={payment.amount} onChange={(e) => setPayment((p) => ({ ...p, amount: e.target.value }))} required /><button className="lusso-btn" style={{ ...styles.btn, ...styles.pink }}>Record Payment</button></form></div>

        <div style={styles.panel}><h3>Open Dispute</h3><form onSubmit={openDispute}><input style={styles.input} type="number" placeholder="Auction ID" value={dispute.auction_id} onChange={(e) => setDispute((p) => ({ ...p, auction_id: e.target.value }))} required /><input style={styles.input} type="number" placeholder="Seller ID" value={dispute.seller_id} onChange={(e) => setDispute((p) => ({ ...p, seller_id: e.target.value }))} required /><textarea style={{ ...styles.input, height: 110, resize: "vertical" }} placeholder="Reason" value={dispute.reason} onChange={(e) => setDispute((p) => ({ ...p, reason: e.target.value }))} required /><button className="lusso-btn" style={{ ...styles.btn, ...styles.pink }}>Submit Dispute</button></form></div>
      </div>
    </section>
  );
}

function Countdown({ endTime, status }) {
  const [left, setLeft] = useState(() => Math.max(0, new Date(endTime).getTime() - Date.now()));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLeft(Math.max(0, new Date(endTime).getTime() - Date.now()));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [endTime]);

  if (status !== "ACTIVE" || left <= 0) return <span style={{ color: "#a12a47", fontWeight: 800 }}>ENDED</span>;

  const totalSeconds = Math.floor(left / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const text = days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`;

  return <span style={{ color: left <= 120000 ? "#c93675" : "#806976", fontWeight: 800 }}>{text}</span>;
}

function Seller({ user, auctions, form, setForm, createAuction, complete, sellerBids }) {
  const mine = auctions.filter((a) => Number(a.seller_id) === Number(user?.user_id));

  const bidsFor = (auctionId) =>
    sellerBids.filter((b) => Number(b.auction_id) === Number(auctionId));

  return (
    <section style={styles.section}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ marginBottom: 30 }}>
          <div style={{ color: "#c83d76", fontSize: 12, fontWeight: 850, letterSpacing: 2 }}>
            SELL ON LUSSO
          </div>
          <h2 style={{ fontFamily: "Georgia,serif", fontWeight: 500, fontSize: 42 }}>
            Seller Dashboard
          </h2>
          <p style={{ color: "#806976" }}>
            See every bid placed on your auctions in real time.
          </p>
        </div>

        <div style={styles.panel}>
          <h3 style={{ fontFamily: "Georgia,serif", fontSize: 25 }}>
            Create a New Auction
          </h3>
          <form onSubmit={createAuction}>
            <input
              style={styles.input}
              placeholder="Product name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
            <textarea
              style={{ ...styles.input, height: 110, resize: "vertical" }}
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              required
            />
            <select
              style={styles.input}
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            >
              {["Electronics", "Technology", "Watches", "Fashion", "Art", "Collectibles", "Home", "Other"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <input
              style={styles.input}
              type="number"
              min="1"
              placeholder="Starting price"
              value={form.starting_price}
              onChange={(e) => setForm((p) => ({ ...p, starting_price: e.target.value }))}
              required
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input
                style={styles.input}
                type="number"
                min="1"
                step="1"
                placeholder="Duration"
                value={form.duration}
                onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                required
              />
              <select
                style={styles.input}
                value={form.duration_unit}
                onChange={(e) => setForm((p) => ({ ...p, duration_unit: e.target.value }))}
              >
                <option value="MINUTES">Minutes</option>
                <option value="HOURS">Hours</option>
                <option value="DAYS">Days</option>
              </select>
            </div>
            <input
              style={styles.input}
              type="file"
              accept="image/*"
              onChange={(e) => setForm((p) => ({ ...p, image: e.target.files?.[0] || null }))}
            />
            <button className="lusso-btn" style={{ ...styles.btn, ...styles.pink }}>
              Create Auction
            </button>
          </form>
        </div>

        <h3 style={{ fontFamily: "Georgia,serif", fontSize: 28, marginTop: 45 }}>
          My Listings & Bids
        </h3>

        <div style={styles.grid}>
          {mine.length ? mine.map((a) => {
            const auctionBids = bidsFor(a.auction_id);

            return (
              <div style={styles.card} key={a.auction_id}>
                {a.image_url ? (
                  <img
                    src={imageUrl(a.image_url)}
                    alt={a.product_name}
                    style={{ width: "100%", height: 220, objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      height: 220,
                      background: "linear-gradient(135deg,#f9e8f0,#f5d7e5)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 65
                    }}
                  >
                    ✦
                  </div>
                )}

                <div style={styles.body}>
                  <small style={{ color: "#c83d76", fontWeight: 800 }}>
                    {a.category}
                  </small>

                  <h3 style={{ fontFamily: "Georgia,serif", fontSize: 25, margin: "10px 0" }}>
                    {a.product_name}
                  </h3>

                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <small style={{ color: "#806976" }}>Current bid</small>
                      <div style={{ fontSize: 23, fontWeight: 800, color: "#c93675" }}>
                        {money(a.current_price || a.starting_price)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <small style={{ color: "#806976" }}>Total bids</small>
                      <div style={{ fontSize: 23, fontWeight: 800 }}>
                        {auctionBids.length}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 14, background: "#fff", border: "1px solid #f2dce7", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#806976" }}>Time remaining</span>
                    <Countdown endTime={a.end_time} status={a.status} />
                  </div>

                  <div
                    style={{
                      marginTop: 18,
                      background: "#fff8fb",
                      border: "1px solid #f2dce7",
                      borderRadius: 18,
                      padding: 15
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <b>Recent Bids</b>
                      <span style={{ color: "#c93675", fontSize: 12, fontWeight: 800 }}>
                        {a.status}
                      </span>
                    </div>

                    {auctionBids.length ? (
                      auctionBids.slice(0, 8).map((b) => (
                        <div
                          key={b.bid_id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 10,
                            padding: "10px 0",
                            borderTop: "1px solid #f2dce7"
                          }}
                        >
                          <div>
                            <b>{b.buyer_name || "Buyer"}</b>
                            <div style={{ fontSize: 12, color: "#806976" }}>
                              {b.bid_time ? new Date(b.bid_time).toLocaleString() : ""}
                            </div>
                          </div>
                          <strong style={{ color: "#c93675" }}>
                            {money(b.bid_amount)}
                          </strong>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: "#806976", marginBottom: 0 }}>
                        No bids have been placed yet.
                      </p>
                    )}
                  </div>

                  {a.status === "ACTIVE" ? (
                    <button
                      style={{ ...styles.btn, ...styles.white, width: "100%", marginTop: 15 }}
                      onClick={() => complete(a.auction_id)}
                    >
                      End Auction Now
                    </button>
                  ) : (
                    <div style={{ marginTop: 15, textAlign: "center", padding: 12, borderRadius: 14, background: "#f8edf2", color: "#8a526b", fontWeight: 800 }}>
                      Auction Ended
                    </div>
                  )}
                </div>
              </div>
            );
          }) : (
            <p style={{ color: "#806976" }}>
              You have not created any auctions yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Admin({ stats, users, disputes }) {
  return (
    <section style={styles.section}><div style={{ maxWidth: 1280, margin: "0 auto" }}><h2 style={{ fontFamily: "Georgia,serif", fontWeight: 500, fontSize: 42 }}>Admin Dashboard</h2>{stats && <div style={styles.grid}>{Object.entries(stats).map(([key, value]) => <div style={styles.card} key={key}><div style={styles.body}><small style={{ color: "#806976" }}>{key.replaceAll("_", " ").toUpperCase()}</small><h2>{value}</h2></div></div>)}</div>}<div style={styles.panel}><h3>Users</h3>{users.map((u) => <p key={u.user_id}>{u.name} — {u.email} — <b>{u.role}</b></p>)}</div><div style={styles.panel}><h3>Disputes</h3>{disputes.length ? disputes.map((d) => <p key={d.dispute_id}>{d.product_name} — {d.status} — {d.reason}</p>) : <p>No disputes.</p>}</div></div></section>
  );
}

function BidModal({ selected, user, bid, setBid, placeBid, close, auctionBids }) {
  if (!selected) return null;
  const min = Number(selected.current_price || selected.starting_price || 0);
  return (
    <div onClick={close} style={{ position: "fixed", inset: 0, background: "rgba(30,15,23,.62)", display: "grid", placeItems: "center", zIndex: 50, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", padding: 30, borderRadius: 28, width: "min(500px,100%)", boxShadow: "0 30px 90px rgba(0,0,0,.25)" }}>
        <button onClick={close} style={{ float: "right", border: 0, background: "none", fontSize: 28, cursor: "pointer" }}>×</button>
        <small style={{ color: "#c83d76", fontWeight: 800 }}>{selected.category}</small>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: 32 }}>{selected.product_name}</h2>
        <p style={{ color: "#806976" }}>Current price</p>
        <h2 style={{ fontSize: 30, color: "#c93675" }}>{money(min)}</h2>

        <div style={{
          background: "#fff8fb",
          border: "1px solid #f2dce7",
          borderRadius: 18,
          padding: 14,
          marginBottom: 18
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <b>Live bids</b>
            <span style={{ color: "#d44782", fontSize: 11, fontWeight: 800 }}>● LIVE</span>
          </div>
          {auctionBids.length ? auctionBids.slice(0, 5).map((b) => (
            <div key={b.bid_id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid #f2dce7" }}>
              <span><b>{b.buyer_name || "Buyer"}</b><br /><small style={{ color: "#806976" }}>{b.bid_time ? new Date(b.bid_time).toLocaleTimeString() : ""}</small></span>
              <strong style={{ color: "#c93675" }}>{money(b.bid_amount)}</strong>
            </div>
          )) : <small style={{ color: "#806976" }}>No bids yet.</small>}
        </div>

        {selected.end_time && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: "#806976", fontSize: 13, marginBottom: 6 }}>
              Ends: {new Date(selected.end_time).toLocaleString()}
            </p>
            <div style={{ padding: "10px 12px", borderRadius: 14, background: "#fff8fb", border: "1px solid #f2dce7", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#806976" }}>Time remaining</span>
              <Countdown endTime={selected.end_time} status={selected.status} />
            </div>
          </div>
        )}

        {user?.role === "BUYER" && selected.status === "ACTIVE" ? (
          <form onSubmit={placeBid}>
            <input style={styles.input} type="number" min={min + 1} placeholder={`Enter more than ${money(min)}`} value={bid} onChange={(e) => setBid(e.target.value)} required />
            <button className="lusso-btn" style={{ ...styles.btn, ...styles.pink, width: "100%" }}>Place Bid</button>
          </form>
        ) : (
          <p style={{ color: "#806976" }}>
            {selected.status === "ACTIVE" ? "Log in as a buyer to place a bid." : "This auction has ended."}
          </p>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lussoUser") || "null"); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("lussoToken") || "");
  const [auctions, setAuctions] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [bids, setBids] = useState([]);
  const [sellerBids, setSellerBids] = useState([]);
  const [wins, setWins] = useState([]);
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [adminDisputes, setAdminDisputes] = useState([]);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [bid, setBid] = useState("");
  const [auctionBids, setAuctionBids] = useState([]);
  const [authMode, setAuthMode] = useState("login");
  const [auth, setAuth] = useState({ name: "", email: "", password: "", phone: "", role: "BUYER" });
  const [form, setForm] = useState({ name: "", description: "", category: "Electronics", starting_price: "", duration: "2", duration_unit: "DAYS", image: null });
  const [dispute, setDispute] = useState({ auction_id: "", seller_id: "", reason: "" });
  const [payment, setPayment] = useState({ auction_id: "", amount: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete api.defaults.headers.common.Authorization;
  }, [token]);

  const ok = (text) => {
    setMsg(text); setErr("");
    window.setTimeout(() => setMsg(""), 3500);
  };
  const bad = (text) => { setErr(text); setMsg(""); };

  async function loadAuctions() {
    try { const r = await api.get("/auctions"); setAuctions(r.data); setErr(""); }
    catch { bad("Backend is not running or MySQL is unavailable. Start node server.js in the backend terminal."); }
  }
  async function loadWatch() { if (!user) return; try { setWatchlist((await api.get(`/watchlist/${user.user_id}`)).data); } catch {} }
  async function loadBids() {
    try { setBids((await api.get("/my-bids")).data); } catch {}
  }

  async function loadSellerBids(list = auctions) {
    if (!user || user.role !== "SELLER") return;
    const mine = list.filter((a) => Number(a.seller_id) === Number(user.user_id));
    try {
      const results = await Promise.all(
        mine.map((a) => api.get(`/auctions/${a.auction_id}/bids`))
      );
      setSellerBids(results.flatMap((r) => r.data));
    } catch (e) {
      console.error("Could not load seller bids", e);
    }
  }
  async function loadWins() { try { setWins((await api.get("/won-auctions")).data); } catch {} }
  async function loadNotes() { try { setNotes((await api.get("/notifications")).data); } catch {} }
  async function loadAdmin() {
    try {
      const [a, b, c] = await Promise.all([api.get("/admin/stats"), api.get("/admin/users"), api.get("/admin/disputes")]);
      setStats(a.data); setUsers(b.data); setAdminDisputes(c.data);
    } catch {}
  }

  useEffect(() => {
    loadAuctions();

    const onBid = (data) => {
      // Update every visible auction immediately without refreshing.
      setAuctions((old) => old.map((a) =>
        Number(a.auction_id) === Number(data.auction_id)
          ? {
              ...a,
              current_price: data.new_price,
              end_time: data.new_end_time || a.end_time,
              bid_count: Number(a.bid_count || 0) + 1
            }
          : a
      ));

      // Update the open bidding window immediately.
      if (selected && Number(selected.auction_id) === Number(data.auction_id)) {
        setSelected((old) => old ? {
          ...old,
          current_price: data.new_price,
          end_time: data.new_end_time || old.end_time
        } : old);
        setAuctionBids((old) => [data, ...old.filter((b) => Number(b.bid_id) !== Number(data.bid_id))]);
      }

      // Seller dashboard receives the new bid instantly.
      if (user?.role === "SELLER") {
        setSellerBids((old) => [
          data,
          ...old.filter((b) => Number(b.bid_id) !== Number(data.bid_id))
        ]);
      }
    };

    const onCreated = () => loadAuctions();
    const onCompleted = () => loadAuctions();
    const onNotification = (data) => { ok(data.message); loadNotes(); };

    socket.on("bidUpdate", onBid);
    socket.on("auctionCreated", onCreated);
    socket.on("auctionCompleted", onCompleted);
    socket.on("notification", onNotification);

    return () => {
      socket.off("bidUpdate", onBid);
      socket.off("auctionCreated", onCreated);
      socket.off("auctionCompleted", onCompleted);
      socket.off("notification", onNotification);
    };
  }, [selected, user]);

  // Join the currently opened auction room so Socket.io can deliver live updates.
  useEffect(() => {
    if (!selected) return;
    const id = selected.auction_id;
    socket.emit("joinAuction", id);
    api.get(`/auctions/${id}/bids`)
      .then((r) => setAuctionBids(r.data))
      .catch(() => setAuctionBids([]));
    return () => socket.emit("leaveAuction", id);
  }, [selected?.auction_id]);

  useEffect(() => {
    if (!user) return;
    socket.emit("joinUser", user.user_id);
    loadWatch();
    loadNotes();
    if (user.role === "BUYER") {
      loadBids();
      loadWins();
    }
    if (user.role === "SELLER") {
      loadSellerBids(auctions);
    }
    if (user.role === "ADMIN") loadAdmin();
  }, [user]);

  useEffect(() => {
    if (user?.role === "SELLER" && auctions.length) {
      loadSellerBids(auctions);
    }
  }, [auctions, user]);

  async function submitAuth(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    try {
      const payload = authMode === "login" ? { email: auth.email, password: auth.password } : auth;
      const response = await api.post(authMode === "login" ? "/login" : "/signup", payload);
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem("lussoUser", JSON.stringify(response.data.user));
      localStorage.setItem("lussoToken", response.data.token);
      setAuth({ name: "", email: "", password: "", phone: "", role: "BUYER" });
      setPage("home");
      ok("Welcome to LUSSO! ✨");
    } catch (e) {
      bad(e.response?.data?.message || "Authentication failed. Check the backend terminal.");
    }
  }

  function logout() {
    setUser(null); setToken("");
    localStorage.removeItem("lussoUser");
    localStorage.removeItem("lussoToken");
    setPage("home");
    ok("Logged out successfully.");
  }

  async function toggleWatch(a) {
    if (!user || user.role !== "BUYER") { setAuthMode("login"); setPage("auth"); return; }
    try { ok((await api.post("/watchlist", { auction_id: a.auction_id })).data.message); loadWatch(); }
    catch (e) { bad(e.response?.data?.message || "Watchlist error"); }
  }

  async function placeBid(e) {
    e.preventDefault();
    if (!selected) return;
    try {
      const response = await api.post("/bids", { auction_id: selected.auction_id, bid_amount: Number(bid) });
      ok(response.data.message);
      setBid("");
      setSelected((old) => old ? {
        ...old,
        current_price: response.data.new_price,
        end_time: response.data.new_end_time || old.end_time
      } : old);
      loadAuctions();
      loadBids();
    } catch (e) { bad(e.response?.data?.message || "Bid failed"); }
  }

  async function createAuction(e) {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "image") { if (value) data.append("image", value); }
      else data.append(key, value);
    });
    try {
      const response = await api.post("/seller/auction", data, { headers: { "Content-Type": "multipart/form-data" } });
      ok(response.data.message);
      setForm({ name: "", description: "", category: "Electronics", starting_price: "", duration: "2", duration_unit: "DAYS", image: null });
      loadAuctions(); setPage("home");
    } catch (e) { bad(e.response?.data?.message || "Could not create auction"); }
  }

  async function completeAuction(id) {
    try { ok((await api.post(`/auctions/${id}/complete`)).data.message); loadAuctions(); loadWins(); }
    catch (e) { bad(e.response?.data?.message || "Could not complete auction"); }
  }

  async function pay(e) {
    e.preventDefault();
    try { ok((await api.post("/payments", payment)).data.message); setPayment({ auction_id: "", amount: "" }); }
    catch (e) { bad(e.response?.data?.message || "Payment failed"); }
  }

  async function openDispute(e) {
    e.preventDefault();
    try { ok((await api.post("/disputes", dispute)).data.message); setDispute({ auction_id: "", seller_id: "", reason: "" }); }
    catch (e) { bad(e.response?.data?.message || "Could not create dispute"); }
  }

  async function markRead() {
    try { await api.put("/notifications/read-all"); loadNotes(); } catch {}
  }

  const categories = useMemo(() => ["ALL", ...new Set(auctions.map((a) => a.category).filter(Boolean))], [auctions]);

  return (
    <div style={styles.page}>
      <GlobalStyles />
      <Nav user={user} setPage={setPage} setAuthMode={setAuthMode} logout={logout} />

      {msg && <div style={{ position: "fixed", right: 20, top: 90, zIndex: 100, background: "#d94b87", color: "#fff", padding: "14px 18px", borderRadius: 14, boxShadow: "0 15px 30px rgba(201,54,117,.25)" }}>{msg}</div>}
      {err && <div style={{ margin: "15px clamp(22px,6vw,90px)", background: "#ffe7ed", color: "#a12a47", padding: 14, borderRadius: 14 }}>{err}</div>}

      {page === "home" && <Home auctions={auctions} search={search} setSearch={setSearch} cat={cat} setCat={setCat} categories={categories} user={user} watchlist={watchlist} toggleWatch={toggleWatch} setSelected={setSelected} setPage={setPage} setAuthMode={setAuthMode} />}

      {page === "auth" && <AuthPage authMode={authMode} setAuthMode={setAuthMode} auth={auth} setAuth={setAuth} submitAuth={submitAuth} />}

      {page === "watch" && <Watch watchlist={watchlist} auctions={auctions} setSelected={setSelected} toggleWatch={toggleWatch} />}

      {page === "buyer" && <Buyer bids={bids} watchlist={watchlist} wins={wins} notes={notes} payment={payment} setPayment={setPayment} pay={pay} dispute={dispute} setDispute={setDispute} openDispute={openDispute} markRead={markRead} />}

      {page === "seller" && <Seller user={user} auctions={auctions} sellerBids={sellerBids} form={form} setForm={setForm} createAuction={createAuction} complete={completeAuction} />}

      {page === "admin" && <Admin stats={stats} users={users} disputes={adminDisputes} />}

      <footer style={{ background: "#281c24", color: "#fff", padding: "40px clamp(22px,6vw,90px)", marginTop: 40 }}>
        <b style={{ letterSpacing: 4, fontFamily: "Georgia,serif" }}>LUSSO.</b>
        <p style={{ color: "#d9c4ce" }}>Online Auction & Bidding Platform</p>
      </footer>

      <BidModal selected={selected} user={user} bid={bid} setBid={setBid} placeBid={placeBid} auctionBids={auctionBids} close={() => { setSelected(null); setBid(""); setAuctionBids([]); }} />
    </div>
  );
}
