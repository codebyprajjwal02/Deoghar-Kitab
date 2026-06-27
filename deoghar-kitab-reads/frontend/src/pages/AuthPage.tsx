import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, User, BookOpen, Shield } from "lucide-react";
import { motion } from "framer-motion";
import LoadingAnimation from "@/components/LoadingAnimation";

// Define user type
interface RegisteredUser {
  name: string;
  email: string;
  password: string;
}

const AuthPage = () => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [userType, setUserType] = useState<"user" | "admin">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  // Check if user credentials are stored in localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    if (savedEmail && savedEmail.includes("@") && savedPassword) {
      setLoginData({
        email: savedEmail,
        password: savedPassword,
      });
      setRememberMe(true);
    }
  }, []);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userType === "admin") {
      // Redirect to exclusive admin login page
      navigate("/admin/login");
      return;
    }
    
    // Show loading animation
    setIsLoading(true);
    setShowLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Get registered users from localStorage
      const registeredUsersString = localStorage.getItem("registeredUsers");
      const registeredUsers: RegisteredUser[] = registeredUsersString ? JSON.parse(registeredUsersString) : [];
      
      // Find user by email
      const user = registeredUsers.find((u: RegisteredUser) => u.email === loginData.email);
      
      // Check if user exists
      if (!user) {
        setError("No account found with this email. Please sign up first.");
        setIsLoading(false);
        setShowLoading(false);
        return;
      }
      
      // Check password
      if (user.password !== loginData.password) {
        setError("Incorrect password. Please try again.");
        setIsLoading(false);
        setShowLoading(false);
        return;
      }
      
      // Clear any previous errors
      setError("");
      
      // Store current user in localStorage to indicate they're logged in
      localStorage.setItem("user", JSON.stringify({
        name: user.name,
        email: user.email,
        userType: userType
      }));
      
      // Save credentials if "Remember Me" is checked
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", loginData.email);
        localStorage.setItem("rememberedPassword", loginData.password);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }
      
      // Navigate to home after login
      // The actual navigation will happen in the LoadingAnimation component
    }, 1500);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show loading animation
    setIsLoading(true);
    setShowLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Validate password confirmation
      if (signupData.password !== signupData.confirmPassword) {
        setError("Passwords do not match. Please try again.");
        setIsLoading(false);
        setShowLoading(false);
        return;
      }
      
      // Validate password length
      if (signupData.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setIsLoading(false);
        setShowLoading(false);
        return;
      }
      
      // Get registered users from localStorage
      const registeredUsersString = localStorage.getItem("registeredUsers");
      const registeredUsers: RegisteredUser[] = registeredUsersString ? JSON.parse(registeredUsersString) : [];
      
      // Check if user with this email already exists
      const existingUser = registeredUsers.find((u: RegisteredUser) => u.email === signupData.email);
      if (existingUser) {
        setError("An account with this email already exists. Please sign in instead.");
        setIsLoading(false);
        setShowLoading(false);
        return;
      }
      
      // Clear any previous errors
      setError("");
      
      // Add new user to registered users
      const newUser: RegisteredUser = {
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
      };
      
      const updatedUsers = [...registeredUsers, newUser];
      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
      
      // Store current user in localStorage to indicate they're logged in
      localStorage.setItem("user", JSON.stringify({
        name: signupData.name,
        email: signupData.email,
        userType: "user"
      }));
      
      // Navigate to home after signup
      // The actual navigation will happen in the LoadingAnimation component
    }, 1500);
  };

  const handleLoadingComplete = () => {
    navigate("/home");
  };

  if (showLoading) {
    return <LoadingAnimation onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iI2ZmZiI+PC9yZWN0Pgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIiBmaWxsPSJyZ2JhKDI1NSwyMDAsMjU1LDAuNSkiPjwvY2lyY2xlPgo8L3N2Zz4=')] opacity-20"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {authMode === "signin" ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {authMode === "signin" 
                ? "Sign in to your Deoghar Kitab account" 
                : "Join our community of book lovers"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {/* User Type Toggle */}
            <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
              <button
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  userType === "user"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setUserType("user")}
              >
                <User className="w-4 h-4 inline mr-2" />
                User
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  userType === "admin"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => {
                  setUserType("admin");
                  // When switching to admin, redirect to exclusive admin login
                  if (authMode === "signin") {
                    setTimeout(() => {
                      navigate("/admin/login");
                    }, 300);
                  }
                }}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Admin
              </button>
            </div>
            
            {authMode === "signin" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      className="pl-10 h-12 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      className="pl-10 pr-10 h-12 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Forgot password?
                  </button>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    `Sign In as ${userType === "admin" ? "Admin" : "User"}`
                  )}
                </Button>
                
                {userType === "admin" && (
                  <div className="text-xs text-center text-gray-500 mt-2">
                    <p>Admin access requires exclusive credentials.</p>
                    <p>You will be redirected to the secure admin login page.</p>
                  </div>
                )}
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="signup-name" className="text-sm font-medium text-gray-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="signup-name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupData.name}
                      onChange={handleSignupChange}
                      className="pl-10 h-12 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-sm font-medium text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      className="pl-10 h-12 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      className="pl-10 pr-10 h-12 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="signup-confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="signup-confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={handleSignupChange}
                      className="pl-10 pr-10 h-12 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="terms"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    required
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                    I agree to the <a href="#" className="text-blue-600 hover:text-blue-800">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-800">Privacy Policy</a>
                  </label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <div className="text-sm text-center text-gray-600">
              {authMode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => {
                  setAuthMode(authMode === "signin" ? "signup" : "signin");
                  setError(""); // Clear error when switching modes
                }}
                className="text-blue-600 font-medium hover:text-blue-800"
              >
                {authMode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </div>
          </CardFooter>
        </Card>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>© 2025 Deoghar Kitab. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;