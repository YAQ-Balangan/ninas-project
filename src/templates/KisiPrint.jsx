import React from "react";

export default function KisiPrint({ activeSiswa, kisiData }) {
  if (!activeSiswa) return null;

  const currentYear = new Date().getFullYear();
  const tahunAjar = kisiData?.tahun || `${currentYear}/${currentYear + 1}`;

  return (
    <div
      id="kisi-print-area"
      className="hidden print:block w-full max-w-[21cm] mx-auto bg-white text-black font-serif p-0"
    >
      {/* KOP SURAT */}
      <div className="flex items-center gap-4 mb-6 border-b-[3px] border-black pb-4">
        <img src="/logo.svg" alt="Logo" className="w-24 h-24 object-contain" />
        <div className="flex-1 text-center pr-24">
          <h1 className="text-2xl font-bold uppercase tracking-widest leading-tight">
            Kisi-Kisi Penilaian Akademik
          </h1>
          <h2 className="text-xl font-bold uppercase tracking-wider leading-tight">
            Tahun Ajaran {tahunAjar}
          </h2>
          <p className="text-xs mt-1 font-sans italic normal-case font-normal text-gray-600">
            Dokumen Resmi Laporan Capaian Pembelajaran Siswa
          </p>
        </div>
      </div>

      {/* DATA SISWA */}
      <div className="mb-6 ml-2">
        <table className="text-sm border-separate border-spacing-y-1">
          <tbody>
            <tr>
              <td className="w-32 font-semibold">Nama Siswa</td>
              <td className="w-4 text-center">:</td>
              <td className="font-bold uppercase tracking-wide">
                {activeSiswa?.nama}
              </td>
            </tr>
            <tr>
              <td className="font-semibold">Kelas / Kelompok</td>
              <td className="text-center">:</td>
              <td className="uppercase">{activeSiswa?.kelas}</td>
            </tr>
            <tr>
              <td className="font-semibold">Jenis Penilaian</td>
              <td className="text-center">:</td>
              <td className="font-medium">
                {kisiData?.jenis_ujian || "Ujian Tertulis"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* PENGANTAR */}
      <p className="text-sm text-justify mb-6 leading-relaxed indent-10 px-2">
        Bersama ini kami sampaikan rincian kisi-kisi dan materi pokok yang akan
        diujikan kepada ananda
        <span className="font-bold"> {activeSiswa?.nama}</span>. Kami
        mengharapkan kerja sama Ayah/Bunda untuk mendampingi serta memotivasi
        proses belajar ananda di rumah agar mendapatkan hasil yang optimal.
      </p>

      {/* TABEL MATERI */}
      <table className="w-full border-collapse border-[1.5px] border-black mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black py-3 px-2 w-12 text-center text-sm uppercase">
              No.
            </th>
            <th className="border border-black py-3 px-4 w-56 text-center text-sm uppercase">
              Mata Pelajaran
            </th>
            <th className="border border-black py-3 px-4 text-center text-sm uppercase">
              Materi Pokok / Indikator
            </th>
          </tr>
        </thead>
        <tbody className="align-top">
          <tr>
            <td className="border border-black py-4 px-2 text-center text-sm">
              1.
            </td>
            <td className="border border-black py-4 px-4 font-bold text-center text-sm bg-gray-50/50">
              {kisiData?.mata_pelajaran || "-"}
            </td>
            <td className="border border-black py-4 px-5 text-justify text-[13px] leading-relaxed min-h-[300px]">
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

      {/* TANDA TANGAN */}
      <div className="flex justify-end pr-10">
        <div className="flex flex-col items-center text-center">
          <p className="text-sm mb-1">
            Pekanbaru,{" "}
            {new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="text-sm font-medium mb-2">Guru Pengampu,</p>
          <div className="w-40 h-20 flex items-center justify-center overflow-hidden my-1">
            <img
              src="/assets/ttd.svg"
              alt="Tanda Tangan"
              className="w-full h-full object-contain scale-110 mix-blend-multiply"
              onError={(e) => (e.target.style.opacity = "0")}
            />
          </div>
          <p className="font-bold text-sm underline decoration-1 underline-offset-4">
            Nina Rahilah, S.Pd.
          </p>
          <p className="text-[10px] uppercase tracking-tighter text-gray-500 mt-0.5">
            NIP. -
          </p>
        </div>
      </div>

      {/* STYLE KHUSUS PRINT */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page { size: A4; margin: 2cm; }
              body { -webkit-print-color-adjust: exact !important; }
              #kisi-print-area { display: block !important; }
            }
          `,
        }}
      />
    </div>
  );
}
