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

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [showCreateInvoice, setShowCreateInvoice] =
    useState(false);

  const handleLogin = () => {
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
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
        return <Customers onNavigate={handleNavigate} />;
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
