import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { CustomerProfile } from "./CustomerProfile";
import { AddCustomer } from "./AddCustomer";
import { useData } from "../contexts/DataContext";
import { toast } from "sonner";
import { 
  Search, 
  Plus, 
  Users, 
  Car, 
  DollarSign, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  Edit,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { motion } from "motion/react";

interface CustomersProps {
  onNavigate?: (page: string) => void;
  setShowCreateInvoice?: (show: boolean) => void;
}

export function Customers({ onNavigate, setShowCreateInvoice }: CustomersProps = {}) {
  const { customers, addCustomer, updateCustomer, deleteCustomer, loading } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<(typeof customers)[0] | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [isSaving, setIsSaving] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<(typeof customers)[0] | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const filteredCustomers = customers
    .filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
        case "oldest":
          return new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime();
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "spent-high":
          return b.totalSpent - a.totalSpent;
        case "spent-low":
          return a.totalSpent - b.totalSpent;
        case "services-high":
          return b.serviceHistory - a.serviceHistory;
        case "services-low":
          return a.serviceHistory - b.serviceHistory;
        default:
          return 0;
      }
    });

  const handleViewProfile = (customer: (typeof customers)[0]) => {
    setSelectedCustomer(customer);
    setIsProfileOpen(true);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl mb-1 lg:mb-2">Customer Management</h1>
          <p className="text-sm lg:text-base text-gray-600">View and manage all customer information</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-theme hover:bg-theme-dark w-full lg:w-auto" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add New Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] p-0 bg-transparent border-0 shadow-none [&>button]:hidden" aria-describedby={undefined}>
            <DialogTitle className="sr-only">Add New Customer</DialogTitle>
            <AddCustomer 
              onClose={() => setIsDialogOpen(false)}
              onSubmit={async (data) => {
                setIsSaving(true);
                try {
                  // Format address
                  const addressParts = [data.street, data.area, data.city, data.state].filter(Boolean);
                  const address = addressParts.join(", ") || undefined;

                  // Add customer via API
                  await addCustomer({
                    name: data.fullName,
                    email: data.email,
                    phone: data.phone,
                    address: address,
                    status: "Active" as const,
                  });

                  toast.success("Customer added successfully!");
                  setIsDialogOpen(false);
                } catch (error) {
                  toast.error("Failed to add customer. Please try again.");
                  console.error("Error adding customer:", error);
                } finally {
                  setIsSaving(false);
                }
              }}
              onSaveAndAddVehicle={async (data) => {
                setIsSaving(true);
                try {
                  // Format address
                  const addressParts = [data.street, data.area, data.city, data.state].filter(Boolean);
                  const address = addressParts.join(", ") || undefined;

                  // Add customer via API
                  const newCustomer = await addCustomer({
                    name: data.fullName,
                    email: data.email,
                    phone: data.phone,
                    address: address,
                    status: "Active" as const,
                  });

                  toast.success("Customer added successfully!");
                  setIsDialogOpen(false);
                  
                  // Navigate to invoices page with customer pre-selected
                  if (onNavigate) {
                    onNavigate("invoices");
                    // Set the customer ID in localStorage or pass it somehow so AddInvoice can use it
                    // For now, we'll navigate and the user can search for the customer
                    setTimeout(() => {
                      if (setShowCreateInvoice) {
                        setShowCreateInvoice(true);
                      }
                    }, 100);
                  }
                } catch (error) {
                  toast.error("Failed to add customer. Please try again.");
                  console.error("Error adding customer:", error);
                } finally {
                  setIsSaving(false);
                }
              }}
            />
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
                  <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                  <p className="text-3xl">{loading ? "..." : customers.length}</p>
                </div>
                <div className="p-3 bg-theme-100 rounded-lg">
                  <Users className="h-6 w-6 text-theme" />
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
                  <p className="text-sm text-gray-600 mb-1">Active This Month</p>
                  <p className="text-3xl">
                    {loading
                      ? "..."
                      : customers.filter((c) => {
                          const d = new Date(c.lastVisit);
                          const now = new Date();
                          return !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                        }).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
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
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">VIP Customers</p>
                  <p className="text-3xl">
                    {loading ? "..." : customers.filter((c) => c.status === "VIP").length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
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
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Vehicles</p>
                  <p className="text-3xl">
                    {loading
                      ? "..."
                      : customers.reduce((sum, c) => {
                          const n = typeof c.vehicles === "number" ? c.vehicles : Number(c.vehicles);
                          return sum + (isNaN(n) ? 0 : n);
                        }, 0)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Car className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search Bar & Sort */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or phone number..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  <SelectValue placeholder="Sort by..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    Most Recent
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    Oldest First
                  </div>
                </SelectItem>
                <SelectItem value="name-asc">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-3.5 w-3.5" />
                    Name (A-Z)
                  </div>
                </SelectItem>
                <SelectItem value="name-desc">
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-3.5 w-3.5" />
                    Name (Z-A)
                  </div>
                </SelectItem>
                <SelectItem value="spent-high">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5" />
                    Highest Spent
                  </div>
                </SelectItem>
                <SelectItem value="spent-low">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5" />
                    Lowest Spent
                  </div>
                </SelectItem>
                <SelectItem value="services-high">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-3.5 w-3.5" />
                    Most Services
                  </div>
                </SelectItem>
                <SelectItem value="services-low">
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-3.5 w-3.5" />
                    Least Services
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredCustomers.map((customer, index) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleViewProfile(customer)}
                className="p-4 border rounded-lg space-y-3 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-theme-100 rounded-full flex items-center justify-center">
                      <span className="font-medium text-theme text-sm">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                    </div>
                  </div>
                  <Badge
                    className={
                      customer.status === "VIP" ? "bg-purple-100 text-purple-700 border-purple-200" :
                      "bg-green-100 text-green-700 border-green-200"
                    }
                  >
                    {customer.status}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-600">{customer.email || "N/A"}</span>
                  </div>
                  {customer.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">{customer.address}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t text-sm">
                  <div className="flex gap-4">
                    <span className="text-gray-600">{customer.vehicles} vehicle(s)</span>
                    <span className="text-gray-600">{customer.serviceHistory} services</span>
                  </div>
                  <span className="font-medium">₨{customer.totalSpent.toLocaleString()}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCustomer(customer);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Vehicles</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer, index) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleViewProfile(customer)}
                  className="border-b cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-theme-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-medium text-theme">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{customer.phone}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span>{customer.email}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-400 truncate max-w-[180px]" title={customer.address}>{customer.address}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-theme-50 text-theme border-theme-200">
                      {customer.vehicles}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{customer.lastVisit}</TableCell>
                  <TableCell className="font-medium">₨{customer.totalSpent.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      {customer.serviceHistory}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        customer.status === "VIP" ? "bg-purple-100 text-purple-700 border-purple-200" :
                        "bg-green-100 text-green-700 border-green-200"
                      }
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCustomer(customer);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-[95vw] p-0 bg-transparent border-0 shadow-none [&>button]:hidden" aria-describedby={undefined}>
            <DialogTitle className="sr-only">Edit Customer</DialogTitle>
            <AddCustomer
              mode="edit"
              showSaveAndAddVehicle={false}
              onClose={() => setIsEditDialogOpen(false)}
              initialData={{
                fullName: editingCustomer.name,
                email: editingCustomer.email || "",
                phone: editingCustomer.phone,
                street: editingCustomer.address || "",
              }}
              onSubmit={async (data) => {
                setIsSaving(true);
                try {
                  const address = data.street || editingCustomer.address;
                  await updateCustomer(editingCustomer.id, {
                    name: data.fullName,
                    email: data.email,
                    phone: data.phone,
                    address,
                  });
                  toast.success("Customer updated successfully!");
                  setIsEditDialogOpen(false);
                } catch (error) {
                  console.error("Error updating customer:", error);
                  toast.error("Failed to update customer. Please try again.");
                } finally {
                  setIsSaving(false);
                }
              }}
              onDelete={async () => {
                if (!editingCustomer) return;
                setIsSaving(true);
                try {
                  await deleteCustomer(editingCustomer.id);
                  toast.success("Customer deleted successfully!");
                  setIsEditDialogOpen(false);
                  setEditingCustomer(null);
                } catch (error) {
                  console.error("Error deleting customer:", error);
                  toast.error("Failed to delete customer. Please try again.");
                } finally {
                  setIsSaving(false);
                }
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Customer Profile Modal */}
      {isProfileOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <CustomerProfile
              customer={{
                ...selectedCustomer,
                email: selectedCustomer.email || "",
                address: selectedCustomer.address || "",
              }}
              onClose={() => setIsProfileOpen(false)}
              onNavigate={onNavigate}
              onNewService={() => {
                setIsProfileOpen(false);
                onNavigate?.("invoices");
                setShowCreateInvoice?.(true);
              }}
              onAddVehicle={() => {
                setIsProfileOpen(false);
                onNavigate?.("vehicles");
              }}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
