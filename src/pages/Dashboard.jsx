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
  BookOpen,
  ClipboardList, // Ikon baru untuk Kisi-Kisi
} from "lucide-react";

import { supabase } from "../utils/supabaseClient";
import { formatRp, exportToCSV, formatTanggalLengkap } from "../utils/helpers";

import EditableCell from "../components/EditableCell";
import SplashScreen from "../components/SplashScreen";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import FormModal from "../modals/FormModal";
import KwitansiPrint from "../modals/KwitansiPrint";
import JurnalPrint from "../modals/JurnalPrint";
import KisiPrint from "../modals/KisiPrint"; // Import modal KisiPrint

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

  const [isSyncing, setIsSyncing] = useState(false);

  const [kelasOptions, setKelasOptions] = useState([]);
  const [siswaData, setSiswaData] = useState([]);
  const [nilaiData, setNilaiData] = useState({});
  const [keuanganData, setKeuanganData] = useState([]);
  const [jurnalData, setJurnalData] = useState({});
  const [kisiData, setKisiData] = useState({}); // State baru untuk Kisi

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
    } else if (type === "cetak_jurnal") {
      setActiveSiswa(data);
      setFormData({ ...existData });
      window.location.hash = `${activeTab}/cetak_jurnal`;
      return;
    } else if (type === "cetak_kisi") {
      // Modal baru untuk cetak kisi
      setActiveSiswa(data);
      setFormData({ ...existData });
      window.location.hash = `${activeTab}/cetak_kisi`;
      return;
    } else if (type === "siswa") {
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

      const { data: dJurnal } = await supabase
        .from("jurnal_observasi")
        .select("*");
      if (dJurnal) {
        const jData = {};
        dJurnal.forEach((j) => (jData[j.siswa_id] = j));
        setJurnalData((prev) =>
          JSON.stringify(prev) !== JSON.stringify(jData) ? jData : prev,
        );
      }

      // Fetch Kisi-kisi
      const { data: dKisi } = await supabase.from("kisi_kisi").select("*");
      if (dKisi) {
        const kData = {};
        dKisi.forEach((k) => (kData[k.siswa_id] = k));
        setKisiData((prev) =>
          JSON.stringify(prev) !== JSON.stringify(kData) ? kData : prev,
        );
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchData(false);
    const intervalId = setInterval(() => {
      fetchData(true);
    }, 15000);
    return () => clearInterval(intervalId);
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

  const handleInlineJurnal = async (siswaId, key, val) => {
    const currentYear = new Date().getFullYear().toString();
    const exist = jurnalData[siswaId] || {
      siswa_id: siswaId,
      tahun: `${currentYear}/${parseInt(currentYear) + 1}`,
    };
    const newData = { ...exist, [key]: val };
    setJurnalData((prev) => ({ ...prev, [siswaId]: newData }));
    await supabase
      .from("jurnal_observasi")
      .upsert({ siswa_id: siswaId, ...newData });
  };

  // Logika simpan otomatis Kisi-Kisi
  // Logika simpan otomatis Kisi-Kisi beserta default Tahun
  const handleInlineKisi = async (siswaId, key, val) => {
    const currentYear = new Date().getFullYear().toString();
    const exist = kisiData[String(siswaId)] || {
      siswa_id: siswaId,
      tahun: `${currentYear}/${parseInt(currentYear) + 1}`,
    };
    const newData = { ...exist, [key]: val };
    setKisiData((prev) => ({ ...prev, [String(siswaId)]: newData }));
    await supabase.from("kisi_kisi").upsert({ siswa_id: siswaId, ...newData });
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
        "Yakin ingin menghapus data siswa ini? Semua data terkait akan ikut terhapus.",
      )
    ) {
      setSiswaData(siswaData.filter((s) => s.id !== id));
      const newNilai = { ...nilaiData };
      delete newNilai[id];
      setNilaiData(newNilai);
      const newJurnal = { ...jurnalData };
      delete newJurnal[id];
      setJurnalData(newJurnal);
      const newKisi = { ...kisiData };
      delete newKisi[id];
      setKisiData(newKisi);
      setKeuanganData(
        keuanganData.filter((k) => String(k.siswa_id) !== String(id)),
      );

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
      const s =
        siswaData.find((siswa) => String(siswa.id) === String(k.siswa_id)) ||
        {};
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
      const sA =
        siswaData.find((s) => String(s.id) === String(a.siswa_id))?.nama || "";
      const sB =
        siswaData.find((s) => String(s.id) === String(b.siswa_id))?.nama || "";
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
            body:has(#kwitansi-print-area) main, body:has(#jurnal-print-area) main, body:has(#kisi-print-area) main { display: none !important; }
            nav, .no-print, button, .fixed:not(:has(#kwitansi-print-area)):not(:has(#jurnal-print-area)):not(:has(#kisi-print-area)), .animate-blob1, .animate-blob2, .absolute.inset-0.overflow-hidden { display: none !important; }
            main { display: block !important; width: 100% !important; padding: 0 !important; }
            .bg-white\\/80, .bg-white\\/90, .backdrop-blur-xl, .shadow-sm { background: transparent !important; backdrop-filter: none !important; box-shadow: none !important; border: none !important; }
            .print-kop-laporan { display: flex !important; border-bottom: 2px solid #000 !important; margin-bottom: 15px !important; padding-bottom: 10px !important; }
            main table { min-width: 100% !important; width: 100% !important; border: 1px solid #000 !important; border-collapse: collapse !important; }
            main th, main td { border: 1px solid #000 !important; padding: 6px 4px !important; color: black !important; background-color: transparent !important; position: static !important; box-shadow: none !important; }
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
                    : activeTab === "jurnal"
                      ? "Jurnal Observasi"
                      : activeTab === "kisi"
                        ? "Kisi-Kisi"
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

          {activeTab === "home" && (
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="bg-gradient-to-br from-teal-500/95 to-emerald-700/95 backdrop-blur-xl rounded-3xl p-5 md:p-8 text-white shadow-[0_20px_40px_rgba(20,184,166,0.2)] border border-white/20 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-900/20 rounded-full blur-3xl"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 relative z-10">
                  <div>
                    <p className="text-teal-100 text-xs md:text-sm font-medium mb-1 flex items-center gap-2 tracking-wide uppercase">
                      <TrendingUp size={16} /> Grand Total Dana
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
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 max-w-lg md:max-w-none mx-auto">
                  <button
                    onClick={() => openModal("siswa")}
                    className="group p-3 md:p-4 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl md:rounded-[1.2rem] shadow-sm hover:shadow-[0_20px_40px_rgba(20,184,166,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-center gap-2 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-teal-100/50 rounded-bl-[100%] -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="w-10 h-10 bg-slate-50 text-slate-600 group-hover:bg-teal-500 group-hover:text-white rounded-xl flex items-center justify-center transition-colors duration-300 shadow-inner">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-700 tracking-wide text-center leading-tight">
                      Siswa Baru
                    </span>
                  </button>
                  <button
                    onClick={() => navToTab("keuangan")}
                    className="group p-3 md:p-4 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl md:rounded-[1.2rem] shadow-sm hover:shadow-[0_20px_40px_rgba(245,158,11,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-center gap-2 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/50 rounded-bl-[100%] -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="w-10 h-10 bg-slate-50 text-slate-600 group-hover:bg-amber-500 group-hover:text-white rounded-xl flex items-center justify-center transition-colors duration-300 shadow-inner">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-700 tracking-wide text-center leading-tight">
                      Input Uang
                    </span>
                  </button>
                  <button
                    onClick={() => navToTab("nilai")}
                    className="group p-3 md:p-4 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl md:rounded-[1.2rem] shadow-sm hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-center gap-2 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/50 rounded-bl-[100%] -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="w-10 h-10 bg-slate-50 text-slate-600 group-hover:bg-blue-500 group-hover:text-white rounded-xl flex items-center justify-center transition-colors duration-300 shadow-inner">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-700 tracking-wide text-center leading-tight">
                      Input Nilai
                    </span>
                  </button>
                  <button
                    onClick={() => navToTab("keuangan")}
                    className="group p-3 md:p-4 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl md:rounded-[1.2rem] shadow-sm hover:shadow-[0_20px_40px_rgba(244,63,94,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-center gap-2 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-100/50 rounded-bl-[100%] -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="w-10 h-10 bg-slate-50 text-slate-600 group-hover:bg-rose-500 group-hover:text-white rounded-xl flex items-center justify-center transition-colors duration-300 shadow-inner">
                      <ReceiptText className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-700 tracking-wide text-center leading-tight">
                      Cetak Kwitansi
                    </span>
                  </button>
                  <button
                    onClick={() => navToTab("jurnal")}
                    className="group p-3 md:p-4 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl md:rounded-[1.2rem] shadow-sm hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-center gap-2 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/50 rounded-bl-[100%] -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="w-10 h-10 bg-slate-50 text-slate-600 group-hover:bg-emerald-500 group-hover:text-white rounded-xl flex items-center justify-center transition-colors duration-300 shadow-inner">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-700 tracking-wide text-center leading-tight">
                      Jurnal Anak
                    </span>
                  </button>
                  <button
                    onClick={() => navToTab("kisi")}
                    className="group p-3 md:p-4 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl md:rounded-[1.2rem] shadow-sm hover:shadow-[0_20px_40px_rgba(99,102,241,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-center gap-2 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100/50 rounded-bl-[100%] -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="w-10 h-10 bg-slate-50 text-slate-600 group-hover:bg-indigo-500 group-hover:text-white rounded-xl flex items-center justify-center transition-colors duration-300 shadow-inner">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-700 tracking-wide text-center leading-tight">
                      Kisi-Kisi
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

          {activeTab !== "home" && (
            <div className="no-print bg-white/80 backdrop-blur-xl rounded-2xl md:rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-3 md:p-5 mb-4 md:mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 md:gap-4">
                <div className="flex gap-3 items-center">
                  <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-2 md:p-3 rounded-xl md:rounded-2xl text-teal-600 border border-teal-100 shadow-inner">
                    {activeTab === "siswa" && <Users size={20} />}
                    {activeTab === "nilai" && <FileText size={20} />}
                    {activeTab === "keuangan" && <Wallet size={20} />}
                    {activeTab === "jurnal" && <BookOpen size={20} />}
                    {activeTab === "kisi" && <ClipboardList size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm md:text-xl font-black text-slate-800 capitalize tracking-tight">
                        Manajemen {activeTab}
                      </h2>
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
                    activeTab === "siswa" ||
                    activeTab === "jurnal" ||
                    activeTab === "kisi") && (
                    <div className="flex items-center gap-1 md:gap-2 ml-auto md:ml-2 bg-slate-50 p-1 rounded-lg md:rounded-xl border border-slate-200">
                      <button
                        onClick={() => window.print()}
                        className="px-2 py-1.5 md:px-3 md:py-2 bg-white text-rose-600 hover:bg-rose-50 font-bold rounded-md md:rounded-lg text-[9px] md:text-[10px] tracking-widest uppercase flex items-center gap-1 shadow-sm transition-all"
                      >
                        <FileText size={12} /> PDF
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="px-2 py-1.5 md:px-3 md:py-2 bg-white text-teal-600 hover:bg-teal-50 font-bold rounded-md md:rounded-lg text-[9px] md:text-[10px] tracking-widest uppercase flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Printer size={12} /> Print
                      </button>
                      {(activeTab === "nilai" || activeTab === "keuangan") && (
                        <button
                          onClick={
                            activeTab === "nilai"
                              ? handleExportNilai
                              : handleExportKeuangan
                          }
                          className="px-2 py-1.5 md:px-3 md:py-2 bg-slate-800 text-white hover:bg-slate-700 font-bold rounded-md md:rounded-lg text-[9px] md:text-[10px] tracking-widest uppercase flex items-center gap-1 shadow-md transition-all"
                        >
                          <Download size={12} /> Excel
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "siswa" && (
            <div className="bg-white/90 shadow-sm border border-slate-200 rounded-xl md:rounded-2xl overflow-hidden">
              <div className="hidden md:block print:block w-full overflow-x-auto">
                <table className="w-full min-w-[600px] text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="sticky left-0 z-30 bg-slate-50 w-12 min-w-[3rem] max-w-[3rem] border-r border-slate-200 px-2 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap outline outline-1 outline-slate-200">
                        No
                      </th>
                      <th className="sticky left-12 z-30 bg-slate-50 min-w-[200px] border-r border-slate-200 shadow-[4px_0_10px_rgba(0,0,0,0.04)] px-4 py-4 text-slate-500 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap outline outline-1 outline-slate-200">
                        Nama Lengkap
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest min-w-[150px] whitespace-nowrap">
                        Kelas
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest no-print whitespace-nowrap">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSiswa.map((s, idx) => (
                      <tr
                        key={s.id}
                        className="group hover:bg-teal-50/50 transition-colors"
                      >
                        <td className="sticky left-0 z-20 bg-white group-hover:bg-[#f0fdfa] w-12 min-w-[3rem] max-w-[3rem] border-r border-slate-100 px-2 py-3 text-slate-500 text-center text-[10px] md:text-xs font-semibold whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td className="sticky left-12 z-20 bg-white group-hover:bg-[#f0fdfa] min-w-[200px] border-r border-slate-200 shadow-[4px_0_10px_rgba(0,0,0,0.04)] px-4 py-3 text-slate-800 font-semibold text-left whitespace-nowrap">
                          <EditableCell
                            value={s.nama}
                            onSave={(val) =>
                              handleInlineSiswa(s.id, "nama", val)
                            }
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <EditableCell
                            type="select"
                            options={kelasOptions}
                            value={s.kelas}
                            onSave={(val) =>
                              handleInlineSiswa(s.id, "kelas", val)
                            }
                          />
                        </td>
                        <td className="px-4 py-3 text-center no-print whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1 md:gap-1.5">
                            <button
                              onClick={() => openModal("bayar_baru", s)}
                              className="px-3 py-1.5 bg-slate-50 hover:bg-teal-50 text-teal-700 font-bold rounded-lg text-[10px] tracking-wide shadow-sm border border-slate-200 transition-colors uppercase"
                            >
                              Bayar
                            </button>
                            <button
                              onClick={() => openModal("siswa", s)}
                              className="p-1.5 md:p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteSiswa(s.id)}
                              className="p-1.5 md:p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden print:hidden flex flex-col gap-3 p-3 bg-slate-50/50">
                {filteredSiswa.map((s, idx) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
                  >
                    <div className="bg-slate-50/80 p-3 flex justify-between items-center border-b border-slate-100">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-black text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div className="w-full">
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                            Nama Lengkap
                          </div>
                          <div className="font-bold text-slate-800 text-sm">
                            <EditableCell
                              value={s.nama}
                              onSave={(val) =>
                                handleInlineSiswa(s.id, "nama", val)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between items-center py-2 border-b border-slate-100 border-dashed">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                          Kelas
                        </span>
                        <div className="w-32 text-right">
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
                    </div>
                    <div className="p-3 bg-slate-50/50 flex gap-2 border-t border-slate-100">
                      <button
                        onClick={() => openModal("bayar_baru", s)}
                        className="flex-1 py-2 bg-teal-50 border border-teal-100 text-teal-700 font-bold rounded-xl text-[10px] tracking-widest uppercase flex items-center justify-center"
                      >
                        Input Pembayaran
                      </button>
                      <button
                        onClick={() => openModal("siswa", s)}
                        className="px-3 py-2 text-blue-600 bg-white border border-blue-100 rounded-xl shadow-sm"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteSiswa(s.id)}
                        className="px-3 py-2 text-rose-600 bg-white border border-rose-100 rounded-xl shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "nilai" && (
            <div className="bg-white/90 shadow-sm border border-slate-200 rounded-xl md:rounded-2xl overflow-hidden">
              <div className="hidden md:block print:block w-full overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="sticky left-0 z-30 bg-slate-50 w-12 min-w-[3rem] max-w-[3rem] border-r border-slate-200 px-2 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap outline outline-1 outline-slate-200">
                        No
                      </th>
                      <th className="sticky left-12 z-30 bg-slate-50 min-w-[200px] border-r border-slate-200 shadow-[4px_0_10px_rgba(0,0,0,0.04)] px-4 py-4 text-slate-500 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap outline outline-1 outline-slate-200">
                        Siswa
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Hafalan
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Catatan
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest leading-tight whitespace-nowrap">
                        Ulangan Harian
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Ujian
                      </th>
                      <th className="px-4 py-4 text-teal-700 bg-teal-50 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Rata-Rata
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap min-w-[150px]">
                        Keterangan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSiswa.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          className="py-10 text-center text-slate-400 font-medium"
                        >
                          Data tidak ditemukan
                        </td>
                      </tr>
                    ) : (
                      filteredSiswa.map((s, idx) => {
                        const n = nilaiData[String(s.id)] || {};
                        const rata =
                          ((Number(n.hafalan) || 0) +
                            (Number(n.catatan) || 0) +
                            (Number(n.ulangan) || 0) +
                            (Number(n.ujian) || 0)) /
                          4;
                        return (
                          <tr
                            key={s.id}
                            className="group hover:bg-teal-50/50 transition-colors"
                          >
                            <td className="sticky left-0 z-20 bg-white group-hover:bg-[#f0fdfa] w-12 min-w-[3rem] max-w-[3rem] border-r border-slate-100 px-2 py-3 text-slate-500 text-center text-[10px] md:text-xs font-semibold whitespace-nowrap">
                              {idx + 1}
                            </td>
                            <td className="sticky left-12 z-20 bg-white group-hover:bg-[#f0fdfa] min-w-[200px] border-r border-slate-200 shadow-[4px_0_10px_rgba(0,0,0,0.04)] px-4 py-3 text-left text-slate-800 text-[10px] md:text-xs font-bold whitespace-nowrap">
                              {s.nama} <br />
                              <span className="text-[7px] md:text-[9px] text-slate-400 tracking-widest uppercase">
                                {s.kelas}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <div className="w-16 mx-auto">
                                <EditableCell
                                  alignCenter={true}
                                  type="number"
                                  value={n.hafalan}
                                  onSave={(val) =>
                                    handleInlineNilai(s.id, "hafalan", val)
                                  }
                                  placeholder="-"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <div className="w-16 mx-auto">
                                <EditableCell
                                  alignCenter={true}
                                  type="number"
                                  value={n.catatan}
                                  onSave={(val) =>
                                    handleInlineNilai(s.id, "catatan", val)
                                  }
                                  placeholder="-"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <div className="w-16 mx-auto">
                                <EditableCell
                                  alignCenter={true}
                                  type="number"
                                  value={n.ulangan}
                                  onSave={(val) =>
                                    handleInlineNilai(s.id, "ulangan", val)
                                  }
                                  placeholder="-"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <div className="w-16 mx-auto">
                                <EditableCell
                                  alignCenter={true}
                                  type="number"
                                  value={n.ujian}
                                  onSave={(val) =>
                                    handleInlineNilai(s.id, "ujian", val)
                                  }
                                  placeholder="-"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-teal-700 bg-teal-50/50 text-center text-[11px] md:text-xs font-bold whitespace-nowrap">
                              {rata > 0 ? rata.toFixed(1) : "-"}
                            </td>
                            <td className="px-4 py-3 text-center min-w-[150px]">
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
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden print:hidden flex flex-col gap-3 p-3 bg-slate-50/50">
                {filteredSiswa.length === 0 ? (
                  <p className="text-center py-10 text-slate-400 text-xs font-medium">
                    Data tidak ditemukan
                  </p>
                ) : (
                  filteredSiswa.map((s, idx) => {
                    const n = nilaiData[String(s.id)] || {};
                    const rata =
                      ((Number(n.hafalan) || 0) +
                        (Number(n.catatan) || 0) +
                        (Number(n.ulangan) || 0) +
                        (Number(n.ujian) || 0)) /
                      4;
                    return (
                      <div
                        key={s.id}
                        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
                      >
                        <div className="bg-slate-50/80 p-3 flex justify-between items-center border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs shrink-0">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-sm">
                                {s.nama}
                              </div>
                              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                {s.kelas}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 space-y-1">
                          <div className="flex justify-between items-center py-1.5 border-b border-slate-100 border-dashed">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                              Hafalan
                            </span>
                            <div className="w-20 text-right">
                              <EditableCell
                                type="number"
                                alignCenter={true}
                                value={n.hafalan}
                                onSave={(val) =>
                                  handleInlineNilai(s.id, "hafalan", val)
                                }
                                placeholder="-"
                              />
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-1.5 border-b border-slate-100 border-dashed">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                              Catatan
                            </span>
                            <div className="w-20 text-right">
                              <EditableCell
                                type="number"
                                alignCenter={true}
                                value={n.catatan}
                                onSave={(val) =>
                                  handleInlineNilai(s.id, "catatan", val)
                                }
                                placeholder="-"
                              />
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-1.5 border-b border-slate-100 border-dashed">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                              Ulangan
                            </span>
                            <div className="w-20 text-right">
                              <EditableCell
                                type="number"
                                alignCenter={true}
                                value={n.ulangan}
                                onSave={(val) =>
                                  handleInlineNilai(s.id, "ulangan", val)
                                }
                                placeholder="-"
                              />
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-1.5 border-b border-slate-100 border-dashed">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                              Ujian
                            </span>
                            <div className="w-20 text-right">
                              <EditableCell
                                type="number"
                                alignCenter={true}
                                value={n.ujian}
                                onSave={(val) =>
                                  handleInlineNilai(s.id, "ujian", val)
                                }
                                placeholder="-"
                              />
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                              Keterangan
                            </span>
                            <div className="w-40 text-right">
                              <EditableCell
                                alignCenter={true}
                                value={n.keterangan}
                                onSave={(val) =>
                                  handleInlineNilai(s.id, "keterangan", val)
                                }
                                placeholder="..."
                              />
                            </div>
                          </div>
                        </div>
                        <div className="bg-teal-50/50 p-3 border-t border-teal-100 flex justify-between items-center">
                          <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
                            Rata-Rata
                          </span>
                          <span className="text-base font-black text-teal-700">
                            {rata > 0 ? rata.toFixed(1) : "-"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === "keuangan" && (
            <div className="bg-white/90 shadow-sm border border-slate-200 rounded-xl md:rounded-2xl overflow-hidden">
              <div className="hidden md:block print:block w-full overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="sticky left-0 z-30 bg-slate-50 w-12 min-w-[3rem] max-w-[3rem] border-r border-slate-200 px-2 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap outline outline-1 outline-slate-200">
                        No
                      </th>
                      <th className="sticky left-12 z-30 bg-slate-50 min-w-[200px] border-r border-slate-200 shadow-[4px_0_10px_rgba(0,0,0,0.04)] px-4 py-4 text-slate-500 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap outline outline-1 outline-slate-200">
                        Siswa
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Tgl Bayar
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-right text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Infaq
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-right text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Daftar Ulang
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-right text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Konsumsi
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-right text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Makan
                      </th>
                      <th className="px-4 py-4 text-teal-700 bg-teal-50 text-right text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Total
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Metode
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest no-print whitespace-nowrap">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredKeuangan.length === 0 ? (
                      <tr>
                        <td
                          colSpan="11"
                          className="py-10 text-center text-slate-400 font-medium"
                        >
                          Data tidak ditemukan
                        </td>
                      </tr>
                    ) : (
                      filteredKeuangan.map((k, idx) => {
                        const s =
                          siswaData.find(
                            (siswa) => String(siswa.id) === String(k.siswa_id),
                          ) || {};
                        const total =
                          (Number(k.infaq) || 0) +
                          (Number(k.cicilan) || 0) +
                          (Number(k.konsumsi) || 0) +
                          (Number(k.makan) || 0);
                        return (
                          <tr
                            key={k.id || idx}
                            className="group hover:bg-teal-50/50 transition-colors"
                          >
                            <td className="sticky left-0 z-20 bg-white group-hover:bg-[#f0fdfa] w-12 min-w-[3rem] max-w-[3rem] border-r border-slate-100 px-2 py-3 text-slate-500 text-center text-[10px] md:text-xs font-semibold whitespace-nowrap">
                              {idx + 1}
                            </td>
                            <td className="sticky left-12 z-20 bg-white group-hover:bg-[#f0fdfa] min-w-[200px] border-r border-slate-200 shadow-[4px_0_10px_rgba(0,0,0,0.04)] px-4 py-3 text-left text-slate-800 text-[10px] md:text-xs font-bold whitespace-nowrap">
                              {s.nama || "Siswa Dihapus"} <br />
                              <span className="text-[7px] md:text-[9px] text-slate-400 tracking-widest uppercase">
                                {s.kelas || "-"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <div className="w-28 mx-auto">
                                <EditableCell
                                  alignCenter={true}
                                  type="date"
                                  value={k.tanggal}
                                  onSave={(val) =>
                                    handleInlineKeuangan(k.id, "tanggal", val)
                                  }
                                  placeholder="-"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <div className="w-24 ml-auto">
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
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <div className="w-24 ml-auto">
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
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <div className="w-24 ml-auto">
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
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <div className="w-24 ml-auto">
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
                            </td>
                            <td className="px-4 py-3 text-teal-700 bg-teal-50/50 text-right text-[11px] md:text-xs font-black whitespace-nowrap">
                              {formatRp(total)}
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <div className="w-24 mx-auto">
                                <EditableCell
                                  type="select"
                                  options={["Cash", "Transfer"]}
                                  value={k.metode || "Cash"}
                                  onSave={(val) =>
                                    handleInlineKeuangan(k.id, "metode", val)
                                  }
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <div className="w-24 mx-auto">
                                <EditableCell
                                  type="select"
                                  options={["Belum", "Sudah"]}
                                  value={k.status || "Belum"}
                                  onSave={(val) =>
                                    handleInlineKeuangan(k.id, "status", val)
                                  }
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center no-print whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => openModal("kwitansi", s, k)}
                                  className="p-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg"
                                >
                                  <ReceiptText size={14} />
                                </button>
                                <button
                                  onClick={() =>
                                    openModal("edit_keuangan", s, k)
                                  }
                                  className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteKeuangan(k.id)}
                                  className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden flex flex-col gap-3 p-3 bg-slate-50/50">
                {filteredKeuangan.length === 0 ? (
                  <p className="text-center py-10 text-slate-400 text-xs">
                    Data tidak ditemukan
                  </p>
                ) : (
                  filteredKeuangan.map((k, idx) => {
                    const s =
                      siswaData.find(
                        (siswa) => String(siswa.id) === String(k.siswa_id),
                      ) || {};
                    const total =
                      (Number(k.infaq) || 0) +
                      (Number(k.cicilan) || 0) +
                      (Number(k.konsumsi) || 0) +
                      (Number(k.makan) || 0);
                    return (
                      <div
                        key={k.id || idx}
                        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
                      >
                        <div className="bg-slate-50/80 p-3 flex justify-between items-start border-b border-slate-100">
                          <div>
                            <div className="font-black text-slate-800 text-sm">
                              {s.nama || "Siswa Dihapus"}
                            </div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                              {s.kelas || "-"} •{" "}
                              {k.tanggal
                                ? formatTanggalLengkap(k.tanggal)
                                : "-"}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-[9px] font-black uppercase ${k.status === "Sudah" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-rose-100 text-rose-700 border border-rose-200"}`}
                          >
                            {k.status}
                          </span>
                        </div>
                        <div className="p-3 space-y-1">
                          <div className="flex justify-between items-center py-1.5 border-b border-slate-100 border-dashed">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                              Infaq
                            </span>
                            <div className="w-28 text-right">
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
                          </div>
                          <div className="flex justify-between items-center py-1.5 border-b border-slate-100 border-dashed">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                              Daftar Ulang
                            </span>
                            <div className="w-28 text-right">
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
                          </div>
                          <div className="flex justify-between items-center py-1.5 border-b border-slate-100 border-dashed">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                              Konsumsi
                            </span>
                            <div className="w-28 text-right">
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
                          </div>
                          <div className="flex justify-between items-center py-1.5 border-b border-slate-100 border-dashed">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                              Makan
                            </span>
                            <div className="w-28 text-right">
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
                          <div className="flex justify-between items-center py-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                              Metode
                            </span>
                            <div className="w-28 text-right">
                              <EditableCell
                                type="select"
                                options={["Cash", "Transfer"]}
                                value={k.metode || "Cash"}
                                onSave={(val) =>
                                  handleInlineKeuangan(k.id, "metode", val)
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <div className="bg-teal-50/50 p-3 border-t border-teal-100 flex justify-between items-center">
                          <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
                            Total Bayar
                          </span>
                          <span className="text-base font-black text-teal-700">
                            {formatRp(total)}
                          </span>
                        </div>
                        <div className="p-3 bg-white flex gap-2 border-t border-slate-100">
                          <button
                            onClick={() => openModal("kwitansi", s, k)}
                            className="flex-1 py-2 bg-teal-600 text-white border border-teal-700 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm"
                          >
                            <ReceiptText size={14} /> Kwitansi
                          </button>
                          <button
                            onClick={() => openModal("edit_keuangan", s, k)}
                            className="px-3 py-2 bg-white text-blue-600 rounded-xl border border-blue-100 shadow-sm"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteKeuangan(k.id)}
                            className="px-3 py-2 bg-white text-rose-600 rounded-xl border border-rose-100 shadow-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === "jurnal" && (
            <div className="bg-white/90 shadow-sm border border-slate-200 rounded-xl md:rounded-2xl overflow-hidden">
              <div className="hidden md:block print:block w-full overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="sticky left-0 z-30 bg-slate-50 w-12 min-w-[3rem] max-w-[3rem] border-r border-slate-200 px-2 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap outline outline-1 outline-slate-200">
                        No
                      </th>
                      <th className="sticky left-12 z-30 bg-slate-50 min-w-[200px] border-r border-slate-200 shadow-[4px_0_10px_rgba(0,0,0,0.04)] px-4 py-4 text-slate-500 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap outline outline-1 outline-slate-200">
                        Siswa
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest w-28 whitespace-nowrap">
                        Tahun
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest min-w-[200px]">
                        Potensi
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest min-w-[200px]">
                        Catatan Observasi
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest min-w-[200px]">
                        Rekomendasi
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest no-print whitespace-nowrap">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSiswa.map((s, idx) => {
                      const j = jurnalData[String(s.id)] || {};
                      return (
                        <tr
                          key={s.id}
                          className="group hover:bg-teal-50/50 transition-colors align-top"
                        >
                          <td className="sticky left-0 z-20 bg-white group-hover:bg-[#f0fdfa] w-12 min-w-[3rem] max-w-[3rem] border-r border-slate-100 px-2 py-3 text-slate-500 text-center text-[10px] md:text-xs font-semibold whitespace-nowrap">
                            {idx + 1}
                          </td>
                          <td className="sticky left-12 z-20 bg-white group-hover:bg-[#f0fdfa] min-w-[200px] border-r border-slate-200 shadow-[4px_0_10px_rgba(0,0,0,0.04)] px-4 py-3 text-slate-800 text-[10px] md:text-xs font-bold whitespace-nowrap">
                            {s.nama} <br />
                            <span className="text-[7px] md:text-[9px] text-slate-400 tracking-widest uppercase">
                              {s.kelas}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs md:text-sm">
                            <EditableCell
                              value={j.tahun}
                              onSave={(val) =>
                                handleInlineJurnal(s.id, "tahun", val)
                              }
                              placeholder="2025/2026"
                            />
                          </td>
                          <td className="px-4 py-3 text-xs md:text-sm">
                            <EditableCell
                              value={j.potensi}
                              onSave={(val) =>
                                handleInlineJurnal(s.id, "potensi", val)
                              }
                              placeholder="Tulis potensi..."
                            />
                          </td>
                          <td className="px-4 py-3 text-xs md:text-sm">
                            <EditableCell
                              value={j.catatan_observasi}
                              onSave={(val) =>
                                handleInlineJurnal(
                                  s.id,
                                  "catatan_observasi",
                                  val,
                                )
                              }
                              placeholder="Tulis catatan..."
                            />
                          </td>
                          <td className="px-4 py-3 text-xs md:text-sm">
                            <EditableCell
                              value={j.rekomendasi}
                              onSave={(val) =>
                                handleInlineJurnal(s.id, "rekomendasi", val)
                              }
                              placeholder="Tulis rekomendasi..."
                            />
                          </td>
                          <td className="px-4 py-3 text-center no-print align-middle">
                            <button
                              onClick={() => openModal("cetak_jurnal", s, j)}
                              className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold rounded-lg text-[10px] tracking-wide shadow-sm border border-teal-200 transition-colors uppercase flex items-center justify-center gap-1 mx-auto"
                            >
                              <Printer size={14} /> Lihat
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden print:hidden flex flex-col gap-4 p-3 bg-slate-50/50">
                {filteredSiswa.map((s, idx) => {
                  const j = jurnalData[String(s.id)] || {};
                  return (
                    <div
                      key={s.id}
                      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
                    >
                      <div className="bg-slate-50/80 p-3 flex justify-between items-center border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-black text-xs shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-800">
                              {s.nama}
                            </div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                              {s.kelas}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 space-y-3">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                            Tahun Ajaran
                          </span>
                          <div className="text-sm font-semibold text-slate-700">
                            <EditableCell
                              value={j.tahun}
                              onSave={(val) =>
                                handleInlineJurnal(s.id, "tahun", val)
                              }
                              placeholder="2025/2026"
                            />
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                            Potensi Siswa
                          </span>
                          <div className="text-sm text-slate-700">
                            <EditableCell
                              value={j.potensi}
                              onSave={(val) =>
                                handleInlineJurnal(s.id, "potensi", val)
                              }
                              placeholder="Ketik potensi..."
                            />
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                            Catatan Observasi
                          </span>
                          <div className="text-sm text-slate-700">
                            <EditableCell
                              value={j.catatan_observasi}
                              onSave={(val) =>
                                handleInlineJurnal(
                                  s.id,
                                  "catatan_observasi",
                                  val,
                                )
                              }
                              placeholder="Ketik catatan..."
                            />
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                            Rekomendasi
                          </span>
                          <div className="text-sm text-slate-700">
                            <EditableCell
                              value={j.rekomendasi}
                              onSave={(val) =>
                                handleInlineJurnal(s.id, "rekomendasi", val)
                              }
                              placeholder="Ketik rekomendasi..."
                            />
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-white border-t border-slate-100">
                        <button
                          onClick={() => openModal("cetak_jurnal", s, j)}
                          className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-sm transition-colors"
                        >
                          <Printer size={16} /> Cetak Jurnal A4
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB BARU: KISI-KISI */}
          {activeTab === "kisi" && (
            <div className="bg-white/90 shadow-sm border border-slate-200 rounded-xl md:rounded-2xl overflow-hidden">
              {/* DESKTOP VIEW KISI */}
              <div className="hidden md:block print:block w-full overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="sticky left-0 z-30 bg-slate-50 w-12 min-w-[3rem] max-w-[3rem] border-r border-slate-200 px-2 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap outline outline-1 outline-slate-200">
                        No
                      </th>
                      <th className="sticky left-12 z-30 bg-slate-50 min-w-[200px] border-r border-slate-200 shadow-[4px_0_10px_rgba(0,0,0,0.04)] px-4 py-4 text-slate-500 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap outline outline-1 outline-slate-200">
                        Siswa
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest w-28 whitespace-nowrap">
                        Tahun
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest w-40 whitespace-nowrap">
                        Mata Pelajaran
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest w-32 whitespace-nowrap">
                        Jenis Ujian
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest min-w-[300px]">
                        Materi Pokok / Indikator
                      </th>
                      <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest no-print whitespace-nowrap">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSiswa.map((s, idx) => {
                      const k = kisiData[String(s.id)] || {};
                      return (
                        <tr
                          key={s.id}
                          className="group hover:bg-indigo-50/50 transition-colors align-top"
                        >
                          <td className="sticky left-0 z-20 bg-white group-hover:bg-[#eef2ff] w-12 min-w-[3rem] max-w-[3rem] border-r border-slate-100 px-2 py-3 text-slate-500 text-center text-[10px] md:text-xs font-semibold whitespace-nowrap">
                            {idx + 1}
                          </td>
                          <td className="sticky left-12 z-20 bg-white group-hover:bg-[#eef2ff] min-w-[200px] border-r border-slate-200 shadow-[4px_0_10px_rgba(0,0,0,0.04)] px-4 py-3 text-slate-800 text-[10px] md:text-xs font-bold whitespace-nowrap">
                            {s.nama} <br />
                            <span className="text-[7px] md:text-[9px] text-slate-400 tracking-widest uppercase">
                              {s.kelas}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs md:text-sm">
                            <EditableCell
                              value={k.tahun}
                              onSave={(val) =>
                                handleInlineKisi(s.id, "tahun", val)
                              }
                              placeholder="2025/2026"
                            />
                          </td>
                          <td className="px-4 py-3 text-xs md:text-sm">
                            <EditableCell
                              value={k.mata_pelajaran}
                              onSave={(val) =>
                                handleInlineKisi(s.id, "mata_pelajaran", val)
                              }
                              placeholder="B. Indonesia..."
                            />
                          </td>
                          <td className="px-4 py-3 text-xs md:text-sm text-center">
                            <EditableCell
                              type="select"
                              options={[
                                "Ulangan Harian",
                                "UTS",
                                "UAS",
                                "Ujian Praktik",
                              ]}
                              value={k.jenis_ujian || "UAS"}
                              onSave={(val) =>
                                handleInlineKisi(s.id, "jenis_ujian", val)
                              }
                            />
                          </td>
                          <td className="px-4 py-3 text-xs md:text-sm">
                            <EditableCell
                              value={k.materi}
                              onSave={(val) =>
                                handleInlineKisi(s.id, "materi", val)
                              }
                              placeholder="Tulis materi pokok..."
                            />
                          </td>
                          <td className="px-4 py-3 text-center no-print align-middle">
                            <button
                              onClick={() => openModal("cetak_kisi", s, k)}
                              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[10px] tracking-wide shadow-sm border border-indigo-200 transition-colors uppercase flex items-center justify-center gap-1 mx-auto"
                            >
                              <Printer size={14} /> Lihat
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE VIEW KISI */}
              <div className="md:hidden print:hidden flex flex-col gap-4 p-3 bg-slate-50/50">
                {filteredSiswa.map((s, idx) => {
                  const k = kisiData[String(s.id)] || {};
                  return (
                    <div
                      key={s.id}
                      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
                    >
                      <div className="bg-slate-50/80 p-3 flex justify-between items-center border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-800">
                              {s.nama}
                            </div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                              {s.kelas}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 space-y-3">
                        <div className="flex gap-2">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 w-24 shrink-0">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                              Tahun
                            </span>
                            <div className="text-sm font-semibold text-slate-700">
                              <EditableCell
                                value={k.tahun}
                                onSave={(val) =>
                                  handleInlineKisi(s.id, "tahun", val)
                                }
                                placeholder="25/26"
                              />
                            </div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                              Mapel
                            </span>
                            <div className="text-sm font-semibold text-slate-700">
                              <EditableCell
                                value={k.mata_pelajaran}
                                onSave={(val) =>
                                  handleInlineKisi(s.id, "mata_pelajaran", val)
                                }
                                placeholder="Ketik Mapel..."
                              />
                            </div>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                            Jenis Ujian
                          </span>
                          <div className="text-sm text-slate-700">
                            <EditableCell
                              type="select"
                              options={[
                                "Ulangan Harian",
                                "UTS",
                                "UAS",
                                "Ujian Praktik",
                              ]}
                              value={k.jenis_ujian || "UAS"}
                              onSave={(val) =>
                                handleInlineKisi(s.id, "jenis_ujian", val)
                              }
                            />
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                            Materi Pokok / Indikator
                          </span>
                          <div className="text-sm text-slate-700">
                            <EditableCell
                              value={k.materi}
                              onSave={(val) =>
                                handleInlineKisi(s.id, "materi", val)
                              }
                              placeholder="Ketik rincian materi..."
                            />
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-white border-t border-slate-100">
                        <button
                          onClick={() => openModal("cetak_kisi", s, k)}
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-sm transition-colors"
                        >
                          <Printer size={16} /> Cetak Kisi-Kisi A4
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        {modalType &&
          !["kwitansi", "cetak_jurnal", "cetak_kisi"].includes(modalType) && (
            <FormModal
              modalType={modalType}
              formData={formData}
              setFormData={setFormData}
              handleSaveData={handleSaveData}
              closeModal={closeModal}
              kelasOptions={kelasOptions}
            />
          )}

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

        {modalType === "cetak_jurnal" && activeSiswa && formData && (
          <JurnalPrint
            activeSiswa={activeSiswa}
            jurnalData={formData}
            closeModal={closeModal}
          />
        )}

        {/* Render Modal KisiPrint */}
        {modalType === "cetak_kisi" && activeSiswa && formData && (
          <KisiPrint
            activeSiswa={activeSiswa}
            kisiData={formData}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  );
}
