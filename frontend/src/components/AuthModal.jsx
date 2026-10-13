import React, { useState, useEffect } from "react";
import { 
  X, Lock, Mail, User, Phone, Sparkles, Shield, 
  Briefcase, KeyRound, CheckCircle2, ArrowRight 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ isOpen, onClose, initialPortal = "customer" }) {
  const { login, register, quickLogin } = useAuth();
  
  // Selected Portal Tab: "customer" | "manager" | "admin"
  const [activePortal, setActivePortal] = useState(initialPortal);
  const [isRegister, setIsRegister] = useState(false);
  
  // Form Fields
  const [email, setEmail] = useState("customer@gmail.com");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const portalsData = {
    customer: {
      name: "Customer Portal",
      title: "Customer Ticket Booking Login",
      badge: "Cinema Patron",
      color: "red",
      email: "customer@gmail.com",
      password: "password123",
      icon: User,
      desc: "Sign in to book movies, reserve seats, order snacks, and view tickets."
    },
    manager: {
      name: "Manager Portal",
      title: "Cinema Manager Operations Login",
      badge: "Multiplex Operations",
      color: "amber",
      email: "manager@gmail.com",
      password: "password123",
      icon: Briefcase,
      desc: "Sign in to schedule screenings, maintain screens & seats, and update concession stock."
    },
    admin: {
      name: "Admin Portal",
      title: "System Administrator DBMS Login",
      badge: "DBMS System Admin",
      color: "purple",
      email: "admin@gmail.com",
      password: "password123",
      icon: Shield,
      desc: "Sign in to inspect DBMS audit trail logs, analytical reports, user role administration, and financial data."
    }
  };

  useEffect(() => {
    if (isOpen) {
      const p = portalsData[initialPortal] ? initialPortal : "customer";
      setActivePortal(p);
      setEmail(portalsData[p].email);
      setPassword(portalsData[p].password);
      setError(null);
      setIsRegister(false);
    }
  }, [isOpen, initialPortal]);

  const handlePortalTabSwitch = (pKey) => {
    setActivePortal(pKey);
    setEmail(portalsData[pKey].email);
    setPassword(portalsData[pKey].password);
    setError(null);
    setIsRegister(false);
  };

  if (!isOpen) return null;

  const currentPortalConfig = portalsData[activePortal];
  const Icon = currentPortalConfig.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister && activePortal === "customer") {
        await register({ name, email, password, phone, role: "customer" });
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOneClickLogin = async (pKey) => {
    setError(null);
    setLoading(true);
    try {
      await quickLogin(pKey);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#131926] border border-slate-700 shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top 3-Way Portal Selector Tabs */}
        <div className="mb-6">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center mb-2.5">
            Select Login Portal
          </div>
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#0B0F19] border border-slate-800">
            {Object.entries(portalsData).map(([key, item]) => {
              const TabIcon = item.icon;
              const isActive = activePortal === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePortalTabSwitch(key)}
                  className={`py-2 px-2.5 rounded-xl font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                    isActive
                      ? key === "customer"
                        ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                        : key === "manager"
                        ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                        : "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span>{item.name.replace(" Portal", "")}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Portal Header */}
        <div className="text-center mb-5">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-2.5 shadow-lg ${
            activePortal === "customer" ? "bg-red-600/20 text-red-500 border border-red-500/30" :
            activePortal === "manager" ? "bg-amber-600/20 text-amber-500 border border-amber-500/30" :
            "bg-purple-600/20 text-purple-500 border border-purple-500/30"
          }`}>
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-white">
            {isRegister ? "Join CinePulse" : currentPortalConfig.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {isRegister
              ? "Create your patron account to book screenings & concessions"
              : currentPortalConfig.desc}
          </p>
        </div>

        {/* Prominent Gmail Format Credentials Card */}
        {!isRegister && (
          <div className={`mb-5 p-3.5 rounded-2xl border bg-[#0B0F19]/90 text-left ${
            activePortal === "customer" ? "border-red-900/60" :
            activePortal === "manager" ? "border-amber-900/60" :
            "border-purple-900/60"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                {currentPortalConfig.name} Credentials
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold">
                GMAIL FORMAT
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Login ID</span>
                <span className="text-white font-bold truncate block select-all">{currentPortalConfig.email}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Password</span>
                <span className="text-emerald-400 font-bold block select-all">{currentPortalConfig.password}</span>
              </div>
            </div>

            {/* 1-Click Launch Button for this Portal */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleOneClickLogin(activePortal)}
              className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01] ${
                activePortal === "customer"
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/30"
                  : activePortal === "manager"
                  ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30"
                  : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/30"
              }`}
            >
              <Sparkles className="w-4 h-4" /> 1-Click Login as {currentPortalConfig.email}
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Manual Credentials Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <>
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sahasra Reddy"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91-9988776655"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Gmail Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={currentPortalConfig.email}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              isRegister
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
          >
            {loading ? "Processing..." : isRegister ? "Create Customer Account" : `Sign In with Email`}
          </button>
        </form>

        {/* Register / Sign In Switch for Customer Portal */}
        {activePortal === "customer" && (
          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              {isRegister ? (
                <>Already have an account? <span className="text-red-400 font-bold underline">Sign In</span></>
              ) : (
                <>New to CinePulse? <span className="text-red-400 font-bold underline">Register Customer Account</span></>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
