import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("cinepulse_token") || null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(localStorage.getItem("cinepulse_city") || "Mumbai");
  const [cities, setCities] = useState(["Mumbai", "Bengaluru", "New Delhi"]);
  const [citiesDirectory, setCitiesDirectory] = useState(null);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  useEffect(() => {
    // Load cities & directory
    api.getCities().then(data => {
      if (data && data.length > 0) setCities(data);
    }).catch(console.error);

    api.getCitiesDirectory().then(dir => {
      if (dir) setCitiesDirectory(dir);
    }).catch(console.error);

    // Load user profile if token exists
    if (token) {
      api.getProfile()
        .then(profile => {
          setUser(profile);
        })
        .catch(() => {
          localStorage.removeItem("cinepulse_token");
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const setCity = (cityName) => {
    setSelectedCity(cityName);
    localStorage.setItem("cinepulse_city", cityName);
    setCityModalOpen(false);
    showToast(`Location updated to ${cityName}! Showing theaters & movies.`);
  };

  const openCityModal = () => setCityModalOpen(true);
  const closeCityModal = () => setCityModalOpen(false);

  const login = async (email, password) => {
    try {
      const data = await api.login({ email, password });
      localStorage.setItem("cinepulse_token", data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      showToast(`Welcome back, ${data.user.name}! (${data.user.role.toUpperCase()})`);
      return { success: true, role: data.user.role };
    } catch (err) {
      showToast(err.message, "error");
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const data = await api.register(userData);
      localStorage.setItem("cinepulse_token", data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      showToast(`Registration successful! Welcome to CinePulse, ${data.user.name}.`);
      return { success: true };
    } catch (err) {
      showToast(err.message, "error");
      throw err;
    }
  };

  const quickLogin = async (role) => {
    const roleEmails = {
      customer: "customer@gmail.com",
      manager: "manager@gmail.com",
      admin: "admin@gmail.com"
    };
    const email = roleEmails[role] || "customer@gmail.com";
    return await login(email, "password123");
  };

  const logout = () => {
    localStorage.removeItem("cinepulse_token");
    setToken(null);
    setUser(null);
    showToast("Signed out successfully.");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        role: user?.role || "guest",
        selectedCity,
        setCity,
        cities,
        citiesDirectory,
        cityModalOpen,
        openCityModal,
        closeCityModal,
        login,
        register,
        quickLogin,
        logout,
        showToast,
        toast
      }}
    >
      {children}
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all duration-300 animate-bounce bg-[#131926] border-slate-700">
          <div className={`w-3 h-3 rounded-full ${toast.type === "error" ? "bg-red-500" : "bg-emerald-400"}`} />
          <span className="text-slate-100">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white">✕</button>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
