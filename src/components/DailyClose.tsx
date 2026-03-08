import { useState, useEffect, useCallback } from "react";
import { useData, DailyCloseRecord } from "../contexts/DataContext";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  CalendarCheck,
  Lock,
  LockOpen,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Package,
  CreditCard,
  Clock,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  Loader2,
  Briefcase,
  Zap,
  Receipt,
} from "lucide-react";

type View = "today" | "history" | "detail";

export function DailyClose() {
  const { dailyCloses, fetchDailyClosePreview, closeDay, reopenDay } = useData();

  const [view, setView] = useState<View>("today");
  const [preview, setPreview] = useState<DailyCloseRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReopenConfirm, setShowReopenConfirm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DailyCloseRecord | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const isTodayClosed = dailyCloses.some((dc) => dc.date === today);

  const todayRecord = dailyCloses.find((dc) => dc.date === today) || null;

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDailyClosePreview(today);
      setPreview(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load preview");
    } finally {
      setLoading(false);
    }
  }, [fetchDailyClosePreview, today]);

  useEffect(() => {
    if (view === "today" && !isTodayClosed) {
      loadPreview();
    } else {
      setLoading(false);
    }
  }, [view, isTodayClosed, loadPreview]);

  const handleCloseDay = async () => {
    setClosing(true);
    setError(null);
    try {
      await closeDay(today);
      setShowConfirm(false);
      setPreview(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to close day");
    } finally {
      setClosing(false);
    }
  };

  const handleReopenDay = async (date: string) => {
    setReopening(true);
    setError(null);
    try {
      await reopenDay(date);
      setShowReopenConfirm(false);
      if (view === "detail") {
        setSelectedRecord(null);
        setView("today");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reopen day");
    } finally {
      setReopening(false);
    }
  };

  const handleViewRecord = (record: DailyCloseRecord) => {
    setSelectedRecord(record);
    setView("detail");
  };

  const displayData = view === "detail" ? selectedRecord : isTodayClosed ? todayRecord : preview;
  const isReadOnly = view === "detail" || isTodayClosed;

  const formatCurrency = (amount: number) =>
    `Rs. ${amount.toLocaleString("en-PK")}`;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-PK", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (view === "history") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("today")}
              className="hover:bg-gray-100 rounded-lg p-2 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Daily Close History</h1>
              <p className="text-sm text-gray-500">
                {dailyCloses.length} day{dailyCloses.length !== 1 ? "s" : ""} closed
              </p>
            </div>
          </div>
        </div>

        {dailyCloses.length === 0 ? (
          <Card className="p-12 text-center">
            <CalendarCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500">No closed days yet</h3>
            <p className="text-sm text-gray-400 mt-1">
              Close your first day to see history here
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Expenses</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Net Profit</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {dailyCloses.map((record) => (
                    <tr
                      key={record.id}
                      onClick={() => handleViewRecord(record)}
                      className="border-b last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{formatDate(record.date)}</div>
                        <div className="text-xs text-gray-500">{record.date}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-green-600">
                        {formatCurrency(record.totalRevenue)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-red-600">
                        {formatCurrency(record.totalExpenses)}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${record.netProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
                        {formatCurrency(record.netProfit)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <Lock className="h-3 w-3 mr-1" />
                          Closed
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-theme" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {view === "detail" && (
            <button
              onClick={() => { setView("history"); setSelectedRecord(null); }}
              className="hover:bg-gray-100 rounded-lg p-2 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {view === "detail" ? "Daily Close Summary" : "Daily Close"}
            </h1>
            <p className="text-sm text-gray-500">
              {displayData ? formatDate(displayData.date) : formatDate(today)}
            </p>
          </div>
          {isReadOnly && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 ml-2">
              <Lock className="h-3 w-3 mr-1" />
              Closed
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isReadOnly && displayData && (
            <Button
              variant="outline"
              onClick={() => setShowReopenConfirm(true)}
              className="gap-2 text-amber-600 border-amber-300 hover:bg-amber-50"
            >
              <LockOpen className="h-4 w-4" />
              Reopen Day
            </Button>
          )}
          {view === "today" && (
            <Button
              variant="outline"
              onClick={() => setView("history")}
              className="gap-2"
            >
              <Clock className="h-4 w-4" />
              History
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </Card>
      )}

      {displayData && (
        <>
          {/* Summary Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 border-l-4 border-l-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(displayData.totalRevenue)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {displayData.paidInvoices.length} paid invoice{displayData.paidInvoices.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-l-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {formatCurrency(displayData.totalExpenses)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {displayData.inventoryPurchases.length + displayData.vendorPayments.length + displayData.salaries.length + displayData.utilities.length + displayData.otherExpenses.length} transaction{(displayData.inventoryPurchases.length + displayData.vendorPayments.length + displayData.salaries.length + displayData.utilities.length + displayData.otherExpenses.length) !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </Card>

            <Card className={`p-5 border-l-4 ${displayData.netProfit >= 0 ? "border-l-blue-500" : "border-l-orange-500"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Net Profit</p>
                  <p className={`text-2xl font-bold mt-1 ${displayData.netProfit >= 0 ? "text-blue-600" : "text-orange-600"}`}>
                    {formatCurrency(displayData.netProfit)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Revenue - Expenses
                  </p>
                </div>
                <div className={`p-3 rounded-full ${displayData.netProfit >= 0 ? "bg-blue-100" : "bg-orange-100"}`}>
                  <DollarSign className={`h-6 w-6 ${displayData.netProfit >= 0 ? "text-blue-600" : "text-orange-600"}`} />
                </div>
              </div>
            </Card>
          </div>

          {/* Revenue Section */}
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b bg-green-50 flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              <h2 className="font-semibold text-green-800">Revenue — Paid Invoices</h2>
              <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700">
                {formatCurrency(displayData.totalRevenue)}
              </Badge>
            </div>
            {displayData.paidInvoices.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No paid invoices for this date</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                      <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                      <th className="text-right py-2.5 px-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.paidInvoices.map((inv) => (
                      <tr key={inv.invoiceId} className="border-b last:border-0">
                        <td className="py-2.5 px-4 font-medium text-gray-900">{inv.invoiceNumber}</td>
                        <td className="py-2.5 px-4 text-gray-600">{inv.customer}</td>
                        <td className="py-2.5 px-4">
                          <Badge variant="outline" className="text-xs">{inv.paymentMethod}</Badge>
                        </td>
                        <td className="py-2.5 px-4 text-right font-medium text-green-600">
                          {formatCurrency(inv.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Expenses Section */}
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b bg-red-50 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-red-600" />
              <h2 className="font-semibold text-red-800">Expenses</h2>
              <Badge variant="secondary" className="ml-auto bg-red-100 text-red-700">
                {formatCurrency(displayData.totalExpenses)}
              </Badge>
            </div>

            {/* Inventory Purchases */}
            <div className="border-b">
              <div className="px-5 py-3 bg-gray-50 flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Inventory Purchases</span>
                <span className="ml-auto text-sm font-semibold text-gray-900">
                  {formatCurrency(displayData.inventoryPurchases.reduce((s, p) => s + (p.totalAmount || 0), 0))}
                </span>
              </div>
              {displayData.inventoryPurchases.length === 0 ? (
                <div className="px-5 py-4 text-sm text-gray-400 italic">No inventory purchases today</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {displayData.inventoryPurchases.map((p) => (
                        <tr key={p.stockInId} className="border-b last:border-0">
                          <td className="py-2 px-5 text-sm text-gray-600">{p.stockInId}</td>
                          <td className="py-2 px-5 text-sm text-gray-900">{p.vendorName}</td>
                          <td className="py-2 px-5 text-sm text-right font-medium text-red-600">
                            {formatCurrency(p.totalAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Vendor Payments (Outstanding Balance) */}
            <div className="border-b">
              <div className="px-5 py-3 bg-gray-50 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Vendor Payments (Outstanding Balance)</span>
                <span className="ml-auto text-sm font-semibold text-gray-900">
                  {formatCurrency(displayData.vendorPayments.reduce((s, p) => s + (p.amount || 0), 0))}
                </span>
              </div>
              {displayData.vendorPayments.length === 0 ? (
                <div className="px-5 py-4 text-sm text-gray-400 italic">No vendor payments today</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {displayData.vendorPayments.map((p) => (
                        <tr key={p.paymentId} className="border-b last:border-0">
                          <td className="py-2 px-5 text-sm text-gray-600">{p.paymentId}</td>
                          <td className="py-2 px-5 text-sm text-gray-900">{p.vendorName}</td>
                          <td className="py-2 px-5 text-sm text-gray-500">{p.method}</td>
                          <td className="py-2 px-5 text-sm text-right font-medium text-red-600">
                            {formatCurrency(p.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Salaries */}
            <div className="border-b">
              <div className="px-5 py-3 bg-gray-50 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Salaries</span>
                <span className="ml-auto text-sm font-semibold text-gray-900">
                  {formatCurrency(displayData.salaries.reduce((s, item) => s + (item.amount || 0), 0))}
                </span>
              </div>
              {displayData.salaries.length === 0 ? (
                <div className="px-5 py-4 text-sm text-gray-400 italic">No salary payments today</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {displayData.salaries.map((item, idx) => (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="py-2 px-5 text-sm text-gray-900">{item.description}</td>
                          <td className="py-2 px-5 text-sm text-right font-medium text-red-600">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Utilities */}
            <div className="border-b">
              <div className="px-5 py-3 bg-gray-50 flex items-center gap-2">
                <Zap className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Utilities</span>
                <span className="ml-auto text-sm font-semibold text-gray-900">
                  {formatCurrency(displayData.utilities.reduce((s, item) => s + (item.amount || 0), 0))}
                </span>
              </div>
              {displayData.utilities.length === 0 ? (
                <div className="px-5 py-4 text-sm text-gray-400 italic">No utility payments today</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {displayData.utilities.map((item, idx) => (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="py-2 px-5 text-sm text-gray-900">{item.description}</td>
                          <td className="py-2 px-5 text-sm text-right font-medium text-red-600">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Other Expenses */}
            <div>
              <div className="px-5 py-3 bg-gray-50 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Other Expenses</span>
                <span className="ml-auto text-sm font-semibold text-gray-900">
                  {formatCurrency(displayData.otherExpenses.reduce((s, item) => s + (item.amount || 0), 0))}
                </span>
              </div>
              {displayData.otherExpenses.length === 0 ? (
                <div className="px-5 py-4 text-sm text-gray-400 italic">No other expenses today</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {displayData.otherExpenses.map((item, idx) => (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="py-2 px-5 text-sm text-gray-900">{item.description}</td>
                          <td className="py-2 px-5 text-sm text-right font-medium text-red-600">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>

          {/* Closed metadata */}
          {isReadOnly && displayData.closedAt && (
            <Card className="p-4 bg-gray-50 border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Lock className="h-4 w-4" />
                <span>
                  Closed by <span className="font-medium text-gray-700">{displayData.closedBy}</span> on{" "}
                  <span className="font-medium text-gray-700">
                    {new Date(displayData.closedAt).toLocaleString("en-PK")}
                  </span>
                </span>
              </div>
            </Card>
          )}

          {/* Close Day Button */}
          {view === "today" && !isTodayClosed && (
            <div className="flex justify-end">
              <Button
                onClick={() => setShowConfirm(true)}
                className="bg-theme hover:bg-theme-dark text-white gap-2 px-8 py-3 text-base"
                size="lg"
              >
                <Lock className="h-5 w-5" />
                Close Day
              </Button>
            </div>
          )}
        </>
      )}

      {!displayData && !loading && !error && (
        <Card className="p-12 text-center">
          <CalendarCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No data available</h3>
          <p className="text-sm text-gray-400 mt-1">
            There is no financial activity for this date
          </p>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Daily Close
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              You are about to close the books for <span className="font-semibold">{formatDate(today)}</span>.
              This action cannot be undone — the day's records will become read-only.
            </p>
            {displayData && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Revenue</span>
                  <span className="font-semibold text-green-600">{formatCurrency(displayData.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Expenses</span>
                  <span className="font-semibold text-red-600">{formatCurrency(displayData.totalExpenses)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-medium text-gray-700">Net Profit</span>
                  <span className={`font-bold ${displayData.netProfit >= 0 ? "text-blue-600" : "text-orange-600"}`}>
                    {formatCurrency(displayData.netProfit)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={closing}>
              Cancel
            </Button>
            <Button
              onClick={handleCloseDay}
              disabled={closing}
              className="bg-theme hover:bg-theme-dark text-white gap-2"
            >
              {closing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {closing ? "Closing..." : "Close Day"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reopen Day Confirmation Dialog */}
      <Dialog open={showReopenConfirm} onOpenChange={setShowReopenConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Reopen Day
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              Are you sure you want to reopen <span className="font-semibold">{displayData ? formatDate(displayData.date) : ""}</span>?
              The saved daily close record will be deleted and the day will become unlocked.
            </p>
            <p className="text-sm text-gray-500">
              You can close it again later once all activities for the day are finalized.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowReopenConfirm(false)} disabled={reopening}>
              Cancel
            </Button>
            <Button
              onClick={() => displayData && handleReopenDay(displayData.date)}
              disabled={reopening}
              className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
            >
              {reopening ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockOpen className="h-4 w-4" />}
              {reopening ? "Reopening..." : "Reopen Day"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
