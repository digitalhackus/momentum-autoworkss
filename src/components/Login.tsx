import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Wrench, Facebook, Twitter, Linkedin, ArrowLeft } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { api } from "../api/client";

interface LoginProps {
  onLogin: () => void;
}

export const AUTH_TOKEN_KEY = "momentumAuthToken";
const REMEMBER_ME_KEY = "momentumRememberMe";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const validateEmail = (email: string): string | null => {
  const trimmed = email.trim();
  if (!trimmed) return "Please enter a valid email address";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Please enter a valid email address";
  return null;
};

const validatePasswordLogin = (password: string): string | null => {
  if (!password) return "Password is required";
  return null;
};

const validatePasswordSignup = (password: string): string | null => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/\d/.test(password)) return "Password must contain at least one number";
  if (!/[@$!%*?&]/.test(password)) return "Password must contain at least one special character (@$!%*?&)";
  if (!passwordRegex.test(password)) return "Password does not meet all requirements";
  return null;
};

type Step = "login" | "signup" | "otp";

export function Login({ onLogin }: LoginProps) {
  const { theme } = useTheme();
  const [step, setStep] = useState<Step>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  useEffect(() => {
    const remembered = localStorage.getItem(REMEMBER_ME_KEY) === "true";
    const token = remembered ? localStorage.getItem(AUTH_TOKEN_KEY) : sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (token) onLogin();
  }, [onLogin]);

  const clearErrors = () => {
    setEmailError(null);
    setPasswordError(null);
    setFullNameError(null);
    setOtpError(null);
    setGeneralError(null);
    setSuccessMessage(null);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError(null);
    if (generalError) setGeneralError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError(null);
    if (generalError) setGeneralError(null);
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    if (fullNameError) setFullNameError(null);
    if (generalError) setGeneralError(null);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(v);
    if (otpError) setOtpError(null);
    if (generalError) setGeneralError(null);
  };

  const goToSignup = () => {
    setStep("signup");
    clearErrors();
    setEmail("");
    setPassword("");
    setFullName("");
  };

  const goToLogin = () => {
    setStep("login");
    clearErrors();
    setPassword("");
    setOtp("");
    setPendingEmail("");
  };

  const goToOtp = (emailForOtp: string) => {
    setStep("otp");
    setPendingEmail(emailForOtp);
    setOtp("");
    clearErrors();
  };

  const validateSignupForm = (): boolean => {
    let ok = true;
    const ev = validateEmail(email);
    if (ev) { setEmailError(ev); ok = false; }
    const pv = validatePasswordSignup(password);
    if (pv) { setPasswordError(pv); ok = false; }
    if (!fullName.trim()) { setFullNameError("Full name is required"); ok = false; }
    return ok;
  };

  const validateLoginForm = (): boolean => {
    let ok = true;
    const ev = validateEmail(email);
    if (ev) { setEmailError(ev); ok = false; }
    const pv = validatePasswordLogin(password);
    if (pv) { setPasswordError(pv); ok = false; }
    return ok;
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (!validateSignupForm()) return;
    setIsLoading(true);
    try {
      const data = await api.register({ name: fullName.trim(), email: email.trim().toLowerCase(), password });
      goToOtp(email.trim().toLowerCase());
      setSuccessMessage(data.message || "Verification code sent to your email. Enter it below.");
    } catch (err: unknown) {
      setGeneralError(err instanceof Error ? err.message : "Sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (otp.length !== 6) {
      setOtpError("Enter the 6-digit code");
      return;
    }
    setIsLoading(true);
    try {
      await api.verifyOtp({ email: pendingEmail, otp });
      setStep("login");
      setEmail(pendingEmail);
      setSuccessMessage("Email verified successfully. You can now login.");
      setOtp("");
      setPendingEmail("");
    } catch (err: unknown) {
      setGeneralError(err instanceof Error ? err.message : "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (!validateLoginForm()) return;
    setIsLoading(true);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? "true" : "false");
    try {
      const data = await api.login({ email: email.trim().toLowerCase(), password });
      const token = data.token;
      if (!token) {
        setGeneralError("Authentication failed. Please try again.");
        return;
      }
      if (rememberMe) localStorage.setItem(AUTH_TOKEN_KEY, token);
      else sessionStorage.setItem(AUTH_TOKEN_KEY, token);
      onLogin();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed. Please try again.";
      setGeneralError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerificationCode = async () => {
    if (!email.trim()) return;
    setGeneralError(null);
    setIsResendingOtp(true);
    try {
      const data = await api.resendOtp({ email: email.trim().toLowerCase() });
      goToOtp(email.trim().toLowerCase());
      setSuccessMessage(data.message || "Verification code sent. Check your email and enter it below.");
    } catch (err: unknown) {
      setGeneralError(err instanceof Error ? err.message : "Failed to send code. Please try again.");
    } finally {
      setIsResendingOtp(false);
    }
  };

  const isSignup = step === "signup";
  const isOtp = step === "otp";

  return (
    <div className="min-h-screen flex overflow-hidden">
      <div
        className="hidden md:flex md:w-5/12 relative bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(${theme.primaryColor}dd, ${theme.primaryColor}dd), url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')`,
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-between p-8">
          <div />
          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-4">
              <button type="button" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors">
                <Facebook className="h-5 w-5 text-white" />
              </button>
              <button type="button" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors">
                <Twitter className="h-5 w-5 text-white" />
              </button>
              <button type="button" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors">
                <Linkedin className="h-5 w-5 text-white" />
              </button>
            </div>
            <div className="text-center text-white">
              <p className="text-sm mb-2">
                {isOtp ? "Check your email for the code" : isSignup ? "Already have an account?" : "Don't have an account?"}
              </p>
              {!isOtp && (
                <button type="button" onClick={isSignup ? goToLogin : goToSignup} className="text-white font-medium underline hover:no-underline">
                  {isSignup ? "Login" : "Signup"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 md:p-12 bg-white flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-theme p-3 rounded-xl mb-3">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl text-blue-900 tracking-wide">MOMENTUM AUTOWORKS</h1>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {step === "otp" ? (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-5" noValidate>
              <p className="text-sm text-gray-600">We sent a 6-digit code to <strong>{pendingEmail}</strong>. Check your inbox and enter it below.</p>
              <div>
                <Input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={handleOtpChange}
                  className={`h-12 text-center text-lg tracking-[0.5em] font-mono ${otpError ? "border-red-500" : ""}`}
                />
                {otpError && <p className="text-xs text-red-500 mt-1 ml-1">{otpError}</p>}
              </div>
              {generalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{generalError}</p>
                </div>
              )}
              <Button type="submit" className="w-full h-12 bg-theme hover:bg-theme-dark text-white" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify email"}
              </Button>
              <button type="button" onClick={goToSignup} className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-theme">
                <ArrowLeft className="h-4 w-4" /> Back to sign up
              </button>
            </form>
          ) : (
            <form onSubmit={isSignup ? handleSignupSubmit : handleLoginSubmit} className="space-y-5" noValidate>
              {isSignup && (
                <div>
                  <Input
                    type="text"
                    placeholder="Full Name"
                    className={`h-12 bg-gray-50 border-gray-200 ${fullNameError ? "border-red-500" : ""}`}
                    value={fullName}
                    onChange={handleFullNameChange}
                  />
                  {fullNameError && <p className="text-xs text-red-500 mt-1 ml-1">{fullNameError}</p>}
                </div>
              )}

              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  autoComplete={isSignup ? "email" : "email"}
                  className={`h-12 bg-gray-50 border-gray-200 ${emailError ? "border-red-500" : ""}`}
                  value={email}
                  onChange={handleEmailChange}
                />
                {emailError && <p className="text-xs text-red-500 mt-1 ml-1">{emailError}</p>}
              </div>

              {!isOtp && (
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    className={`h-12 bg-gray-50 border-gray-200 ${passwordError ? "border-red-500" : ""}`}
                    value={password}
                    onChange={handlePasswordChange}
                  />
                  {passwordError && <p className="text-xs text-red-500 mt-1 ml-1">{passwordError}</p>}
                  {isSignup && (
                    <p className="text-xs text-gray-500 mt-1 ml-1">
                      Min 8 characters, one uppercase, one lowercase, one number, one of @$!%*?&
                    </p>
                  )}
                </div>
              )}

              {generalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{generalError}</p>
                  {!isSignup && generalError === "Please verify your email first." && (
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <p className="text-sm text-gray-700 mb-2">We can send a new verification code to your email.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full border-theme text-theme hover:bg-theme/10"
                        onClick={handleSendVerificationCode}
                        disabled={isResendingOtp}
                      >
                        {isResendingOtp ? "Sending..." : "Send verification code"}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {!isSignup && (
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" checked={rememberMe} onCheckedChange={(c) => setRememberMe(c === true)} />
                  <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">Remember me</label>
                </div>
              )}

              <Button type="submit" className="w-full h-12 bg-theme hover:bg-theme-dark text-white" disabled={isLoading}>
                {isLoading ? "Please wait..." : isSignup ? "SIGN UP" : "LOGIN"}
              </Button>

              {!isSignup && (
                <div className="text-center">
                  <button type="button" className="text-sm text-theme hover:text-theme-dark hover:underline">Forgot Password?</button>
                </div>
              )}

              <div className="md:hidden text-center pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">{isSignup ? "Already have an account?" : "Don't have an account?"}</p>
                <button type="button" onClick={isSignup ? goToLogin : goToSignup} className="text-theme font-medium hover:underline">
                  {isSignup ? "Login" : "Signup"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
