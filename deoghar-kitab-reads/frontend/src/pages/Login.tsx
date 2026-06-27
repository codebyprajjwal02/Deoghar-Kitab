import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import LoadingAnimation from "@/components/LoadingAnimation";
import { useAuth } from "@/contexts/AuthContext";

// Define user type
interface RegisteredUser {
  name: string;
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"buyer" | "seller" | "admin">("buyer");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userType === "admin") {
      // Redirect to exclusive admin login page
      navigate("/admin/login");
      return;
    }
    
    // Show loading animation
    setIsLoading(true);
    
    try {
      // Prepare login data
      const loginData = {
        email: formData.email,
        password: formData.password,
      };
      
      // Call the backend API to authenticate the user
      const response = await fetch("http://localhost:3003/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });
      
      const userData = await response.json();

      if (response.ok) {
        // Store user and token via AuthContext
        login(userData, userData.token);
        
        // Clear any previous errors
        setError("");
        setShowLoading(true);
      } else {
        setError(userData.message || "Login failed. Please check your credentials.");
        setIsLoading(false);
        setShowLoading(false);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred during login. Please try again.");
      setIsLoading(false);
      setShowLoading(false);
    }
  };

  const handleLoadingComplete = () => {
    if (userType === "admin") {
      navigate("/admin");
    } else {
      navigate("/home");
    }
  };

  if (showLoading) {
    return <LoadingAnimation onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary p-3 rounded-full">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">{t.auth.loginTitle}</CardTitle>
            <CardDescription>
              {t.navbar.signIn} to your Deoghar Kitab account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="flex gap-2 mb-6">
              <Button
                variant={userType === "buyer" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setUserType("buyer")}
              >
                {t.auth.buyer}
              </Button>
              <Button
                variant={userType === "seller" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setUserType("seller")}
              >
                {t.auth.seller}
              </Button>
              <Button
                variant={userType === "admin" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setUserType("admin")}
              >
                {t.auth.admin}
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">{t.auth.email}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">{t.auth.password}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
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
                    className="h-4 w-4 rounded border-input bg-background focus:ring-primary"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm">
                    {t.auth.rememberMe}
                  </label>
                </div>
                <Link to="#" className="text-sm text-primary hover:underline">
                  {t.auth.forgotPassword}
                </Link>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t.auth.signIn}
                  </div>
                ) : (
                  t.auth.signIn
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <div className="text-sm text-center">
              {t.auth.dontHaveAccount}{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                {t.auth.signUp}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;