import { useState, useEffect } from "react";
import { authService } from "../services/auth.service";

const QUICK_ACCOUNTS = {
  USER: { email: "customer1@sportbooking.com", password: "customer123" },
  OWNER: { email: "owner1@sportbooking.com", password: "owner123" },
  ADMIN: { email: "admin@sportbooking.com", password: "admin123" },
};

export const useAuth = () => {
  const [user, setUser] = useState(null);

  const getStoredUser = () => authService.getCurrentUser();

  useEffect(() => {
    setUser(getStoredUser());

    const handleStorageChange = () => {
      setUser(getStoredUser());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = async (email, password) => {
    const safeUser = await authService.login({ email, password });
    setUser(safeUser);
    return safeUser;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const registerUser = async (fullName, email, password, role = "USER") => {
    const safeUser = await authService.register({ fullName, email, password, role });
    setUser(safeUser);
    return safeUser;
  };

  const switchRole = async (roleName) => {
    if (roleName === "GUEST") {
      logout();
      window.location.reload();
      return;
    }

    const creds = QUICK_ACCOUNTS[roleName];
    if (!creds) return;

    try {
      await authService.login(creds);
      window.location.reload();
    } catch (err) {
      alert(err.message || "Không thể chuyển vai trò nhanh.");
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isUser: user?.role === "USER",
    isOwner: user?.role === "OWNER",
    isAdmin: user?.role === "ADMIN",
    login,
    logout,
    register: registerUser,
    switchRole,
  };
};
