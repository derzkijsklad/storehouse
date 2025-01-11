/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, ReactNode } from "react";
import { jwtDecode } from "jwt-decode"; 

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

interface User {
  id: string;
  role: "admin" | "manager"; 
}

interface DecodedToken {
  id: string;
  role: "admin" | "manager";
  exp: number;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (token: string) => {
    const decoded: DecodedToken = jwtDecode(token);
    setUser({ id: decoded.id, role: decoded.role });
    sessionStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("token"); 
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
