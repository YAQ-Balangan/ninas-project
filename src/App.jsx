// File: src/App.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "./utils/supabaseClient";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; // Ini adalah file App.jsx Anda yang lama

export default function App() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Cek sesi saat aplikasi pertama kali dimuat
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // 2. Dengarkan perubahan (ketika user login atau logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Tampilan loading sementara
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Jika belum ada sesi (belum login), tampilkan halaman Login
  if (!session) {
    return <Login />;
  }

  // Jika sudah login, tampilkan Dashboard (aplikasi utama)
  return <Dashboard />;
}