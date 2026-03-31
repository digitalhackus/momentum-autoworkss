import { useState, useEffect, useMemo } from "react";
import { useData } from "../contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
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
  AlertCircle
} from "lucide-react";
import { motion } from "motion/react";
import { VehicleProfile } from "./VehicleProfile";

type DisplayVehicle = {
  id: string;
  make: string;
  model: string;
  year?: string;
  plate: string;
  owner: string;
  ownerId: string;
  totalInvoices: number;
  totalSpent: number;
  lastActivity: string;
  status?: string;
};

type CustomerOption = { id: string; name: string; email?: string; phone: string };
interface VehiclesProps {
  onNavigate?: (page: string) => void;
  setShowCreateInvoice?: (show: boolean) => void;
}

export function Vehicles({ onNavigate, setShowCreateInvoice }: VehiclesProps = {}) {
  const { customers, invoices, addCustomer, addVehicle, getCustomerVehicles, deleteVehicle } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [step, setStep] = useState<"customer" | "newCustomer" | "vehicle">("customer");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null);
  const [showOwnerAlert, setShowOwnerAlert] = useState(false);
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  const [vehicles, setVehicles] = useState<DisplayVehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusChangeTarget, setStatusChangeTarget] = useState<{ vehicle: DisplayVehicle; newStatus: string } | null>(null);

  // New customer form state (used when adding vehicle and creating customer in same flow)
  const [newCustomerForm, setNewCustomerForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    area: "",
    city: "",
    state: "",
  });

  const totalVehiclesCount = customers.reduce((sum, c) => {
    const n = typeof c.vehicles === "number" ? c.vehicles : Number(c.vehicles);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  const totalCustomersCount = customers.length;

  const vehicleRevenue = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

  const vehiclesWithInvoices = new Set(invoices.map((inv) => inv.plate));
  
  useEffect(() => {
    try {
      const newCustomerId = localStorage.getItem("newCustomerId");
      if (newCustomerId) {
        const customer = customers.find(c => c.id === newCustomerId);
        if (customer) {
          setSelectedCustomer({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          });
          setStep("vehicle");
        }
        localStorage.removeItem("newCustomerId");
      }
    } catch {}
  }, [customers]);

  useEffect(() => {
    const loadAllVehicles = async () => {
      setVehiclesLoading(true);
      try {
        const customerList = customers ?? [];
        if (customerList.length === 0) {
          setVehicles([]);
          return;
        }

        // Fetch vehicles per customer with a small concurrency limit (avoids hammering the backend)
        const concurrency = 6;
        const results: DisplayVehicle[] = [];
        const seen = new Set<string>(); // dedupe by normalized plate across customers

        for (let i = 0; i < customerList.length; i += concurrency) {
          const slice = customerList.slice(i, i + concurrency);
          const settled = await Promise.allSettled(slice.map((c) => getCustomerVehicles(c.id)));

          settled.forEach((s, idx) => {
            const customer = slice[idx];
            const ownerName = customer?.name || "Unknown";

            if (s.status !== "fulfilled") return;
            const list = s.value || [];

            list.forEach((v) => {
              const plate = v.vehicleNumber || "";
              const key = plate.replace(/[\s-]/g, "").toUpperCase();
              if (!key || seen.has(key)) return;
              seen.add(key);

              const vehicleInvoices = invoices.filter((inv) => inv.plate === plate);
              const paidInvoices = vehicleInvoices.filter((inv) => inv.status === "Paid");
              const totalSpent = paidInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
              const lastInvoice = [...vehicleInvoices].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
              )[0];

              results.push({
                id: v.id,
                make: v.carMake || "",
                model: v.carModel || "",
                year: v.carYear || "",
                plate,
                owner: ownerName,
                ownerId: v.customerId,
                totalInvoices: vehicleInvoices.length,
                totalSpent,
                lastActivity: lastInvoice ? lastInvoice.date : "No activity",
                status: "Active",
              });
            });
          });
        }

        setVehicles(results);
      } catch (error) {
        console.error("Failed to load vehicles:", error);
        toast.error("Could not load vehicle registry.");
      } finally {
        setVehiclesLoading(false);
      }
    };
    loadAllVehicles();
  }, [customers, getCustomerVehicles, invoices]);

  const vehiclesWithoutInvoicesCount = vehicles.filter(v => v.totalInvoices === 0).length;
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch) ||
    (customer.email && customer.email.toLowerCase().includes(customerSearch.toLowerCase()))
  );

  const filteredVehicles = vehicles.filter((v) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (
      v.plate.toLowerCase().includes(q) ||
      v.owner.toLowerCase().includes(q) ||
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q)
    );
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCustomerSelect = (customer: CustomerOption) => {
    setSelectedCustomer({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    });
    setStep("vehicle");
  };

  const handleAddNewCustomer = () => {
    setNewCustomerForm({
      fullName: "",
      email: "",
      phone: "",
      street: "",
      area: "",
      city: "",
      state: "",
    });
    setStep("newCustomer");
  };

  const handleBackToCustomerSearch = () => {
    setStep("customer");
  };

  const handleNewCustomerComplete = async () => {
    const { fullName, email, phone, street, area, city, state } = newCustomerForm;
    if (!fullName.trim() || !phone.trim()) {
      toast.error("Please enter at least full name and phone number.");
      return;
    }
    setIsSavingCustomer(true);
    try {
      const addressParts = [street, area, city, state].filter(Boolean);
      const address = addressParts.length > 0 ? addressParts.join(", ") : undefined;
      const created = await addCustomer({
        name: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim(),
        address,
        status: "Active",
      });
      setSelectedCustomer({
        id: created.id,
        name: created.name,
        email: created.email,
        phone: created.phone,
      });
      toast.success("Customer added. Now add vehicle details.");
      setStep("vehicle");
    } catch (error) {
      toast.error("Failed to add customer. Please try again.");
      console.error(error);
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const handleCloseDialog = () => {
    setIsAddVehicleOpen(false);
    setTimeout(() => {
      setStep("customer");
      setCustomerSearch("");
      setSelectedCustomer(null);
      setShowOwnerAlert(false);
      setNewCustomerForm({
        fullName: "",
        email: "",
        phone: "",
        street: "",
        area: "",
        city: "",
        state: "",
      });
    }, 200);
  };

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
                                {customer.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {customer.email}
                                  </span>
                                )}
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
              <form className="space-y-6 mt-4" onSubmit={(e) => { e.preventDefault(); handleNewCustomerComplete(); }}>
                <div className="space-y-4">
                  <h4 className="text-sm">Customer Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-cust-name">Full Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="new-cust-name"
                        placeholder="John Doe"
                        value={newCustomerForm.fullName}
                        onChange={(e) => setNewCustomerForm((f) => ({ ...f, fullName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-cust-phone">Phone Number <span className="text-red-500">*</span></Label>
                      <Input
                        id="new-cust-phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={newCustomerForm.phone}
                        onChange={(e) => setNewCustomerForm((f) => ({ ...f, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-cust-email">Email</Label>
                    <Input
                      id="new-cust-email"
                      type="email"
                      placeholder="john@example.com"
                      value={newCustomerForm.email}
                      onChange={(e) => setNewCustomerForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm">Address Information</h4>
                  <div className="space-y-2">
                    <Label htmlFor="new-cust-street">Street Address</Label>
                    <Input
                      id="new-cust-street"
                      placeholder="123 Main St"
                      value={newCustomerForm.street}
                      onChange={(e) => setNewCustomerForm((f) => ({ ...f, street: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-cust-area">Area/Region</Label>
                      <Input
                        id="new-cust-area"
                        placeholder="e.g., Soan Garden"
                        value={newCustomerForm.area}
                        onChange={(e) => setNewCustomerForm((f) => ({ ...f, area: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-cust-city">City</Label>
                      <Input
                        id="new-cust-city"
                        placeholder="e.g., Islamabad"
                        value={newCustomerForm.city}
                        onChange={(e) => setNewCustomerForm((f) => ({ ...f, city: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-cust-state">State/Province</Label>
                      <Input
                        id="new-cust-state"
                        placeholder="e.g., Punjab"
                        value={newCustomerForm.state}
                        onChange={(e) => setNewCustomerForm((f) => ({ ...f, state: e.target.value }))}
                      />
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
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={isSavingCustomer || !newCustomerForm.fullName.trim() || !newCustomerForm.phone.trim()}
                  >
                    {isSavingCustomer ? "Saving..." : "Continue to Vehicle"}
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
                        <div className="w-10 h-10 bg-theme-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-theme" />
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

                {/* Basic Vehicle Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="make">Make *</Label>
                      <Input id="make" placeholder="e.g., Toyota" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model *</Label>
                      <Input id="model" placeholder="e.g., Corolla" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year *</Label>
                      <Input
                        id="year"
                        type="number"
                        placeholder="e.g., 2021"
                        min="1900"
                        max="2030"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plate">Registration Number *</Label>
                    <Input id="plate" placeholder="e.g., ISB-1234" required />
                  </div>
                </div>

                {/* Removed mileage, service and fuel/oil sections per requirements */}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="submit"
                    className="flex-1 bg-theme hover:bg-theme-dark"
                    onClick={async (e) => {
                      e.preventDefault();
                      if (!selectedCustomer) {
                        setShowOwnerAlert(true);
                        return;
                      }
                      const makeInput = (document.getElementById("make") as HTMLInputElement | null)?.value || "";
                      const modelInput = (document.getElementById("model") as HTMLInputElement | null)?.value || "";
                      const yearInput = (document.getElementById("year") as HTMLInputElement | null)?.value || "";
                      const plateInput = (document.getElementById("plate") as HTMLInputElement | null)?.value || "";
                      if (!makeInput.trim() || !modelInput.trim() || !plateInput.trim()) {
                        toast.error("Please enter make, model and registration number.");
                        return;
                      }
                      try {
                        const created = await addVehicle(selectedCustomer.id, {
                          carMake: makeInput.trim(),
                          carModel: modelInput.trim(),
                          carYear: yearInput.trim() || undefined,
                          vehicleNumber: plateInput.trim(),
                        });
                        toast.success("Vehicle added for this customer.");
                        setVehicles((prev) => [
                          ...prev,
                          {
                            id: created.id,
                            make: created.carMake || "",
                            model: created.carModel || "",
                            year: created.carYear || "",
                            plate: created.vehicleNumber || "",
                            owner: selectedCustomer.name,
                            ownerId: selectedCustomer.id,
                            status: "Active",
                            serviceHistory: 0,
                          },
                        ]);
                        handleCloseDialog();
                      } catch (err) {
                        console.error("Failed to add vehicle from Vehicles page:", err);
                        toast.error("Could not save vehicle. Please try again.");
                      }
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
                  <p className="text-3xl">{totalVehiclesCount}</p>
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
                  <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                  <p className="text-3xl">{totalCustomersCount}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <User className="h-6 w-6 text-green-600" />
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
                  <p className="text-sm text-gray-600 mb-1">Vehicle Revenue</p>
                  <p className="text-3xl">Rs. {vehicleRevenue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Wrench className="h-6 w-6 text-orange-600" />
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
                  <p className="text-sm text-gray-600 mb-1">Vehicles Without Invoices</p>
                  <p className="text-3xl">{vehiclesWithoutInvoicesCount}</p>
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
                className="pl-10 h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 border-slate-200 flex items-center gap-2 text-slate-600 font-medium px-4 hover:bg-slate-50 transition-colors">
                  <Filter className="h-4 w-4" />
                  Filter by Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-1 shadow-md border border-slate-100 rounded-lg">
                <DropdownMenuItem 
                  onClick={() => setStatusFilter("all")} 
                  className={`cursor-pointer font-medium py-2 px-3 rounded-md ${statusFilter === "all" ? "bg-theme/10 text-theme" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  All
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setStatusFilter("Active")} 
                  className={`cursor-pointer font-medium py-2 px-3 rounded-md ${statusFilter === "Active" ? "bg-theme/10 text-theme" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setStatusFilter("Inactive")} 
                  className={`cursor-pointer font-medium py-2 px-3 rounded-md ${statusFilter === "Inactive" ? "bg-theme/10 text-theme" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            {filteredVehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.2) }}
                className="p-4 border rounded-lg space-y-3 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-theme-100 rounded-lg">
                      <Car className="h-5 w-5 text-theme" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{vehicle.make} {vehicle.model}</p>
                      <p className="text-xs text-gray-500">{vehicle.year} • {vehicle.plate}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Owner:</span>
                    <span className="font-semibold text-slate-900">{vehicle.owner}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Status:</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newStatus = vehicle.status === "Inactive" ? "Active" : "Inactive";
                        setStatusChangeTarget({ vehicle, newStatus });
                      }}
                      className="focus:outline-none"
                    >
                      <Badge
                        className={
                          vehicle.status === "Active" ? "bg-red-50 text-red-600 border-red-200 cursor-pointer hover:bg-red-100 transition-colors" :
                          vehicle.status === "Due" ? "bg-orange-100 text-orange-700 border-orange-200 cursor-pointer hover:bg-orange-200 transition-colors" :
                          "bg-red-100 text-red-700 border-red-200 cursor-pointer hover:bg-red-200 transition-colors"
                        }
                      >
                        {vehicle.status}
                      </Badge>
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Total Invoices:</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate?.("invoices", { vehiclePlate: vehicle.plate });
                      }}
                      className="focus:outline-none"
                    >
                      <Badge 
                        variant="outline" 
                        className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 font-medium px-2 py-0.5 rounded-full cursor-pointer transition-colors"
                      >
                        {vehicle.totalInvoices} invoices
                      </Badge>
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Total Spent:</span>
                    <span className="font-semibold text-slate-900">Rs. {vehicle.totalSpent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Last Activity:</span>
                    <span className="text-slate-600">{vehicle.lastActivity}</span>
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
                <TableHead>Total Invoices</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle, index) => (
                <motion.tr
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.01, 0.1) }}
                  className="border-b hover:bg-blue-50/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-theme-100 rounded-lg">
                        <Car className="h-5 w-5 text-theme" />
                      </div>
                      <div>
                        <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                        <p className="text-sm text-gray-500">{vehicle.year}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">{vehicle.plate}</TableCell>
                  <TableCell className="text-slate-600">{vehicle.owner}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate?.("invoices", { vehiclePlate: vehicle.plate });
                      }}
                      className="focus:outline-none"
                    >
                      <Badge variant="outline" className="bg-theme-50 text-theme border-theme-200 font-medium cursor-pointer hover:bg-theme-100 transition-colors">
                        {vehicle.totalInvoices} Invoices
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    Rs. {vehicle.totalSpent.toLocaleString()}
                  </TableCell>
                  <TableCell>{vehicle.lastActivity}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newStatus = vehicle.status === "Inactive" ? "Active" : "Inactive";
                        setStatusChangeTarget({ vehicle, newStatus });
                      }}
                      className="focus:outline-none"
                    >
                      <Badge
                        className={
                          vehicle.status === "Active" ? "bg-red-50 text-red-600 border-red-200 cursor-pointer hover:bg-red-100 transition-colors" :
                          vehicle.status === "Due" ? "bg-orange-100 text-orange-700 border-orange-200 cursor-pointer hover:bg-orange-200 transition-colors" :
                          "bg-red-100 text-red-700 border-red-200 cursor-pointer hover:bg-red-200 transition-colors"
                        }
                      >
                        {vehicle.status}
                      </Badge>
                    </button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Status Change Dialog */}
      <AlertDialog 
        open={!!statusChangeTarget} 
        onOpenChange={(open) => !open && setStatusChangeTarget(null)}
      >
        <AlertDialogContent className="rounded-xl border border-gray-200 bg-white shadow-lg sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-800">
              {statusChangeTarget?.newStatus === "Active" ? "Mark as Active?" : "Mark as Inactive?"}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="border-gray-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!statusChangeTarget) return;
                // In a real app, we would call an API here. 
                // Since this is a UI update, we'll update the local state for demonstration.
                setVehicles(prev => prev.map(v => 
                  v.id === statusChangeTarget.vehicle.id 
                    ? { ...v, status: statusChangeTarget.newStatus } 
                    : v
                ));
                toast.success(`Vehicle marked as ${statusChangeTarget.newStatus}.`);
                setStatusChangeTarget(null);
              }}
              className="bg-theme hover:bg-theme-dark text-white"
            >
              {statusChangeTarget?.newStatus === "Active" ? "Mark as Active" : "Mark as Inactive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
