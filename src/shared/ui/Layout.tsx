import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <header
        style={{
          display: "flex",
          gap: 12,
          padding: 12,
          borderBottom: "1px solid #ddd"
        }}
      >
        <Link to="/">home</Link>
        <Link to="/settings">settings</Link>
        <Link to="/ping">ping</Link>
      </header>

      <main style={{ padding: 12 }}>
        <Outlet />
      </main>
    </div>
  );
}
