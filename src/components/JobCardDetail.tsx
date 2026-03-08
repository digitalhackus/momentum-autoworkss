import { useState } from "react";
import { formatDisplayDate } from "../utils/dateFormat";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  User,
  Car,
  Wrench,
  Calendar,
  Clock,
  MessageSquare,
  Paperclip,
  Image as ImageIcon,
  Check,
  X,
  Send,
  Edit2,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  FileText,
  Download,
  Trash2,
  Users,
  Receipt,
  Shield,
  Settings,
  CircleDot,
  Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface JobCardDetailProps {
  jobCard?: any;
  onClose?: () => void;
  onSave?: (data: any) => void;
  userRole?: "Admin" | "Supervisor" | "Technician";
}

// Mock data
const mockCustomers = [
  { id: "CUST-001", name: "John Smith", phone: "+92 300 1234567", email: "john@email.com" },
  { id: "CUST-002", name: "Sarah Johnson", phone: "+92 321 2345678", email: "sarah@email.com" },
  { id: "CUST-003", name: "Mike Wilson", phone: "+92 333 3456789", email: "mike@email.com" },
];

const mockVehicles = [
  { id: "VEH-001", customerId: "CUST-001", make: "Toyota", model: "Camry", year: "2021", plate: "ABC-1234" },
  { id: "VEH-002", customerId: "CUST-002", make: "Honda", model: "Civic", year: "2020", plate: "XYZ-5678" },
  { id: "VEH-003", customerId: "CUST-003", make: "Ford", model: "F-150", year: "2022", plate: "DEF-9012" },
];

const mockTechnicians = [
  { id: "TECH-001", name: "Mike Thompson", initials: "MT", role: "Technician" },
  { id: "TECH-002", name: "Chris Rodriguez", initials: "CR", role: "Technician" },
  { id: "TECH-003", name: "David Lee", initials: "DL", role: "Technician" },
  { id: "TECH-004", name: "Alex Khan", initials: "AK", role: "Technician" },
];

const mockSupervisors = [
  { id: "SUP-001", name: "Robert Anderson", initials: "RA", role: "Supervisor" },
  { id: "SUP-002", name: "Jennifer Martinez", initials: "JM", role: "Supervisor" },
];

const mockServices = [
  { id: "1", name: "Oil Change", estimatedCost: 3500, estimatedTime: "30 min" },
  { id: "2", name: "Brake Inspection", estimatedCost: 2500, estimatedTime: "45 min" },
  { id: "3", name: "Tire Rotation", estimatedCost: 2000, estimatedTime: "30 min" },
  { id: "4", name: "Engine Diagnostics", estimatedCost: 5000, estimatedTime: "2 hours" },
  { id: "5", name: "AC Service", estimatedCost: 4500, estimatedTime: "1.5 hours" },
  { id: "6", name: "Transmission Service", estimatedCost: 8000, estimatedTime: "3 hours" },
];

export function JobCardDetail({ jobCard, onClose, onSave, userRole = "Admin" }: JobCardDetailProps) {
  const isNewJobCard = !jobCard;
  
  // Form state
  const [jobId, setJobId] = useState(jobCard?.id || "");
  const [status, setStatus] = useState(jobCard?.status || "Pending");
  const [selectedCustomerId, setSelectedCustomerId] = useState(jobCard?.customerId || "");
  const [selectedVehicleId, setSelectedVehicleId] = useState(jobCard?.vehicleId || "");
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(jobCard?.technicianId || "");
  const [selectedSupervisorId, setSelectedSupervisorId] = useState(jobCard?.supervisorId || "");
  const [selectedServices, setSelectedServices] = useState<any[]>(jobCard?.services || []);
  const [customService, setCustomService] = useState({ name: "", cost: "", time: "" });
  const [showCustomService, setShowCustomService] = useState(false);
  
  // Comments/Activity Feed
  const [comments, setComments] = useState<any[]>(jobCard?.comments || [
    {
      id: "1",
      author: "Mike Thompson",
      authorInitials: "MT",
      role: "Technician",
      text: "Vehicle received. Starting diagnostics on engine.",
      timestamp: "10:30 AM",
      date: "Nov 5, 2025",
      attachments: []
    },
    {
      id: "2",
      author: "Robert Anderson",
      authorInitials: "RA",
      role: "Supervisor",
      text: "Please also check the brake pads during inspection.",
      timestamp: "11:15 AM",
      date: "Nov 5, 2025",
      attachments: []
    },
    {
      id: "3",
      author: "Mike Thompson",
      authorInitials: "MT",
      role: "Technician",
      text: "Diagnostics complete. Found issue with oxygen sensor. Uploading photos.",
      timestamp: "2:45 PM",
      date: "Nov 5, 2025",
      attachments: [
        { id: "a1", name: "engine-sensor.jpg", type: "image" }
      ]
    }
  ]);
  const [newComment, setNewComment] = useState("");
  const [commentAttachments, setCommentAttachments] = useState<File[]>([]);
  
  // File uploads for job photos
  const [uploadedFiles, setUploadedFiles] = useState<any[]>(jobCard?.files || []);
  
  // Collapsible sections
  const [sectionsOpen, setSectionsOpen] = useState({
    customer: true,
    vehicle: true,
    staff: true,
    services: true,
    photos: true,
  });

  const selectedCustomer = mockCustomers.find(c => c.id === selectedCustomerId);
  const customerVehicles = mockVehicles.filter(v => v.customerId === selectedCustomerId);
  const selectedVehicle = mockVehicles.find(v => v.id === selectedVehicleId);
  const selectedTechnician = mockTechnicians.find(t => t.id === selectedTechnicianId);
  const selectedSupervisor = mockSupervisors.find(s => s.id === selectedSupervisorId);

  const totalCost = selectedServices.reduce((sum, service) => sum + service.estimatedCost, 0);
  const completedTasks = selectedServices.filter(s => s.completed).length;
  const progress = selectedServices.length > 0 ? (completedTasks / selectedServices.length) * 100 : 0;

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddService = (service: typeof mockServices[0]) => {
    const newService = {
      ...service,
      id: `service-${Date.now()}`,
      completed: false,
    };
    setSelectedServices([...selectedServices, newService]);
  };

  const handleAddCustomService = () => {
    if (!customService.name || !customService.cost) return;
    
    const newService = {
      id: `custom-${Date.now()}`,
      name: customService.name,
      estimatedCost: parseFloat(customService.cost),
      estimatedTime: customService.time || "N/A",
      completed: false,
    };
    setSelectedServices([...selectedServices, newService]);
    setCustomService({ name: "", cost: "", time: "" });
    setShowCustomService(false);
  };

  const toggleServiceComplete = (serviceId: string) => {
    // Technicians can mark subtasks, Supervisors and Admins can do everything
    if (userRole === "Technician" || userRole === "Supervisor" || userRole === "Admin") {
      setSelectedServices(selectedServices.map(s => 
        s.id === serviceId ? { ...s, completed: !s.completed } : s
      ));
    }
  };

  const handleRemoveService = (serviceId: string) => {
    if (userRole === "Admin" || userRole === "Supervisor") {
      setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const currentUser = userRole === "Admin" ? "Admin User" : 
                       userRole === "Supervisor" ? selectedSupervisor?.name || "Supervisor User" : 
                       selectedTechnician?.name || "Technician User";
    
    const initials = userRole === "Admin" ? "AU" : 
                    userRole === "Supervisor" ? selectedSupervisor?.initials || "SU" : 
                    selectedTechnician?.initials || "TU";

    const comment = {
      id: Date.now().toString(),
      author: currentUser,
      authorInitials: initials,
      role: userRole,
      text: newComment,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      attachments: commentAttachments.map((file, idx) => ({
        id: `${Date.now()}-${idx}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file'
      }))
    };

    setComments([...comments, comment]);
    setNewComment("");
    setCommentAttachments([]);
  };

  const handleCommentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setCommentAttachments([...commentAttachments, ...Array.from(files)]);
    }
  };

  const handleJobPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedBy: userRole,
      uploadedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }));

    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const handleMarkComplete = () => {
    if (userRole === "Supervisor" || userRole === "Admin") {
      setStatus("Completed");
      alert("Job marked as complete!");
    }
  };

  const handleGenerateInvoice = () => {
    if (userRole === "Supervisor" || userRole === "Admin") {
      alert("Redirecting to invoice generation...");
      // In real app: navigate to invoice creation with pre-filled data
    }
  };

  const handleCloseJob = () => {
    if (userRole === "Supervisor" || userRole === "Admin") {
      alert("Job closed successfully!");
      onClose?.();
    }
  };

  const handleSave = () => {
    const jobCardData = {
      id: jobId || `${Date.now().toString().slice(-3)}`,
      customerId: selectedCustomerId,
      vehicleId: selectedVehicleId,
      technicianId: selectedTechnicianId,
      supervisorId: selectedSupervisorId,
      services: selectedServices,
      comments,
      files: uploadedFiles,
      status,
      totalCost,
      progress,
      createdAt: jobCard?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave?.(jobCardData);
    onClose?.();
  };

  const canEdit = userRole === "Admin" || userRole === "Supervisor";
  const canComplete = (userRole === "Supervisor" || userRole === "Admin") && progress === 100;
  const canAddComments = true; // All roles can add comments
  const canMarkSubtasks = true; // All roles can mark subtasks

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Supervisor":
        return "bg-theme-100 text-theme border-theme-200";
      case "Technician":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="h-full overflow-hidden flex flex-col bg-slate-50">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b shrink-0 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          {onClose && (
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-slate-700" />
            </button>
          )}
          <div className="w-11 h-11 rounded-xl bg-theme flex items-center justify-center shadow-md shadow-theme/20">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-slate-900">
              {isNewJobCard ? "Create Job Card" : `JOB-${jobId.toString().padStart(3, '0')}`}
            </h2>
            <p className="text-sm text-slate-500">
              {isNewJobCard ? "Create a new service job card" : `Created ${jobCard?.createdAt ? new Date(jobCard.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "today"}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            className={
              status === "Pending" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
              status === "In Progress" ? "bg-theme-100 text-theme border-theme-200" :
              "bg-green-100 text-green-700 border-green-200"
            }
          >
            <CircleDot className="h-3 w-3 mr-1.5" />
            {status}
          </Badge>
          {progress > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-theme transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-slate-600 font-medium">{Math.round(progress)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Split Panel */}
      <div className="flex-1 overflow-hidden flex">
        {/* LEFT SIDE - Job Summary */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4 max-w-4xl">
            {/* Job Title Section */}
            <div>
              <Label className="text-xs text-slate-500 uppercase tracking-wider mb-2">Job Summary</Label>
              <Input
                value={selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model} - ${selectedVehicle.plate}` : "Select vehicle to begin"}
                readOnly
                className="text-lg h-12 bg-white border-slate-200"
                placeholder="Job title will appear here"
              />
            </div>

            {/* Customer Section */}
            <Collapsible open={sectionsOpen.customer} onOpenChange={() => toggleSection("customer")}>
              <Card className="border-slate-200 shadow-sm">
                <CollapsibleTrigger asChild>
                  <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-theme-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-theme" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm mb-0.5">Customer</h3>
                        {selectedCustomer && (
                          <p className="text-xs text-slate-500">{selectedCustomer.name}</p>
                        )}
                      </div>
                    </div>
                    {sectionsOpen.customer ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Separator />
                  <div className="p-4 space-y-3">
                    <div>
                      <Label className="text-xs text-slate-500 mb-2">Select Customer</Label>
                      <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId} disabled={!canEdit}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose customer..." />
                        </SelectTrigger>
                        <SelectContent>
                          {mockCustomers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedCustomer && (
                      <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{selectedCustomer.name}</p>
                            <p className="text-xs text-slate-500 mt-1">{selectedCustomer.phone}</p>
                            <p className="text-xs text-slate-500">{selectedCustomer.email}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">{selectedCustomer.id}</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Vehicle Section */}
            <Collapsible open={sectionsOpen.vehicle} onOpenChange={() => toggleSection("vehicle")}>
              <Card className="border-slate-200 shadow-sm">
                <CollapsibleTrigger asChild>
                  <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Car className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm mb-0.5">Vehicle</h3>
                        {selectedVehicle && (
                          <p className="text-xs text-slate-500">
                            {selectedVehicle.make} {selectedVehicle.model} • {selectedVehicle.plate}
                          </p>
                        )}
                      </div>
                    </div>
                    {sectionsOpen.vehicle ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Separator />
                  <div className="p-4 space-y-3">
                    <div>
                      <Label className="text-xs text-slate-500 mb-2">Select Vehicle</Label>
                      <Select 
                        value={selectedVehicleId} 
                        onValueChange={setSelectedVehicleId}
                        disabled={!selectedCustomerId || !canEdit}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose vehicle..." />
                        </SelectTrigger>
                        <SelectContent>
                          {customerVehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.make} {vehicle.model} {vehicle.year} - {vehicle.plate}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedVehicle && (
                      <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-slate-500">Make & Model</p>
                            <p className="text-sm font-medium text-slate-900">
                              {selectedVehicle.make} {selectedVehicle.model}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Year</p>
                            <p className="text-sm font-medium text-slate-900">{selectedVehicle.year}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-slate-500">License Plate</p>
                            <p className="text-sm font-medium text-slate-900">{selectedVehicle.plate}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Assigned Staff Section */}
            <Collapsible open={sectionsOpen.staff} onOpenChange={() => toggleSection("staff")}>
              <Card className="border-slate-200 shadow-sm">
                <CollapsibleTrigger asChild>
                  <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm mb-0.5">Assigned Staff</h3>
                        {(selectedTechnician || selectedSupervisor) && (
                          <p className="text-xs text-slate-500">
                            {selectedTechnician?.name}
                            {selectedTechnician && selectedSupervisor && " • "}
                            {selectedSupervisor?.name}
                          </p>
                        )}
                      </div>
                    </div>
                    {sectionsOpen.staff ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Separator />
                  <div className="p-4 space-y-3">
                    <div>
                      <Label className="text-xs text-slate-500 mb-2">Assigned Technician</Label>
                      <Select value={selectedTechnicianId} onValueChange={setSelectedTechnicianId} disabled={!canEdit}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select technician..." />
                        </SelectTrigger>
                        <SelectContent>
                          {mockTechnicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.id}>
                              {tech.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500 mb-2">Supervisor</Label>
                      <Select value={selectedSupervisorId} onValueChange={setSelectedSupervisorId} disabled={!canEdit}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supervisor..." />
                        </SelectTrigger>
                        <SelectContent>
                          {mockSupervisors.map((sup) => (
                            <SelectItem key={sup.id} value={sup.id}>
                              {sup.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {(selectedTechnician || selectedSupervisor) && (
                      <div className="flex gap-2">
                        {selectedTechnician && (
                          <div className="flex-1 p-3 border border-slate-200 rounded-lg bg-slate-50">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-green-600 text-white text-xs">
                                  {selectedTechnician.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-medium text-slate-900">{selectedTechnician.name}</p>
                                <p className="text-xs text-slate-500">Technician</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {selectedSupervisor && (
                          <div className="flex-1 p-3 border border-slate-200 rounded-lg bg-slate-50">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-theme text-white text-xs">
                                  {selectedSupervisor.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-medium text-slate-900">{selectedSupervisor.name}</p>
                                <p className="text-xs text-slate-500">Supervisor</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Service Items - Subtask Checklist */}
            <Collapsible open={sectionsOpen.services} onOpenChange={() => toggleSection("services")}>
              <Card className="border-slate-200 shadow-sm">
                <CollapsibleTrigger asChild>
                  <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Wrench className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm mb-0.5">Service Items</h3>
                        <p className="text-xs text-slate-500">
                          {completedTasks}/{selectedServices.length} completed • ₨{totalCost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {sectionsOpen.services ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Separator />
                  <div className="p-4 space-y-3">
                    {/* Service Catalog - Only for Admins/Supervisors */}
                    {canEdit && (
                      <>
                        <div>
                          <Label className="text-xs text-slate-500 mb-2">Add from Catalog</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {mockServices.map((service) => (
                              <button
                                key={service.id}
                                onClick={() => handleAddService(service)}
                                className="p-3 border border-slate-200 rounded-lg hover:border-theme-300 hover:bg-theme-50 transition-all text-left"
                              >
                                <p className="text-xs font-medium text-slate-900">{service.name}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                  ₨{service.estimatedCost.toLocaleString()} • {service.estimatedTime}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Service */}
                        {!showCustomService ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCustomService(true)}
                            className="w-full border-dashed"
                          >
                            + Add Custom Service
                          </Button>
                        ) : (
                          <div className="p-3 border border-slate-200 rounded-lg space-y-2">
                            <Input
                              placeholder="Service name"
                              value={customService.name}
                              onChange={(e) => setCustomService({ ...customService, name: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                type="number"
                                placeholder="Cost (₨)"
                                value={customService.cost}
                                onChange={(e) => setCustomService({ ...customService, cost: e.target.value })}
                              />
                              <Input
                                placeholder="Time"
                                value={customService.time}
                                onChange={(e) => setCustomService({ ...customService, time: e.target.value })}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleAddCustomService} className="flex-1">
                                Add
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setShowCustomService(false)} className="flex-1">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Subtask Checklist */}
                    {selectedServices.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Service Checklist</Label>
                        {selectedServices.map((service) => (
                          <div
                            key={service.id}
                            className={`group p-3 border rounded-lg transition-all ${
                              service.completed 
                                ? 'border-green-200 bg-green-50' 
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={service.completed}
                                onCheckedChange={() => toggleServiceComplete(service.id)}
                                disabled={!canMarkSubtasks}
                                className="mt-0.5"
                              />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${service.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                  {service.name}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-slate-500">₨{service.estimatedCost.toLocaleString()}</span>
                                  <span className="text-xs text-slate-400">•</span>
                                  <span className="text-xs text-slate-500">{service.estimatedTime}</span>
                                </div>
                              </div>
                              {canEdit && (
                                <button
                                  onClick={() => handleRemoveService(service.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                                >
                                  <X className="h-4 w-4 text-red-600" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Total */}
                    {selectedServices.length > 0 && (
                      <div className="p-3 border border-theme-200 rounded-lg bg-theme-50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-700">Estimated Total</span>
                          <span className="text-lg font-medium text-theme">₨{totalCost.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Job Photos Section */}
            <Collapsible open={sectionsOpen.photos} onOpenChange={() => toggleSection("photos")}>
              <Card className="border-slate-200 shadow-sm">
                <CollapsibleTrigger asChild>
                  <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-pink-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm mb-0.5">Before/After Photos</h3>
                        <p className="text-xs text-slate-500">{uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded</p>
                      </div>
                    </div>
                    {sectionsOpen.photos ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Separator />
                  <div className="p-4 space-y-3">
                    <div>
                      <label htmlFor="job-photo-upload" className="block">
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-theme-300 hover:bg-theme-50 transition-all cursor-pointer">
                          <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-600">Click to upload photos</p>
                          <p className="text-xs text-slate-400 mt-1">Before/After, damage, repair progress</p>
                        </div>
                        <input
                          id="job-photo-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleJobPhotoUpload}
                        />
                      </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {uploadedFiles.map((file) => (
                          <div key={file.id} className="relative aspect-video border border-slate-200 rounded-lg overflow-hidden bg-slate-50 group">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-slate-400" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                              <p className="text-xs text-white truncate">{file.name}</p>
                              <p className="text-xs text-white/70">{file.uploadedBy} • {file.uploadedAt}</p>
                            </div>
                            <button className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded opacity-0 group-hover:opacity-100 transition-all">
                              <Download className="h-3 w-3 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {canComplete && (
                <Button 
                  onClick={handleMarkComplete}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              )}
              {canEdit && (
                <Button 
                  onClick={handleGenerateInvoice}
                  variant="outline"
                  className="flex-1 border-theme-300 text-theme hover:bg-theme-50"
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Generate Invoice
                </Button>
              )}
              {canEdit && (
                <Button 
                  onClick={handleCloseJob}
                  variant="outline"
                  className="border-slate-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  Close Job
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Activity Feed / Comments Timeline */}
        <div className="w-96 border-l border-slate-200 bg-white flex flex-col shadow-lg">
          {/* Timeline Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-slate-600" />
              <h3 className="font-medium text-slate-900">Activity Timeline</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">{comments.length} comment{comments.length !== 1 ? 's' : ''}</p>
          </div>

          {/* Comments/Activity Feed */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              <AnimatePresence>
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    {/* Timeline Connector */}
                    {index < comments.length - 1 && (
                      <div className="absolute left-4 top-12 bottom-0 w-px bg-slate-200" />
                    )}
                    
                    <div className="flex gap-3">
                      {/* Avatar */}
                      <Avatar className="w-8 h-8 shrink-0 ring-2 ring-white">
                        <AvatarFallback className={
                          comment.role === "Admin" ? "bg-purple-600 text-white" :
                          comment.role === "Supervisor" ? "bg-theme text-white" :
                          "bg-green-600 text-white"
                        }>
                          {comment.authorInitials}
                        </AvatarFallback>
                      </Avatar>

                      {/* Comment Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-slate-900">{comment.author}</p>
                          <Badge className={`text-xs ${getRoleBadgeColor(comment.role)}`}>
                            {comment.role}
                          </Badge>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-1">
                          <p className="text-sm text-slate-700 leading-relaxed">{comment.text}</p>
                        </div>
                        
                        {/* Attachments */}
                        {comment.attachments && comment.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {comment.attachments.map((attachment: any) => (
                              <div key={attachment.id} className="flex items-center gap-2 p-2 bg-theme-50 border border-theme-200 rounded text-xs">
                                {attachment.type === 'image' ? (
                                  <ImageIcon className="h-4 w-4 text-theme" />
                                ) : (
                                  <Paperclip className="h-4 w-4 text-theme" />
                                )}
                                <span className="text-theme flex-1 truncate">{attachment.name}</span>
                                <Download className="h-3 w-3 text-theme cursor-pointer" />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <p className="text-xs text-slate-500">{formatDisplayDate(comment.date)} at {comment.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>

          {/* Comment Input */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
            {/* Attachment Preview */}
            {commentAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {commentAttachments.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-2 py-1 bg-theme-100 rounded text-xs">
                    <Paperclip className="h-3 w-3 text-theme" />
                    <span className="text-theme max-w-[150px] truncate">{file.name}</span>
                    <button onClick={() => setCommentAttachments(commentAttachments.filter((_, i) => i !== idx))}>
                      <X className="h-3 w-3 text-theme" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="flex gap-2">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className={
                  userRole === "Admin" ? "bg-purple-600 text-white" :
                  userRole === "Supervisor" ? "bg-theme text-white" :
                  "bg-green-600 text-white"
                }>
                  {userRole === "Admin" ? "AU" : userRole === "Supervisor" ? selectedSupervisor?.initials || "SU" : selectedTechnician?.initials || "TU"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none bg-white border-slate-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleAddComment();
                    }
                  }}
                />
                <div className="flex items-center justify-between mt-2">
                  <label htmlFor="comment-file-upload">
                    <input
                      id="comment-file-upload"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleCommentFileUpload}
                    />
                    <Button variant="ghost" size="sm" className="text-slate-600" type="button" asChild>
                      <span>
                        <Paperclip className="h-4 w-4" />
                      </span>
                    </Button>
                  </label>
                  <Button 
                    size="sm" 
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="bg-theme hover:bg-theme-dark"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Send
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-1">Press Ctrl+Enter to send</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
