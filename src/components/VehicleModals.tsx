import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { X, Car, Plus, Lock } from "lucide-react";

interface Vehicle {
  id: string;
  carMake: string;
  carModel: string;
  carYear?: string;
  vehicleNumber: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  vehicles: Vehicle[];
}

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  customerPhone: string;
  newVehicleMake: string;
  setNewVehicleMake: (value: string) => void;
  newVehicleModel: string;
  setNewVehicleModel: (value: string) => void;
  newVehicleYear: string;
  setNewVehicleYear: (value: string) => void;
  newVehicleNumber: string;
  setNewVehicleNumber: (value: string) => void;
  onSave: () => void;
}

interface VehicleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export function AddVehicleModal({
  isOpen,
  onClose,
  customerName,
  customerPhone,
  newVehicleMake,
  setNewVehicleMake,
  newVehicleModel,
  setNewVehicleModel,
  newVehicleYear,
  setNewVehicleYear,
  newVehicleNumber,
  setNewVehicleNumber,
  onSave,
}: AddVehicleModalProps) {
  if (!isOpen) return null;

  const handleSave = () => {
    if (newVehicleMake && newVehicleModel && newVehicleYear && newVehicleNumber) {
      onSave();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Car className="h-5 w-5 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold">Add New Vehicle</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Customer Info (Locked) */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-blue-900">
              Adding vehicle for
            </span>
          </div>
          <p className="text-sm font-medium text-blue-900">{customerName}</p>
          <p className="text-xs text-blue-700">{customerPhone}</p>
        </div>

        {/* Vehicle Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-sm mb-2">
                Make <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g., Toyota"
                value={newVehicleMake}
                onChange={(e) => setNewVehicleMake(e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-sm mb-2">
                Model <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g., Corolla"
                value={newVehicleModel}
                onChange={(e) => setNewVehicleModel(e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-sm mb-2">
                Year <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g., 2021"
                value={newVehicleYear}
                onChange={(e) => setNewVehicleYear(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2">
              Registration Number <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g., ISB-1234"
              value={newVehicleNumber}
              onChange={(e) => setNewVehicleNumber(e.target.value)}
              className="h-9"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-teal-600 hover:bg-teal-700"
            disabled={!newVehicleMake || !newVehicleModel || !newVehicleYear || !newVehicleNumber}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function VehicleSelectionModal({
  isOpen,
  onClose,
  customer,
  onSelectVehicle,
}: VehicleSelectionModalProps) {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Select a Vehicle</h3>
            <p className="text-sm text-slate-500">
              {customer.name} has {customer.vehicles.length} vehicle
              {customer.vehicles.length > 1 ? "s" : ""}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Vehicle List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {customer.vehicles.map((vehicle) => (
            <button
              key={vehicle.id}
              onClick={() => {
                onSelectVehicle(vehicle);
                onClose();
              }}
              className="w-full p-4 text-left border-2 border-slate-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Car className="h-5 w-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {vehicle.carMake} {vehicle.carModel} {vehicle.carYear && `(${vehicle.carYear})`}
                  </p>
                  <p className="text-sm text-slate-500">
                    {vehicle.vehicleNumber}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}