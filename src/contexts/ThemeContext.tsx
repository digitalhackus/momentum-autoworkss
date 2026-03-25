import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../api/client';

export interface ThemeSettings {
  primaryColor: string;
  workshopName: string;
  workshopAddress: string;
  workshopPhone: string;
  workshopEmail: string;
  taxRate: number; // Kept for backward compatibility
  taxRates?: {
    cash: number;
    card: number;
    online: number;
  };
  currency: string;
  logoPreview?: string | null;
  marketplaceMode?: boolean;
}

interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (updates: Partial<ThemeSettings>) => void;
  resetTheme: () => void;
}

const defaultTheme: ThemeSettings = {
  primaryColor: '#c2272d', // Momentum Red (Brand Default)
  workshopName: 'Momentum AutoWorks',
  workshopAddress: '123 Workshop Street, Islamabad',
  workshopPhone: '+92 300 1234567',
  workshopEmail: 'info@momentumauto.com',
  taxRate: 18,
  taxRates: {
    cash: 0,
    card: 18,
    online: 18,
  },
  currency: '₨',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings>(() => {
    // Load theme from localStorage on mount as initial fallback
    const savedTheme = localStorage.getItem('momentumTheme');
    if (savedTheme) {
      try {
        return JSON.parse(savedTheme);
      } catch (e) {
        return defaultTheme;
      }
    }
    return defaultTheme;
  });

  // Fetch settings from the backend on mount and merge into theme
  useEffect(() => {
    let cancelled = false;
    api.getSettings().then((remote) => {
      if (cancelled) return;
      setTheme(prev => ({
        ...prev,
        workshopName: remote.workshopName || prev.workshopName,
        workshopPhone: remote.workshopPhone || prev.workshopPhone,
        workshopEmail: remote.workshopEmail || prev.workshopEmail,
        workshopAddress: remote.workshopAddress || prev.workshopAddress,
        primaryColor: remote.primaryColor || prev.primaryColor,
        logoPreview: remote.logoBase64 || prev.logoPreview || null,
        taxRates: remote.taxRates || prev.taxRates,
      }));
    }).catch(() => {
      // Silently fall back to localStorage values if backend is unavailable
    });
    return () => { cancelled = true; };
  }, []);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('momentumTheme', JSON.stringify(theme));
    
    // Update CSS custom properties for the primary color
    document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
    
    // Calculate lighter and darker shades
    const hex = theme.primaryColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Lighter shade (for backgrounds)
    const lighterR = Math.min(255, r + 40);
    const lighterG = Math.min(255, g + 40);
    const lighterB = Math.min(255, b + 40);
    document.documentElement.style.setProperty('--primary-color-light', `rgb(${lighterR}, ${lighterG}, ${lighterB})`);
    
    // Darker shade (for hover states)
    const darkerR = Math.max(0, r - 30);
    const darkerG = Math.max(0, g - 30);
    const darkerB = Math.max(0, b - 30);
    document.documentElement.style.setProperty('--primary-color-dark', `rgb(${darkerR}, ${darkerG}, ${darkerB})`);
    
  }, [theme]);

  const updateTheme = useCallback((updates: Partial<ThemeSettings>) => {
    setTheme(prev => {
      const next = { ...prev, ...updates };

      // Persist to backend (fire-and-forget)
      const payload: Record<string, unknown> = {};
      if (updates.workshopName !== undefined) payload.workshopName = updates.workshopName;
      if (updates.workshopPhone !== undefined) payload.workshopPhone = updates.workshopPhone;
      if (updates.workshopEmail !== undefined) payload.workshopEmail = updates.workshopEmail;
      if (updates.workshopAddress !== undefined) payload.workshopAddress = updates.workshopAddress;
      if (updates.primaryColor !== undefined) payload.primaryColor = updates.primaryColor;
      if (updates.taxRates !== undefined) payload.taxRates = updates.taxRates;
      // Save logo as logoBase64 in the backend
      if (updates.logoPreview !== undefined) payload.logoBase64 = updates.logoPreview;

      if (Object.keys(payload).length > 0) {
        api.updateSettings(payload as Parameters<typeof api.updateSettings>[0]).catch(() => {
          // Silently fail — localStorage still has the data
        });
      }

      return next;
    });
  }, []);

  const resetTheme = () => {
    setTheme(defaultTheme);
    localStorage.removeItem('momentumTheme');
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}