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
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/90 backdrop-blur-sm overflow-y-auto p-4 md:p-8 animate-in fade-in duration-300 print:hidden">
      {/* Tombol Aksi */}
      <div className="fixed top-4 right-4 flex gap-2 z-50">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold tracking-widest uppercase rounded-lg shadow-lg flex items-center gap-2 transition-all"
        >
          <Printer size={16} /> Cetak
        </button>
        <button
          onClick={closeModal}
          className="p-2 bg-white/10 text-white hover:bg-rose-500 border border-white/20 rounded-lg shadow-lg transition-all"
        >
          <X size={20} />
        </button>
      </div>

      {/* Wadah Kertas Preview */}
      <div className="w-full max-w-4xl bg-white shadow-2xl mx-auto p-10 mt-12 text-black font-serif">
        {/* Header Judul */}
        <div className="text-center font-bold mb-6">
          <h1 className="text-[16px] uppercase tracking-wider leading-none">
            KISI – KISI SOAL SUMATIF AKHIR SEMESTER I
          </h1>
          <h2 className="text-[16px] uppercase tracking-wider mt-1">
            TAHUN PELAJARAN {tahunAjar}
          </h2>
        </div>

        {/* Identitas - Dipaksa Satu Baris (No Wrap) */}
        <div className="flex justify-between font-bold text-[13px] mb-4 border-b-0">
          <div className="space-y-0.5">
            <div className="flex whitespace-nowrap">
              <span className="w-40">NAMA SEKOLAH</span>
              <span className="px-2">:</span>
              <span>SD ISLAM AL-ISTIQOMAH</span>
            </div>
            <div className="flex whitespace-nowrap">
              <span className="w-40">MATA PELAJARAN</span>
              <span className="px-2">:</span>
              <span>{mapel}</span>
            </div>
          </div>
          <div className="space-y-0.5 text-left">
            <div className="flex whitespace-nowrap">
              <span className="w-36">KELAS/SEMESTER</span>
              <span className="px-2">:</span>
              <span>{displayKelas}/1</span>
            </div>
            <div className="flex whitespace-nowrap">
              <span className="w-36">NAMA PENGAJAR</span>
              <span className="px-2">:</span>
              <span>Nina Rahilah, S.Pd.</span>
            </div>
          </div>
        </div>

        {/* Tabel Utama */}
        <table className="w-full border-collapse border border-black mb-4">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-black py-2 px-3 text-center uppercase text-[12px] w-[65%]">
                CAPAIAN PEMBELAJARAN
              </th>
              <th className="border border-black py-2 px-3 w-20 text-center uppercase text-[12px]">
                NO.SOAL
              </th>
              <th className="border border-black py-2 px-3 w-32 text-center uppercase text-[12px]">
                BENTUK SOAL
              </th>
            </tr>
          </thead>
          <tbody className="align-top font-sans text-[12px]">
            {listSoal.length > 0 ? (
              listSoal.map((item) => (
                <tr key={item.no}>
                  <td className="border border-black py-2 px-3 text-justify leading-relaxed">
                    {item.teks}
                  </td>
                  <td className="border border-black py-2 px-3 text-center font-semibold">
                    {item.no}
                  </td>
                  <td className="border border-black py-2 px-3 text-center font-bold">
                    {item.jenis}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="border border-black py-10 text-center italic text-slate-400"
                >
                  Belum ada rincian soal yang diinput.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Catatan Bawah */}
        <div className="text-[12px] font-bold uppercase whitespace-nowrap">
          CATATAN: Untuk referensi soal bisa dilihat di soal Latihan kita
          kemaren
        </div>
      </div>
    </div>
  );
}
