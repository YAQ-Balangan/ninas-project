import React from "react";

export default function JurnalPrint({ activeSiswa, jurnalData }) {
  if (!activeSiswa) return null;
  const tahunAjar = jurnalData?.tahun || new Date().getFullYear();

  return (
    <div
      id="jurnal-print-area"
      className="hidden print:block w-full max-w-4xl mx-auto bg-white text-black font-serif text-sm"
    >
      <div className="flex items-center gap-4 mb-5 border-b-[3px] border-black pb-3">
        <img src="/logo.svg" alt="Logo" className="w-20 h-20 object-contain" />
        <div className="flex-1 text-center pr-20">
          <h1 className="text-[17px] font-bold uppercase tracking-wider mb-1 leading-tight whitespace-nowrap">
            Jurnal Observasi Perkembangan Siswa
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
              <td className="w-24 pb-0.5">Nama</td>
              <td className="w-4 pb-0.5 text-center">:</td>
              <td className="pb-0.5 font-bold">{activeSiswa?.nama}</td>
            </tr>
            <tr>
              <td className="pb-0.5">Kelas</td>
              <td className="pb-0.5 text-center">:</td>
              <td className="pb-0.5">{activeSiswa?.kelas}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-justify mb-4 leading-relaxed indent-8">
        Yth. Ayah/Bunda <span className="font-bold">{activeSiswa?.nama}</span>,
        merupakan sebuah kebahagiaan bagi saya dapat mendampingi ananda di
        kelas. Izinkan saya menyampaikan catatan singkat mengenai keseharian
        ananda, sebagai bentuk perhatian kami terhadap tumbuh kembangnya.
      </p>

      <table className="w-full border-collapse border border-black mb-6">
        <thead>
          <tr className="bg-teal-100">
            <th className="border border-black py-2 px-3 w-12 text-center">
              No.
            </th>
            <th className="border border-black py-2 px-3 w-40 text-center">
              Kategori
            </th>
            <th className="border border-black py-2 px-3 text-center">
              Catatan
            </th>
          </tr>
        </thead>
        <tbody className="align-top">
          <tr>
            <td className="border border-black py-2 px-3 text-center">1</td>
            <td className="border border-black py-2 px-3 font-semibold">
              Potensi
            </td>
            <td className="border border-black py-2 px-3 min-h-[60px]">
              {jurnalData?.potensi || "-"}
            </td>
          </tr>
          <tr>
            <td className="border border-black py-2 px-3 text-center">2</td>
            <td className="border border-black py-2 px-3 font-semibold">
              Catatan Observasi
            </td>
            <td className="border border-black py-2 px-3 min-h-[80px]">
              {jurnalData?.catatan_observasi || "-"}
            </td>
          </tr>
          <tr>
            <td className="border border-black py-2 px-3 text-center">3</td>
            <td className="border border-black py-2 px-3 font-semibold">
              Rekomendasi
            </td>
            <td className="border border-black py-2 px-3 min-h-[60px]">
              {jurnalData?.rekomendasi || "-"}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-end pr-12">
        <div className="flex flex-col items-center text-center">
          <p className="mb-0">Guru Damping Kelas,</p>
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
