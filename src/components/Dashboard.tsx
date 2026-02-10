import { useState } from "react";
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
  Car
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";

const salesData = [
  { day: "Mon", revenue: 4200, jobs: 12 },
  { day: "Tue", revenue: 3800, jobs: 10 },
  { day: "Wed", revenue: 5100, jobs: 15 },
  { day: "Thu", revenue: 4600, jobs: 13 },
  { day: "Fri", revenue: 6200, jobs: 18 },
  { day: "Sat", revenue: 7800, jobs: 22 },
  { day: "Sun", revenue: 5400, jobs: 16 },
];

const recentJobs = [
  { id: 1, customer: "John Smith", make: "Toyota", modelYear: "Camry 2021", service: "Oil Change + Inspection", amount: 450, status: "Completed", time: "2h ago" },
  { id: 2, customer: "Sarah Johnson", make: "Honda", modelYear: "Civic 2020", service: "Brake Pad Replacement", amount: 320, status: "In Progress", time: "4h ago" },
  { id: 3, customer: "Mike Wilson", make: "Ford", modelYear: "F-150 2022", service: "Engine Diagnostics", amount: 890, status: "Completed", time: "5h ago" },
  { id: 4, customer: "Emily Davis", make: "Tesla", modelYear: "Model 3 2023", service: "Tire Rotation", amount: 275, status: "Pending", time: "6h ago" },
];

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps = {}) {
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);

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
            onClick={() => onNavigate && onNavigate("job-cards")}
          >
            <Wrench className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Job Card</span>
            <span className="sm:hidden">New Job</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 lg:flex-none" 
            size="sm"
            onClick={() => onNavigate && onNavigate("invoices")}
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
              <p className="text-xl lg:text-3xl text-white">₨624,700</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Jobs Today</p>
              <p className="text-xl lg:text-3xl text-white">18</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Avg. Time</p>
              <p className="text-xl lg:text-3xl text-white">2.5h</p>
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
              <div className="text-3xl mb-1">Rs 3,750,000</div>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>+8.2% from last week</span>
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
              <div className="text-3xl mb-1">23</div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                <span>8 technicians active</span>
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
              <div className="text-3xl mb-1">48</div>
              <div className="flex items-center text-sm text-purple-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+12.5% vs yesterday</span>
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
              <div className="text-3xl mb-1">342</div>
              <div className="flex items-center text-sm text-gray-600">
                <Car className="h-4 w-4 mr-1" />
                <span>518 vehicles registered</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle>Recent Jobs</CardTitle>
              <p className="text-xs lg:text-sm text-gray-600 mt-1">Latest service activities in your workshop</p>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {recentJobs.map((job) => (
              <div key={job.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">ID: {job.id}</p>
                    <p className="text-sm text-gray-600">{job.customer}</p>
                  </div>
                  <Badge 
                    className={
                      job.status === "Completed" ? "bg-green-100 text-green-700 border-green-200" :
                      job.status === "In Progress" ? "bg-theme-100 text-theme border-theme-200" :
                      "bg-gray-100 text-gray-700 border-gray-200"
                    }
                  >
                    {job.status}
                  </Badge>
                </div>
                <p className="text-sm">{job.make} {job.modelYear}</p>
                <p className="text-sm text-gray-600">{job.service}</p>
                <div className="flex items-center justify-between text-sm pt-2 border-t">
                  <span className="font-medium">₨{job.amount.toLocaleString()}</span>
                  <span className="text-gray-500">{job.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Make</TableHead>
                  <TableHead>Model/Year</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Amount (PKR)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.id}</TableCell>
                    <TableCell>{job.customer}</TableCell>
                    <TableCell>{job.make}</TableCell>
                    <TableCell>{job.modelYear}</TableCell>
                    <TableCell>{job.service}</TableCell>
                    <TableCell className="text-right">₨{job.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          job.status === "Completed" ? "bg-green-100 text-green-700 border-green-200" :
                          job.status === "In Progress" ? "bg-theme-100 text-theme border-theme-200" :
                          "bg-gray-100 text-gray-700 border-gray-200"
                        }
                      >
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">{job.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
