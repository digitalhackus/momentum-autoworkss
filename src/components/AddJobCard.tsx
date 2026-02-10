import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { 
  X, 
  User,
  Car,
  FileText,
  Wrench,
  Clock,
  DollarSign,
  AlertCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface AddJobCardProps {
  onClose?: () => void;
  onSubmit?: (data: any) => void;
}

// Mock customer data - in real app this would come from database
const mockCustomers = [
  { id: "001", name: "John Smith", phone: "(555) 123-4567", vehicles: [{ make: "Toyota", model: "Camry 2021", plate: "ABC-1234" }] },
  { id: "002", name: "Sarah Johnson", phone: "(555) 234-5678", vehicles: [{ make: "Honda", model: "Civic 2020", plate: "XYZ-5678" }] },
  { id: "003", name: "Mike Wilson", phone: "(555) 345-6789", vehicles: [{ make: "Ford", model: "F-150 2022", plate: "DEF-9012" }] },
  { id: "004", name: "Emily Davis", phone: "(555) 456-7890", vehicles: [{ make: "Tesla", model: "Model 3 2023", plate: "GHI-3456" }] },
];

const mockTechnicians = [
  "Mike T.",
  "Chris R.",
  "David L.",
  "Alex K.",
  "Sarah M."
];

export function AddJobCard({ onClose, onSubmit }: AddJobCardProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [assignedTechnician, setAssignedTechnician] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [notes, setNotes] = useState("");

  const customer = mockCustomers.find(c => c.id === selectedCustomer);
  const vehicle = customer?.vehicles.find(v => `${v.make} ${v.model}` === selectedVehicle);

  const handleSubmit = () => {
    if (!selectedCustomer || !selectedVehicle || !serviceDescription || !assignedTechnician) {
      alert("Please fill in all required fields");
      return;
    }

    const jobCardData = {
      customer: customer?.name,
      vehicle: selectedVehicle,
      plate: vehicle?.plate,
      service: serviceDescription,
      priority: priority,
      technician: assignedTechnician,
      estimatedTime: estimatedTime,
      estimatedCost: parseFloat(estimatedCost) || 0,
      notes: notes,
      createdAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: "pending"
    };

    if (onSubmit) {
      onSubmit(jobCardData);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4 flex items-center justify-between border-b shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-theme flex items-center justify-center">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg">Create Job Card</h2>
            <p className="text-xs text-gray-500">Create a new service job card</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto flex-1">
        <div className="p-6 space-y-6">
          {/* Customer & Vehicle Selection */}
          <div className="grid grid-cols-2 gap-6">
            {/* Customer Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-400" />
                <Label className="text-xs uppercase text-gray-500">Select Customer *</Label>
              </div>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose customer..." />
                </SelectTrigger>
                <SelectContent>
                  {mockCustomers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div className="flex flex-col">
                        <span>{customer.name}</span>
                        <span className="text-xs text-gray-500">{customer.phone}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {customer && (
                <div className="p-3 border rounded-lg bg-gray-50">
                  <p className="text-sm font-medium">{customer.name}</p>
                  <p className="text-xs text-gray-500">{customer.id}</p>
                  <p className="text-xs text-gray-500 mt-1">{customer.phone}</p>
                </div>
              )}
            </div>

            {/* Vehicle Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Car className="h-4 w-4 text-gray-400" />
                <Label className="text-xs uppercase text-gray-500">Select Vehicle *</Label>
              </div>
              <Select 
                value={selectedVehicle} 
                onValueChange={setSelectedVehicle}
                disabled={!selectedCustomer}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose vehicle..." />
                </SelectTrigger>
                <SelectContent>
                  {customer?.vehicles.map((vehicle, index) => (
                    <SelectItem key={index} value={`${vehicle.make} ${vehicle.model}`}>
                      {vehicle.make} {vehicle.model} - {vehicle.plate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {vehicle && (
                <div className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-theme-100 flex items-center justify-center">
                      <Car className="h-4 w-4 text-theme" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{vehicle.make} {vehicle.model}</p>
                      <p className="text-xs text-gray-500">{vehicle.plate}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Service Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-medium">Service Details</h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Service Description */}
              <div className="col-span-2 space-y-2">
                <Label className="text-xs text-gray-600">Service Description *</Label>
                <Textarea 
                  placeholder="Describe the service or repair needed..."
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                  <Label className="text-xs text-gray-600">Priority Level *</Label>
                </div>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span>High Priority</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span>Medium Priority</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-theme"></div>
                        <span>Low Priority</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assigned Technician */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <Label className="text-xs text-gray-600">Assign Technician *</Label>
                </div>
                <Select value={assignedTechnician} onValueChange={setAssignedTechnician}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTechnicians.map((tech) => (
                      <SelectItem key={tech} value={tech}>
                        {tech}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estimated Time */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <Label className="text-xs text-gray-600">Estimated Time</Label>
                </div>
                <Input 
                  placeholder="e.g., 2h, 30m, 1.5h"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                />
              </div>

              {/* Estimated Cost */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <Label className="text-xs text-gray-600">Estimated Cost (₨)</Label>
                </div>
                <Input 
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                />
              </div>

              {/* Additional Notes */}
              <div className="col-span-2 space-y-2">
                <Label className="text-xs text-gray-600">Additional Notes</Label>
                <Textarea 
                  placeholder="Any additional information or special instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
            </div>
          </div>

          {/* Summary Card */}
          {estimatedCost && (
            <div className="p-4 border rounded-lg bg-theme-50 border-theme-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Estimated Total</p>
                  <p className="text-2xl text-theme">₨{parseFloat(estimatedCost).toLocaleString()}</p>
                </div>
                {estimatedTime && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Estimated Time</p>
                    <p className="text-lg font-medium">{estimatedTime}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 pt-4 border-t shrink-0 bg-gray-50">
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="bg-theme hover:bg-theme-dark"
            onClick={handleSubmit}
          >
            <Wrench className="h-4 w-4 mr-2" />
            Create Job Card
          </Button>
        </div>
      </div>
    </div>
  );
}
