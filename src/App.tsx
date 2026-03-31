import { useMemo, useState } from "react";
import { DataProvider } from "./contexts/DataContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Login } from "./components/Login";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Customers } from "./components/Customers";
import { Vehicles } from "./components/Vehicles";
import { Invoices } from "./components/Invoices";
import { JobCards } from "./components/JobCards";
import { Reports } from "./components/Reports";
import { Notifications } from "./components/Notifications";
import { Settings } from "./components/Settings";
import { Products } from "./components/Products";
import { StockIn } from "./components/StockIn";
import { Vendors } from "./components/Vendors";
import { Expenses } from "./components/Expenses";
import { Utilities } from "./components/Utilities";
import { Salaries } from "./components/Salaries";
import { SalariesEmployees } from "./components/SalariesEmployees";
import { SalaryRecords } from "./components/SalaryRecords";
import { DailyClose } from "./components/DailyClose";

const AUTH_TOKEN_KEY = "momentumAuthToken";
const REMEMBER_ME_KEY = "momentumRememberMe";

type Page =
  | "login"
  | "dashboard"
  | "customers"
  | "vehicles"
  | "invoices"
  | "job-cards"
  | "reports"
  | "notifications"
  | "settings"
  | "products"
  | "stock-in"
  | "vendors"
  | "expenses"
  | "utilities"
  | "salaries"
  | "salaries-employees"
  | "salaries-records"
  | "daily-close";

function getInitialPage(): Page {
  if (typeof window === "undefined") return "login";
  
  // Check for auth token in localStorage (remember me) or sessionStorage (session only)
  const remembered = localStorage.getItem(REMEMBER_ME_KEY) === "true";
  const token = remembered 
    ? localStorage.getItem(AUTH_TOKEN_KEY) 
    : sessionStorage.getItem(AUTH_TOKEN_KEY);
  
  return token ? "dashboard" : "login";
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(getInitialPage);
  const [pageStack, setPageStack] = useState<Page[]>(() => [getInitialPage()]);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [invoiceCustomerId, setInvoiceCustomerId] = useState<string | null>(null);
  const [invoiceVehiclePlate, setInvoiceVehiclePlate] = useState<string | null>(null);

  const handleLogin = () => {
    // Token is already stored by Login component
    setCurrentPage("dashboard");
    setPageStack(["dashboard"]);
  };

  const handleLogout = () => {
    // Clear auth tokens from both storage locations
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    setCurrentPage("login");
    setPageStack(["login"]);
  };

  const handleNavigate = (page: string, options?: { customerId?: string, vehiclePlate?: string }) => {
    const next = page as Page;
    setCurrentPage(next);
    setPageStack((prev) => {
      const last = prev[prev.length - 1];
      if (last === next) return prev;
      return [...prev, next];
    });
    if (page !== "invoices") {
      setShowCreateInvoice(false);
      setInvoiceCustomerId(null);
      setInvoiceVehiclePlate(null);
    } else {
      setInvoiceCustomerId(options?.customerId ?? null);
      setInvoiceVehiclePlate(options?.vehiclePlate ?? null);
    }
  };

  const canGoBack = useMemo(() => pageStack.length > 1 && currentPage !== "login", [pageStack.length, currentPage]);

  const handleGoBack = () => {
    setPageStack((prev) => {
      if (prev.length <= 1) return prev;
      const nextStack = prev.slice(0, -1);
      const backPage = nextStack[nextStack.length - 1] ?? "dashboard";
      setCurrentPage(backPage);
      // Reset invoice-specific UI when leaving invoices
      if (backPage !== "invoices") {
        setShowCreateInvoice(false);
        setInvoiceCustomerId(null);
        setInvoiceVehiclePlate(null);
      }
      return nextStack;
    });
  };

  const handleBackFromInvoice = () => {
    setShowCreateInvoice(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} setShowCreateInvoice={setShowCreateInvoice} />;
      case "customers":
        return <Customers onNavigate={handleNavigate} setShowCreateInvoice={setShowCreateInvoice} />;
      case "vehicles":
        return <Vehicles onNavigate={handleNavigate} setShowCreateInvoice={setShowCreateInvoice} />;
      case "invoices":
        return (
          <Invoices
            showCreateInvoice={showCreateInvoice}
            setShowCreateInvoice={setShowCreateInvoice}
            filterCustomerId={invoiceCustomerId}
            filterVehiclePlate={invoiceVehiclePlate}
            onClearCustomerFilter={() => {
              setInvoiceCustomerId(null);
              if (pageStack.length > 1) handleGoBack();
            }}
            onClearVehicleFilter={() => {
              setInvoiceVehiclePlate(null);
              if (pageStack.length > 1) handleGoBack();
            }}
            onNavigate={handleNavigate}
          />
        );
      case "job-cards":
        return <JobCards />;
      case "reports":
        return <Reports />;
      case "notifications":
        return <Notifications />;
      case "settings":
        return <Settings />;
      case "products":
        return <Products />;
      case "stock-in":
        return <StockIn />;
      case "vendors":
        return <Vendors />;
      case "expenses":
        return <Expenses />;
      case "utilities":
        return <Utilities />;
      case "salaries":
        return <Salaries onNavigate={handleNavigate} />;
      case "salaries-employees":
        return <SalariesEmployees onNavigate={handleNavigate} />;
      case "salaries-records":
        return <SalaryRecords onNavigate={handleNavigate} />;
      case "daily-close":
        return <DailyClose />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      {currentPage === "login" ? (
        <Login onLogin={handleLogin} />
      ) : (
        <DataProvider>
          <Layout
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            isCreatingInvoice={showCreateInvoice}
            onBackFromInvoice={handleBackFromInvoice}
            canGoBack={canGoBack}
            onGoBack={handleGoBack}
          >
            {renderPage()}
          </Layout>
        </DataProvider>
      )}
    </ThemeProvider>
  );
}
