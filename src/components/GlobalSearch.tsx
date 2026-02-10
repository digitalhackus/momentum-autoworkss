import { useState, useMemo } from "react";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Search, User, FileText, Car } from "lucide-react";
import { useData } from "../contexts/DataContext";
import { Badge } from "./ui/badge";

interface GlobalSearchProps {
  onNavigate: (page: string) => void;
}

export function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const { customers, invoices } = useData();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const normalizedText = (s: string) => (s || "").toLowerCase();
  const normalizedDigits = (s: string) => (s || "").replace(/[^\d]/g, "");
  const normalizedPlate = (s: string) => (s || "").replace(/[\s-]/g, "").toUpperCase();

  const results = useMemo(() => {
    if (!query.trim()) return { customers: [], invoices: [] };
    const q = query.trim();
    const qLower = q.toLowerCase();
    const qDigits = normalizedDigits(q);
    const qPlate = normalizedPlate(q);

    const customerMatches = customers.filter((c) => {
      const nameMatch = normalizedText(c.name).startsWith(qLower);
      const phoneMatch = qDigits.length > 0 && normalizedDigits(c.phone).startsWith(qDigits);
      return nameMatch || phoneMatch;
    });

    const invoiceMatches = invoices.filter((inv) => {
      const numMatch = normalizedText(inv.invoiceNumber).startsWith(qLower);
      const customerMatch = normalizedText(inv.customer).startsWith(qLower);
      const plateMatch = normalizedPlate(inv.plate).startsWith(qPlate);
      return numMatch || customerMatch || plateMatch;
    });

    return { customers: customerMatches.slice(0, 6), invoices: invoiceMatches.slice(0, 6) };
  }, [query, customers, invoices]);

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Search customers, vehicles, invoices..."
        className="pl-10 w-full"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(e.target.value.length > 0);
        }}
        onFocus={() => setOpen(query.length > 0)}
      />
      {open && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
          {results.customers.length === 0 && results.invoices.length === 0 ? (
            <div className="p-3 text-center text-sm text-slate-500">No matches</div>
          ) : (
            <div className="p-2 space-y-2">
              {results.customers.length > 0 && (
                <Card className="p-2 border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-theme" />
                    <span className="text-xs font-semibold">Customers</span>
                  </div>
                  <div className="space-y-1">
                    {results.customers.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          onNavigate("customers");
                          setQuery("");
                          setOpen(false);
                        }}
                        className="w-full p-2 rounded hover:bg-theme-50 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{c.name}</p>
                            <p className="text-xs text-slate-500">{c.phone}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {c.status}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              )}
              {results.invoices.length > 0 && (
                <Card className="p-2 border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-theme" />
                    <span className="text-xs font-semibold">Invoices</span>
                  </div>
                  <div className="space-y-1">
                    {results.invoices.map((inv) => (
                      <button
                        key={inv.id}
                        onClick={() => {
                          onNavigate("invoices");
                          setQuery("");
                          setOpen(false);
                        }}
                        className="w-full p-2 rounded hover:bg-theme-50 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                            <p className="text-xs text-slate-500">{inv.customer}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Car className="h-3.5 w-3.5 text-slate-500" />
                            <span className="text-xs text-slate-600">{inv.plate}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
