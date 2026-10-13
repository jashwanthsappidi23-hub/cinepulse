import React, { useState, useEffect } from "react";
import { 
  Briefcase, Film, Calendar, Plus, Trash2, 
  Clock, ShieldAlert, CheckCircle, Coffee, 
  Settings, RefreshCw, AlertTriangle, Layers 
} from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function ManagerDashboard({ openAuthModal }) {
  const { user, role, showToast } = useAuth();
  const [stats, setStats] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [concessions, setConcessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sub-tab: "screenings" | "movies" | "seats" | "concessions"
  const [subTab, setSubTab] = useState("screenings");

  // Schedule Screening Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [selectedScreenId, setSelectedScreenId] = useState("");
  const [screeningDate, setScreeningDate] = useState("2026-10-13");
  const [screeningTime, setScreeningTime] = useState("18:30");
  const [regularPrice, setRegularPrice] = useState("350");
  const [premiumPrice, setPremiumPrice] = useState("550");
  const [reclinerPrice, setReclinerPrice] = useState("850");
  const [scheduleError, setScheduleError] = useState(null);

  // Add Movie Modal
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [movieTitle, setMovieTitle] = useState("");
  const [movieGenre, setMovieGenre] = useState("Action / Sci-Fi");
  const [movieLang, setMovieLang] = useState("Hindi");
  const [movieDuration, setMovieDuration] = useState("165");
  const [movieRating, setMovieRating] = useState("U/A");
  const [movieReleaseDate, setMovieReleaseDate] = useState("2026-10-15");
  const [moviePoster, setMoviePoster] = useState("https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80");
  const [movieDesc, setMovieDesc] = useState("High adrenaline action cinematic release.");

  // Seat Maintenance Screen Selection
  const [seatScreenId, setSeatScreenId] = useState(1);
  const [screenSeats, setScreenSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [st, sc, mv, cn, cs] = await Promise.all([
        api.getManagerStats(),
        api.getScreenings(),
        api.getMovies(),
        api.getCinemas(),
        api.getConcessions()
      ]);
      setStats(st);
      setScreenings(sc || []);
      setMovies(mv || []);
      setCinemas(cn || []);
      setConcessions(cs || []);

      if (mv?.length > 0 && !selectedMovieId) setSelectedMovieId(mv[0].movie_id);
      if (cn?.length > 0 && !selectedCinemaId) {
        setSelectedCinemaId(cn[0].cinema_id);
      }
    } catch (err) {
      console.error("Manager load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Update screens dropdown when cinema changes
  const activeCinemaScreens = cinemas.find(c => c.cinema_id === parseInt(selectedCinemaId))?.screens || [];

  // Load seats for maintenance
  const loadSeatsForMaintenance = async (screenId) => {
    setLoadingSeats(true);
    try {
      // Find a screening on that screen or fetch screening layout
      const scr = screenings.find(s => s.screen_id === parseInt(screenId));
      if (scr) {
        const layout = await api.getScreeningLayout(scr.screening_id);
        const all = Object.values(layout.rows || {}).flat();
        setScreenSeats(all);
      } else {
        setScreenSeats([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSeats(false);
    }
  };

  useEffect(() => {
    if (subTab === "seats" && screenings.length > 0) {
      loadSeatsForMaintenance(seatScreenId);
    }
  }, [subTab, seatScreenId]);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setScheduleError(null);
    try {
      const startDateTimeStr = `${screeningDate} ${screeningTime}`;
      await api.scheduleScreening({
        movie_id: parseInt(selectedMovieId),
        screen_id: parseInt(selectedScreenId || 1),
        start_time: startDateTimeStr,
        prices: {
          Regular: parseFloat(regularPrice),
          Premium: parseFloat(premiumPrice),
          Recliner: parseFloat(reclinerPrice)
        }
      });
      showToast("Screening scheduled successfully!");
      setShowScheduleModal(false);
      loadAll();
    } catch (err) {
      setScheduleError(err.message);
    }
  };

  const handleAddMovieSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createMovie({
        title: movieTitle,
        genre: movieGenre,
        language: movieLang,
        duration: parseInt(movieDuration),
        rating: movieRating,
        release_date: movieReleaseDate,
        poster_url: moviePoster,
        description: movieDesc
      });
      showToast("Movie added to catalog!");
      setShowAddMovieModal(false);
      loadAll();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleToggleSeat = async (seatId) => {
    try {
      const res = await api.toggleSeatMaintenance(seatId);
      showToast(`Seat ${res.seat_id} is now ${res.status}`);
      loadSeatsForMaintenance(seatScreenId);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleUpdateConcession = async (item, newStock, newPrice) => {
    try {
      await api.updateConcessionItem(item.item_id, {
        stock_quantity: parseInt(newStock),
        price: parseFloat(newPrice)
      });
      showToast(`Updated ${item.item_name} inventory.`);
      loadAll();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Manager Operations Role
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-amber-500" /> Cinema Operations Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Schedule screenings with overlap checks, maintain screens, seats, and concession stock
          </p>
        </div>

        <button
          onClick={loadAll}
          className="p-2.5 rounded-xl bg-[#131926] border border-slate-800 text-slate-400 hover:text-white transition-colors self-start"
          title="Refresh Metrics"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Summary KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#131926] border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Scheduled Screenings</span>
            <div className="text-2xl font-black text-white">{stats.total_screenings}</div>
            <span className="text-[10px] text-slate-500 font-mono">{stats.total_movies} Active Movies</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#131926] border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tickets Sold</span>
            <div className="text-2xl font-black text-white">{stats.tickets_sold}</div>
            <span className="text-[10px] text-amber-400 font-semibold">{stats.occupancy_percentage}% Avg Occupancy</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#131926] border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gross Ticket Sales</span>
            <div className="text-2xl font-black text-emerald-400">₹{stats.ticket_revenue.toLocaleString()}</div>
            <span className="text-[10px] text-slate-500 font-mono">{stats.total_bookings} Confirmed Orders</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#131926] border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Net Operations Revenue</span>
            <div className="text-2xl font-black text-white">₹{stats.net_revenue.toLocaleString()}</div>
            <span className="text-[10px] text-red-400 font-mono">Refunds: ₹{stats.refund_total}</span>
          </div>
        </div>
      )}

      {/* Navigation Sub-tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-xs font-semibold">
        {[
          { id: "screenings", label: "Screening Schedules" },
          { id: "movies", label: "Movie Catalog" },
          { id: "seats", label: "Seat Maintenance" },
          { id: "concessions", label: "Concession Inventory" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`pb-3 transition-colors relative ${
              subTab === tab.id ? "text-amber-400" : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
            {subTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* 1. SCREENINGS SUB-TAB */}
      {subTab === "screenings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Active & Upcoming Screenings ({screenings.length})
            </h3>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all"
            >
              <Plus className="w-4 h-4" /> Schedule New Screening
            </button>
          </div>

          <div className="rounded-2xl bg-[#131926] border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B0F19] text-slate-400 uppercase font-semibold border-b border-slate-800 text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Movie</th>
                    <th className="p-3.5">Cinema / Screen</th>
                    <th className="p-3.5">Screen Format</th>
                    <th className="p-3.5">Show Date & Time</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {screenings.map((s) => (
                    <tr key={s.screening_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-mono text-slate-500">{s.screening_id}</td>
                      <td className="p-3.5 font-bold text-white">{s.movie_title}</td>
                      <td className="p-3.5">{s.cinema_name} • {s.screen_name}</td>
                      <td className="p-3.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-800 text-amber-400">
                          {s.screen_type}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-300">{s.start_time}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          s.status === "Scheduled" ? "bg-emerald-500/20 text-emerald-400" :
                          s.status === "Completed" ? "bg-slate-800 text-slate-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {s.status === "Scheduled" && (
                          <button
                            onClick={async () => {
                              if (confirm(`Cancel screening ${s.screening_id} (${s.movie_title})?`)) {
                                await api.cancelScreening(s.screening_id);
                                showToast("Screening cancelled.");
                                loadAll();
                              }
                            }}
                            className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            title="Cancel Screening"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. MOVIES SUB-TAB */}
      {subTab === "movies" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Movies Catalog ({movies.length})
            </h3>
            <button
              onClick={() => setShowAddMovieModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all"
            >
              <Plus className="w-4 h-4" /> Add New Movie Listing
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {movies.map((m) => (
              <div
                key={m.movie_id}
                className="p-4 rounded-2xl bg-[#131926] border border-slate-800 flex gap-4 items-center"
              >
                <img
                  src={m.poster_url}
                  alt={m.title}
                  className="w-16 h-24 rounded-xl object-cover shrink-0 border border-slate-700"
                />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white line-clamp-1">{m.title}</h4>
                  <p className="text-xs text-slate-400">{m.genre}</p>
                  <p className="text-[11px] text-slate-500">{m.language} • {m.duration}m • {m.rating}</p>
                  <span className="inline-block text-[10px] font-mono text-emerald-400">
                    Release: {m.release_date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SEATS MAINTENANCE SUB-TAB */}
      {subTab === "seats" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#131926] border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Seat Maintenance Controller</h3>
              <p className="text-xs text-slate-400">Click any seat to toggle its maintenance status (Active vs Blocked).</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold">Select Screen:</span>
              <select
                value={seatScreenId}
                onChange={(e) => setSeatScreenId(e.target.value)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
              >
                <option value="1">Audi 1 - IMAX Laser (Mumbai)</option>
                <option value="2">Audi 2 - Dolby Atmos (Mumbai)</option>
                <option value="4">Audi 1 - IMAX Giant (Bengaluru)</option>
                <option value="6">Audi 1 - Dolby Premier (Delhi)</option>
              </select>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-[#131926] border border-slate-800 text-center">
            <div className="cinema-screen-curve max-w-sm mx-auto mb-6" />
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block mb-6">
              AUDITORIUM SEATING GRID
            </span>

            {loadingSeats ? (
              <div className="py-12 text-slate-400 text-xs">Loading seat grid...</div>
            ) : screenSeats.length === 0 ? (
              <div className="py-12 text-slate-400 text-xs">No active seat layout found for this screen.</div>
            ) : (
              <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                {screenSeats.map((st) => (
                  <button
                    key={st.seat_id}
                    onClick={() => handleToggleSeat(st.seat_id)}
                    title={`Click to toggle maintenance for ${st.seat_identifier}`}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                      st.is_active
                        ? "bg-emerald-600 hover:bg-amber-600 text-white"
                        : "bg-slate-700 text-slate-400 line-through ring-2 ring-red-500"
                    }`}
                  >
                    {st.seat_identifier}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. CONCESSIONS SUB-TAB */}
      {subTab === "concessions" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            F&B Catalog & Warehouse Stock Levels
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {concessions.map((item) => (
              <div
                key={item.item_id}
                className="p-4 rounded-2xl bg-[#131926] border border-slate-800 flex gap-4 items-center"
              >
                <img
                  src={item.image_url}
                  alt={item.item_name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-700"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-white">{item.item_name}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Unit Price (₹)</span>
                      <input
                        type="number"
                        defaultValue={item.price}
                        id={`price-${item.item_id}`}
                        className="w-16 p-1 rounded bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Stock Qty</span>
                      <input
                        type="number"
                        defaultValue={item.stock_quantity}
                        id={`stock-${item.item_id}`}
                        className="w-16 p-1 rounded bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const p = document.getElementById(`price-${item.item_id}`).value;
                        const s = document.getElementById(`stock-${item.item_id}`).value;
                        handleUpdateConcession(item, s, p);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs self-end transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCHEDULE SCREENING MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#131926] border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" /> Schedule Screening
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {scheduleError && (
              <div className="p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{scheduleError}</span>
              </div>
            )}

            <form onSubmit={handleScheduleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Select Movie</label>
                <select
                  value={selectedMovieId}
                  onChange={(e) => setSelectedMovieId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  {movies.map(m => (
                    <option key={m.movie_id} value={m.movie_id}>{m.title} ({m.duration} mins)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Select Cinema</label>
                  <select
                    value={selectedCinemaId}
                    onChange={(e) => setSelectedCinemaId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    {cinemas.map(c => (
                      <option key={c.cinema_id} value={c.cinema_id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Auditorium / Screen</label>
                  <select
                    value={selectedScreenId}
                    onChange={(e) => setSelectedScreenId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="1">Audi 1 - IMAX Laser (40 seats)</option>
                    <option value="2">Audi 2 - Dolby Atmos (36 seats)</option>
                    <option value="3">Audi 3 - Gold Class Luxury (24 seats)</option>
                    <option value="4">Audi 1 - IMAX Giant (40 seats)</option>
                    <option value="5">Audi 2 - 4DX Dynamic (32 seats)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={screeningDate}
                    onChange={(e) => setScreeningDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Start Time (HH:MM)</label>
                  <input
                    type="time"
                    required
                    value={screeningTime}
                    onChange={(e) => setScreeningTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-slate-400 font-semibold mb-2">Category Pricing (₹)</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Regular</span>
                    <input
                      type="number"
                      required
                      value={regularPrice}
                      onChange={(e) => setRegularPrice(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Premium</span>
                    <input
                      type="number"
                      required
                      value={premiumPrice}
                      onChange={(e) => setPremiumPrice(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Recliner</span>
                    <input
                      type="number"
                      required
                      value={reclinerPrice}
                      onChange={(e) => setReclinerPrice(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow"
                >
                  Verify Overlaps & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MOVIE MODAL */}
      {showAddMovieModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#131926] border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-amber-500" /> Add New Movie Listing
              </h3>
              <button onClick={() => setShowAddMovieModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddMovieSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Movie Title</label>
                <input
                  type="text"
                  required
                  value={movieTitle}
                  onChange={(e) => setMovieTitle(e.target.value)}
                  placeholder="e.g. Avatar: Fire and Ash"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Genre</label>
                  <input
                    type="text"
                    required
                    value={movieGenre}
                    onChange={(e) => setMovieGenre(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Language</label>
                  <input
                    type="text"
                    required
                    value={movieLang}
                    onChange={(e) => setMovieLang(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Duration (min)</label>
                  <input
                    type="number"
                    required
                    value={movieDuration}
                    onChange={(e) => setMovieDuration(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Rating</label>
                  <input
                    type="text"
                    required
                    value={movieRating}
                    onChange={(e) => setMovieRating(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Release Date</label>
                  <input
                    type="date"
                    required
                    value={movieReleaseDate}
                    onChange={(e) => setMovieReleaseDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Poster URL</label>
                <input
                  type="url"
                  value={moviePoster}
                  onChange={(e) => setMoviePoster(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Synopsis / Description</label>
                <textarea
                  rows={2}
                  value={movieDesc}
                  onChange={(e) => setMovieDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddMovieModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow"
                >
                  Save Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
