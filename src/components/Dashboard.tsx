import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "./ui/dialog";
import { AddCustomer } from "./AddCustomer";
import {
  DollarSign,
  Wrench,
  CheckCircle2,
  Users,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Car,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";
import { api } from "../api/client";
import { formatDisplayDate } from "../utils/dateFormat";

interface DashboardStats {
  totalRevenue: number;
  revenueToday: number;
  jobsToday: number;
  completedToday: number;
  jobsInProgress: number;
  customerCount: number;
  vehicleCount: number;
  revenueChangePercent: number | null;
  completedChangePercent: number | null;
}

interface InvoiceRow {
  id: string;
  invoiceNumber?: string;
  customer?: string;
  customerId?: string;
  make?: string;
  model?: string;
  plate?: string;
  carYear?: string;
  date?: string;
  amount?: number;
  status?: string;
  items?: { description?: string }[];
}

function formatRs(n: number) {
  return "Rs " + (n ?? 0).toLocaleString();
}

function formatTimeAgo(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDisplayDate(dateStr);
}

interface DashboardProps {
  onNavigate?: (page: string) => void;
  setShowCreateInvoice?: (show: boolean) => void;
}

export function Dashboard({ onNavigate, setShowCreateInvoice }: DashboardProps = {}) {
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [statsRes, invoicesRes] = await Promise.all([
          api.getDashboardStats(),
          api.getRecentInvoices(),
        ]);
        if (!cancelled) {
          setStats(statsRes);
          setRecentInvoices((invoicesRes || []) as InvoiceRow[]);
        }
      } catch {
        if (!cancelled) setStats(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl mb-1 lg:mb-2">Dashboard</h1>
          <p className="text-sm lg:text-base text-gray-600">Welcome back! Here's your workshop overview.</p>
        </div>
        <div className="flex flex-wrap gap-2 lg:gap-3">
          <Button 
            className="bg-theme hover:bg-theme-dark flex-1 lg:flex-none" 
            size="sm"
            type="button"
            onClick={() => {
              setShowCreateInvoice?.(true);
              onNavigate?.("invoices");
            }}
          >
            <DollarSign className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Create Invoice</span>
          </Button>
          <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 lg:flex-none" size="sm">
                <Users className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">Add Customer</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] p-0 bg-transparent border-0 shadow-none [&>button]:hidden" aria-describedby={undefined}>
              <DialogTitle className="sr-only">Add New Customer</DialogTitle>
              <AddCustomer 
                onClose={() => setIsCustomerDialogOpen(false)}
                onSubmit={(data) => {
                  console.log("Form submitted:", data);
                  // Add customer logic here
                }}
                onSaveAndAddVehicle={(data) => {
                  console.log("Form submitted and navigating to vehicles:", data);
                  // Add customer logic here
                  setIsCustomerDialogOpen(false);
                  // Navigate to vehicles page
                  if (onNavigate) {
                    onNavigate("vehicles");
                  }
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Today's Performance - Minimal Design */}
      <motion.div
        className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-xl lg:text-2xl text-white mb-1">Today's Performance</h2>
            <p className="text-sm text-slate-400">Track your daily revenue, jobs, and customer satisfaction</p>
          </div>

          <div className="grid grid-cols-3 gap-3 lg:gap-6">
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Total Revenue</p>
              <p className="text-xl lg:text-3xl text-white">
                {loading ? "—" : formatRs(stats?.revenueToday ?? 0)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Jobs Today</p>
              <p className="text-xl lg:text-3xl text-white">{loading ? "—" : (stats?.jobsToday ?? 0)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Completed Today</p>
              <p className="text-xl lg:text-3xl text-white">{loading ? "—" : (stats?.completedToday ?? 0)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">Revenue</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl mb-1">{loading ? "—" : formatRs(stats?.totalRevenue ?? 0)}</div>
              <div className="flex items-center text-sm text-green-600">
                {loading || stats?.revenueChangePercent == null ? (
                  <span>Total revenue</span>
                ) : (
                  <>
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>
                      {stats.revenueChangePercent >= 0 ? "+" : ""}
                      {stats.revenueChangePercent}% vs last week
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-theme">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">Jobs in Progress</CardTitle>
              <div className="p-2 bg-theme-100 rounded-lg">
                <Wrench className="h-5 w-5 text-theme" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl mb-1">{loading ? "—" : (stats?.jobsInProgress ?? 0)}</div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                <span>Pending invoices</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">Completed Today</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl mb-1">{loading ? "—" : (stats?.completedToday ?? 0)}</div>
              <div className="flex items-center text-sm text-purple-600">
                {loading || stats?.completedChangePercent == null ? (
                  <span>Paid today</span>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>
                      {stats.completedChangePercent >= 0 ? "+" : ""}
                      {stats.completedChangePercent}% vs yesterday
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">Active Customers</CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl mb-1">{loading ? "—" : (stats?.customerCount ?? 0)}</div>
              <div className="flex items-center text-sm text-gray-600">
                <Car className="h-4 w-4 mr-1" />
                <span>{loading ? "—" : (stats?.vehicleCount ?? 0)} vehicles registered</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      

      {/* Recent Jobs (from recent invoices) */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle>Recent Jobs</CardTitle>
              <p className="text-xs lg:text-sm text-gray-600 mt-1">Latest service activities in your workshop</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onNavigate?.("invoices")}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : recentInvoices.length === 0 ? (
            <p className="text-sm text-gray-500">No recent invoices yet.</p>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {recentInvoices.map((inv) => {
                  const service = inv.items?.[0]?.description ?? "—";
                  const status = inv.status ?? "Pending";
                  return (
                    <div key={inv.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{inv.invoiceNumber ?? inv.id}</p>
                          <p className="text-sm text-gray-600">{inv.customer}</p>
                        </div>
                        <Badge
                          className={
                            status === "Paid" ? "bg-green-100 text-green-700 border-green-200" :
                            status === "In Progress" ? "bg-theme-100 text-theme border-theme-200" :
                            "bg-gray-100 text-gray-700 border-gray-200"
                          }
                        >
                          {status}
                        </Badge>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{[inv.make, inv.model].filter(Boolean).join(" ") || "—"}</span>
                        {(inv.carYear || inv.plate) && (
                          <span className="text-xs text-gray-500">{inv.carYear || inv.plate}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{service}</p>
                      <div className="flex items-center justify-between text-sm pt-2 border-t">
                        <span className="font-medium">{formatRs(inv.amount ?? 0)}</span>
                        <span className="text-gray-500">{formatTimeAgo(inv.date ?? "")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead className="text-right">Amount (PKR)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentInvoices.map((inv) => {
                      const service = inv.items?.[0]?.description ?? "—";
                      const status = inv.status ?? "Pending";
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">{inv.invoiceNumber ?? inv.id}</TableCell>
                          <TableCell>{inv.customer ?? "—"}</TableCell>
                          <TableCell className="align-top">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {[inv.make, inv.model].filter(Boolean).join(" ") || "—"}
                              </span>
                              {(inv.carYear || inv.plate) && (
                                <span className="text-xs text-gray-500">{inv.carYear || inv.plate}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{service}</TableCell>
                          <TableCell className="text-right">{formatRs(inv.amount ?? 0)}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                status === "Paid" ? "bg-green-100 text-green-700 border-green-200" :
                                status === "In Progress" ? "bg-theme-100 text-theme border-theme-200" :
                                "bg-gray-100 text-gray-700 border-gray-200"
                              }
                            >
                              {status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-500">{formatTimeAgo(inv.date ?? "")}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
