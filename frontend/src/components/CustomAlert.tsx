import { AlertCircle, X } from "lucide-react";
import { Button } from "./ui/button";

interface CustomAlertProps {
  message: string;
  onClose: () => void;
}

export function CustomAlert({ message, onClose }: CustomAlertProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 border-2 border-slate-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Stock Limit Reached</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 rounded-b-xl flex justify-end border-t border-slate-200">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-2 rounded-full shadow-md"
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}
