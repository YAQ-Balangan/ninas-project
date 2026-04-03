// File: src/pages/Login.jsx
import React, { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Lock } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // --- TRIK JITU DI SINI ---
    // Kita paksa apapun yang diketik di kolom username
    // menjadi huruf kecil dan ditambahi @sekolah.com di belakangnya
    // Contoh: ketik "admin" -> otomatis jadi "admin@sekolah.com"
    const fakeEmail = `${username.toLowerCase().trim()}@sekolah.com`;

    // Kirim fakeEmail tersebut ke Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password: password,
    });

    if (error) {
      setErrorMsg("Gagal masuk. Cek kembali Username dan Password!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50 px-4 selection:bg-teal-200">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(20,184,166,0.1)] border border-white/60">
        <div className="flex justify-center mb-6">
          <img
            src="/logo.svg"
            alt="Logo Nina"
            className="w-20 h-20 drop-shadow-sm"
          />
        </div>

        <h2 className="text-3xl font-black text-center text-[#000080] font-bismillah mb-1 tracking-widest drop-shadow-sm">
          Nina Rahell Project
        </h2>
        <p className="text-center text-teal-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
          Sistem Manajemen Akademik
        </p>

        {errorMsg && (
          <div className="bg-rose-50 text-rose-600 text-xs font-semibold p-3 rounded-xl mb-5 text-center border border-rose-200 shadow-sm animate-in fade-in zoom-in-95">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">
              Username Admin
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3.5 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold text-slate-700 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all shadow-sm"
              placeholder="username"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3.5 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold text-slate-700 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all shadow-sm"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 rounded-xl text-white bg-gradient-to-r from-teal-500 to-emerald-600 shadow-[0_10px_20px_rgba(20,184,166,0.3)] hover:shadow-[0_15px_30px_rgba(20,184,166,0.4)] hover:-translate-y-1 transition-all duration-300 font-black text-xs uppercase tracking-widest flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Memeriksa Kredensial...</span>
            ) : (
              <>
                <Lock size={16} /> Masuk Aplikasi
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
