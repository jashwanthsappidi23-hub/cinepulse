import React, { useState, useMemo, useEffect } from "react";
import { 
  MapPin, Search, X, Compass, Check, Building2, 
  Sparkles, Globe2, ChevronRight 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function CityModal() {
  const { 
    selectedCity, 
    setCity, 
    cities, 
    citiesDirectory, 
    cityModalOpen, 
    closeCityModal 
  } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("All");
  const [detecting, setDetecting] = useState(false);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeCityModal();
    };
    if (cityModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [cityModalOpen]);

  // Reset search when opened
  useEffect(() => {
    if (cityModalOpen) {
      setSearch("");
      setSelectedState("All");
    }
  }, [cityModalOpen]);

  const popularList = citiesDirectory?.popular || [
    { name: "Mumbai", state: "Maharashtra", icon: "🏛️", landmark: "Gateway of India" },
    { name: "Delhi-NCR", state: "Delhi / Haryana / UP", icon: "🇮🇳", landmark: "India Gate" },
    { name: "Bengaluru", state: "Karnataka", icon: "🌳", landmark: "Vidhana Soudha" },
    { name: "Hyderabad", state: "Telangana", icon: "🕌", landmark: "Charminar" },
    { name: "Ahmedabad", state: "Gujarat", icon: "🪁", landmark: "Sabarmati Riverfront" },
    { name: "Chennai", state: "Tamil Nadu", icon: "🛕", landmark: "Marina Beach" },
    { name: "Kolkata", state: "West Bengal", icon: "🌉", landmark: "Howrah Bridge" },
    { name: "Pune", state: "Maharashtra", icon: "🏯", landmark: "Shaniwar Wada" },
    { name: "Chandigarh", state: "Punjab / Haryana", icon: "🌹", landmark: "Rock Garden" },
    { name: "Kochi", state: "Kerala", icon: "⛵", landmark: "Chinese Fishing Nets" },
    { name: "Jaipur", state: "Rajasthan", icon: "🏰", landmark: "Hawa Mahal" },
    { name: "Lucknow", state: "Uttar Pradesh", icon: "🕌", landmark: "Rumi Darwaza" },
    { name: "Indore", state: "Madhya Pradesh", icon: "🏛️", landmark: "Rajwada Palace" },
    { name: "Visakhapatnam", state: "Andhra Pradesh", icon: "🌊", landmark: "RK Beach" },
    { name: "Goa", state: "Goa", icon: "🌴", landmark: "Panaji Beaches" },
    { name: "Surat", state: "Gujarat", icon: "💎", landmark: "Diamond City" }
  ];

  const allCitiesList = citiesDirectory?.all_cities || cities.map(c => ({ name: c, state: "India", tier: 2 }));

  // Extract unique states
  const statesList = useMemo(() => {
    const s = new Set();
    allCitiesList.forEach(c => {
      if (c.state) s.add(c.state);
    });
    return ["All", ...Array.from(s).sort()];
  }, [allCitiesList]);

  // Filtered Cities
  const filteredCities = useMemo(() => {
    let list = allCitiesList;
    if (selectedState !== "All") {
      list = list.filter(c => c.state === selectedState);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.state.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allCitiesList, search, selectedState]);

  // GPS Simulation
  const handleDetectLocation = () => {
    setDetecting(true);
    setTimeout(() => {
      setDetecting(false);
      // Auto-pick Mumbai or user's city
      setCity("Mumbai");
    }, 800);
  };

  if (!cityModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[#0F1420] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-[#131926]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-red-600/20 text-red-500">
                <MapPin className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                Select Your City
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Explore 100+ movies & multiplexes across all 190+ cities of India
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDetectLocation}
              disabled={detecting}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-slate-200 border border-slate-700 transition-all active:scale-95"
            >
              <Compass className={`w-4 h-4 text-red-500 ${detecting ? "animate-spin" : ""}`} />
              <span>{detecting ? "Detecting GPS..." : "Detect Location"}</span>
            </button>

            <button
              onClick={closeCityModal}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar & State Filter */}
        <div className="p-4 sm:p-6 border-b border-slate-800/60 bg-[#0B0F19]/60 space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for your city (e.g. Hyderabad, Mumbai, Delhi, Warangal, Kochi...)"
              autoFocus
              className="w-full pl-11 pr-10 py-3 bg-[#131926] border border-slate-700 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors shadow-inner"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick State Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Filter State:
            </span>
            {["All", "Maharashtra", "Karnataka", "Telangana", "Tamil Nadu", "Delhi / Haryana / UP", "Gujarat", "Kerala", "West Bengal", "Rajasthan", "Andhra Pradesh", "Punjab", "Madhya Pradesh"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedState(st)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedState === st
                    ? "bg-red-600 text-white font-semibold"
                    : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
          
          {/* Popular Cities Section (BookMyShow standard) */}
          {!search && selectedState === "All" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Popular Metros & Cinema Hubs
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">16 Flagship Cities</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                {popularList.map((pc) => {
                  const isSelected = selectedCity.toLowerCase() === pc.name.toLowerCase();
                  return (
                    <button
                      key={pc.name}
                      onClick={() => setCity(pc.name)}
                      className={`group flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? "bg-red-600/20 border-red-500 shadow-lg shadow-red-950/40 text-white"
                          : "bg-[#131926]/70 border-slate-800 hover:border-slate-700 hover:bg-[#1a2233] text-slate-300"
                      }`}
                    >
                      <div className="text-3xl mb-1.5 group-hover:scale-110 transition-transform">
                        {pc.icon}
                      </div>
                      <span className="text-xs font-bold truncate max-w-full group-hover:text-white">
                        {pc.name}
                      </span>
                      <span className="text-[9px] text-slate-400 truncate max-w-full">
                        {pc.landmark}
                      </span>
                      {isSelected && (
                        <div className="mt-1 flex items-center gap-0.5 text-[9px] text-red-400 font-bold">
                          <Check className="w-3 h-3" /> Selected
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Indian Cities Catalog */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-red-500" />
                All Cities of India ({filteredCities.length})
              </h3>
              {search && (
                <span className="text-[11px] text-slate-400">
                  Matching &ldquo;{search}&rdquo;
                </span>
              )}
            </div>

            {filteredCities.length === 0 ? (
              <div className="py-12 text-center rounded-2xl bg-[#131926]/50 border border-slate-800 text-slate-400 text-sm">
                <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                No city found matching &ldquo;{search}&rdquo;. Try another spelling or select a nearby metro!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {filteredCities.map((c) => {
                  const isSelected = selectedCity.toLowerCase() === c.name.toLowerCase();
                  return (
                    <button
                      key={c.name}
                      onClick={() => setCity(c.name)}
                      className={`text-left px-3.5 py-2.5 rounded-xl border transition-all flex items-center justify-between group ${
                        isSelected
                          ? "bg-red-600 border-red-500 text-white font-bold shadow-md shadow-red-600/30"
                          : "bg-[#131926]/50 border-slate-800/80 hover:border-slate-700 hover:bg-[#182030] text-slate-300"
                      }`}
                    >
                      <div className="truncate pr-1">
                        <div className="text-xs font-semibold truncate group-hover:text-white">
                          {c.name}
                        </div>
                        <div className={`text-[10px] truncate ${isSelected ? "text-red-100" : "text-slate-500"}`}>
                          {c.state}
                        </div>
                      </div>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#131926]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Currently Active: <strong className="text-white">{selectedCity}</strong></span>
          </div>
          <span className="text-[11px] text-slate-500">
            CinePulse Network • 190+ Cities Across India
          </span>
        </div>

      </div>
    </div>
  );
}
