// File: src/components/BottomNav.jsx
import React from "react";
import {
  Home,
  Users,
  GraduationCap,
  Wallet,
  BookOpen,
  ClipboardList,
} from "lucide-react";

export default function BottomNav({ activeTab, navToTab }) {
  const menuItems = [
    { id: "home", label: "Beranda", icon: Home },
    { id: "siswa", label: "Siswa", icon: Users },
    { id: "nilai", label: "Nilai", icon: GraduationCap },
    { id: "keuangan", label: "Keuangan", icon: Wallet },
    { id: "jurnal", label: "Jurnal", icon: BookOpen },
    { id: "kisi", label: "Kisi-Kisi", icon: ClipboardList }, // Menu baru Kisi-Kisi
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 px-1 py-2 pb-safe">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => navToTab(item.id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 min-w-0"
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? item.id === "kisi"
                      ? "bg-indigo-100 text-indigo-600 shadow-sm" // Warna khusus untuk kisi-kisi (indigo)
                      : "bg-teal-100 text-teal-600 shadow-sm"
                    : "text-slate-400 bg-transparent"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={`text-[9px] font-bold tracking-wide truncate w-full text-center ${
                  isActive
                    ? item.id === "kisi"
                      ? "text-indigo-700"
                      : "text-teal-700"
                    : "text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Area padding bawah ekstra untuk iPhone (Safe Area)
        agar tidak tertutup oleh garis home indikator di iOS 
      */}
      <div className="h-1 pb-[env(safe-area-inset-bottom)]"></div>
    </div>
  );
}
