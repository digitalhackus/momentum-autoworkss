import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Download, 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Banknote,
  Calendar,
  FileText,
  BarChart3
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { motion } from "motion/react";
import { ComingSoon } from "./ComingSoon";

const revenueData = [
  { month: "Jan", revenue: 45000, expenses: 28000, profit: 17000 },
  { month: "Feb", revenue: 52000, expenses: 30000, profit: 22000 },
  { month: "Mar", revenue: 48000, expenses: 29000, profit: 19000 },
  { month: "Apr", revenue: 61000, expenses: 32000, profit: 29000 },
  { month: "May", revenue: 55000, expenses: 31000, profit: 24000 },
  { month: "Jun", revenue: 67000, expenses: 34000, profit: 33000 },
];

const paymentData = [
  { name: "Cash", value: 35, color: "#22c55e" },
  { name: "Card", value: 50, color: "#3b82f6" },
  { name: "Bank Transfer", value: 15, color: "#f59e0b" },
];

const servicesData = [
  { service: "Oil Change", count: 45 },
  { service: "Brake Service", count: 32 },
  { service: "Tire Rotation", count: 28 },
  { service: "Engine Repair", count: 15 },
  { service: "AC Service", count: 22 },
];

const dailyStats = [
  { day: "Mon", jobs: 12, revenue: 4200 },
  { day: "Tue", jobs: 10, revenue: 3800 },
  { day: "Wed", jobs: 15, revenue: 5100 },
  { day: "Thu", jobs: 13, revenue: 4600 },
  { day: "Fri", jobs: 18, revenue: 6200 },
  { day: "Sat", jobs: 22, revenue: 7800 },
  { day: "Sun", jobs: 16, revenue: 5400 },
];

export function Reports() {
  return (
    <ComingSoon
      featureName="Smart Reports"
      description="Detailed performance, financial, and service analytics for your workshop—coming soon."
      icon="rocket"
    >
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl mb-1 lg:mb-2">Reports & Analytics</h1>
          <p className="text-sm lg:text-base text-gray-600">Analyze workshop performance and financial insights</p>
        </div>
        <div className="flex gap-2 lg:gap-3">
          <Button variant="outline" className="flex-1 lg:flex-none" size="sm">
            <Calendar className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Select Period</span>
          </Button>
          <Button className="bg-theme hover:bg-theme-dark flex-1 lg:flex-none" size="sm">
            <Download className="h-4 w-4 lg:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl">PKR/Rs 67,000</p>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+12.5%</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
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
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Card Payments</p>
                  <p className="text-3xl">PKR/Rs 33,500</p>
                  <p className="text-sm text-gray-500 mt-1">50% of total</p>
                </div>
                <div className="p-3 bg-theme-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-theme" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cash Payments</p>
                  <p className="text-3xl">PKR/Rs 23,450</p>
                  <p className="text-sm text-gray-500 mt-1">35% of total</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Banknote className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Net Profit</p>
                  <p className="text-3xl">Rs 3,300,000</p>
                  <p className="text-sm text-gray-500 mt-1">49.3% margin</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Profit Trend</CardTitle>
            <p className="text-sm text-gray-600">Monthly financial overview</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  name="Revenue"
                  dot={{ fill: "#3b82f6", r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#22c55e" 
                  strokeWidth={3} 
                  name="Profit"
                  dot={{ fill: "#22c55e", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <p className="text-sm text-gray-600">Distribution of payment types</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {paymentData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Analysis & Daily Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Services */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Services</CardTitle>
            <p className="text-sm text-gray-600">Most requested services this month</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={servicesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" />
                <YAxis dataKey="service" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Performance</CardTitle>
            <p className="text-sm text-gray-600">Jobs completed and revenue per day</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="jobs" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Jobs Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
            <Button variant="outline" className="h-20 lg:h-24 flex-col gap-2">
              <FileText className="h-6 lg:h-8 w-6 lg:w-8 text-theme" />
              <span className="text-sm lg:text-base">Daily Report</span>
            </Button>
            <Button variant="outline" className="h-20 lg:h-24 flex-col gap-2">
              <BarChart3 className="h-6 lg:h-8 w-6 lg:w-8 text-green-600" />
              <span className="text-sm lg:text-base">Monthly Summary</span>
            </Button>
            <Button variant="outline" className="h-20 lg:h-24 flex-col gap-2">
              <Download className="h-6 lg:h-8 w-6 lg:w-8 text-orange-600" />
              <span className="text-sm lg:text-base">Custom Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </ComingSoon>
  );
}