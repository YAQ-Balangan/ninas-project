// File: src/templates/KwitansiPrint.jsx
import React from "react";
import { formatRp } from "../utils/helpers";

export default function KwitansiPrint({
  activeSiswa,
  formData,
  getNomorKwitansi,
}) {
  if (!activeSiswa || !formData) return null;

  const total =
    (Number(formData.infaq) || 0) +
    (Number(formData.cicilan) || 0) +
    (Number(formData.konsumsi) || 0) +
    (Number(formData.makan) || 0);

  const tanggalCetak = formData.tanggal
    ? new Date(formData.tanggal).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div className="hidden print:block w-full max-w-4xl mx-auto bg-white text-black p-8 text-sm font-sans relative">
      {/* WATERMARK LUNAS - Dipastikan berada di lapisan bawah (z-0) */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 0, overflow: "hidden" }}
      >
        <span
          className={`font-black uppercase tracking-[0.2em] -rotate-[35deg] select-none whitespace-nowrap`}
          style={{
            fontSize: "clamp(3rem, 15vw, 15rem)",
            opacity: 0.1, // Dikuatkan sedikit dari 0.08 agar lebih kelihatan
            color: formData.status === "Sudah" ? "#065f46" : "#991b1b", // Emerald-900 atau Rose-900
          }}
        >
          {formData.status === "Sudah" ? "L U N A S" : "B E L U M"}
        </span>
      </div>

      {/* KANDUNGAN UTAMA - Dipastikan berada di atas (z-10) */}
      <div className="relative" style={{ zIndex: 10 }}>
        {/* KOP SURAT */}
        <div className="flex justify-between items-end border-b-4 border-double border-black pb-4 mb-6">
          <div className="flex items-center gap-4">
            <img
              src="/logo.svg"
              alt="Logo"
              className="w-16 h-16 object-contain"
            />
            <div>
              <h1
                className="text-3xl text-black leading-tight"
                style={{
                  fontFamily: "'Bismillah', 'Bismillah Script', cursive",
                }}
              >
                Nina Rahell Project
              </h1>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] mt-1">
                Kwitansi Pembayaran
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm">
              No. Kwitansi:{" "}
              <strong className="font-bold">
                {getNomorKwitansi(formData.id)}
              </strong>
            </p>
          </div>
        </div>

        {/* DATA IDENTITAS */}
        <table className="w-full text-left mb-6 text-sm">
          <tbody>
            <tr>
              <td className="py-1 w-40">Telah terima dari</td>
              <td className="py-1 w-4">:</td>
              <td className="py-1 font-bold uppercase">{activeSiswa.nama}</td>
            </tr>
            <tr>
              <td className="py-1">Kelas</td>
              <td className="py-1">:</td>
              <td className="py-1">{activeSiswa.kelas}</td>
            </tr>
            <tr>
              <td className="py-1">Tanggal Pembayaran</td>
              <td className="py-1">:</td>
              <td className="py-1">{tanggalCetak}</td>
            </tr>
            <tr>
              <td className="py-1">Metode Pembayaran</td>
              <td className="py-1">:</td>
              <td className="py-1">{formData.metode}</td>
            </tr>
          </tbody>
        </table>

        {/* TABEL RINCIAN */}
        <table className="w-full border-collapse border border-black mb-8 text-sm bg-transparent">
          <thead>
            <tr>
              <th className="border border-black p-2 text-center w-12">No.</th>
              <th className="border border-black p-2 text-left">
                Keterangan Pembayaran
              </th>
              <th className="border border-black p-2 text-right w-48">
                Jumlah (Rp)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 text-center">1</td>
              <td className="border border-black p-2 text-left">
                Infaq Pendidikan
              </td>
              <td className="border border-black p-2 text-right">
                {formatRp(formData.infaq || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">2</td>
              <td className="border border-black p-2 text-left">
                Cicilan Daftar Ulang
              </td>
              <td className="border border-black p-2 text-right">
                {formatRp(formData.cicilan || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">3</td>
              <td className="border border-black p-2 text-left">
                Biaya Konsumsi
              </td>
              <td className="border border-black p-2 text-right">
                {formatRp(formData.konsumsi || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">4</td>
              <td className="border border-black p-2 text-left">Makan Siang</td>
              <td className="border border-black p-2 text-right">
                {formatRp(formData.makan || 0)}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th
                colSpan="2"
                className="border border-black p-2 text-right tracking-widest"
              >
                TOTAL
              </th>
              <th className="border border-black p-2 text-right text-base font-black">
                {formatRp(total)}
              </th>
            </tr>
          </tfoot>
        </table>

        {/* TANDA TANGAN */}
        <div className="flex justify-end pr-8">
          <div className="text-center w-48">
            <p className="mb-0">Penerima,</p>
            <div className="w-32 h-20 flex items-center justify-center overflow-hidden mx-auto my-1">
              <img
                src="/assets/ttd.svg"
                alt="Tanda Tangan"
                className="w-full h-full object-contain mix-blend-multiply"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
            <p className="font-bold">Nina Rahilah, S.Pd.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
