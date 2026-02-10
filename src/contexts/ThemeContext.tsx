import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    // Load theme from localStorage on mount
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

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

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