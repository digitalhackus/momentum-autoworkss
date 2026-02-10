import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Wrench, Facebook, Twitter, Linkedin } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface LoginProps {
  onLogin: () => void;
}

const AUTH_TOKEN_KEY = "momentumAuthToken";
const REMEMBER_ME_KEY = "momentumRememberMe";

// Validation functions
const validateEmail = (email: string): string | null => {
  const trimmed = email.trim();
  if (!trimmed) {
    return "Please enter a valid email address";
  }
  if (!trimmed.includes("@")) {
    return "Please enter a valid email address";
  }
  if (!trimmed.includes(".")) {
    return "Please enter a valid email address";
  }
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }
  return null;
};

export function Login({ onLogin }: LoginProps) {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Error states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const remembered = localStorage.getItem(REMEMBER_ME_KEY) === "true";
    const token = remembered ? localStorage.getItem(AUTH_TOKEN_KEY) : sessionStorage.getItem(AUTH_TOKEN_KEY);
    
    if (token) {
      // Auto-login if valid token exists
      onLogin();
    }
  }, [onLogin]);

  // Clear errors when user types
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) setEmailError(null);
    if (generalError) setGeneralError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordError) setPasswordError(null);
    if (generalError) setGeneralError(null);
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFullName(value);
    if (fullNameError) setFullNameError(null);
    if (generalError) setGeneralError(null);
  };

  const handleToggleSignup = () => {
    setIsSignup(!isSignup);
    // Clear all errors when switching modes
    setEmailError(null);
    setPasswordError(null);
    setFullNameError(null);
    setGeneralError(null);
    setEmail("");
    setPassword("");
    setFullName("");
  };

  const validateForm = (): boolean => {
    let isValid = true;

    // Validate email
    const emailValidation = validateEmail(email);
    if (emailValidation) {
      setEmailError(emailValidation);
      isValid = false;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      isValid = false;
    }

    // Validate full name for signup
    if (isSignup) {
      if (!fullName.trim()) {
        setFullNameError("Full name is required");
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setEmailError(null);
    setPasswordError(null);
    setFullNameError(null);
    setGeneralError(null);

    // Validate before API call
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // ============================================
      // TODO: Replace with actual API call when backend auth endpoints are ready
      // ============================================
      // Uncomment and modify the following code when backend is implemented:
      //
      // const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      // const endpoint = isSignup ? '/auth/signup' : '/auth/login';
      // 
      // const response = await fetch(`${API_BASE}${endpoint}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     email: email.trim(), 
      //     password,
      //     ...(isSignup && { fullName: fullName.trim() })
      //   })
      // });
      // 
      // const data = await response.json();
      // 
      // if (!response.ok) {
      //   const error = data.error || data.message || 'Something went wrong';
      //   const errorLower = error.toLowerCase();
      //   
      //   // Handle specific backend errors
      //   if (errorLower.includes('user already exists') || 
      //       errorLower.includes('duplicate') || 
      //       errorLower.includes('already registered')) {
      //     setGeneralError('An account with this email already exists');
      //   } else if (errorLower.includes('invalid') || 
      //              errorLower.includes('wrong') || 
      //              errorLower.includes('incorrect')) {
      //     setGeneralError('Invalid email or password');
      //   } else if (errorLower.includes('not found') || 
      //              errorLower.includes('does not exist')) {
      //     setGeneralError('No account found with this email');
      //   } else {
      //     setGeneralError(error);
      //   }
      //   setIsLoading(false);
      //   return;
      // }
      // 
      // const token = data.token || data.accessToken;
      // if (!token) {
      //   setGeneralError('Authentication failed. Please try again.');
      //   setIsLoading(false);
      //   return;
      // }
      //
      // ============================================
      // End of API integration section
      // ============================================
      
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock token for development (remove when backend is ready)
      const mockToken = `mock-token-${Date.now()}`;

      // Store auth token based on Remember Me preference
      if (rememberMe) {
        localStorage.setItem(AUTH_TOKEN_KEY, mockToken);
        localStorage.setItem(REMEMBER_ME_KEY, "true");
      } else {
        sessionStorage.setItem(AUTH_TOKEN_KEY, mockToken);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.setItem(REMEMBER_ME_KEY, "false");
      }

      // Call onLogin callback
      onLogin();
    } catch (error) {
      setGeneralError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Image & Social */}
      <div 
        className="hidden md:flex md:w-5/12 relative bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(${theme.primaryColor}dd, ${theme.primaryColor}dd), url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')`,
        }}
      >
          <div className="absolute inset-0 flex flex-col justify-between p-8">
            <div></div>
            
            {/* Social Icons */}
            <div className="flex flex-col items-center gap-6">
              <div className="flex gap-4">
                <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors">
                  <Facebook className="h-5 w-5 text-white" />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors">
                  <Twitter className="h-5 w-5 text-white" />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors">
                  <Linkedin className="h-5 w-5 text-white" />
                </button>
              </div>
              
              <div className="text-center text-white">
                <p className="text-sm mb-2">
                  {isSignup ? "Already have an account?" : "Don't have an account?"}
                </p>
                <button 
                  type="button"
                  onClick={handleToggleSignup}
                  className="text-white font-medium underline hover:no-underline"
                >
                  {isSignup ? "Login" : "Signup"}
                </button>
              </div>
            </div>
          </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 p-8 md:p-12 bg-white flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="bg-theme p-3 rounded-xl mb-3">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl text-blue-900 tracking-wide">MOMENTUM AUTOWORKS</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {isSignup && (
              <div>
                <Input
                  type="text"
                  placeholder="Full Name"
                  className={`h-12 bg-gray-50 border-gray-200 ${fullNameError ? "border-red-500" : ""}`}
                  value={fullName}
                  onChange={handleFullNameChange}
                />
                {fullNameError && (
                  <p className="text-xs text-red-500 mt-1 ml-1">{fullNameError}</p>
                )}
              </div>
            )}

            <div>
              <Input
                type="email"
                placeholder="Email"
                className={`h-12 bg-gray-50 border-gray-200 ${emailError ? "border-red-500" : ""}`}
                value={email}
                onChange={handleEmailChange}
              />
              {emailError && (
                <p className="text-xs text-red-500 mt-1 ml-1">{emailError}</p>
              )}
            </div>

            <div>
              <Input
                type="password"
                placeholder="Password"
                className={`h-12 bg-gray-50 border-gray-200 ${passwordError ? "border-red-500" : ""}`}
                value={password}
                onChange={handlePasswordChange}
              />
              {passwordError && (
                <p className="text-xs text-red-500 mt-1 ml-1">{passwordError}</p>
              )}
            </div>

            {generalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{generalError}</p>
              </div>
            )}

            {!isSignup && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  Remember me
                </label>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-theme hover:bg-theme-dark text-white"
              disabled={isLoading}
            >
              {isLoading ? "Please wait..." : isSignup ? "SIGN UP" : "LOGIN"}
            </Button>

            {!isSignup && (
              <div className="text-center">
                <button 
                  type="button"
                  className="text-sm text-theme hover:text-theme-dark hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Mobile Signup Toggle */}
            <div className="md:hidden text-center pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">
                {isSignup ? "Already have an account?" : "Don't have an account?"}
              </p>
              <button 
                type="button"
                onClick={handleToggleSignup}
                className="text-theme font-medium hover:underline"
              >
                {isSignup ? "Login" : "Signup"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}