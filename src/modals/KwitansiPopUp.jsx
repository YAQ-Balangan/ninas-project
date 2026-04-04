import React from "react";
import { Camera, Printer, X } from "lucide-react";
import { formatRp } from "../utils/helpers";

export default function KwitansiPopUp({
  activeSiswa,
  formData,
  getNomorKwitansi,
  handleDownloadImage,
  isCapturing,
  closeModal,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-300 print:hidden">
      <div className="absolute top-4 right-4 flex flex-wrap gap-2 z-50 justify-end">
        <button
          onClick={handleDownloadImage}
          disabled={isCapturing}
          className="px-3 py-2 md:px-4 md:py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold tracking-widest uppercase rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] shadow-[0_8px_20px_rgba(59,130,246,0.3)] disabled:opacity-70 transition-all hover:-translate-y-0.5"
        >
          <Camera size={14} className="md:w-4 md:h-4" />{" "}
          {isCapturing ? "Proses..." : "Simpan Gambar"}
        </button>
        <button
          onClick={() => window.print()}
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

      <div
        id="kwitansi-print-area"
        className="w-full max-w-sm md:max-w-md bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-5 md:p-6 relative mt-16 md:mt-0 mx-auto"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <span
            className={`text-[4rem] md:text-[6rem] font-black uppercase tracking-widest -rotate-[35deg] opacity-[0.04] select-none ${formData.status === "Sudah" ? "text-teal-900" : "text-amber-900"}`}
          >
            {formData.status === "Sudah" ? "LUNAS" : "BELUM"}
          </span>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-center border-b-2 border-slate-800 pb-3 mb-4 bg-white/50">
            <div className="flex items-center gap-2.5 md:gap-3">
              <img
                src="/logo.svg"
                alt="Logo Nina"
                className="w-10 h-10 md:w-12 md:h-12 object-contain"
              />
              <div>
                <h1 className="text-sm md:text-lg text-[#000080] font-bismillah tracking-widest leading-tight">
                  Nina Rahell Project
                </h1>
                <p className="text-[7px] md:text-[9px] text-slate-500 font-bold tracking-[0.2em] mt-0.5">
                  Manajemen Akademik
                </p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-sm md:text-xl text-slate-300 uppercase font-black tracking-widest leading-tight">
                Kwitansi
              </h2>
              <p className="text-[8px] md:text-[10px] font-bold text-slate-700 mt-1 uppercase tracking-widest bg-slate-100 inline-block px-1.5 py-0.5 rounded-sm">
                No: {getNomorKwitansi(formData.id)}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 text-[9px] md:text-[11px]">
            <table className="w-full text-left text-slate-800">
              <tbody>
                <tr>
                  <td className="font-bold py-1 w-20 text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    Nama
                  </td>
                  <td className="py-1 w-2 font-black text-slate-400">:</td>
                  <td className="py-1 font-bold text-[10px] md:text-[12px] text-slate-800">
                    {activeSiswa.nama}
                  </td>
                </tr>
                <tr>
                  <td className="font-bold py-1 text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    Kategori
                  </td>
                  <td className="py-1 w-2 font-black text-slate-400">:</td>
                  <td className="py-1 font-bold text-slate-800">
                    {activeSiswa.kelas}
                  </td>
                </tr>
                <tr>
                  <td className="font-bold py-1 text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    Tanggal
                  </td>
                  <td className="py-1 w-2 font-black text-slate-400">:</td>
                  <td className="py-1 font-bold text-slate-800">
                    {formData.tanggal
                      ? new Date(formData.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </td>
                </tr>
                <tr>
                  <td className="font-bold py-1 text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    Metode
                  </td>
                  <td className="py-1 w-2 font-black text-slate-400">:</td>
                  <td className="py-1 font-bold flex items-center gap-1.5 text-slate-800">
                    {formData.metode || "Cash"}
                    <span
                      className={`px-1.5 py-0.5 rounded-sm text-[7px] md:text-[8px] uppercase tracking-widest ${formData.status === "Sudah" ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {formData.status === "Sudah" ? "Lunas" : "Belum Selesai"}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <table className="w-full border-2 border-slate-300 text-[9px] md:text-[10px] mb-6 bg-white overflow-hidden rounded-md">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-1.5 md:p-2 border-r border-b border-slate-300 text-slate-700 font-black uppercase tracking-widest whitespace-nowrap">
                  Rincian Pembayaran
                </th>
                <th className="p-1.5 md:p-2 border-b border-slate-300 text-right text-slate-700 w-24 md:w-32 font-black uppercase tracking-widest whitespace-nowrap">
                  Nominal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              <tr>
                <td className="p-1.5 md:p-2 border-r border-slate-300 font-semibold text-slate-600">
                  Infaq Pendidikan
                </td>
                <td className="p-1.5 md:p-2 text-right font-black text-slate-800">
                  {formatRp(formData.infaq)}
                </td>
              </tr>
              <tr>
                <td className="p-1.5 md:p-2 border-r border-slate-300 font-semibold text-slate-600">
                  Cicilan Daftar Ulang
                </td>
                <td className="p-1.5 md:p-2 text-right font-black text-slate-800">
                  {formatRp(formData.cicilan)}
                </td>
              </tr>
              <tr>
                <td className="p-1.5 md:p-2 border-r border-slate-300 font-semibold text-slate-600">
                  Biaya Konsumsi
                </td>
                <td className="p-1.5 md:p-2 text-right font-black text-slate-800">
                  {formatRp(formData.konsumsi)}
                </td>
              </tr>
              <tr>
                <td className="p-1.5 md:p-2 border-r border-slate-300 font-semibold text-slate-600">
                  Makan Siang
                </td>
                <td className="p-1.5 md:p-2 text-right font-black text-slate-800">
                  {formatRp(formData.makan)}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-800 text-white">
              <tr>
                <td className="p-2 md:p-2.5 border-r border-slate-700 text-right uppercase tracking-widest text-[8px] md:text-[9px] font-black whitespace-nowrap">
                  Total Pembayaran
                </td>
                <td className="p-2 md:p-2.5 text-right text-[11px] md:text-[13px] font-black text-teal-300 whitespace-nowrap">
                  {formatRp(
                    (Number(formData.infaq) || 0) +
                      (Number(formData.cicilan) || 0) +
                      (Number(formData.konsumsi) || 0) +
                      (Number(formData.makan) || 0),
                  )}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="flex justify-end pr-2 md:pr-4 text-center">
            <div className="flex flex-col items-center">
              <p className="mb-0 text-[8px] md:text-[9px] uppercase text-slate-500 font-black tracking-[0.2em]">
                Penerima
              </p>
              <div className="w-24 h-12 md:w-32 md:h-16 flex items-center justify-center overflow-hidden my-0.5">
                <img
                  src="/assets/ttd.svg"
                  alt="Tanda Tangan"
                  className="w-full h-full object-cover scale-90 mix-blend-multiply"
                />
              </div>
              <p className="text-slate-800 font-black text-[9px] md:text-[11px] tracking-wide whitespace-nowrap">
                Nina Rahilah S.Pd.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
