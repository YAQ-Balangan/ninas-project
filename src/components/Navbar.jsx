// File: src/components/Navbar.jsx
import React from "react";
import {
  Home,
  Users,
  GraduationCap,
  Wallet,
  BookOpen,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";

export default function Navbar({ activeTab, navToTab, handleLogout }) {
  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-white/60 shadow-sm sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-14 md:h-16">
          <div
            className="flex items-center gap-2 cursor-pointer group shrink-0"
            onClick={() => navToTab("home")}
          >
            <img
              src="/logo.svg"
              alt="Logo Nina"
              className="w-8 h-8 md:w-9 lg:w-10 md:h-9 lg:h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform shrink-0"
            />
            <span className="font-bismillah text-xl sm:text-2xl lg:text-3xl text-[#000080] drop-shadow-sm pt-1 md:pt-1.5 whitespace-nowrap">
              Nina Rahell Project
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3 overflow-hidden">
            <div className="flex space-x-1 lg:space-x-2 bg-slate-50/50 p-1 md:p-1.5 rounded-xl border border-white/60 shrink-0">
              {/* Tambahkan "kisi" di dalam array map di bawah ini */}
              {["home", "siswa", "nilai", "keuangan", "jurnal", "kisi"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => navToTab(tab)}
                    className={`px-2 lg:px-3 py-1.5 rounded-lg flex items-center gap-1.5 lg:gap-2 transition-all duration-300 text-[10px] lg:text-xs font-semibold capitalize tracking-wide whitespace-nowrap ${
                      activeTab === tab
                        ? "bg-white text-teal-700 shadow-[0_4px_15px_rgba(20,184,166,0.15)]"
                        : "text-slate-500 hover:bg-white/60 hover:text-slate-700"
                    }`}
                  >
                    {tab === "home" && (
                      <Home size={14} className="md:w-3.5 md:h-3.5" />
                    )}
                    {tab === "siswa" && (
                      <Users size={14} className="md:w-3.5 md:h-3.5" />
                    )}
                    {tab === "nilai" && (
                      <GraduationCap size={14} className="md:w-3.5 md:h-3.5" />
                    )}
                    {tab === "keuangan" && (
                      <Wallet size={14} className="md:w-3.5 md:h-3.5" />
                    )}
                    {tab === "jurnal" && (
                      <BookOpen size={14} className="md:w-3.5 md:h-3.5" />
                    )}
                    {tab === "kisi" && (
                      <ClipboardList size={14} className="md:w-3.5 md:h-3.5" />
                    )}

                    <span className="hidden lg:block">
                      {tab === "home"
                        ? "Beranda"
                        : tab === "siswa"
                          ? "Data Siswa"
                          : tab === "nilai"
                            ? "Rekap Nilai"
                            : tab === "keuangan"
                              ? "Keuangan"
                              : tab === "jurnal"
                                ? "Jurnal"
                                : "Kisi-Kisi"}
                    </span>
                  </button>
                ),
              )}
            </div>
            <button
              onClick={handleLogout}
              className="px-2 lg:px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-lg text-[10px] lg:text-xs font-bold uppercase tracking-wider transition-colors shadow-sm border border-rose-100 flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <LogOut size={14} />{" "}
              <span className="hidden lg:block">Keluar</span>
            </button>
          </div>
          <div className="md:hidden flex items-center gap-2 shrink-0">
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm border border-rose-100 flex items-center gap-1"
            >
              <LogOut size={12} /> Keluar
            </button>
            <div className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center border border-white/60 shadow-sm text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors">
              <Settings className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
