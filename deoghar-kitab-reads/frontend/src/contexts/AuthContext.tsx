import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { API_BASE_URL } from "@/lib/api";

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

const mapFirebaseError = (code: string): string => {
  switch (code) {
    case "auth/invalid-email":
      return "Invalid email address";
    case "auth/user-not-found":
      return "No account found with this email";
    case "auth/wrong-password":
      return "Incorrect password";
    case "auth/email-already-in-use":
      return "Email already in use. Please sign in.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/network-request-failed":
      return "Network error. Please try again.";
    case "auth/operation-not-allowed":
      return "Operation not allowed. Please contact support.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in cancelled.";
    default:
      return "Something went wrong. Please try again.";
  }
};

export const getFirebaseErrorMessage = mapFirebaseError;

const syncBackendWithFirebaseUser = async (
  fbUser: FirebaseUser
): Promise<{ user: User; token: string } | null> => {
  try {
    const payload = {
      firebaseUid: fbUser.uid,
      email: fbUser.email ?? "",
      name: fbUser.displayName ?? (fbUser.email ? fbUser.email.split("@")[0] : "User"),
    };

    const res = await fetch(`${API_BASE_URL}/api/users/firebase-sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("Firebase sync failed:", res.status);
      return null;
    }

    const data = await res.json();
    const token: string = data.token;
    const user: User = {
      _id: data._id,
      id: data.id,
      name: data.name,
      email: data.email,
      userType: data.userType,
      sellerRequest: data.sellerRequest,
      isSellerApproved: data.isSellerApproved,
      sellerRequestStatus: data.sellerRequestStatus,
      createdAt: data.createdAt,
    };
    return { user, token };
  } catch (err) {
    console.error("syncBackendWithFirebaseUser failed:", err);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.email) {
        const synced = await syncBackendWithFirebaseUser(fbUser);
        if (synced) {
          setUser(synced.user);
          setToken(synced.token);
          localStorage.setItem("user", JSON.stringify(synced.user));
          localStorage.setItem("token", synced.token);
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (userData: User, userToken: string, rememberMe: boolean = false) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);

    if (rememberMe && userData.email) {
      localStorage.setItem("rememberedEmail", userData.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }
  };

  const logout = () => {
    signOut(auth).catch((err) => {
      console.error("Firebase signOut error:", err);
    });
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const updateUserLocal = (updatedFields: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updatedFields };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

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
        isAuthenticated: !!user,
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
