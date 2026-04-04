// File: src/pages/views/TabHome.jsx
import React from "react";
import {
  TrendingUp,
  RefreshCw,
  UserPlus,
  Banknote,
  FileText,
  ReceiptText,
  BookOpen,
  ClipboardList,
} from "lucide-react";
import { formatRp } from "../../utils/helpers";

export default function TabHome({
  isSyncing,
  grandTotalKeuangan,
  totalCash,
  totalTransfer,
  siswaData,
  kelasOptions,
  openModal,
  navToTab,
}) {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-gradient-to-br from-teal-500/95 to-emerald-700/95 backdrop-blur-xl rounded-3xl p-5 md:p-8 text-white shadow-[0_20px_40px_rgba(20,184,166,0.2)] border border-white/20 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-900/20 rounded-full blur-3xl"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 relative z-10">
          <div>
            <p className="text-teal-100 text-xs md:text-sm font-medium mb-1 flex items-center gap-2 tracking-wide uppercase">
              <TrendingUp size={16} /> Grand Total Dana
              {isSyncing && (
                <RefreshCw
                  size={12}
                  className="animate-spin text-teal-200 ml-2"
                  title="Menyinkronkan..."
                />
              )}
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-md">
              {formatRp(grandTotalKeuangan)}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="bg-white/10 p-3 md:p-4 rounded-2xl border border-white/20 backdrop-blur-md shadow-inner">
              <p className="text-teal-100 text-[9px] md:text-[10px] uppercase tracking-widest mb-1 font-bold">
                Total Cash
              </p>
              <p className="text-base md:text-xl font-bold text-white tracking-wide">
                {formatRp(totalCash)}
              </p>
            </div>
            <div className="bg-white/10 p-3 md:p-4 rounded-2xl border border-white/20 backdrop-blur-md shadow-inner">
              <p className="text-teal-100 text-[9px] md:text-[10px] uppercase tracking-widest mb-1 font-bold">
                Total Transfer
              </p>
              <p className="text-base md:text-xl font-bold text-white tracking-wide">
                {formatRp(totalTransfer)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-6 border-t border-teal-400/30 pt-4 mt-5 relative z-10">
          <div>
            <p className="text-teal-100 text-[9px] md:text-[10px] uppercase tracking-widest mb-1 font-bold">
              Jumlah Anak
            </p>
            <p className="text-sm md:text-base font-bold">
              {siswaData.length} Siswa
            </p>
          </div>
          <div>
            <p className="text-teal-100 text-[9px] md:text-[10px] uppercase tracking-widest mb-1 font-bold">
              Kategori Kelas
            </p>
            <p className="text-sm md:text-base font-bold">
              {kelasOptions.length} Tingkat
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] md:text-sm text-slate-500 font-bold uppercase tracking-[0.2em] mb-4 pl-2">
          Menu Cepat
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 max-w-lg md:max-w-none mx-auto">
          <button
            onClick={() => openModal("siswa")}
            className="group p-3 md:p-4 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl md:rounded-[1.2rem] shadow-sm hover:shadow-[0_20px_40px_rgba(20,184,166,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-center gap-2 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-100/50 rounded-bl-[100%] -z-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="w-10 h-10 bg-slate-50 text-slate-600 group-hover:bg-teal-500 group-hover:text-white rounded-xl flex items-center justify-center transition-colors duration-300 shadow-inner">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-slate-700 tracking-wide text-center leading-tight">
              Siswa Baru
            </span>
          </button>
          <button
            onClick={() => navToTab("keuangan")}
            className="group p-3 md:p-4 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl md:rounded-[1.2rem] shadow-sm hover:shadow-[0_20px_40px_rgba(245,158,11,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-center gap-2 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/50 rounded-bl-[100%] -z-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="w-10 h-10 bg-slate-50 text-slate-600 group-hover:bg-amber-500 group-hover:text-white rounded-xl flex items-center justify-center transition-colors duration-300 shadow-inner">
              <Banknote className="w-5 h-5" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-slate-700 tracking-wide text-center leading-tight">
              Input Uang
            </span>
          </button>
          <button
            onClick={() => navToTab("nilai")}
            className="group p-3 md:p-4 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl md:rounded-[1.2rem] shadow-sm hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-center gap-2 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/50 rounded-bl-[100%] -z-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="w-10 h-10 bg-slate-50 text-slate-600 group-hover:bg-blue-500 group-hover:text-white rounded-xl flex items-center justify-center transition-colors duration-300 shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-slate-700 tracking-wide text-center leading-tight">
              Input Nilai
            </span>
          </button>
          <button
            onClick={() => navToTab("keuangan")}
            className="group p-3 md:p-4 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl md:rounded-[1.2rem] shadow-sm hover:shadow-[0_20px_40px_rgba(244,63,94,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-center gap-2 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-100/50 rounded-bl-[100%] -z-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="w-10 h-10 bg-slate-50 text-slate-600 group-hover:bg-rose-500 group-hover:text-white rounded-xl flex items-center justify-center transition-colors duration-300 shadow-inner">
              <ReceiptText className="w-5 h-5" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-slate-700 tracking-wide text-center leading-tight">
              Cetak Kwitansi
            </span>
          </button>
          <button
            onClick={() => navToTab("jurnal")}
            className="group p-3 md:p-4 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl md:rounded-[1.2rem] shadow-sm hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-center gap-2 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/50 rounded-bl-[100%] -z-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="w-10 h-10 bg-slate-50 text-slate-600 group-hover:bg-emerald-500 group-hover:text-white rounded-xl flex items-center justify-center transition-colors duration-300 shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-slate-700 tracking-wide text-center leading-tight">
              Jurnal Anak
            </span>
          </button>
          <button
            onClick={() => navToTab("kisi")}
            className="group p-3 md:p-4 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl md:rounded-[1.2rem] shadow-sm hover:shadow-[0_20px_40px_rgba(99,102,241,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-center gap-2 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100/50 rounded-bl-[100%] -z-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="w-10 h-10 bg-slate-50 text-slate-600 group-hover:bg-indigo-500 group-hover:text-white rounded-xl flex items-center justify-center transition-colors duration-300 shadow-inner">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-slate-700 tracking-wide text-center leading-tight">
              Kisi-Kisi
            </span>
          </button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs md:text-sm text-slate-800 font-bold uppercase tracking-wider">
            Pendaftar Terbaru
          </h3>
          <button
            onClick={() => navToTab("siswa")}
            className="text-teal-600 font-bold text-[10px] md:text-xs uppercase tracking-wider hover:underline"
          >
            Lihat Semua
          </button>
        </div>
        <div className="space-y-3">
          {siswaData.length === 0 ? (
            <p className="text-center text-slate-400 text-xs py-6 font-medium">
              Belum ada data siswa.
            </p>
          ) : (
            siswaData
              .slice(-4)
              .reverse()
              .map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 md:gap-4 p-2 md:p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-teal-100 to-emerald-100 text-teal-700 rounded-xl flex items-center justify-center text-base md:text-lg font-black shadow-inner">
                    {String(s.nama || "")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-bold truncate text-xs md:text-sm">
                      {s.nama}
                    </p>
                    <p className="text-[9px] md:text-[11px] font-semibold text-slate-400 tracking-wide uppercase mt-0.5">
                      {s.kelas}
                    </p>
                  </div>
                  <button
                    onClick={() => openModal("bayar_baru", s)}
                    className="px-3 py-1.5 md:px-4 md:py-2 bg-slate-50 hover:bg-teal-50 text-teal-700 font-bold rounded-lg md:rounded-xl text-[9px] md:text-[11px] tracking-wide shadow-sm border border-slate-200 transition-colors uppercase"
                  >
                    Bayar
                  </button>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
