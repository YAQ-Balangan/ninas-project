// File: src/templates/TabPrint.jsx
import React from "react";
import { Printer, Download, FileText } from "lucide-react";

export default function TabPrint({
  activeTab,
  filteredSiswa,
  filteredKeuangan,
  filteredKisi,
  nilaiData,
  jurnalData,
  siswaData,
}) {
  // Fungsi Cerdas Membuat File Excel Asli (.xls)
  const exportToTrueExcel = (filename, dataRows) => {
    let tableHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body><table border="1">`;

    dataRows.forEach((row, rowIndex) => {
      tableHtml += "<tr>";
      row.forEach((cell) => {
        if (rowIndex === 0) {
          tableHtml += `<th style="background-color: #0f766e; color: white; font-weight: bold; padding: 8px;">${cell}</th>`;
        } else {
          tableHtml += `<td style="padding: 4px;">${cell}</td>`;
        }
      });
      tableHtml += "</tr>";
    });

    tableHtml += "</table></body></html>";

    const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSiswa = () => {
    const rows = [["No", "Nama Lengkap", "Kelas"]];
    filteredSiswa.forEach((s, i) => rows.push([i + 1, s.nama, s.kelas]));
    exportToTrueExcel("Data_Siswa_Ninas_Project", rows);
  };

  const handleExportNilai = () => {
    const rows = [
      [
        "No",
        "Nama",
        "Kelas",
        "Hafalan",
        "Catatan",
        "Ulangan",
        "Ujian",
        "Rata-rata",
        "Keterangan",
      ],
    ];
    filteredSiswa.forEach((s, i) => {
      const n = nilaiData[String(s.id)] || {};
      const rata =
        ((Number(n.hafalan) || 0) +
          (Number(n.catatan) || 0) +
          (Number(n.ulangan) || 0) +
          (Number(n.ujian) || 0)) /
        4;
      rows.push([
        i + 1,
        s.nama,
        s.kelas,
        n.hafalan || 0,
        n.catatan || 0,
        n.ulangan || 0,
        n.ujian || 0,
        rata.toFixed(2),
        n.keterangan || "",
      ]);
    });
    exportToTrueExcel("Rekap_Nilai_Ninas_Project", rows);
  };

  const handleExportKeuangan = () => {
    const rows = [
      [
        "No",
        "Tanggal",
        "Nama",
        "Kelas",
        "Infaq",
        "Cicilan",
        "Konsumsi",
        "Makan Siang",
        "Total",
        "Metode",
        "Status",
      ],
    ];
    filteredKeuangan.forEach((k, i) => {
      const s =
        siswaData.find((siswa) => String(siswa.id) === String(k.siswa_id)) ||
        {};
      const total =
        (Number(k.infaq) || 0) +
        (Number(k.cicilan) || 0) +
        (Number(k.konsumsi) || 0) +
        (Number(k.makan) || 0);
      rows.push([
        i + 1,
        k.tanggal || "-",
        s.nama || "Unknown",
        s.kelas || "-",
        k.infaq || 0,
        k.cicilan || 0,
        k.konsumsi || 0,
        k.makan || 0,
        total,
        k.metode || "-",
        k.status || "-",
      ]);
    });
    exportToTrueExcel("Riwayat_Keuangan_Ninas_Project", rows);
  };

  const handleExportJurnal = () => {
    const rows = [
      [
        "No",
        "Nama",
        "Kelas",
        "Tahun",
        "Potensi",
        "Catatan Observasi",
        "Rekomendasi",
      ],
    ];
    filteredSiswa.forEach((s, i) => {
      const j = jurnalData[String(s.id)] || {};
      rows.push([
        i + 1,
        s.nama,
        s.kelas,
        j.tahun || "-",
        j.potensi || "-",
        j.catatan_observasi || "-",
        j.rekomendasi || "-",
      ]);
    });
    exportToTrueExcel("Jurnal_Siswa_Ninas_Project", rows);
  };

  const handleExportKisi = () => {
    const rows = [
      ["No", "Kelas", "Tahun", "Mata Pelajaran", "Jenis Ujian", "Materi Pokok"],
    ];
    filteredKisi.forEach((k, i) => {
      rows.push([
        i + 1,
        k.kelas || "-",
        k.tahun || "-",
        k.mata_pelajaran || "-",
        k.jenis_ujian || "-",
        k.materi || "-",
      ]);
    });
    exportToTrueExcel("Kisi_Kisi_Ninas_Project", rows);
  };

  const handleExport = () => {
    if (activeTab === "siswa") handleExportSiswa();
    else if (activeTab === "nilai") handleExportNilai();
    else if (activeTab === "keuangan") handleExportKeuangan();
    else if (activeTab === "jurnal") handleExportJurnal();
    else if (activeTab === "kisi") handleExportKisi();
  };

  // Fungsi Cetak dengan Nama Dinamis
  const handlePrint = () => {
    const dateStr = new Date().toLocaleDateString("id-ID").replace(/\//g, "-");
    const titleMap = {
      siswa: "Data_Siswa",
      nilai: "Rekap_Nilai",
      keuangan: "Riwayat_Keuangan",
      jurnal: "Jurnal_Observasi",
      kisi: "Kisi_Kisi",
    };

    const originalTitle = document.title;
    document.title = `Laporan_${titleMap[activeTab]}_${dateStr}`;
    window.print();
    document.title = originalTitle; // Kembalikan judul asli
  };

  if (!["nilai", "keuangan", "siswa", "jurnal", "kisi"].includes(activeTab))
    return null;

  return (
    <div className="flex items-center gap-1 md:gap-2 ml-auto md:ml-2 bg-slate-50 p-1 rounded-lg md:rounded-xl border border-slate-200">
      <button
        onClick={handlePrint}
        className="px-2 py-1.5 md:px-3 md:py-2 bg-white text-rose-600 hover:bg-rose-50 font-bold rounded-md md:rounded-lg text-[9px] md:text-[10px] tracking-widest uppercase flex items-center gap-1 shadow-sm transition-all"
      >
        <FileText size={12} /> PDF
      </button>
      <button
        onClick={handlePrint}
        className="px-2 py-1.5 md:px-3 md:py-2 bg-white text-teal-600 hover:bg-teal-50 font-bold rounded-md md:rounded-lg text-[9px] md:text-[10px] tracking-widest uppercase flex items-center gap-1 shadow-sm transition-all"
      >
        <Printer size={12} /> Print
      </button>
      <button
        onClick={handleExport}
        className="px-2 py-1.5 md:px-3 md:py-2 bg-slate-800 text-white hover:bg-slate-700 font-bold rounded-md md:rounded-lg text-[9px] md:text-[10px] tracking-widest uppercase flex items-center gap-1 shadow-md transition-all"
      >
        <Download size={12} /> Excel
      </button>
    </div>
  );
}
