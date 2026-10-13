import React from "react";
import { Database, Film, ShieldCheck, Server, Sparkles, KeyRound, User, Briefcase, Shield } from "lucide-react";

export default function Footer({ setActiveTab, onSelectPortal }) {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-[#070A12] text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black">
                🎬
              </div>
              <span className="text-xl font-black tracking-wider text-white">
                CINE<span className="text-red-500">PULSE</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Enterprise Cinema Screening and Ticket Booking Platform with Interactive Seating, Real-Time Concurrency Locks, and 3NF Relational DBMS Analytics.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-mono">
              <Database className="w-3.5 h-3.5" /> 18 Normalized 3NF Tables
            </div>
          </div>

          {/* Customer Portal Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Customer Portal Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => { onSelectPortal("customer"); setActiveTab("home"); }} className="hover:text-red-400 transition-colors">
                  Home & Featured Releases
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectPortal("customer"); setActiveTab("movies"); }} className="hover:text-red-400 transition-colors">
                  Now Showing & 100+ Movies
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectPortal("customer"); setActiveTab("cinemas"); }} className="hover:text-red-400 transition-colors">
                  Multiplex Theatres & Shows
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectPortal("customer"); setActiveTab("my-bookings"); }} className="hover:text-red-400 transition-colors">
                  My Bookings & QR Tickets
                </button>
              </li>
            </ul>
          </div>

          {/* DBMS Architecture */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              DBMS Academic Architecture
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-mono">
              <li>• Third Normal Form (3NF)</li>
              <li>• Concurrency Locks (TTL: 5m)</li>
              <li>• ACID Financial Transactions</li>
              <li>• 8 Relational Analytical Views</li>
              <li>• Immutable Audit Trail Logs</li>
            </ul>
          </div>

          {/* Portals & Gmail Credentials */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" /> All 3 Login Portals
            </h4>
            <div className="space-y-2.5 text-xs">
              
              {/* Customer */}
              <button
                onClick={() => onSelectPortal("customer")}
                className="w-full text-left p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-red-500/50 transition-colors group"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-red-400 mb-0.5">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> Customer Portal</span>
                  <span className="text-[10px] text-slate-500">Patron</span>
                </div>
                <div className="text-[11px] font-mono text-slate-300">
                  <span>customer@gmail.com</span> • <span className="text-emerald-400">password123</span>
                </div>
              </button>

              {/* Manager */}
              <button
                onClick={() => onSelectPortal("manager")}
                className="w-full text-left p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-colors group"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 mb-0.5">
                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> Manager Portal</span>
                  <span className="text-[10px] text-slate-500">Ops</span>
                </div>
                <div className="text-[11px] font-mono text-slate-300">
                  <span>manager@gmail.com</span> • <span className="text-emerald-400">password123</span>
                </div>
              </button>

              {/* Admin */}
              <button
                onClick={() => onSelectPortal("admin")}
                className="w-full text-left p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 transition-colors group"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-purple-400 mb-0.5">
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Admin Portal</span>
                  <span className="text-[10px] text-slate-500">DBMS</span>
                </div>
                <div className="text-[11px] font-mono text-slate-300">
                  <span>admin@gmail.com</span> • <span className="text-emerald-400">password123</span>
                </div>
              </button>

            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 CinePulse Cinema Systems. College DBMS Project Demonstration.</p>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>MySQL 8.0 / FastAPI REST / React 18</span>
            <span className="text-emerald-400">● 3 Portals Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
