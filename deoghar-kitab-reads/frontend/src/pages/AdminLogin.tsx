import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import LoadingAnimation from "@/components/LoadingAnimation";
import { useAuth } from "@/contexts/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  // Admin credentials will be verified through the database

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show loading animation
    setIsLoading(true);
    
    try {
      // Prepare login data
      const loginDataToSend = {
        email: loginData.email,
        password: loginData.password,
      };
      
      // Call the backend API to authenticate the user
      const response = await fetch("http://localhost:3003/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginDataToSend),
      });
      
      const userData = await response.json();

      if (response.ok) {
        // Check if user is an admin
        if (userData.userType === "admin") {
          // Store user and token via AuthContext
          login(userData, userData.token);
          
          setError("");
          setShowLoading(true);
        } else {
          setError("Access denied. Admin privileges required.");
          setIsLoading(false);
          setShowLoading(false);
        }
      } else {
        setError(userData.message || "Invalid admin credentials. Access restricted to authorized personnel only.");
        setIsLoading(false);
        setShowLoading(false);
      }
    } catch (error) {
      console.error("Error during admin login:", error);
      setError("An error occurred during login. Please try again.");
      setIsLoading(false);
      setShowLoading(false);
    }
  };

  const handleLoadingComplete = () => {
    navigate("/admin");
  };

  const handleBackToLogin = () => {
    navigate("/");
  };

  if (showLoading) {
    return <LoadingAnimation onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="mb-4">
          <Button 
            variant="ghost" 
            onClick={handleBackToLogin}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to User Login
          </Button>
        </div>
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Admin Access Only
            </CardTitle>
            <CardDescription className="text-gray-600">
              Exclusive access for authorized administrators
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Admin Email</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="sprajjwalsingh230@gmail.com"
                  value={loginData.email}
                  onChange={handleInputChange}
                  className="h-12 border-gray-300 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Admin Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    value={loginData.password}
                    onChange={handleInputChange}
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
              
              {error && (
                <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                  {error}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Authenticating...
                  </div>
                ) : (
                  "Access Admin Panel"
                )}
              </Button>
              
              <div className="text-xs text-center text-gray-500 mt-4">
                <p>This area is restricted to authorized administrators only.</p>
                <p>All activities are logged and monitored.</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLogin;