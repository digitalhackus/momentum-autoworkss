import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { Separator } from "./ui/separator";
import { 
  Car, 
  Search, 
  Filter, 
  Plus,
  Calendar,
  Wrench,
  Droplet,
  Gauge,
  User,
  ArrowRight,
  UserPlus,
  Mail,
  Phone,
  Upload,
  X,
  ImageIcon,
  AlertCircle
} from "lucide-react";
import { motion } from "motion/react";
import { VehicleProfile } from "./VehicleProfile";

const vehicles = [
  {
    id: "VEH-001",
    make: "Toyota",
    model: "Camry",
    year: "2021",
    plate: "ABC-1234",
    owner: "John Smith",
    ownerId: "CUST-001",
    mileage: "45,230 km",
    lastService: "2024-10-15",
    nextService: "2025-01-15",
    oilType: "5W-30 Synthetic",
    serviceHistory: 8,
    status: "Active"
  },
  {
    id: "VEH-002",
    make: "Honda",
    model: "Civic",
    year: "2020",
    plate: "XYZ-5678",
    owner: "Sarah Johnson",
    ownerId: "CUST-002",
    mileage: "62,450 km",
    lastService: "2024-10-20",
    nextService: "2025-01-20",
    oilType: "0W-20 Synthetic",
    serviceHistory: 12,
    status: "Active"
  },
  {
    id: "VEH-003",
    make: "Ford",
    model: "F-150",
    year: "2022",
    plate: "DEF-9012",
    owner: "Mike Wilson",
    ownerId: "CUST-003",
    mileage: "28,900 km",
    lastService: "2024-09-10",
    nextService: "2024-12-10",
    oilType: "5W-20 Conventional",
    serviceHistory: 5,
    status: "Due"
  },
  {
    id: "VEH-004",
    make: "Tesla",
    model: "Model 3",
    year: "2023",
    plate: "GHI-3456",
    owner: "Emily Davis",
    ownerId: "CUST-004",
    mileage: "15,600 km",
    lastService: "2024-10-25",
    nextService: "2025-04-25",
    oilType: "N/A (Electric)",
    serviceHistory: 3,
    status: "Active"
  },
  {
    id: "VEH-005",
    make: "BMW",
    model: "X5",
    year: "2021",
    plate: "JKL-7890",
    owner: "Robert Brown",
    ownerId: "CUST-005",
    mileage: "55,780 km",
    lastService: "2024-08-30",
    nextService: "2024-11-30",
    oilType: "5W-30 Full Synthetic",
    serviceHistory: 10,
    status: "Overdue"
  },
];

// Mock customer data for search
const mockCustomers = [
  { id: "CUST-001", name: "John Smith", email: "john.smith@email.com", phone: "(555) 123-4567" },
  { id: "CUST-002", name: "Sarah Johnson", email: "sarah.j@email.com", phone: "(555) 234-5678" },
  { id: "CUST-003", name: "Mike Wilson", email: "mike.wilson@email.com", phone: "(555) 345-6789" },
  { id: "CUST-004", name: "Emily Davis", email: "emily.davis@email.com", phone: "(555) 456-7890" },
  { id: "CUST-005", name: "Robert Brown", email: "robert.brown@email.com", phone: "(555) 567-8901" },
];

export function Vehicles() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [step, setStep] = useState<"customer" | "newCustomer" | "vehicle">("customer");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<typeof mockCustomers[0] | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<typeof vehicles[0] | null>(null);
  const [vehicleImage, setVehicleImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showOwnerAlert, setShowOwnerAlert] = useState(false);

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch) ||
    customer.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleCustomerSelect = (customer: typeof mockCustomers[0]) => {
    setSelectedCustomer(customer);
    setStep("vehicle");
  };

  const handleAddNewCustomer = () => {
    setStep("newCustomer");
  };

  const handleBackToCustomerSearch = () => {
    setStep("customer");
  };

  const handleNewCustomerComplete = () => {
    setStep("vehicle");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVehicleImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVehicleImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setVehicleImage(null);
  };

  const handleCloseDialog = () => {
    setIsAddVehicleOpen(false);
    setTimeout(() => {
      setStep("customer");
      setCustomerSearch("");
      setSelectedCustomer(null);
      setVehicleImage(null);
      setShowOwnerAlert(false);
    }, 200);
  };

  const handleVehicleClick = (vehicle: typeof vehicles[0]) => {
    setSelectedVehicle(vehicle);
  };

  const handleCloseVehicleProfile = () => {
    setSelectedVehicle(null);
  };

  // If a vehicle is selected, show the VehicleProfile
  if (selectedVehicle) {
    return (
      <VehicleProfile
        vehicle={{
          id: selectedVehicle.id,
          make: selectedVehicle.make,
          model: selectedVehicle.model,
          year: selectedVehicle.year,
          plate: selectedVehicle.plate,
          ownerId: selectedVehicle.ownerId,
          ownerName: selectedVehicle.owner,
        }}
        onClose={handleCloseVehicleProfile}
        onEdit={() => console.log("Edit vehicle")}
        onDelete={() => console.log("Delete vehicle")}
        onViewOwner={(ownerId) => console.log("View owner:", ownerId)}
        onCreateJobCard={() => console.log("Create job card")}
        onCreateInvoice={() => console.log("Create invoice")}
      />
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl mb-1 lg:mb-2">Vehicles & Service History</h1>
          <p className="text-sm lg:text-base text-gray-600">Track all registered vehicles and their service records</p>
        </div>
        <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
          <DialogTrigger asChild>
            <Button className="bg-theme hover:bg-theme-dark w-full lg:w-auto" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {step === "customer" && "Select Customer"}
                {step === "newCustomer" && "Add New Customer"}
                {step === "vehicle" && "Add Vehicle"}
              </DialogTitle>
              <DialogDescription>
                {step === "customer" && "Search for an existing customer or add a new one"}
                {step === "newCustomer" && "Enter customer details to create a new record"}
                {step === "vehicle" && `Adding vehicle for ${selectedCustomer?.name || "new customer"}`}
              </DialogDescription>
            </DialogHeader>

            {/* Step 1: Customer Selection */}
            {step === "customer" && (
              <div className="space-y-4 mt-4">
                {/* Info Alert */}
                <Alert className="border-theme-200 bg-theme-50">
                  <User className="h-4 w-4 text-theme" />
                  <AlertDescription className="text-theme-dark">
                    Select an existing customer or add a new one to continue
                  </AlertDescription>
                </Alert>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search customer by name, email, or phone..."
                    className="pl-10"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    autoFocus
                  />
                </div>

                {filteredCustomers.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="p-4 border rounded-lg hover:border-theme-300 hover:bg-theme-50/50 cursor-pointer transition-all group"
                        onClick={() => handleCustomerSelect(customer)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-theme-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-theme" />
                            </div>
                            <div>
                              <p className="font-medium group-hover:text-theme transition-colors">{customer.name}</p>
                              <div className="flex items-center gap-3 text-sm text-gray-600 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {customer.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {customer.phone}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-theme group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : customerSearch ? (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-2">No customers found</p>
                    <p className="text-xs text-gray-500">Try a different search or add a new customer</p>
                  </div>
                ) : null}

                <Separator />

                <Button
                  variant="outline"
                  className="w-full border-dashed border-2 h-12 hover:border-theme-300 hover:bg-theme-50"
                  onClick={handleAddNewCustomer}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Customer
                </Button>
              </div>
            )}

            {/* Step 2: New Customer Form */}
            {step === "newCustomer" && (
              <form className="space-y-6 mt-4">
                <div className="space-y-4">
                  <h4 className="text-sm">Customer Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="(555) 123-4567" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm">Address Information</h4>
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input id="street" placeholder="123 Main St" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="area">Area/Region</Label>
                      <Input id="area" placeholder="e.g., Soan Garden" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="e.g., Islamabad" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input id="state" placeholder="e.g., Punjab" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleBackToCustomerSearch}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={handleNewCustomerComplete}
                  >
                    Continue to Vehicle
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: Vehicle Form */}
            {step === "vehicle" && (
              <form className="space-y-6 mt-4">
                {/* Owner Alert if no customer selected */}
                {!selectedCustomer && showOwnerAlert && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-900">
                      Please select an owner for this vehicle or{" "}
                      <button
                        type="button"
                        onClick={handleAddNewCustomer}
                        className="font-medium underline hover:text-orange-700"
                      >
                        add a new customer
                      </button>
                      .
                    </AlertDescription>
                  </Alert>
                )}

                {/* Selected Owner Display */}
                {selectedCustomer && (
                  <div className="p-4 bg-theme-50 rounded-lg border border-theme-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-theme-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Vehicle Owner</p>
                          <p className="font-medium">{selectedCustomer.name}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleBackToCustomerSearch}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                )}

                {/* Vehicle Image Upload */}
                <div className="space-y-3">
                  <Label>Vehicle Image</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Image Preview */}
                    {vehicleImage ? (
                      <div className="relative aspect-video border-2 border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                        <img 
                          src={vehicleImage} 
                          alt="Vehicle preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-video border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50">
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">No image uploaded</p>
                        </div>
                      </div>
                    )}

                    {/* Upload Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
                        isDragging 
                          ? 'border-blue-400 bg-blue-50' 
                          : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      <label htmlFor="vehicle-image" className="cursor-pointer text-center p-4 w-full h-full flex flex-col items-center justify-center">
                        <Upload className="h-10 w-10 text-slate-400 mb-3" />
                        <p className="text-sm font-medium text-slate-700 mb-1">
                          {isDragging ? 'Drop image here' : 'Click to upload or drag & drop'}
                        </p>
                        <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                        <input
                          id="vehicle-image"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Basic Vehicle Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="make">Vehicle Make *</Label>
                      <Input id="make" placeholder="e.g., Toyota, Honda, BMW" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Vehicle Model *</Label>
                      <Input id="model" placeholder="e.g., Corolla, Civic, X5" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">Year *</Label>
                      <Input 
                        id="year" 
                        type="number" 
                        placeholder="2024" 
                        min="1900"
                        max="2025"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Vehicle Type *</Label>
                      <Select>
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedan">Sedan</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                          <SelectItem value="hatchback">Hatchback</SelectItem>
                          <SelectItem value="truck">Truck</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                          <SelectItem value="coupe">Coupe</SelectItem>
                          <SelectItem value="convertible">Convertible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="plate">License Plate *</Label>
                      <Input id="plate" placeholder="ABC-1234" required />
                    </div>
                  </div>
                </div>

                {/* Mileage & Service Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">Mileage & Service Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mileage">Current Mileage (km) *</Label>
                      <div className="relative">
                        <Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          id="mileage" 
                          type="number"
                          placeholder="45230" 
                          className="pl-10"
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="daily-mileage">Daily Mileage (km/day) *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          id="daily-mileage" 
                          type="number"
                          placeholder="50" 
                          className="pl-10"
                          required 
                        />
                      </div>
                      <p className="text-xs text-slate-500">Used to calculate service due dates</p>
                    </div>
                  </div>
                </div>

                {/* Fuel & Oil Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">Fuel & Oil Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fuel-type">Fuel Type *</Label>
                      <Select>
                        <SelectTrigger id="fuel-type">
                          <SelectValue placeholder="Select fuel type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="petrol">Petrol</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="electric">Electric</SelectItem>
                          <SelectItem value="cng">CNG</SelectItem>
                          <SelectItem value="lpg">LPG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oil-type">Oil Type *</Label>
                      <Select>
                        <SelectTrigger id="oil-type">
                          <SelectValue placeholder="Select oil type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5w30-synthetic">5W-30 Synthetic</SelectItem>
                          <SelectItem value="5w40-synthetic">5W-40 Synthetic</SelectItem>
                          <SelectItem value="10w30-synthetic">10W-30 Synthetic</SelectItem>
                          <SelectItem value="10w40-synthetic">10W-40 Synthetic</SelectItem>
                          <SelectItem value="0w20-synthetic">0W-20 Synthetic</SelectItem>
                          <SelectItem value="5w30-semi">5W-30 Semi-Synthetic</SelectItem>
                          <SelectItem value="10w40-mineral">10W-40 Mineral</SelectItem>
                          <SelectItem value="15w40-mineral">15W-40 Mineral</SelectItem>
                          <SelectItem value="na">N/A (Electric)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleBackToCustomerSearch}
                  >
                    Back to Owner
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-theme hover:bg-theme-dark"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!selectedCustomer) {
                        setShowOwnerAlert(true);
                        return;
                      }
                      // In a real app, save the vehicle and redirect to VehicleProfile
                      // For now, we'll just close the dialog
                      handleCloseDialog();
                      // TODO: Create the vehicle and navigate to VehicleProfile
                      console.log("Vehicle saved - should redirect to VehicleProfile");
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vehicle
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-theme">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Vehicles</p>
                  <p className="text-3xl">518</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Car className="h-6 w-6 text-blue-600" />
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
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Services</p>
                  <p className="text-3xl">342</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Wrench className="h-6 w-6 text-green-600" />
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
                  <p className="text-sm text-gray-600 mb-1">Service Due</p>
                  <p className="text-3xl">45</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
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
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Overdue</p>
                  <p className="text-3xl">12</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by plate number, owner, or vehicle model..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Registry</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {vehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 border rounded-lg space-y-3 cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                onClick={() => handleVehicleClick(vehicle)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Car className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                      <p className="text-xs text-gray-500">{vehicle.year} • {vehicle.plate}</p>
                    </div>
                  </div>
                  <Badge
                    className={
                      vehicle.status === "Active" ? "bg-green-100 text-green-700 border-green-200" :
                      vehicle.status === "Due" ? "bg-orange-100 text-orange-700 border-orange-200" :
                      "bg-red-100 text-red-700 border-red-200"
                    }
                  >
                    {vehicle.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Owner:</span>
                    <span className="font-medium">{vehicle.owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mileage:</span>
                    <span>{vehicle.mileage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Service:</span>
                    <span>{vehicle.lastService}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next Service:</span>
                    <span>{vehicle.nextService}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Oil Type:</span>
                    <span>{vehicle.oilType}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Plate Number</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Mileage</TableHead>
                <TableHead>Last Service</TableHead>
                <TableHead>Next Service</TableHead>
                <TableHead>Oil Type</TableHead>
                <TableHead>History</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle, index) => (
                <motion.tr
                  key={vehicle.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b cursor-pointer hover:bg-blue-50/50 transition-colors"
                  onClick={() => handleVehicleClick(vehicle)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Car className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                        <p className="text-sm text-gray-500">{vehicle.year}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{vehicle.plate}</TableCell>
                  <TableCell>{vehicle.owner}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-gray-400" />
                      <span>{vehicle.mileage}</span>
                    </div>
                  </TableCell>
                  <TableCell>{vehicle.lastService}</TableCell>
                  <TableCell>{vehicle.nextService}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{vehicle.oilType}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{vehicle.serviceHistory} services</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        vehicle.status === "Active" ? "bg-green-100 text-green-700 border-green-200" :
                        vehicle.status === "Due" ? "bg-orange-100 text-orange-700 border-orange-200" :
                        "bg-red-100 text-red-700 border-red-200"
                      }
                    >
                      {vehicle.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      View Details →
                    </Badge>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}