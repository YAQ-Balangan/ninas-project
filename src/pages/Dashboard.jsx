// File: src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { toPng } from "html-to-image";
import {
  Users,
  Wallet,
  Plus,
  Search,
  Printer,
  Download,
  FileText,
  RefreshCw,
  BookOpen,
  ClipboardList,
} from "lucide-react";

import { supabase } from "../utils/supabaseClient";
import { formatRp, exportToCSV, formatTanggalLengkap } from "../utils/helpers";

import SplashScreen from "../components/SplashScreen";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import FormModal from "../modals/FormModal";

// Import Pop Up dan Print
import KwitansiPopUp from "../modals/KwitansiPopUp";
import KwitansiPrint from "../templates/KwitansiPrint";
import JurnalPopUp from "../modals/JurnalPopUp";
import JurnalPrint from "../templates/JurnalPrint";
import KisiPopUp from "../modals/KisiPopUp";
import KisiPrint from "../templates/KisiPrint";

// Import Komponen Tab
import HomeTab from "./tabs/HomeTab";
import SiswaTab from "./tabs/SiswaTab";
import NilaiTab from "./tabs/NilaiTab";
import KeuanganTab from "./tabs/KeuanganTab";
import JurnalTab from "./tabs/JurnalTab";
import KisiTab from "./tabs/KisiTab";

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
  const [kisiData, setKisiData] = useState({});

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
      if (dSiswa)
        setSiswaData((prev) =>
          JSON.stringify(prev) !== JSON.stringify(dSiswa) ? dSiswa : prev,
        );

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
      if (dKeuangan)
        setKeuanganData((prev) =>
          JSON.stringify(prev) !== JSON.stringify(dKeuangan) ? dKeuangan : prev,
        );

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
    return String(transaksiId).toUpperCase().slice(-5);
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
            <HomeTab
              isSyncing={isSyncing}
              grandTotalKeuangan={grandTotalKeuangan}
              totalCash={totalCash}
              totalTransfer={totalTransfer}
              siswaData={siswaData}
              kelasOptions={kelasOptions}
              navToTab={navToTab}
              openModal={openModal}
            />
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
            <SiswaTab
              filteredSiswa={filteredSiswa}
              kelasOptions={kelasOptions}
              handleInlineSiswa={handleInlineSiswa}
              openModal={openModal}
              handleDeleteSiswa={handleDeleteSiswa}
            />
          )}
          {activeTab === "nilai" && (
            <NilaiTab
              filteredSiswa={filteredSiswa}
              nilaiData={nilaiData}
              handleInlineNilai={handleInlineNilai}
            />
          )}
          {activeTab === "keuangan" && (
            <KeuanganTab
              filteredKeuangan={filteredKeuangan}
              siswaData={siswaData}
              handleInlineKeuangan={handleInlineKeuangan}
              openModal={openModal}
              handleDeleteKeuangan={handleDeleteKeuangan}
              formatRp={formatRp}
              formatTanggalLengkap={formatTanggalLengkap}
            />
          )}
          {activeTab === "jurnal" && (
            <JurnalTab
              filteredSiswa={filteredSiswa}
              jurnalData={jurnalData}
              handleInlineJurnal={handleInlineJurnal}
              openModal={openModal}
            />
          )}
          {activeTab === "kisi" && (
            <KisiTab
              filteredSiswa={filteredSiswa}
              kisiData={kisiData}
              handleInlineKisi={handleInlineKisi}
              openModal={openModal}
            />
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

        {/* 1. KWITANSI: Gabungan PopUp Layar & Template Kertas */}
        {modalType === "kwitansi" && activeSiswa && formData && (
          <>
            <KwitansiPopUp
              activeSiswa={activeSiswa}
              formData={formData}
              getNomorKwitansi={getNomorKwitansi}
              handleDownloadImage={handleDownloadImage}
              isCapturing={isCapturing}
              closeModal={closeModal}
            />
            <KwitansiPrint
              activeSiswa={activeSiswa}
              formData={formData}
              getNomorKwitansi={getNomorKwitansi}
            />
          </>
        )}

        {/* 2. JURNAL: Gabungan PopUp Layar & Template Kertas */}
        {modalType === "cetak_jurnal" && activeSiswa && formData && (
          <>
            <JurnalPopUp
              activeSiswa={activeSiswa}
              jurnalData={formData}
              closeModal={closeModal}
            />
            <JurnalPrint activeSiswa={activeSiswa} jurnalData={formData} />
          </>
        )}

        {/* 3. KISI-KISI: Gabungan PopUp Layar & Template Kertas */}
        {modalType === "cetak_kisi" && activeSiswa && formData && (
          <>
            <KisiPopUp
              activeSiswa={activeSiswa}
              kisiData={formData}
              closeModal={closeModal}
            />
            <KisiPrint activeSiswa={activeSiswa} kisiData={formData} />
          </>
        )}
      </div>
    </>
  );
}
