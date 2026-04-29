"use client";

import { useState } from "react";

export default function AdminPage() {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <style>{`
        :root { --azul: #0a2a5e; --dourado: #f5c842; --cinza: #8a8070; --sidebar-w: 260px; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Sora, sans-serif; display: flex; min-height: 100vh; }
        .sidebar { width: var(--sidebar-w); background: var(--azul); flex-direction: column; position: fixed; height: 100vh; transition: transform 0.3s; }
        .sidebar.fechada { transform: translateX(-100%); }
        .nome { font-size: 16px; font-weight: 800; color: white; }
        .nome span { color: var(--dourado); }
        .nav-link { padding: 12px 20px; color: rgba(255,255,255,0.6); cursor: pointer; border-left: 3px solid transparent; background: none; border: none; width: 100%; text-align: left; }
        .nav-link.ativo { background: rgba(245,200,66,0.1); color: var(--dourado); border-left-color: var(--dourado); }
        .admin-main { margin-left: var(--sidebar-w); flex: 1; display: flex; flex-direction: column; }
        .admin-header { background: white; padding: 16px 28px; display: flex; justify-content: space-between; border-bottom: 1px solid #e8e4de; }
        .admin-content { padding: 28px; flex: 1; }
        table { width: 100%; border-collapse: collapse; background: white; border-radius: 16px; }
        th { background: #f8f6f2; padding: 14px 16px; text-align: left; font-size: 12px; font-weight: 700; color: var(--azul); border-bottom: 1px solid #e8e4de; }
        td { padding: 14px 16px; border-bottom: 1px solid #f0eeea; font-size: 13px; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh" }}>
        <div style={{ width: "260px", background: "var(--azul)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="nome">FUTURA<span>SAUDE</span></div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", marginTop: "3px" }}>Admin</div>
          </div>
          <nav style={{ flex: 1, padding: "16px 0" }}>
            <button className={`nav-link ${currentTab === "dashboard" ? "ativo" : ""}`} onClick={() => setCurrentTab("dashboard")}>D</button>
            <button className={`nav-link ${currentTab === "usuarios" ? "ativo" : ""}`} onClick={() => setCurrentTab("usuarios")}>U</button>
          </nav>
        </div>
        <div className="admin-main">
          <div className="admin-header">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>M</button>
            <span style={{ fontWeight: "700", color: "var(--azul)" }}>Admin Dashboard</span>
          </div>
          <div className="admin-content">
            <table><thead><tr><th>Nome</th><th>Email</th></tr></thead><tbody><tr><td>User1</td><td>u1@mail.com</td></tr></tbody></table>
          </div>
        </div>
      </div>
    </>
  );
}
