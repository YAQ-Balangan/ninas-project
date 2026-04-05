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

  // LOGIKA DINAMIS: Judul dan Semester mengikuti tulisan di kolom "Jenis Ujian"
  const judulUjian = (
    kisiData?.jenis_ujian || "SUMATIF AKHIR SEMESTER I"
  ).toUpperCase();
  const isSemester2 = judulUjian.match(/\b(II|2|GENAP)\b/i);
  const strSemester = isSemester2 ? "II" : "I";

  // Logika Pemecah Baris 3 Segmen (Jenis:::Nomor:::Teks)
  const barisData = (kisiData?.materi || "")
    .split("\n")
    .filter((b) => b.trim() !== "");

  const listSoal = barisData.map((baris, index) => {
    const parts = baris.split(":::");
    let jenis = "PG",
      no = index + 1,
      teks = baris;
    if (parts.length >= 3) {
      jenis = parts[0];
      no = parts[1];
      teks = parts.slice(2).join(":::");
    } else if (parts.length === 2) {
      jenis = parts[0];
      teks = parts[1];
    }
    return { no, jenis, teks };
  });

  return (
    <div
      id="kisi-print-area"
      className="hidden print:block w-full max-w-none mx-auto bg-white text-black font-serif p-2"
    >
      {/* Judul Cetak Dinamis */}
      <div className="text-center font-bold mb-4">
        <h1 className="text-[14px] uppercase tracking-wide leading-none">
          KISI – KISI SOAL {judulUjian}
        </h1>
        <h2 className="text-[14px] uppercase tracking-wide mt-1">
          TAHUN PELAJARAN {tahunAjar}
        </h2>
      </div>

      <div className="flex justify-between font-bold text-[11px] mb-2 border-b-0">
        <div className="space-y-0.5">
          <div className="flex whitespace-nowrap">
            <span className="w-32">NAMA SEKOLAH</span>
            <span className="px-1">:</span>
            <span className="capitalize">SD Islam Al-Istiqomah</span>
          </div>
          <div className="flex whitespace-nowrap">
            <span className="w-32">MATA PELAJARAN</span>
            <span className="px-1">:</span>
            <span className="capitalize">{mapel}</span>
          </div>
        </div>
        <div className="space-y-0.5 text-left">
          <div className="flex whitespace-nowrap">
            <span className="w-28">KELAS/SEMESTER</span>
            <span className="px-1">:</span>
            {/* Semester Otomatis */}
            <span className="capitalize">
              {displayKelas}/{strSemester}
            </span>
          </div>
          <div className="flex whitespace-nowrap">
            <span className="w-28">NAMA PENGAJAR</span>
            <span className="px-1">:</span>
            <span className="capitalize">Nina Rahilah, S.Pd.</span>
          </div>
        </div>
      </div>

      <table className="w-full border-collapse border border-black mb-3">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-black py-1 px-2 text-center uppercase text-[10px] w-[65%]">
              MATERI POKOK/INDIKATOR
            </th>
            <th className="border border-black py-1 px-2 w-16 text-center uppercase text-[10px]">
              NO.SOAL
            </th>
            <th className="border border-black py-1 px-2 w-28 text-center uppercase text-[10px]">
              BENTUK SOAL
            </th>
          </tr>
        </thead>
        <tbody className="align-top font-sans text-[11px] leading-tight">
          {listSoal.map((item, i) => (
            <tr key={i}>
              <td className="border border-black py-0.5 px-2 text-justify">
                {item.teks}
              </td>
              <td className="border border-black py-0.5 px-2 text-center font-semibold align-middle">
                {item.no}
              </td>
              <td className="border border-black py-0.5 px-2 text-center font-bold align-middle">
                {item.jenis}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-[10px] font-bold whitespace-nowrap">CATATAN:</div>
      <style
        dangerouslySetInnerHTML={{
          __html: `@media print { @page { size: auto; margin: 1.5cm; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }`,
        }}
      />
    </div>
  );
}
