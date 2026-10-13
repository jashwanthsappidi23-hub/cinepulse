const API_BASE = "/api";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("cinepulse_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, { ...options, headers });
    if (options.responseType === "blob") {
      if (!res.ok) throw new Error("Failed to download file.");
      return await res.blob();
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errorMsg = data?.detail || data?.message || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: (credentials) => apiRequest("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  register: (userData) => apiRequest("/auth/register", { method: "POST", body: JSON.stringify(userData) }),
  getProfile: () => apiRequest("/auth/me"),
  getDemoUsers: () => apiRequest("/auth/demo-users"),

  // Movies
  getMovies: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/movies${qs ? `?${qs}` : ""}`);
  },
  getMovieDetail: (id) => apiRequest(`/movies/${id}`),
  getGenres: () => apiRequest("/movies/genres"),
  getLanguages: () => apiRequest("/movies/languages"),

  // Cinemas
  getCinemas: (city) => apiRequest(`/cinemas${city ? `?city=${encodeURIComponent(city)}` : ""}`),
  getCities: () => apiRequest("/cinemas/cities"),
  getCitiesDirectory: () => apiRequest("/cinemas/cities/directory"),
  getCinemaDetail: (id) => apiRequest(`/cinemas/${id}`),

  // Screenings & Layout
  getScreenings: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/screenings${qs ? `?${qs}` : ""}`);
  },
  getScreeningLayout: (screeningId) => apiRequest(`/screenings/${screeningId}/layout`),
  lockSeats: (screeningId, seatIds) => apiRequest(`/screenings/${screeningId}/lock-seats`, {
    method: "POST",
    body: JSON.stringify({ seat_ids: seatIds })
  }),
  releaseSeats: (screeningId, seatIds) => apiRequest(`/screenings/${screeningId}/release-seats`, {
    method: "POST",
    body: JSON.stringify({ seat_ids: seatIds })
  }),

  // Bookings
  createBooking: (payload) => apiRequest("/bookings", {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  getMyBookings: () => apiRequest("/bookings/my-bookings"),
  getBookingByRef: (ref) => apiRequest(`/bookings/ref/${ref}`),
  cancelBooking: (bookingId, reason) => apiRequest(`/bookings/${bookingId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason })
  }),

  // Concessions
  getConcessions: (cat) => apiRequest(`/concessions${cat ? `?category=${encodeURIComponent(cat)}` : ""}`),

  // Manager
  getManagerStats: () => apiRequest("/manager/stats"),
  scheduleScreening: (payload) => apiRequest("/manager/screenings", { method: "POST", body: JSON.stringify(payload) }),
  cancelScreening: (id) => apiRequest(`/manager/screenings/${id}`, { method: "DELETE" }),
  createMovie: (movieData) => apiRequest("/manager/movies", { method: "POST", body: JSON.stringify(movieData) }),
  toggleSeatMaintenance: (seatId) => apiRequest(`/manager/seats/${seatId}/toggle-maintenance`, { method: "POST" }),
  updateConcessionItem: (itemId, payload) => apiRequest(`/manager/concessions/${itemId}`, { method: "PUT", body: JSON.stringify(payload) }),

  // Admin & Reports
  getAdminUsers: (role) => apiRequest(`/admin/users${role ? `?role=${role}` : ""}`),
  updateUserRole: (userId, role) => apiRequest(`/admin/users/${userId}/role`, { method: "PUT", body: JSON.stringify({ role }) }),
  getAuditLogs: (limit = 50) => apiRequest(`/admin/audit-logs?limit=${limit}`),
  getOccupancyReport: (cinemaId) => apiRequest(`/admin/reports/occupancy${cinemaId ? `?cinema_id=${cinemaId}` : ""}`),
  getMoviePerformanceReport: () => apiRequest("/admin/reports/movie-performance"),
  getScreenUtilizationReport: () => apiRequest("/admin/reports/screen-utilization"),
  getConcessionSalesReport: () => apiRequest("/admin/reports/concessions"),
  getCancellationReport: () => apiRequest("/admin/reports/cancellations"),
  getRefundReport: () => apiRequest("/admin/reports/refunds"),
  getRevenueReport: () => apiRequest("/admin/reports/revenue"),
  getCustomerBookingsReport: () => apiRequest("/admin/reports/customer-bookings"),
  exportReportCsvUrl: (reportType) => `${API_BASE}/admin/reports/export-csv?report_type=${reportType}`
};
