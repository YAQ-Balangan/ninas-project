// File: src/components/BottomNav.jsx
import React from "react";
import { Home, Users, GraduationCap, Wallet, BookOpen } from "lucide-react";

export default function BottomNav({ activeTab, navToTab }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-white/60 flex justify-around items-center pt-1.5 pb-1.5 z-40 px-2 no-print shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      {/* Tambahan "jurnal" di array map */}
      {["home", "siswa", "nilai", "keuangan", "jurnal"].map((tab) => (
        <button
          key={tab}
          onClick={() => navToTab(tab)}
          className={`flex flex-col items-center p-1.5 rounded-xl min-w-[60px] transition-all duration-300 ${activeTab === tab ? "text-teal-700 scale-105" : "text-slate-400 hover:text-slate-600"}`}
        >
          <div
            className={`transition-all duration-300 ${activeTab === tab ? "bg-teal-50 p-1.5 rounded-lg mb-0.5 shadow-sm" : "mb-1"}`}
          >
            {tab === "home" && (
              <Home
                size={20}
                className={activeTab === "home" ? "fill-teal-100" : ""}
              />
            )}
            {tab === "siswa" && (
              <Users
                size={20}
                className={activeTab === "siswa" ? "fill-teal-100" : ""}
              />
            )}
            {tab === "nilai" && (
              <GraduationCap
                size={20}
                className={activeTab === "nilai" ? "fill-teal-100" : ""}
              />
            )}
            {tab === "keuangan" && (
              <Wallet
                size={20}
                className={activeTab === "keuangan" ? "fill-teal-100" : ""}
              />
            )}
            {tab === "jurnal" && (
              <BookOpen
                size={20}
                className={activeTab === "jurnal" ? "fill-teal-100" : ""}
              />
            )}
          </div>
          <span className="text-[9px] font-semibold capitalize tracking-wide">
            {tab === "home" ? "Beranda" : tab}
          </span>
        </button>
      ))}
    </div>
  );
}
