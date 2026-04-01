import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { X, Save, Car } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

// interface for the customer

interface AddCustomerProps {
  onClose?: () => void;
  onSubmit?: (data: FormData) => void;
  onSaveAndAddVehicle?: (data: FormData) => void;
  onDelete?: () => void;
  /** Optional initial values when editing an existing customer */
  initialData?: Partial<FormData>;
  /** Controls labels/mode; default is 'create' */
  mode?: "create" | "edit";
  /** Hide the "Save & Add Vehicle" button when not needed (e.g. edit mode) */
  showSaveAndAddVehicle?: boolean;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  area: string;
  city: string;
  state: string;
}

export function AddCustomer({ onClose, onSubmit, onSaveAndAddVehicle, onDelete, initialData, mode = "create", showSaveAndAddVehicle = true }: AddCustomerProps) {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    area: "",
    city: "",
    state: ""
  });

  // When initialData is provided (edit mode), hydrate the form once
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^\+92\s\d{10}$/.test(phone);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) {
      handleInputChange('phone', '');
      return;
    }
    const local = digits.startsWith('92') ? digits.slice(2) : digits;
    const padded = local.slice(0, 10);
    const formatted = `+92 ${padded}`;
    handleInputChange('phone', formatted);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    else if (!validatePhone(formData.phone)) newErrors.phone = "Invalid phone format";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Submit form
    if (onSubmit) {
      onSubmit(formData);
    }

    if (onClose) {
      onClose();
    }
  };

  const handleSaveAndAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Submit form and navigate to vehicles
    if (onSaveAndAddVehicle) {
      onSaveAndAddVehicle(formData);
    }

    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="bg-white rounded-none sm:rounded-2xl shadow-none sm:shadow-2xl sm:max-w-3xl w-full h-full md:h-auto overflow-y-auto">
      {/* Header */}
      <div className="p-6 pb-4 flex items-center justify-between border-b">
        <h2 className="text-lg">{mode === "edit" ? "Edit Customer" : "Add New Customer"}</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-6">
          {/* First Row - Customer Information */}
          <div>
            <h4 className="text-xs uppercase text-gray-500 mb-4">Customer Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-xs">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`h-9 text-sm ${errors.fullName ? "border-red-500" : ""}`}
                />
                {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`h-9 text-sm ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+92 XXXXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  maxLength={14}
                  className={`h-9 text-sm ${errors.phone ? "border-red-500" : ""}`}
                />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Second Row - Address */}
          <div>
            <h4 className="text-xs uppercase text-gray-500 mb-4">Address</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="street" className="text-xs">Street Address</Label>
                <Input
                  id="street"
                  placeholder="123 Main St"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area" className="text-xs">Area / Neighborhood</Label>
                <Input
                  id="area"
                  placeholder="Soan Garden"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-xs">City</Label>
                <Input
                  id="city"
                  placeholder="Islamabad"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="state" className="text-xs">State / Province</Label>
                <Input
                  id="state"
                  placeholder="Punjab"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
          {mode === "edit" ? (
            <>
              <Button type="submit" className="flex-1 bg-theme hover:bg-theme-dark">
                <Save className="h-4 w-4 mr-2" />
                Update Customer
              </Button>
              <Button
                type="button"
                className="flex-1 bg-theme hover:bg-theme-dark"
              >
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <span>Delete Customer</span>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this customer?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove the customer and their vehicles. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={onDelete}
                      >
                        Confirm Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </Button>
            </>
          ) : (
            <>
              <Button type="submit" className="flex-1 bg-theme hover:bg-theme-dark">
                <Save className="h-4 w-4 mr-2" />
                Save Customer
              </Button>
              {showSaveAndAddVehicle && (
                <Button
                  type="button"
                  onClick={handleSaveAndAddVehicle}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Car className="h-4 w-4 mr-2" />
                  Save & Add Vehicle
                </Button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
}
