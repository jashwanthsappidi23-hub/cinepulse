import React, { useState, useEffect } from "react";
import { 
  Briefcase, Shield, User, Lock, Mail, Sparkles, 
  ArrowRight, ArrowLeft 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function PortalGateScreen({ portalType, onSwitchPortal }) {
  const { login, quickLogin, showToast } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const portalConfig = {
    manager: {
      name: "Cinema Manager Portal",
      badge: "Cinema Operations & Hall Management",
      icon: Briefcase,
      accentColor: "amber",
      email: "manager@gmail.com",
      password: "password123",
      heroBg: "from-amber-600/20 via-slate-900/40 to-transparent",
      borderColor: "border-amber-500/40",
      btnBg: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30",
      pillBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      focusBorder: "focus:border-amber-500"
    },
    admin: {
      name: "System Administrator Portal",
      badge: "Enterprise DBMS & Analytical Control Room",
      icon: Shield,
      accentColor: "purple",
      email: "admin@gmail.com",
      password: "password123",
      heroBg: "from-purple-600/20 via-slate-900/40 to-transparent",
      borderColor: "border-purple-500/40",
      btnBg: "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/30",
      pillBg: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      focusBorder: "focus:border-purple-500"
    },
    customer: {
      name: "Customer Patron Portal",
      badge: "Cinema Ticket & Concession Booking",
      icon: User,
      accentColor: "red",
      email: "customer@gmail.com",
      password: "password123",
      heroBg: "from-red-600/20 via-slate-900/40 to-transparent",
      borderColor: "border-red-500/40",
      btnBg: "bg-red-600 hover:bg-red-700 text-white shadow-red-600/30",
      pillBg: "bg-red-500/10 text-red-400 border-red-500/30",
      focusBorder: "focus:border-red-500"
    }
  };

  const current = portalConfig[portalType] || portalConfig.manager;
  const [emailInput, setEmailInput] = useState(current.email);
  const [passwordInput, setPasswordInput] = useState(current.password);

  useEffect(() => {
    setEmailInput(current.email);
    setPasswordInput(current.password);
  }, [portalType, current.email, current.password]);

  const handleLaunchOneClick = async () => {
    setLoading(true);
    setError(null);
    try {
      await quickLogin(portalType);
      showToast(`Welcome to ${current.name}!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(emailInput, passwordInput);
      showToast(`Logged into ${current.name}!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-fade-in">
      {/* Return button */}
      <button
        onClick={() => onSwitchPortal("customer")}
        className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Customer Portal
      </button>

      {/* Authenticate to Access Portal Section ONLY */}
      <div className={`p-6 sm:p-8 rounded-2xl bg-[#0B0F19] border ${current.borderColor || "border-slate-800"} shadow-2xl space-y-5`}>
        <div>
          <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Authenticate to Access Portal
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Use the 1-click launch button or enter credentials manually.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs">
            ⚠️ {error}
          </div>
        )}

        {/* 1-Click Instant Launch Button */}
        <button
          onClick={handleLaunchOneClick}
          disabled={loading}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] ${current.btnBg}`}
        >
          {loading ? (
            "Authenticating..."
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> 1-Click Launch as {current.email}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-[#0B0F19] px-3 text-[10px] text-slate-500 font-semibold uppercase">Or Enter Manually</span>
          <div className="border-t border-slate-800 w-full" />
        </div>

        {/* Manual Form */}
        <form onSubmit={handleManualLogin} className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Gmail Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none ${current.focusBorder}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none ${current.focusBorder}`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Sign In to {current.name}
          </button>
        </form>
      </div>
    </div>
  );
}
