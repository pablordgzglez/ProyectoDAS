"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import styles from "./ProtectedRoute.module.css";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { isAuthenticated, authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return <p className={styles.message}>Comprobando autenticacion...</p>;
  }

  if (!isAuthenticated) {
    return <p className={styles.message}>Redirigiendo al login...</p>;
  }

  return children;
}
