import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { X, Printer, Film, CheckCircle, MapPin, Calendar, Clock, Ticket as TicketIcon } from "lucide-react";

export default function TicketModal({ booking, isOpen, onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && booking && canvasRef.current) {
      const qrData = booking.tickets?.[0]?.qr_token || booking.booking_reference || "CINEPULSE-DEMO-TICKET";
      QRCode.toCanvas(canvasRef.current, qrData, {
        width: 140,
        margin: 1,
        color: {
          dark: "#0B0F19",
          light: "#FFFFFF"
        }
      }, (err) => {
        if (err) console.error("QR Code Error:", err);
      });
    }
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const movie = booking.movie || {};
  const screening = booking.screening || {};
  const tickets = booking.tickets || [];
  const seatList = tickets.map(t => t.seat_identifier).join(", ") || "Selected Seats";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#131926] border border-slate-700 shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Top Header - Not printed */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-[#0B0F19] print:hidden">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <CheckCircle className="w-4 h-4" /> Confirmed E-Ticket & Receipt
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Ticket Card */}
        <div id="printable-ticket" className="p-6 sm:p-8 bg-gradient-to-b from-[#161D2D] to-[#0F1422] print:bg-white print:p-4">
          
          {/* Ticket Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-700/80 print:border-slate-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-lg">
                🎬
              </div>
              <div>
                <h2 className="text-xl font-black tracking-wider text-white print:text-black">
                  CINE<span className="text-red-500">PULSE</span> CINEMAS
                </h2>
                <p className="text-[11px] text-slate-400 font-mono print:text-slate-600">
                  REF: <span className="text-white font-bold print:text-black">{booking.booking_reference}</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 print:bg-emerald-100 print:text-emerald-800">
                {booking.status}
              </span>
              <p className="text-[10px] text-slate-400 mt-1 print:text-slate-600">
                Booked: {booking.booking_date}
              </p>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="py-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Movie Poster & Main Details */}
            <div className="md:col-span-2 flex gap-4">
              {movie.poster_url && (
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80";
                  }}
                  className="w-24 h-36 object-cover rounded-xl shadow-lg border border-slate-700/60 hidden sm:block print:block"
                />
              )}
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white print:text-black leading-tight">
                  {movie.title}
                </h3>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 print:bg-slate-200 print:text-black font-semibold">
                    {movie.rating || "U/A"}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 print:bg-slate-200 print:text-black">
                    {movie.genre}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800/60 print:bg-red-100 print:text-red-800 font-medium">
                    {screening.screen_type || "IMAX"}
                  </span>
                </div>

                <div className="pt-2 space-y-1 text-xs text-slate-300 print:text-slate-700">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="font-medium text-white print:text-black">{screening.cinema_name}</span> ({screening.cinema_city})
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{screening.screen_name}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{screening.start_time}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* QR Verification & Barcode */}
            <div className="md:col-span-1 flex flex-col items-center justify-center p-3 rounded-2xl bg-white text-black shadow-inner">
              <canvas ref={canvasRef} className="rounded-lg mb-1"></canvas>
              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-700 uppercase">
                SCAN AT GATE
              </span>
              <span className="text-[8px] font-mono text-slate-500 truncate max-w-[140px]">
                {tickets[0]?.ticket_code || booking.booking_reference}
              </span>
            </div>
          </div>

          {/* Seat Badges Section */}
          <div className="p-4 rounded-2xl bg-[#0F1422] border border-slate-800 print:bg-slate-100 print:border-slate-300 mb-6">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                Allocated Seats ({tickets.length} tickets)
              </span>
              <span className="text-white font-bold print:text-black">
                {seatList}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {tickets.map((t, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 flex items-center gap-2 print:bg-white print:border-slate-300"
                >
                  <TicketIcon className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-xs font-bold text-white print:text-black">{t.seat_identifier}</span>
                  <span className="text-[10px] text-slate-400 print:text-slate-600">({t.category})</span>
                  <span className="text-xs font-semibold text-emerald-400 print:text-emerald-700">₹{t.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Concessions ordered if any */}
          {booking.concessions && booking.concessions.length > 0 && (
            <div className="p-3 px-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs mb-6 print:bg-slate-50">
              <span className="text-slate-400 font-semibold block mb-1 text-[11px] uppercase tracking-wider">
                🍿 Concessions & Food Add-ons:
              </span>
              <div className="space-y-1">
                {booking.concessions.map((co, idx) => (
                  <div key={idx} className="flex justify-between text-slate-300 print:text-black">
                    <span>{co.item_name} × {co.quantity}</span>
                    <span className="font-medium">₹{co.subtotal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Breakdown & Total */}
          <div className="pt-4 border-t border-slate-700/80 flex items-center justify-between text-sm print:border-slate-300">
            <div>
              <span className="text-xs text-slate-400 block print:text-slate-600">Payment Status:</span>
              <span className="font-semibold text-white print:text-black">
                {booking.payment?.method || "Simulated Card / UPI"} (Verified)
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block print:text-slate-600">Total Paid:</span>
              <span className="text-2xl font-black text-red-500 print:text-black">
                ₹{booking.total_amount}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-4 px-6 bg-[#0B0F19] text-center text-[11px] text-slate-400 border-t border-slate-800 print:hidden">
          Please arrive 15 minutes before showtime. Present this QR verification code at the turnstile or box office.
        </div>
      </div>
    </div>
  );
}
