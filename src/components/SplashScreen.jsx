// File: src/components/SplashScreen.jsx
import React from "react";

export default function SplashScreen({ splashState }) {
  if (splashState === "hidden") return null;

  return (
    <div
      className={`fixed inset-0 z-[999] bg-[#f8fafc] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${splashState === "exiting" ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"}`}
    >
      <img
        src="/logo.svg"
        alt="Logo Nina"
        className="w-24 h-24 md:w-32 md:h-32 object-contain mb-8 drop-shadow-xl animate-[pulse_3s_ease-in-out_infinite]"
      />
      <h1 className="font-bismillah text-4xl md:text-5xl text-[#000080] tracking-widest drop-shadow-sm">
        Nina Rahell Project
      </h1>
      <div className="w-10 h-1 bg-teal-500 rounded-full mt-4 mb-3 opacity-70"></div>
      <p className="text-slate-500 text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold">
        Manajemen Akademik
      </p>
    </div>
  );
}
