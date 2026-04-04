// File: src/templates/KisiPrint.jsx
import React from "react";

export default function KisiPrint({ activeSiswa, kisiData }) {
  if (!activeSiswa) return null;

  const currentYear = new Date().getFullYear();
  const tahunAjar = kisiData?.tahun || `${currentYear}/${currentYear + 1}`;

  // Mencegah tulisan "Kelas Kelas 1" (double)
  const rawKelas = String(activeSiswa?.kelas || "");
  const displayKelas = rawKelas.toLowerCase().includes("kelas")
    ? rawKelas
    : `Kelas ${rawKelas}`;

  return (
    <div
      id="kisi-print-area"
      className="hidden print:block w-full max-w-4xl mx-auto bg-white text-black font-serif text-sm"
    >
      <div className="flex items-center gap-4 mb-5 border-b-[3px] border-black pb-3">
        <img src="/logo.svg" alt="Logo" className="w-20 h-20 object-contain" />
        <div className="flex-1 text-center pr-20">
          <h1 className="text-[17px] font-bold uppercase tracking-wider mb-1 leading-tight whitespace-nowrap">
            Kisi-Kisi Sumatif Akhir Semester II
          </h1>
          <h2 className="text-[17px] font-bold uppercase tracking-wider mb-0 leading-tight whitespace-nowrap">
            Tahun Ajaran {tahunAjar}
          </h2>
        </div>
      </div>

      <div className="mb-4">
        <table>
          <tbody>
            <tr>
              <td className="w-32 pb-0.5 font-semibold">Sasaran Kelas</td>
              <td className="w-4 pb-0.5 text-center">:</td>
              <td className="pb-0.5 font-bold uppercase">{displayKelas}</td>
            </tr>
            <tr>
              <td className="pb-0.5 font-semibold">Jenis Penilaian</td>
              <td className="pb-0.5 text-center">:</td>
              <td className="pb-0.5 font-medium">
                {kisiData?.jenis_ujian || "Ujian Tertulis"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-justify mb-4 leading-relaxed indent-8">
        Bersama ini kami sampaikan rincian kisi-kisi dan materi pokok yang akan
        diujikan kepada siswa/i{" "}
        <span className="font-bold">{displayKelas}</span>. Kami mengharapkan
        kerja sama Ayah/Bunda untuk mendampingi serta memotivasi proses belajar
        ananda di rumah agar mendapatkan hasil yang optimal.
      </p>

      <table className="w-full border-collapse border border-black mb-6">
        <thead>
          <tr className="bg-teal-100">
            <th className="border border-black py-2 px-3 w-12 text-center uppercase">
              No.
            </th>
            <th className="border border-black py-2 px-3 w-48 text-center uppercase">
              Mata Pelajaran
            </th>
            <th className="border border-black py-2 px-3 text-center uppercase">
              Materi Pokok / Indikator
            </th>
          </tr>
        </thead>
        <tbody className="align-top">
          <tr>
            <td className="border border-black py-3 px-3 text-center align-middle">
              1.
            </td>
            <td className="border border-black py-3 px-3 font-bold align-middle text-center bg-gray-50/50">
              {kisiData?.mata_pelajaran || "-"}
            </td>
            <td className="border border-black py-3 px-4 min-h-[150px] text-justify leading-relaxed">
              {kisiData?.materi ? (
                <div className="whitespace-pre-line">{kisiData.materi}</div>
              ) : (
                <span className="italic text-gray-400">
                  Belum ada rincian materi.
                </span>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-end pr-12">
        <div className="flex flex-col items-center text-center">
          <p className="mb-0 font-medium mt-1">Guru Pengampu,</p>
          <div className="w-32 h-16 flex items-center justify-center overflow-hidden my-0">
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
      <style
        dangerouslySetInnerHTML={{
          __html: `@media print { @page { size: auto; margin: 2.54cm; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }`,
        }}
      />
    </div>
  );
}
