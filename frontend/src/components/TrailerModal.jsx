import React from "react";
import { X, Play, Clock, Film } from "lucide-react";

export default function TrailerModal({ movie, isOpen, onClose }) {
  if (!isOpen || !movie) return null;

  // Convert youtube watch URL to embed URL if needed
  let embedUrl = movie.trailer_url;
  if (embedUrl && embedUrl.includes("watch?v=")) {
    embedUrl = embedUrl.replace("watch?v=", "embed/");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#131926] border border-slate-700 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-[#0B0F19]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center">
              <Play className="w-4 h-4 fill-red-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {movie.title}
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {movie.rating}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Official Cinema Trailer & Teaser</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video / Player Container */}
        <div className="aspect-video w-full bg-black flex items-center justify-center relative">
          {embedUrl ? (
            <iframe
              src={`${embedUrl}?autoplay=1`}
              title={`${movie.title} Trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="text-center p-8">
              <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Trailer feed currently unavailable for this title.</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-5 px-6 bg-[#0B0F19] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span><strong>Genre:</strong> {movie.genre}</span>
            <span><strong>Language:</strong> {movie.language}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {movie.duration} mins</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
          >
            Close Trailer
          </button>
        </div>
      </div>
    </div>
  );
}
