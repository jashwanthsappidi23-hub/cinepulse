import React, { useState, useEffect } from "react";
import { 
  X, Check, AlertCircle, Clock, Film, MapPin, 
  ChevronRight, ArrowLeft, Coffee, ShieldCheck, CreditCard, 
  Smartphone, Building, Info, AlertTriangle, Sparkles 
} from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function BookingFlowModal({ screeningId, isOpen, onClose, onBookingSuccess }) {
  const { user, isAuthenticated, quickLogin, showToast } = useAuth();
  
  // Steps: 1 = Seat Selection, 2 = Concessions, 3 = Payment & Confirmation
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [layoutData, setLayoutData] = useState(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [lockExpiresAt, setLockExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  
  // Concessions
  const [concessionItems, setConcessionItems] = useState([]);
  const [concessionCart, setConcessionCart] = useState({}); // { itemId: quantity }

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [simulateFail, setSimulateFail] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Fetch seat layout
  const fetchLayout = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await api.getScreeningLayout(screeningId);
      setLayoutData(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && screeningId) {
      setStep(1);
      setSelectedSeatIds([]);
      setConcessionCart({});
      setLockExpiresAt(null);
      fetchLayout();
      
      // Load concessions
      api.getConcessions().then(items => setConcessionItems(items || [])).catch(console.error);
    }
  }, [isOpen, screeningId]);

  // Lock countdown timer
  useEffect(() => {
    if (!lockExpiresAt) return;
    const interval = setInterval(() => {
      const remainingSec = Math.max(0, Math.floor((lockExpiresAt - Date.now()) / 1000));
      setTimeLeft(remainingSec);
      if (remainingSec <= 0) {
        clearInterval(interval);
        showToast("Your temporary seat hold has expired. Please reselect your seats.", "error");
        fetchLayout();
        setSelectedSeatIds([]);
        setLockExpiresAt(null);
        setStep(1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockExpiresAt]);

  if (!isOpen) return null;

  // Toggle seat selection
  const handleSeatClick = (seat) => {
    if (seat.status === "booked" || seat.status === "blocked") {
      showToast(`Seat ${seat.seat_identifier} is not available.`, "error");
      return;
    }
    if (seat.status === "locked") {
      showToast(`Seat ${seat.seat_identifier} is currently held by another customer.`, "error");
      return;
    }

    if (selectedSeatIds.includes(seat.seat_id)) {
      setSelectedSeatIds(selectedSeatIds.filter(id => id !== seat.seat_id));
    } else {
      if (selectedSeatIds.length >= 8) {
        showToast("You can select a maximum of 8 seats per booking.", "error");
        return;
      }
      setSelectedSeatIds([...selectedSeatIds, seat.seat_id]);
    }
  };

  // Find all seat objects selected
  const allSeatsList = layoutData?.rows 
    ? Object.values(layoutData.rows).flat() 
    : [];
  const selectedSeats = allSeatsList.filter(s => selectedSeatIds.includes(s.seat_id));

  // Ticket subtotal
  const ticketSubtotal = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);

  // Concessions subtotal
  const concessionSubtotal = Object.entries(concessionCart).reduce((sum, [itemId, qty]) => {
    const item = concessionItems.find(c => c.item_id === parseInt(itemId));
    return sum + (item ? item.price * qty : 0);
  }, 0);

  // Taxes
  const baseSubtotal = ticketSubtotal + concessionSubtotal;
  const convenienceFee = Math.round(baseSubtotal * 0.05 * 100) / 100;
  const gstTax = Math.round((baseSubtotal + convenienceFee) * 0.18 * 100) / 100;
  const grandTotal = Math.round((baseSubtotal + convenienceFee + gstTax) * 100) / 100;

  // Lock seats and advance to Step 2
  const handleProceedToConcessions = async () => {
    if (selectedSeatIds.length === 0) {
      showToast("Please choose at least one seat.", "error");
      return;
    }
    try {
      setErrorMsg(null);
      // Lock seats via backend API
      const lockRes = await api.lockSeats(screeningId, selectedSeatIds);
      const ttl = lockRes.ttl_seconds || 300;
      setLockExpiresAt(Date.now() + ttl * 1000);
      setTimeLeft(ttl);
      showToast(`Locked ${selectedSeatIds.length} seat${selectedSeatIds.length > 1 ? "s" : ""} for 5 minutes.`);
      setStep(2);
    } catch (err) {
      setErrorMsg(err.message);
      showToast(err.message, "error");
      fetchLayout(); // Refresh layout to show collision
    }
  };

  // Update concession quantity
  const handleConcessionQty = (itemId, delta, maxStock) => {
    setConcessionCart(prev => {
      const curr = prev[itemId] || 0;
      const next = Math.max(0, Math.min(curr + delta, maxStock));
      if (next === 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  // Execute Booking & Payment
  const handleExecutePayment = async () => {
    setProcessingPayment(true);
    setErrorMsg(null);

    const concessionsPayload = Object.entries(concessionCart)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, qty]) => ({
        item_id: parseInt(itemId),
        quantity: qty
      }));

    try {
      const bookingRes = await api.createBooking({
        screening_id: screeningId,
        seat_ids: selectedSeatIds,
        concessions: concessionsPayload,
        payment_method: paymentMethod,
        simulated_payment_success: !simulateFail
      });

      showToast("Booking confirmed and tickets generated!", "success");
      onBookingSuccess(bookingRes);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
      showToast(err.message, "error");
    } finally {
      setProcessingPayment(false);
    }
  };

  const screening = layoutData?.screening || {};
  const movie = screening.movie || {};
  const cinema = screening.cinema || {};
  const screen = screening.screen || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#131926] border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-[#0B0F19]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center font-bold">
              🎬
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {movie.title || "Cinema Screening"}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/60">
                  {screen.screen_type || "IMAX"}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {cinema.name} • {screen.screen_name} • {screening.start_time}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Step Indicators */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              <span className={`px-2.5 py-1 rounded-lg ${step === 1 ? "bg-red-600 text-white font-bold" : "text-slate-400"}`}>
                1. Seats
              </span>
              <span className="text-slate-600">→</span>
              <span className={`px-2.5 py-1 rounded-lg ${step === 2 ? "bg-red-600 text-white font-bold" : "text-slate-400"}`}>
                2. Snacks
              </span>
              <span className="text-slate-600">→</span>
              <span className={`px-2.5 py-1 rounded-lg ${step === 3 ? "bg-red-600 text-white font-bold" : "text-slate-400"}`}>
                3. Checkout
              </span>
            </div>

            {/* Hold Timer */}
            {lockExpiresAt && timeLeft !== null && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 px-6 bg-red-950/70 border-b border-red-800 text-red-300 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
            </span>
            <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm">Connecting to database & loading screen layout...</p>
            </div>
          ) : step === 1 ? (
            /* STEP 1: INTERACTIVE SEAT SELECTION */
            <div>
              {!isAuthenticated && (
                <div className="mb-6 p-3 px-4 rounded-2xl bg-blue-950/40 border border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-blue-200">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                    <span><strong>Guest Booking:</strong> 1-click checkout active. Seats & snacks are reserved without requiring prior login.</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => quickLogin("customer")}
                    className="px-3 py-1 rounded-xl bg-blue-600/70 hover:bg-blue-600 text-xs font-bold text-white transition-colors shrink-0 w-fit"
                  >
                    1-Click Demo Login
                  </button>
                </div>
              )}

              {/* Curved Cinema Screen */}
              <div className="max-w-md mx-auto mb-8 text-center">
                <div className="cinema-screen-curve mb-2" />
                <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                  SCREEN THIS WAY (ALL EYES HERE)
                </span>
              </div>

              {/* Seating Grid */}
              <div className="space-y-3 max-w-xl mx-auto py-2">
                {layoutData?.rows && Object.entries(layoutData.rows).map(([rowLabel, rowSeats]) => (
                  <div key={rowLabel} className="flex items-center justify-center gap-2">
                    <span className="w-6 text-xs font-bold text-slate-400 text-right font-mono">
                      {rowLabel}
                    </span>

                    <div className="flex gap-1.5 sm:gap-2">
                      {rowSeats.map((seat) => {
                        const isSelected = selectedSeatIds.includes(seat.seat_id);
                        
                        let seatBg = "bg-emerald-600/80 hover:bg-emerald-500 text-white"; // Available (Green)
                        if (seat.status === "booked") {
                          seatBg = "bg-red-600 cursor-not-allowed opacity-80 text-white"; // Booked (Red)
                        } else if (seat.status === "blocked") {
                          seatBg = "bg-slate-700 cursor-not-allowed opacity-40 text-slate-400"; // Blocked (Grey)
                        } else if (seat.status === "locked") {
                          seatBg = "bg-slate-600 cursor-not-allowed opacity-60 text-slate-300"; // Locked (Grey)
                        } else if (isSelected) {
                          seatBg = "bg-amber-500 hover:bg-amber-400 text-black font-bold ring-2 ring-white scale-110"; // Selected (Yellow)
                        }

                        return (
                          <button
                            key={seat.seat_id}
                            disabled={seat.status === "booked" || seat.status === "blocked" || seat.status === "locked"}
                            onClick={() => handleSeatClick(seat)}
                            title={`Seat ${seat.seat_identifier} (${seat.category}) - ₹${seat.price}`}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] font-semibold transition-all duration-150 flex items-center justify-center ${seatBg}`}
                          >
                            {seat.seat_number}
                          </button>
                        );
                      })}
                    </div>

                    <span className="w-6 text-xs font-bold text-slate-400 font-mono">
                      {rowLabel}
                    </span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-8 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-emerald-600" />
                  <span>Available (Green)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-red-600" />
                  <span>Booked (Red)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-amber-500" />
                  <span>Selected (Yellow)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-slate-600" />
                  <span>Locked / Maint. (Grey)</span>
                </div>
              </div>

              {/* Category Pricing Tiers */}
              <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-around gap-4 text-xs">
                {layoutData?.screening?.prices && Object.entries(layoutData.screening.prices).map(([cat, pr]) => (
                  <div key={cat} className="flex items-center gap-2">
                    <span className="font-medium text-slate-400">{cat} Class:</span>
                    <span className="font-bold text-white">₹{pr}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : step === 2 ? (
            /* STEP 2: CONCESSIONS / SNACKS SELECTION */
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-red-500" /> Grab Cinema Concessions & Combos
                  </h4>
                  <p className="text-xs text-slate-400">Pre-order hot popcorn and cold drinks delivered to your seat.</p>
                </div>
                <div className="flex items-center gap-3">
                  {concessionSubtotal > 0 && (
                    <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                      ₹{concessionSubtotal.toFixed(2)} snacks added
                    </span>
                  )}
                  <button
                    onClick={() => setStep(3)}
                    className="text-xs text-slate-400 hover:text-white underline"
                  >
                    Skip snacks →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {concessionItems.map((item) => {
                  const qty = concessionCart[item.item_id] || 0;
                  return (
                    <div
                      key={item.item_id}
                      className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5 hover:border-slate-700 transition-colors"
                    >
                      <img
                        src={item.image_url}
                        alt={item.item_name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=300&q=80";
                        }}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-700/60"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            Stock: {item.stock_quantity}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white truncate">{item.item_name}</h5>
                        <p className="text-xs font-semibold text-red-400">₹{item.price}</p>
                      </div>

                      {/* Add/Remove buttons */}
                      <div className="flex items-center gap-2 bg-[#0B0F19] border border-slate-800 rounded-xl p-1 shrink-0">
                        <button
                          onClick={() => handleConcessionQty(item.item_id, -1, item.stock_quantity)}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-white">
                          {qty}
                        </span>
                        <button
                          disabled={item.stock_quantity <= qty}
                          onClick={() => handleConcessionQty(item.item_id, 1, item.stock_quantity)}
                          className="w-7 h-7 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-30 text-white flex items-center justify-center font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* STEP 3: BOOKING SUMMARY & SIMULATED PAYMENT */
            <div className="space-y-6">
              
              {/* Booking Recap Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                  Booking Summary
                </h4>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Movie & Format:</span>
                    <span className="font-semibold text-white">{movie.title} ({screen.screen_type})</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Cinema & Screen:</span>
                    <span className="font-semibold text-white">{cinema.name} • {screen.screen_name}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Showtime:</span>
                    <span className="font-semibold text-white">{screening.start_time}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Selected Seats ({selectedSeats.length}):</span>
                    <span className="font-bold text-red-400">{selectedSeats.map(s => s.seat_identifier).join(", ")}</span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Ticket Cost ({selectedSeats.length} seats):</span>
                    <span>₹{ticketSubtotal.toFixed(2)}</span>
                  </div>
                  {concessionSubtotal > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Concessions & Snacks:</span>
                      <span>₹{concessionSubtotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>Convenience Fee (5%):</span>
                    <span>₹{convenienceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Integrated GST Tax (18%):</span>
                    <span>₹{gstTax.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                    <span>Grand Payable Total:</span>
                    <span className="text-lg text-red-500 font-black">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Simulated Payment Gateway Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1422] border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Simulated Payment Gateway
                    </h4>
                    <p className="text-[11px] text-slate-400">College DBMS demo sandbox. No real monetary transactions.</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold">
                    TEST MODE
                  </span>
                </div>

                {/* Method selector */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { id: "UPI", label: "Instant UPI", icon: Smartphone },
                    { id: "Credit Card", label: "Credit / Debit", icon: CreditCard },
                    { id: "Net Banking", label: "Net Banking", icon: Building }
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                          paymentMethod === m.id
                            ? "bg-red-950/40 border-red-500 text-white font-semibold"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${paymentMethod === m.id ? "text-red-500" : "text-slate-400"}`} />
                        <span className="text-xs">{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Academic Rollback Test Switch */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${simulateFail ? "text-red-500" : "text-slate-400"}`} />
                    <div>
                      <span className="text-xs font-medium text-white block">Test Payment Failure / Rollback</span>
                      <span className="text-[10px] text-slate-400">Triggers simulated bank rejection to test ACID rollback</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simulateFail}
                      onChange={(e) => setSimulateFail(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 px-6 border-t border-slate-800 bg-[#0B0F19] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Total Payable:</span>
            <span className="text-lg font-black text-white">
              ₹{grandTotal.toFixed(2)}
              <span className="text-xs font-normal text-slate-400 ml-2">({selectedSeats.length} seats)</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}

            {step === 1 ? (
              <button
                disabled={selectedSeatIds.length === 0}
                onClick={handleProceedToConcessions}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-red-600/30 flex items-center gap-1.5 transition-all"
              >
                Select Snacks & Drinks <ChevronRight className="w-4 h-4" />
              </button>
            ) : step === 2 ? (
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 flex items-center gap-1.5 transition-all"
              >
                {concessionSubtotal > 0
                  ? `Proceed to Checkout (+₹${concessionSubtotal.toFixed(0)} Snacks)`
                  : "Skip / Proceed to Checkout"}{" "}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                disabled={processingPayment}
                onClick={handleExecutePayment}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2 transition-all ${
                  simulateFail
                    ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30"
                    : "bg-red-600 hover:bg-red-700 text-white shadow-red-600/30"
                }`}
              >
                {processingPayment ? (
                  <>Verifying Transaction...</>
                ) : simulateFail ? (
                  <>Simulate Failed Payment</>
                ) : (
                  <>Pay ₹{grandTotal.toFixed(2)} & Issue Tickets</>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
