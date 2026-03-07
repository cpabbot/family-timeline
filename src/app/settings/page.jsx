"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./settings.module.css";
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [compact, setCompact] = useState(false);

  // Load compact setting from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("compactView");
    if (saved !== null) {
      setCompact(JSON.parse(saved));
    }
  }, []);

  // Save compact setting to localStorage
  const handleCompactToggle = () => {
    const newValue = !compact;
    setCompact(newValue);
    localStorage.setItem("compactView", JSON.stringify(newValue));
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <main>
      <div className="flex-row container">
        <BackButton />
        <h1 className="title">Settings</h1>
      </div>

      <div className={styles.container}>
        <section className={styles.section}>
          <h2>Display Preferences</h2>
          <div className={styles.setting}>
            <label>
              <input
                type="checkbox"
                checked={compact}
                onChange={handleCompactToggle}
              />
              Compact Event View
            </label>
          </div>
        </section>

         <section className={styles.section}>
          <h2>Export</h2>
          <Button onClick={handleSignOut}>
            Download CSV
          </Button>
        </section>

        <section className={styles.section}>
          <h2>Account</h2>
          <Button onClick={handleSignOut}>
            Sign Out
          </Button>
        </section>
      </div>
    </main>
  );
}
