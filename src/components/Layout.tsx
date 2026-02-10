import { ReactNode, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "./ui/sheet";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { 
  LayoutDashboard, 
  Users, 
  Car,
  FileText, 
  Clipboard,
  BarChart3,
  Settings, 
  Bell,
  Wrench,
  Search,
  User,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Plus,
  ChevronLeft,
  File,
  Package,
  ArrowDownToLine,
  Store,
  Clock
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isCreatingInvoice?: boolean;
  onBackFromInvoice?: () => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "customers", label: "Customers", icon: Users },
  { id: "vehicles", label: "Vehicles", icon: Car },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "job-cards", label: "Job Cards", icon: Clipboard },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

const inventoryItems = [
  { id: "products", label: "Products", icon: Package },
  { id: "stock-in", label: "Stock In", icon: ArrowDownToLine },
  { id: "vendors", label: "Vendors", icon: Store },
];

const bottomMenuItems = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Layout({ children, currentPage, onNavigate, onLogout, isCreatingInvoice, onBackFromInvoice }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inventoryExpanded, setInventoryExpanded] = useState(
    ["products", "stock-in", "vendors"].includes(currentPage)
  );

  const NavigationItems = () => (
    <>
      {menuItems
        .filter((item) => item.id !== "job-cards") // Hide Job Cards from sidebar menu
        .map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === item.id
                  ? "bg-theme text-white shadow-md shadow-theme/20"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      
      <button
        onClick={() => setInventoryExpanded(!inventoryExpanded)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          ["products", "stock-in", "vendors"].includes(currentPage)
            ? "bg-theme text-white shadow-md shadow-theme/20"
            : "text-slate-300 hover:bg-slate-800"
        }`}
      >
        <Package className="h-5 w-5" />
        <span className="flex-1 text-left">Inventory</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${inventoryExpanded ? "rotate-180" : ""}`} />
      </button>
      
      {inventoryExpanded && (
        <div className="space-y-1">
          {inventoryItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 pl-12 pr-4 py-2.5 rounded-lg transition-colors text-sm ${
                  currentPage === item.id
                    ? "bg-theme-dark text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {bottomMenuItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => {
              onNavigate(item.id);
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === item.id
                ? "bg-theme text-white shadow-md shadow-theme/20"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="hidden lg:flex w-64 bg-[#0a122a] text-white flex-col border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-theme p-2 rounded-lg shadow-lg shadow-theme/20">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Momentum AutoWorks</h1>
              <p className="text-[10px] text-slate-400">POS System</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hidden">
          <NavigationItems />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={`border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4 shadow-sm ${
          isCreatingInvoice ? 'bg-theme' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between w-full">
            {isCreatingInvoice ? (
              <div className="flex items-center gap-3 text-white">
                <button 
                  onClick={onBackFromInvoice}
                  className="hover:bg-white/10 rounded transition-colors p-1"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <File className="h-6 w-6" />
                <div>
                  <h2 className="font-semibold">Create Invoice</h2>
                  <p className="text-xs text-white/80">Fill in the details below</p>
                </div>
              </div>
            ) : (
              <div className="flex lg:hidden items-center gap-2">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 bg-slate-900 text-white p-0" aria-describedby={undefined}>
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <div className="p-6 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="bg-theme p-2 rounded-lg shadow-lg shadow-theme/20">
                          <Wrench className="h-6 w-6" />
                        </div>
                        <div>
                          <h1 className="font-semibold">Momentum AutoWorks</h1>
                          <p className="text-xs text-slate-400">POS System</p>
                        </div>
                      </div>
                    </div>
                    <nav className="p-4 space-y-1">
                      <NavigationItems />
                    </nav>
                  </SheetContent>
                </Sheet>

                <div className="flex items-center gap-2">
                  <div className="bg-theme p-1.5 rounded-lg shadow-md shadow-theme/20">
                    <Wrench className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-semibold text-sm">Momentum AutoWorks</span>
                </div>
              </div>
            )}

            {!isCreatingInvoice && (
              <div className="hidden lg:flex items-center flex-1 justify-center max-w-2xl mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search customers, vehicles, invoices..."
                    className="pl-10 w-full"
                  />
                </div>
              </div>
            )}

            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center gap-2 lg:gap-3 rounded-lg px-2 py-1.5 transition-colors cursor-pointer ${
                    isCreatingInvoice ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-50'
                  }`}>
                    <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                      <AvatarFallback className="bg-theme shadow-inner">
                        <User className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">Admin User</p>
                      <p className={`text-xs ${isCreatingInvoice ? 'text-blue-100' : 'text-gray-500'}`}>Workshop Manager</p>
                    </div>
                    <ChevronDown className={`h-4 w-4 hidden md:block ${isCreatingInvoice ? 'text-blue-100' : 'text-gray-400'}`} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Admin User</p>
                      <p className="text-xs text-gray-500">Workshop Manager</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNavigate("settings")} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onLogout && onLogout()} 
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
