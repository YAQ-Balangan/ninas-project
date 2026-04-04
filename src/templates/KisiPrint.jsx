import React from "react";

export default function KisiPrint({ activeSiswa, kisiData }) {
  if (!activeSiswa || !kisiData) return null;
  const currentYear = new Date().getFullYear();
  const tahunAjar = kisiData?.tahun || `${currentYear}/${currentYear + 1}`;
  const mapel = kisiData?.mata_pelajaran || "-";

  const rawKelas = String(activeSiswa?.kelas || kisiData?.kelas || "");
  const displayKelas = rawKelas.toLowerCase().includes("kelas")
    ? rawKelas.replace(/kelas/i, "").trim()
    : rawKelas;

  // Logika Pemecah Baris (Smart Parser) menggunakan :::
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

  return (
    <div
      id="kisi-print-area"
      className="hidden print:block w-full max-w-none mx-auto bg-white text-black font-serif p-2"
    >
      {/* Judul Cetak - SAS I */}
      <div className="text-center font-bold mb-6">
        <h1 className="text-[15px] uppercase tracking-wide leading-none">
          KISI – KISI SOAL SUMATIF AKHIR SEMESTER I
        </h1>
        <h2 className="text-[15px] uppercase tracking-wide mt-1">
          TAHUN PELAJARAN {tahunAjar}
        </h2>
      </div>

      {/* Identitas Cetak - Lebar Label Diperkecil agar ":" lebih dekat */}
      <div className="flex justify-between font-bold text-[11px] mb-3 border-b-0">
        <div className="space-y-0.5">
          <div className="flex whitespace-nowrap">
            <span className="w-32">NAMA SEKOLAH</span>
            <span className="px-1">:</span>
            <span className="uppercase">SD ISLAM AL-ISTIQOMAH</span>
          </div>
          <div className="flex whitespace-nowrap">
            <span className="w-32">MATA PELAJARAN</span>
            <span className="px-1">:</span>
            <span className="uppercase">{mapel}</span>
          </div>
        </div>
        <div className="space-y-0.5 text-left">
          <div className="flex whitespace-nowrap">
            <span className="w-28">KELAS/SEMESTER</span>
            <span className="px-1">:</span>
            <span className="uppercase">{displayKelas}/1</span>
          </div>
          <div className="flex whitespace-nowrap">
            <span className="w-28">NAMA PENGAJAR</span>
            <span className="px-1">:</span>
            <span className="uppercase">Nina Rahilah, S.Pd.</span>
          </div>
        </div>
      </div>

      {/* Tabel Rincian Soal */}
      <table className="w-full border-collapse border border-black mb-4">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-black py-1.5 px-2 text-center uppercase text-[10px] w-[65%]">
              CAPAIAN PEMBELAJARAN
            </th>
            <th className="border border-black py-1.5 px-2 w-16 text-center uppercase text-[10px]">
              NO.SOAL
            </th>
            <th className="border border-black py-1.5 px-2 w-28 text-center uppercase text-[10px]">
              BENTUK SOAL
            </th>
          </tr>
        </thead>
        <tbody className="align-top font-sans text-[11px]">
          {listSoal.map((item) => (
            <tr key={item.no}>
              <td className="border border-black py-1.5 px-2 text-justify leading-normal">
                {item.teks}
              </td>
              <td className="border border-black py-1.5 px-2 text-center font-semibold">
                {item.no}
              </td>
              <td className="border border-black py-1.5 px-2 text-center font-bold">
                {item.jenis}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Catatan Bawah */}
      <div className="text-[10px] font-bold uppercase whitespace-nowrap italic">
        CATATAN: Untuk referensi soal bisa dilihat di soal Latihan kita kemaren
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `@media print { 
            @page { size: auto; margin: 1.5cm; } 
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } 
          }`,
        }}
      />
    </div>
  );
}
