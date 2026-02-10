import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Wrench, Facebook, Twitter, Linkedin } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Clear any stale auth before attempting login
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        setIsLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        // Also save user info if needed
        localStorage.setItem("user", JSON.stringify(data.user));
        onLogin();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
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
                onClick={() => setIsSignup(!isSignup)}
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
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md border border-red-200">
                {error}
              </div>
            )}
            {isSignup && (
              <div>
                <Input
                  type="text"
                  placeholder="Full Name"
                  className="h-12 bg-gray-50 border-gray-200"
                  required
                />
              </div>
            )}

            <div>
              <Input
                type="email"
                placeholder="User Name"
                className="h-12 bg-gray-50 border-gray-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="Password"
                className="h-12 bg-gray-50 border-gray-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

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
              {isLoading ? "LOGGING IN..." : (isSignup ? "SIGN UP" : "LOGIN")}
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
                onClick={() => setIsSignup(!isSignup)}
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
