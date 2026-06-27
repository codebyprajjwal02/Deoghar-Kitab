import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  userType: "buyer" | "seller" | "admin" | "user";
  sellerRequest?: {
    requested: boolean;
    requestedAt: string | null;
    approved: boolean;
    approvedAt: string | null;
  };
  isSellerApproved?: boolean;
  sellerRequestStatus?: "none" | "pending" | "approved" | "rejected";
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token: string, rememberMe?: boolean) => void;
  logout: () => void;
  updateUserLocal: (updatedUser: Partial<User>) => void;
  getAuthHeaders: () => HeadersInit;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth State from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Error loading auth data from localStorage:", error);
        // Clear corrupt data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = (userData: User, userToken: string, rememberMe: boolean = false) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);

    if (rememberMe) {
      localStorage.setItem("rememberedEmail", userData.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Update user details locally (e.g. after profile edit or seller request)
  const updateUserLocal = (updatedFields: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updatedFields };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  // Helper to generate authorization headers
  const getAuthHeaders = (): HeadersInit => {
    const currentToken = token || localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        updateUserLocal,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
