import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { useData, type CustomerVehicle } from "../contexts/DataContext";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Car,
  Wrench,
  X,
  Edit,
  Trash2,
  Plus,
  MoreVertical,
  User,
  MessageSquare,
  Upload,
  FileText,
  MapPinIcon,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
  Eye,
  Download,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { formatDisplayDate } from "../utils/dateFormat";

interface CustomerProfileProps {
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    vehicles: number;
    lastVisit: string;
    totalSpent: number;
    status: string;
    serviceHistory: number;
  };
  onClose?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onNavigate?: (page: string) => void;
  onNewService?: () => void;
  onAddVehicle?: () => void;
}

// Mock detailed customer data
const getCustomerDetails = (customerId: string) => ({
  contactInfo: {
    street: "House 123, Street 45",
    area: "Soan Garden",
    city: "Islamabad",
    state: "Federal",
    region: "Soan Garden",
  },
  vehicles: [
    {
      id: "VEH-001",
      make: "Toyota",
      model: "Corolla",
      year: "2021",
      plate: "ISB-1234",
      mileage: "45,000 km",
      color: "Silver",
    },
    {
      id: "VEH-002",
      make: "Honda",
      model: "Civic",
      year: "2019",
      plate: "ISB-5678",
      mileage: "62,000 km",
      color: "Black",
    },
  ],
  serviceHistory: [
    {
      id: "001",
      date: "2024-10-28",
      service: "Oil Change + Filter",
      oilUsed: "Castrol 5W-30 (4L)",
      parts: "Oil Filter, Air Filter",
      total: 4500,
      technician: "Ahmad Ali",
      supervisor: "Hassan Khan",
      status: "Completed",
      vehicle: "Toyota Corolla 2021",
    },
    {
      id: "002",
      date: "2024-09-15",
      service: "Brake Service",
      oilUsed: "Brake Fluid DOT 4 (500ml)",
      parts: "Front Brake Pads, Brake Fluid",
      total: 6800,
      technician: "Usman Shah",
      supervisor: "Hassan Khan",
      status: "Completed",
      vehicle: "Honda Civic 2019",
    },
    {
      id: "003",
      date: "2024-08-10",
      service: "Tire Rotation & Balance",
      oilUsed: "-",
      parts: "Wheel Weights",
      total: 2750,
      technician: "Ahmad Ali",
      supervisor: "Imran Ahmed",
      status: "Completed",
      vehicle: "Toyota Corolla 2021",
    },
    {
      id: "004",
      date: "2024-07-22",
      service: "Engine Diagnostic",
      oilUsed: "-",
      parts: "Spark Plugs",
      total: 3200,
      technician: "Usman Shah",
      supervisor: "Hassan Khan",
      status: "Completed",
      vehicle: "Honda Civic 2019",
    },
  ],
  interactions: [
    {
      id: "N001",
      type: "note",
      date: "2024-10-28 14:30",
      author: "Hassan Khan",
      content: "Customer requested premium oil for next service. Prefers Castrol brand.",
    },
    {
      id: "N002",
      type: "whatsapp",
      date: "2024-10-20 10:15",
      author: "System",
      content: "Sent service reminder via WhatsApp for upcoming maintenance.",
    },
    {
      id: "N003",
      type: "call",
      date: "2024-09-14 16:45",
      author: "Ahmad Ali",
      content: "Called to confirm brake pad replacement. Customer approved ₨6,800 estimate.",
    },
    {
      id: "N004",
      type: "email",
      date: "2024-08-30 09:20",
      author: "System",
      content: "Invoice sent via email for service JOB-003.",
    },
  ],
  attachments: [],
});

export function CustomerProfile({
  customer,
  onClose,
  onEdit,
  onDelete,
  onNavigate,
  onNewService,
  onAddVehicle,
}: CustomerProfileProps) {
  const { getCustomerVehicles, updateVehicle } = useData();
  const [activeTab, setActiveTab] = useState("overview");
  const [newNote, setNewNote] = useState("");
  const [editingVehicle, setEditingVehicle] = useState<CustomerVehicle | null>(null);
  const [editVehicleForm, setEditVehicleForm] = useState({ carMake: "", carModel: "", carYear: "", vehicleNumber: "" });
  const [savingVehicle, setSavingVehicle] = useState(false);
  const details = getCustomerDetails(customer.id);
  const [customerVehicles, setCustomerVehicles] = useState<CustomerVehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);

  const handleNewService = () => {
    if (onNewService) onNewService();
    else if (onNavigate) onNavigate("invoices");
    else toast.info("New Service");
  };

  const handleAddVehicle = () => {
    if (onAddVehicle) onAddVehicle();
    else {
      setActiveTab("vehicles");
      toast.info("Add vehicle from the Vehicles tab or when creating an invoice.");
    }
  };

  const openEditVehicle = (vehicle: CustomerVehicle) => {
    setEditingVehicle(vehicle);
    setEditVehicleForm({
      carMake: vehicle.carMake || "",
      carModel: vehicle.carModel || "",
      carYear: vehicle.carYear || "",
      vehicleNumber: vehicle.vehicleNumber || "",
    });
  };

  const handleSaveVehicle = async () => {
    if (!editingVehicle) return;
    setSavingVehicle(true);
    try {
      await updateVehicle(customer.id, editingVehicle.id, {
        carMake: editVehicleForm.carMake,
        carModel: editVehicleForm.carModel,
        carYear: editVehicleForm.carYear || undefined,
        vehicleNumber: editVehicleForm.vehicleNumber,
      });
      toast.success("Vehicle updated");
      setEditingVehicle(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update vehicle");
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleSoanGarden = () => {
    const { area, city } = details.contactInfo;
    const query = encodeURIComponent(`${area}, ${city}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  // Load real vehicles for this customer (saved from invoice flow / vehicles page)
  useEffect(() => {
    let cancelled = false;
    setVehiclesLoading(true);
    getCustomerVehicles(customer.id)
      .then((list) => {
        if (!cancelled) setCustomerVehicles(list || []);
      })
      .catch(() => {
        if (!cancelled) setCustomerVehicles([]);
      })
      .finally(() => {
        if (!cancelled) setVehiclesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [customer.id, getCustomerVehicles]);
  const initials = customer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleAddNote = () => {
    if (newNote.trim()) {
      toast.success("Note added.");
      setNewNote("");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle2 className="h-3 w-3" />;
      case "pending":
        return <Clock className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
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
            <h1 className="mb-0.5">Customer Profile</h1>
            <p className="text-sm text-slate-600">{customer.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="bg-theme text-white border-theme hover:bg-theme-dark hover:text-white"
            onClick={handleNewService}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Service
          </Button>
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
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
          {/* Customer Info Header */}
          <div className="p-6 text-center border-b flex-shrink-0">
            <Avatar className="h-20 w-20 mx-auto mb-3">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h2 className="mb-2">{customer.name}</h2>
            <Badge
              className={
                customer.status === "VIP"
                  ? "bg-purple-100 text-purple-700 border-purple-200"
                  : "bg-green-100 text-green-700 border-green-200"
              }
            >
              {customer.status}
            </Badge>
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-xs uppercase text-slate-500 mb-3">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm flex-1">
                      <div className="text-slate-500 text-xs mb-0.5">Phone</div>
                      <div>{customer.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm flex-1">
                      <div className="text-slate-500 text-xs mb-0.5">Email</div>
                      <div className="break-all">{customer.email}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm flex-1">
                      <div className="text-slate-500 text-xs mb-0.5">Address</div>
                      <div className="text-slate-700">
                        {details.contactInfo.street}
                        <br />
                        {details.contactInfo.area}, {details.contactInfo.city}
                        <br />
                        {details.contactInfo.state}
                      </div>
                      <Badge
                        role="button"
                        className="mt-2 bg-theme-50 text-theme border-theme-200 text-xs cursor-pointer hover:bg-theme-100 transition-colors"
                        onClick={handleSoanGarden}
                      >
                        <MapPinIcon className="h-3 w-3 mr-1" />
                        {details.contactInfo.region}
                      </Badge>
                    </div>
                  </div>
                </div>
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
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">Total Spent</span>
                    </div>
                    <span className="font-medium">
                      ₨{customer.totalSpent.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Car className="h-4 w-4" />
                      <span className="text-sm">Vehicles</span>
                    </div>
                    <span className="font-medium">{customer.vehicles}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Wrench className="h-4 w-4" />
                      <span className="text-sm">Services</span>
                    </div>
                    <span className="font-medium">{customer.serviceHistory}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Last Visit</span>
                    </div>
                    <span className="text-sm text-slate-600">
                      {customer.lastVisit}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Quick Actions */}
              <div>
                <h3 className="text-xs uppercase text-slate-500 mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={handleNewService}>
                    <Wrench className="h-4 w-4 mr-2" />
                    Schedule Service
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate ? onNavigate("invoices") : toast.info("Invoices")}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Invoices
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("Send message – connect to WhatsApp/email to enable.")}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
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
                  className="data-[state=active]:border-b-2 data-[state=active]:border-theme rounded-none bg-transparent px-4 py-3"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="vehicles"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-theme rounded-none bg-transparent px-4 py-3"
                >
                  Vehicles
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-theme rounded-none bg-transparent px-4 py-3"
                >
                  Service History
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-theme rounded-none bg-transparent px-4 py-3"
                >
                  Notes & Interactions
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content - consistent height, scroll inside each tab */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              {/* Overview Tab */}
              <TabsContent
                value="overview"
                className="mt-0 flex-1 min-h-0 overflow-y-auto data-[state=inactive]:hidden scrollbar-thin rounded-b-lg"
              >
                <div className="p-4 lg:p-6 space-y-6 min-h-full">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    <Card className="p-5 border-l-4 border-l-theme bg-white shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-theme-50 flex items-center justify-center">
                          <DollarSign className="h-6 w-6 text-theme" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
                          <p className="text-xl font-bold text-slate-900">₨{customer.totalSpent.toLocaleString()}</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-5 border-l-4 border-l-green-500 bg-white shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                          <Wrench className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Services Completed</p>
                          <p className="text-xl font-bold text-slate-900">{customer.serviceHistory}</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-5 border-l-4 border-l-orange-500 bg-white shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                          <Car className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Vehicles</p>
                          <p className="text-xl font-bold text-slate-900">{customer.vehicles}</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Vehicle Quick List */}
                    <Card className="p-6 border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          <Car className="h-5 w-5 text-slate-400" />
                          Vehicle Summary
                        </h3>
                        <Button size="sm" variant="ghost" className="text-theme text-xs h-8 px-2 hover:bg-theme-50" onClick={() => setActiveTab("vehicles")}>
                          View All Vehicles →
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {customerVehicles.map((vehicle) => (
                          <div
                            key={vehicle.id}
                            className="group relative flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-theme-200 hover:shadow-md transition-all duration-200"
                          >
                            <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 group-hover:border-theme-100">
                              <Car className="h-6 w-6 text-slate-400 group-hover:text-theme" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                                {vehicle.carMake} {vehicle.carModel}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="font-semibold text-theme bg-theme-50 px-1.5 py-0.5 rounded uppercase">{vehicle.vehicleNumber}</span>
                                <span>•</span>
                                <span>{vehicle.carYear || "—"}</span>
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => openEditVehicle(vehicle)}
                              aria-label="Edit vehicle"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                        {!vehiclesLoading && customerVehicles.length === 0 && (
                          <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
                            <Car className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                            <p className="text-sm text-slate-400 font-medium">No vehicles registered</p>
                          </div>
                        )}
                        {vehiclesLoading && (
                          <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
                            <Car className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                            <p className="text-sm text-slate-400 font-medium">Loading vehicles…</p>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Quick Attachments */}
                    <Card className="p-6 border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          <Upload className="h-5 w-5 text-slate-400" />
                          Recent Files
                        </h3>
                      </div>
                      <p className="text-sm text-slate-500">
                        File attachments for this customer will appear here once upload is enabled.
                      </p>
                    </Card>
                  </div>

                  {/* Enhanced Recent Activity */}
                  <Card className="p-6 border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-slate-400" />
                        Recent Service Log
                      </h3>
                      <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => setActiveTab("history")}>View All</Button>
                    </div>
                    <div className="space-y-0">
                      {details.serviceHistory.slice(0, 3).map((service, index) => (
                        <div
                          key={service.id}
                          className={`flex items-start gap-4 py-4 ${index !== 2 ? 'border-b border-slate-100' : ''}`}
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                            <Wrench className="h-5 w-5 text-slate-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1 gap-2">
                              <div className="min-w-0">
                                <h4 className="font-bold text-sm text-slate-900 truncate">{service.service}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-slate-500 font-medium">{formatDisplayDate(service.date)}</span>
                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                  <span className="text-xs text-theme font-semibold">{service.vehicle}</span>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-sm text-slate-900">₨{service.total.toLocaleString()}</p>
                                <Badge className={`mt-1 h-5 px-2 text-[9px] uppercase font-bold rounded-full ${getStatusColor(service.status)}`}>
                                  {service.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-slate-500 flex items-center gap-3">
                              <span className="flex items-center gap-1"><User className="h-3 w-3" /> {service.technician}</span>
                              <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {service.parts.split(',')[0]}...</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Vehicles Tab */}
              <TabsContent
                value="vehicles"
                className="mt-0 flex-1 min-h-0 overflow-y-auto data-[state=inactive]:hidden scrollbar-thin rounded-b-lg"
              >
                <div className="p-4 lg:p-6 min-h-full">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Manage Vehicles</h2>
                      <p className="text-sm text-slate-500">All vehicles registered under {customer.name}</p>
                    </div>
                    <Button className="bg-theme hover:bg-theme-dark h-10 px-6 font-semibold" onClick={handleAddVehicle}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Vehicle
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {customerVehicles.map((vehicle) => (
                      <Card
                        key={vehicle.id}
                        className="group overflow-hidden border-slate-200 hover:border-theme-300 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-theme-50 group-hover:border-theme-100 transition-colors">
                                <Car className="h-7 w-7 text-slate-400 group-hover:text-theme" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                  {vehicle.carMake} {vehicle.carModel}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className="bg-theme text-white hover:bg-theme border-0 font-mono text-[10px] tracking-wider px-2 py-0.5">
                                    {vehicle.vehicleNumber}
                                  </Badge>
                                  <span className="text-xs text-slate-500 font-medium">{vehicle.carYear || "—"}</span>
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:bg-slate-100 rounded-full">
                                  <MoreVertical className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem className="cursor-pointer font-medium py-2" onSelect={() => openEditVehicle(vehicle)}>
                                  <Edit className="h-4 w-4 mr-3 text-slate-400" /> Edit Vehicle Info
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer font-medium py-2" onSelect={() => setActiveTab("history")}>
                                  <Wrench className="h-4 w-4 mr-3 text-slate-400" /> View History
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer font-medium py-2 text-theme" onSelect={() => onNavigate ? onNavigate("job-cards") : toast.info("Job Cards")}>
                                  <Plus className="h-4 w-4 mr-3" /> Create Job Card
                                </DropdownMenuItem>
                                <Separator className="my-1" />
                                <DropdownMenuItem className="cursor-pointer font-medium py-2 text-red-600" onSelect={() => window.confirm("Delete this vehicle?") && toast.success("Vehicle removed.")}>
                                  <Trash2 className="h-4 w-4 mr-3" /> Delete Vehicle
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-all">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mileage</p>
                              <p className="text-sm font-bold text-slate-700">—</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Visit</p>
                              <p className="text-sm font-bold text-slate-700">28 Oct 24</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vehicle ID</p>
                              <p className="text-sm font-bold text-slate-700">{vehicle.id}</p>
                            </div>
                          </div>
                          
                          <div className="mt-6 flex items-center justify-between gap-3">
                            <Button variant="outline" className="flex-1 h-9 text-xs font-bold border-slate-200 hover:bg-slate-50" onClick={() => setActiveTab("history")}>
                              Service History
                            </Button>
                            <Button className="flex-1 h-9 text-xs font-bold bg-theme hover:bg-theme-dark" onClick={handleNewService}>
                              New Service
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {!vehiclesLoading && customerVehicles.length === 0 && (
                      <div className="col-span-full">
                        <Card className="p-10 border-2 border-dashed border-slate-200 text-center">
                          <Car className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                          <p className="font-semibold text-slate-900">No vehicles yet</p>
                          <p className="text-sm text-slate-500 mt-1">Add a vehicle to link it with this customer.</p>
                        </Card>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Service History Tab */}
              <TabsContent
                value="history"
                className="mt-0 flex-1 min-h-0 overflow-y-auto data-[state=inactive]:hidden scrollbar-thin rounded-b-lg"
              >
                <div className="p-4 lg:p-6 min-h-full">
                  <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 lg:p-6 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <Wrench className="h-5 w-5 text-theme" />
                            Service History
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">
                            Complete history of all services and jobs for this customer
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => toast.info("Exporting PDF…")}>
                            <Download className="h-3.5 w-3.5 mr-1.5" />
                            Export PDF
                          </Button>
                          <Button size="sm" className="bg-theme hover:bg-theme-dark text-xs h-8" onClick={() => onNavigate ? onNavigate("job-cards") : toast.info("Job Cards")}>
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            New Job
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto scrollbar-thin">
                      <Table>
                        <TableHeader className="bg-slate-50/80">
                          <TableRow className="hover:bg-transparent border-b border-slate-200">
                            <TableHead className="w-[110px] py-4 font-semibold text-slate-700">Job ID</TableHead>
                            <TableHead className="w-[120px] font-semibold text-slate-700">Date</TableHead>
                            <TableHead className="min-w-[200px] font-semibold text-slate-700">Service Details</TableHead>
                            <TableHead className="min-w-[180px] font-semibold text-slate-700">Vehicle</TableHead>
                            <TableHead className="min-w-[180px] font-semibold text-slate-700">Inventory Used</TableHead>
                            <TableHead className="w-[150px] font-semibold text-slate-700 text-right">Total Amount</TableHead>
                            <TableHead className="w-[120px] font-semibold text-slate-700 text-center">Status</TableHead>
                            <TableHead className="w-[80px] font-semibold text-slate-700 text-right"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {details.serviceHistory.length > 0 ? (
                            details.serviceHistory.map((service, index) => (
                              <TableRow 
                                key={service.id}
                                className="group hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0"
                              >
                                <TableCell className="font-mono text-xs font-bold text-theme">
                                  JOB-{service.id}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-900">{formatDisplayDate(service.date)}</span>
                                    <span className="text-[10px] text-slate-500 uppercase font-semibold">10:30 AM</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1.5">
                                    <div className="text-sm font-semibold text-slate-800">{service.service}</div>
                                    <div className="flex flex-wrap gap-1">
                                      {service.parts.split(', ').map((part, i) => (
                                        <Badge key={i} variant="outline" className="text-[10px] py-0 h-4 bg-white border-slate-200 text-slate-600 font-normal">
                                          {part}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200">
                                      <Car className="h-4 w-4 text-slate-500" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-slate-900 truncate">{service.vehicle}</p>
                                      <p className="text-[11px] text-slate-500">ISB-1234 • Silver</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                                      <div className="w-1.5 h-1.5 rounded-full bg-theme"></div>
                                      <span className="font-medium">Oil:</span> {service.oilUsed}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex -space-x-1">
                                        {[1, 2].map(i => (
                                          <div key={i} className="w-5 h-5 rounded-full border border-white bg-slate-200 flex items-center justify-center">
                                            <User className="h-2.5 w-2.5 text-slate-500" />
                                          </div>
                                        ))}
                                      </div>
                                      <span className="text-[10px] text-slate-500 font-medium">Tech: {service.technician}</span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="text-sm font-bold text-slate-900">
                                    ₨{service.total.toLocaleString()}
                                  </div>
                                  <div className="text-[10px] text-green-600 font-semibold uppercase">Paid • Cash</div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex justify-center">
                                    <Badge 
                                      className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${getStatusColor(service.status)}`}
                                    >
                                      <span className="mr-1">{getStatusIcon(service.status)}</span>
                                      {service.status}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                      <DropdownMenuItem
                                        className="text-xs cursor-pointer"
                                        onSelect={() => {
                                          if (onNavigate) onNavigate("job-cards");
                                          else toast.info("Job Cards");
                                        }}
                                      >
                                        <Eye className="h-3.5 w-3.5 mr-2" /> View Full Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-xs cursor-pointer text-theme"
                                        onSelect={() => {
                                          if (onNavigate) onNavigate("invoices");
                                          else toast.info("Invoices");
                                        }}
                                      >
                                        <FileText className="h-3.5 w-3.5 mr-2" /> Download Invoice
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-xs cursor-pointer"
                                        onSelect={() => {
                                          if (onNavigate) onNavigate("job-cards");
                                          else toast.info("Job Cards");
                                        }}
                                      >
                                        <Edit className="h-3.5 w-3.5 mr-2" /> Edit Records
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={8} className="h-64 text-center">
                                <div className="flex flex-col items-center justify-center space-y-3">
                                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Wrench className="h-6 w-6 text-slate-300" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-900">No Service History</p>
                                    <p className="text-sm text-slate-500">This customer hasn't had any services recorded yet.</p>
                                  </div>
                                  <Button size="sm" className="bg-theme hover:bg-theme-dark mt-2" onClick={handleNewService}>
                                    Record First Service
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Notes & Interactions Tab */}
              <TabsContent
                value="notes"
                className="mt-0 flex-1 min-h-0 overflow-y-auto data-[state=inactive]:hidden scrollbar-thin rounded-b-lg"
              >
                <div className="p-6 space-y-6 min-h-full">
                  {/* Add New Note */}
                  <Card className="p-6">
                    <h3 className="font-medium mb-4">Add New Note</h3>
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Add a note, interaction log, or comment about this customer..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleAddNote}
                          className="bg-theme hover:bg-theme-dark"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Add Note
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Interaction History */}
                  <Card className="p-6">
                    <h3 className="font-medium mb-4">Interaction History</h3>
                    <div className="space-y-4">
                      {details.interactions.map((interaction) => (
                        <div
                          key={interaction.id}
                          className="border-l-2 border-theme-200 pl-4 py-2"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {interaction.type}
                              </Badge>
                              <span className="text-sm text-slate-600">
                                {interaction.author}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500">
                              {formatDisplayDate(interaction.date)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700">
                            {interaction.content}
                          </p>
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

      {/* Edit Vehicle Dialog */}
      <Dialog open={!!editingVehicle} onOpenChange={(open) => !open && setEditingVehicle(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-carMake">Make</Label>
                <Input
                  id="edit-carMake"
                  value={editVehicleForm.carMake}
                  onChange={(e) => setEditVehicleForm((p) => ({ ...p, carMake: e.target.value }))}
                  placeholder="e.g. Toyota"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-carModel">Model</Label>
                <Input
                  id="edit-carModel"
                  value={editVehicleForm.carModel}
                  onChange={(e) => setEditVehicleForm((p) => ({ ...p, carModel: e.target.value }))}
                  placeholder="e.g. Corolla"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-carYear">Year</Label>
                <Input
                  id="edit-carYear"
                  value={editVehicleForm.carYear}
                  onChange={(e) => setEditVehicleForm((p) => ({ ...p, carYear: e.target.value }))}
                  placeholder="e.g. 2021"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-vehicleNumber">Plate / Number</Label>
                <Input
                  id="edit-vehicleNumber"
                  value={editVehicleForm.vehicleNumber}
                  onChange={(e) => setEditVehicleForm((p) => ({ ...p, vehicleNumber: e.target.value }))}
                  placeholder="e.g. ISB-1234"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVehicle(null)} disabled={savingVehicle}>
              Cancel
            </Button>
            <Button className="bg-theme hover:bg-theme-dark" onClick={handleSaveVehicle} disabled={savingVehicle}>
              {savingVehicle ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
