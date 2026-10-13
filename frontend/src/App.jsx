import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import TrailerModal from "./components/TrailerModal";
import TicketModal from "./components/TicketModal";
import CityModal from "./components/CityModal";
import PortalGateScreen from "./components/PortalGateScreen";
import HomePage from "./pages/HomePage";
import MoviesPage from "./pages/MoviesPage";
import CinemasPage from "./pages/CinemasPage";
import BookingFlowModal from "./pages/BookingFlowModal";
import MyBookingsPage from "./pages/MyBookingsPage";
import ManagerDashboard from "./pages/ManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// =============================================================================
// PERMANENT BROWSER URL ROUTING HELPERS
// =============================================================================
const parseLocation = () => {
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, "") || "/";
  const searchParams = new URLSearchParams(window.location.search);
  const portalParam = searchParams.get("portal")?.toLowerCase();
  const tabParam = searchParams.get("tab")?.toLowerCase();
  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, "");

  if (path === "/admin" || portalParam === "admin" || hash === "admin") {
    return { portal: "admin", tab: "home" };
  }
  if (path === "/manager" || portalParam === "manager" || hash === "manager") {
    return { portal: "manager", tab: "home" };
  }
  if (path === "/movies" || tabParam === "movies" || hash === "movies") {
    return { portal: "customer", tab: "movies" };
  }
  if (path === "/cinemas" || tabParam === "cinemas" || hash === "cinemas") {
    return { portal: "customer", tab: "cinemas" };
  }
  if (path === "/my-bookings" || path === "/bookings" || tabParam === "my-bookings" || hash === "my-bookings") {
    return { portal: "customer", tab: "my-bookings" };
  }
  return { portal: "customer", tab: "home" };
};

const getUrlForState = (portal, tab) => {
  if (portal === "admin") return "/admin";
  if (portal === "manager") return "/manager";
  if (portal === "customer") {
    if (tab === "movies") return "/movies";
    if (tab === "cinemas") return "/cinemas";
    if (tab === "my-bookings") return "/my-bookings";
    return "/";
  }
  return "/";
};

const getTitleForState = (portal, tab) => {
  if (portal === "admin") return "System Administrator Portal | CinePulse";
  if (portal === "manager") return "Cinema Manager Portal | CinePulse";
  if (portal === "customer") {
    if (tab === "movies") return "Movies | CinePulse";
    if (tab === "cinemas") return "Cinemas & Theatres | CinePulse";
    if (tab === "my-bookings") return "My Bookings & Tickets | CinePulse";
    return "CinePulse — Cinema Screening & Ticket Booking System";
  }
  return "CinePulse";
};

function MainApp() {
  const { user, role } = useAuth();
  
  // Dedicated Portals & Tabs initialized directly from permanent URL
  const initialRoute = parseLocation();
  const [currentPortal, setCurrentPortal] = useState(initialRoute.portal);
  const [activeTab, setActiveTab] = useState(initialRoute.tab);
  
  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalPortal, setAuthModalPortal] = useState("customer");
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [bookingScreeningId, setBookingScreeningId] = useState(null);
  const [ticketModalBooking, setTicketModalBooking] = useState(null);
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  // Sync state changes with the browser address bar & window history
  const syncUrl = (portal, tab, replace = false) => {
    const targetUrl = getUrlForState(portal, tab);
    document.title = getTitleForState(portal, tab);
    if (window.location.pathname !== targetUrl) {
      if (replace) {
        window.history.replaceState({ portal, tab }, "", targetUrl);
      } else {
        window.history.pushState({ portal, tab }, "", targetUrl);
      }
    }
  };

  // Sync initial URL on mount and listen to browser Back / Forward buttons
  useEffect(() => {
    syncUrl(currentPortal, activeTab, true);

    const handlePopState = () => {
      const route = parseLocation();
      setCurrentPortal(route.portal);
      setActiveTab(route.tab);
      document.title = getTitleForState(route.portal, route.tab);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Handlers that keep the browser URL permanent and bookmarkable
  const handleSelectPortal = (portal) => {
    const nextTab = portal === "customer" ? "home" : "home";
    setCurrentPortal(portal);
    setActiveTab(nextTab);
    syncUrl(portal, nextTab);
  };

  const handleSelectTab = (tab) => {
    setCurrentPortal("customer");
    setActiveTab(tab);
    syncUrl("customer", tab);
  };

  const handleOpenAuthModal = (portal = currentPortal) => {
    setAuthModalPortal(portal);
    setAuthModalOpen(true);
  };

  const handleSelectMovie = (movieId) => {
    setSelectedMovieId(movieId);
    setCurrentPortal("customer");
    setActiveTab("movies");
    syncUrl("customer", "movies");
  };

  const handleBookScreening = (screeningId) => {
    setBookingScreeningId(screeningId);
  };

  const handleBookingSuccess = (bookingData) => {
    // When booking completes successfully, open the printable ticket modal
    setTicketModalBooking(bookingData);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      
      {/* Top Navbar with 3-Way Portal Switcher & Gmail Credentials */}
      <Navbar
        currentPortal={currentPortal}
        onSelectPortal={handleSelectPortal}
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        openAuthModal={handleOpenAuthModal}
      />

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* =========================================================================
            PORTAL 1: CUSTOMER PATRON PORTAL (Permanent URLs: /, /movies, /cinemas, /my-bookings)
        ========================================================================= */}
        {currentPortal === "customer" && (
          <>
            {activeTab === "home" && (
              <HomePage
                onSelectMovie={handleSelectMovie}
                onBookScreening={handleBookScreening}
                openTrailer={(m) => setTrailerMovie(m)}
              />
            )}

            {activeTab === "movies" && (
              <MoviesPage
                selectedMovieId={selectedMovieId}
                onClearSelectedMovie={() => setSelectedMovieId(null)}
                onBookScreening={handleBookScreening}
                openTrailer={(m) => setTrailerMovie(m)}
              />
            )}

            {activeTab === "cinemas" && (
              <CinemasPage
                onBookScreening={handleBookScreening}
              />
            )}

            {activeTab === "my-bookings" && (
              <MyBookingsPage
                onOpenTicket={(b) => setTicketModalBooking(b)}
                openAuthModal={() => handleOpenAuthModal("customer")}
              />
            )}
          </>
        )}

        {/* =========================================================================
            PORTAL 2: CINEMA MANAGER PORTAL (Permanent URL: /manager)
        ========================================================================= */}
        {currentPortal === "manager" && (
          role === "manager" || role === "admin" ? (
            <ManagerDashboard
              openAuthModal={() => handleOpenAuthModal("manager")}
            />
          ) : (
            <PortalGateScreen
              portalType="manager"
              onSwitchPortal={handleSelectPortal}
            />
          )
        )}

        {/* =========================================================================
            PORTAL 3: SYSTEM ADMINISTRATOR PORTAL (Permanent URL: /admin)
        ========================================================================= */}
        {currentPortal === "admin" && (
          role === "admin" ? (
            <AdminDashboard />
          ) : (
            <PortalGateScreen
              portalType="admin"
              onSwitchPortal={handleSelectPortal}
            />
          )
        )}

      </main>

      {/* Footer */}
      <Footer 
        setActiveTab={handleSelectTab} 
        onSelectPortal={handleSelectPortal} 
      />

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialPortal={authModalPortal}
      />

      <TrailerModal
        movie={trailerMovie}
        isOpen={!!trailerMovie}
        onClose={() => setTrailerMovie(null)}
      />

      <BookingFlowModal
        screeningId={bookingScreeningId}
        isOpen={!!bookingScreeningId}
        onClose={() => setBookingScreeningId(null)}
        onBookingSuccess={handleBookingSuccess}
      />

      <TicketModal
        booking={ticketModalBooking}
        isOpen={!!ticketModalBooking}
        onClose={() => setTicketModalBooking(null)}
      />

      {/* BookMyShow & District Style City Selection Modal */}
      <CityModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
