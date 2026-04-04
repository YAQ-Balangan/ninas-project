// File: src/pages/Login.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../utils/supabaseClient";
import {
  User,
  Lock,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const fakeEmail = `${username.toLowerCase().trim()}@sekolah.com`;

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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-screen p-6 relative selection-live-bg overflow-hidden z-0 font-sans"
    >
      {/* CSS Khusus untuk Live Wallpaper Background (Diadopsi dari Selection.jsx) */}
      <style>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .selection-live-bg {
          background: linear-gradient(-45deg, #f0fdf4, #ecfdf5, #fffbeb, #f0fdfa);
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
        }
      `}</style>

      {/* Elemen Latar Belakang Melayang (Floating Blobs - Diadopsi dari Selection.jsx) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -100, 50, 0],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-emerald-300/20 rounded-[40%] blur-[80px]"
        />
        <motion.div
          animate={{
            x: [0, -100, 50, 0],
            y: [0, 100, -50, 0],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] bg-amber-300/15 rounded-[45%] blur-[80px]"
        />
        <motion.div
          animate={{
            x: [0, 50, -100, 0],
            y: [0, 50, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] left-[20%] w-[40vw] h-[40vw] bg-teal-300/20 rounded-full blur-[100px]"
        />
      </div>

      {/* FORM CARD */}
      <div className="w-full max-w-[360px] sm:max-w-[380px] bg-white/90 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 relative z-10 border border-white/50 overflow-hidden">
        {/* ANIMASI STROKE MERCUSUAR 2 ARAH (DIPERTAHANKAN) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_25%,#14b8a6_50%,transparent_75%,#14b8a6_100%)] pointer-events-none -z-20"
        />
        {/* Layer solid di dalam untuk menutupi bagian tengah */}
        <div className="absolute inset-[2px] bg-white/95 backdrop-blur-2xl rounded-[2.5rem] pointer-events-none -z-10" />

        <div className="flex flex-col items-center mb-8 text-center">
          {/* LOGO BOBBING (Diadopsi dari Selection.jsx) */}
          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-4 relative overflow-hidden rounded-2xl group"
          >
            <img
              src="/logo.svg"
              alt="Logo Nina"
              className="w-full h-full object-contain drop-shadow-xl relative z-10"
            />
            {/* Efek Kilapan Logo */}
            <motion.div
              className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-20deg] z-20 pointer-events-none"
              animate={{ left: ["-100%", "200%"] }}
              transition={{ duration: 8, repeat: Infinity, repeatDelay: 3 }}
            />
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#000080] font-bismillah tracking-widest leading-none">
            Nina Rahell Project
          </h1>
          <p className="text-[9px] sm:text-[10px] font-bold text-teal-600 uppercase tracking-[0.2em] mt-3">
            Sistem Manajemen Akademik
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-2xl border border-rose-100 flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
            <AlertTriangle size={14} className="shrink-0" />
            <span className="leading-tight">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-wider">
              Username Admin
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <User size={18} />
              </div>
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-sm text-slate-800 outline-none focus:bg-white focus:border-teal-500 transition-all placeholder:text-slate-300"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-wider">
              Kata Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-sm text-slate-800 outline-none focus:bg-white focus:border-teal-500 transition-all placeholder:text-slate-300"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-teal-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-black py-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(20,184,166,0.3)] hover:shadow-[0_15px_30px_rgba(20,184,166,0.4)] active:scale-95 transition-all uppercase tracking-[0.2em] disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Memeriksa...
                </>
              ) : (
                <>
                  Masuk Aplikasi <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center mt-10 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Nina Rahilah
        </p>
      </div>
    </motion.div>
  );
}
