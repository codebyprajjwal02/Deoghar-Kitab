import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, BookOpen, User, Lock, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import LoadingAnimation from "@/components/LoadingAnimation";

const AnimatedAuth = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"character" | "login" | "signup">("character");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<"buyer" | "seller">("buyer");
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
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  // Handle character animation sequence
  useEffect(() => {
    if (currentView === "character") {
      const timer = setTimeout(() => {
        setCurrentView("login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentView]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Show loading animation
    setIsLoading(true);
    setShowLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Handle login logic here
      console.log("Login submitted:", loginData);
      // Navigate to home after login will happen in the LoadingAnimation component
    }, 1500);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Show loading animation
    setIsLoading(true);
    setShowLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Handle signup logic here
      console.log("Signup submitted:", { ...signupData, userType });
      // Navigate to home after signup will happen in the LoadingAnimation component
    }, 1500);
  };

  const handleLoadingComplete = () => {
    navigate("/home");
  };

  const kickToSignup = () => {
    setCurrentView("signup");
  };

  const kickToLogin = () => {
    setCurrentView("login");
  };

  if (showLoading) {
    return <LoadingAnimation onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-secondary/10 blur-3xl"></div>
      
      {/* Character Animation Scene */}
      <AnimatePresence>
        {currentView === "character" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Dark background */}
            <div className="absolute inset-0 bg-gray-900"></div>
            
            {/* Light beam that will appear */}
            <motion.div
              className="absolute w-96 h-96 rounded-full bg-yellow-200/20 blur-3xl"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2, opacity: 0.5 }}
              transition={{ duration: 1, delay: 1 }}
            />
            
            {/* Character walking in */}
            <motion.div
              className="relative z-10"
              initial={{ x: -300, y: 50 }}
              animate={{ x: 0, y: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
            >
              {/* Character body */}
              <div className="relative">
                {/* Body */}
                <div className="w-16 h-24 bg-blue-600 rounded-t-full mx-auto"></div>
                
                {/* Head */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-orange-300 rounded-full"></div>
                
                {/* Arms */}
                <div className="absolute top-4 -left-4 w-8 h-2 bg-blue-600 rounded-full origin-right"
                     style={{ transform: 'rotate(30deg)' }}></div>
                <div className="absolute top-4 -right-4 w-8 h-2 bg-blue-600 rounded-full origin-left"
                     style={{ transform: 'rotate(-30deg)' }}></div>
                
                {/* Legs */}
                <div className="absolute bottom-0 left-2 w-2 h-8 bg-blue-800 rounded-full"></div>
                <div className="absolute bottom-0 right-2 w-2 h-8 bg-blue-800 rounded-full"></div>
                
                {/* Hand with light switch */}
                <motion.div 
                  className="absolute top-2 -right-8 w-4 h-4 bg-yellow-300 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5 }}
                />
              </div>
            </motion.div>
            
            {/* Light switch */}
            <motion.div
              className="absolute left-1/4 top-1/2 w-4 h-8 bg-gray-700 rounded-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <motion.div
                className="absolute top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-300 rounded-full"
                initial={{ y: 0 }}
                animate={{ y: 4 }}
                transition={{ delay: 1.5, duration: 0.3 }}
              />
            </motion.div>
            
            {/* Text */}
            <motion.div
              className="absolute bottom-20 text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
            >
              <p className="text-xl">Turning on the light...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Page */}
      <AnimatePresence>
        {currentView === "login" && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="shadow-lg relative overflow-hidden">
              {/* Kick effect when switching to signup */}
              {currentView === "login" && (
                <motion.div
                  className="absolute inset-0 bg-red-500 z-20"
                  initial={false}
                  animate={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                  onAnimationComplete={() => {
                    // Reset animation when going back to login
                  }}
                />
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <BookOpen className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to your Deoghar Kitab account
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={handleLoginChange}
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
                        Remember me
                      </label>
                    </div>
                    <a href="#" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing In...
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </CardContent>
              
              <CardFooter className="flex flex-col">
                <div className="text-sm text-center mb-2">
                  New user?{" "}
                  <button 
                    onClick={kickToSignup}
                    className="text-primary font-medium hover:underline"
                  >
                    Sign up here
                  </button>
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  Character will kick this page to reveal signup
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signup Page */}
      <AnimatePresence>
        {currentView === "signup" && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-2xl">Create Account</CardTitle>
                <CardDescription>
                  Join as a buyer or seller
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex gap-2 mb-6">
                  <Button
                    variant={userType === "buyer" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setUserType("buyer")}
                  >
                    Buyer
                  </Button>
                  <Button
                    variant={userType === "seller" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setUserType("seller")}
                  >
                    Seller
                  </Button>
                </div>
                
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="signup-name" className="text-sm font-medium">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="signup-name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={signupData.name}
                        onChange={handleSignupChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="signup-email" className="text-sm font-medium">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={signupData.email}
                        onChange={handleSignupChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="signup-password" className="text-sm font-medium">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={signupData.password}
                        onChange={handleSignupChange}
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
                  
                  <div className="space-y-2">
                    <label htmlFor="signup-confirmPassword" className="text-sm font-medium">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="signup-confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={signupData.confirmPassword}
                        onChange={handleSignupChange}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="terms"
                      type="checkbox"
                      className="h-4 w-4 rounded border-input bg-background focus:ring-primary"
                      required
                    />
                    <label htmlFor="terms" className="ml-2 text-sm">
                      I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                    </label>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
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
              </CardContent>
              
              <CardFooter className="flex flex-col">
                <div className="text-sm text-center">
                  Already have an account?{" "}
                  <button 
                    onClick={kickToLogin}
                    className="text-primary font-medium hover:underline"
                  >
                    Sign in
                  </button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedAuth;