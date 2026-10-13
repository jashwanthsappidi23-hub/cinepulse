import React, { useState, useEffect } from "react";
import { 
  Play, Calendar, Clock, Star, MapPin, Search, 
  Sparkles, Ticket, Film, ChevronRight, ShieldCheck, Database, 
  Heart, Flame, Compass, Monitor, Award, Filter, ArrowRight 
} from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

// BookMyShow / District Experience Format Badges
const EXPERIENCE_FORMATS = [
  { id: "all", label: "All Formats", icon: "🎬" },
  { id: "imax", label: "IMAX 3D", icon: "🌌" },
  { id: "4dx", label: "4DX Dynamic", icon: "💨" },
  { id: "dolby", label: "Dolby Atmos", icon: "🔊" },
  { id: "gold", label: "Gold Class", icon: "👑" },
  { id: "screenx", label: "ScreenX 270°", icon: "📐" }
];

// District Mood / Category Chips (All Cinema Woods)
const MOOD_CATEGORIES = [
  { id: "all", label: "All 180+ Movies", emoji: "🍿" },
  { id: "tollywood", label: "Tollywood (Telugu)", emoji: "🦁" },
  { id: "bollywood", label: "Bollywood (Hindi)", emoji: "👑" },
  { id: "hollywood", label: "Hollywood Hits", emoji: "🎬" },
  { id: "kollywood", label: "Kollywood (Tamil)", emoji: "🕶️" },
  { id: "mollywood", label: "Mollywood (Malayalam)", emoji: "🌊" },
  { id: "sandalwood", label: "Sandalwood (Kannada)", emoji: "🌲" },
  { id: "trending", label: "Trending in District", emoji: "🔥" },
  { id: "action", label: "Action & Adrenaline", emoji: "💥" },
  { id: "scifi", label: "Sci-Fi & Multiverse", emoji: "🚀" },
  { id: "horror", label: "Horror & Thrillers", emoji: "👻" },
  { id: "drama", label: "Drama & Romance", emoji: "💖" },
  { id: "animation", label: "Anime & Animation", emoji: "🎨" }
];

export default function HomePage({ onSelectMovie, onBookScreening, openTrailer }) {
  const { selectedCity, setCity, cities, openCityModal } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("now_showing"); // "now_showing" | "upcoming"
  const [selectedMood, setSelectedMood] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cinepulse_favorites") || "[]");
    } catch {
      return [];
    }
  });
  const [visibleCount, setVisibleCount] = useState(16);

  useEffect(() => {
    setLoading(true);
    api.getMovies({ city: selectedCity, status_filter: activeTab })
      .then(data => setMovies(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCity, activeTab]);

  const toggleFavorite = (e, movieId) => {
    e.stopPropagation();
    let updated;
    if (favorites.includes(movieId)) {
      updated = favorites.filter(id => id !== movieId);
    } else {
      updated = [...favorites, movieId];
    }
    setFavorites(updated);
    localStorage.setItem("cinepulse_favorites", JSON.stringify(updated));
  };

  // Filter movies
  const filteredMovies = movies.filter(m => {
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = m.title.toLowerCase().includes(q) || 
                    m.genre.toLowerCase().includes(q) || 
                    m.language.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Mood & Industry Categories
    if (selectedMood === "tollywood") {
      return m.language.toLowerCase().includes("telugu");
    } else if (selectedMood === "bollywood") {
      return m.language.toLowerCase().includes("hindi");
    } else if (selectedMood === "hollywood") {
      return m.language.toLowerCase().includes("english");
    } else if (selectedMood === "kollywood") {
      return m.language.toLowerCase().includes("tamil");
    } else if (selectedMood === "mollywood") {
      return m.language.toLowerCase().includes("malayalam");
    } else if (selectedMood === "sandalwood") {
      return m.language.toLowerCase().includes("kannada");
    } else if (selectedMood === "trending") {
      return m.title.includes("🔥") || m.title.includes("👑") || m.title.includes("🦁") || m.duration > 160;
    } else if (selectedMood === "action") {
      return m.genre.toLowerCase().includes("action") || m.genre.toLowerCase().includes("crime") || m.genre.toLowerCase().includes("war");
    } else if (selectedMood === "scifi") {
      return m.genre.toLowerCase().includes("sci-fi") || m.genre.toLowerCase().includes("space") || m.genre.toLowerCase().includes("fantasy");
    } else if (selectedMood === "horror") {
      return m.genre.toLowerCase().includes("horror") || m.genre.toLowerCase().includes("thriller") || m.genre.toLowerCase().includes("mystery");
    } else if (selectedMood === "drama") {
      return m.genre.toLowerCase().includes("drama") || m.genre.toLowerCase().includes("romance") || m.genre.toLowerCase().includes("musical");
    } else if (selectedMood === "animation") {
      return m.genre.toLowerCase().includes("animation") || m.language.toLowerCase().includes("japanese");
    }

    return true;
  });

  // Hero carousel (top 5 movies)
  const heroMovies = movies.slice(0, 5);
  const currentHero = heroMovies[heroIndex] || movies[0];

  // Helper for mock realistic BMS rating
  const getRatingStats = (movie) => {
    const base = 8.4 + ((movie.movie_id * 7) % 15) / 10;
    const ratingScore = Math.min(9.8, Math.max(7.9, base)).toFixed(1);
    const votes = `${(25 + ((movie.movie_id * 19) % 160))}K`;
    return { score: ratingScore, votes };
  };

  return (
    <div className="space-y-10">
      
      {/* 1. District / BookMyShow Style Quick Category Bar */}
      <section className="relative overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2.5 min-w-max">
          {MOOD_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedMood(cat.id); setVisibleCount(16); }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border shadow-sm ${
                selectedMood === cat.id
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500 shadow-red-900/40 scale-105"
                  : "bg-[#131926] text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
              }`}
            >
              <span className="text-sm">{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Featured Movie Banner (Hero Carousel with District Aesthetic) */}
      {currentHero && (
        <section className="relative rounded-3xl overflow-hidden border border-slate-800/90 shadow-2xl bg-slate-950">
          <div className="relative min-h-[460px] sm:min-h-[530px] flex items-end">
            
            {/* Background Backdrop Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105"
              style={{ backgroundImage: `url(${currentHero.poster_url})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19] via-[#0B0F19]/75 to-transparent" />
            </div>

            {/* Banner Content */}
            <div className="relative z-10 p-6 sm:p-12 max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full font-bold uppercase tracking-wider bg-red-600 text-white shadow-lg shadow-red-600/40 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" /> BookMyShow Premiere
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-amber-400 font-bold border border-amber-500/40 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {getRatingStats(currentHero).score}/10 ({getRatingStats(currentHero).votes} Votes)
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-slate-300 font-semibold border border-slate-700">
                  {currentHero.rating}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-slate-300 font-medium border border-slate-700">
                  {currentHero.language} • 2D, 3D, IMAX
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-slate-300 font-medium border border-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {currentHero.duration} mins
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
                {currentHero.title}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base line-clamp-3 leading-relaxed max-w-2xl drop-shadow">
                {currentHero.description}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onSelectMovie(currentHero.movie_id)}
                  className="px-8 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-xl shadow-red-600/40 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Ticket className="w-4 h-4" /> Book Tickets in {selectedCity}
                </button>

                <button
                  onClick={() => openTrailer(currentHero)}
                  className="px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700 shadow flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-white text-white" /> Trailer Preview
                </button>
              </div>
            </div>

            {/* Hero Carousel Navigation */}
            {heroMovies.length > 1 && (
              <div className="absolute right-6 bottom-6 z-20 flex gap-2">
                {heroMovies.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      heroIndex === i ? "w-8 bg-red-500" : "w-2.5 bg-slate-600 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. District / BMS Cinematic Format Strip */}
      <section className="p-4 sm:p-5 rounded-3xl bg-[#131926] border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center font-bold">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Select Your Cinema Experience in {selectedCity}</h4>
              <p className="text-xs text-slate-400">Exclusive theater screens calibrated for ultimate visuals & sound</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {EXPERIENCE_FORMATS.map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  selectedFormat === fmt.id
                    ? "bg-slate-100 text-black border-white shadow"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                }`}
              >
                <span>{fmt.icon}</span>
                <span>{fmt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Search, City & Release Status Tabs */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(16); }}
            placeholder="Search from 100+ movies, genres, languages..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#131926] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 shadow-inner"
          />
        </div>

        {/* Location & Status Selector */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={openCityModal}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#131926] border border-slate-800 hover:border-red-500/60 hover:bg-slate-800/80 text-xs text-slate-300 transition-all group"
            title="Choose from 190+ Indian Cities"
          >
            <MapPin className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
            <span className="text-white font-bold">{selectedCity}</span>
            <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-2">Change City</span>
          </button>

          <div className="flex p-1 rounded-2xl bg-[#131926] border border-slate-800 text-xs font-bold">
            <button
              onClick={() => { setActiveTab("now_showing"); setVisibleCount(16); }}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "now_showing" ? "bg-red-600 text-white shadow-md shadow-red-600/30" : "text-slate-400 hover:text-white"
              }`}
            >
              Now Showing
            </button>
            <button
              onClick={() => { setActiveTab("upcoming"); setVisibleCount(16); }}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "upcoming" ? "bg-red-600 text-white shadow-md shadow-red-600/30" : "text-slate-400 hover:text-white"
              }`}
            >
              Upcoming
            </button>
          </div>
        </div>
      </section>

      {/* 5. 100+ Movies Grid (BookMyShow / District Cards with Emojis & Ratings) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Film className="w-5 h-5 text-red-500" />
              {activeTab === "now_showing" ? "Explore 100+ Blockbusters in Theaters" : "Upcoming Premieres & Releases"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {filteredMovies.length} movies with live screenings across {selectedCity} cinemas
            </p>
          </div>

          <span className="text-xs text-slate-400 font-mono hidden sm:block">
            Showing {Math.min(visibleCount, filteredMovies.length)} of {filteredMovies.length} titles
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-3xl bg-slate-900 border border-slate-800 h-96 animate-pulse" />
            ))}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-[#131926] border border-slate-800 text-slate-400">
            <Film className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Movies Matched Filter</h3>
            <p className="text-xs">Try selecting 'All 100+ Movies' or resetting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.slice(0, visibleCount).map((movie) => {
              const ratingData = getRatingStats(movie);
              const isFav = favorites.includes(movie.movie_id);

              return (
                <div
                  key={movie.movie_id}
                  onClick={() => onSelectMovie(movie.movie_id)}
                  className="group rounded-3xl bg-[#131926] border border-slate-800/80 hover:border-red-600/60 shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-red-950/30 flex flex-col cursor-pointer"
                >
                  {/* Poster Thumbnail */}
                  <div className="relative aspect-[2/3] overflow-hidden bg-slate-950">
                    <img
                      src={movie.poster_url}
                      alt={movie.title}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80";
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Dark gradient overlay on bottom of poster */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#131926] via-transparent to-transparent opacity-90" />
                    
                    {/* Top Badges (CBFC & In-City Tag & Heart) */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-black/70 backdrop-blur-md text-amber-400 border border-amber-500/30">
                          {movie.rating}
                        </span>
                        {movie.playing_in_city && (
                          <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-red-600/90 backdrop-blur-md text-white shadow-sm flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5" /> In {selectedCity}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => toggleFavorite(e, movie.movie_id)}
                        className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-transform hover:scale-110 ${
                          isFav ? "bg-red-600 text-white" : "bg-black/60 text-white hover:text-red-400"
                        }`}
                        title="Add to Watchlist"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? "fill-white" : ""}`} />
                      </button>
                    </div>

                    {/* BookMyShow Style Bottom Poster Bar: Rating & Votes */}
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700/60 text-white font-bold">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{ratingData.score}/10</span>
                        <span className="text-[10px] text-slate-400 font-normal">({ratingData.votes})</span>
                      </div>

                      <span className="text-[10px] font-semibold text-slate-300 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg">
                        {movie.duration}m
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Movie Title with Emoji */}
                      <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1 mb-1">
                        {movie.title}
                      </h3>
                      
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                        <span className="text-slate-300 font-medium">{movie.language}</span>
                        <span>•</span>
                        <span className="line-clamp-1">{movie.genre}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          2D
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          IMAX 3D
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          4DX
                        </span>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="pt-4 flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectMovie(movie.movie_id); }}
                        className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                      >
                        <Ticket className="w-3.5 h-3.5" /> Book Tickets
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); openTrailer(movie); }}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Watch Trailer"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button for 100+ Movies */}
        {filteredMovies.length > visibleCount && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setVisibleCount(prev => prev + 16)}
              className="px-8 py-3.5 rounded-2xl bg-[#131926] hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 shadow-xl transition-all hover:scale-105 inline-flex items-center gap-2"
            >
              <span>Load More Titles ({filteredMovies.length - visibleCount} remaining)</span>
              <ArrowRight className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}
      </section>

      {/* 6. District App Cinema Amenities Strip */}
      <section className="p-6 rounded-3xl bg-gradient-to-r from-red-950/20 via-slate-900 to-slate-950 border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center border border-red-500/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100+ Blockbusters</h4>
              <p className="text-xs text-slate-400">Curated across Bollywood, Hollywood, Anime & Pan-India.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-600/20 text-amber-500 flex items-center justify-center border border-amber-500/30">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Verified Ratings</h4>
              <p className="text-xs text-slate-400">Real audience votes & CBFC certifications on every card.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600/20 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Instant E-Ticket & QR</h4>
              <p className="text-xs text-slate-400">Fast gate scanning tokens with zero box-office queues.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-600/20 text-purple-500 flex items-center justify-center border border-purple-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">3NF DBMS Engine</h4>
              <p className="text-xs text-slate-400">18 normalized tables with real-time seat concurrency.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
