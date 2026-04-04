// File: src/modals/KisiPopUp.jsx
import React from "react";
import { X, Printer } from "lucide-react";

export default function KisiPopUp({ activeSiswa, kisiData, closeModal }) {
  const currentYear = new Date().getFullYear();
  const tahunAjar = kisiData?.tahun || `${currentYear}/${currentYear + 1}`;

  // Mencegah tulisan "Kelas Kelas 1" (double)
  const rawKelas = String(activeSiswa?.kelas || "");
  const displayKelas = rawKelas.toLowerCase().includes("kelas")
    ? rawKelas
    : `Kelas ${rawKelas}`;

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `KISI_KISI_${displayKelas.replace(/\s+/g, "_")}`;
    window.print();
    document.title = originalTitle;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/90 backdrop-blur-sm overflow-y-auto p-2 md:p-8 animate-in fade-in duration-300 print:hidden">
      {/* Tombol Aksi */}
      <div className="fixed top-4 right-4 flex flex-wrap gap-2 z-50 justify-end">
        <button
          onClick={handlePrint}
          className="px-3 py-2 md:px-4 md:py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold tracking-widest uppercase rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] shadow-[0_8px_20px_rgba(20,184,166,0.3)] transition-all hover:-translate-y-0.5"
        >
          <Printer size={14} className="md:w-4 md:h-4" /> Cetak & PDF
        </button>
        <button
          onClick={closeModal}
          className="p-1.5 md:p-2 bg-white/10 text-white hover:bg-rose-500 border border-white/20 rounded-lg md:rounded-xl shadow-lg transition-all"
        >
          <X size={18} className="md:w-5 md:h-5" />
        </button>
      </div>

      {/* Wadah Putih Kisi-Kisi */}
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] mx-auto p-4 md:p-12 relative mt-16 md:mt-0 text-black"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        {/* Header: Logo & Judul */}
        <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-5 border-b-[2px] md:border-b-[3px] border-black pb-2 md:pb-3">
          <img
            src="/logo.svg"
            alt="Logo"
            className="w-14 h-14 md:w-24 md:h-24 object-contain"
          />
          <div className="flex-1 text-center pr-14 md:pr-24">
            <h1 className="text-[10px] sm:text-[12px] md:text-2xl font-bold uppercase tracking-wider mb-0.5 md:mb-1 leading-tight whitespace-nowrap">
              Kisi-Kisi Penilaian Akademik
            </h1>
            <h2 className="text-[10px] sm:text-[12px] md:text-2xl font-bold uppercase tracking-wider mb-0 leading-tight whitespace-nowrap">
              Tahun Ajaran {tahunAjar}
            </h2>
          </div>
        </div>

        {/* Info Kelas */}
        <div className="mb-2 md:mb-4">
          <table className="text-[10px] md:text-base">
            <tbody>
              <tr>
                <td className="w-20 md:w-32 pb-0.5 font-medium">
                  Sasaran Kelas
                </td>
                <td className="w-3 md:w-4 pb-0.5 text-center">:</td>
                <td className="pb-0.5 font-bold uppercase tracking-wide">
                  {displayKelas}
                </td>
              </tr>
              <tr>
                <td className="pb-0.5 font-medium">Jenis Penilaian</td>
                <td className="pb-0.5 text-center">:</td>
                <td className="pb-0.5 font-semibold text-teal-700">
                  {kisiData?.jenis_ujian || "Ujian Tertulis"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Kata Pengantar */}
        <p className="text-justify mb-3 md:mb-5 leading-relaxed indent-4 md:indent-8 text-[10px] md:text-base">
          Bersama ini kami sampaikan kisi-kisi dan materi pokok yang akan
          diujikan kepada siswa/i{" "}
          <span className="font-bold">{displayKelas}</span>. Kami mohon bantuan
          Ayah/Bunda untuk turut serta mendampingi dan memantau proses belajar
          ananda di rumah agar mendapatkan hasil yang maksimal.
        </p>

        {/* Tabel Utama Kisi-kisi */}
        <table className="w-full border-collapse border border-black mb-4 md:mb-8 text-[10px] md:text-base">
          <thead>
            <tr className="bg-teal-100">
              <th className="border border-black py-1 md:py-2 px-2 md:px-3 w-8 md:w-12 text-center uppercase">
                NO.
              </th>
              <th className="border border-black py-1 md:py-2 px-2 md:px-3 w-28 md:w-48 text-center uppercase tracking-tighter md:tracking-normal">
                MATA PELAJARAN
              </th>
              <th className="border border-black py-1 md:py-2 px-2 md:px-3 text-center uppercase">
                MATERI POKOK / INDIKATOR
              </th>
            </tr>
          </thead>
          <tbody className="align-top">
            <tr>
              <td className="border border-black py-2 md:py-3 px-2 md:px-3 text-center align-middle">
                1.
              </td>
              <td className="border border-black py-2 md:py-3 px-2 md:px-3 font-bold text-center align-middle bg-slate-50/50">
                {kisiData?.mata_pelajaran || "-"}
              </td>
              <td className="border border-black py-2 md:py-3 px-2 md:px-4 text-justify leading-relaxed min-h-[100px] md:min-h-[150px]">
                {kisiData?.materi ? (
                  <div className="whitespace-pre-line">{kisiData.materi}</div>
                ) : (
                  <span className="text-slate-400 italic font-sans text-xs">
                    Materi belum diinput...
                  </span>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Tanda Tangan */}
        <div className="flex justify-end pr-2 md:pr-12 text-[10px] md:text-base">
          <div className="flex flex-col items-center text-center">
            <p className="mb-0 mt-0.5 md:mt-1 font-medium">Guru Pengampu,</p>
            <div className="w-20 h-10 md:w-32 md:h-16 flex items-center justify-center overflow-hidden my-0">
              <img
                src="/assets/ttd.svg"
                alt="Tanda Tangan"
                className="w-full h-full object-cover scale-90 mix-blend-multiply"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
            <p className="font-bold mt-0.5 md:mt-1 md:border-none leading-none">
              Nina Rahilah, S.Pd.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
