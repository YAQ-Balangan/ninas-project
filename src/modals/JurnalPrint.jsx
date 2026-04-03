// File: src/modals/JurnalPrint.jsx
import React from "react";
import { X, Printer } from "lucide-react";

export default function JurnalPrint({ activeSiswa, jurnalData, closeModal }) {
  const tahunAjar = jurnalData?.tahun || new Date().getFullYear();

  // Fungsi Cetak dengan Penamaan File
  const handlePrint = () => {
    const originalTitle = document.title;
    // Mengatur nama file PDF: Jurnal (Nama Siswa).pdf
    document.title = `JURNAL ${activeSiswa?.nama || "Siswa"}`;
    window.print();
    // Mengembalikan judul asli setelah jendela print tertutup
    document.title = originalTitle;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/90 backdrop-blur-sm overflow-y-auto p-4 md:p-8 animate-in fade-in duration-300 print:p-0 print:bg-white print:backdrop-blur-none print:static print:block">
      {/* Tombol Aksi */}
      <div className="fixed top-4 right-4 flex flex-wrap gap-2 no-print z-50 justify-end">
        <button
          onClick={handlePrint} // Menggunakan fungsi handlePrint baru
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

      {/* AREA DOKUMEN */}
      <div
        id="jurnal-print-area"
        className="w-full max-w-4xl bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] print:shadow-none print:rounded-none mx-auto p-6 md:p-12 print:p-0 relative mt-16 md:mt-0 print:mt-0 text-black"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        {/* KOP SURAT */}
        <div className="flex items-center gap-4 mb-8 border-b-[3px] border-black pb-4">
          <img
            src="/logo.svg"
            alt="Logo"
            className="w-20 h-20 md:w-24 md:h-24 object-contain"
          />
          <div className="flex-1 text-center pr-20 md:pr-24">
            <h1 className="text-xl md:text-2xl print:text-[17px] font-bold uppercase tracking-wider mb-1 leading-tight">
              Jurnal Observasi Perkembangan Siswa
            </h1>
            <h2 className="text-xl md:text-2xl print:text-[17px] font-bold uppercase tracking-wider mb-1 leading-tight">
              Kelas IV Semester II
            </h2>
          </div>
        </div>

        {/* INFORMASI SISWA */}
        <div className="mb-6">
          <table className="text-sm md:text-base">
            <tbody>
              <tr>
                <td className="w-24 pb-1">Nama</td>
                <td className="w-4 pb-1 text-center">:</td>
                <td className="pb-1 font-bold">{activeSiswa?.nama}</td>
              </tr>
              <tr>
                <td className="pb-1">Kelas</td>
                <td className="pb-1 text-center">:</td>
                <td className="pb-1">{activeSiswa?.kelas}</td>
              </tr>
              <tr>
                <td className="pb-1">Tahun</td>
                <td className="pb-1 text-center">:</td>
                <td className="pb-1">{tahunAjar}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PARAGRAF PENGANTAR */}
        <p className="text-justify mb-6 leading-relaxed indent-8 text-sm md:text-base">
          Yth. Ayah/Bunda <span className="font-bold">{activeSiswa?.nama}</span>
          , merupakan sebuah kebahagiaan bagi saya dapat mendampingi ananda{" "}
          <span className="font-bold">{activeSiswa?.nama}</span> di kelas.
          Izinkan saya menyampaikan catatan singkat mengenai keseharian ananda,
          sebagai bentuk perhatian kami terhadap tumbuh kembangnya.
        </p>

        {/* TABEL JURNAL */}
        <table className="w-full border-collapse border border-black mb-12 text-sm md:text-base">
          <thead>
            {/* Header dengan warna hijau telur asin (Teal) */}
            <tr className="bg-teal-100">
              <th className="border border-black p-2 md:p-3 w-12 text-center">
                No.
              </th>
              <th className="border border-black p-2 md:p-3 w-40 md:w-48 text-center">
                Kategori
              </th>
              <th className="border border-black p-2 md:p-3 text-center">
                Catatan
              </th>
            </tr>
          </thead>
          <tbody className="align-top">
            <tr>
              <td className="border border-black p-3 text-center align-middle">
                1
              </td>
              <td className="border border-black p-3 font-semibold text-center align-middle">
                Potensi
              </td>
              <td className="border border-black p-3 text-justify min-h-[80px]">
                {jurnalData?.potensi || "-"}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-3 text-center align-middle">
                2
              </td>
              <td className="border border-black p-3 font-semibold text-center align-middle">
                Catatan Observasi
              </td>
              <td className="border border-black p-3 text-justify min-h-[120px]">
                {jurnalData?.catatan_observasi || "-"}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-3 text-center align-middle">
                3
              </td>
              <td className="border border-black p-3 font-semibold text-center align-middle">
                Rekomendasi
              </td>
              <td className="border border-black p-3 text-justify min-h-[80px]">
                {jurnalData?.rekomendasi || "-"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* TANDA TANGAN */}
        <div className="flex justify-end pr-4 md:pr-12 text-sm md:text-base">
          <div className="flex flex-col items-center text-center">
            <p className="mb-0">Guru Damping Kelas,</p>
            <div className="w-24 h-12 md:w-32 md:h-16 flex items-center justify-center overflow-hidden my-0.5">
              <img
                src="/assets/ttd.svg"
                alt="Tanda Tangan"
                className="w-full h-full object-cover scale-90 mix-blend-multiply"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
            <p className="font-bold">Nina Rahilah, S.Pd.</p>
          </div>
        </div>
      </div>

      {/* CSS KHUSUS PRINT A4 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page { size: auto; margin: 2.54cm; }
          #jurnal-print-area { 
            width: 100% !important; 
            max-width: none !important; 
            margin: 0 !important; 
            padding: 0 !important; 
            box-shadow: none !important; 
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `,
        }}
      />
    </div>
  );
}
