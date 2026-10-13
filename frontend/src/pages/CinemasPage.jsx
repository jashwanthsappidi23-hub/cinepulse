import React, { useState, useEffect } from "react";
import { 
  Building, MapPin, Phone, Film, Calendar, 
  Clock, Ticket, ChevronRight, CheckCircle2 
} from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function CinemasPage({ onBookScreening }) {
  const { selectedCity, setCity, cities, openCityModal } = useAuth();
  const [cinemas, setCinemas] = useState([]);
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCinemaId, setSelectedCinemaId] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getCinemas(selectedCity),
      api.getScreenings({ city: selectedCity })
    ])
      .then(([cinemasData, screeningsData]) => {
        setCinemas(cinemasData || []);
        setScreenings(screeningsData || []);
        if (cinemasData?.length > 0) {
          setSelectedCinemaId(cinemasData[0].cinema_id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCity]);

  const activeCinema = cinemas.find(c => c.cinema_id === selectedCinemaId) || cinemas[0];
  const cinemaScreenings = screenings.filter(s => s.cinema_id === activeCinema?.cinema_id);
  const isDirectMatch = activeCinema?.is_direct_match !== false;

  return (
    <div className="space-y-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Building className="w-6 h-6 text-red-500" /> Cinema Theaters & Screens
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse premium auditoriums, IMAX Laser setups, and show schedules across India
          </p>
        </div>

        {/* City Filter Button */}
        <button
          onClick={openCityModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#131926] border border-slate-800 hover:border-red-500/60 hover:bg-slate-800/80 text-xs text-slate-300 transition-all group w-fit"
          title="Select from 190+ Indian Cities"
        >
          <MapPin className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
          <span className="text-white font-bold">{selectedCity}</span>
          <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-2">Change City</span>
        </button>
      </div>

      {!isDirectMatch && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Showing flagship CinePulse multiplexes and regional network screenings for <strong>{selectedCity}</strong>.</span>
          </div>
          <button 
            onClick={openCityModal}
            className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 font-semibold text-[11px] shrink-0 transition-colors"
          >
            Change City
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20 text-slate-400">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cinema List Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Theaters in {selectedCity} ({cinemas.length})
            </h3>

            <div className="space-y-3">
              {cinemas.map((cinema) => {
                const isSelected = cinema.cinema_id === activeCinema?.cinema_id;
                return (
                  <button
                    key={cinema.cinema_id}
                    onClick={() => setSelectedCinemaId(cinema.cinema_id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-[#131926] border-red-600 shadow-xl shadow-red-950/20"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-[#131926]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-sm font-bold text-white line-clamp-1">{cinema.name}</h4>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-red-500" />}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 flex items-center gap-1.5 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {cinema.address}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {cinema.screen_types?.map((st, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                          {st}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Cinema Details & Show Schedule */}
          {activeCinema && (
            <div className="lg:col-span-2 space-y-6">
              
              {/* Cinema Overview Card */}
              <div className="p-6 rounded-3xl bg-[#131926] border border-slate-800 shadow-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-2xl font-black text-white">{activeCinema.name}</h2>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Open • {activeCinema.total_screens} Auditoriums
                  </span>
                </div>

                <p className="text-xs text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-500" /> {activeCinema.address}, {activeCinema.city}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-500" /> Contact Desk: {activeCinema.contact_details}
                </p>
              </div>

              {/* Showtimes List */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-500" />
                  Scheduled Screenings ({cinemaScreenings.length})
                </h3>

                {cinemaScreenings.length === 0 ? (
                  <div className="p-10 text-center rounded-2xl bg-[#131926] border border-slate-800 text-slate-400 text-xs">
                    No active screenings currently scheduled at this cinema.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cinemaScreenings.map((show) => (
                      <div
                        key={show.screening_id}
                        className="p-4 sm:p-5 rounded-2xl bg-[#131926] border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex gap-4 items-center">
                          {show.movie_poster && (
                            <img
                              src={show.movie_poster}
                              alt={show.movie_title}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80";
                              }}
                              className="w-14 h-20 rounded-xl object-cover border border-slate-700/60 shrink-0"
                            />
                          )}
                          <div className="space-y-1">
                            <h4 className="text-base font-bold text-white">{show.movie_title}</h4>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                                {show.movie_rating}
                              </span>
                              <span>{show.movie_language}</span>
                              <span>• {show.screen_name}</span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800/60">
                                {show.screen_type}
                              </span>
                            </div>

                            <p className="text-xs font-mono text-slate-300 pt-1">
                              Starts: <strong>{show.start_time}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 justify-between sm:justify-end">
                          <div className="text-right">
                            <span className="text-[11px] text-slate-400 block font-mono">From</span>
                            <span className="text-base font-bold text-emerald-400">
                              ₹{Object.values(show.prices || {})[0] || 300}
                            </span>
                          </div>

                          <button
                            onClick={() => onBookScreening(show.screening_id)}
                            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 flex items-center gap-1.5 transition-all hover:scale-105"
                          >
                            <Ticket className="w-3.5 h-3.5" /> Book Seats
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
}
