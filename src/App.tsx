import { useState } from "react";
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
  | "vendors";

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
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);

  const handleLogin = () => {
    // Token is already stored by Login component
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    // Clear auth tokens from both storage locations
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    setCurrentPage("login");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleBackFromInvoice = () => {
    setShowCreateInvoice(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;
      case "customers":
        return <Customers onNavigate={handleNavigate} setShowCreateInvoice={setShowCreateInvoice} />;
      case "vehicles":
        return <Vehicles />;
      case "invoices":
        return (
          <Invoices
            showCreateInvoice={showCreateInvoice}
            setShowCreateInvoice={setShowCreateInvoice}
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
          >
            {renderPage()}
          </Layout>
        </DataProvider>
      )}
    </ThemeProvider>
  );
}
