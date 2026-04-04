import React from "react";
import { X, Printer } from "lucide-react";

export default function KisiPopUp({ activeSiswa, kisiData, closeModal }) {
  const currentYear = new Date().getFullYear();
  const tahunAjar = kisiData?.tahun || `${currentYear}/${currentYear + 1}`;

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `KISI_KISI_${activeSiswa?.nama?.replace(/\s+/g, "_") || "Siswa"}`;
    window.print();
    document.title = originalTitle;
  };

  return (
    // Class 'print:hidden' ditambahkan di sini agar preview ini hilang saat mesin printer menyala
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/90 backdrop-blur-sm overflow-y-auto p-4 md:p-8 animate-in fade-in duration-300 print:hidden">
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

      {/* AREA DOKUMEN PREVIEW */}
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] mx-auto p-6 md:p-12 relative mt-16 md:mt-0 text-black"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        <div className="flex items-center gap-4 mb-5 border-b-[3px] border-black pb-3">
          <img
            src="/logo.svg"
            alt="Logo"
            className="w-20 h-20 md:w-24 md:h-24 object-contain"
          />
          <div className="flex-1 text-center pr-20 md:pr-24">
            <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider mb-1 leading-tight">
              Kisi-Kisi Penilaian Akademik
            </h1>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider mb-0 leading-tight">
              Tahun Ajaran {tahunAjar}
            </h2>
          </div>
        </div>

        <div className="mb-4">
          <table className="text-sm md:text-base">
            <tbody>
              <tr>
                <td className="w-28 pb-0.5">Nama Siswa</td>
                <td className="w-4 pb-0.5 text-center">:</td>
                <td className="pb-0.5 font-bold uppercase">
                  {activeSiswa?.nama}
                </td>
              </tr>
              <tr>
                <td className="pb-0.5">Kelas</td>
                <td className="pb-0.5 text-center">:</td>
                <td className="pb-0.5 uppercase">{activeSiswa?.kelas}</td>
              </tr>
              <tr>
                <td className="pb-0.5">Jenis Ujian</td>
                <td className="pb-0.5 text-center">:</td>
                <td className="pb-0.5 font-bold">
                  {kisiData?.jenis_ujian || "Ujian Tertulis"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-justify mb-4 leading-relaxed indent-8 text-sm md:text-base">
          Bersama ini kami sampaikan kisi-kisi dan materi pokok yang akan
          diujikan kepada ananda{" "}
          <span className="font-bold">{activeSiswa?.nama}</span>. Kami mohon
          bantuan Ayah/Bunda untuk turut serta mendampingi dan memantau proses
          belajar ananda di rumah agar mendapatkan hasil yang maksimal.
        </p>

        <table className="w-full border-collapse border border-black mb-6 text-sm md:text-base">
          <thead>
            <tr className="bg-teal-100">
              <th className="border border-black py-2 px-3 w-12 text-center">
                No.
              </th>
              <th className="border border-black py-2 px-3 w-48 text-center">
                Mata Pelajaran
              </th>
              <th className="border border-black py-2 px-3 text-center">
                Materi Pokok / Indikator
              </th>
            </tr>
          </thead>
          <tbody className="align-top">
            <tr>
              <td className="border border-black py-2 px-3 text-center align-middle">
                1
              </td>
              <td className="border border-black py-2 px-3 font-semibold text-center align-middle">
                {kisiData?.mata_pelajaran || "-"}
              </td>
              <td className="border border-black py-2 px-3 text-justify min-h-[150px]">
                {kisiData?.materi || "Belum ada materi pokok yang diinput."}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end pr-4 md:pr-12 text-sm md:text-base">
          <div className="flex flex-col items-center text-center">
            <p className="mb-0">Guru Pengampu,</p>
            <div className="w-24 h-12 md:w-32 md:h-16 flex items-center justify-center overflow-hidden my-0">
              <img
                src="/assets/ttd.svg"
                alt="Tanda Tangan"
                className="w-full h-full object-cover scale-90 mix-blend-multiply"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
            <p className="font-bold mt-1">Nina Rahilah, S.Pd.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
