"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../../firebase";

const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Check if user is allowed in Firestore users collection
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          setAllowed(userDoc.exists());
        } catch (error) {
          console.error("Error checking user access:", error);
          setAllowed(false);
        }
      } else {
        setAllowed(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: "1rem" }}>
        <h1>Family Timeline</h1>
        <button onClick={signIn} style={{ padding: "0.8rem 1.5rem", cursor: "pointer" }}>
          Sign in with Google
        </button>
      </div>
    );
  }

  // Not allowed
  if (!allowed) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: "1rem" }}>
        <h1>Access Denied</h1>
        <p>Your account ({user.email}) is not authorized to access this app.</p>
        <button onClick={signOut} style={{ padding: "0.8rem 1.5rem", cursor: "pointer" }}>
          Sign out
        </button>
      </div>
    );
  }

  // Allowed - render app
  const value = {
    user,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
