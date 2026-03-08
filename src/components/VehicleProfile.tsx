import { useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Car,
  Upload,
  User,
  Calendar,
  FileText,
  Wrench,
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  MoreVertical,
  DollarSign,
  Bell,
  Gauge,
  Palette,
  Fuel,
  Hash,
  Droplet,
  Clock,
  Route,
  CheckCircle2,
  ExternalLink,
  Send,
  ShoppingCart,
  Image as ImageIcon,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { formatDisplayDate } from "../utils/dateFormat";

interface VehicleProfileProps {
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: string;
    plate: string;
    ownerId: string;
    ownerName: string;
  };
  onClose?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewOwner?: (ownerId: string) => void;
  onCreateJobCard?: () => void;
  onCreateInvoice?: () => void;
}

// Mock detailed vehicle data
const getVehicleDetails = (vehicleId: string) => ({
  info: {
    vin: "1HGBH41JXMN109186",
    color: "Silver Metallic",
    fuelType: "Petrol",
    engineNo: "K20A1-1234567",
    oilType: "5W-30 Synthetic",
    mileage: "45,230 km",
    dailyMileage: "45 km/day",
    lastService: "2024-10-28",
    nextService: "2025-01-28",
    serviceFrequency: "Every 5,000 km or 3 months",
  },
  serviceHistory: [
    {
      id: "001",
      date: "2024-10-28",
      jobCard: "JOB-001",
      workDone: "Oil Change, Filter Replacement, General Inspection",
      technician: "Ahmad Ali",
      supervisor: "Hassan Khan",
      total: 4500,
      invoiceNo: "INV-001",
      status: "Completed",
    },
    {
      id: "002",
      date: "2024-07-15",
      jobCard: "JOB-045",
      workDone: "Brake Pad Replacement, Brake Fluid Change",
      technician: "Usman Shah",
      supervisor: "Hassan Khan",
      total: 6800,
      invoiceNo: "INV-045",
      status: "Completed",
    },
    {
      id: "003",
      date: "2024-04-10",
      jobCard: "JOB-032",
      workDone: "Tire Rotation, Wheel Alignment, Balance",
      technician: "Ahmad Ali",
      supervisor: "Imran Ahmed",
      total: 2750,
      invoiceNo: "INV-032",
      status: "Completed",
    },
    {
      id: "004",
      date: "2024-01-05",
      jobCard: "JOB-015",
      workDone: "Engine Diagnostic, Spark Plug Replacement",
      technician: "Usman Shah",
      supervisor: "Hassan Khan",
      total: 3200,
      invoiceNo: "INV-015",
      status: "Completed",
    },
  ],
  attachments: [
    { id: "1", name: "vehicle_front.jpg", size: "2.4 MB", date: "2024-10-28", type: "image" },
    { id: "2", name: "vehicle_side.jpg", size: "2.1 MB", date: "2024-10-28", type: "image" },
    { id: "3", name: "inspection_report.pdf", size: "456 KB", date: "2024-10-28", type: "document" },
    { id: "4", name: "service_checklist.pdf", size: "234 KB", date: "2024-07-15", type: "document" },
  ],
  stats: {
    totalServices: 12,
    totalSpent: 54250,
    averageServiceCost: 4521,
    daysSinceLastService: 8,
  },
});

export function VehicleProfile({
  vehicle,
  onClose,
  onEdit,
  onDelete,
  onViewOwner,
  onCreateJobCard,
  onCreateInvoice,
}: VehicleProfileProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [marketplaceEnabled, setMarketplaceEnabled] = useState(false);
  const details = getVehicleDetails(vehicle.id);

  const handleSendReminder = () => {
    // Send reminder logic
    console.log("Sending service reminder...");
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Top Header Bar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onClose}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="mb-0.5">Vehicle Profile</h1>
            <p className="text-sm text-slate-600">
              {vehicle.make} {vehicle.model} • {vehicle.plate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="bg-green-600 text-white border-green-600 hover:bg-green-700 hover:text-white"
            onClick={onCreateJobCard}
          >
            <Wrench className="h-4 w-4 mr-2" />
            Create Job Card
          </Button>
          <Button
            variant="outline"
            className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white"
            onClick={onCreateInvoice}
          >
            <FileText className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
          <Button variant="outline" onClick={handleSendReminder}>
            <Send className="h-4 w-4 mr-2" />
            Send Reminder
          </Button>
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r flex flex-col flex-shrink-0">
          {/* Vehicle Photo */}
          <div className="p-6 border-b flex-shrink-0">
            <div className="aspect-video rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-3 overflow-hidden relative group">
              <Car className="h-16 w-16 text-slate-400" />
              <button className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-white text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm">Upload Photo</span>
                </div>
              </button>
            </div>
            <div className="text-center">
              <h2 className="mb-1">
                {vehicle.make} {vehicle.model}
              </h2>
              <p className="text-sm text-slate-600 mb-2">
                {vehicle.year} • {vehicle.plate}
              </p>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                {vehicle.id}
              </Badge>
            </div>
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Owner Information */}
              <div>
                <h3 className="text-xs uppercase text-slate-500 mb-3">
                  Owner Information
                </h3>
                <button
                  onClick={() => onViewOwner?.(vehicle.ownerId)}
                  className="flex items-center gap-3 w-full p-3 border rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white flex-shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{vehicle.ownerName}</p>
                    <p className="text-xs text-slate-500">View Profile →</p>
                  </div>
                </button>
              </div>

              <Separator />

              {/* Quick Stats */}
              <div>
                <h3 className="text-xs uppercase text-slate-500 mb-3">
                  Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Wrench className="h-4 w-4" />
                      <span className="text-sm">Total Services</span>
                    </div>
                    <span className="font-medium">{details.stats.totalServices}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">Total Spent</span>
                    </div>
                    <span className="font-medium">
                      ₨{details.stats.totalSpent.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">Avg. Service Cost</span>
                    </div>
                    <span className="font-medium">
                      ₨{details.stats.averageServiceCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Last Service</span>
                    </div>
                    <span className="text-sm text-slate-600">
                      {details.stats.daysSinceLastService} days ago
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Service Schedule */}
              <div>
                <h3 className="text-xs uppercase text-slate-500 mb-3">
                  Service Schedule
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        Last Service
                      </span>
                    </div>
                    <p className="text-sm text-green-700">{details.info.lastService}</p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Bell className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Next Service
                      </span>
                    </div>
                    <p className="text-sm text-blue-700">{details.info.nextService}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Marketplace Toggle */}
              <div>
                <h3 className="text-xs uppercase text-slate-500 mb-3">
                  Marketplace
                </h3>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <ShoppingCart className="h-4 w-4 text-slate-600" />
                        <Label htmlFor="marketplace" className="font-medium text-sm">
                          List for Sale
                        </Label>
                      </div>
                      <p className="text-xs text-slate-500">
                        Mark this vehicle for the members-only marketplace
                      </p>
                    </div>
                    <Switch
                      id="marketplace"
                      checked={marketplaceEnabled}
                      onCheckedChange={setMarketplaceEnabled}
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Tab Navigation */}
            <div className="bg-white border-b px-6 flex-shrink-0">
              <TabsList className="bg-transparent border-b-0 h-auto p-0">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent px-4 py-3"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent px-4 py-3"
                >
                  Vehicle Details
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent px-4 py-3"
                >
                  Service History
                </TabsTrigger>
                <TabsTrigger
                  value="files"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent px-4 py-3"
                >
                  Files & Documents
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content - Scrollable */}
            <div className="flex-1 overflow-hidden">
              {/* Overview Tab */}
              <TabsContent
                value="overview"
                className="mt-0 h-full overflow-y-auto data-[state=inactive]:hidden"
              >
                <div className="p-6 space-y-6">
                  {/* Quick Info Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Gauge className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Current Mileage</p>
                          <p className="font-medium">{details.info.mileage}</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Route className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Daily Average</p>
                          <p className="font-medium">{details.info.dailyMileage}</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <Droplet className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Oil Type</p>
                          <p className="font-medium text-sm">{details.info.oilType}</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Vehicle Specifications */}
                  <Card className="p-6">
                    <h3 className="font-medium mb-4">Vehicle Specifications</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-slate-500">VIN Number</label>
                          <p className="font-medium mt-1">{details.info.vin}</p>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500">Engine Number</label>
                          <p className="font-medium mt-1">{details.info.engineNo}</p>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500">Fuel Type</label>
                          <p className="font-medium mt-1">{details.info.fuelType}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-slate-500">Color</label>
                          <p className="font-medium mt-1">{details.info.color}</p>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500">Recommended Oil</label>
                          <p className="font-medium mt-1">{details.info.oilType}</p>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500">Service Frequency</label>
                          <p className="font-medium mt-1">{details.info.serviceFrequency}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Recent Services */}
                  <Card className="p-6">
                    <h3 className="font-medium mb-4">Recent Service Activity</h3>
                    <div className="space-y-4">
                      {details.serviceHistory.slice(0, 3).map((service) => (
                        <div
                          key={service.id}
                          className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                        >
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Wrench className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <div>
                                <h4 className="font-medium text-sm">{service.workDone}</h4>
                                <p className="text-sm text-slate-600">Job Card: {service.jobCard}</p>
                              </div>
                              <span className="font-medium">
                                ₨{service.total.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>{formatDisplayDate(service.date)}</span>
                              <span>•</span>
                              <span>Tech: {service.technician}</span>
                              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                {service.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Vehicle Details Tab */}
              <TabsContent
                value="details"
                className="mt-0 h-full overflow-y-auto data-[state=inactive]:hidden"
              >
                <div className="p-6">
                  <Card className="p-6">
                    <h3 className="font-medium mb-6">Complete Vehicle Information</h3>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                      {/* Left Column */}
                      <div className="space-y-6">
                        <div className="flex items-start gap-3">
                          <Car className="h-5 w-5 text-slate-400 mt-0.5" />
                          <div className="flex-1">
                            <label className="text-xs text-slate-500">Make & Model</label>
                            <p className="font-medium mt-1">
                              {vehicle.make} {vehicle.model}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                          <div className="flex-1">
                            <label className="text-xs text-slate-500">Year</label>
                            <p className="font-medium mt-1">{vehicle.year}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Hash className="h-5 w-5 text-slate-400 mt-0.5" />
                          <div className="flex-1">
                            <label className="text-xs text-slate-500">License Plate</label>
                            <p className="font-medium mt-1">{vehicle.plate}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Hash className="h-5 w-5 text-slate-400 mt-0.5" />
                          <div className="flex-1">
                            <label className="text-xs text-slate-500">VIN Number</label>
                            <p className="font-medium mt-1">{details.info.vin}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Hash className="h-5 w-5 text-slate-400 mt-0.5" />
                          <div className="flex-1">
                            <label className="text-xs text-slate-500">Engine Number</label>
                            <p className="font-medium mt-1">{details.info.engineNo}</p>
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-6">
                        <div className="flex items-start gap-3">
                          <Palette className="h-5 w-5 text-slate-400 mt-0.5" />
                          <div className="flex-1">
                            <label className="text-xs text-slate-500">Color</label>
                            <p className="font-medium mt-1">{details.info.color}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Fuel className="h-5 w-5 text-slate-400 mt-0.5" />
                          <div className="flex-1">
                            <label className="text-xs text-slate-500">Fuel Type</label>
                            <p className="font-medium mt-1">{details.info.fuelType}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Gauge className="h-5 w-5 text-slate-400 mt-0.5" />
                          <div className="flex-1">
                            <label className="text-xs text-slate-500">Current Mileage</label>
                            <p className="font-medium mt-1">{details.info.mileage}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Route className="h-5 w-5 text-slate-400 mt-0.5" />
                          <div className="flex-1">
                            <label className="text-xs text-slate-500">Daily Mileage</label>
                            <p className="font-medium mt-1">{details.info.dailyMileage}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Droplet className="h-5 w-5 text-slate-400 mt-0.5" />
                          <div className="flex-1">
                            <label className="text-xs text-slate-500">Recommended Oil Type</label>
                            <p className="font-medium mt-1">{details.info.oilType}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Service Information */}
                    <h3 className="font-medium mb-4">Service Information</h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <label className="text-xs text-slate-500">Last Service Date</label>
                        <p className="font-medium mt-1">{details.info.lastService}</p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">Next Service Date</label>
                        <p className="font-medium mt-1">{details.info.nextService}</p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">Service Frequency</label>
                        <p className="font-medium mt-1">{details.info.serviceFrequency}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Service History Tab */}
              <TabsContent
                value="history"
                className="mt-0 h-full overflow-y-auto data-[state=inactive]:hidden"
              >
                <div className="p-6">
                  <Card className="p-6">
                    <div className="mb-6">
                      <h3 className="font-medium mb-1">Complete Service History</h3>
                      <p className="text-sm text-slate-600">
                        All services and maintenance performed on this vehicle
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Job Card #</TableHead>
                            <TableHead>Work Performed</TableHead>
                            <TableHead>Technician</TableHead>
                            <TableHead>Supervisor</TableHead>
                            <TableHead>Total Amount</TableHead>
                            <TableHead>Invoice</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {details.serviceHistory.map((service) => (
                            <TableRow key={service.id}>
                              <TableCell className="text-sm">{formatDisplayDate(service.date)}</TableCell>
                              <TableCell className="font-medium">{service.jobCard}</TableCell>
                              <TableCell className="text-sm max-w-xs">
                                {service.workDone}
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {service.technician}
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {service.supervisor}
                              </TableCell>
                              <TableCell className="font-medium">
                                ₨{service.total.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-blue-600 hover:text-blue-700"
                                >
                                  {service.invoiceNo}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </Button>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                  {service.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Files & Documents Tab */}
              <TabsContent
                value="files"
                className="mt-0 h-full overflow-y-auto data-[state=inactive]:hidden"
              >
                <div className="p-6 space-y-6">
                  {/* Upload Area */}
                  <Card className="p-6">
                    <h3 className="font-medium mb-4">Upload Files</h3>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer">
                      <Upload className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                      <h4 className="font-medium mb-1">Upload vehicle photos or documents</h4>
                      <p className="text-sm text-slate-600 mb-3">
                        Drag and drop files here, or click to browse
                      </p>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                  </Card>

                  {/* Existing Files */}
                  <Card className="p-6">
                    <h3 className="font-medium mb-4">
                      Uploaded Files ({details.attachments.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {details.attachments.map((file) => (
                        <div
                          key={file.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3">
                            {file.type === "image" ? (
                              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <ImageIcon className="h-6 w-6 text-blue-600" />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                <FileText className="h-6 w-6 text-slate-600" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{file.name}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                {file.size} • {formatDisplayDate(file.date)}
                              </p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
