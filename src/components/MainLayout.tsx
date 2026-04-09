"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { Loader2 } from "lucide-react";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Revisar si el usuario ya tiene una sesión activa guardada
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!mounted) return;

      if (session) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        // Solo redirigir si NO estamos ya en la página de login
        if (pathname !== "/login") {
          router.replace("/login");
        }
      }
      setIsLoading(false);
    };

    checkAuth();

    // 2. Quedarse escuchando por si el usuario inicia o cierra sesión
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (session) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        if (pathname !== "/login") {
          router.replace("/login");
        }
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  // Pantalla de Login: No mostramos el sidebar ni el padding del dashboard
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Pantalla de carga mientras se verifica la sesión de Supabase
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-500 font-medium animate-pulse">Verificando seguridad...</p>
      </div>
    );
  }

  // Si no está autenticado y no es login, retornamos null (para evitar destellos antes de que el router lo eche)
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 w-full transition-all duration-300 md:ml-64">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
