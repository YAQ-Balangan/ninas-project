import React from "react";
import { X, Printer } from "lucide-react";

export default function JurnalPopUp({ activeSiswa, jurnalData, closeModal }) {
  const tahunAjar = jurnalData?.tahun || new Date().getFullYear();

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `JURNAL_${activeSiswa?.nama || "Siswa"}`;
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

      {/* Wadah Putih Jurnal */}
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
              Jurnal Observasi Perkembangan Siswa
            </h1>
            <h2 className="text-[10px] sm:text-[12px] md:text-2xl font-bold uppercase tracking-wider mb-0 leading-tight whitespace-nowrap">
              Tahun Ajaran {tahunAjar}
            </h2>
          </div>
        </div>

        {/* Info Siswa */}
        <div className="mb-2 md:mb-4">
          <table className="text-[10px] md:text-base">
            <tbody>
              <tr>
                <td className="w-16 md:w-24 pb-0.5 font-medium">Nama</td>
                <td className="w-3 md:w-4 pb-0.5 text-center">:</td>
                <td className="pb-0.5 font-bold">{activeSiswa?.nama}</td>
              </tr>
              <tr>
                <td className="pb-0.5 font-medium">Kelas</td>
                <td className="pb-0.5 text-center">:</td>
                <td className="pb-0.5">{activeSiswa?.kelas}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Kata Pengantar */}
        <p className="text-justify mb-3 md:mb-4 leading-relaxed indent-4 md:indent-8 text-[10px] md:text-base">
          Yth. Ayah/Bunda <span className="font-bold">{activeSiswa?.nama}</span>
          , merupakan sebuah kebahagiaan bagi saya dapat mendampingi ananda di
          kelas. Izinkan saya menyampaikan catatan singkat mengenai keseharian
          ananda.
        </p>

        {/* Tabel Utama Catatan */}
        <table className="w-full border-collapse border border-black mb-4 md:mb-6 text-[10px] md:text-base">
          <thead>
            <tr className="bg-teal-100">
              <th className="border border-black py-1 md:py-2 px-2 md:px-3 w-8 md:w-12 text-center">
                No.
              </th>
              <th className="border border-black py-1 md:py-2 px-2 md:px-3 w-28 md:w-48 text-center uppercase tracking-tighter md:tracking-normal">
                Kategori
              </th>
              <th className="border border-black py-1 md:py-2 px-2 md:px-3 text-center">
                Catatan
              </th>
            </tr>
          </thead>
          <tbody className="align-top">
            <tr>
              <td className="border border-black py-1 md:py-2 px-2 md:px-3 text-center align-middle">
                1
              </td>
              <td className="border border-black py-1 md:py-2 px-2 md:px-3 font-semibold text-center align-middle">
                Potensi
              </td>
              <td className="border border-black py-1 md:py-2 px-2 md:px-3 text-justify leading-tight md:leading-normal">
                {jurnalData?.potensi || "-"}
              </td>
            </tr>
            <tr>
              <td className="border border-black py-1 md:py-2 px-2 md:px-3 text-center align-middle">
                2
              </td>
              <td className="border border-black py-1 md:py-2 px-2 md:px-3 font-semibold text-center align-middle">
                Catatan Observasi
              </td>
              <td className="border border-black py-1 md:py-2 px-2 md:px-3 text-justify leading-tight md:leading-normal">
                {jurnalData?.catatan_observasi || "-"}
              </td>
            </tr>
            <tr>
              <td className="border border-black py-1 md:py-2 px-2 md:px-3 text-center align-middle">
                3
              </td>
              <td className="border border-black py-1 md:py-2 px-2 md:px-3 font-semibold text-center align-middle">
                Rekomendasi
              </td>
              <td className="border border-black py-1 md:py-2 px-2 md:px-3 text-justify leading-tight md:leading-normal">
                {jurnalData?.rekomendasi || "-"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Tanda Tangan */}
        <div className="flex justify-end pr-2 md:pr-12 text-[10px] md:text-base">
          <div className="flex flex-col items-center text-center">
            <p className="mb-0">Guru Damping Kelas,</p>
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
