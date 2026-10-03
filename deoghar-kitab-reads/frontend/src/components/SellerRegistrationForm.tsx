import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Navigation, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

export interface SellerData {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
}

interface SellerRegistrationFormProps {
  onSubmit: (data: SellerData) => void;
  onCancel: () => void;
}

const SellerRegistrationForm = ({ onSubmit, onCancel }: SellerRegistrationFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Pre-fill user data from localStorage
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const u = JSON.parse(userString);
        setFormData(prev => ({
          ...prev,
          name: u.name || "",
          email: u.email || "",
        }));
      } catch (e) {
        console.error("Error parsing prefilled user data", e);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            location: `Deoghar (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
          }));
          setLoading(false);
          toast.success("Location updated successfully!");
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Unable to fetch location automatically. Please type it.");
          setLoading(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }
    
    if (!formData.location.trim()) {
      newErrors.location = "Location / Hostels details are required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      
      try {
        const userString = localStorage.getItem("user");
        if (!userString) {
          toast.error("Please sign in first");
          setLoading(false);
          return;
        }
        
        const userData = JSON.parse(userString);
        const token = localStorage.getItem("token");
        
        const sellerRequestData = {
          name: formData.name,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          email: formData.email
        };
        
        // Register seller on local backend
        const response = await fetch(`${API_BASE_URL}/api/users/${userData.id || userData._id}/request-seller`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          },
          body: JSON.stringify(sellerRequestData),
        });
        
        if (response.ok) {
          // Pre-save registration in local storage for details page visibility check
          localStorage.setItem(`seller_${formData.email}`, JSON.stringify({
            ...sellerRequestData,
            showPhone: true
          }));
          
          toast.success("Seller registration submitted for approval!");
          onSubmit(formData);
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to submit request");
        }
      } catch (error) {
        console.error("Error submitting seller request:", error);
        toast.error("Error submitting application");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Please check the form inputs");
    }
  };

  const inputCls = "pl-10 h-11 bg-white/80 border border-gray-200 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all rounded-xl text-sm";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        className="w-full max-w-md my-8"
      >
        <Card className="rounded-3xl border border-border/40 shadow-2xl overflow-hidden bg-card">
          <CardHeader className="bg-muted/15 border-b border-border/20 px-6 py-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 mx-auto mb-3 shadow-sm">
              <BookOpen className="w-6 h-6 animate-pulse-scale" />
            </div>
            <CardTitle className="text-xl font-extrabold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              Become a Seller
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Provide your campus details to start listing books and textbooks.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="name" className="text-xs font-semibold text-gray-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`${inputCls} ${errors.name ? "border-red-400 focus:ring-red-100" : ""}`}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                {errors.name && <p className="text-red-500 text-[10px] pl-1">{errors.name}</p>}
              </div>
              
              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-semibold text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`${inputCls} ${errors.email ? "border-red-400 focus:ring-red-100" : ""}`}
                    placeholder="student@example.com"
                    required
                  />
                </div>
                {errors.email && <p className="text-red-500 text-[10px] pl-1">{errors.email}</p>}
              </div>
              
              <div className="space-y-1">
                <label htmlFor="phone" className="text-xs font-semibold text-gray-700">10-Digit Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`${inputCls} ${errors.phone ? "border-red-400 focus:ring-red-100" : ""}`}
                    placeholder="e.g. 9876543210"
                    required
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-[10px] pl-1">{errors.phone}</p>}
              </div>
              
              <div className="space-y-1">
                <label htmlFor="location" className="text-xs font-semibold text-gray-700">Campus Location / Hostels / City</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`${inputCls} pr-12 ${errors.location ? "border-red-400 focus:ring-red-100" : ""}`}
                    placeholder="e.g. Hostel A Room 204 or Deoghar Town"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-lg hover:bg-muted text-amber-600"
                    onClick={handleGetCurrentLocation}
                    disabled={loading}
                    title="Get location coordinates"
                  >
                    <Navigation className="w-4 h-4" />
                  </Button>
                </div>
                {errors.location && <p className="text-red-500 text-[10px] pl-1">{errors.location}</p>}
              </div>
              
              <div className="space-y-1">
                <label htmlFor="bio" className="text-xs font-semibold text-gray-700">Short Bio (Optional)</label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Share a word about the books you plan to sell"
                  className="rounded-xl border border-gray-200 text-xs"
                  rows={2}
                />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between p-6 bg-muted/10 border-t border-border/20">
            <Button 
              variant="outline" 
              onClick={onCancel} 
              disabled={loading}
              className="rounded-xl border-border/60 hover:bg-muted"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow-md hover:shadow-amber-500/20 transition-all"
            >
              {loading ? "Submitting..." : "Submit Registration"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default SellerRegistrationForm;