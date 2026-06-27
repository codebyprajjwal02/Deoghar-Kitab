import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Save, 
  Key,
  ArrowLeft,
  ShieldCheck,
  Clock,
  LogOut,
  Calendar,
  Sparkles,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { logout, getAuthHeaders, updateUserLocal } = useAuth();
  const [user, setUser] = useState<{email: string, name: string, userType: string, id: string, _id?: string} | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [userSellerStatus, setUserSellerStatus] = useState<'user' | 'pending' | 'seller' | null>(null);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      const userData = JSON.parse(userString);
      setUser(userData);
      setProfileData({
        name: userData.name || "",
        email: userData.email || "",
      });
      
      if (userData.id || userData._id) {
        checkSellerStatus(userData.id || userData._id);
      }
    } else {
      toast.error("Please sign in to view your profile");
      navigate("/");
    }
  }, [navigate]);

  const checkSellerStatus = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:3003/api/users/${userId}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const userData = await response.json();
        
        if (userData.userType === 'seller') {
          setUserSellerStatus('seller');
          setSellerInfo(userData.sellerInfo || null);
        } else if (userData.sellerRequest && userData.sellerRequest.requested && !userData.sellerRequest.approved) {
          setUserSellerStatus('pending');
          setSellerInfo(userData.sellerInfo || null);
        } else {
          setUserSellerStatus('user');
        }
      }
    } catch (error) {
      console.error('Error checking seller status:', error);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Update locally
    updateUserLocal({
      name: profileData.name,
      email: profileData.email
    });
    
    if (user) {
      setUser({
        ...user,
        name: profileData.name,
        email: profileData.email
      });
    }
    
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Profile settings updated successfully!");
    }, 500);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Password changed successfully!");
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }, 800);
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const cancelSellerRequest = async () => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to cancel your seller request?")) return;
    
    try {
      const response = await fetch(`http://localhost:3003/api/users/${user.id || user._id}/cancel-seller-request`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        toast.success("Seller request cancelled successfully.");
        setUserSellerStatus('user');
      } else {
        toast.error("Failed to cancel seller request. Please try again.");
      }
    } catch (error) {
      console.error('Error cancelling seller request:', error);
      toast.error("Error cancelling seller request.");
    }
  };

  const inputCls = "pl-10 h-12 bg-white/80 border border-gray-200 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all rounded-xl text-sm";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => navigate("/home")} 
                  variant="outline" 
                  className="rounded-xl border-border/60 hover:bg-muted"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-3xl font-extrabold text-foreground tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Student Account Settings
                  </h1>
                  <p className="text-muted-foreground text-sm">Manage your profile details and preferences</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 self-start sm:self-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>

            {/* Profile Summary Card */}
            <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-card mb-8 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center text-white font-extrabold text-3xl shadow-md border-4 border-amber-100 flex-shrink-0">
                {profileData.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="text-center sm:text-left flex-grow">
                <h2 className="text-2xl font-bold text-foreground mb-0.5">{profileData.name || "Student User"}</h2>
                <p className="text-muted-foreground text-sm mb-3 flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail className="w-4 h-4 text-muted-foreground/70" />
                  {profileData.email}
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-xs font-semibold text-amber-800">
                    <Sparkles className="w-3.5 h-3.5" /> Student Member
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted/60 border border-border/30 rounded-full text-xs font-medium text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" /> Since {new Date().getFullYear()}
                  </span>
                </div>
              </div>
            </div>

            {/* Tab Controls */}
            <div className="flex rounded-2xl bg-muted/60 border border-border/40 p-1 mb-8 max-w-sm">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "profile"
                    ? "bg-card shadow-sm text-amber-600 border border-border/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="w-4 h-4" /> Profile Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("password")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "password"
                    ? "bg-card shadow-sm text-amber-600 border border-border/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Key className="w-4 h-4" /> Security Settings
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "profile" ? (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <Card className="rounded-3xl border border-border/50 shadow-card overflow-hidden">
                    <CardHeader className="border-b border-border/20 px-6 py-5 bg-muted/20">
                      <CardTitle className="text-base font-bold">Personal Information</CardTitle>
                      <CardDescription>Update your basic account info and student credentials</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                            <label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</label>
                            <div className="relative">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4.5 h-4.5" />
                              <Input
                                id="name"
                                name="name"
                                value={profileData.name}
                                onChange={handleProfileChange}
                                className={inputCls}
                                placeholder="Enter your full name"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</label>
                            <div className="relative">
                              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4.5 h-4.5" />
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={profileData.email}
                                onChange={handleProfileChange}
                                className={inputCls}
                                placeholder="Enter your email"
                                required
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end border-t border-border/20 pt-5">
                          <Button 
                            type="submit" 
                            disabled={isLoading}
                            className="bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl h-11 px-6 shadow-md transition-all flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            {isLoading ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>

                    {/* Seller Status Stripe */}
                    {user && userSellerStatus && (
                      <div className="border-t border-border/20 px-6 py-5 bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-sm text-foreground mb-1 flex items-center gap-1.5">
                            <ShoppingBag className="w-4.5 h-4.5 text-amber-500" />
                            Book Bank Seller Panel
                          </h3>
                          <p className="text-xs text-muted-foreground">List textbooks you no longer need and earn money</p>
                        </div>
                        
                        {userSellerStatus === 'seller' && (
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 border border-green-200 text-xs font-semibold text-green-800">
                              <ShieldCheck className="w-3.5 h-3.5 text-green-600" /> Approved Seller
                            </span>
                            <Button 
                              onClick={() => navigate("/seller")} 
                              size="sm"
                              className="bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl"
                            >
                              Go to Dashboard
                            </Button>
                          </div>
                        )}
                        
                        {userSellerStatus === 'pending' && (
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
                              <Clock className="w-3.5 h-3.5 text-amber-600" /> Request Pending
                            </span>
                            <Button 
                              variant="outline"
                              size="sm" 
                              onClick={cancelSellerRequest}
                              className="rounded-xl border-amber-200 hover:bg-amber-50 text-amber-700"
                            >
                              Cancel Request
                            </Button>
                          </div>
                        )}
                        
                        {userSellerStatus === 'user' && (
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline"
                              size="sm" 
                              onClick={() => navigate("/home#sell")}
                              className="rounded-xl border-border/60 hover:bg-muted"
                            >
                              Become a Seller
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <Card className="rounded-3xl border border-border/50 shadow-card overflow-hidden">
                    <CardHeader className="border-b border-border/20 px-6 py-5 bg-muted/20">
                      <CardTitle className="text-base font-bold">Change Password</CardTitle>
                      <CardDescription>Update your security credentials to keep your student account protected</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <form onSubmit={handlePasswordSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                          <label htmlFor="currentPassword" className="text-sm font-semibold text-gray-700">Current Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4.5 h-4.5" />
                            <Input
                              id="currentPassword"
                              name="currentPassword"
                              type={showCurrentPassword ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                              className={`${inputCls} pr-10`}
                              placeholder="Enter current password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700"
                            >
                              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">New Password</label>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4.5 h-4.5" />
                              <Input
                                id="newPassword"
                                name="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className={`${inputCls} pr-10`}
                                placeholder="Enter new password (min. 6 chars)"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700"
                              >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-1.5">
                            <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirm New Password</label>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4.5 h-4.5" />
                              <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className={`${inputCls} pr-10`}
                                placeholder="Confirm new password"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700"
                              >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end border-t border-border/20 pt-5 mt-4">
                          <Button 
                            type="submit" 
                            disabled={isLoading}
                            className="bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl h-11 px-6 shadow-md transition-all flex items-center gap-2"
                          >
                            <Key className="w-4 h-4" />
                            {isLoading ? "Updating..." : "Update Password"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;