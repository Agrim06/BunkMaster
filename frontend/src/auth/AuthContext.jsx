import React, { createContext, useContext, useState, useEffect } from "react";
import { getMe, logoutUser } from "../api/auth.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkSession = async () => {
        try {
            const data = await getMe();
            setUser(data);
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkSession();

        const handleExpired = () => {
            setUser(null);
            setLoading(false);
        };

        window.addEventListener("authSessionExpired", handleExpired);
        return () => window.removeEventListener("authSessionExpired", handleExpired);
    }, []);

    const login = (userData) => {
        setUser(userData || null);
        if (!userData) {
            checkSession();
        }
    };

    const logout = async () => {
        try {
            await logoutUser();
        } catch (err) {
            console.error("Error logging out:", err);
        } finally {
            setUser(null);
        }
    };

    const refreshUser = async () => {
        await checkSession();
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
