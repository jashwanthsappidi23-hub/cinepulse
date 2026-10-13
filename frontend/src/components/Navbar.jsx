import React, { useState } from "react";
import { 
  Film, MapPin, User, LogOut, Shield, Briefcase, 
  Ticket, ChevronDown, Sparkles, KeyRound, ExternalLink, Layers 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ 
  currentPortal, 
  onSelectPortal, 
  activeTab, 
  setActiveTab, 
  openAuthModal 
}) {
  const { user, isAuthenticated, role, logout, selectedCity, quickLogin, openCityModal } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [portalsMenuOpen, setPortalsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      
      {/* Top Portals Switcher Ribbon */}
      <div className="bg-[#070A11] border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          {/* Active Portal Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mr-1 hidden sm:inline flex items-center gap-1">
              <Layers className="w-3 h-3 text-red-500" /> Portals:
            </span>

            {/* Customer Portal Pill */}
            <button
              onClick={() => onSelectPortal("customer")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentPortal === "customer"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              <User className="w-3 h-3" />
              <span>Customer Portal</span>
            </button>

            {/* Manager Portal Pill */}
            <button
              onClick={() => onSelectPortal("manager")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentPortal === "manager"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              <Briefcase className="w-3 h-3" />
              <span>Manager Portal</span>
            </button>

            {/* Admin Portal Pill */}
            <button
              onClick={() => onSelectPortal("admin")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentPortal === "admin"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>Admin Portal</span>
            </button>
          </div>

          {/* Gmail Credentials Quick Reference */}
          <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span className="text-slate-500 font-sans text-[10px] font-semibold uppercase flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-emerald-400" /> Passwords (All: password123):
            </span>
            <span className="hover:text-red-400 cursor-pointer" onClick={() => quickLogin("customer")} title="Click to 1-Click Login">
              👤 customer@gmail.com
            </span>
            <span>•</span>
            <span className="hover:text-amber-400 cursor-pointer" onClick={() => quickLogin("manager")} title="Click to 1-Click Login">
              🎬 manager@gmail.com
            </span>
            <span>•</span>
            <span className="hover:text-purple-400 cursor-pointer" onClick={() => quickLogin("admin")} title="Click to 1-Click Login">
              ⚙️ admin@gmail.com
            </span>
          </div>

        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & City Selector */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => onSelectPortal("customer")}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-wider text-white">
                  CINE<span className="text-red-500">PULSE</span>
                </span>
                <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  Cinema Booking System
                </span>
              </div>
            </button>

            {/* City Selector */}
            <div className="flex items-center">
              <button
                onClick={openCityModal}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-300 hover:text-white hover:border-red-500/60 hover:bg-slate-800/80 transition-all shadow-sm group"
                title="Select City (190+ Cities in India)"
              >
                <MapPin className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-red-500 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-slate-100 max-w-[90px] sm:max-w-none truncate">{selectedCity}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          {/* Customer Sub-Nav Links (Only when Customer Portal is active) */}
          {currentPortal === "customer" && (
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => setActiveTab("home")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "home" ? "text-white bg-slate-800/80 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab("movies")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "movies" ? "text-white bg-slate-800/80 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Movies
              </button>
              <button
                onClick={() => setActiveTab("cinemas")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "cinemas" ? "text-white bg-slate-800/80 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Cinemas
              </button>
              <button
                onClick={() => setActiveTab("my-bookings")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === "my-bookings" ? "text-white bg-slate-800/80 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                <Ticket className="w-4 h-4 text-red-400" />
                My Bookings
              </button>
            </nav>
          )}

          {/* Manager Portal Context Indicator */}
          {currentPortal === "manager" && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>Cinema Manager Operations Suite</span>
            </div>
          )}

          {/* Admin Portal Context Indicator */}
          {currentPortal === "admin" && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>System Administrator DBMS Control Room</span>
            </div>
          )}

          {/* Right Action: Auth / User Profile */}
          <div className="flex items-center gap-3">
            
            {/* Login Portals Trigger Button */}
            <button
              onClick={() => openAuthModal(currentPortal)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span>All 3 Login Portals</span>
            </button>

            {/* Profile Dropdown or Sign In */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs uppercase ${
                    role === "admin" ? "bg-purple-600/30 text-purple-400 border border-purple-500/40" :
                    role === "manager" ? "bg-amber-600/30 text-amber-400 border border-amber-500/40" :
                    "bg-red-600/30 text-red-400 border border-red-500/40"
                  }`}>
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-medium text-white truncate max-w-[110px]">{user.name.split(" ")[0]}</div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">{role}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#131926] border border-slate-700 shadow-2xl py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] font-mono text-slate-400 truncate">{user.email}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        role === "admin" ? "bg-purple-900/30 text-purple-300 border-purple-800" :
                        role === "manager" ? "bg-amber-900/30 text-amber-300 border-amber-800" :
                        "bg-red-900/30 text-red-300 border-red-800"
                      }`}>
                        {user.role} Portal Access
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => { onSelectPortal("customer"); setActiveTab("my-bookings"); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Ticket className="w-3.5 h-3.5 text-red-400" /> Customer Bookings
                      </button>

                      <button
                        onClick={() => { onSelectPortal("manager"); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-amber-300 hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Briefcase className="w-3.5 h-3.5" /> Switch to Manager Portal
                      </button>

                      <button
                        onClick={() => { onSelectPortal("admin"); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-purple-300 hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Shield className="w-3.5 h-3.5" /> Switch to Admin Portal
                      </button>
                    </div>

                    <div className="border-t border-slate-800 pt-1">
                      <button
                        onClick={() => { logout(); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal(currentPortal)}
                className="px-4 sm:px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
