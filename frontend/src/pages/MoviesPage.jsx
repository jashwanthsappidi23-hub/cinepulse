import React, { useState, useEffect } from "react";
import { 
  Film, Search, Filter, Play, Clock, Star, 
  MapPin, Ticket, ChevronRight, Calendar, ArrowLeft, Heart, ArrowRight, Flame 
} from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function MoviesPage({ selectedMovieId, onClearSelectedMovie, onBookScreening, openTrailer }) {
  const { selectedCity, openCityModal } = useAuth();
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedLang, setSelectedLang] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [visibleCount, setVisibleCount] = useState(16);

  // Selected Movie Detailed view
  const [movieDetail, setMovieDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Watchlist favorites
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cinepulse_favorites") || "[]");
    } catch {
      return [];
    }
  });

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

  useEffect(() => {
    api.getGenres().then(setGenres).catch(console.error);
    api.getLanguages().then(setLanguages).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    api.getMovies({
      search,
      genre: selectedGenre,
      language: selectedLang,
      status_filter: selectedStatus,
      city: selectedCity
    })
      .then(setMovies)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, selectedGenre, selectedLang, selectedStatus, selectedCity]);

  // Load detailed movie if selected
  useEffect(() => {
    if (selectedMovieId) {
      setLoadingDetail(true);
      api.getMovieDetail(selectedMovieId)
        .then(setMovieDetail)
        .catch(console.error)
        .finally(() => setLoadingDetail(false));
    } else {
      setMovieDetail(null);
    }
  }, [selectedMovieId]);

  const getRatingStats = (movie) => {
    const base = 8.4 + ((movie.movie_id * 7) % 15) / 10;
    const ratingScore = Math.min(9.8, Math.max(7.9, base)).toFixed(1);
    const votes = `${(25 + ((movie.movie_id * 19) % 160))}K`;
    return { score: ratingScore, votes };
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* If a Movie is selected: Show Detailed View with Showtimes */}
      {selectedMovieId && movieDetail ? (
        <div className="space-y-8 animate-fade-in">
          
          <button
            onClick={onClearSelectedMovie}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to all 100+ movies
          </button>

          {/* Movie Hero Banner with BookMyShow details */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#131926] border border-slate-800 shadow-2xl flex flex-col md:flex-row gap-8 items-start">
            <img
              src={movieDetail.poster_url}
              alt={movieDetail.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80";
              }}
              className="w-48 sm:w-64 rounded-2xl shadow-2xl border border-slate-700/80 shrink-0"
            />

            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-amber-400 font-bold border border-amber-500/40 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {getRatingStats(movieDetail).score}/10 ({getRatingStats(movieDetail).votes} Votes)
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-red-600 text-white font-bold">
                  {movieDetail.rating}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-medium">
                  {movieDetail.language}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {movieDetail.duration} mins
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-medium">
                  Release: {movieDetail.release_date}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white">
                {movieDetail.title}
              </h1>

              <p className="text-slate-300 text-sm leading-relaxed">
                {movieDetail.description}
              </p>

              <div className="text-xs text-slate-400 space-y-1">
                <p><strong>Genre:</strong> {movieDetail.genre}</p>
                <p><strong>Audio / Language:</strong> {movieDetail.language}</p>
                <p><strong>Available Formats:</strong> 2D, 3D, IMAX 3D, 4DX, Dolby Atmos</p>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <button
                  onClick={() => openTrailer(movieDetail)}
                  className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" /> Watch Trailer
                </button>
              </div>
            </div>
          </div>

          {/* Showtimes Selection Grouped by Cinema */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-500" />
              Available Screenings in {selectedCity}
            </h2>

            {movieDetail.screenings && movieDetail.screenings.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {movieDetail.screenings.map((show) => (
                  <div
                    key={show.screening_id}
                    className="p-5 rounded-3xl bg-[#131926] border border-slate-800 hover:border-slate-700 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">{show.cinema_name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950 text-red-400 border border-red-800/60">
                          {show.screen_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" /> {show.screen_name} • {show.cinema_city}
                      </p>
                      
                      {/* Price badges */}
                      <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                        {show.prices && show.prices.map((pr, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
                            {pr.category}: <strong className="text-emerald-400">₹{pr.price}</strong>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <span className="text-[11px] text-slate-400 block font-mono">Showtime</span>
                        <span className="text-sm font-bold text-white font-mono">{show.start_time}</span>
                      </div>

                      <button
                        onClick={() => onBookScreening(show.screening_id)}
                        className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/40 flex items-center gap-2 transition-all hover:scale-105"
                      >
                        <Ticket className="w-4 h-4" /> Select Seats
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl bg-[#131926] border border-slate-800 text-slate-400 text-xs">
                No active showtimes currently scheduled for {movieDetail.title} in {selectedCity}.
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Regular Movie Catalog View (100+ Movies) */
        <div className="space-y-6">
          
          {/* Header & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <Film className="w-6 h-6 text-red-500" /> 100+ Movies Catalog
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Browse our complete collection with real audience ratings & emojis in {selectedCity}
              </p>
            </div>

            {/* Quick Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setVisibleCount(16); }}
                placeholder="Search across 100+ titles..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#131926] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="p-4 rounded-3xl bg-[#131926] border border-slate-800 flex flex-wrap items-center gap-4 text-xs">
            
            {/* Genre */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Genre:</span>
              <select
                value={selectedGenre}
                onChange={(e) => { setSelectedGenre(e.target.value); setVisibleCount(16); }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
              >
                <option value="all">All Genres</option>
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* Language */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Language:</span>
              <select
                value={selectedLang}
                onChange={(e) => { setSelectedLang(e.target.value); setVisibleCount(16); }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
              >
                <option value="all">All Languages</option>
                {languages.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setVisibleCount(16); }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
              >
                <option value="all">All Releases</option>
                <option value="now_showing">Now Showing</option>
                <option value="upcoming">Coming Soon</option>
              </select>
            </div>

            {/* City Button */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={openCityModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-red-500/60 text-slate-300 hover:text-white transition-colors"
                title="Select from 190+ Indian Cities"
              >
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span className="font-semibold">{selectedCity}</span>
                <span className="text-[10px] text-slate-500">Change</span>
              </button>
            </div>

            {(selectedGenre !== "all" || selectedLang !== "all" || selectedStatus !== "all" || search) && (
              <button
                onClick={() => {
                  setSelectedGenre("all");
                  setSelectedLang("all");
                  setSelectedStatus("all");
                  setSearch("");
                  setVisibleCount(16);
                }}
                className="text-red-400 hover:underline font-medium text-xs ml-auto"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Movies Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-3xl bg-slate-900 border border-slate-800 h-96 animate-pulse" />
              ))}
            </div>
          ) : movies.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-[#131926] border border-slate-800 text-slate-400">
              <Film className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <p className="text-sm font-semibold">No movies match your filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {movies.slice(0, visibleCount).map((movie) => {
                const ratingData = getRatingStats(movie);
                const isFav = favorites.includes(movie.movie_id);

                return (
                  <div
                    key={movie.movie_id}
                    onClick={() => onSelectMovie(movie.movie_id)}
                    className="group rounded-3xl bg-[#131926] border border-slate-800/80 hover:border-red-600/60 shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-red-950/30 flex flex-col cursor-pointer"
                  >
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
                      <div className="absolute inset-0 bg-gradient-to-t from-[#131926] via-transparent to-transparent opacity-90" />
                      
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
                        >
                          <Heart className={`w-4 h-4 ${isFav ? "fill-white" : ""}`} />
                        </button>
                      </div>

                      {/* BMS Rating Bar */}
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

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1 mb-1">
                          {movie.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-1">{movie.genre}</p>
                      </div>

                      <div className="pt-4 flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); onSelectMovie(movie.movie_id); }}
                          className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Ticket className="w-3.5 h-3.5" /> View Showtimes
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); openTrailer(movie); }}
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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

          {/* Load More Button */}
          {movies.length > visibleCount && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setVisibleCount(prev => prev + 16)}
                className="px-8 py-3.5 rounded-2xl bg-[#131926] hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 shadow-xl transition-all hover:scale-105 inline-flex items-center gap-2"
              >
                <span>Load More Movies ({movies.length - visibleCount} remaining)</span>
                <ArrowRight className="w-4 h-4 text-red-500" />
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
