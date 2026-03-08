import React, { useState, useEffect } from "react";
import { useData } from "../contexts/DataContext";
import type { Employee } from "../contexts/DataContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { UserCircle, Plus, Search, Edit, UserCheck, UserX, ArrowLeft, Filter } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { formatDisplayDate } from "../utils/dateFormat";
import { DatePicker } from "./ui/date-picker";

interface SalariesEmployeesProps {
  onNavigate: (page: string) => void;
}

export function SalariesEmployees({ onNavigate }: SalariesEmployeesProps) {
  const { employees, refetch, addEmployee, updateEmployee } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "",
    monthly_salary: "",
    joining_date: "",
  });

  useEffect(() => {
    if (employees.length === 0) refetch();
  }, [employees.length, refetch]);

  const activeEmployees = employees.filter((e) => e.is_active !== false);
  const filteredEmployees = employees.filter((e) => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const matchesSearch =
        (e.name || "").toLowerCase().includes(q) ||
        (e.phone || "").toLowerCase().includes(q) ||
        (e.role || "").toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }
    if (statusFilter === "active" && !e.is_active) return false;
    if (statusFilter === "inactive" && e.is_active !== false) return false;
    return true;
  });

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      alert("Name is required");
      return;
    }
    const sal = parseFloat(formData.monthly_salary);
    if (Number.isNaN(sal) || sal < 0) {
      alert("Monthly salary must be a non-negative number");
      return;
    }
    await addEmployee({
      name: formData.name.trim(),
      phone: formData.phone.trim() || undefined,
      role: formData.role.trim() || undefined,
      monthly_salary: sal,
      joining_date: formData.joining_date || undefined,
      is_active: true,
    });
    setFormData({ name: "", phone: "", role: "", monthly_salary: "", joining_date: "" });
    setShowAddModal(false);
  };

  const handleEdit = (emp: Employee) => {
    setFormData({
      name: emp.name,
      phone: emp.phone || "",
      role: emp.role || "",
      monthly_salary: String(emp.monthly_salary),
      joining_date: emp.joining_date || "",
    });
    setEditingId(emp.id);
    setShowAddModal(true);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    if (!formData.name.trim()) {
      alert("Name is required");
      return;
    }
    const sal = parseFloat(formData.monthly_salary);
    if (Number.isNaN(sal) || sal < 0) {
      alert("Monthly salary must be a non-negative number");
      return;
    }
    await updateEmployee(editingId, {
      name: formData.name.trim(),
      phone: formData.phone.trim() || undefined,
      role: formData.role.trim() || undefined,
      monthly_salary: sal,
      joining_date: formData.joining_date || undefined,
    });
    setEditingId(null);
    setFormData({ name: "", phone: "", role: "", monthly_salary: "", joining_date: "" });
    setShowAddModal(false);
  };

  const handleToggleActive = async (emp: Employee) => {
    const nextActive = emp.is_active !== true;
    await updateEmployee(emp.id, { is_active: nextActive });
  };

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
                <UserCircle className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold">Employees</h1>
            </div>
            <p className="text-white/80">Manage employees and monthly salary</p>
          </div>
          <Button
            onClick={() => {
              setEditingId(null);
              setFormData({ name: "", phone: "", role: "", monthly_salary: "", joining_date: "" });
              setShowAddModal(true);
            }}
            className="bg-white text-theme hover:bg-theme-50 shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employees..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
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
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${statusFilter === "active" ? "bg-theme/10 text-theme font-medium" : "hover:bg-gray-100"}`}
                    onClick={() => setStatusFilter("active")}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${statusFilter === "inactive" ? "bg-theme/10 text-theme font-medium" : "hover:bg-gray-100"}`}
                    onClick={() => setStatusFilter("inactive")}
                  >
                    Inactive
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
              <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase w-[18%]">Name</th>
              <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase w-[14%]">Phone</th>
              <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase w-[14%]">Role</th>
              <th className="px-3 py-4 text-right text-xs font-semibold text-slate-700 uppercase w-[12%]">Monthly Salary</th>
              <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase w-[12%]">Joining Date</th>
              <th className="px-3 py-4 text-center text-xs font-semibold text-slate-700 uppercase w-[10%]">Status</th>
              <th className="px-3 py-4 text-center text-xs font-semibold text-slate-700 uppercase w-[20%]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                  No employees found. Add one or adjust search.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-theme-50/50">
                  <td className="px-3 py-3 text-sm font-medium text-slate-900">{emp.name}</td>
                  <td className="px-3 py-3 text-sm text-slate-700">{emp.phone || "—"}</td>
                  <td className="px-3 py-3 text-sm text-slate-700">{emp.role || "—"}</td>
                  <td className="px-3 py-3 text-sm text-right font-medium text-theme">₨{Number(emp.monthly_salary).toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm text-slate-700">{emp.joining_date ? formatDisplayDate(emp.joining_date) : "—"}</td>
                  <td className="px-3 py-3">
                    <div className="flex justify-center">
                      {emp.is_active === true ? (
                        <Badge className="bg-green-600 text-white">Active</Badge>
                      ) : (
                        <Badge className="bg-slate-400 text-white">Inactive</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(emp)}
                        className="h-8 w-8 text-theme hover:bg-theme-50"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(emp)}
                        className={emp.is_active ? "h-8 w-8 text-amber-600 hover:bg-amber-50" : "h-8 w-8 text-green-600 hover:bg-green-50"}
                        title={emp.is_active ? "Deactivate" : "Activate"}
                      >
                        {emp.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
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
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {editingId ? "Edit Employee" : "Add New Employee"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="empName" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="empName"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Employee name"
                className="border-slate-300 focus:border-theme focus:ring-theme"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="empPhone" className="text-sm font-medium">Phone</Label>
              <Input
                id="empPhone"
                value={formData.phone}
                onFocus={(e) => {
                  if (!formData.phone) setFormData((p) => ({ ...p, phone: "+92" }));
                }}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (!raw || raw === "+") {
                    setFormData((p) => ({ ...p, phone: "" }));
                    return;
                  }
                  if (!raw.startsWith("+92")) {
                    const digits = raw.replace(/\D/g, "").slice(0, 10);
                    setFormData((p) => ({ ...p, phone: digits ? `+92${digits}` : "+92" }));
                    return;
                  }
                  const afterCode = raw.slice(3).replace(/\D/g, "").slice(0, 10);
                  setFormData((p) => ({ ...p, phone: "+92" + afterCode }));
                }}
                placeholder="Enter phone number"
                className="border-slate-300 focus:border-theme focus:ring-theme"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="empRole" className="text-sm font-medium">Role</Label>
              <Input
                id="empRole"
                value={formData.role}
                onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                placeholder="e.g. Technician"
                className="border-slate-300 focus:border-theme focus:ring-theme"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="empSalary" className="text-sm font-medium">
                Monthly Salary (₨) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="empSalary"
                type="number"
                min={0}
                step={1}
                value={formData.monthly_salary}
                onChange={(e) => setFormData((p) => ({ ...p, monthly_salary: e.target.value }))}
                placeholder="0"
                className="border-slate-300 focus:border-theme focus:ring-theme"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Joining Date</Label>
              <DatePicker
                value={formData.joining_date}
                onChange={(v) => setFormData((p) => ({ ...p, joining_date: v }))}
                placeholder="dd/mm/yy"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowAddModal(false)} className="border-slate-300 text-slate-700 hover:bg-slate-50">
              Cancel
            </Button>
            <Button
              onClick={editingId ? handleUpdate : handleAdd}
              className="bg-theme hover:bg-theme-dark text-white"
            >
              {editingId ? "Update" : "Add Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
