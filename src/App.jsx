import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { toPng } from "html-to-image";
import {
  Users,
  Settings,
  Wallet,
  Plus,
  Search,
  Edit,
  Trash2,
  Printer,
  Download,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Home,
  UserPlus,
  Banknote,
  ReceiptText,
  GraduationCap,
  TrendingUp,
  CreditCard,
  Camera,
} from "lucide-react";

// ==========================================
// KONEKSI SUPABASE
// ==========================================
const supabaseUrl = "https://ekfonmczajejbhndhtya.supabase.co";
const supabaseKey = "sb_publishable_ugxzmiW6Uv0vNSIbks5D5w_2Tg6-12a";
const supabase = createClient(supabaseUrl, supabaseKey);

// --- UTILS: Format Rupiah & Export ---
const formatRp = (angka) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka || 0);
};

const exportToCSV = (filename, rows) => {
  const csvContent =
    "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename + ".csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- UTILS: AUTO RIBUAN ---
const autoRibuan = (val) => {
  if (!val) return val;
  const strVal = String(val).trim();
  let num = parseFloat(strVal);
  if (num > 0 && num < 10000 && !strVal.endsWith("000")) {
    return (num * 1000).toString();
  }
  return strVal;
};

// ==========================================
// KOMPONEN INLINE EDIT
// ==========================================
const EditableCell = ({
  value,
  type = "text",
  options = [],
  onSave,
  placeholder = "Kosong...",
  isCurrency = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(value ?? "");

  useEffect(() => {
    setVal(value ?? "");
  }, [value]);

  const triggerSave = () => {
    setIsEditing(false);
    let finalVal = val;
    if (type === "number" && isCurrency) finalVal = autoRibuan(val);

    if (String(finalVal).trim() !== String(value || "").trim()) {
      onSave(type === "number" ? parseFloat(finalVal) || 0 : finalVal);
    }
  };

  if (isEditing) {
    if (type === "select") {
      return (
        <select
          autoFocus
          className="w-full p-1 border-2 border-teal-500 rounded outline-none text-xs text-teal-900 bg-teal-50 shadow-sm min-w-[90px]"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={triggerSave}
          onKeyDown={(e) => e.key === "Enter" && triggerSave()}
        >
          <option value="">Pilih...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }
    return (
      <input
        autoFocus
        type={type}
        className="w-full p-1 border-2 border-teal-500 rounded outline-none text-xs text-teal-900 bg-teal-50 shadow-sm min-w-[70px]"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={triggerSave}
        onKeyDown={(e) => e.key === "Enter" && triggerSave()}
        placeholder={placeholder}
      />
    );
  }

  let displayValue = value;
  if (isCurrency && value) displayValue = formatRp(value);
  if (type === "select" && value === "Sudah") {
    displayValue = (
      <span className="text-teal-600 flex items-center gap-1 text-[11px]">
        <CheckCircle2 size={12} /> Lunas
      </span>
    );
  } else if (type === "select" && value === "Belum") {
    displayValue = (
      <span className="text-amber-500 flex items-center gap-1 text-[11px]">
        <AlertCircle size={12} /> Belum
      </span>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="w-full min-h-[24px] cursor-text hover:bg-teal-50 hover:ring-1 hover:ring-teal-200 rounded px-1 flex items-center transition-colors text-slate-700 text-xs md:text-sm"
    >
      {displayValue || (
        <span className="text-slate-300 italic text-[10px] md:text-xs">
          {placeholder}
        </span>
      )}
    </div>
  );
};

// ==========================================
// KOMPONEN UTAMA NINA'S PROJECT
// ==========================================
export default function NinaProjectApp() {
  // --- CORE STATE ---
  const [activeTab, setActiveTab] = useState("home");
  const [modalType, setModalType] = useState(null);

  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [splashState, setSplashState] = useState("entering"); // 'entering', 'exiting', 'hidden'

  // --- STATE DATA ---
  const [kelasOptions, setKelasOptions] = useState([]);
  const [siswaData, setSiswaData] = useState([]);
  const [nilaiData, setNilaiData] = useState({});
  const [keuanganData, setKeuanganData] = useState({});

  const [formData, setFormData] = useState({});
  const [activeSiswa, setActiveSiswa] = useState(null);

  // ==========================================
  // 1. EFEK SPLASH SCREEN (Tetesan Air)
  // ==========================================
  useEffect(() => {
    // Splash screen tampil 2.5 detik, lalu transisi memudar selama 0.5 detik
    const t1 = setTimeout(() => setSplashState("exiting"), 2500);
    const t2 = setTimeout(() => setSplashState("hidden"), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // ==========================================
  // 2. SISTEM ROUTING BACK BUTTON (ANTI-KELUAR APLIKASI)
  // ==========================================
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) {
        window.location.replace("#home");
        return;
      }
      // Membaca Format URL -> #tab/modal (Contoh: #siswa/kelas)
      const parts = hash.split("/");
      const tab = parts[0] || "home";
      const modal = parts[1] || null;

      setActiveTab(tab);
      setModalType(modal);
    };

    // Dengarkan saat user mencet tombol Back di HP
    window.addEventListener("hashchange", handleHashChange);

    // Setup awal saat aplikasi baru dibuka
    if (!window.location.hash) {
      window.location.replace("#home");
    } else {
      handleHashChange();
    }

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Fungsi Buka Halaman (Tab)
  const navToTab = (tab) => {
    window.location.hash = tab;
  };

  // Fungsi Buka Modal (Disimpan di History agar bisa di-Back)
  const openModal = (type, data = null, existData = null) => {
    if (type === "siswa") {
      setFormData(
        data || {
          id: Date.now().toString(),
          nama: "",
          kelas: kelasOptions[0] || "",
        },
      );
    } else if (type === "kelas") {
      setFormData({ nama_kelas: "" });
    } else if (type === "nilai" || type === "keuangan") {
      setActiveSiswa(data);
      setFormData({ ...existData });
    } else if (type === "kwitansi") {
      setActiveSiswa(data);
    }

    // Mengubah URL memicu useEffect di atas (Membuka Modal)
    window.location.hash = `${activeTab}/${type}`;
  };

  // Fungsi Tutup Modal (Menghapus dari URL, mengembalikan ke Tab)
  const closeModal = () => {
    // Replace URL agar tidak menambah tumpukan History maju-mundur
    window.location.replace(`#${activeTab}`);
  };

  // ==========================================
  // FETCH DATA SUPABASE
  // ==========================================
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: dKelas } = await supabase
        .from("kelas")
        .select("nama_kelas");
      if (dKelas) setKelasOptions(dKelas.map((k) => k.nama_kelas));

      const { data: dSiswa } = await supabase.from("siswa").select("*");
      if (dSiswa) setSiswaData(dSiswa);

      const { data: dNilai } = await supabase.from("nilai").select("*");
      if (dNilai) {
        const nData = {};
        dNilai.forEach((n) => (nData[n.siswa_id] = n));
        setNilaiData(nData);
      }

      const { data: dKeuangan } = await supabase.from("keuangan").select("*");
      if (dKeuangan) {
        const kData = {};
        dKeuangan.forEach((k) => (kData[k.siswa_id] = k));
        setKeuanganData(kData);
      }
    } catch (error) {
      console.error("Gagal mengambil data dari Supabase:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLERS INLINE EDIT ---
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
    const exist = nilaiData[siswaId] || { siswa_id: siswaId };
    const newData = { ...exist, [key]: val };
    setNilaiData((prev) => ({ ...prev, [siswaId]: newData }));
    await supabase.from("nilai").upsert({ siswa_id: siswaId, ...newData });
  };

  const handleInlineKeuangan = async (siswaId, key, val) => {
    const exist = keuanganData[siswaId] || {
      siswa_id: siswaId,
      metode: "Cash",
      status: "Belum",
    };
    const newData = { ...exist, [key]: val };
    setKeuanganData((prev) => ({ ...prev, [siswaId]: newData }));
    await supabase.from("keuangan").upsert({ siswa_id: siswaId, ...newData });
  };

  // --- HANDLERS SAVE & DELETE ---
  const handleSaveData = async (e) => {
    e.preventDefault();
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
        } else {
          setSiswaData([...siswaData, formData]);
        }
        await supabase
          .from("siswa")
          .upsert({
            id: formData.id,
            nama: formData.nama,
            kelas: formData.kelas,
          });
      } else if (modalType === "nilai") {
        setNilaiData({ ...nilaiData, [activeSiswa.id]: formData });
        await supabase.from("nilai").upsert({
          siswa_id: activeSiswa.id,
          hafalan: formData.hafalan || null,
          catatan: formData.catatan || null,
          ulangan: formData.ulangan || null,
          ujian: formData.ujian || null,
          keterangan: formData.keterangan || null,
        });
      } else if (modalType === "keuangan") {
        setKeuanganData({ ...keuanganData, [activeSiswa.id]: formData });
        await supabase.from("keuangan").upsert({
          siswa_id: activeSiswa.id,
          infaq: formData.infaq || null,
          cicilan: formData.cicilan || null,
          konsumsi: formData.konsumsi || null,
          makan: formData.makan || null,
          metode: formData.metode,
          status: formData.status,
        });
      }
    } catch (error) {
      console.error("Gagal menyimpan ke database:", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    }
    closeModal(); // Menutup modal menggunakan sistem routing baru
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

  const getNomorKwitansi = (siswaId) => {
    const index = siswaData.findIndex((s) => s.id === siswaId);
    return index !== -1 ? index + 1 : 1;
  };

  // --- SCREENSHOT FEATURE ---
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
      alert(
        "Gagal memproses gambar. Pastikan npm install html-to-image berhasil dijalankan.",
      );
    } finally {
      setIsCapturing(false);
    }
  };

  // --- FILTER & CALCULATIONS ---
  const filteredSiswa = useMemo(() => {
    return siswaData.filter((s) => {
      const namaAman = String(s.nama || "").toLowerCase();
      const matchSearch = namaAman.includes(search.toLowerCase());
      const matchKelas = filterKelas ? s.kelas === filterKelas : true;
      return matchSearch && matchKelas;
    });
  }, [siswaData, search, filterKelas]);

  const { grandTotalKeuangan, totalCash, totalTransfer } = useMemo(() => {
    let total = 0,
      cash = 0,
      tf = 0;
    siswaData.forEach((s) => {
      const k = keuanganData[s.id];
      if (k) {
        const sum =
          (Number(k.infaq) || 0) +
          (Number(k.cicilan) || 0) +
          (Number(k.konsumsi) || 0) +
          (Number(k.makan) || 0);
        total += sum;
        if (k.metode === "Transfer") tf += sum;
        else cash += sum;
      }
    });
    return { grandTotalKeuangan: total, totalCash: cash, totalTransfer: tf };
  }, [siswaData, keuanganData]);

  // --- EXPORT HANDLERS ---
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
    filteredSiswa.forEach((s, i) => {
      const k = keuanganData[s.id] || {};
      const total =
        (Number(k.infaq) || 0) +
        (Number(k.cicilan) || 0) +
        (Number(k.konsumsi) || 0) +
        (Number(k.makan) || 0);
      rows.push([
        i + 1,
        s.nama,
        s.kelas,
        k.infaq || 0,
        k.cicilan || 0,
        k.konsumsi || 0,
        k.makan || 0,
        total,
        k.metode || "-",
        k.status || "-",
      ]);
    });
    exportToCSV("Rekap_Keuangan_Ninas_Project", rows);
  };

  // Tampilkan Loading State saat pertama kali buka
  if (isLoading && splashState === "hidden") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-teal-600 flex-col gap-3">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        <p className="font-bold text-sm">Menyinkronkan dengan Database...</p>
      </div>
    );
  }

  return (
    <>
      {/* ==========================================
          KOMPONEN SPLASH SCREEN (Tetesan Air)
      ========================================== */}
      {splashState !== "hidden" && (
        <div
          className={`fixed inset-0 z-[999] bg-slate-50 flex flex-col items-center justify-center transition-opacity duration-500 
          ${splashState === "exiting" ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <div className="relative flex flex-col items-center justify-center mb-4">
            {/* Animasi Gelombang Air / Ripple */}
            <div className="absolute w-24 h-24 bg-teal-400 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-40"></div>
            {/* Animasi Jatuh Logo */}
            <img
              src="/logo.svg"
              alt="Logo Nina"
              className="w-24 h-24 relative z-10 animate-[bounce_1s_infinite] drop-shadow-2xl"
            />
          </div>
          <h1 className="mt-8 font-bismillah text-4xl md:text-5xl text-[#000080] tracking-widest animate-pulse">
            Nina's Project
          </h1>
          <p className="text-teal-600 text-[10px] md:text-xs mt-2 font-bold tracking-[0.3em] uppercase">
            Manajemen Akademik
          </p>
        </div>
      )}

      {/* ==========================================
          APLIKASI UTAMA
      ========================================== */}
      <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-teal-200 pb-16 md:pb-0">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @import url('https://fonts.googleapis.com/css2?family=Cantora+One&display=swap');
          
          @font-face {
            font-family: 'Bismillah Script';
            src: url('/fonts/BismillahScript.ttf') format('truetype');
            font-weight: normal; font-style: normal;
          }

          * { font-family: 'Cantora One', sans-serif; }
          .font-bismillah { font-family: 'Bismillah Script', cursive; }

          @media print {
            body * { visibility: hidden !important; }
            .print-mode, .print-mode * { visibility: visible !important; }
            .print-mode { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 100%; 
              margin: 0; 
              padding: 0; 
              box-shadow: none !important;
            }
            .no-print { display: none !important; }
            @page { size: auto; margin: 10mm; }
          }
        `,
          }}
        />

        {/* --- TOP NAVBAR --- */}
        <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40 no-print">
          <div className="max-w-7xl mx-auto px-3 md:px-6">
            <div className="flex justify-between items-center h-14 md:h-16">
              <div
                className="flex items-center gap-2 md:gap-3 cursor-pointer"
                onClick={() => navToTab("home")}
              >
                <img
                  src="/logo.svg"
                  alt="Logo Nina"
                  className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-sm"
                />
                <span className="font-bismillah text-2xl md:text-3xl text-[#000080] drop-shadow-sm pt-2">
                  Nina's Project
                </span>
              </div>
              <div className="hidden md:flex space-x-1">
                {["home", "siswa", "nilai", "keuangan"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => navToTab(tab)}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-sm capitalize ${activeTab === tab ? "bg-teal-50 text-teal-700 shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
                  >
                    {tab === "home" && <Home size={16} />}
                    {tab === "siswa" && <Users size={16} />}
                    {tab === "nilai" && <GraduationCap size={16} />}
                    {tab === "keuangan" && <Wallet size={16} />}
                    {tab === "home"
                      ? "Beranda"
                      : tab === "siswa"
                        ? "Data Siswa"
                        : tab === "nilai"
                          ? "Rekap Nilai"
                          : "Keuangan"}
                  </button>
                ))}
              </div>
              <div className="md:hidden flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 text-slate-600">
                  <Settings className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* --- BOTTOM NAVIGATION BAR (Mobile) --- */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center pt-1.5 pb-1.5 z-40 px-1 no-print shadow-[0_-4px_15px_rgba(0,0,0,0.03)]">
          {["home", "siswa", "nilai", "keuangan"].map((tab) => (
            <button
              key={tab}
              onClick={() => navToTab(tab)}
              className={`flex flex-col items-center p-1.5 rounded-lg min-w-[60px] ${activeTab === tab ? "text-teal-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <div
                className={`${activeTab === tab ? "bg-teal-50 p-1 rounded-md mb-0.5" : "mb-1"}`}
              >
                {tab === "home" && (
                  <Home
                    size={20}
                    className={activeTab === "home" ? "fill-teal-100" : ""}
                  />
                )}
                {tab === "siswa" && (
                  <Users
                    size={20}
                    className={activeTab === "siswa" ? "fill-teal-100" : ""}
                  />
                )}
                {tab === "nilai" && (
                  <GraduationCap
                    size={20}
                    className={activeTab === "nilai" ? "fill-teal-100" : ""}
                  />
                )}
                {tab === "keuangan" && (
                  <Wallet
                    size={20}
                    className={activeTab === "keuangan" ? "fill-teal-100" : ""}
                  />
                )}
              </div>
              <span className="text-[9px] capitalize">
                {tab === "home" ? "Beranda" : tab}
              </span>
            </button>
          ))}
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-6 no-print">
          {/* TAB 1: BERANDA */}
          {activeTab === "home" && (
            <div className="space-y-4 md:space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl p-4 md:p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                  <div>
                    <p className="text-teal-100 text-xs mb-0.5 flex items-center gap-1.5">
                      <TrendingUp size={14} /> Grand Total Dana
                    </p>
                    <h2 className="text-3xl md:text-4xl tracking-tight leading-none">
                      {formatRp(grandTotalKeuangan)}
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
                    <div className="bg-white/10 p-3 rounded-xl border border-white/20 backdrop-blur-sm">
                      <p className="text-teal-100 text-[9px] uppercase tracking-widest mb-0.5">
                        Total Cash
                      </p>
                      <p className="text-base text-white">
                        {formatRp(totalCash)}
                      </p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl border border-white/20 backdrop-blur-sm">
                      <p className="text-teal-100 text-[9px] uppercase tracking-widest mb-0.5">
                        Total Transfer
                      </p>
                      <p className="text-base text-white">
                        {formatRp(totalTransfer)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 border-t border-teal-400/30 pt-3 mt-4">
                  <div>
                    <p className="text-teal-100 text-[9px] uppercase tracking-widest mb-0.5">
                      Jumlah Anak
                    </p>
                    <p className="text-sm">{siswaData.length} Siswa</p>
                  </div>
                  <div>
                    <p className="text-teal-100 text-[9px] uppercase tracking-widest mb-0.5">
                      Total Kelas
                    </p>
                    <p className="text-sm">{kelasOptions.length} Kategori</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs text-slate-500 uppercase tracking-widest mb-2.5 px-1">
                  Menu Cepat
                </h3>
                <div className="grid grid-cols-4 gap-3 max-w-md md:max-w-2xl mx-auto md:mx-0">
                  <button
                    onClick={() => openModal("siswa")}
                    className="flex flex-col items-center gap-2 active:scale-95"
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-teal-600">
                      <UserPlus size={24} />
                    </div>
                    <span className="text-[9px] md:text-xs text-slate-600 text-center">
                      Siswa
                      <br />
                      Baru
                    </span>
                  </button>
                  <button
                    onClick={() => navToTab("keuangan")}
                    className="flex flex-col items-center gap-2 active:scale-95"
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-amber-500">
                      <Banknote size={24} />
                    </div>
                    <span className="text-[9px] md:text-xs text-slate-600 text-center">
                      Input
                      <br />
                      Uang
                    </span>
                  </button>
                  <button
                    onClick={() => navToTab("nilai")}
                    className="flex flex-col items-center gap-2 active:scale-95"
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-500">
                      <FileText size={24} />
                    </div>
                    <span className="text-[9px] md:text-xs text-slate-600 text-center">
                      Input
                      <br />
                      Nilai
                    </span>
                  </button>
                  <button
                    onClick={() => navToTab("keuangan")}
                    className="flex flex-col items-center gap-2 active:scale-95"
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-rose-500">
                      <ReceiptText size={24} />
                    </div>
                    <span className="text-[9px] md:text-xs text-slate-600 text-center">
                      Cetak
                      <br />
                      Kwitansi
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs text-slate-800 uppercase tracking-wide">
                    Siswa Terdaftar Baru
                  </h3>
                  <button
                    onClick={() => navToTab("siswa")}
                    className="text-teal-600 text-[10px] uppercase tracking-wider"
                  >
                    Lihat Semua
                  </button>
                </div>
                <div className="space-y-2.5">
                  {siswaData.length === 0 ? (
                    <p className="text-center text-slate-400 text-xs py-3">
                      Belum ada siswa terdaftar.
                    </p>
                  ) : (
                    siswaData
                      .slice(-4)
                      .reverse()
                      .map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/50"
                        >
                          <div className="w-9 h-9 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm">
                            {String(s.nama || "")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-800 truncate text-xs">
                              {s.nama}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {s.kelas}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              openModal("keuangan", s, keuanganData[s.id] || {})
                            }
                            className="px-2.5 py-1.5 bg-white text-teal-600 rounded-lg text-[10px] shadow-sm"
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

          {/* --- FILTER BAR --- */}
          {activeTab !== "home" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 md:p-4 mb-4">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                <div className="flex gap-3 items-center">
                  <div className="bg-teal-50 p-2.5 rounded-xl text-teal-600 border border-teal-100">
                    {activeTab === "siswa" && <Users size={20} />}
                    {activeTab === "nilai" && <FileText size={20} />}
                    {activeTab === "keuangan" && <Wallet size={20} />}
                  </div>
                  <div>
                    <h2 className="text-base text-slate-800 capitalize leading-tight">
                      Manajemen {activeTab}
                    </h2>
                    <p className="text-[10px] text-slate-500">
                      Total {filteredSiswa.length} data
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 md:w-40">
                    <Search
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={14}
                    />
                    <input
                      type="text"
                      placeholder="Cari nama..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 rounded-lg text-xs outline-none focus:border-teal-500"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <select
                    className="py-1.5 px-2 bg-slate-50 rounded-lg text-xs outline-none text-slate-700"
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
                  {activeTab === "siswa" && (
                    <>
                      <button
                        onClick={() => openModal("kelas")}
                        className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[11px] flex items-center gap-1.5"
                      >
                        <Plus size={14} /> Kelas
                      </button>
                      <button
                        onClick={() => openModal("siswa")}
                        className="px-2.5 py-1.5 bg-teal-600 text-white rounded-lg text-[11px] flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus size={14} /> Siswa
                      </button>
                    </>
                  )}
                  {(activeTab === "nilai" || activeTab === "keuangan") && (
                    <button
                      onClick={
                        activeTab === "nilai"
                          ? handleExportNilai
                          : handleExportKeuangan
                      }
                      className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-[11px] flex items-center gap-1.5 shadow-sm"
                    >
                      <Download size={14} /> Excel
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATA SISWA */}
          {activeTab === "siswa" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-slate-500 w-12 text-center text-xs uppercase tracking-wide">
                        No
                      </th>
                      <th className="px-4 py-3 text-slate-500 text-xs uppercase tracking-wide">
                        Nama Lengkap
                      </th>
                      <th className="px-4 py-3 text-slate-500 text-xs uppercase tracking-wide w-48">
                        Kelas
                      </th>
                      <th className="px-4 py-3 text-slate-500 text-center w-28 text-xs uppercase tracking-wide">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSiswa.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-teal-50/40">
                        <td className="px-4 py-2.5 text-slate-500 text-center text-xs">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2.5 text-slate-800">
                          <EditableCell
                            value={s.nama}
                            onSave={(val) =>
                              handleInlineSiswa(s.id, "nama", val)
                            }
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <EditableCell
                            type="select"
                            options={kelasOptions}
                            value={s.kelas}
                            onSave={(val) =>
                              handleInlineSiswa(s.id, "kelas", val)
                            }
                          />
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            onClick={() => openModal("siswa", s)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSiswa(s.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: REKAP NILAI */}
          {activeTab === "nilai" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print-mode">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-3 text-slate-500 sticky left-0 bg-slate-50 text-center text-xs uppercase z-10">
                        No
                      </th>
                      <th className="px-3 py-3 text-slate-500 sticky left-10 bg-slate-50 text-xs uppercase z-10 shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                        Nama Siswa
                      </th>
                      <th className="px-3 py-3 text-slate-500 text-center text-xs uppercase">
                        Hafalan
                      </th>
                      <th className="px-3 py-3 text-slate-500 text-center text-xs uppercase">
                        Catatan
                      </th>
                      <th className="px-3 py-3 text-slate-500 text-center text-xs uppercase">
                        Ulangan
                      </th>
                      <th className="px-3 py-3 text-slate-500 text-center text-xs uppercase">
                        Ujian
                      </th>
                      <th className="px-3 py-3 text-teal-600 bg-teal-50/50 text-center text-xs uppercase">
                        Rata-rata
                      </th>
                      <th className="px-3 py-3 text-slate-500 text-xs uppercase">
                        Keterangan
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
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2.5 text-slate-500 sticky left-0 bg-white text-center text-xs">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2.5 text-slate-800 sticky left-10 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.01)] text-xs">
                            {s.nama} <br />
                            <span className="text-[9px] text-slate-400 uppercase">
                              {s.kelas}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <EditableCell
                              type="number"
                              value={n.hafalan}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "hafalan", val)
                              }
                              placeholder="-"
                            />
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <EditableCell
                              type="number"
                              value={n.catatan}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "catatan", val)
                              }
                              placeholder="-"
                            />
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <EditableCell
                              type="number"
                              value={n.ulangan}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "ulangan", val)
                              }
                              placeholder="-"
                            />
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <EditableCell
                              type="number"
                              value={n.ujian}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "ujian", val)
                              }
                              placeholder="-"
                            />
                          </td>
                          <td className="px-3 py-2.5 text-teal-700 bg-teal-50/30 text-center text-xs">
                            {rata > 0 ? rata.toFixed(1) : "-"}
                          </td>
                          <td className="px-3 py-2.5">
                            <EditableCell
                              value={n.keterangan}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "keterangan", val)
                              }
                              placeholder="Catatan..."
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: KEUANGAN */}
          {activeTab === "keuangan" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-3 text-slate-500 sticky left-0 bg-slate-50 z-10 text-center text-xs uppercase">
                        No
                      </th>
                      <th className="px-3 py-3 text-slate-500 sticky left-10 bg-slate-50 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.03)] text-xs uppercase">
                        Siswa
                      </th>
                      <th className="px-3 py-3 text-slate-500 text-right text-xs uppercase">
                        Infaq
                      </th>
                      <th className="px-3 py-3 text-slate-500 text-right text-xs uppercase">
                        Daftar Ulang
                      </th>
                      <th className="px-3 py-3 text-slate-500 text-right text-xs uppercase">
                        Konsumsi
                      </th>
                      <th className="px-3 py-3 text-slate-500 text-right text-xs uppercase">
                        Makan Siang
                      </th>
                      <th className="px-3 py-3 text-teal-600 bg-teal-50/50 text-right text-xs uppercase">
                        Total
                      </th>
                      <th className="px-3 py-3 text-slate-500 text-center text-xs uppercase">
                        Metode
                      </th>
                      <th className="px-3 py-3 text-slate-500 text-center text-xs uppercase">
                        Status
                      </th>
                      <th className="px-3 py-3 text-slate-500 text-center no-print text-xs uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSiswa.map((s, idx) => {
                      const k = keuanganData[s.id] || {};
                      const total =
                        (Number(k.infaq) || 0) +
                        (Number(k.cicilan) || 0) +
                        (Number(k.konsumsi) || 0) +
                        (Number(k.makan) || 0);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2.5 text-slate-500 sticky left-0 bg-white text-center text-xs">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2.5 text-slate-800 sticky left-10 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.01)] text-xs">
                            {s.nama} <br />
                            <span className="text-[9px] text-slate-400 uppercase">
                              {s.kelas}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <EditableCell
                              type="number"
                              isCurrency
                              value={k.infaq}
                              onSave={(val) =>
                                handleInlineKeuangan(s.id, "infaq", val)
                              }
                              placeholder="Rp0"
                            />
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <EditableCell
                              type="number"
                              isCurrency
                              value={k.cicilan}
                              onSave={(val) =>
                                handleInlineKeuangan(s.id, "cicilan", val)
                              }
                              placeholder="Rp0"
                            />
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <EditableCell
                              type="number"
                              isCurrency
                              value={k.konsumsi}
                              onSave={(val) =>
                                handleInlineKeuangan(s.id, "konsumsi", val)
                              }
                              placeholder="Rp0"
                            />
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <EditableCell
                              type="number"
                              isCurrency
                              value={k.makan}
                              onSave={(val) =>
                                handleInlineKeuangan(s.id, "makan", val)
                              }
                              placeholder="Rp0"
                            />
                          </td>
                          <td className="px-3 py-2.5 text-teal-700 bg-teal-50/20 text-right text-xs">
                            {formatRp(total)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <EditableCell
                              type="select"
                              options={["Cash", "Transfer"]}
                              value={k.metode || "Cash"}
                              onSave={(val) =>
                                handleInlineKeuangan(s.id, "metode", val)
                              }
                            />
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <EditableCell
                              type="select"
                              options={["Belum", "Sudah"]}
                              value={k.status || "Belum"}
                              onSave={(val) =>
                                handleInlineKeuangan(s.id, "status", val)
                              }
                            />
                          </td>
                          <td className="px-3 py-2.5 text-center no-print">
                            <button
                              onClick={() => openModal("kwitansi", s)}
                              className="p-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg"
                            >
                              <ReceiptText size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {/* --- ALL MODALS --- */}
        {modalType && modalType !== "kwitansi" && (
          <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm overflow-y-auto no-print">
            <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-md mt-auto md:mt-8 md:mb-8 p-4 md:p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base md:text-lg text-slate-800 capitalize flex items-center gap-2">
                  Form {modalType}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-1.5 bg-slate-50 text-slate-400 rounded-full"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSaveData} className="space-y-3.5">
                {modalType === "siswa" && (
                  <>
                    <input
                      required
                      type="text"
                      placeholder="Nama Lengkap..."
                      className="w-full p-3 bg-slate-50 rounded-xl text-xs outline-none"
                      value={formData.nama || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, nama: e.target.value })
                      }
                    />
                    <select
                      required
                      className="w-full p-3 bg-slate-50 rounded-xl text-xs outline-none"
                      value={formData.kelas || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, kelas: e.target.value })
                      }
                    >
                      {kelasOptions.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </>
                )}
                {modalType === "kelas" && (
                  <input
                    required
                    type="text"
                    placeholder="Nama Kelas Baru..."
                    className="w-full p-3 bg-slate-50 rounded-xl text-xs outline-none"
                    value={formData.nama_kelas || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, nama_kelas: e.target.value })
                    }
                  />
                )}
                {modalType === "nilai" && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Hafalan"
                      className="w-full p-3 bg-slate-50 rounded-xl text-xs"
                      value={formData.hafalan || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, hafalan: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      placeholder="Catatan"
                      className="w-full p-3 bg-slate-50 rounded-xl text-xs"
                      value={formData.catatan || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, catatan: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      placeholder="Ulangan"
                      className="w-full p-3 bg-slate-50 rounded-xl text-xs"
                      value={formData.ulangan || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, ulangan: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      placeholder="Ujian"
                      className="w-full p-3 bg-slate-50 rounded-xl text-xs"
                      value={formData.ujian || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, ujian: e.target.value })
                      }
                    />
                    <textarea
                      placeholder="Keterangan..."
                      className="col-span-2 w-full p-3 bg-slate-50 rounded-xl text-xs"
                      value={formData.keterangan || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, keterangan: e.target.value })
                      }
                    />
                  </div>
                )}
                {modalType === "keuangan" && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Infaq"
                      className="w-full p-3 bg-slate-50 rounded-xl text-xs"
                      value={formData.infaq || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, infaq: e.target.value })
                      }
                      onBlur={(e) =>
                        setFormData({
                          ...formData,
                          infaq: autoRibuan(e.target.value),
                        })
                      }
                    />
                    <input
                      type="number"
                      placeholder="Daftar Ulang"
                      className="w-full p-3 bg-slate-50 rounded-xl text-xs"
                      value={formData.cicilan || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, cicilan: e.target.value })
                      }
                      onBlur={(e) =>
                        setFormData({
                          ...formData,
                          cicilan: autoRibuan(e.target.value),
                        })
                      }
                    />
                    <input
                      type="number"
                      placeholder="Konsumsi"
                      className="w-full p-3 bg-slate-50 rounded-xl text-xs"
                      value={formData.konsumsi || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, konsumsi: e.target.value })
                      }
                      onBlur={(e) =>
                        setFormData({
                          ...formData,
                          konsumsi: autoRibuan(e.target.value),
                        })
                      }
                    />
                    <input
                      type="number"
                      placeholder="Makan"
                      className="w-full p-3 bg-slate-50 rounded-xl text-xs"
                      value={formData.makan || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, makan: e.target.value })
                      }
                      onBlur={(e) =>
                        setFormData({
                          ...formData,
                          makan: autoRibuan(e.target.value),
                        })
                      }
                    />
                    <select
                      className="w-full p-3 bg-slate-50 rounded-xl text-xs"
                      value={formData.metode || "Cash"}
                      onChange={(e) =>
                        setFormData({ ...formData, metode: e.target.value })
                      }
                    >
                      <option value="Cash">Cash</option>
                      <option value="Transfer">Transfer</option>
                    </select>
                    <select
                      className="w-full p-3 bg-slate-50 rounded-xl text-xs"
                      value={formData.status || "Belum"}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="Belum">Belum Lunas</option>
                      <option value="Sudah">Sudah Lunas</option>
                    </select>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-white bg-teal-600 shadow-md flex justify-center items-center gap-2 mt-4 text-xs uppercase"
                >
                  <Save size={16} /> Simpan Data
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL KWITANSI --- */}
        {modalType === "kwitansi" && activeSiswa && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 p-4 overflow-y-auto">
            <div className="absolute top-4 right-4 flex gap-2 no-print z-50">
              <button
                onClick={handleDownloadImage}
                disabled={isCapturing}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg flex items-center gap-1.5 text-xs shadow-md disabled:opacity-70"
              >
                <Camera size={14} />{" "}
                {isCapturing ? "Memproses..." : "Simpan Gambar"}
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-teal-500 text-white rounded-lg flex items-center gap-1.5 text-xs shadow-md"
              >
                <Printer size={14} /> Print PDF
              </button>
              <button
                onClick={closeModal}
                className="p-1.5 bg-slate-800 text-white rounded-lg shadow-md"
              >
                <X size={16} />
              </button>
            </div>

            <div
              id="kwitansi-print-area"
              className="w-full max-w-md print:max-w-full print:w-full bg-white rounded-xl shadow-2xl print:shadow-none p-5 print:p-8 relative print-mode overflow-hidden mt-10 md:mt-0"
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <span
                  className={`text-[5rem] md:text-[6rem] font-black uppercase tracking-widest -rotate-[35deg] opacity-5 select-none ${keuanganData[activeSiswa.id]?.status === "Sudah" ? "text-teal-700" : "text-amber-600"}`}
                >
                  {keuanganData[activeSiswa.id]?.status === "Sudah"
                    ? "LUNAS"
                    : "BELUM"}
                </span>
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start border-b-[2px] border-slate-800 pb-3 mb-4 bg-white/50">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/logo.svg"
                      alt="Logo Nina"
                      className="w-10 h-10 object-contain"
                    />
                    <div>
                      <h1 className="text-base text-[#000080] uppercase font-bismillah">
                        NINA'S PROJECT
                      </h1>
                      <p className="text-[9px] text-slate-500 uppercase">
                        Manajemen Akademik
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-lg text-slate-200 uppercase font-bold">
                      Kwitansi
                    </h2>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      No: {getNomorKwitansi(activeSiswa.id)}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 text-[10px]">
                  <table className="w-full text-left text-slate-800">
                    <tbody>
                      <tr>
                        <td className="font-bold py-0.5 w-20">Terima Dari</td>
                        <td className="py-0.5 w-2 font-bold">:</td>
                        <td className="py-0.5">{activeSiswa.nama}</td>
                      </tr>
                      <tr>
                        <td className="font-bold py-0.5">Kategori</td>
                        <td className="py-0.5 w-2 font-bold">:</td>
                        <td className="py-0.5">{activeSiswa.kelas}</td>
                      </tr>
                      <tr>
                        <td className="font-bold py-0.5">Metode</td>
                        <td className="py-0.5 w-2 font-bold">:</td>
                        <td className="py-0.5">
                          {keuanganData[activeSiswa.id]?.metode || "Cash"}
                          <span className="text-slate-500 italic ml-1">
                            (
                            {keuanganData[activeSiswa.id]?.status === "Sudah"
                              ? "Lunas"
                              : "Belum Selesai"}
                            )
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <table className="w-full border border-slate-300 text-[10px] mb-4 bg-white">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-1.5 border-r border-b border-slate-300 text-slate-700">
                        Rincian Pembayaran
                      </th>
                      <th className="p-1.5 border-b border-slate-300 text-right text-slate-700 w-28">
                        Nominal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    <tr>
                      <td className="p-1.5 border-r border-slate-300">
                        Infaq Pendidikan
                      </td>
                      <td className="p-1.5 text-right font-medium">
                        {formatRp(keuanganData[activeSiswa.id]?.infaq)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border-r border-slate-300">
                        Cicilan Daftar Ulang
                      </td>
                      <td className="p-1.5 text-right font-medium">
                        {formatRp(keuanganData[activeSiswa.id]?.cicilan)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border-r border-slate-300">
                        Biaya Konsumsi
                      </td>
                      <td className="p-1.5 text-right font-medium">
                        {formatRp(keuanganData[activeSiswa.id]?.konsumsi)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border-r border-slate-300">
                        Makan Siang
                      </td>
                      <td className="p-1.5 text-right font-medium">
                        {formatRp(keuanganData[activeSiswa.id]?.makan)}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-800 text-white">
                    <tr>
                      <td className="p-1.5 border-r border-slate-700 text-right uppercase tracking-widest text-[9px] font-bold">
                        Total Pembayaran
                      </td>
                      <td className="p-1.5 text-right text-xs md:text-sm font-bold">
                        {formatRp(
                          (Number(keuanganData[activeSiswa.id]?.infaq) || 0) +
                            (Number(keuanganData[activeSiswa.id]?.cicilan) ||
                              0) +
                            (Number(keuanganData[activeSiswa.id]?.konsumsi) ||
                              0) +
                            (Number(keuanganData[activeSiswa.id]?.makan) || 0),
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                <div className="flex justify-end pr-2 text-center text-[9px]">
                  <div>
                    <p className="mb-0.5 uppercase text-slate-500 font-bold tracking-widest">
                      Penerima
                    </p>
                    <div className="w-32 h-20 md:w-40 md:h-12 flex items-center justify-center mx-auto overflow-hidden">
                      <img
                        src="/assets/ttd.svg"
                        alt="Tanda Tangan"
                        className="w-full h-full object-cover scale-90 mix-blend-multiply"
                      />
                    </div>
                    <p className="underline mt-1 text-slate-800 font-bold text-[10px]">
                      Nina Rahilah S.Pd.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
