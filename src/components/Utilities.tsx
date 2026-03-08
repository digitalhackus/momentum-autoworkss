import React, { useState, useEffect } from "react";
import { useData } from "../contexts/DataContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Zap,
  Plus,
  Edit,
  CheckCircle,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Search,
  Calendar,
  Filter,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Card, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import type { Utility } from "../contexts/DataContext";
import { formatDisplayDate } from "../utils/dateFormat";
import { DatePicker } from "./ui/date-picker";

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank", label: "Bank" },
  { value: "online", label: "Online" },
] as const;

function getCurrentMonthPrefix() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function Utilities() {
  const {
    utilityTypes,
    utilities,
    refetch,
    addUtilityType,
    addUtility,
    updateUtility,
    markUtilityPaid,
  } = useData();
  useEffect(() => {
    if (utilityTypes.length === 0) refetch();
  }, [utilityTypes.length, refetch]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dueDateFrom, setDueDateFrom] = useState("");
  const [dueDateTo, setDueDateTo] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [markPaidId, setMarkPaidId] = useState<string | null>(null);
  const [markPaidMethod, setMarkPaidMethod] = useState<string>("cash");
  const [otherTypeName, setOtherTypeName] = useState("");
  const [formData, setFormData] = useState({
    utility_type_id: "",
    billing_period_start: "",
    billing_period_end: "",
    amount: "",
    due_date: "",
    notes: "",
  });

  const getTypeName = (typeId: string) => {
    const t = utilityTypes.find((x) => x.id === typeId);
    return t?.name ?? typeId;
  };

  const filteredUtilities = utilities.filter((u) => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const typeName = getTypeName(u.utility_type_id).toLowerCase();
      const matchesSearch =
        typeName.includes(q) ||
        (u.notes || "").toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }
    if (statusFilter && u.status !== statusFilter) return false;
    if (dueDateFrom && u.due_date < dueDateFrom) return false;
    if (dueDateTo && u.due_date > dueDateTo) return false;
    return true;
  });

  const outstanding = utilities.filter((u) => u.status === "unpaid");
  const outstandingAmount = outstanding.reduce((sum, u) => sum + (u.amount || 0), 0);
  const monthPrefix = getCurrentMonthPrefix();
  const paidThisMonth = utilities.filter(
    (u) =>
      u.status === "paid" &&
      (u.paid_at?.toString().slice(0, 7) === monthPrefix ||
        u.billing_period_end?.startsWith(monthPrefix))
  );
  const paidThisMonthAmount = paidThisMonth.reduce((sum, u) => sum + (u.amount || 0), 0);
  const totalAmount = utilities.reduce((sum, u) => sum + (u.amount || 0), 0);

  const isOthersType = (id: string) => {
    const t = utilityTypes.find((x) => x.id === id);
    const name = t?.name?.toLowerCase();
    return name === "other" || name === "others";
  };

  const handleAdd = async () => {
    let typeId = formData.utility_type_id;
    if (isOthersType(typeId) && otherTypeName.trim()) {
      const newType = await addUtilityType(otherTypeName.trim());
      typeId = newType.id;
    }
    if (!typeId || !formData.billing_period_start || !formData.billing_period_end || !formData.amount || !formData.due_date) {
      alert("Please fill type, billing period, amount and due date");
      return;
    }
    await addUtility({
      utility_type_id: typeId,
      billing_period_start: formData.billing_period_start,
      billing_period_end: formData.billing_period_end,
      amount: parseFloat(formData.amount),
      due_date: formData.due_date,
      status: "unpaid",
      notes: formData.notes.trim() || undefined,
    });
    setFormData({
      utility_type_id: "",
      billing_period_start: "",
      billing_period_end: "",
      amount: "",
      due_date: "",
      notes: "",
    });
    setOtherTypeName("");
    setShowAddModal(false);
  };

  const handleEdit = (u: Utility) => {
    setFormData({
      utility_type_id: u.utility_type_id,
      billing_period_start: u.billing_period_start,
      billing_period_end: u.billing_period_end,
      amount: String(u.amount),
      due_date: u.due_date,
      notes: u.notes || "",
    });
    setEditingId(u.id);
    setOtherTypeName(isOthersType(u.utility_type_id) ? getTypeName(u.utility_type_id) : "");
    setShowAddModal(true);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    let typeId = formData.utility_type_id;
    if (isOthersType(typeId) && otherTypeName.trim()) {
      const existing = utilityTypes.find((t) => t.name.toLowerCase() === otherTypeName.trim().toLowerCase());
      if (existing) typeId = existing.id;
      else {
        const newType = await addUtilityType(otherTypeName.trim());
        typeId = newType.id;
      }
    }
    if (!typeId || !formData.billing_period_start || !formData.billing_period_end || !formData.amount || !formData.due_date) {
      alert("Please fill type, billing period, amount and due date");
      return;
    }
    await updateUtility(editingId, {
      utility_type_id: typeId,
      billing_period_start: formData.billing_period_start,
      billing_period_end: formData.billing_period_end,
      amount: parseFloat(formData.amount),
      due_date: formData.due_date,
      notes: formData.notes.trim() || undefined,
    });
    setEditingId(null);
    setFormData({
      utility_type_id: "",
      billing_period_start: "",
      billing_period_end: "",
      amount: "",
      due_date: "",
      notes: "",
    });
    setShowAddModal(false);
  };

  const handleMarkPaid = async () => {
    if (!markPaidId) return;
    await markUtilityPaid(markPaidId, markPaidMethod);
    setMarkPaidId(null);
  };

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl p-6 shadow-lg"
        style={{
          background: `linear-gradient(to right, var(--primary-color), var(--primary-color-dark))`,
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold">Utilities</h1>
            </div>
            <p className="text-white/80">Track utility bills and payments</p>
          </div>
          <Button
            onClick={() => {
              setFormData({
                utility_type_id: utilityTypes[0]?.id ?? "",
                billing_period_start: "",
                billing_period_end: "",
                amount: "",
                due_date: "",
                notes: "",
              });
              setEditingId(null);
              setOtherTypeName("");
              setShowAddModal(true);
            }}
            className="bg-white text-theme hover:bg-theme-50 shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Utility
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-theme-100 bg-gradient-to-br from-white to-theme-50/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Total utilities</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">₨{totalAmount.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-0.5">{utilities.length} entries</p>
            </div>
            <div className="bg-theme-100 p-3 rounded-xl">
              <DollarSign className="h-7 w-7 text-theme" />
            </div>
          </div>
        </Card>
        <Card className="p-5 border-red-100 bg-gradient-to-br from-white to-red-50/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Outstanding</p>
              <p className="text-3xl font-bold text-red-600 mt-1">₨{outstandingAmount.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-0.5">{outstanding.length} unpaid</p>
            </div>
            <div className="bg-red-100 p-3 rounded-xl">
              <AlertCircle className="h-7 w-7 text-red-600" />
            </div>
          </div>
        </Card>
        <Card className="p-5 border-green-100 bg-gradient-to-br from-white to-green-50/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Paid this month</p>
              <p className="text-3xl font-bold text-green-600 mt-1">₨{paidThisMonthAmount.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <TrendingUp className="h-7 w-7 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters - same pattern as Invoices */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search utilities..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                    <Calendar className="h-4 w-4 lg:mr-2" />
                    <span className="hidden lg:inline">Filter by Date</span>
                    {(dueDateFrom || dueDateTo) && (
                      <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">1</Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 rounded-xl border border-gray-200 bg-white shadow-lg" align="start">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                      <div className="p-1.5 rounded-lg bg-theme/10">
                        <Calendar className="h-4 w-4 text-theme" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">Due date range</p>
                    </div>
                    <div className="grid gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">From</label>
                        <DatePicker
                          value={dueDateFrom}
                          onChange={setDueDateFrom}
                          placeholder="dd/mm/yy"
                          className="mt-1.5 rounded-lg border-gray-200"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">To</label>
                        <DatePicker
                          value={dueDateTo}
                          onChange={setDueDateTo}
                          placeholder="dd/mm/yy"
                          className="mt-1.5 rounded-lg border-gray-200"
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full rounded-lg bg-theme hover:bg-theme-dark text-white"
                      onClick={() => {
                        setDueDateFrom("");
                        setDueDateTo("");
                      }}
                    >
                      Clear dates
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                    <Filter className="h-4 w-4 lg:mr-2" />
                    <span className="hidden lg:inline">Filter by Status</span>
                    {statusFilter && (
                      <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">1</Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="start">
                  <button
                    type="button"
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${!statusFilter ? "bg-theme/10 text-theme font-medium" : "hover:bg-gray-100"}`}
                    onClick={() => setStatusFilter("")}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${statusFilter === "paid" ? "bg-theme/10 text-theme font-medium" : "hover:bg-gray-100"}`}
                    onClick={() => setStatusFilter("paid")}
                  >
                    Paid
                  </button>
                  <button
                    type="button"
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${statusFilter === "unpaid" ? "bg-theme/10 text-theme font-medium" : "hover:bg-gray-100"}`}
                    onClick={() => setStatusFilter("unpaid")}
                  >
                    Unpaid
                  </button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full table-fixed">
          <thead className="bg-gradient-to-r from-slate-50 to-theme-50 border-b border-theme-100">
            <tr>
              <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase w-[11%]">Type</th>
              <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase w-[16%]">Billing period</th>
              <th className="px-3 py-4 text-right text-xs font-semibold text-slate-700 uppercase w-[10%]">Amount</th>
              <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase w-[10%]">Due date</th>
              <th className="px-3 py-4 text-center text-xs font-semibold text-slate-700 uppercase w-[9%]">Status</th>
              <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase w-[11%]">Payment method</th>
              <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase w-[17%]">Notes</th>
              <th className="px-3 py-4 text-center text-xs font-semibold text-slate-700 uppercase w-[16%]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUtilities.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-slate-500">
                  No utilities found. Add one or adjust filters.
                </td>
              </tr>
            ) : (
              filteredUtilities.map((u) => (
                <tr key={u.id} className="hover:bg-theme-50/50">
                  <td className="px-3 py-3 text-sm font-medium text-slate-900">{getTypeName(u.utility_type_id)}</td>
                  <td className="px-3 py-3 text-sm text-slate-700">
                    {formatDisplayDate(u.billing_period_start)} → {formatDisplayDate(u.billing_period_end)}
                  </td>
                  <td className="px-3 py-3 text-sm text-right font-medium text-theme">₨{Number(u.amount).toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm text-slate-700">{formatDisplayDate(u.due_date)}</td>
                  <td className="px-3 py-3">
                    <div className="flex justify-center">
                      {u.status === "paid" ? (
                        <Badge className="bg-green-600 text-white">Paid</Badge>
                      ) : (
                        <Badge className="bg-amber-500 text-white">Unpaid</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-700 capitalize">
                    {u.status === "paid" && u.payment_method
                      ? u.payment_method.charAt(0).toUpperCase() + u.payment_method.slice(1).toLowerCase()
                      : "—"}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-600 truncate max-w-[180px]" title={u.notes || ""}>{u.notes || "—"}</td>
                  <td className="px-3 py-3">
                    <div className="flex justify-center gap-2 items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(u)}
                        className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (u.status === "paid") return;
                          setMarkPaidId(u.id);
                          setMarkPaidMethod("cash");
                        }}
                        disabled={u.status === "paid"}
                        className={`h-8 w-8 disabled:pointer-events-none ${
                          u.status === "paid"
                            ? "text-green-600 opacity-100 cursor-default"
                            : "text-slate-800 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                        title={u.status === "paid" ? "Already paid" : "Mark as paid"}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[450px]" aria-describedby={undefined}>
          <DialogHeader className="space-y-1 pb-2 border-b">
            <DialogTitle className="text-xl font-bold text-slate-900">
              {editingId ? "Edit Utility" : "Add Utility"}
            </DialogTitle>
            <p className="text-xs text-slate-600">
              {editingId
                ? "Update utility bill details below"
                : "Record a new utility bill or recurring expense"}
            </p>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-1">
              <Label htmlFor="utility-type" className="text-xs font-semibold text-slate-700">
                Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.utility_type_id || "__none__"}
                onValueChange={(v) => {
                  const value = v === "__none__" ? "" : v;
                  setFormData({ ...formData, utility_type_id: value });
                  if (!editingId) setOtherTypeName("");
                }}
              >
                <SelectTrigger id="utility-type" className="h-9 text-sm border-slate-200 focus:border-theme focus:ring-theme">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select type</SelectItem>
                  {utilityTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {utilityTypes.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">Loading types… Refresh the page if this persists.</p>
              )}
              {formData.utility_type_id && isOthersType(formData.utility_type_id) && (
                <div className="space-y-1 pt-1">
                  <Label htmlFor="utility-other-type" className="text-xs font-semibold text-slate-700">
                    Add another type
                  </Label>
                  <Input
                    id="utility-other-type"
                    placeholder="e.g. Generator, Gas, Security"
                    value={otherTypeName}
                    onChange={(e) => setOtherTypeName(e.target.value)}
                    className="h-9 text-sm border-slate-200 focus:border-theme focus:ring-theme"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="utility-period-start" className="text-xs font-semibold text-slate-700">
                  Period start <span className="text-red-500">*</span>
                </Label>
                <DatePicker
                  id="utility-period-start"
                  value={formData.billing_period_start}
                  onChange={(v) => setFormData({ ...formData, billing_period_start: v })}
                  placeholder="dd/mm/yy"
                  className="h-9 text-sm border-slate-200"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="utility-period-end" className="text-xs font-semibold text-slate-700">
                  Period end <span className="text-red-500">*</span>
                </Label>
                <DatePicker
                  id="utility-period-end"
                  value={formData.billing_period_end}
                  onChange={(v) => setFormData({ ...formData, billing_period_end: v })}
                  placeholder="dd/mm/yy"
                  className="h-9 text-sm border-slate-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="utility-amount" className="text-xs font-semibold text-slate-700">
                  Amount (₨) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="utility-amount"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                  className="h-9 text-sm border-slate-200 focus:border-theme focus:ring-theme"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="utility-due-date" className="text-xs font-semibold text-slate-700">
                  Due date <span className="text-red-500">*</span>
                </Label>
                <DatePicker
                  id="utility-due-date"
                  value={formData.due_date}
                  onChange={(v) => setFormData({ ...formData, due_date: v })}
                  placeholder="dd/mm/yy"
                  className="h-9 text-sm border-slate-200"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="utility-notes" className="text-xs font-semibold text-slate-700">
                Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="utility-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional details..."
                rows={3}
                className="resize-none text-sm border-slate-200 focus:border-theme focus:ring-theme"
              />
            </div>
          </div>
          <DialogFooter className="pt-2 border-t gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
              className="px-5 h-9 text-sm border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={editingId ? handleUpdate : handleAdd}
              className="bg-theme hover:bg-theme-dark px-5 h-9 text-sm text-white"
            >
              {editingId ? "Update" : "Add Utility"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!markPaidId} onOpenChange={(open) => !open && setMarkPaidId(null)}>
        <DialogContent className="sm:max-w-[450px]" aria-describedby={undefined}>
          <DialogHeader className="space-y-1 pb-2 border-b">
            <DialogTitle className="text-xl font-bold text-slate-900">Mark as paid</DialogTitle>
            <p className="text-xs text-slate-600">Select the payment method used for this bill.</p>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-1">
              <Label htmlFor="mark-paid-method" className="text-xs font-semibold text-slate-700">
                Payment method
              </Label>
              <Select
                value={markPaidMethod}
                onValueChange={setMarkPaidMethod}
              >
                <SelectTrigger id="mark-paid-method" className="h-9 text-sm border-slate-200 focus:border-theme focus:ring-theme">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((pm) => (
                    <SelectItem key={pm.value} value={pm.value}>{pm.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-2 border-t gap-2">
            <Button
              variant="outline"
              onClick={() => setMarkPaidId(null)}
              className="px-5 h-9 text-sm border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleMarkPaid}
              className="bg-theme hover:bg-theme-dark px-5 h-9 text-sm text-white"
            >
              Mark paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
