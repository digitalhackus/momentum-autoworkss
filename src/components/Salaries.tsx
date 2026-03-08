import { useState, useEffect } from "react";
import { useData } from "../contexts/DataContext";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Wallet, Users, FileText, DollarSign, AlertCircle, TrendingUp, UserCircle } from "lucide-react";

interface SalariesProps {
  onNavigate: (page: string) => void;
}

export function Salaries({ onNavigate }: SalariesProps) {
  const { getSalariesDashboard, employees } = useData();
  const [stats, setStats] = useState<{
    totalEmployees: number;
    totalPayrollThisMonth: number;
    unpaidCount: number;
    paidThisMonthTotal: number;
  } | null>(null);

  useEffect(() => {
    getSalariesDashboard().then(setStats).catch(() => setStats(null));
  }, [getSalariesDashboard, employees.length]);

  const totalEmployees = stats?.totalEmployees ?? 0;
  const totalPayrollThisMonth = stats?.totalPayrollThisMonth ?? 0;
  const unpaidCount = stats?.unpaidCount ?? 0;
  const paidThisMonthTotal = stats?.paidThisMonthTotal ?? 0;

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
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold">Salaries</h1>
            </div>
            <p className="text-white/80">Fixed monthly salary tracking</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-theme-100 bg-gradient-to-br from-white to-theme-50/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Employees</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{totalEmployees}</p>
            </div>
            <div className="bg-theme-100 p-3 rounded-xl">
              <Users className="h-7 w-7 text-theme" />
            </div>
          </div>
        </Card>
        <Card className="p-5 border-theme-100 bg-gradient-to-br from-white to-theme-50/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Payroll This Month</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">₨{totalPayrollThisMonth.toLocaleString()}</p>
            </div>
            <div className="bg-theme-100 p-3 rounded-xl">
              <DollarSign className="h-7 w-7 text-theme" />
            </div>
          </div>
        </Card>
        <Card className="p-5 border-red-100 bg-gradient-to-br from-white to-red-50/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Unpaid Salaries</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{unpaidCount}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-xl">
              <AlertCircle className="h-7 w-7 text-red-600" />
            </div>
          </div>
        </Card>
        <Card className="p-5 border-green-100 bg-gradient-to-br from-white to-green-50/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Paid This Month Total</p>
              <p className="text-3xl font-bold text-green-600 mt-1">₨{paidThisMonthTotal.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <TrendingUp className="h-7 w-7 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className="p-6 cursor-pointer hover:shadow-md transition-shadow border-theme-200"
          onClick={() => onNavigate("salaries-employees")}
        >
          <div className="flex items-center gap-4">
            <div className="bg-theme-100 p-4 rounded-xl">
              <UserCircle className="h-10 w-10 text-theme" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Employees</h2>
              <p className="text-sm text-slate-600">Add, edit and manage employees and their monthly salary</p>
            </div>
          </div>
        </Card>
        <Card
          className="p-6 cursor-pointer hover:shadow-md transition-shadow border-theme-200"
          onClick={() => onNavigate("salaries-records")}
        >
          <div className="flex items-center gap-4">
            <div className="bg-theme-100 p-4 rounded-xl">
              <FileText className="h-10 w-10 text-theme" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Salary Records</h2>
              <p className="text-sm text-slate-600">Generate salary records and mark as paid</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
