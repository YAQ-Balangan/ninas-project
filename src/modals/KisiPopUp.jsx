// File: src/modals/KisiPopUp.jsx
import React from "react";
import { X, Printer } from "lucide-react";

export default function KisiPopUp({ activeSiswa, kisiData, closeModal }) {
  const currentYear = new Date().getFullYear();
  const tahunAjar = kisiData?.tahun || `${currentYear}/${currentYear + 1}`;
  const mapel = kisiData?.mata_pelajaran || "-";

  // Mengambil data kelas dan memastikan formatnya bersih
  const rawKelas = String(activeSiswa?.kelas || kisiData?.kelas || "");
  const displayKelas = rawKelas.toLowerCase().includes("kelas")
    ? rawKelas.replace(/kelas/i, "").trim()
    : rawKelas;

  // Logika Pemecah Baris (Smart Parser)
  const barisData = (kisiData?.materi || "")
    .split("\n")
    .filter((b) => b.trim() !== "");

  const listSoal = barisData.map((baris, index) => {
    const adaPilihan = baris.includes(":::");
    return {
      no: index + 1,
      jenis: adaPilihan ? baris.split(":::")[0] : "PG",
      teks: adaPilihan ? baris.split(":::")[1] : baris,
    };
  });

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `KISI_SAS_I_${mapel.replace(/\s+/g, "_")}`;
    window.print();
    document.title = originalTitle;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/90 backdrop-blur-sm overflow-y-auto p-2 sm:p-4 md:p-8 animate-in fade-in duration-300 print:hidden">
      {/* Tombol Aksi */}
      <div className="fixed top-4 right-4 flex gap-2 z-50">
        <button
          onClick={handlePrint}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold tracking-widest uppercase rounded-lg shadow-lg flex items-center gap-1.5 md:gap-2 text-[10px] md:text-[12px] transition-all"
        >
          <Printer size={16} className="w-4 h-4 md:w-5 md:h-5" /> Cetak
        </button>
        <button
          onClick={closeModal}
          className="p-1.5 md:p-2 bg-white/10 text-white hover:bg-rose-500 border border-white/20 rounded-lg shadow-lg transition-all"
        >
          <X size={20} className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      {/* Wadah Kertas Preview */}
      <div className="w-full max-w-5xl bg-white shadow-2xl mx-auto p-3 sm:p-6 md:p-10 mt-14 md:mt-12 text-black font-serif overflow-hidden">
        {/* Header Judul - Mengecil di Mobile agar tidak turun baris */}
        <div className="text-center font-bold mb-4 md:mb-8">
          <h1 className="text-[9px] min-[375px]:text-[10px] sm:text-[14px] md:text-[18px] uppercase tracking-wide md:tracking-wider leading-none whitespace-nowrap">
            KISI – KISI SOAL SUMATIF AKHIR SEMESTER I
          </h1>
          <h2 className="text-[9px] min-[375px]:text-[10px] sm:text-[14px] md:text-[18px] uppercase tracking-wide md:tracking-wider mt-1 whitespace-nowrap">
            TAHUN PELAJARAN {tahunAjar}
          </h2>
        </div>

        {/* Identitas - Dibagi Area 55% dan 45% agar tidak saling tabrak */}
        <div className="flex justify-between font-bold text-[6px] min-[375px]:text-[7px] sm:text-[10px] md:text-[13px] mb-3 md:mb-6 w-full">
          {/* Kolom Kiri */}
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
          {/* Kolom Kanan */}
          <div className="w-[45%] space-y-0.5 md:space-y-1 text-left pl-1">
            <div className="flex whitespace-nowrap">
              <span className="w-[65px] min-[375px]:w-[75px] sm:w-[100px] md:w-32 shrink-0">
                KELAS/SEMESTER
              </span>
              <span className="px-0.5 md:px-2 shrink-0">:</span>
              <span className="capitalize">{displayKelas}/1</span>
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

        {/* Tabel Utama Rincian Soal */}
        <table className="w-full border-collapse border border-black mb-4 md:mb-6">
          <thead className="bg-slate-50">
            <tr>
              <th className="border border-black py-1.5 md:py-3 px-1.5 md:px-3 text-center uppercase text-[7px] sm:text-[10px] md:text-[13px] w-[65%]">
                CAPAIAN PEMBELAJARAN
              </th>
              <th className="border border-black py-1.5 md:py-3 px-1 md:px-3 w-10 sm:w-16 md:w-20 text-center uppercase text-[7px] sm:text-[10px] md:text-[13px]">
                NO.SOAL
              </th>
              <th className="border border-black py-1.5 md:py-3 px-1 md:px-3 w-16 sm:w-24 md:w-32 text-center uppercase text-[7px] sm:text-[10px] md:text-[13px]">
                BENTUK SOAL
              </th>
            </tr>
          </thead>
          <tbody className="align-top font-sans text-[7px] sm:text-[10px] md:text-[13px]">
            {listSoal.length > 0 ? (
              listSoal.map((item) => (
                <tr key={item.no}>
                  <td className="border border-black py-1.5 md:py-2.5 px-1.5 md:px-4 text-justify leading-snug md:leading-relaxed">
                    {item.teks}
                  </td>
                  <td className="border border-black py-1.5 md:py-2.5 px-1 md:px-3 text-center font-semibold">
                    {item.no}
                  </td>
                  <td className="border border-black py-1.5 md:py-2.5 px-1 md:px-3 text-center font-bold">
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

        {/* Catatan Bawah */}
        <div className="text-[6px] min-[375px]:text-[7px] sm:text-[10px] md:text-[13px] font-bold whitespace-nowrap italic tracking-tighter md:tracking-normal">
          CATATAN: Untuk referensi soal bisa dilihat di soal Latihan kita
          kemaren
        </div>
      </div>
    </div>
  );
}
