// File: src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { toPng } from "html-to-image";
import {
  Users,
  Wallet,
  Plus,
  Search,
  Edit,
  Trash2,
  Printer,
  Download,
  FileText,
  UserPlus,
  Banknote,
  ReceiptText,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

// KONEKSI & UTILS TERPISAH
import { supabase } from "../utils/supabaseClient";
import { formatRp, exportToCSV, formatTanggalLengkap } from "../utils/helpers";

// KOMPONEN TERPISAH
import EditableCell from "../components/EditableCell";
import SplashScreen from "../components/SplashScreen";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import FormModal from "../modals/FormModal";
import KwitansiPrint from "../modals/KwitansiPrint";

export default function NinaProjectApp() {
  const [activeTab, setActiveTab] = useState("home");
  const [modalType, setModalType] = useState(null);

  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [isLoading, setIsLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [splashState, setSplashState] = useState("entering");

  // FITUR REALTIME BACKGROUND
  const [isSyncing, setIsSyncing] = useState(false);

  const [kelasOptions, setKelasOptions] = useState([]);
  const [siswaData, setSiswaData] = useState([]);
  const [nilaiData, setNilaiData] = useState({});
  const [keuanganData, setKeuanganData] = useState([]);

  const [formData, setFormData] = useState({});
  const [activeSiswa, setActiveSiswa] = useState(null);

  useEffect(() => {
    const t1 = setTimeout(() => setSplashState("exiting"), 2000);
    const t2 = setTimeout(() => setSplashState("hidden"), 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) {
        window.location.replace("#home");
        return;
      }
      const parts = hash.split("/");
      setActiveTab(parts[0] || "home");
      setModalType(parts[1] || null);
    };

    window.addEventListener("hashchange", handleHashChange);
    if (!window.location.hash) window.location.replace("#home");
    else handleHashChange();

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navToTab = (tab) => (window.location.hash = tab);

  const openModal = (type, data = null, existData = null) => {
    const today = new Date().toISOString().split("T")[0];

    if (type === "bayar_baru") {
      setActiveSiswa(data);
      setFormData({
        tanggal: today,
        metode: "Cash",
        status: "Sudah",
        infaq: "",
        cicilan: "",
        konsumsi: "",
        makan: "",
      });
      window.location.hash = `${activeTab}/keuangan`;
      return;
    } else if (type === "edit_keuangan") {
      setActiveSiswa(data);
      setFormData({ ...existData });
      window.location.hash = `${activeTab}/keuangan`;
      return;
    } else if (type === "kwitansi") {
      setActiveSiswa(data);
      setFormData({ ...existData });
      window.location.hash = `${activeTab}/kwitansi`;
      return;
    } else if (type === "siswa") {
      // Cari ID terbesar dari data siswa yang ada, lalu tambah 1
      const nextId =
        siswaData.length > 0
          ? Math.max(...siswaData.map((s) => parseInt(s.id) || 0)) + 1
          : 1;

      setFormData(
        data || { id: nextId, nama: "", kelas: kelasOptions[0] || "" },
      );
    } else if (type === "kelas") {
      setFormData({ nama_kelas: "" });
    } else if (type === "nilai") {
      setActiveSiswa(data);
      setFormData({ ...existData, tanggal: existData?.tanggal || today });
    }
    window.location.hash = `${activeTab}/${type}`;
  };

  const closeModal = () => window.location.replace(`#${activeTab}`);

  // LOGIKA FETCH DATA DENGAN DEEP COMPARE AGAR TIDAK KEDIP SAAT AUTO REFRESH
  const fetchData = async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    if (isBackground) setIsSyncing(true);

    try {
      const { data: dKelas } = await supabase
        .from("kelas")
        .select("nama_kelas");
      if (dKelas) {
        const newKelasOptions = dKelas.map((k) => k.nama_kelas);
        setKelasOptions((prev) =>
          JSON.stringify(prev) !== JSON.stringify(newKelasOptions)
            ? newKelasOptions
            : prev,
        );
      }

      const { data: dSiswa } = await supabase.from("siswa").select("*");
      if (dSiswa) {
        setSiswaData((prev) =>
          JSON.stringify(prev) !== JSON.stringify(dSiswa) ? dSiswa : prev,
        );
      }

      const { data: dNilai } = await supabase.from("nilai").select("*");
      if (dNilai) {
        const nData = {};
        dNilai.forEach((n) => (nData[n.siswa_id] = n));
        setNilaiData((prev) =>
          JSON.stringify(prev) !== JSON.stringify(nData) ? nData : prev,
        );
      }

      const { data: dKeuangan } = await supabase
        .from("keuangan")
        .select("*")
        .order("tanggal", { ascending: false });
      if (dKeuangan) {
        setKeuanganData((prev) =>
          JSON.stringify(prev) !== JSON.stringify(dKeuangan) ? dKeuangan : prev,
        );
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  // EFEK INTERVAL REALTIME BACKGROUND (5 DETIK)
  useEffect(() => {
    fetchData(false); // Fetching pertama kali (dengan loading screen penuh)

    const intervalId = setInterval(() => {
      fetchData(true); // Polling background setiap 5 detik
    }, 15000);

    return () => clearInterval(intervalId); // Bersihkan interval saat keluar komponen
  }, []);

  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari aplikasi?"))
      await supabase.auth.signOut();
  };

  const handleInlineSiswa = async (id, key, val) => {
    setSiswaData((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [key]: val } : s)),
    );
    await supabase
      .from("siswa")
      .update({ [key]: val })
      .eq("id", id);
  };

  const handleInlineNilai = async (siswaId, key, val) => {
    const today = new Date().toISOString().split("T")[0];
    const exist = nilaiData[siswaId] || { siswa_id: siswaId, tanggal: today };
    const newData = { ...exist, [key]: val };
    setNilaiData((prev) => ({ ...prev, [siswaId]: newData }));
    await supabase.from("nilai").upsert({ siswa_id: siswaId, ...newData });
  };

  const handleInlineKeuangan = async (transaksiId, key, val) => {
    setKeuanganData((prev) =>
      prev.map((k) => (k.id === transaksiId ? { ...k, [key]: val } : k)),
    );
    await supabase
      .from("keuangan")
      .update({ [key]: val })
      .eq("id", transaksiId);
  };

  const handleSaveData = async (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];
    try {
      if (modalType === "kelas") {
        if (
          formData.nama_kelas &&
          !kelasOptions.includes(formData.nama_kelas)
        ) {
          setKelasOptions([...kelasOptions, formData.nama_kelas]);
          await supabase
            .from("kelas")
            .insert({ nama_kelas: formData.nama_kelas });
        }
      } else if (modalType === "siswa") {
        const existIndex = siswaData.findIndex((s) => s.id === formData.id);
        if (existIndex >= 0) {
          const newData = [...siswaData];
          newData[existIndex] = formData;
          setSiswaData(newData);
        } else setSiswaData([...siswaData, formData]);
        await supabase.from("siswa").upsert({
          id: formData.id,
          nama: formData.nama,
          kelas: formData.kelas,
        });
      } else if (modalType === "nilai") {
        setNilaiData({ ...nilaiData, [activeSiswa.id]: formData });
        await supabase.from("nilai").upsert({
          siswa_id: activeSiswa.id,
          tanggal: formData.tanggal || today,
          hafalan: formData.hafalan || null,
          catatan: formData.catatan || null,
          ulangan: formData.ulangan || null,
          ujian: formData.ujian || null,
          keterangan: formData.keterangan || null,
        });
      } else if (modalType === "keuangan") {
        if (formData.id) {
          await supabase
            .from("keuangan")
            .update({
              tanggal: formData.tanggal,
              infaq: formData.infaq || null,
              cicilan: formData.cicilan || null,
              konsumsi: formData.konsumsi || null,
              makan: formData.makan || null,
              metode: formData.metode,
              status: formData.status,
            })
            .eq("id", formData.id);
          setKeuanganData((prev) =>
            prev.map((item) =>
              item.id === formData.id ? { ...item, ...formData } : item,
            ),
          );
        } else {
          const payload = {
            siswa_id: activeSiswa.id,
            tanggal: formData.tanggal || today,
            infaq: formData.infaq || null,
            cicilan: formData.cicilan || null,
            konsumsi: formData.konsumsi || null,
            makan: formData.makan || null,
            metode: formData.metode || "Cash",
            status: formData.status || "Sudah",
          };
          const { data: newRow, error } = await supabase
            .from("keuangan")
            .insert(payload)
            .select()
            .single();
          if (!error && newRow) setKeuanganData((prev) => [newRow, ...prev]);
          else fetchData(true);
        }
      }
    } catch (error) {
      console.error("Gagal menyimpan ke database:", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    }
    closeModal();
  };

  const handleDeleteSiswa = async (id) => {
    if (
      window.confirm(
        "Yakin ingin menghapus data siswa ini? Semua nilai & keuangan akan terhapus otomatis.",
      )
    ) {
      setSiswaData(siswaData.filter((s) => s.id !== id));
      await supabase.from("siswa").delete().eq("id", id);
    }
  };

  const handleDeleteKeuangan = async (id_transaksi) => {
    if (
      window.confirm(
        "Yakin ingin menghapus riwayat pembayaran ini? Data tidak bisa dikembalikan.",
      )
    ) {
      setKeuanganData(keuanganData.filter((k) => k.id !== id_transaksi));
      await supabase.from("keuangan").delete().eq("id", id_transaksi);
    }
  };

  const getNomorKwitansi = (transaksiId) => {
    if (!transaksiId) return "000";
    if (!isNaN(transaksiId)) return String(transaksiId).padStart(3, "0");
    const strId = String(transaksiId).toUpperCase();
    return strId.slice(-5);
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById("kwitansi-print-area");
    if (!element) return;
    setIsCapturing(true);
    try {
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        style: { margin: "0" },
      });
      const link = document.createElement("a");
      link.download = `Kwitansi_${activeSiswa.nama.replace(/\s+/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Gagal memproses gambar:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  // FILTER & SORT
  const filteredSiswa = useMemo(() => {
    let result = siswaData.filter((s) => {
      const matchSearch = String(s.nama || "")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchKelas = filterKelas ? s.kelas === filterKelas : true;
      return matchSearch && matchKelas;
    });
    if (sortOrder === "asc")
      result.sort((a, b) => a.nama.localeCompare(b.nama));
    else if (sortOrder === "desc")
      result.sort((a, b) => b.nama.localeCompare(a.nama));
    return result;
  }, [siswaData, search, filterKelas, sortOrder]);

  const filteredKeuangan = useMemo(() => {
    let result = keuanganData.filter((k) => {
      const s = siswaData.find((siswa) => siswa.id === k.siswa_id) || {};
      const matchSearch = String(s.nama || "")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchKelas = filterKelas ? s.kelas === filterKelas : true;
      const matchBulan = filterBulan
        ? k.tanggal?.substring(5, 7) === filterBulan
        : true;
      return matchSearch && matchKelas && matchBulan;
    });
    result.sort((a, b) => {
      const sA = siswaData.find((s) => s.id === a.siswa_id)?.nama || "";
      const sB = siswaData.find((s) => s.id === b.siswa_id)?.nama || "";
      if (sortOrder === "asc") return sA.localeCompare(sB);
      return sB.localeCompare(sA);
    });
    return result;
  }, [keuanganData, siswaData, search, filterKelas, filterBulan, sortOrder]);

  const { grandTotalKeuangan, totalCash, totalTransfer } = useMemo(() => {
    let total = 0,
      cash = 0,
      tf = 0;
    keuanganData.forEach((k) => {
      const sum =
        (Number(k.infaq) || 0) +
        (Number(k.cicilan) || 0) +
        (Number(k.konsumsi) || 0) +
        (Number(k.makan) || 0);
      total += sum;
      if (k.metode === "Transfer") tf += sum;
      else cash += sum;
    });
    return { grandTotalKeuangan: total, totalCash: cash, totalTransfer: tf };
  }, [keuanganData]);

  // EXPORT
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
      const n = nilaiData[s.id] || {};
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
    exportToCSV("Rekap_Nilai_Ninas_Project", rows);
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
      const s = siswaData.find((siswa) => siswa.id === k.siswa_id) || {};
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
    exportToCSV("Riwayat_Keuangan_Ninas_Project", rows);
  };

  if (isLoading && splashState === "hidden") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-teal-600 flex-col gap-3 selection-live-bg">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        <p className="font-bold text-sm">Menyinkronkan dengan Database...</p>
      </div>
    );
  }

  const namaBulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  return (
    <>
      <SplashScreen splashState={splashState} />

      <div className="min-h-screen text-slate-800 pb-16 md:pb-0 relative selection-live-bg overflow-x-hidden z-0 font-sans selection:bg-teal-200 selection:text-teal-900">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
          @keyframes gradientBG { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
          .selection-live-bg { background: linear-gradient(-45deg, #f0fdf4, #ecfdf5, #fffbeb, #f0fdfa); background-size: 400% 400%; animation: gradientBG 15s ease infinite; }
          @media print {
            body, html, .selection-live-bg, main, #root, .__next { background: white !important; background-image: none !important; background-color: white !important; margin: 0 !important; padding: 0 !important; }
            nav, .no-print, button, .fixed:not(:has(#kwitansi-print-area)), .animate-blob1, .animate-blob2, .absolute.inset-0.overflow-hidden { display: none !important; }
            main { display: block !important; width: 100% !important; padding: 0 !important; }
            .bg-white\\/80, .bg-white\\/90, .backdrop-blur-xl, .shadow-sm { background: transparent !important; backdrop-filter: none !important; box-shadow: none !important; border: none !important; }
            .print-kop-laporan { display: flex !important; border-bottom: 2px solid #000 !important; margin-bottom: 15px !important; padding-bottom: 10px !important; }
            main table { min-width: 100% !important; width: 100% !important; border: 1px solid #000 !important; border-collapse: collapse !important; }
            main th, main td { border: 1px solid #000 !important; padding: 6px 4px !important; color: black !important; background-color: transparent !important; position: static !important; box-shadow: none !important; }
            body:has(#kwitansi-print-area) main { display: none !important; }
            #kwitansi-print-area { display: block !important; position: relative !important; max-width: 550px !important; margin: 0 auto !important; background: white !important; }
            #kwitansi-print-area table { border: none !important; }
            #kwitansi-print-area td, #kwitansi-print-area th { border: none !important; }
            #kwitansi-print-area .border-2 { border: 1.5px solid #000 !important; }
            #kwitansi-print-area .border-2 td, #kwitansi-print-area .border-2 th { border: 1px solid #000 !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        `,
          }}
        />

        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] opacity-70 no-print">
          <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-emerald-300/30 rounded-[40%] blur-[80px] animate-blob1" />
          <div className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] bg-amber-300/20 rounded-[45%] blur-[80px] animate-blob2" />
          <div
            className="absolute -bottom-[20%] left-[20%] w-[40vw] h-[40vw] bg-teal-300/30 rounded-full blur-[100px] animate-blob1"
            style={{ animationDelay: "-5s" }}
          />
        </div>

        <Navbar
          activeTab={activeTab}
          navToTab={navToTab}
          handleLogout={handleLogout}
        />
        <BottomNav activeTab={activeTab} navToTab={navToTab} />

        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="hidden print-kop-laporan items-center justify-between mb-2 border-b-4 border-double border-slate-800 pb-2">
            <div className="flex items-center gap-4">
              <img
                src="/logo.svg"
                alt="Logo"
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="font-bismillah text-4xl text-[#000080] leading-tight">
                  Nina Rahell Project
                </h1>
                <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-[0.3em]">
                  Manajemen Akademik & Keuangan Siswa
                </p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-black uppercase tracking-widest text-slate-800">
                Laporan{" "}
                {activeTab === "siswa"
                  ? "Data Siswa"
                  : activeTab === "nilai"
                    ? "Rekap Nilai"
                    : "Keuangan Siswa"}
              </h2>
              {filterBulan && activeTab === "keuangan" && (
                <p className="text-sm font-bold text-slate-600 uppercase mt-1">
                  Bulan: {namaBulan[parseInt(filterBulan) - 1]} 2026
                </p>
              )}
              <p className="text-[10px] font-medium text-slate-500 italic mt-1">
                Dicetak pada:{" "}
                {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
              </p>
            </div>
          </div>

          {/* ============================== VIEW: HOME ============================== */}
          {activeTab === "home" && (
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="bg-gradient-to-br from-teal-500/95 to-emerald-700/95 backdrop-blur-xl rounded-3xl p-5 md:p-8 text-white shadow-[0_20px_40px_rgba(20,184,166,0.2)] border border-white/20 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-900/20 rounded-full blur-3xl"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 relative z-10">
                  <div>
                    <p className="text-teal-100 text-xs md:text-sm font-medium mb-1 flex items-center gap-2 tracking-wide uppercase">
                      <TrendingUp size={16} /> Grand Total Dana
                      {/* INDIKATOR SYNC DI BERANDA */}
                      {isSyncing && (
                        <RefreshCw
                          size={12}
                          className="animate-spin text-teal-200 ml-2"
                          title="Menyinkronkan..."
                        />
                      )}
                    </p>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-md">
                      {formatRp(grandTotalKeuangan)}
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                    <div className="bg-white/10 p-3 md:p-4 rounded-2xl border border-white/20 backdrop-blur-md shadow-inner">
                      <p className="text-teal-100 text-[9px] md:text-[10px] uppercase tracking-widest mb-1 font-bold">
                        Total Cash
                      </p>
                      <p className="text-base md:text-xl font-bold text-white tracking-wide">
                        {formatRp(totalCash)}
                      </p>
                    </div>
                    <div className="bg-white/10 p-3 md:p-4 rounded-2xl border border-white/20 backdrop-blur-md shadow-inner">
                      <p className="text-teal-100 text-[9px] md:text-[10px] uppercase tracking-widest mb-1 font-bold">
                        Total Transfer
                      </p>
                      <p className="text-base md:text-xl font-bold text-white tracking-wide">
                        {formatRp(totalTransfer)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-6 border-t border-teal-400/30 pt-4 mt-5 relative z-10">
                  <div>
                    <p className="text-teal-100 text-[9px] md:text-[10px] uppercase tracking-widest mb-1 font-bold">
                      Jumlah Anak
                    </p>
                    <p className="text-sm md:text-base font-bold">
                      {siswaData.length} Siswa
                    </p>
                  </div>
                  <div>
                    <p className="text-teal-100 text-[9px] md:text-[10px] uppercase tracking-widest mb-1 font-bold">
                      Kategori Kelas
                    </p>
                    <p className="text-sm md:text-base font-bold">
                      {kelasOptions.length} Tingkat
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[11px] md:text-sm text-slate-500 font-bold uppercase tracking-[0.2em] mb-4 pl-2">
                  Menu Cepat
                </h3>
                <div className="grid grid-cols-4 gap-3 md:gap-6 max-w-lg md:max-w-none mx-auto">
                  <button
                    onClick={() => openModal("siswa")}
                    className="group p-3 md:p-5 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl md:rounded-[1.5rem] shadow-sm hover:shadow-[0_20px_40px_rgba(20,184,166,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-center gap-2 md:gap-3 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-teal-100/50 rounded-bl-[100%] -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-slate-50 text-slate-600 group-hover:bg-teal-500 group-hover:text-white rounded-xl md:rounded-2xl flex items-center justify-center transition-colors duration-300 shadow-inner">
                      <UserPlus className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <span className="text-[9px] md:text-xs font-bold text-slate-700 tracking-wide text-center leading-tight">
                      Siswa Baru
                    </span>
                  </button>
                  <button
                    onClick={() => navToTab("keuangan")}
                    className="group p-3 md:p-5 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl md:rounded-[1.5rem] shadow-sm hover:shadow-[0_20px_40px_rgba(245,158,11,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-center gap-2 md:gap-3 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/50 rounded-bl-[100%] -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-slate-50 text-slate-600 group-hover:bg-amber-500 group-hover:text-white rounded-xl md:rounded-2xl flex items-center justify-center transition-colors duration-300 shadow-inner">
                      <Banknote className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <span className="text-[9px] md:text-xs font-bold text-slate-700 tracking-wide text-center leading-tight">
                      Input Uang
                    </span>
                  </button>
                  <button
                    onClick={() => navToTab("nilai")}
                    className="group p-3 md:p-5 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl md:rounded-[1.5rem] shadow-sm hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-center gap-2 md:gap-3 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/50 rounded-bl-[100%] -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-slate-50 text-slate-600 group-hover:bg-blue-500 group-hover:text-white rounded-xl md:rounded-2xl flex items-center justify-center transition-colors duration-300 shadow-inner">
                      <FileText className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <span className="text-[9px] md:text-xs font-bold text-slate-700 tracking-wide text-center leading-tight">
                      Input Nilai
                    </span>
                  </button>
                  <button
                    onClick={() => navToTab("keuangan")}
                    className="group p-3 md:p-5 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl md:rounded-[1.5rem] shadow-sm hover:shadow-[0_20px_40px_rgba(244,63,94,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-center gap-2 md:gap-3 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-100/50 rounded-bl-[100%] -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-slate-50 text-slate-600 group-hover:bg-rose-500 group-hover:text-white rounded-xl md:rounded-2xl flex items-center justify-center transition-colors duration-300 shadow-inner">
                      <ReceiptText className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <span className="text-[9px] md:text-xs font-bold text-slate-700 tracking-wide text-center leading-tight">
                      Cetak Kwitansi
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs md:text-sm text-slate-800 font-bold uppercase tracking-wider">
                    Pendaftar Terbaru
                  </h3>
                  <button
                    onClick={() => navToTab("siswa")}
                    className="text-teal-600 font-bold text-[10px] md:text-xs uppercase tracking-wider hover:underline"
                  >
                    Lihat Semua
                  </button>
                </div>
                <div className="space-y-3">
                  {siswaData.length === 0 ? (
                    <p className="text-center text-slate-400 text-xs py-6 font-medium">
                      Belum ada data siswa.
                    </p>
                  ) : (
                    siswaData
                      .slice(-4)
                      .reverse()
                      .map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center gap-3 md:gap-4 p-2 md:p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                        >
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-teal-100 to-emerald-100 text-teal-700 rounded-xl flex items-center justify-center text-base md:text-lg font-black shadow-inner">
                            {String(s.nama || "")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-800 font-bold truncate text-xs md:text-sm">
                              {s.nama}
                            </p>
                            <p className="text-[9px] md:text-[11px] font-semibold text-slate-400 tracking-wide uppercase mt-0.5">
                              {s.kelas}
                            </p>
                          </div>
                          <button
                            onClick={() => openModal("bayar_baru", s)}
                            className="px-3 py-1.5 md:px-4 md:py-2 bg-slate-50 hover:bg-teal-50 text-teal-700 font-bold rounded-lg md:rounded-xl text-[9px] md:text-[11px] tracking-wide shadow-sm border border-slate-200 transition-colors uppercase"
                          >
                            Bayar
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================== VIEW: HEADER FILTER ============================== */}
          {activeTab !== "home" && (
            <div className="no-print bg-white/80 backdrop-blur-xl rounded-2xl md:rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-3 md:p-5 mb-4 md:mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 md:gap-4">
                <div className="flex gap-3 items-center">
                  <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-2 md:p-3 rounded-xl md:rounded-2xl text-teal-600 border border-teal-100 shadow-inner">
                    {activeTab === "siswa" && <Users size={20} />}
                    {activeTab === "nilai" && <FileText size={20} />}
                    {activeTab === "keuangan" && <Wallet size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm md:text-xl font-black text-slate-800 capitalize tracking-tight">
                        Manajemen {activeTab}
                      </h2>
                      {/* INDIKATOR SYNC DI TAB VIEW */}
                      {isSyncing && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded text-[8px] md:text-[9px] font-bold uppercase tracking-widest animate-pulse">
                          <RefreshCw size={10} className="animate-spin" /> Sync
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] md:text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                      Total{" "}
                      {activeTab === "keuangan"
                        ? filteredKeuangan.length
                        : filteredSiswa.length}{" "}
                      Data
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 md:gap-2.5">
                  <div className="relative flex-1 md:w-48">
                    <Search
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={14}
                    />
                    <input
                      type="text"
                      placeholder="Cari nama..."
                      className="w-full pl-8 pr-3 py-1.5 md:py-2 bg-white rounded-lg md:rounded-xl text-[10px] md:text-sm font-medium border border-slate-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all shadow-sm"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <select
                    className="py-1.5 md:py-2 px-2 md:px-3 bg-white rounded-lg md:rounded-xl text-[10px] md:text-sm font-semibold border border-slate-200 outline-none text-slate-700 shadow-sm"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="asc">A - Z</option>
                    <option value="desc">Z - A</option>
                  </select>
                  <select
                    className="py-1.5 md:py-2 px-2 md:px-3 bg-white rounded-lg md:rounded-xl text-[10px] md:text-sm font-semibold border border-slate-200 outline-none text-slate-700 shadow-sm"
                    value={filterKelas}
                    onChange={(e) => setFilterKelas(e.target.value)}
                  >
                    <option value="">Semua Kelas</option>
                    {kelasOptions.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>

                  {activeTab === "keuangan" && (
                    <select
                      className="py-1.5 md:py-2 px-2 md:px-3 bg-white rounded-lg md:rounded-xl text-[10px] md:text-sm font-semibold border border-slate-200 outline-none text-slate-700 shadow-sm"
                      value={filterBulan}
                      onChange={(e) => setFilterBulan(e.target.value)}
                    >
                      <option value="">Semua Waktu</option>
                      <option value="01">Januari</option>
                      <option value="02">Februari</option>
                      <option value="03">Maret</option>
                      <option value="04">April</option>
                      <option value="05">Mei</option>
                      <option value="06">Juni</option>
                      <option value="07">Juli</option>
                      <option value="08">Agustus</option>
                      <option value="09">September</option>
                      <option value="10">Oktober</option>
                      <option value="11">November</option>
                      <option value="12">Desember</option>
                    </select>
                  )}

                  {activeTab === "siswa" && (
                    <>
                      <button
                        onClick={() => openModal("kelas")}
                        className="px-2 py-1.5 md:px-3 md:py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-bold rounded-lg md:rounded-xl text-[9px] md:text-[11px] tracking-wide uppercase flex items-center gap-1 md:gap-1.5 shadow-sm transition-colors"
                      >
                        <Plus size={12} /> Kelas
                      </button>
                      <button
                        onClick={() => openModal("siswa")}
                        className="px-2 py-1.5 md:px-3 md:py-2 bg-teal-600 text-white font-bold rounded-lg md:rounded-xl text-[9px] md:text-[11px] tracking-wide uppercase flex items-center gap-1 md:gap-1.5 shadow-md hover:bg-teal-700 transition-colors"
                      >
                        <Plus size={12} /> Siswa
                      </button>
                    </>
                  )}

                  {(activeTab === "nilai" ||
                    activeTab === "keuangan" ||
                    activeTab === "siswa") && (
                    <div className="flex items-center gap-1 md:gap-2 ml-auto md:ml-2 bg-slate-50 p-1 rounded-lg md:rounded-xl border border-slate-200">
                      <button
                        onClick={() => window.print()}
                        title="Simpan sebagai PDF"
                        className="px-2 py-1.5 md:px-3 md:py-2 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold rounded-md md:rounded-lg text-[9px] md:text-[10px] tracking-widest uppercase flex items-center gap-1 md:gap-1.5 shadow-sm transition-all"
                      >
                        <FileText size={12} /> PDF
                      </button>
                      <button
                        onClick={() => window.print()}
                        title="Cetak Tabel"
                        className="px-2 py-1.5 md:px-3 md:py-2 bg-white text-teal-600 hover:bg-teal-50 hover:text-teal-700 font-bold rounded-md md:rounded-lg text-[9px] md:text-[10px] tracking-widest uppercase flex items-center gap-1 md:gap-1.5 shadow-sm transition-all"
                      >
                        <Printer size={12} /> Print
                      </button>
                      <button
                        onClick={
                          activeTab === "nilai"
                            ? handleExportNilai
                            : handleExportKeuangan
                        }
                        title="Download file Excel"
                        className="px-2 py-1.5 md:px-3 md:py-2 bg-slate-800 text-white hover:bg-slate-700 font-bold rounded-md md:rounded-lg text-[9px] md:text-[10px] tracking-widest uppercase flex items-center gap-1 md:gap-1.5 shadow-md transition-all"
                      >
                        <Download size={12} /> Excel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================== VIEW: TAB SISWA ============================== */}
          {activeTab === "siswa" && (
            <div className="bg-white/90">
              <div className="hidden md:block print:block w-full overflow-x-auto shadow-inner">
                <table className="w-full min-w-[600px] text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="sticky left-0 z-20 bg-slate-50 w-[40px] md:w-[60px] px-1 md:px-2 py-2 md:py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        No
                      </th>
                      <th className="sticky left-[40px] md:left-[60px] z-20 bg-slate-50 border-r-2 border-slate-200 px-2 md:px-5 py-2 md:py-4 text-slate-500 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Nama Lengkap
                      </th>
                      <th className="px-2 md:px-5 py-2 md:py-4 text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest w-24 md:w-48 whitespace-nowrap">
                        Kelas
                      </th>
                      <th className="px-2 md:px-5 py-2 md:py-4 text-slate-500 text-center w-32 md:w-48 text-[10px] md:text-xs font-bold uppercase tracking-widest no-print whitespace-nowrap">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSiswa.map((s, idx) => (
                      <tr
                        key={s.id}
                        className="group hover:bg-teal-50/30 transition-colors"
                      >
                        <td className="sticky left-0 z-10 bg-white group-hover:bg-teal-50 px-1 md:px-2 py-2 md:py-3 text-slate-500 text-center text-[10px] md:text-xs font-semibold whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td className="sticky left-[40px] md:left-[60px] z-10 bg-white group-hover:bg-teal-50 border-r-2 border-slate-200 px-2 md:px-5 py-2 md:py-3 text-slate-800 font-semibold text-left whitespace-nowrap">
                          <EditableCell
                            value={s.nama}
                            onSave={(val) =>
                              handleInlineSiswa(s.id, "nama", val)
                            }
                          />
                        </td>
                        <td className="px-2 md:px-5 py-2 md:py-3 whitespace-nowrap">
                          <EditableCell
                            type="select"
                            options={kelasOptions}
                            value={s.kelas}
                            onSave={(val) =>
                              handleInlineSiswa(s.id, "kelas", val)
                            }
                          />
                        </td>
                        <td className="px-2 md:px-5 py-2 md:py-3 text-center no-print whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1 md:gap-1.5">
                            <button
                              onClick={() => openModal("bayar_baru", s)}
                              className="px-2 py-1 md:px-3 md:py-1.5 bg-slate-50 hover:bg-teal-50 text-teal-700 font-bold rounded-md md:rounded-lg text-[9px] md:text-[10px] tracking-wide shadow-sm border border-slate-200 transition-colors uppercase"
                            >
                              Bayar
                            </button>
                            <button
                              onClick={() => openModal("siswa", s)}
                              className="p-1.5 md:p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md md:rounded-lg transition-colors"
                            >
                              <Edit size={12} className="md:w-3.5 md:h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSiswa(s.id)}
                              className="p-1.5 md:p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md md:rounded-lg transition-colors"
                            >
                              <Trash2 size={12} className="md:w-3.5 md:h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden print:hidden flex flex-col gap-3 p-3">
                {filteredSiswa.map((s, idx) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2 mb-1 border-b border-slate-100 pb-2">
                      <div className="w-6 h-6 bg-teal-100 text-teal-700 rounded-md flex items-center justify-center text-[10px] font-black">
                        {idx + 1}
                      </div>
                      <span className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                        Data Siswa
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest block mb-0.5">
                          Nama
                        </span>
                        <EditableCell
                          value={s.nama}
                          onSave={(val) => handleInlineSiswa(s.id, "nama", val)}
                        />
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest block mb-0.5">
                          Kelas
                        </span>
                        <EditableCell
                          type="select"
                          options={kelasOptions}
                          value={s.kelas}
                          onSave={(val) =>
                            handleInlineSiswa(s.id, "kelas", val)
                          }
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => openModal("bayar_baru", s)}
                        className="px-4 py-2 bg-teal-50 text-teal-700 font-bold rounded-lg text-[10px] tracking-widest uppercase border border-teal-100 flex-1 mr-2 flex justify-center"
                      >
                        Bayar Uang
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal("siswa", s)}
                          className="p-2 text-blue-600 bg-blue-50 border border-blue-100 rounded-lg"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteSiswa(s.id)}
                          className="p-2 text-rose-600 bg-rose-50 border border-rose-100 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================== VIEW: TAB NILAI ============================== */}
          {activeTab === "nilai" && (
            <div className="bg-white/90">
              <div className="hidden md:block print:block w-full overflow-x-auto shadow-inner">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="sticky left-0 z-20 bg-slate-50 w-[40px] md:w-[60px] px-1 md:px-2 py-2 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        No
                      </th>
                      <th className="sticky left-[40px] md:left-[60px] z-20 bg-slate-50 border-r-2 border-slate-200 px-2 md:px-4 py-2 md:py-4 text-slate-500 text-left text-[9px] md:text-xs font-bold uppercase tracking-widest leading-tight whitespace-nowrap">
                        Siswa
                      </th>
                      <th className="px-1 md:px-4 py-2 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Hafalan
                      </th>
                      <th className="px-1 md:px-4 py-2 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Catatan
                      </th>
                      <th className="px-1 md:px-4 py-2 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest leading-tight whitespace-nowrap">
                        Ulangan Harian
                      </th>
                      <th className="px-1 md:px-4 py-2 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Ujian
                      </th>
                      <th className="px-1 md:px-4 py-2 md:py-4 text-teal-700 bg-teal-50 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest leading-tight whitespace-nowrap">
                        Rata-Rata
                      </th>
                      <th className="px-1 md:px-4 py-2 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Ket.
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSiswa.map((s, idx) => {
                      const n = nilaiData[s.id] || {};
                      const rata =
                        ((Number(n.hafalan) || 0) +
                          (Number(n.catatan) || 0) +
                          (Number(n.ulangan) || 0) +
                          (Number(n.ujian) || 0)) /
                        4;
                      return (
                        <tr
                          key={s.id}
                          className="group hover:bg-teal-50/30 transition-colors"
                        >
                          <td className="sticky left-0 z-10 bg-white group-hover:bg-teal-50 px-1 md:px-2 py-1.5 md:py-3 text-slate-500 text-center text-[9px] md:text-xs font-semibold whitespace-nowrap">
                            {idx + 1}
                          </td>
                          <td className="sticky left-[40px] md:left-[60px] z-10 bg-white group-hover:bg-teal-50 border-r-2 border-slate-200 px-2 md:px-4 py-1.5 md:py-3 text-left text-slate-800 text-[10px] md:text-xs font-bold leading-tight whitespace-nowrap">
                            {s.nama} <br />
                            <span className="text-[7px] md:text-[9px] text-slate-400 tracking-widest uppercase">
                              {s.kelas}
                            </span>
                          </td>
                          <td className="px-1 md:px-4 py-1.5 md:py-3 text-center whitespace-nowrap">
                            <EditableCell
                              alignCenter={true}
                              type="number"
                              value={n.hafalan}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "hafalan", val)
                              }
                              placeholder="-"
                            />
                          </td>
                          <td className="px-1 md:px-4 py-1.5 md:py-3 text-center whitespace-nowrap">
                            <EditableCell
                              alignCenter={true}
                              type="number"
                              value={n.catatan}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "catatan", val)
                              }
                              placeholder="-"
                            />
                          </td>
                          <td className="px-1 md:px-4 py-1.5 md:py-3 text-center whitespace-nowrap">
                            <EditableCell
                              alignCenter={true}
                              type="number"
                              value={n.ulangan}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "ulangan", val)
                              }
                              placeholder="-"
                            />
                          </td>
                          <td className="px-1 md:px-4 py-1.5 md:py-3 text-center whitespace-nowrap">
                            <EditableCell
                              alignCenter={true}
                              type="number"
                              value={n.ujian}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "ujian", val)
                              }
                              placeholder="-"
                            />
                          </td>
                          <td className="px-1 md:px-4 py-1.5 md:py-3 text-teal-700 bg-teal-50/50 text-center text-[10px] md:text-xs font-bold whitespace-nowrap">
                            {rata > 0 ? rata.toFixed(1) : "-"}
                          </td>
                          <td className="px-1 md:px-4 py-1.5 md:py-3 text-center whitespace-nowrap">
                            <EditableCell
                              alignCenter={true}
                              value={n.keterangan}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "keterangan", val)
                              }
                              placeholder="..."
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden print:hidden flex flex-col gap-3 p-3">
                {filteredSiswa.map((s, idx) => {
                  const n = nilaiData[s.id] || {};
                  const rata =
                    ((Number(n.hafalan) || 0) +
                      (Number(n.catatan) || 0) +
                      (Number(n.ulangan) || 0) +
                      (Number(n.ujian) || 0)) /
                    4;
                  return (
                    <div
                      key={s.id}
                      className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-center mb-1 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-md flex items-center justify-center text-[10px] font-black">
                            {idx + 1}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-800">
                              {s.nama}
                            </span>
                            <span className="block text-[9px] text-slate-400 uppercase tracking-widest">
                              {s.kelas}
                            </span>
                          </div>
                        </div>
                        <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 text-[10px] font-bold">
                          Rata: {rata > 0 ? rata.toFixed(1) : "-"}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-1">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between items-center">
                          <span className="text-[9px] text-slate-500 font-bold uppercase">
                            Hafalan
                          </span>
                          <div className="w-12">
                            <EditableCell
                              alignCenter
                              type="number"
                              value={n.hafalan}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "hafalan", val)
                              }
                              placeholder="-"
                            />
                          </div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between items-center">
                          <span className="text-[9px] text-slate-500 font-bold uppercase">
                            Catatan
                          </span>
                          <div className="w-12">
                            <EditableCell
                              alignCenter
                              type="number"
                              value={n.catatan}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "catatan", val)
                              }
                              placeholder="-"
                            />
                          </div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between items-center">
                          <span className="text-[9px] text-slate-500 font-bold uppercase">
                            Ulangan
                          </span>
                          <div className="w-12">
                            <EditableCell
                              alignCenter
                              type="number"
                              value={n.ulangan}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "ulangan", val)
                              }
                              placeholder="-"
                            />
                          </div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between items-center">
                          <span className="text-[9px] text-slate-500 font-bold uppercase">
                            Ujian
                          </span>
                          <div className="w-12">
                            <EditableCell
                              alignCenter
                              type="number"
                              value={n.ujian}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "ujian", val)
                              }
                              placeholder="-"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between items-center">
                        <span className="text-[9px] text-slate-500 font-bold uppercase">
                          Keterangan
                        </span>
                        <div className="flex-1 ml-2">
                          <EditableCell
                            value={n.keterangan}
                            onSave={(val) =>
                              handleInlineNilai(s.id, "keterangan", val)
                            }
                            placeholder="Ketik catatan..."
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================== VIEW: TAB KEUANGAN ============================== */}
          {activeTab === "keuangan" && (
            <div className="bg-white/90">
              <div className="hidden md:block print:block w-full overflow-x-auto shadow-inner">
                <table className="w-full min-w-[1000px] text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="sticky left-0 z-20 bg-slate-50 w-[40px] md:w-[60px] px-1 md:px-2 py-2 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        No
                      </th>
                      <th className="sticky left-[40px] md:left-[60px] z-20 bg-slate-50 border-r-2 border-slate-200 px-2 md:px-4 py-2 md:py-4 text-slate-500 text-left text-[9px] md:text-xs font-bold uppercase tracking-widest leading-tight whitespace-nowrap">
                        Siswa
                      </th>
                      <th className="px-1 md:px-4 py-2 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Tgl Bayar
                      </th>
                      <th className="px-1 md:px-4 py-2 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Infaq
                      </th>
                      <th className="px-1 md:px-4 py-2 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest leading-tight whitespace-nowrap">
                        Daftar Ulang
                      </th>
                      <th className="px-1 md:px-4 py-2 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Konsumsi
                      </th>
                      <th className="px-1 md:px-4 py-2 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest leading-tight whitespace-nowrap">
                        Makan Siang
                      </th>
                      <th className="px-1 md:px-4 py-2 md:py-4 text-teal-700 bg-teal-50 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Total
                      </th>
                      <th className="px-1 md:px-4 py-2 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Metode
                      </th>
                      <th className="px-1 md:px-4 py-2 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-1 md:px-4 py-2 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest no-print whitespace-nowrap">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredKeuangan.map((k, idx) => {
                      const s =
                        siswaData.find((siswa) => siswa.id === k.siswa_id) ||
                        {};
                      const total =
                        (Number(k.infaq) || 0) +
                        (Number(k.cicilan) || 0) +
                        (Number(k.konsumsi) || 0) +
                        (Number(k.makan) || 0);
                      return (
                        <tr
                          key={k.id || idx}
                          className="group hover:bg-teal-50/30 transition-colors"
                        >
                          <td className="sticky left-0 z-10 bg-white group-hover:bg-teal-50 px-1 md:px-2 py-1.5 md:py-3 text-slate-500 text-center text-[9px] md:text-xs font-semibold whitespace-nowrap">
                            {idx + 1}
                          </td>
                          <td className="sticky left-[40px] md:left-[60px] z-10 bg-white group-hover:bg-teal-50 border-r-2 border-slate-200 px-2 md:px-4 py-1.5 md:py-3 text-left text-slate-800 text-[10px] md:text-xs font-bold leading-tight whitespace-nowrap">
                            {s.nama || "Siswa Dihapus"} <br />
                            <span className="text-[7px] md:text-[9px] text-slate-400 tracking-widest uppercase">
                              {s.kelas || "-"}
                            </span>
                          </td>
                          <td className="px-1 md:px-4 py-1.5 md:py-3 text-center whitespace-nowrap">
                            <EditableCell
                              alignCenter={true}
                              type="date"
                              value={k.tanggal}
                              onSave={(val) =>
                                handleInlineKeuangan(k.id, "tanggal", val)
                              }
                              placeholder="-"
                            />
                          </td>
                          <td className="px-1 md:px-4 py-1.5 md:py-3 text-right whitespace-nowrap">
                            <EditableCell
                              type="number"
                              isCurrency
                              value={k.infaq}
                              onSave={(val) =>
                                handleInlineKeuangan(k.id, "infaq", val)
                              }
                              placeholder="0"
                            />
                          </td>
                          <td className="px-1 md:px-4 py-1.5 md:py-3 text-right whitespace-nowrap">
                            <EditableCell
                              type="number"
                              isCurrency
                              value={k.cicilan}
                              onSave={(val) =>
                                handleInlineKeuangan(k.id, "cicilan", val)
                              }
                              placeholder="0"
                            />
                          </td>
                          <td className="px-1 md:px-4 py-1.5 md:py-3 text-right whitespace-nowrap">
                            <EditableCell
                              type="number"
                              isCurrency
                              value={k.konsumsi}
                              onSave={(val) =>
                                handleInlineKeuangan(k.id, "konsumsi", val)
                              }
                              placeholder="0"
                            />
                          </td>
                          <td className="px-1 md:px-4 py-1.5 md:py-3 text-right whitespace-nowrap">
                            <EditableCell
                              type="number"
                              isCurrency
                              value={k.makan}
                              onSave={(val) =>
                                handleInlineKeuangan(k.id, "makan", val)
                              }
                              placeholder="0"
                            />
                          </td>
                          <td className="px-1 md:px-4 py-1.5 md:py-3 text-teal-700 bg-teal-50/50 text-right text-[10px] md:text-xs font-bold whitespace-nowrap">
                            {formatRp(total)}
                          </td>
                          <td className="px-1 md:px-4 py-1.5 md:py-3 text-center whitespace-nowrap">
                            <EditableCell
                              type="select"
                              options={["Cash", "Transfer"]}
                              value={k.metode || "Cash"}
                              onSave={(val) =>
                                handleInlineKeuangan(k.id, "metode", val)
                              }
                            />
                          </td>
                          <td className="px-1 md:px-4 py-1.5 md:py-3 text-center whitespace-nowrap">
                            <EditableCell
                              type="select"
                              options={["Belum", "Sudah"]}
                              value={k.status || "Belum"}
                              onSave={(val) =>
                                handleInlineKeuangan(k.id, "status", val)
                              }
                            />
                          </td>
                          <td className="px-1 md:px-4 py-1.5 md:py-3 text-center no-print whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => openModal("kwitansi", s, k)}
                                title="Cetak Kwitansi"
                                className="p-1 md:p-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 hover:shadow-md rounded-md md:rounded-lg transition-all"
                              >
                                <ReceiptText
                                  size={12}
                                  className="md:w-3.5 md:h-3.5"
                                />
                              </button>
                              <button
                                onClick={() => openModal("edit_keuangan", s, k)}
                                title="Edit Transaksi"
                                className="p-1 md:p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-md rounded-md md:rounded-lg transition-all"
                              >
                                <Edit size={12} className="md:w-3.5 md:h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteKeuangan(k.id)}
                                title="Hapus Transaksi"
                                className="p-1 md:p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:shadow-md rounded-md md:rounded-lg transition-all"
                              >
                                <Trash2
                                  size={12}
                                  className="md:w-3.5 md:h-3.5"
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden print:hidden flex flex-col gap-3 p-3">
                {filteredKeuangan.map((k, idx) => {
                  const s =
                    siswaData.find((siswa) => siswa.id === k.siswa_id) || {};
                  const total =
                    (Number(k.infaq) || 0) +
                    (Number(k.cicilan) || 0) +
                    (Number(k.konsumsi) || 0) +
                    (Number(k.makan) || 0);
                  return (
                    <div
                      key={k.id || idx}
                      className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-center mb-1 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-amber-100 text-amber-700 rounded-md flex items-center justify-center text-[10px] font-black">
                            {idx + 1}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-800">
                              {s.nama || "Siswa Dihapus"}
                            </span>
                            <span className="block text-[9px] text-slate-400 uppercase tracking-widest">
                              {s.kelas || "-"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => openModal("edit_keuangan", s, k)}
                            className="p-1.5 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 rounded-md flex items-center shadow-sm"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => openModal("kwitansi", s, k)}
                            className="p-1.5 bg-teal-50 text-teal-600 border border-teal-100 hover:bg-teal-100 rounded-md flex items-center gap-1 shadow-sm"
                          >
                            <ReceiptText size={12} />{" "}
                            <span className="text-[9px] font-bold">Cetak</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] text-slate-500 font-bold uppercase">
                            Tgl Bayar
                          </span>
                          <div className="min-w-[120px] flex justify-end text-teal-700 font-bold text-[10px] tracking-wide">
                            <EditableCell
                              alignCenter={false}
                              type="date"
                              value={k.tanggal}
                              onSave={(val) =>
                                handleInlineKeuangan(k.id, "tanggal", val)
                              }
                              placeholder="-"
                              useLongDate={true}
                            />
                          </div>
                        </div>
                        <span className="text-teal-700 font-bold text-[10px] tracking-wide text-right">
                          {formatTanggalLengkap(k.tanggal)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-1">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col">
                          <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                            Infaq Pendidikan
                          </span>
                          <EditableCell
                            type="number"
                            isCurrency
                            value={k.infaq}
                            onSave={(val) =>
                              handleInlineKeuangan(k.id, "infaq", val)
                            }
                            placeholder="0"
                          />
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col">
                          <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                            Daftar Ulang
                          </span>
                          <EditableCell
                            type="number"
                            isCurrency
                            value={k.cicilan}
                            onSave={(val) =>
                              handleInlineKeuangan(k.id, "cicilan", val)
                            }
                            placeholder="0"
                          />
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col">
                          <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                            Konsumsi
                          </span>
                          <EditableCell
                            type="number"
                            isCurrency
                            value={k.konsumsi}
                            onSave={(val) =>
                              handleInlineKeuangan(k.id, "konsumsi", val)
                            }
                            placeholder="0"
                          />
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col">
                          <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                            Makan Siang
                          </span>
                          <EditableCell
                            type="number"
                            isCurrency
                            value={k.makan}
                            onSave={(val) =>
                              handleInlineKeuangan(k.id, "makan", val)
                            }
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-teal-50 p-2 rounded-lg border border-teal-100 mb-1">
                        <span className="text-[10px] text-teal-800 font-black uppercase tracking-widest">
                          Total Bayar
                        </span>
                        <span className="text-[12px] text-teal-700 font-black">
                          {formatRp(total)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 flex justify-between items-center">
                          <div className="w-full">
                            <EditableCell
                              alignCenter
                              type="select"
                              options={["Cash", "Transfer"]}
                              value={k.metode || "Cash"}
                              onSave={(val) =>
                                handleInlineKeuangan(k.id, "metode", val)
                              }
                            />
                          </div>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 flex justify-between items-center">
                          <div className="w-full">
                            <EditableCell
                              alignCenter
                              type="select"
                              options={["Belum", "Sudah"]}
                              value={k.status || "Belum"}
                              onSave={(val) =>
                                handleInlineKeuangan(k.id, "status", val)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        {/* ============================== MODALS ============================== */}
        <FormModal
          modalType={modalType}
          formData={formData}
          setFormData={setFormData}
          handleSaveData={handleSaveData}
          closeModal={closeModal}
          kelasOptions={kelasOptions}
        />

        {modalType === "kwitansi" && activeSiswa && formData && (
          <KwitansiPrint
            activeSiswa={activeSiswa}
            formData={formData}
            getNomorKwitansi={getNomorKwitansi}
            handleDownloadImage={handleDownloadImage}
            isCapturing={isCapturing}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  );
}
