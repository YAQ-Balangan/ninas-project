// File: src/modals/KisiPopUp.jsx
import React from "react";
import { X, Printer } from "lucide-react";

export default function KisiPopUp({ activeSiswa, kisiData, closeModal }) {
  const currentYear = new Date().getFullYear();
  const tahunAjar = kisiData?.tahun || `${currentYear}/${currentYear + 1}`;
  const mapel = kisiData?.mata_pelajaran || "-";

  const rawKelas = String(activeSiswa?.kelas || kisiData?.kelas || "");
  const displayKelas = rawKelas.toLowerCase().includes("kelas")
    ? rawKelas.replace(/kelas/i, "").trim()
    : rawKelas;

  // LOGIKA DINAMIS: Judul dan Semester mengikuti tulisan di kolom "Jenis Ujian"
  const judulUjian = (
    kisiData?.jenis_ujian || "SUMATIF AKHIR SEMESTER I"
  ).toUpperCase();
  const isSemester2 = judulUjian.match(/\b(II|2|GENAP)\b/i);
  const strSemester = isSemester2 ? "II" : "I";

  const barisData = (kisiData?.materi || "")
    .split("\n")
    .filter((b) => b.trim() !== "");

  const listSoal = barisData.map((baris, index) => {
    const parts = baris.split(":::");
    let jenis = "PG",
      no = index + 1,
      teks = baris;
    if (parts.length >= 3) {
      jenis = parts[0];
      no = parts[1];
      teks = parts.slice(2).join(":::");
    } else if (parts.length === 2) {
      jenis = parts[0];
      teks = parts[1];
    }
    return { no, jenis, teks };
  });

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `KISI_${judulUjian.replace(/\s+/g, "_")}`;
    window.print();
    document.title = originalTitle;
  };

  return (
    <div className="fixed inset-0 z-[100] print:hidden animate-in fade-in duration-300">
      {/* 1. Latar Belakang Blur (Dipisah menjadi lapisan sendiri) */}
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"></div>

      {/* 2. Tombol Aksi (Dipindah ke luar area scroll dengan z-index tertinggi agar PASTI bisa diklik di Android) */}
      <div className="absolute top-4 right-4 flex gap-2 z-[120]">
        <button
          onClick={handlePrint}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold tracking-widest uppercase rounded-lg shadow-lg flex items-center gap-1.5 md:gap-2 text-[10px] md:text-[12px] transition-all active:scale-95"
        >
          <Printer size={16} className="w-4 h-4 md:w-5 md:h-5" /> Cetak
        </button>
        <button
          onClick={closeModal}
          className="p-1.5 md:p-2 bg-white/10 text-white hover:bg-rose-500 border border-white/20 rounded-lg shadow-lg transition-all active:scale-95"
        >
          <X size={20} className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      {/* 3. Area Scroll untuk Kertas (Lapisan terpisah di bawah tombol) */}
      <div className="absolute inset-0 overflow-y-auto p-2 sm:p-4 md:p-8 flex items-start justify-center z-[110]">
        {/* Wadah Kertas Preview */}
        <div className="w-full max-w-5xl bg-white shadow-2xl mx-auto p-3 sm:p-6 md:p-10 mt-14 md:mt-10 text-black font-serif overflow-hidden">
          <div className="text-center font-bold mb-4 md:mb-6">
            <h1 className="text-[9px] min-[375px]:text-[10px] sm:text-[14px] md:text-[16px] uppercase tracking-wide md:tracking-wider leading-none whitespace-nowrap">
              KISI – KISI SOAL {judulUjian}
            </h1>
            <h2 className="text-[9px] min-[375px]:text-[10px] sm:text-[14px] md:text-[16px] uppercase tracking-wide md:tracking-wider mt-1 whitespace-nowrap">
              TAHUN PELAJARAN {tahunAjar}
            </h2>
          </div>

          <div className="flex justify-between font-bold text-[6px] min-[375px]:text-[7px] sm:text-[10px] md:text-[12px] mb-3 md:mb-5 w-full">
            <div className="w-[55%] space-y-0.5 md:space-y-1 pr-1">
              <div className="flex whitespace-nowrap">
                <span className="w-[60px] min-[375px]:w-[70px] sm:w-[100px] md:w-36 shrink-0">
                  NAMA SEKOLAH
                </span>
                <span className="px-0.5 md:px-2 shrink-0">:</span>
                <span className="capitalize">SD Islam Al-Istiqomah</span>
              </div>
              <div className="flex whitespace-nowrap">
                <span className="w-[60px] min-[375px]:w-[70px] sm:w-[100px] md:w-36 shrink-0">
                  MATA PELAJARAN
                </span>
                <span className="px-0.5 md:px-2 shrink-0">:</span>
                <span className="capitalize">{mapel}</span>
              </div>
            </div>
            <div className="w-[45%] space-y-0.5 md:space-y-1 text-left pl-1">
              <div className="flex whitespace-nowrap">
                <span className="w-[65px] min-[375px]:w-[75px] sm:w-[100px] md:w-32 shrink-0">
                  KELAS/SEMESTER
                </span>
                <span className="px-0.5 md:px-2 shrink-0">:</span>
                <span className="capitalize">
                  {displayKelas}/{strSemester}
                </span>
              </div>
              <div className="flex whitespace-nowrap">
                <span className="w-[65px] min-[375px]:w-[75px] sm:w-[100px] md:w-32 shrink-0">
                  NAMA PENGAJAR
                </span>
                <span className="px-0.5 md:px-2 shrink-0">:</span>
                <span className="capitalize">Nina Rahilah, S.Pd.</span>
              </div>
            </div>
          </div>

          <table className="w-full border-collapse border border-black mb-4">
            <thead className="bg-slate-50">
              <tr>
                <th className="border border-black py-1 md:py-2 px-1.5 md:px-2 text-center uppercase text-[7px] sm:text-[10px] md:text-[11px] w-[65%]">
                  MATERI POKOK/INDIKATOR
                </th>
                <th className="border border-black py-1 md:py-2 px-1 md:px-2 w-10 sm:w-16 md:w-20 text-center uppercase text-[7px] sm:text-[10px] md:text-[11px]">
                  NO.SOAL
                </th>
                <th className="border border-black py-1 md:py-2 px-1 md:px-2 w-16 sm:w-24 md:w-28 text-center uppercase text-[7px] sm:text-[10px] md:text-[11px]">
                  BENTUK SOAL
                </th>
              </tr>
            </thead>
            <tbody className="align-top font-sans text-[7px] sm:text-[10px] md:text-[12px] leading-tight">
              {listSoal.length > 0 ? (
                listSoal.map((item, i) => (
                  <tr key={i}>
                    <td className="border border-black py-0.5 md:py-1 px-1.5 md:px-3 text-justify">
                      {item.teks}
                    </td>
                    <td className="border border-black py-0.5 md:py-1 px-1 md:px-2 text-center font-semibold align-middle">
                      {item.no}
                    </td>
                    <td className="border border-black py-0.5 md:py-1 px-1 md:px-2 text-center font-bold align-middle">
                      {item.jenis}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="border border-black py-6 md:py-12 text-center italic text-slate-400"
                  >
                    Belum ada rincian soal yang diinput.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="text-[6px] min-[375px]:text-[7px] sm:text-[10px] md:text-[11px] font-bold whitespace-nowrap tracking-tighter md:tracking-normal">
            CATATAN:
          </div>
        </div>
      </div>
    </div>
  );
}
