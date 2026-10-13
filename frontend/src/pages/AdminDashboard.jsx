import React, { useState, useEffect } from "react";
import { 
  Shield, BarChart3, Download, Users, FileText, 
  TrendingUp, RefreshCw, CheckCircle, AlertCircle, PieChart as PieIcon 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line 
} from "recharts";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const CHART_COLORS = ["#E50914", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"];

export default function AdminDashboard() {
  const { user, showToast } = useAuth();
  
  // Active Report Tab:
  // "occupancy" | "movie_performance" | "screen_utilization" | "concessions" | 
  // "cancellations" | "refunds" | "revenue" | "customer_bookings" | "users" | "audit"
  const [reportTab, setReportTab] = useState("revenue");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Users & Audit
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const loadReport = async (tabName) => {
    setLoading(true);
    try {
      if (tabName === "occupancy") {
        const d = await api.getOccupancyReport();
        setReportData(d || []);
      } else if (tabName === "movie_performance") {
        const d = await api.getMoviePerformanceReport();
        setReportData(d || []);
      } else if (tabName === "screen_utilization") {
        const d = await api.getScreenUtilizationReport();
        setReportData(d || []);
      } else if (tabName === "concessions") {
        const d = await api.getConcessionSalesReport();
        setReportData(d || []);
      } else if (tabName === "cancellations") {
        const d = await api.getCancellationReport();
        setReportData(d || []);
      } else if (tabName === "refunds") {
        const d = await api.getRefundReport();
        setReportData(d || []);
      } else if (tabName === "revenue") {
        const d = await api.getRevenueReport();
        setReportData(d || []);
      } else if (tabName === "customer_bookings") {
        const d = await api.getCustomerBookingsReport();
        setReportData(d || []);
      } else if (tabName === "users") {
        const d = await api.getAdminUsers();
        setUsersList(d || []);
      } else if (tabName === "audit") {
        const d = await api.getAuditLogs(60);
        setAuditLogs(d || []);
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(reportTab);
  }, [reportTab]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      showToast(`User role updated to ${newRole}`);
      loadReport("users");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const downloadCsv = (type) => {
    const url = api.exportReportCsvUrl(type);
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
              DBMS Administrator Console
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-500" /> Database Analytics & Audit
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            8 Relational DBMS Analytical Reports, SQL aggregates, CSV streaming, and system security logs
          </p>
        </div>

        <button
          onClick={() => loadReport(reportTab)}
          className="p-2.5 rounded-xl bg-[#131926] border border-slate-800 text-slate-400 hover:text-white transition-colors self-start"
          title="Refresh Active Report"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Report Selector Pills */}
      <div className="p-2 rounded-2xl bg-[#131926] border border-slate-800 flex flex-wrap gap-1.5 text-xs">
        {[
          { id: "revenue", label: "1. Revenue Summary", csv: "revenue" },
          { id: "occupancy", label: "2. Show Occupancy", csv: "occupancy" },
          { id: "movie_performance", label: "3. Movie Performance", csv: "movies" },
          { id: "screen_utilization", label: "4. Screen Utilization", csv: "screen_utilization" },
          { id: "concessions", label: "5. Concession Sales", csv: "concessions" },
          { id: "cancellations", label: "6. Cancellations", csv: "cancellations" },
          { id: "refunds", label: "7. Refunds", csv: "refunds" },
          { id: "customer_bookings", label: "8. Customer Frequency", csv: "customer_bookings" },
          { id: "users", label: "User Roles", csv: null },
          { id: "audit", label: "Security Audit Logs", csv: null },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportTab(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              reportTab === tab.id
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        
        {/* CSV Export Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">
            Active Query: <strong className="text-slate-200">SQL 3NF Aggregation ({reportTab})</strong>
          </span>

          {!["users", "audit"].includes(reportTab) && (
            <button
              onClick={() => {
                const map = {
                  revenue: "revenue",
                  occupancy: "occupancy",
                  movie_performance: "movies",
                  screen_utilization: "screen_utilization",
                  concessions: "concessions",
                  cancellations: "cancellations",
                  refunds: "refunds",
                  customer_bookings: "customer_bookings"
                };
                downloadCsv(map[reportTab]);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" /> Export CSV File
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-slate-400">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* 1. REVENUE REPORT */}
            {reportTab === "revenue" && (
              <div className="space-y-6">
                {/* Visual Chart */}
                <div className="p-6 rounded-3xl bg-[#131926] border border-slate-800 shadow-xl">
                  <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
                    Daily Revenue Breakdown (Collections vs Refunds vs Net)
                  </h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={reportData}>
                        <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                        <YAxis stroke="#64748B" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: "#0B0F19", border: "1px solid #334155", borderRadius: "8px" }} />
                        <Area type="monotone" dataKey="gross_collections" name="Gross Collections" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                        <Area type="monotone" dataKey="net_revenue" name="Net Revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                        <Area type="monotone" dataKey="refunds" name="Refunds" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Data Table */}
                <div className="rounded-2xl bg-[#131926] border border-slate-800 overflow-hidden shadow-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0B0F19] text-slate-400 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="p-3.5">Transaction Date</th>
                        <th className="p-3.5">Transactions</th>
                        <th className="p-3.5">Gross Collections</th>
                        <th className="p-3.5">Processed Refunds</th>
                        <th className="p-3.5 text-right">Net System Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {reportData.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-800/40">
                          <td className="p-3.5 font-mono font-bold text-white">{r.date}</td>
                          <td className="p-3.5 font-mono">{r.transaction_count}</td>
                          <td className="p-3.5 text-emerald-400 font-bold">₹{r.gross_collections}</td>
                          <td className="p-3.5 text-red-400 font-bold">₹{r.refunds}</td>
                          <td className="p-3.5 text-right font-black text-white">₹{r.net_revenue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. OCCUPANCY REPORT */}
            {reportTab === "occupancy" && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-[#131926] border border-slate-800 shadow-xl">
                  <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
                    Screening Occupancy Rates (%)
                  </h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.slice(0, 10)}>
                        <XAxis dataKey="movie_title" stroke="#64748B" fontSize={10} interval={0} angle={-15} textAnchor="end" height={60} />
                        <YAxis stroke="#64748B" fontSize={11} unit="%" />
                        <Tooltip contentStyle={{ backgroundColor: "#0B0F19", border: "1px solid #334155", borderRadius: "8px" }} />
                        <Bar dataKey="occupancy_percentage" name="Occupancy %" fill="#E50914" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#131926] border border-slate-800 overflow-hidden shadow-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0B0F19] text-slate-400 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="p-3.5">ID</th>
                        <th className="p-3.5">Movie</th>
                        <th className="p-3.5">Cinema</th>
                        <th className="p-3.5">Screen / Format</th>
                        <th className="p-3.5">Date & Time</th>
                        <th className="p-3.5">Booked / Total</th>
                        <th className="p-3.5 text-right">Occupancy %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {reportData.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-800/40">
                          <td className="p-3.5 font-mono text-slate-500">{r.screening_id}</td>
                          <td className="p-3.5 font-bold text-white">{r.movie_title}</td>
                          <td className="p-3.5">{r.cinema_name} ({r.cinema_city})</td>
                          <td className="p-3.5">{r.screen_name} • {r.screen_type}</td>
                          <td className="p-3.5 font-mono">{r.show_date} {r.start_time}</td>
                          <td className="p-3.5 font-mono">{r.booked_seats} / {r.total_capacity}</td>
                          <td className="p-3.5 text-right font-black text-amber-400">{r.occupancy_percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. MOVIE PERFORMANCE REPORT */}
            {reportTab === "movie_performance" && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-[#131926] border border-slate-800 shadow-xl">
                  <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
                    Gross Ticket Revenue by Movie (Ranked)
                  </h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData} layout="vertical">
                        <XAxis type="number" stroke="#64748B" fontSize={11} />
                        <YAxis type="category" dataKey="title" stroke="#64748B" fontSize={11} width={120} />
                        <Tooltip contentStyle={{ backgroundColor: "#0B0F19", border: "1px solid #334155", borderRadius: "8px" }} />
                        <Bar dataKey="ticket_revenue" name="Revenue (₹)" fill="#F59E0B" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#131926] border border-slate-800 overflow-hidden shadow-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0B0F19] text-slate-400 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="p-3.5">Rank</th>
                        <th className="p-3.5">Title</th>
                        <th className="p-3.5">Genre</th>
                        <th className="p-3.5">Language</th>
                        <th className="p-3.5">Rating</th>
                        <th className="p-3.5">Orders</th>
                        <th className="p-3.5">Tickets Sold</th>
                        <th className="p-3.5 text-right">Gross Ticket Sales</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {reportData.map((m) => (
                        <tr key={m.movie_id} className="hover:bg-slate-800/40">
                          <td className="p-3.5 font-bold text-amber-400">#{m.rank}</td>
                          <td className="p-3.5 font-bold text-white">{m.title}</td>
                          <td className="p-3.5">{m.genre}</td>
                          <td className="p-3.5">{m.language}</td>
                          <td className="p-3.5 font-mono">{m.rating}</td>
                          <td className="p-3.5 font-mono">{m.total_bookings}</td>
                          <td className="p-3.5 font-mono font-bold text-emerald-400">{m.tickets_sold}</td>
                          <td className="p-3.5 text-right font-black text-white">₹{m.ticket_revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. SCREEN UTILIZATION REPORT */}
            {reportTab === "screen_utilization" && (
              <div className="rounded-2xl bg-[#131926] border border-slate-800 overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0B0F19] text-slate-400 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="p-3.5">Screen ID</th>
                      <th className="p-3.5">Cinema</th>
                      <th className="p-3.5">Auditorium</th>
                      <th className="p-3.5">Screen Format</th>
                      <th className="p-3.5">Capacity</th>
                      <th className="p-3.5">Shows Scheduled</th>
                      <th className="p-3.5">Operating Hours</th>
                      <th className="p-3.5 text-right">Utilization %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {reportData.map((sc) => (
                      <tr key={sc.screen_id} className="hover:bg-slate-800/40">
                        <td className="p-3.5 font-mono text-slate-500">{sc.screen_id}</td>
                        <td className="p-3.5 font-bold text-white">{sc.cinema_name} ({sc.city})</td>
                        <td className="p-3.5">{sc.screen_name}</td>
                        <td className="p-3.5">{sc.screen_type}</td>
                        <td className="p-3.5 font-mono">{sc.capacity} seats</td>
                        <td className="p-3.5 font-mono">{sc.screenings_count}</td>
                        <td className="p-3.5 font-mono">{sc.scheduled_hours} hrs</td>
                        <td className="p-3.5 text-right font-bold text-emerald-400">{sc.utilization_percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 5. CONCESSIONS REPORT */}
            {reportTab === "concessions" && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-[#131926] border border-slate-800 shadow-xl">
                  <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
                    F&B Demand: Quantity Sold by Item
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData}>
                        <XAxis dataKey="item_name" stroke="#64748B" fontSize={10} interval={0} angle={-15} textAnchor="end" height={60} />
                        <YAxis stroke="#64748B" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: "#0B0F19", border: "1px solid #334155", borderRadius: "8px" }} />
                        <Bar dataKey="units_sold" name="Units Sold" fill="#10B981" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#131926] border border-slate-800 overflow-hidden shadow-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0B0F19] text-slate-400 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="p-3.5">ID</th>
                        <th className="p-3.5">Item Name</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5">Unit Price</th>
                        <th className="p-3.5">Remaining Stock</th>
                        <th className="p-3.5">Units Sold</th>
                        <th className="p-3.5 text-right">Concession Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {reportData.map((c) => (
                        <tr key={c.item_id} className="hover:bg-slate-800/40">
                          <td className="p-3.5 font-mono text-slate-500">{c.item_id}</td>
                          <td className="p-3.5 font-bold text-white">{c.item_name}</td>
                          <td className="p-3.5">{c.category}</td>
                          <td className="p-3.5 font-mono">₹{c.unit_price}</td>
                          <td className="p-3.5 font-mono">{c.stock_remaining}</td>
                          <td className="p-3.5 font-mono font-bold text-amber-400">{c.units_sold}</td>
                          <td className="p-3.5 text-right font-black text-white">₹{c.total_revenue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. CANCELLATIONS REPORT */}
            {reportTab === "cancellations" && (
              <div className="rounded-2xl bg-[#131926] border border-slate-800 overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0B0F19] text-slate-400 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="p-3.5">Cancellation ID</th>
                      <th className="p-3.5">Booking Ref</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Movie / Cinema</th>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Reason</th>
                      <th className="p-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {reportData.map((c) => (
                      <tr key={c.cancellation_id} className="hover:bg-slate-800/40">
                        <td className="p-3.5 font-mono text-slate-500">{c.cancellation_id}</td>
                        <td className="p-3.5 font-mono font-bold text-white">{c.booking_reference}</td>
                        <td className="p-3.5">{c.customer_name}</td>
                        <td className="p-3.5">{c.movie_title} ({c.cinema_name})</td>
                        <td className="p-3.5 font-mono">{c.cancellation_date}</td>
                        <td className="p-3.5 text-slate-400 italic">"{c.reason}"</td>
                        <td className="p-3.5 text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950 text-red-400 border border-red-800/60">
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 7. REFUNDS REPORT */}
            {reportTab === "refunds" && (
              <div className="rounded-2xl bg-[#131926] border border-slate-800 overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0B0F19] text-slate-400 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="p-3.5">Refund ID</th>
                      <th className="p-3.5">Booking Ref</th>
                      <th className="p-3.5">Original Transaction Ref</th>
                      <th className="p-3.5">Payment Method</th>
                      <th className="p-3.5">Original Paid</th>
                      <th className="p-3.5">Refunded Amount</th>
                      <th className="p-3.5 text-right">Processed Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {reportData.map((r) => (
                      <tr key={r.refund_id} className="hover:bg-slate-800/40">
                        <td className="p-3.5 font-mono text-slate-500">{r.refund_id}</td>
                        <td className="p-3.5 font-mono font-bold text-white">{r.booking_reference}</td>
                        <td className="p-3.5 font-mono text-slate-400">{r.transaction_reference}</td>
                        <td className="p-3.5">{r.payment_method}</td>
                        <td className="p-3.5 font-mono">₹{r.original_paid_amount}</td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400">₹{r.refund_amount}</td>
                        <td className="p-3.5 text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                            {r.refund_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 8. CUSTOMER BOOKING FREQUENCY REPORT */}
            {reportTab === "customer_bookings" && (
              <div className="rounded-2xl bg-[#131926] border border-slate-800 overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0B0F19] text-slate-400 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="p-3.5">User ID</th>
                      <th className="p-3.5">Customer Name</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Total Bookings</th>
                      <th className="p-3.5">Confirmed</th>
                      <th className="p-3.5">Cancelled</th>
                      <th className="p-3.5">Last Booking</th>
                      <th className="p-3.5 text-right">Lifetime Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {reportData.map((u) => (
                      <tr key={u.user_id} className="hover:bg-slate-800/40">
                        <td className="p-3.5 font-mono text-slate-500">{u.user_id}</td>
                        <td className="p-3.5 font-bold text-white">{u.customer_name}</td>
                        <td className="p-3.5 text-slate-400">{u.email}</td>
                        <td className="p-3.5 font-mono font-bold">{u.total_bookings}</td>
                        <td className="p-3.5 font-mono text-emerald-400">{u.confirmed_bookings}</td>
                        <td className="p-3.5 font-mono text-red-400">{u.cancelled_bookings}</td>
                        <td className="p-3.5 font-mono text-slate-400">{u.last_booking_date}</td>
                        <td className="p-3.5 text-right font-black text-amber-400">₹{u.total_spend}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* USER ROLE MANAGEMENT */}
            {reportTab === "users" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  System Accounts & Role-Based Access Control (RBAC)
                </h3>
                <div className="rounded-2xl bg-[#131926] border border-slate-800 overflow-hidden shadow-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0B0F19] text-slate-400 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="p-3.5">User ID</th>
                        <th className="p-3.5">Name</th>
                        <th className="p-3.5">Email</th>
                        <th className="p-3.5">Phone</th>
                        <th className="p-3.5">Registered</th>
                        <th className="p-3.5 text-right">Assigned Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {usersList.map((u) => (
                        <tr key={u.user_id} className="hover:bg-slate-800/40">
                          <td className="p-3.5 font-mono text-slate-500">{u.user_id}</td>
                          <td className="p-3.5 font-bold text-white">{u.name}</td>
                          <td className="p-3.5">{u.email}</td>
                          <td className="p-3.5 font-mono">{u.phone}</td>
                          <td className="p-3.5 font-mono text-slate-500">{u.created_at}</td>
                          <td className="p-3.5 text-right">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                              className={`p-1.5 rounded-lg border text-xs font-semibold focus:outline-none ${
                                u.role === "admin" ? "bg-purple-950/60 border-purple-700 text-purple-300" :
                                u.role === "manager" ? "bg-amber-950/60 border-amber-700 text-amber-300" :
                                "bg-slate-900 border-slate-700 text-slate-300"
                              }`}
                            >
                              <option value="customer">customer</option>
                              <option value="manager">manager</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* AUDIT LOGS */}
            {reportTab === "audit" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Database & System Activity Audit Trail (AuditLogs Table)
                </h3>
                <div className="rounded-2xl bg-[#131926] border border-slate-800 overflow-hidden shadow-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0B0F19] text-slate-400 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="p-3.5">Log ID</th>
                        <th className="p-3.5">Actor</th>
                        <th className="p-3.5">Action</th>
                        <th className="p-3.5">Entity</th>
                        <th className="p-3.5">Details</th>
                        <th className="p-3.5 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {auditLogs.map((l) => (
                        <tr key={l.log_id} className="hover:bg-slate-800/40">
                          <td className="p-3.5 font-mono text-slate-500">{l.log_id}</td>
                          <td className="p-3.5 font-medium text-slate-200">{l.user_name}</td>
                          <td className="p-3.5 font-mono text-purple-400 font-bold">{l.action}</td>
                          <td className="p-3.5 font-mono text-slate-400">{l.entity_type} #{l.entity_id}</td>
                          <td className="p-3.5 text-slate-300 font-mono text-[11px] max-w-xs truncate">{l.details}</td>
                          <td className="p-3.5 text-right font-mono text-slate-500 text-[11px]">{l.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
