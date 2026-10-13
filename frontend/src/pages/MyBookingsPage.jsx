import React, { useState, useEffect } from "react";
import { 
  Ticket, Calendar, Clock, MapPin, Printer, 
  XCircle, CheckCircle, AlertCircle, RefreshCw, User 
} from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function MyBookingsPage({ onOpenTicket, openAuthModal }) {
  const { user, isAuthenticated, showToast, quickLogin } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState("Change of plans");

  const loadBookings = () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.getMyBookings()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, [isAuthenticated]);

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    setCancellingId(cancelModalBooking.booking_id);
    try {
      const res = await api.cancelBooking(cancelModalBooking.booking_id, cancelReason);
      showToast(`Booking cancelled! Refund of ₹${res.refund_amount} processed.`, "success");
      setCancelModalBooking(null);
      loadBookings();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setCancellingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-12 sm:p-16 rounded-3xl bg-[#131926] border border-slate-800 text-center max-w-lg mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-600/20 text-red-500 mx-auto flex items-center justify-center">
          <Ticket className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-white">Sign In to View Your Bookings</h2>
        <p className="text-xs text-slate-400">
          Access your digital cinema tickets, QR gate tokens, and manage permitted cancellations.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={openAuthModal}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all"
          >
            Sign In / Register
          </button>
          <button
            onClick={() => quickLogin("customer")}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
          >
            Quick Customer Demo Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-red-500" /> My Cinema Bookings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            View booking status, printable e-tickets with QR codes, and eligible refunds
          </p>
        </div>

        <button
          onClick={loadBookings}
          className="p-2.5 rounded-xl bg-[#131926] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          title="Refresh Bookings"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-slate-400">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-[#131926] border border-slate-800 text-slate-400">
          <Ticket className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Bookings Yet</h3>
          <p className="text-xs">Browse our currently screening movies and book your first show!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const movie = b.movie || {};
            const screening = b.screening || {};
            const isConfirmed = b.status === "Confirmed";
            const isCancelled = b.status === "Cancelled";

            return (
              <div
                key={b.booking_id}
                className="p-5 sm:p-6 rounded-3xl bg-[#131926] border border-slate-800 hover:border-slate-700 shadow-xl transition-colors flex flex-col md:flex-row gap-6 items-start justify-between"
              >
                {/* Left: Movie poster & details */}
                <div className="flex gap-4 items-start">
                  {movie.poster_url && (
                    <img
                      src={movie.poster_url}
                      alt={movie.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80";
                      }}
                      className="w-20 h-28 rounded-xl object-cover border border-slate-700/80 shrink-0"
                    />
                  )}

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isConfirmed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                        isCancelled ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                        "bg-slate-800 text-slate-400"
                      }`}>
                        {b.status}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        REF: <strong className="text-white">{b.booking_reference}</strong>
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{movie.title}</h3>

                    <p className="text-xs text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      {screening.cinema_name} • {screening.screen_name}
                    </p>

                    <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5" /> {screening.start_time}
                    </p>

                    {/* Seats badge list */}
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {b.tickets?.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                          {t.seat_identifier} ({t.category})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Payment, Total & Actions */}
                <div className="w-full md:w-auto flex flex-col md:items-end justify-between self-stretch pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="text-left md:text-right mb-4">
                    <span className="text-xs text-slate-400 block">Total Amount:</span>
                    <span className="text-xl font-black text-white">₹{b.total_amount}</span>
                    {b.refund && (
                      <span className="text-[11px] text-emerald-400 block font-medium mt-0.5">
                        Refunded: ₹{b.refund.refund_amount} ({b.refund.refund_status})
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* View E-Ticket */}
                    {isConfirmed && (
                      <button
                        onClick={() => onOpenTicket(b)}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 flex items-center gap-1.5 transition-all"
                      >
                        <Printer className="w-3.5 h-3.5" /> View / Print Ticket
                      </button>
                    )}

                    {/* Cancel Booking (if policy allows) */}
                    {b.can_cancel && (
                      <button
                        onClick={() => setCancelModalBooking(b)}
                        className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/80 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancel Show
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Prompt Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#131926] border border-slate-700 shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" /> Cancel Booking & Process Refund
            </h3>
            
            <p className="text-xs text-slate-300">
              Are you sure you want to cancel booking <strong className="text-white">{cancelModalBooking.booking_reference}</strong>?
              According to the cinema policy, a full refund of <strong className="text-emerald-400">₹{cancelModalBooking.total_amount}</strong> will be processed to your original payment method.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Reason for Cancellation</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                Keep Booking
              </button>
              <button
                disabled={cancellingId !== null}
                onClick={handleConfirmCancel}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all"
              >
                {cancellingId ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
