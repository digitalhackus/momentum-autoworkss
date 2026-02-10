import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { RolesPermissions } from "./RolesPermissions";
import { CatalogueSettings } from "./CatalogueSettings";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { 
  Building2, 
  Bell, 
  Lock, 
  Save,
  Shield,
  Upload,
  Palette,
  Info,
  CreditCard,
  Smartphone,
  Banknote,
  Receipt,
  Store
} from "lucide-react";

export function Settings() {
  const { theme, updateTheme } = useTheme();
  const [selectedColor, setSelectedColor] = useState(theme.primaryColor);
  const [workshopName, setWorkshopName] = useState(theme.workshopName);
  const [workshopPhone, setWorkshopPhone] = useState(theme.workshopPhone);
  const [workshopEmail, setWorkshopEmail] = useState(theme.workshopEmail);
  const [workshopAddress, setWorkshopAddress] = useState(theme.workshopAddress);
  const [taxRateCash, setTaxRateCash] = useState(theme.taxRates?.cash ?? 0);
  const [taxRateCard, setTaxRateCard] = useState(theme.taxRates?.card ?? 18);
  const [taxRateOnline, setTaxRateOnline] = useState(theme.taxRates?.online ?? 18);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Notification settings state
  const [serviceDueReminders, setServiceDueReminders] = useState(true);
  const [serviceDueDays, setServiceDueDays] = useState(7);
  const [overdueAlerts, setOverdueAlerts] = useState(true);
  const [overdueDays, setOverdueDays] = useState(7);
  const [jobCompletionNotif, setJobCompletionNotif] = useState(true);
  const [whatsappNotif, setwhatsappNotif] = useState(false);

  // Security settings state
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const themeColors = [
    { name: "Momentum Red", value: "#c2272d" },
    { name: "Blue", value: "#2563eb" },
    { name: "Purple", value: "#7c3aed" },
    { name: "Green", value: "#059669" },
    { name: "Orange", value: "#ea580c" },
    { name: "Pink", value: "#db2777" },
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateTheme({
      primaryColor: selectedColor,
      workshopName: workshopName,
      workshopPhone: workshopPhone,
      workshopEmail: workshopEmail,
      workshopAddress: workshopAddress,
      logoPreview: logoPreview,
      taxRates: {
        cash: taxRateCash,
        card: taxRateCard,
        online: taxRateOnline,
      },
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col mb-8">
          <h1 className="text-4xl font-bold text-[#1a1a1a]">Settings</h1>
          <p className="text-lg text-slate-500 font-medium">Configure your workshop management system</p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="workshop" className="space-y-8">
          <TabsList className="flex w-full bg-[#eff2f5] p-1.5 rounded-xl border-none h-auto">
            <TabsTrigger 
              value="workshop" 
              className="flex-1 py-3 rounded-lg transition-all data-[state=active]:bg-theme data-[state=active]:text-white font-bold text-[#1a1a1a] cursor-pointer"
            >
              Workshop
            </TabsTrigger>
            <TabsTrigger 
              value="catalogue" 
              className="flex-1 py-3 rounded-lg transition-all data-[state=active]:bg-theme data-[state=active]:text-white font-bold text-[#1a1a1a] cursor-pointer"
            >
              Catalogue
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="flex-1 py-3 rounded-lg transition-all data-[state=active]:bg-theme data-[state=active]:text-white font-bold text-[#1a1a1a] cursor-pointer"
            >
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex-1 py-3 rounded-lg transition-all data-[state=active]:bg-theme data-[state=active]:text-white font-bold text-[#1a1a1a] cursor-pointer"
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex-1 py-3 rounded-lg transition-all data-[state=active]:bg-theme data-[state=active]:text-white font-bold text-[#1a1a1a] cursor-pointer"
            >
              Security
            </TabsTrigger>
          </TabsList>

          {/* Workshop Settings */}
          <TabsContent value="workshop">
            <TooltipProvider>
              <div className="grid gap-6">
                {/* Business Profile Card */}
                <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="pb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <Building2 className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-[#1a1a1a]">Business Profile</CardTitle>
                        <p className="text-base text-slate-500 mt-0.5">Manage your workshop details and information</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8 px-8 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="workshop-name" className="text-sm font-bold text-[#1a1a1a]">
                          Business Name <span className="text-red-500 ml-0.5 font-bold">*</span>
                        </Label>
                        <Input 
                          id="workshop-name" 
                          value={workshopName}
                          onChange={(e) => setWorkshopName(e.target.value)}
                          className="bg-[#f3f4f6] border-none h-14 rounded-xl text-base px-5 focus-visible:ring-1 focus-visible:ring-theme transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="workshop-phone" className="text-sm font-bold text-[#1a1a1a]">
                          Phone Number <span className="text-red-500 ml-0.5 font-bold">*</span>
                        </Label>
                        <Input 
                          id="workshop-phone" 
                          placeholder="+92 XXX XXXXXXX" 
                          value={workshopPhone}
                          onChange={(e) => setWorkshopPhone(e.target.value)}
                          className="bg-[#f3f4f6] border-none h-14 rounded-xl text-base px-5 focus-visible:ring-1 focus-visible:ring-theme transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workshop-email" className="text-sm font-bold text-[#1a1a1a]">
                        Email Address <span className="text-red-500 ml-0.5 font-bold">*</span>
                      </Label>
                      <Input 
                        id="workshop-email" 
                        type="email" 
                        value={workshopEmail}
                        onChange={(e) => setWorkshopEmail(e.target.value)}
                        className="bg-[#f3f4f6] border-none h-14 rounded-xl text-base px-5 focus-visible:ring-1 focus-visible:ring-theme transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workshop-address" className="text-sm font-bold text-[#1a1a1a]">
                        Business Address <span className="text-red-500 ml-0.5 font-bold">*</span>
                      </Label>
                      <Textarea 
                        id="workshop-address" 
                        className="min-h-[120px] bg-[#f3f4f6] border-none rounded-xl text-base p-5 focus-visible:ring-1 focus-visible:ring-theme transition-all"
                        value={workshopAddress}
                        onChange={(e) => setWorkshopAddress(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="tax-registration" className="text-sm font-bold text-[#1a1a1a]">Tax Registration Number</Label>
                        <Input 
                          id="tax-registration" 
                          defaultValue="NTN-1234567-8"
                          placeholder="NTN-XXXXXXX-X"
                          className="bg-[#f3f4f6] border-none h-14 rounded-xl text-base px-5 focus-visible:ring-1 focus-visible:ring-theme transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency" className="text-sm font-bold text-[#1a1a1a]">
                          Default Currency <span className="text-red-500 ml-0.5 font-bold">*</span>
                        </Label>
                        <Input 
                          id="currency" 
                          defaultValue="PKR (₨)" 
                          disabled 
                          className="bg-[#f3f4f6] border-none h-14 rounded-xl text-base px-5 opacity-70" 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tax Settings Card */}
                <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-2.5 bg-green-50 rounded-lg">
                        <Receipt className="h-6 w-6 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-[#1a1a1a]">Tax Settings</h3>
                          <Info className="h-4 w-4 text-slate-400 cursor-help" />
                        </div>
                        <p className="text-sm text-slate-500 font-medium">Configure tax rates by payment method</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4 text-[#1a1a1a]" />
                          <Label htmlFor="tax-cash" className="text-[15px] font-bold text-[#1a1a1a]">Tax Rate - Cash (%)</Label>
                        </div>
                        <Input 
                          id="tax-cash" 
                          type="number" 
                          value={taxRateCash}
                          onChange={(e) => setTaxRateCash(Number(e.target.value))}
                          className="bg-[#f3f4f6] border-none h-12 rounded-xl text-base px-5 font-medium"
                          min="0"
                          max="100"
                        />
                        <p className="text-xs text-slate-500 font-medium">Applied when payment method is Cash</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-[#1a1a1a]" />
                          <Label htmlFor="tax-card" className="text-[15px] font-bold text-[#1a1a1a]">Tax Rate - Card (%)</Label>
                        </div>
                        <Input 
                          id="tax-card" 
                          type="number" 
                          value={taxRateCard}
                          onChange={(e) => setTaxRateCard(Number(e.target.value))}
                          className="bg-[#f3f4f6] border-none h-12 rounded-xl text-base px-5 font-medium"
                          min="0"
                          max="100"
                        />
                        <p className="text-xs text-slate-500 font-medium">Applied when payment method is Card</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-[#1a1a1a]" />
                          <Label htmlFor="tax-online" className="text-[15px] font-bold text-[#1a1a1a]">Tax Rate - Online Transfer (%)</Label>
                        </div>
                        <Input 
                          id="tax-online" 
                          type="number" 
                          value={taxRateOnline}
                          onChange={(e) => setTaxRateOnline(Number(e.target.value))}
                          className="bg-[#f3f4f6] border-none h-12 rounded-xl text-base px-5 font-medium"
                          min="0"
                          max="100"
                        />
                        <p className="text-xs text-slate-500 font-medium">Applied for Online/Bank Transfer</p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-100">
                      <Button 
                        onClick={handleSave}
                        className="bg-theme hover:brightness-90 text-white font-bold py-2 px-6 rounded-lg shadow-sm border-none cursor-pointer"
                      >
                        Save Tax Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Branding Card */}
                <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-xl">
                        <Palette className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-[#1a1a1a]">Branding & Appearance</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">Customize your business logo and theme colors</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8 px-8 pb-8">
                    {/* Logo Upload */}
                    <div className="space-y-4">
                      <Label className="text-sm font-bold text-[#1a1a1a]">Business Logo</Label>
                      <div className="flex flex-col sm:flex-row gap-6 items-start">
                        {/* Logo Preview */}
                        <div className="w-40 h-40 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-[#f3f4f6] transition-all overflow-hidden">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain p-2" />
                          ) : (
                            <div className="text-center">
                              <Building2 className="h-14 w-14 text-slate-300 mx-auto mb-2" />
                              <p className="text-xs font-medium text-slate-400">No logo uploaded</p>
                            </div>
                          )}
                        </div>

                        {/* Upload Button */}
                        <div className="flex-1 w-full sm:w-auto">
                          <label htmlFor="logo-upload" className="cursor-pointer block">
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-theme hover:bg-theme-50 transition-all group">
                              <Upload className="h-10 w-10 text-slate-300 mx-auto mb-3 group-hover:text-theme transition-colors" />
                              <p className="text-base font-bold text-[#1a1a1a]">Click to upload logo</p>
                              <p className="text-sm text-slate-500 mt-1">PNG, JPG up to 2MB recommended</p>
                            </div>
                            <input
                              id="logo-upload"
                              type="file"
                              accept="image/png,image/jpeg,image/jpg"
                              className="hidden"
                              onChange={handleLogoUpload}
                            />
                          </label>
                          {logoPreview && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-3 w-full border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                              onClick={() => setLogoPreview(null)}
                            >
                              Remove Logo
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Theme Color */}
                    <div className="space-y-4">
                      <Label className="text-sm font-bold text-[#1a1a1a]">Theme Color</Label>
                      <p className="text-sm text-slate-500 -mt-2">Choose a primary color for your business branding</p>
                      <div className="flex flex-wrap gap-4">
                        {themeColors.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setSelectedColor(color.value)}
                            className={`relative w-14 h-14 rounded-2xl transition-all hover:scale-105 active:scale-95 ${
                              selectedColor === color.value 
                                ? 'ring-4 ring-offset-2 ring-slate-100 shadow-lg' 
                                : 'hover:ring-4 hover:ring-offset-2 hover:ring-slate-50'
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          >
                            {selectedColor === color.value && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.value }} />
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TooltipProvider>
          </TabsContent>

          {/* Catalogue Settings */}
          <TabsContent value="catalogue">
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3 px-2">
                  <div className="p-2 bg-theme-50 rounded-xl">
                    <Store className="h-6 w-6 text-theme" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-[#1a1a1a]">Catalogue Management</CardTitle>
                    <p className="text-sm text-slate-500 mt-0.5">Configure items available in your workshop catalogue</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8 px-8 pb-8">
                <CatalogueSettings />
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Settings */}
          <TabsContent value="users">
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="px-8 pt-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-xl">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-[#1a1a1a]">User Roles & Permissions</CardTitle>
                    <p className="text-sm text-slate-500 mt-0.5">Manage user access and permissions across the system</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-8 pt-4">
                <RolesPermissions />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="px-8 pt-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-xl">
                    <Bell className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-[#1a1a1a]">Notification Preferences</CardTitle>
                    <p className="text-sm text-slate-500 mt-0.5">Configure automated notifications and reminders</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 px-8 pb-8 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border border-slate-100 rounded-2xl bg-[#f9fafb] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#1a1a1a]">Service Due Reminders</p>
                        <p className="text-sm text-slate-500 mt-1">Send reminders before service due</p>
                      </div>
                      <Switch 
                        checked={serviceDueReminders}
                        onCheckedChange={setServiceDueReminders}
                      />
                    </div>
                    <div className="flex items-center gap-4 pt-2 border-t border-slate-200/50">
                      <Label htmlFor="service-due-days" className="text-sm font-bold text-slate-700 whitespace-nowrap">Days before:</Label>
                      <Input 
                        id="service-due-days" 
                        type="number" 
                        value={serviceDueDays} 
                        className="w-24 bg-white border-slate-200 h-10 font-bold"
                        min="1"
                        onChange={(e) => setServiceDueDays(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="p-6 border border-slate-100 rounded-2xl bg-[#f9fafb] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#1a1a1a]">Overdue Service Alerts</p>
                        <p className="text-sm text-slate-500 mt-1">Alert customers when service is overdue</p>
                      </div>
                      <Switch 
                        checked={overdueAlerts}
                        onCheckedChange={setOverdueAlerts}
                      />
                    </div>
                    <div className="flex items-center gap-4 pt-2 border-t border-slate-200/50">
                      <Label htmlFor="overdue-days" className="text-sm font-bold text-slate-700 whitespace-nowrap">Days after:</Label>
                      <Input 
                        id="overdue-days" 
                        type="number" 
                        value={overdueDays} 
                        className="w-24 bg-white border-slate-200 h-10 font-bold"
                        min="1"
                        onChange={(e) => setOverdueDays(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 border border-slate-100 rounded-2xl bg-[#f9fafb]">
                  <div>
                    <p className="font-bold text-[#1a1a1a]">Job Completion Notifications</p>
                    <p className="text-sm text-slate-500 mt-1">Notify customers when their vehicle is ready</p>
                  </div>
                  <Switch 
                    checked={jobCompletionNotif}
                    onCheckedChange={setJobCompletionNotif}
                  />
                </div>

                <div className="flex items-center justify-between p-6 border border-slate-100 rounded-2xl bg-[#f9fafb]">
                  <div>
                    <p className="font-bold text-[#1a1a1a]">WhatsApp Notifications</p>
                    <p className="text-sm text-slate-500 mt-1">Send notifications via WhatsApp Business API</p>
                  </div>
                  <Switch 
                    checked={whatsappNotif}
                    onCheckedChange={setwhatsappNotif}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="px-8 pt-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-xl">
                    <Lock className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-[#1a1a1a]">Security & Privacy</CardTitle>
                    <p className="text-sm text-slate-500 mt-0.5">Manage your password and account security</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8 px-8 pb-8 pt-4">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 border border-slate-100 rounded-2xl bg-[#f9fafb]">
                    <div>
                      <p className="font-bold text-[#1a1a1a]">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-500 mt-1">Add an extra layer of security to your account</p>
                    </div>
                    <Switch 
                      checked={twoFactorAuth}
                      onCheckedChange={setTwoFactorAuth}
                    />
                  </div>

                  <div className="p-8 border border-slate-100 rounded-2xl bg-white space-y-6">
                    <h3 className="font-bold text-lg text-[#1a1a1a]">Change Password</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-[#1a1a1a]">Current Password</Label>
                        <Input 
                          type="password" 
                          className="bg-[#f3f4f6] border-none h-14 rounded-xl px-5"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-[#1a1a1a]">New Password</Label>
                          <Input 
                            type="password" 
                            className="bg-[#f3f4f6] border-none h-14 rounded-xl px-5"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-[#1a1a1a]">Confirm New Password</Label>
                          <Input 
                            type="password" 
                            className="bg-[#f3f4f6] border-none h-14 rounded-xl px-5"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Footer */}
        <div className="bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.03)] py-5 px-4 mt-6 flex flex-col items-center rounded-2xl border border-slate-100 mb-6">
          <div className="relative">
            <Button 
              className="bg-theme hover:brightness-90 px-10 h-12 rounded-xl text-white font-bold text-base shadow-md cursor-pointer active:scale-95 transition-all border-none gap-3 flex items-center" 
              onClick={handleSave}
            >
              <Save className="h-5 w-5" />
              Save Changes
            </Button>
            {saveSuccess && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-green-500 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-lg animate-in fade-in slide-in-from-bottom-2 whitespace-nowrap">
                Settings saved successfully!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
