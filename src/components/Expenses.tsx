import { useState } from "react";
import { useData } from "../contexts/DataContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Receipt,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  Filter,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { Expense } from "../contexts/DataContext";
import { formatDisplayDate } from "../utils/dateFormat";
import { DatePicker } from "./ui/date-picker";

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank", label: "Bank" },
  { value: "online", label: "Online" },
] as const;

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}
function getCurrentMonthPrefix() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    date: getTodayStr(),
    payment_method: "cash" as "cash" | "card" | "bank" | "online",
    notes: "",
  });

  const filteredExpenses = expenses.filter((e) => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const matchesSearch =
        (e.category || "").toLowerCase().includes(q) ||
        (e.notes || "").toLowerCase().includes(q) ||
        (e.id || "").toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }
    if (dateFrom && e.date < dateFrom) return false;
    if (dateTo && e.date > dateTo) return false;
    if (categoryFilter && e.category !== categoryFilter) return false;
    return true;
  });

  const todayStr = getTodayStr();
  const monthPrefix = getCurrentMonthPrefix();
  const filteredTotal = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const monthlyTotal = filteredExpenses
    .filter((e) => e.date && e.date.startsWith(monthPrefix))
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const dailyTotal = filteredExpenses
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const categories = Array.from(
    new Set(expenses.map((e) => e.category).filter(Boolean))
  ).sort();

  const handleAdd = () => {
    if (!formData.category || !formData.amount || !formData.date) {
      alert("Please fill category, amount and date");
      return;
    }
    addExpense({
      category: formData.category.trim(),
      amount: parseFloat(formData.amount),
      date: formData.date,
      payment_method: formData.payment_method,
      notes: formData.notes.trim() || undefined,
    });
    setFormData({
      category: "",
      amount: "",
      date: getTodayStr(),
      payment_method: "cash",
      notes: "",
    });
    setShowAddModal(false);
  };

  const handleEdit = (e: Expense) => {
    setFormData({
      category: e.category,
      amount: String(e.amount),
      date: e.date,
      payment_method: e.payment_method,
      notes: e.notes || "",
    });
    setEditingId(e.id);
    setShowAddModal(true);
  };

  const handleUpdate = async () => {
    if (!editingId || !formData.category || !formData.amount || !formData.date) {
      alert("Please fill category, amount and date");
      return;
    }
    await updateExpense(editingId, {
      category: formData.category.trim(),
      amount: parseFloat(formData.amount),
      date: formData.date,
      payment_method: formData.payment_method,
      notes: formData.notes.trim() || undefined,
    });
    setEditingId(null);
    setFormData({
      category: "",
      amount: "",
      date: getTodayStr(),
      payment_method: "cash",
      notes: "",
    });
    setShowAddModal(false);
  };

  const handleDelete = async (id: string) => {
    await deleteExpense(id);
    setDeleteConfirmId(null);
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
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold">Expenses</h1>
            </div>
            <p className="text-white/80">Track workshop expenses</p>
          </div>
          <Button
            onClick={() => {
              setFormData({
                category: "",
                amount: "",
                date: getTodayStr(),
                payment_method: "cash",
                notes: "",
              });
              setEditingId(null);
              setShowAddModal(true);
            }}
            className="bg-white text-theme hover:bg-theme-50 shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-theme-100 bg-gradient-to-br from-white to-theme-50/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Total (filtered)</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                ₨{filteredTotal.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{filteredExpenses.length} entries</p>
            </div>
            <div className="bg-theme-100 p-3 rounded-xl">
              <DollarSign className="h-7 w-7 text-theme" />
            </div>
          </div>
        </Card>
        <Card className="p-5 border-green-100 bg-gradient-to-br from-white to-green-50/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">This month</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                ₨{monthlyTotal.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <TrendingUp className="h-7 w-7 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-5 border-amber-100 bg-gradient-to-br from-white to-amber-50/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Today</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">
                ₨{dailyTotal.toLocaleString()}
              </p>
            </div>
            <div className="bg-amber-100 p-3 rounded-xl">
              <Calendar className="h-7 w-7 text-amber-600" />
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
                placeholder="Search expenses..."
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
                    {(dateFrom || dateTo) && (
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
                      <p className="text-sm font-semibold text-gray-800">Date range</p>
                    </div>
                    <div className="grid gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">From</label>
                        <DatePicker
                          value={dateFrom}
                          onChange={setDateFrom}
                          placeholder="dd/mm/yy"
                          className="mt-1.5 rounded-lg border-gray-200"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">To</label>
                        <DatePicker
                          value={dateTo}
                          onChange={setDateTo}
                          placeholder="dd/mm/yy"
                          className="mt-1.5 rounded-lg border-gray-200"
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full rounded-lg bg-theme hover:bg-theme-dark text-white"
                      onClick={() => {
                        setDateFrom("");
                        setDateTo("");
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
                    <span className="hidden lg:inline">Filter by Category</span>
                    {categoryFilter && (
                      <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">1</Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="start">
                  <button
                    type="button"
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${!categoryFilter ? "bg-theme/10 text-theme font-medium" : "hover:bg-gray-100"}`}
                    onClick={() => setCategoryFilter("")}
                  >
                    All
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${categoryFilter === c ? "bg-theme/10 text-theme font-medium" : "hover:bg-gray-100"}`}
                      onClick={() => setCategoryFilter(c)}
                    >
                      {c}
                    </button>
                  ))}
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
              <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase w-[10%]">ID</th>
              <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase w-[14%]">Category</th>
              <th className="px-3 py-4 text-right text-xs font-semibold text-slate-700 uppercase w-[12%]">Amount</th>
              <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase w-[12%]">Date</th>
              <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase w-[12%]">Payment method</th>
              <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase w-[24%]">Notes</th>
              <th className="px-3 py-4 text-center text-xs font-semibold text-slate-700 uppercase w-[16%]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                  No expenses found. Add one or adjust filters.
                </td>
              </tr>
            ) : (
              filteredExpenses.map((e) => (
                <tr key={e.id} className="hover:bg-theme-50/50">
                  <td className="px-3 py-3 text-sm font-medium text-slate-900">{e.id}</td>
                  <td className="px-3 py-3 text-sm text-slate-700">{e.category}</td>
                  <td className="px-3 py-3 text-sm text-right font-medium text-theme">₨{Number(e.amount).toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm text-slate-700">{formatDisplayDate(e.date)}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 capitalize">{e.payment_method}</td>
                  <td className="px-3 py-3 text-sm text-slate-600 truncate max-w-[200px]" title={e.notes || ""}>{e.notes || "—"}</td>
                  <td className="px-3 py-3">
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(e)}
                        className="text-theme hover:bg-theme-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(e.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
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
              {editingId ? "Edit Expense" : "Add Expense"}
            </DialogTitle>
            <p className="text-xs text-slate-600">
              {editingId
                ? "Update expense details below"
                : "Record a new workshop expense"}
            </p>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-1">
              <Label htmlFor="expense-category" className="text-xs font-semibold text-slate-700">
                Category <span className="text-red-500">*</span>
              </Label>
              <Input
                id="expense-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Supplies, Fuel, Maintenance"
                className="h-9 text-sm border-slate-200 focus:border-theme focus:ring-theme"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="expense-amount" className="text-xs font-semibold text-slate-700">
                  Amount (₨) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="expense-amount"
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
                <Label htmlFor="expense-date" className="text-xs font-semibold text-slate-700">
                  Date <span className="text-red-500">*</span>
                </Label>
                <DatePicker
                  id="expense-date"
                  value={formData.date}
                  onChange={(v) => setFormData({ ...formData, date: v })}
                  placeholder="dd/mm/yy"
                  className="h-9 text-sm border-slate-200"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="expense-payment" className="text-xs font-semibold text-slate-700">
                Payment method
              </Label>
              <Select
                value={formData.payment_method}
                onValueChange={(v) => setFormData({ ...formData, payment_method: v as typeof formData.payment_method })}
              >
                <SelectTrigger id="expense-payment" className="h-9 text-sm border-slate-200 focus:border-theme focus:ring-theme">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((pm) => (
                    <SelectItem key={pm.value} value={pm.value}>{pm.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="expense-notes" className="text-xs font-semibold text-slate-700">
                Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="expense-notes"
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
              {editingId ? "Update" : "Add Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[380px]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Delete expense?</DialogTitle>
            <p className="text-sm text-slate-600">This action cannot be undone.</p>
          </DialogHeader>
          <DialogFooter className="pt-2 border-t gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="px-5 h-9 text-sm border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="px-5 h-9 text-sm"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
