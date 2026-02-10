import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { JobCardDetail } from "./JobCardDetail";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle,
  User,
  Calendar,
  DollarSign,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { motion } from "motion/react";

const initialJobCards = {
  pending: [
    {
      id: "101",
      customer: "John Smith",
      make: "Toyota",
      model: "Camry 2021",
      plate: "ABC-1234",
      service: "Oil Change + Filter",
      priority: "Medium",
      amount: 450,
      technician: "Mike T.",
      estimatedTime: "2h",
      createdAt: "10:30 AM",
      timestamp: new Date("2024-11-04T10:30:00")
    },
    {
      id: "102",
      customer: "Sarah Johnson",
      make: "Honda",
      model: "Civic 2020",
      plate: "XYZ-5678",
      service: "Brake Inspection",
      priority: "High",
      amount: 320,
      technician: "Chris R.",
      estimatedTime: "1.5h",
      createdAt: "11:15 AM",
      timestamp: new Date("2024-11-04T11:15:00")
    },
  ],
  inProgress: [
    {
      id: "098",
      customer: "Mike Wilson",
      make: "Ford",
      model: "F-150 2022",
      plate: "DEF-9012",
      service: "Engine Diagnostics",
      priority: "High",
      amount: 890,
      technician: "David L.",
      estimatedTime: "3h",
      progress: 65,
      startedAt: "9:00 AM",
      timestamp: new Date("2024-11-04T09:00:00")
    },
    {
      id: "099",
      customer: "Emily Davis",
      make: "Tesla",
      model: "Model 3 2023",
      plate: "GHI-3456",
      service: "Tire Rotation",
      priority: "Low",
      amount: 275,
      technician: "Alex K.",
      estimatedTime: "1h",
      progress: 40,
      startedAt: "10:00 AM",
      timestamp: new Date("2024-11-04T10:00:00")
    },
  ],
  completed: [
    {
      id: "095",
      customer: "Robert Brown",
      make: "BMW",
      model: "X5 2021",
      plate: "JKL-7890",
      service: "Full Service + Inspection",
      priority: "Medium",
      amount: 1200,
      technician: "Mike T.",
      completedAt: "8:45 AM",
      timestamp: new Date("2024-11-04T08:45:00")
    },
    {
      id: "096",
      customer: "Lisa Anderson",
      make: "Mercedes",
      model: "C-Class 2020",
      plate: "MNO-2345",
      service: "AC Repair",
      priority: "High",
      amount: 650,
      technician: "Chris R.",
      completedAt: "9:30 AM",
      timestamp: new Date("2024-11-04T09:30:00")
    },
  ],
  delivered: [
    {
      id: "092",
      customer: "Tom Harris",
      make: "Audi",
      model: "A4 2019",
      plate: "PQR-6789",
      service: "Brake Pad Replacement",
      priority: "Medium",
      amount: 580,
      technician: "David L.",
      deliveredAt: "Yesterday, 6:00 PM",
      timestamp: new Date("2024-11-03T18:00:00")
    },
  ]
};

type SortOption = "priority-high" | "priority-low" | "date-new" | "date-old" | "customer" | "amount-high" | "amount-low";

export function JobCards() {
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [showCreateJobCard, setShowCreateJobCard] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("priority-high");

  // Sort function
  const sortJobs = (jobs: any[]) => {
    const priorityOrder = { High: 3, Medium: 2, Low: 1 };
    
    return [...jobs].sort((a, b) => {
      switch (sortBy) {
        case "priority-high":
          return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
        case "priority-low":
          return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
        case "date-new":
          return b.timestamp.getTime() - a.timestamp.getTime();
        case "date-old":
          return a.timestamp.getTime() - b.timestamp.getTime();
        case "customer":
          return a.customer.localeCompare(b.customer);
        case "amount-high":
          return b.amount - a.amount;
        case "amount-low":
          return a.amount - b.amount;
        default:
          return 0;
      }
    });
  };

  // Apply sorting to all job categories
  const jobCards = {
    pending: sortJobs(initialJobCards.pending),
    inProgress: sortJobs(initialJobCards.inProgress),
    completed: sortJobs(initialJobCards.completed),
    delivered: sortJobs(initialJobCards.delivered),
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case "priority-high": return "Priority (High to Low)";
      case "priority-low": return "Priority (Low to High)";
      case "date-new": return "Date (Newest First)";
      case "date-old": return "Date (Oldest First)";
      case "customer": return "Customer (A-Z)";
      case "amount-high": return "Amount (High to Low)";
      case "amount-low": return "Amount (Low to High)";
      default: return "Sort";
    }
  };

  const renderJobCard = (job: any, status: string) => {
    return (
      <motion.div
        key={job.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.01 }}
        className="bg-white p-3.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
        onClick={() => setSelectedCard(job)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2.5">
          <div>
            <h3 className="text-sm font-medium mb-0.5">JOB-{job.id}</h3>
            <p className="text-xs text-gray-600">{job.customer}</p>
          </div>
          <Badge
            className={
              job.priority === "High" ? "bg-red-50 text-red-700 border-red-200 text-xs" :
              job.priority === "Medium" ? "bg-orange-50 text-orange-700 border-orange-200 text-xs" :
              "bg-theme-50 text-theme border-theme-200 text-xs"
            }
          >
            {job.priority}
          </Badge>
        </div>

        {/* Vehicle Info */}
        <div className="mb-2.5 p-2 bg-gray-50 rounded">
          <p className="text-xs font-medium text-gray-900">{job.make} {job.model}</p>
          <p className="text-xs text-gray-500">{job.plate}</p>
        </div>

        {/* Service */}
        <p className="text-xs text-gray-700 mb-2.5">{job.service}</p>

        {/* Progress Bar (for In Progress) */}
        {status === "inProgress" && job.progress && (
          <div className="mb-2.5">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{job.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-theme h-1.5 rounded-full transition-all"
                style={{ width: `${job.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-600 pt-2.5 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{job.technician}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-gray-900">₨{job.amount}</span>
          </div>
        </div>

        {/* Time Info */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
          <Clock className="h-3 w-3" />
          {status === "pending" && <span>{job.estimatedTime} • {job.createdAt}</span>}
          {status === "inProgress" && <span>{job.estimatedTime} • Started {job.startedAt}</span>}
          {status === "completed" && <span>Completed {job.completedAt}</span>}
          {status === "delivered" && <span>Delivered {job.deliveredAt}</span>}
        </div>
      </motion.div>
    );
  };

  // If creating a new job card or viewing a job card detail
  if (showCreateJobCard) {
    return (
      <JobCardDetail
        onClose={() => setShowCreateJobCard(false)}
        onSave={(data) => {
          console.log("Job card created:", data);
          setShowCreateJobCard(false);
        }}
        userRole="Admin"
      />
    );
  }

  if (selectedCard) {
    return (
      <JobCardDetail
        jobCard={selectedCard}
        onClose={() => setSelectedCard(null)}
        onSave={(data) => {
          console.log("Job card updated:", data);
          setSelectedCard(null);
        }}
        userRole="Admin"
      />
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl mb-1 lg:mb-2">Job Cards</h1>
          <p className="text-sm lg:text-base text-gray-600">Track and manage service jobs across all stages</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full lg:w-auto">
                <ArrowUpDown className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">{getSortLabel()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy("priority-high")}>
                <ArrowDown className="h-4 w-4 mr-2 text-red-500" />
                Priority (High to Low)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("priority-low")}>
                <ArrowUp className="h-4 w-4 mr-2 text-theme" />
                Priority (Low to High)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy("date-new")}>
                <ArrowDown className="h-4 w-4 mr-2" />
                Date (Newest First)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("date-old")}>
                <ArrowUp className="h-4 w-4 mr-2" />
                Date (Oldest First)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy("customer")}>
                <User className="h-4 w-4 mr-2" />
                Customer (A-Z)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy("amount-high")}>
                <ArrowDown className="h-4 w-4 mr-2" />
                Amount (High to Low)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("amount-low")}>
                <ArrowUp className="h-4 w-4 mr-2" />
                Amount (Low to High)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            className="bg-theme hover:bg-theme-dark w-full lg:w-auto" 
            size="sm"
            onClick={() => setShowCreateJobCard(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Job Card
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl">{jobCards.pending.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
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
          <Card className="border border-theme-200 bg-gradient-to-br from-theme-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">In Progress</p>
                  <p className="text-3xl">{jobCards.inProgress.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-theme-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-theme" />
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
          <Card className="border border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl">{jobCards.completed.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
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
          <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Delivered</p>
                  <p className="text-3xl">{jobCards.delivered.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Column */}
        <div className="flex flex-col">
          <div className="mb-3 flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg p-2.5">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <h2 className="text-sm font-medium">Pending</h2>
            </div>
            <Badge variant="secondary" className="bg-white text-xs">{jobCards.pending.length}</Badge>
          </div>
          <div className="space-y-3 flex-1">
            {jobCards.pending.map(job => renderJobCard(job, "pending"))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="flex flex-col">
          <div className="mb-3 flex items-center justify-between bg-theme-50 border border-theme-200 rounded-lg p-2.5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-theme" />
              <h2 className="text-sm font-medium">In Progress</h2>
            </div>
            <Badge variant="secondary" className="bg-white text-xs">{jobCards.inProgress.length}</Badge>
          </div>
          <div className="space-y-3 flex-1">
            {jobCards.inProgress.map(job => renderJobCard(job, "inProgress"))}
          </div>
        </div>

        {/* Completed Column */}
        <div className="flex flex-col">
          <div className="mb-3 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <h2 className="text-sm font-medium">Completed</h2>
            </div>
            <Badge variant="secondary" className="bg-white text-xs">{jobCards.completed.length}</Badge>
          </div>
          <div className="space-y-3 flex-1">
            {jobCards.completed.map(job => renderJobCard(job, "completed"))}
          </div>
        </div>

        {/* Delivered Column */}
        <div className="flex flex-col">
          <div className="mb-3 flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg p-2.5">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-purple-600" />
              <h2 className="text-sm font-medium">Delivered</h2>
            </div>
            <Badge variant="secondary" className="bg-white text-xs">{jobCards.delivered.length}</Badge>
          </div>
          <div className="space-y-3 flex-1">
            {jobCards.delivered.map(job => renderJobCard(job, "delivered"))}
          </div>
        </div>
      </div>
    </div>
  );
}