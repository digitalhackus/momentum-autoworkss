import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useData } from "../contexts/DataContext";
import type { SalaryRecord as SalaryRecordType, Employee } from "../contexts/DataContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FileText, Plus, Search, Filter, Calendar, CheckCircle, Eye, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { formatDisplayDate } from "../utils/dateFormat";
import { DatePicker } from "./ui/date-picker";

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank", label: "Bank" },
  { value: "online", label: "Online" },
] as const;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface SalaryRecordsProps {
  onNavigate: (page: string) => void;
}

export function SalaryRecords({ onNavigate }: SalaryRecordsProps) {
  const {
    employees,
    salaryRecords,
    getSalaryRecords,
    refetch,
    createSalaryRecord,
    markSalaryPaid,
  } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState<number | "">("");
  const [yearFilter, setYearFilter] = useState<number | "">("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [markPaidId, setMarkPaidId] = useState<string | null>(null);
  const [markPaidMethod, setMarkPaidMethod] = useState("cash");
  const [detailRecord, setDetailRecord] = useState<SalaryRecordType | null>(null);
  const [generateForm, setGenerateForm] = useState({
    employee_id: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    bonus: "",
    deduction: "",
    notes: "",
  });

  const activeEmployees = employees.filter((e) => e.is_active !== false);

  useEffect(() => {
    if (employees.length === 0) refetch();
  }, [employees.length, refetch]);

  useEffect(() => {
    const month = monthFilter === "" ? undefined : Number(monthFilter);
    const year = yearFilter === "" ? undefined : Number(yearFilter);
    const status = statusFilter || undefined;
    getSalaryRecords({ month, year, status });
  }, [monthFilter, yearFilter, statusFilter, getSalaryRecords]);

  const getEmployeeName = (id: string) => employees.find((e) => e.id === id)?.name ?? id;

  const filteredRecords = salaryRecords.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const name = getEmployeeName(r.employee_id).toLowerCase();
      if (!name.includes(q)) return false;
    }
    return true;
  });

  const handleGenerate = async () => {
    if (!generateForm.employee_id) {
      alert("Select an employee");
      return;
    }
    try {
      await createSalaryRecord({
        employee_id: generateForm.employee_id,
        month: generateForm.month,
        year: generateForm.year,
        bonus: generateForm.bonus ? parseFloat(generateForm.bonus) : undefined,
        deduction: generateForm.deduction ? parseFloat(generateForm.deduction) : undefined,
        notes: generateForm.notes.trim() || undefined,
      });
      setGenerateForm({
        employee_id: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        bonus: "",
        deduction: "",
        notes: "",
      });
      setShowGenerateModal(false);
      const month = monthFilter === "" ? undefined : Number(monthFilter);
      const year = yearFilter === "" ? undefined : Number(yearFilter);
      getSalaryRecords({ month, year, status: statusFilter || undefined });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to create salary record. Duplicate month/year?");
    }
  };

  const handleMarkPaid = async () => {
    if (!markPaidId) return;
    await markSalaryPaid(markPaidId, markPaidMethod);
    setMarkPaidId(null);
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate("salaries")}
        className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 -mb-1"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Salaries
      </Button>
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
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold">Salary Records</h1>
            </div>
            <p className="text-white/80">Generate and track salary payments</p>
          </div>
          <Button
            onClick={() => {
              setGenerateForm({
                employee_id: "",
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
                bonus: "",
                deduction: "",
                notes: "",
              });
              setShowGenerateModal(true);
            }}
            className="bg-white text-theme hover:bg-theme-50 shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate Salary
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by employee..."
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
                    <span className="hidden lg:inline">Month / Year</span>
                    {(monthFilter !== "" || yearFilter !== "") && (
                      <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">1</Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="start">
                  <div className="space-y-3">
                    <Label className="text-xs font-medium">Month</Label>
                    <Select
                      value={monthFilter === "" ? "all" : String(monthFilter)}
                      onValueChange={(v) => setMonthFilter(v === "all" ? "" : Number(v))}
                    >
                      <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All months</SelectItem>
                        {MONTHS.map((m, i) => (
                          <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Label className="text-xs font-medium">Year</Label>
                    <Select
                      value={yearFilter === "" ? "all" : String(yearFilter)}
                      onValueChange={(v) => setYearFilter(v === "all" ? "" : Number(v))}
                    >
                      <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All years</SelectItem>
                        {years.map((y) => (
                          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      className="w-full rounded-lg bg-theme hover:bg-theme-dark text-white"
                      onClick={() => {
                        setMonthFilter("");
                        setYearFilter("");
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
                    <span className="hidden lg:inline">Status</span>
                    {statusFilter && <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">1</Badge>}
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

      <Card>
        <CardContent className="pt-6">
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                No salary records found.
              </div>
            ) : (
              filteredRecords.map((r, index) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.2) }}
                  className="p-4 border rounded-lg space-y-3 hover:border-theme-300 hover:bg-theme-50/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-theme-100 rounded-lg">
                        <FileText className="h-5 w-5 text-theme" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{getEmployeeName(r.employee_id)}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {MONTHS[r.month - 1]} {r.year}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-theme">₨{Number(r.total_salary).toLocaleString()}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-50">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      {r.payment_status === "paid" ? (
                        <Badge className="bg-green-600 text-white text-[10px] h-5 px-1.5">Paid</Badge>
                      ) : (
                        <Badge className="bg-slate-600 text-white text-[10px] h-5 px-1.5">Unpaid</Badge>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payment</p>
                      <p className="text-sm font-bold text-slate-700 capitalize">
                        {r.payment_status === "paid" && r.payment_method ? r.payment_method : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-1">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Salary</p>
                      <p className="text-xs font-bold text-slate-700">₨{Number(r.salary_amount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Bonus</p>
                      <p className="text-xs font-bold text-green-600">₨{Number(r.bonus).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Deduct.</p>
                      <p className="text-xs font-bold text-red-600">₨{Number(r.deduction).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailRecord(r)}
                      className="h-8 text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      View
                    </Button>
                    {r.payment_status === "unpaid" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setMarkPaidId(r.id); setMarkPaidMethod("cash"); }}
                        className="h-8 text-xs font-bold border-green-100 text-green-600 hover:bg-green-50 hover:border-green-200"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                        Mark Paid
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gradient-to-r from-slate-50 to-theme-50 border-b border-theme-100">
                <tr>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase w-[16%]">Employee</th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase w-[12%]">Month / Year</th>
                  <th className="px-3 py-4 text-right text-xs font-semibold text-slate-700 uppercase w-[10%]">Salary</th>
                  <th className="px-3 py-4 text-right text-xs font-semibold text-slate-700 uppercase w-[8%]">Bonus</th>
                  <th className="px-3 py-4 text-right text-xs font-semibold text-slate-700 uppercase w-[8%]">Deduction</th>
                  <th className="px-3 py-4 text-right text-xs font-semibold text-slate-700 uppercase w-[10%]">Total</th>
                  <th className="px-3 py-4 text-center text-xs font-semibold text-slate-700 uppercase w-[10%]">Status</th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase w-[12%]">Payment method</th>
                  <th className="px-3 py-4 text-center text-xs font-semibold text-slate-700 uppercase w-[14%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-8 text-center text-slate-500">
                      No salary records found. Generate one or adjust filters.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-theme-50/50">
                      <td className="px-3 py-3 text-sm font-medium text-slate-900">{getEmployeeName(r.employee_id)}</td>
                      <td className="px-3 py-3 text-sm text-slate-700">{MONTHS[r.month - 1]} {r.year}</td>
                      <td className="px-3 py-3 text-sm text-right text-slate-700">₨{Number(r.salary_amount).toLocaleString()}</td>
                      <td className="px-3 py-3 text-sm text-right text-slate-700">₨{Number(r.bonus).toLocaleString()}</td>
                      <td className="px-3 py-3 text-sm text-right text-slate-700">₨{Number(r.deduction).toLocaleString()}</td>
                      <td className="px-3 py-3 text-sm text-right font-medium text-theme">₨{Number(r.total_salary).toLocaleString()}</td>
                      <td className="px-3 py-3">
                        <div className="flex justify-center">
                          {r.payment_status === "paid" ? (
                            <Badge className="bg-green-600 text-white">Paid</Badge>
                          ) : (
                            <Badge className="bg-slate-600 text-white">Unpaid</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-700 capitalize">
                        {r.payment_status === "paid" && r.payment_method
                          ? r.payment_method.charAt(0).toUpperCase() + (r.payment_method.slice(1) || "").toLowerCase()
                          : "—"}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDetailRecord(r)}
                            className="h-8 w-8 text-slate-600 hover:bg-slate-100"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {r.payment_status === "unpaid" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setMarkPaidId(r.id); setMarkPaidMethod("cash"); }}
                              className="h-8 w-8 text-green-600 hover:bg-green-50"
                              title="Mark as paid"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Generate Salary Modal */}
      <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
        <DialogContent className="sm:max-w-[450px]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Generate Salary Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Employee <span className="text-red-500">*</span></Label>
              <Select
                value={generateForm.employee_id}
                onValueChange={(v) => setGenerateForm((p) => ({ ...p, employee_id: v }))}
              >
                <SelectTrigger className="border-slate-300"><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {activeEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name} (₨{Number(emp.monthly_salary).toLocaleString()})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Month</Label>
                <Select
                  value={String(generateForm.month)}
                  onValueChange={(v) => setGenerateForm((p) => ({ ...p, month: Number(v) }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Year</Label>
                <Select
                  value={String(generateForm.year)}
                  onValueChange={(v) => setGenerateForm((p) => ({ ...p, year: Number(v) }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Bonus (₨)</Label>
                <Input
                  type="number"
                  min={0}
                  value={generateForm.bonus}
                  onChange={(e) => setGenerateForm((p) => ({ ...p, bonus: e.target.value }))}
                  placeholder="0"
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Deduction (₨)</Label>
                <Input
                  type="number"
                  min={0}
                  value={generateForm.deduction}
                  onChange={(e) => setGenerateForm((p) => ({ ...p, deduction: e.target.value }))}
                  placeholder="0"
                  className="border-slate-300"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Notes</Label>
              <Input
                value={generateForm.notes}
                onChange={(e) => setGenerateForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Optional"
                className="border-slate-300"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowGenerateModal(false)} className="border-slate-300 text-slate-700 hover:bg-slate-50">Cancel</Button>
            <Button onClick={handleGenerate} className="bg-theme hover:bg-theme-dark text-white">Generate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Paid Modal */}
      <Dialog open={!!markPaidId} onOpenChange={(open) => !open && setMarkPaidId(null)}>
        <DialogContent className="sm:max-w-[450px]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Mark as Paid</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Payment method <span className="text-red-500">*</span></Label>
              <Select value={markPaidMethod} onValueChange={setMarkPaidMethod}>
                <SelectTrigger className="border-slate-300"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((pm) => (
                    <SelectItem key={pm.value} value={pm.value}>{pm.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setMarkPaidId(null)} className="border-slate-300 text-slate-700 hover:bg-slate-50">Cancel</Button>
            <Button onClick={handleMarkPaid} className="bg-theme hover:bg-theme-dark text-white">Mark as Paid</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={!!detailRecord} onOpenChange={(open) => !open && setDetailRecord(null)}>
        <DialogContent className="sm:max-w-[450px]" aria-describedby={undefined}>
          <DialogHeader className="space-y-1 pb-2 border-b border-slate-200">
            <DialogTitle className="text-xl font-bold text-slate-900">Salary Record Details</DialogTitle>
            <p className="text-xs text-slate-600">View details for this salary record.</p>
          </DialogHeader>
          {detailRecord && (
            <div className="space-y-4 py-3">
              <div className="space-y-3">
                <div className="flex justify-between items-baseline gap-4">
                  <Label className="text-xs font-semibold text-slate-700 shrink-0">Employee</Label>
                  <span className="text-sm font-medium text-slate-900 text-right">{getEmployeeName(detailRecord.employee_id)}</span>
                </div>
                <div className="flex justify-between items-baseline gap-4">
                  <Label className="text-xs font-semibold text-slate-700 shrink-0">Period</Label>
                  <span className="text-sm font-medium text-slate-900 text-right">{MONTHS[detailRecord.month - 1]} {detailRecord.year}</span>
                </div>
                <div className="flex justify-between items-baseline gap-4">
                  <Label className="text-xs font-semibold text-slate-700 shrink-0">Salary amount</Label>
                  <span className="text-sm font-medium text-slate-900 text-right">₨{Number(detailRecord.salary_amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-baseline gap-4">
                  <Label className="text-xs font-semibold text-slate-700 shrink-0">Bonus</Label>
                  <span className="text-sm font-medium text-slate-900 text-right">₨{Number(detailRecord.bonus).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-baseline gap-4">
                  <Label className="text-xs font-semibold text-slate-700 shrink-0">Deduction</Label>
                  <span className="text-sm font-medium text-slate-900 text-right">₨{Number(detailRecord.deduction).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-baseline gap-4">
                  <Label className="text-xs font-semibold text-slate-700 shrink-0">Total</Label>
                  <span className="text-sm font-medium text-theme text-right">₨{Number(detailRecord.total_salary).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <Label className="text-xs font-semibold text-slate-700 shrink-0">Status</Label>
                  <span>
                    {detailRecord.payment_status === "paid" ? (
                      <Badge className="bg-green-600 text-white">Paid</Badge>
                    ) : (
                      <Badge className="bg-slate-600 text-white">Unpaid</Badge>
                    )}
                  </span>
                </div>
                {detailRecord.payment_status === "paid" && (
                  <>
                    <div className="flex justify-between items-baseline gap-4">
                      <Label className="text-xs font-semibold text-slate-700 shrink-0">Payment method</Label>
                      <span className="text-sm font-medium text-slate-900 text-right capitalize">{detailRecord.payment_method || "—"}</span>
                    </div>
                    <div className="flex justify-between items-baseline gap-4">
                      <Label className="text-xs font-semibold text-slate-700 shrink-0">Paid at</Label>
                      <span className="text-sm font-medium text-slate-900 text-right">{detailRecord.paid_at ? formatDisplayDate(String(detailRecord.paid_at).slice(0, 10)) : "—"}</span>
                    </div>
                  </>
                )}
                {detailRecord.notes && (
                  <div className="flex justify-between items-start gap-4 pt-1 border-t border-slate-100">
                    <Label className="text-xs font-semibold text-slate-700 shrink-0">Notes</Label>
                    <span className="text-sm font-medium text-slate-900 text-right">{detailRecord.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="pt-2 border-t border-slate-200 gap-2">
            <Button
              variant="outline"
              onClick={() => setDetailRecord(null)}
              className="px-5 h-9 text-sm border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
