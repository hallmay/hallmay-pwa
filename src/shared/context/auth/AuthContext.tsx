import { type UserCredential, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { createContext, useState, useEffect, useContext } from "react";
import { auth } from "../../firebase/firebase";
import type { User } from "../../types";

interface AuthContextType {
    currentUser: User | null;
    login: (user: string, password: string) => Promise<UserCredential>;
    logout: () => Promise<void>;
    loading: boolean
}

const AuthContext = createContext<AuthContextType>({ currentUser: null, logout: () => new Promise<void>(() => { }), login: () => new Promise<UserCredential>(() => { }), loading: true });

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        return signOut(auth);
    }

    const login = (email: string, password: string) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const idTokenResult = await user.getIdTokenResult();
                const organizationId = idTokenResult.claims.orgId as string;
                const role = idTokenResult.claims.role as string;
                const accessible_field_ids = idTokenResult.claims.accessibleFieldIds as string[] || [];

                setCurrentUser({
                    organizationId,
                    role,
                    uid: user.uid,
                    accessibleFieldIds: accessible_field_ids
                });
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Hook para consumir el contexto fácilmente
const useAuth = () => {
    return useContext(AuthContext);
};

// eslint-disable-next-line react-refresh/only-export-components
export default useAuth;