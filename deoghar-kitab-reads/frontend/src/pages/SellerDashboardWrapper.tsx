import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SellerRegistrationForm from "@/components/SellerRegistrationForm";
import SellerDashboard from "@/pages/SellerDashboard";
import { SellerData } from "@/components/SellerRegistrationForm";
import { useAuth } from "@/contexts/AuthContext";

const SellerDashboardWrapper = () => {
  const navigate = useNavigate();
  const { user, getAuthHeaders } = useAuth();
  const [isSellerRegistered, setIsSellerRegistered] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(true);
  const [isAdminApproved, setIsAdminApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    const checkSellerRequestStatus = async () => {
      try {
        const response = await fetch(`http://localhost:3003/api/users/${user.id || user._id}`, {
          headers: getAuthHeaders()
        });
        if (response.ok) {
          const userData = await response.json();
          if (userData.userType === "seller") {
            setIsSellerRegistered(true);
            setIsAdminApproved(true);
            setShowRegistrationForm(false);
          } else if (userData.sellerRequest && userData.sellerRequest.requested) {
            setIsSellerRegistered(true);
            setIsAdminApproved(false);
            setShowRegistrationForm(false);
          } else {
            setIsSellerRegistered(false);
            setShowRegistrationForm(true);
          }
        }
      } catch (error) {
        console.error("Error checking seller status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSellerRequestStatus();
  }, [user, navigate]);

  const handleSellerRegistration = () => {
    // Registration form will handle submitting the request to API.
    // We just refresh the state here by setting registered to true.
    setIsSellerRegistered(true);
    setShowRegistrationForm(false);
    
    alert("Your seller registration is submitted and pending admin approval.");
    navigate("/home");
  };

  const handleCancelRegistration = () => {
    navigate("/home");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {showRegistrationForm && (
        <SellerRegistrationForm 
          onSubmit={handleSellerRegistration} 
          onCancel={handleCancelRegistration} 
        />
      )}
      
      {isSellerRegistered && isAdminApproved && <SellerDashboard />}
      
      {isSellerRegistered && !isAdminApproved && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto mt-8">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Seller Registration Pending</h2>
            <p className="text-yellow-700 mb-4">
              Your seller registration is pending admin approval. You will receive access to the seller dashboard once approved.
            </p>
            <button 
              onClick={() => navigate("/home")}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboardWrapper;