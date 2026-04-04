import React from "react";
import { X, Printer, FileDown } from "lucide-react";

export default function KisiPopUp({ activeSiswa, kisiData, closeModal }) {
  const currentYear = new Date().getFullYear();
  const tahunAjar = kisiData?.tahun || `${currentYear}/${currentYear + 1}`;

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `KISI_KISI_${activeSiswa?.nama?.replace(/\s+/g, "_")}`;
    window.print();
    document.title = originalTitle;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/95 backdrop-blur-md overflow-y-auto p-4 md:p-10 animate-in fade-in zoom-in-95 duration-300 print:hidden">
      {/* ACTION BAR */}
      <div className="fixed top-5 right-5 flex gap-3 z-[110]">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 font-bold text-xs uppercase tracking-widest"
        >
          <Printer size={18} /> Cetak & PDF
        </button>
        <button
          onClick={closeModal}
          className="p-2.5 bg-white/10 hover:bg-rose-500 text-white border border-white/20 rounded-full transition-all shadow-lg"
        >
          <X size={22} />
        </button>
      </div>

      {/* KERTAS PREVIEW */}
      <div className="w-full max-w-[21cm] bg-white shadow-[0_0_50px_rgba(0,0,0,0.5)] mx-auto p-8 md:p-16 text-black min-h-[29.7cm] relative my-10 rounded-sm">
        {/* HEADER */}
        <div className="flex items-center gap-6 mb-8 border-b-[3px] border-black pb-5">
          <img
            src="/logo.svg"
            alt="Logo"
            className="w-20 h-20 md:w-24 md:h-24 object-contain"
          />
          <div className="flex-1 text-center pr-20 md:pr-24 font-serif">
            <h1 className="text-xl md:text-2xl font-bold uppercase tracking-widest leading-tight">
              Kisi-Kisi Penilaian Akademik
            </h1>
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-wider leading-tight">
              Tahun Ajaran {tahunAjar}
            </h2>
          </div>
        </div>

        {/* INFO SISWA */}
        <div className="mb-6 font-serif">
          <table className="text-sm md:text-base border-separate border-spacing-y-1">
            <tbody>
              <tr>
                <td className="w-32 opacity-70">Nama Siswa</td>
                <td className="w-4 text-center">:</td>
                <td className="font-bold uppercase tracking-wide">
                  {activeSiswa?.nama}
                </td>
              </tr>
              <tr>
                <td className="opacity-70">Kelas</td>
                <td className="text-center">:</td>
                <td className="uppercase font-medium">{activeSiswa?.kelas}</td>
              </tr>
              <tr>
                <td className="opacity-70">Jenis Ujian</td>
                <td className="text-center">:</td>
                <td className="font-semibold text-teal-700">
                  {kisiData?.jenis_ujian || "Ujian Tertulis"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* NARASI */}
        <p className="font-serif text-sm md:text-base text-justify mb-8 leading-relaxed indent-10">
          Bersama ini kami sampaikan kisi-kisi dan materi pokok yang akan
          diujikan kepada ananda{" "}
          <span className="font-bold italic text-teal-900">
            {activeSiswa?.nama}
          </span>
          . Kami mohon bantuan Ayah/Bunda untuk turut serta mendampingi dan
          memantau proses belajar ananda di rumah agar mendapatkan hasil yang
          maksimal.
        </p>

        {/* TABEL ISI */}
        <table className="w-full border-collapse border-[1.5px] border-black mb-10 font-serif">
          <thead>
            <tr className="bg-teal-50">
              <th className="border border-black py-3 px-2 w-12 text-center text-xs md:text-sm">
                NO.
              </th>
              <th className="border border-black py-3 px-4 w-48 text-center text-xs md:text-sm">
                MATA PELAJARAN
              </th>
              <th className="border border-black py-3 px-4 text-center text-xs md:text-sm">
                MATERI POKOK / INDIKATOR
              </th>
            </tr>
          </thead>
          <tbody className="align-top">
            <tr>
              <td className="border border-black py-4 px-2 text-center text-sm">
                1.
              </td>
              <td className="border border-black py-4 px-4 font-bold text-center text-sm md:text-base bg-slate-50/50">
                {kisiData?.mata_pelajaran || "-"}
              </td>
              <td className="border border-black py-4 px-5 text-justify text-sm leading-relaxed min-h-[200px]">
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

        {/* TTD SECTION */}
        <div className="flex justify-end pr-4 md:pr-10 font-serif">
          <div className="flex flex-col items-center text-center">
            <p className="text-sm mb-1 italic">
              Pekanbaru,{" "}
              {new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="text-sm font-medium mb-1">Guru Pengampu,</p>
            <div className="w-28 h-14 md:w-36 md:h-20 flex items-center justify-center overflow-hidden my-1 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
              <img
                src="/assets/ttd.svg"
                alt="Tanda Tangan"
                className="w-full h-full object-contain scale-110 mix-blend-multiply"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
            <p className="font-bold mt-1 text-sm md:text-base underline underline-offset-4">
              Nina Rahilah, S.Pd.
            </p>
          </div>
        </div>

        {/* WATERMARK PREVIEW */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none opacity-[0.03] select-none">
          <h1 className="text-9xl font-black uppercase">PREVIEW</h1>
        </div>
      </div>
    </div>
  );
}
