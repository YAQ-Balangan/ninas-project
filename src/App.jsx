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
          className="w-full p-1.5 border-2 border-teal-500 rounded-lg outline-none text-[10px] md:text-xs text-teal-900 bg-white shadow-sm min-w-[70px] md:min-w-[90px]"
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
        className="w-full p-1.5 border-2 border-teal-500 rounded-lg outline-none text-[10px] md:text-xs text-teal-900 bg-white shadow-sm min-w-[50px] md:min-w-[70px]"
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
      <span className="text-teal-600 flex items-center gap-1 text-[9px] md:text-[11px] font-semibold">
        <CheckCircle2 size={12} /> Lunas
      </span>
    );
  } else if (type === "select" && value === "Belum") {
    displayValue = (
      <span className="text-amber-500 flex items-center gap-1 text-[9px] md:text-[11px] font-semibold">
        <AlertCircle size={12} /> Belum
      </span>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="w-full min-h-[24px] cursor-text hover:bg-teal-50/50 hover:ring-1 hover:ring-teal-200 rounded-md px-1 flex items-center transition-all duration-200 text-slate-700 text-[10px] md:text-sm font-medium"
    >
      {displayValue || (
        <span className="text-slate-300 italic text-[9px] md:text-xs">
          {placeholder}
        </span>
      )}
    </div>
  );
};

// ==========================================
// KOMPONEN UTAMA Nina Rahell Project
// ==========================================
export default function NinaProjectApp() {
  const [activeTab, setActiveTab] = useState("home");
  const [modalType, setModalType] = useState(null);

  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [splashState, setSplashState] = useState("entering");

  const [kelasOptions, setKelasOptions] = useState([]);
  const [siswaData, setSiswaData] = useState([]);
  const [nilaiData, setNilaiData] = useState({});
  const [keuanganData, setKeuanganData] = useState({});

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
      const tab = parts[0] || "home";
      const modal = parts[1] || null;

      setActiveTab(tab);
      setModalType(modal);
    };

    window.addEventListener("hashchange", handleHashChange);
    if (!window.location.hash) {
      window.location.replace("#home");
    } else {
      handleHashChange();
    }
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navToTab = (tab) => {
    window.location.hash = tab;
  };

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
    window.location.hash = `${activeTab}/${type}`;
  };

  const closeModal = () => {
    window.location.replace(`#${activeTab}`);
  };

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
        await supabase.from("siswa").upsert({
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

  const getNomorKwitansi = (siswaId) => {
    const index = siswaData.findIndex((s) => s.id === siswaId);
    return index !== -1 ? index + 1 : 1;
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
      alert(
        "Gagal memproses gambar. Pastikan module html-to-image terinstall.",
      );
    } finally {
      setIsCapturing(false);
    }
  };

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

  if (isLoading && splashState === "hidden") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-teal-600 flex-col gap-3 selection-live-bg">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        <p className="font-bold text-sm">Menyinkronkan dengan Database...</p>
      </div>
    );
  }

  return (
    <>
      {/* ==========================================
          KOMPONEN SPLASH SCREEN ELEGAN
      ========================================== */}
      {splashState !== "hidden" && (
        <div
          className={`fixed inset-0 z-[999] bg-[#f8fafc] flex flex-col items-center justify-center transition-all duration-700 ease-in-out 
          ${splashState === "exiting" ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"}`}
        >
          <img
            src="/logo.svg"
            alt="Logo Nina"
            className="w-24 h-24 md:w-32 md:h-32 object-contain mb-8 drop-shadow-xl animate-[pulse_3s_ease-in-out_infinite]"
          />
          <h1 className="font-bismillah text-4xl md:text-5xl text-[#000080] tracking-widest drop-shadow-sm">
            Nina Rahell Project
          </h1>
          <div className="w-10 h-1 bg-teal-500 rounded-full mt-4 mb-3 opacity-70"></div>
          <p className="text-slate-500 text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold">
            Manajemen Akademik
          </p>
        </div>
      )}

      {/* ==========================================
          APLIKASI UTAMA
      ========================================== */}
      <div className="min-h-screen text-slate-800 pb-16 md:pb-0 relative selection-live-bg overflow-x-hidden z-0 font-sans selection:bg-teal-200 selection:text-teal-900">
        {/* CSS KHUSUS ANIMASI BACKGROUND & PRINT FIX */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
    
        @keyframes gradientBG {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .selection-live-bg {
      background: linear-gradient(-45deg, #f0fdf4, #ecfdf5, #fffbeb, #f0fdfa);
      background-size: 400% 400%;
      animation: gradientBG 15s ease infinite;
    }

    /* ==========================================
       LOGIKA PRINT (FIX BLANK, CLEAN & KOP)
    ========================================== */
    @media print {
      /* 1. RESET TOTAL LATAR BELAKANG */
      /* Kita targetkan semua kontainer utama agar menjadi putih polos */
      body, 
      html, 
      .selection-live-bg, 
      main, 
      #root, 
      .__next {
        background: white !important;
        background-image: none !important;
        background-color: white !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      /* 2. SEMBUNYIKAN ELEMEN UI & DEKORASI */
      nav, 
      .no-print, 
      button, 
      .fixed:not(:has(#kwitansi-print-area)), 
      .animate-blob1, 
      .animate-blob2,
      .absolute.inset-0.overflow-hidden {
        display: none !important;
      }

      /* 3. SETTING LAPORAN TABEL */
      main {
        display: block !important;
        width: 100% !important;
        padding: 0 !important;
      }

      /* Hilangkan efek glassmorphism/transparansi agar tidak berbayang saat di-print */
      .bg-white\/80, 
      .bg-white\/90, 
      .backdrop-blur-xl,
      .shadow-sm {
        background: transparent !important;
        backdrop-filter: none !important;
        box-shadow: none !important;
        border: none !important;
      }

      .print-kop-laporan {
        display: flex !important;
        border-bottom: 2px solid #000 !important;
        margin-bottom: 15px !important;
        padding-bottom: 10px !important;
      }

      main table {
        min-width: 100% !important;
        width: 100% !important;
        border: 1px solid #000 !important;
        border-collapse: collapse !important;
      }
      
      main th, main td {
        border: 1px solid #000 !important;
        padding: 6px 4px !important;
        color: black !important;
        background-color: transparent !important; /* Mencegah warna sel tabel aplikasi ikut terbawa */
      }

      /* 4. SETTING KHUSUS KWITANSI */
      body:has(#kwitansi-print-area) main {
        display: none !important;
      }

      #kwitansi-print-area {
        display: block !important;
        position: relative !important;
        max-width: 550px !important;
        margin: 0 auto !important;
        background: white !important;
      }

      #kwitansi-print-area table { border: none !important; }
      #kwitansi-print-area td, #kwitansi-print-area th { border: none !important; }
      
      /* Hanya beri border pada tabel rincian biaya di kwitansi */
      #kwitansi-print-area .border-2 {
        border: 1.5px solid #000 !important;
      }
      #kwitansi-print-area .border-2 td, 
      #kwitansi-print-area .border-2 th {
        border: 1px solid #000 !important;
      }

      /* 5. AKTIFKAN WARNA HANYA UNTUK ELEMEN PENTING */
      /* Agar logo dan teks berwarna tetap muncul di atas kertas putih */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
    `,
          }}
        />

        {/* ELEMEN BACKGROUND BLOBS MELAYANG */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] opacity-70 no-print">
          <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-emerald-300/30 rounded-[40%] blur-[80px] animate-blob1" />
          <div className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] bg-amber-300/20 rounded-[45%] blur-[80px] animate-blob2" />
          <div
            className="absolute -bottom-[20%] left-[20%] w-[40vw] h-[40vw] bg-teal-300/30 rounded-full blur-[100px] animate-blob1"
            style={{ animationDelay: "-5s" }}
          />
        </div>

        {/* --- TOP NAVBAR GLASSMORPHISM --- */}
        <nav className="bg-white/80 backdrop-blur-xl border-b border-white/60 shadow-sm sticky top-0 z-40 no-print">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex justify-between items-center h-14 md:h-16">
              <div
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => navToTab("home")}
              >
                <img
                  src="/logo.svg"
                  alt="Logo Nina"
                  className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                />
                <span className="font-bismillah text-xl md:text-3xl text-[#000080] drop-shadow-sm pt-1.5">
                  Nina Rahell Project
                </span>
              </div>
              <div className="hidden md:flex space-x-2 bg-slate-50/50 p-1.5 rounded-xl border border-white/60">
                {["home", "siswa", "nilai", "keuangan"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => navToTab(tab)}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all duration-300 text-[11px] md:text-xs font-semibold capitalize tracking-wide
                    ${activeTab === tab ? "bg-white text-teal-700 shadow-[0_4px_15px_rgba(20,184,166,0.15)]" : "text-slate-500 hover:bg-white/60 hover:text-slate-700"}`}
                  >
                    {tab === "home" && <Home size={14} />}
                    {tab === "siswa" && <Users size={14} />}
                    {tab === "nilai" && <GraduationCap size={14} />}
                    {tab === "keuangan" && <Wallet size={14} />}
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
                <div className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center border border-white/60 shadow-sm text-slate-600">
                  <Settings className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* --- BOTTOM NAVIGATION BAR (Mobile Glassmorphism) --- */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-white/60 flex justify-around items-center pt-1.5 pb-1.5 z-40 px-2 no-print shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          {["home", "siswa", "nilai", "keuangan"].map((tab) => (
            <button
              key={tab}
              onClick={() => navToTab(tab)}
              className={`flex flex-col items-center p-1.5 rounded-xl min-w-[64px] transition-all duration-300 ${activeTab === tab ? "text-teal-700 scale-105" : "text-slate-400 hover:text-slate-600"}`}
            >
              <div
                className={`transition-all duration-300 ${activeTab === tab ? "bg-teal-50 p-1.5 rounded-lg mb-0.5 shadow-sm" : "mb-1"}`}
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
              <span className="text-[9px] font-semibold capitalize tracking-wide">
                {tab === "home" ? "Beranda" : tab}
              </span>
            </button>
          ))}
        </div>

        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {/* --- HEADER KOP LAPORAN (HANYA MUNCUL SAAT PRINT TABEL) --- */}
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
                    : "Keuangan"}
              </h2>
              <p className="text-[10px] font-medium text-slate-500 italic">
                Dicetak pada:{" "}
                {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
              </p>
            </div>
          </div>
          {activeTab === "home" && (
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
              {/* Card Kas Elegan */}
              <div className="bg-gradient-to-br from-teal-500/95 to-emerald-700/95 backdrop-blur-xl rounded-3xl p-5 md:p-8 text-white shadow-[0_20px_40px_rgba(20,184,166,0.2)] border border-white/20 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-900/20 rounded-full blur-3xl"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 relative z-10">
                  <div>
                    <p className="text-teal-100 text-xs md:text-sm font-medium mb-1 flex items-center gap-2 tracking-wide uppercase">
                      <TrendingUp size={16} /> Grand Total Dana
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

              {/* Menu Cepat Elegan (Hover Effects) */}
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
                      Siswa
                      <br className="md:hidden" />
                      Baru
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
                      Input
                      <br className="md:hidden" />
                      Uang
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
                      Input
                      <br className="md:hidden" />
                      Nilai
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
                      Cetak
                      <br className="md:hidden" />
                      Kwitansi
                    </span>
                  </button>
                </div>
              </div>

              {/* List Pendaftar */}
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
                            onClick={() =>
                              openModal("keuangan", s, keuanganData[s.id] || {})
                            }
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

          {/* --- FILTER BAR & TOMBOL EXPORT/PRINT KETIKA DI TAB DATA --- */}
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
                    <h2 className="text-sm md:text-xl font-black text-slate-800 capitalize tracking-tight">
                      Manajemen {activeTab}
                    </h2>
                    <p className="text-[9px] md:text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                      Total {filteredSiswa.length} Data
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

                  {/* KUMPULAN TOMBOL EXPORT & PRINT */}
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

          {/* TAB 2: DATA SISWA */}
          {activeTab === "siswa" && (
            <div className="bg-white/90 ...">
              <div className="w-full overflow-x-auto shadow-inner">
                {" "}
                {/* Tambah overflow-x-auto */}
                <table className="w-full min-w-[600px] text-left">
                  {" "}
                  {/* Tambah min-w-[600px] */}
                  <thead className="bg-slate-50/80 border-b border-slate-200">
                    <tr>
                      <th className="px-2 py-2 md:px-5 md:py-4 text-slate-500 w-8 md:w-12 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest">
                        No
                      </th>
                      <th className="px-2 py-2 md:px-5 md:py-4 text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                        Nama Lengkap
                      </th>
                      <th className="px-2 py-2 md:px-5 md:py-4 text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest w-24 md:w-48">
                        Kelas
                      </th>
                      <th className="px-2 py-2 md:px-5 md:py-4 text-slate-500 text-center w-16 md:w-32 text-[10px] md:text-xs font-bold uppercase tracking-widest no-print">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSiswa.map((s, idx) => (
                      <tr
                        key={s.id}
                        className="hover:bg-teal-50/30 transition-colors"
                      >
                        <td className="px-2 py-2 md:px-5 md:py-3 text-slate-500 text-center text-[10px] md:text-xs font-semibold">
                          {idx + 1}
                        </td>
                        <td className="px-2 py-2 md:px-5 md:py-3 text-slate-800 font-semibold">
                          <EditableCell
                            value={s.nama}
                            onSave={(val) =>
                              handleInlineSiswa(s.id, "nama", val)
                            }
                          />
                        </td>
                        <td className="px-2 py-2 md:px-5 md:py-3">
                          <EditableCell
                            type="select"
                            options={kelasOptions}
                            value={s.kelas}
                            onSave={(val) =>
                              handleInlineSiswa(s.id, "kelas", val)
                            }
                          />
                        </td>
                        <td className="px-2 py-2 md:px-5 md:py-3 text-center no-print">
                          <button
                            onClick={() => openModal("siswa", s)}
                            className="p-1 md:p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md md:rounded-lg mx-0.5 md:mx-1 transition-colors"
                          >
                            <Edit size={12} className="md:w-3.5 md:h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSiswa(s.id)}
                            className="p-1 md:p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md md:rounded-lg mx-0.5 md:mx-1 transition-colors"
                          >
                            <Trash2 size={12} className="md:w-3.5 md:h-3.5" />
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
            <div className="bg-white/90 ...">
              <div className="w-full overflow-x-auto shadow-inner">
                {" "}
                {/* Tambah overflow-x-auto */}
                <table className="w-full min-w-[850px] text-left">
                  {" "}
                  {/* Tambah min-w-[850px] karena kolomnya banyak */}
                  <thead className="bg-slate-50/80 border-b border-slate-200">
                    <tr>
                      <th className="px-1 py-2 md:px-4 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest w-6 md:w-10">
                        No
                      </th>
                      <th className="px-1 py-2 md:px-4 md:py-4 text-slate-500 text-[9px] md:text-xs font-bold uppercase tracking-widest leading-tight">
                        Siswa
                      </th>
                      <th className="px-1 py-2 md:px-4 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest">
                        Hafalan
                      </th>
                      <th className="px-1 py-2 md:px-4 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest">
                        Catatan
                      </th>
                      <th className="px-1 py-2 md:px-4 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest">
                        Ulangan Harian
                      </th>
                      <th className="px-1 py-2 md:px-4 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest">
                        Ujian
                      </th>
                      <th className="px-1 py-2 md:px-4 md:py-4 text-teal-700 bg-teal-50 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest leading-tight">
                        Rata-Rata
                      </th>
                      <th className="px-1 py-2 md:px-4 md:py-4 text-slate-500 text-[9px] md:text-xs font-bold uppercase tracking-widest">
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
                          className="hover:bg-teal-50/30 transition-colors"
                        >
                          <td className="px-1 py-1.5 md:px-4 md:py-3 text-slate-500 text-center text-[9px] md:text-xs font-semibold">
                            {idx + 1}
                          </td>
                          <td className="px-1 py-1.5 md:px-4 md:py-3 text-slate-800 text-[10px] md:text-xs font-bold leading-tight">
                            {s.nama} <br />
                            <span className="text-[7px] md:text-[9px] text-slate-400 tracking-widest uppercase">
                              {s.kelas}
                            </span>
                          </td>
                          <td className="px-1 py-1.5 md:px-4 md:py-3 text-center">
                            <EditableCell
                              type="number"
                              value={n.hafalan}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "hafalan", val)
                              }
                              placeholder="-"
                            />
                          </td>
                          <td className="px-1 py-1.5 md:px-4 md:py-3 text-center">
                            <EditableCell
                              type="number"
                              value={n.catatan}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "catatan", val)
                              }
                              placeholder="-"
                            />
                          </td>
                          <td className="px-1 py-1.5 md:px-4 md:py-3 text-center">
                            <EditableCell
                              type="number"
                              value={n.ulangan}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "ulangan", val)
                              }
                              placeholder="-"
                            />
                          </td>
                          <td className="px-1 py-1.5 md:px-4 md:py-3 text-center">
                            <EditableCell
                              type="number"
                              value={n.ujian}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "ujian", val)
                              }
                              placeholder="-"
                            />
                          </td>
                          <td className="px-1 py-1.5 md:px-4 md:py-3 text-teal-700 bg-teal-50/50 text-center text-[10px] md:text-xs font-bold">
                            {rata > 0 ? rata.toFixed(1) : "-"}
                          </td>
                          <td className="px-1 py-1.5 md:px-4 md:py-3">
                            <EditableCell
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
            </div>
          )}

          {/* TAB 4: KEUANGAN */}
          {activeTab === "keuangan" && (
            <div className="bg-white/90 ...">
              <div className="w-full overflow-x-auto shadow-inner">
                {" "}
                {/* Tambah overflow-x-auto */}
                <table className="w-full min-w-[1000px] text-left">
                  {" "}
                  {/* Tambah min-w-[1000px] agar angka rupiah tidak berantakan */}
                  {/* CARI BAGIAN THEAD DI TAB KEUANGAN DAN GANTI DENGAN INI */}
                  <thead className="bg-slate-50/80 border-b border-slate-200">
                    <tr>
                      <th className="px-1 py-2 md:px-4 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest w-6 md:w-10">
                        No
                      </th>
                      <th className="px-1 py-2 md:px-4 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest leading-tight">
                        Siswa
                      </th>
                      <th className="px-1 py-2 md:px-4 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest">
                        Infaq
                      </th>
                      <th className="px-1 py-2 md:px-4 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest leading-tight">
                        Daftar
                        <br className="md:hidden" />
                        Ulang
                      </th>
                      <th className="px-1 py-2 md:px-4 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest">
                        Konsumsi
                      </th>
                      <th className="px-1 py-2 md:px-4 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest leading-tight">
                        Makan
                        <br className="md:hidden" />
                        Siang
                      </th>
                      <th className="px-1 py-2 md:px-4 md:py-4 text-teal-700 bg-teal-50 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest">
                        Total
                      </th>
                      <th className="px-1 py-2 md:px-4 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest">
                        Metode
                      </th>
                      <th className="px-1 py-2 md:px-4 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest">
                        Status
                      </th>
                      <th className="px-1 py-2 md:px-4 md:py-4 text-slate-500 text-center text-[9px] md:text-xs font-bold uppercase tracking-widest no-print">
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
                        <tr
                          key={s.id}
                          className="hover:bg-teal-50/30 transition-colors"
                        >
                          <td className="px-1 py-1.5 md:px-4 md:py-3 text-slate-500 text-center text-[9px] md:text-xs font-semibold">
                            {idx + 1}
                          </td>
                          <td className="px-1 py-1.5 md:px-4 md:py-3 text-slate-800 text-[10px] md:text-xs font-bold leading-tight">
                            {s.nama} <br />
                            <span className="text-[7px] md:text-[9px] text-slate-400 tracking-widest uppercase">
                              {s.kelas}
                            </span>
                          </td>
                          <td className="px-1 py-1.5 md:px-4 md:py-3 text-right">
                            <EditableCell
                              type="number"
                              isCurrency
                              value={k.infaq}
                              onSave={(val) =>
                                handleInlineKeuangan(s.id, "infaq", val)
                              }
                              placeholder="0"
                            />
                          </td>
                          <td className="px-1 py-1.5 md:px-4 md:py-3 text-right">
                            <EditableCell
                              type="number"
                              isCurrency
                              value={k.cicilan}
                              onSave={(val) =>
                                handleInlineKeuangan(s.id, "cicilan", val)
                              }
                              placeholder="0"
                            />
                          </td>
                          <td className="px-1 py-1.5 md:px-4 md:py-3 text-right">
                            <EditableCell
                              type="number"
                              isCurrency
                              value={k.konsumsi}
                              onSave={(val) =>
                                handleInlineKeuangan(s.id, "konsumsi", val)
                              }
                              placeholder="0"
                            />
                          </td>
                          <td className="px-1 py-1.5 md:px-4 md:py-3 text-right">
                            <EditableCell
                              type="number"
                              isCurrency
                              value={k.makan}
                              onSave={(val) =>
                                handleInlineKeuangan(s.id, "makan", val)
                              }
                              placeholder="0"
                            />
                          </td>
                          <td className="px-1 py-1.5 md:px-4 md:py-3 text-teal-700 bg-teal-50/50 text-right text-[10px] md:text-xs font-bold whitespace-nowrap">
                            {formatRp(total)}
                          </td>
                          <td className="px-1 py-1.5 md:px-4 md:py-3 text-center">
                            <EditableCell
                              type="select"
                              options={["Cash", "Transfer"]}
                              value={k.metode || "Cash"}
                              onSave={(val) =>
                                handleInlineKeuangan(s.id, "metode", val)
                              }
                            />
                          </td>
                          <td className="px-1 py-1.5 md:px-4 md:py-3 text-center">
                            <EditableCell
                              type="select"
                              options={["Belum", "Sudah"]}
                              value={k.status || "Belum"}
                              onSave={(val) =>
                                handleInlineKeuangan(s.id, "status", val)
                              }
                            />
                          </td>
                          <td className="px-1 py-1.5 md:px-4 md:py-3 text-center no-print">
                            <button
                              onClick={() => openModal("kwitansi", s)}
                              className="p-1 md:p-2 bg-teal-50 text-teal-600 hover:bg-teal-100 hover:shadow-md rounded-md md:rounded-lg transition-all"
                            >
                              <ReceiptText
                                size={12}
                                className="md:w-4 md:h-4"
                              />
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

        {/* --- ALL MODALS (FORM) COMPACT --- */}
        {modalType && modalType !== "kwitansi" && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 no-print animate-in fade-in duration-200">
            <div className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl w-full max-w-sm p-5 md:p-6 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base md:text-lg font-black text-slate-800 capitalize flex items-center gap-2.5">
                  <div className="p-1.5 md:p-2 bg-teal-50 text-teal-600 rounded-lg md:rounded-xl">
                    <Edit size={16} className="md:w-5 md:h-5" />
                  </div>
                  Form {modalType}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-1.5 md:p-2 bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleSaveData} className="space-y-3.5">
                {modalType === "siswa" && (
                  <>
                    <div>
                      <label className="block text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">
                        Nama Lengkap
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Masukkan nama..."
                        className="w-full p-2.5 md:p-3 bg-slate-50/80 border border-slate-200 focus:border-teal-500 focus:bg-white rounded-xl text-xs md:text-sm font-semibold outline-none transition-all shadow-sm"
                        value={formData.nama || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, nama: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">
                        Kategori Kelas
                      </label>
                      <select
                        required
                        className="w-full p-2.5 md:p-3 bg-slate-50/80 border border-slate-200 focus:border-teal-500 focus:bg-white rounded-xl text-xs md:text-sm font-semibold outline-none transition-all shadow-sm"
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
                    </div>
                  </>
                )}

                {modalType === "kelas" && (
                  <div>
                    <label className="block text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">
                      Nama Tingkat/Kelas
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Misal: Kelas 1..."
                      className="w-full p-2.5 md:p-3 bg-slate-50/80 border border-slate-200 focus:border-teal-500 focus:bg-white rounded-xl text-xs md:text-sm font-semibold outline-none transition-all shadow-sm"
                      value={formData.nama_kelas || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, nama_kelas: e.target.value })
                      }
                    />
                  </div>
                )}

                {modalType === "nilai" && (
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Hafalan
                      </label>
                      <input
                        type="number"
                        className="w-full p-2.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold outline-none focus:border-blue-500"
                        value={formData.hafalan || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, hafalan: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Catatan
                      </label>
                      <input
                        type="number"
                        className="w-full p-2.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold outline-none focus:border-blue-500"
                        value={formData.catatan || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, catatan: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Ulangan
                      </label>
                      <input
                        type="number"
                        className="w-full p-2.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold outline-none focus:border-blue-500"
                        value={formData.ulangan || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, ulangan: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Ujian
                      </label>
                      <input
                        type="number"
                        className="w-full p-2.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold outline-none focus:border-blue-500"
                        value={formData.ujian || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, ujian: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Keterangan Opsional
                      </label>
                      <textarea
                        rows="2"
                        placeholder="Catatan guru..."
                        className="w-full p-2.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold outline-none focus:border-blue-500"
                        value={formData.keterangan || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            keterangan: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {modalType === "keuangan" && (
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Infaq
                      </label>
                      <input
                        type="number"
                        className="w-full p-2.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold outline-none focus:border-amber-500"
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
                    </div>
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Daftar Ulang
                      </label>
                      <input
                        type="number"
                        className="w-full p-2.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold outline-none focus:border-amber-500"
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
                    </div>
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Konsumsi
                      </label>
                      <input
                        type="number"
                        className="w-full p-2.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold outline-none focus:border-amber-500"
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
                    </div>
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Makan Siang
                      </label>
                      <input
                        type="number"
                        className="w-full p-2.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold outline-none focus:border-amber-500"
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
                    </div>

                    <div className="col-span-2 grid grid-cols-2 gap-3 md:gap-4 mt-1 p-2 md:p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                      <div>
                        <label className="block text-[9px] md:text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1.5">
                          Metode
                        </label>
                        <select
                          className="w-full p-2 md:p-2.5 bg-white border border-amber-200 rounded-lg text-[10px] md:text-xs font-bold outline-none text-slate-700"
                          value={formData.metode || "Cash"}
                          onChange={(e) =>
                            setFormData({ ...formData, metode: e.target.value })
                          }
                        >
                          <option value="Cash">Tunai (Cash)</option>
                          <option value="Transfer">Transfer Bank</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] md:text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1.5">
                          Status Lunas
                        </label>
                        <select
                          className="w-full p-2 md:p-2.5 bg-white border border-amber-200 rounded-lg text-[10px] md:text-xs font-bold outline-none text-slate-700"
                          value={formData.status || "Belum"}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                          }
                        >
                          <option value="Belum">Belum Bayar</option>
                          <option value="Sudah">Sudah Lunas</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 md:py-4 mt-4 md:mt-6 rounded-xl text-white bg-gradient-to-r from-teal-500 to-emerald-600 shadow-[0_10px_20px_rgba(20,184,166,0.3)] hover:shadow-[0_15px_30px_rgba(20,184,166,0.4)] hover:-translate-y-1 flex justify-center items-center gap-2 font-black text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300"
                >
                  <Save size={16} /> Simpan Data
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL KWITANSI KOMPAK --- */}
        {modalType === "kwitansi" && activeSiswa && (
          /* Tambahkan id modal-kwitansi agar CSS bisa mendeteksi modal ini aktif */
          <div
            id="modal-container-kwitansi"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-300 print:p-0 print:bg-white print:static print:block"
          >
            <div className="absolute top-4 right-4 flex flex-wrap gap-2 no-print z-50 justify-end">
              <button
                onClick={handleDownloadImage}
                disabled={isCapturing}
                className="px-3 py-2 md:px-4 md:py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold tracking-widest uppercase rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] shadow-[0_8px_20px_rgba(59,130,246,0.3)] disabled:opacity-70 transition-all hover:-translate-y-0.5"
              >
                <Camera size={14} className="md:w-4 md:h-4" />{" "}
                {isCapturing ? "Proses..." : "Simpan Gambar"}
              </button>

              <button
                onClick={() => window.print()}
                className="px-3 py-2 md:px-4 md:py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold tracking-widest uppercase rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] shadow-[0_8px_20px_rgba(20,184,166,0.3)] transition-all hover:-translate-y-0.5"
              >
                <Printer size={14} className="md:w-4 md:h-4" /> Cetak & PDF
              </button>

              <button
                onClick={closeModal}
                className="p-1.5 md:p-2 bg-white/10 text-white hover:bg-rose-500 border border-white/20 rounded-lg md:rounded-xl shadow-lg transition-all"
              >
                <X size={18} className="md:w-5 md:h-5" />
              </button>
            </div>

            {/* AREA KERTAS KWITANSI (Diperkecil max-w-sm agar pas) */}
            <div
              id="kwitansi-print-area"
              className="w-full max-w-sm md:max-w-md print:max-w-full print:w-full bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] print:shadow-none p-5 md:p-6 print:p-8 relative print-mode mt-16 md:mt-0 print:mt-0 mx-auto"
            >
              {/* WATERMARK LUNAS / BELUM */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                <span
                  className={`text-[4rem] md:text-[6rem] font-black uppercase tracking-widest -rotate-[35deg] opacity-[0.04] select-none
                  ${keuanganData[activeSiswa.id]?.status === "Sudah" ? "text-teal-900" : "text-amber-900"}`}
                >
                  {keuanganData[activeSiswa.id]?.status === "Sudah"
                    ? "LUNAS"
                    : "BELUM"}
                </span>
              </div>

              {/* KONTEN KWITANSI */}
              <div className="relative z-10">
                <div className="flex justify-between items-center border-b-2 border-slate-800 pb-3 mb-4 bg-white/50">
                  <div className="flex items-center gap-2.5 md:gap-3">
                    <img
                      src="/logo.svg"
                      alt="Logo Nina"
                      className="w-10 h-10 md:w-12 md:h-12 object-contain"
                    />
                    <div>
                      <h1 className="text-sm md:text-lg text-[#000080] uppercase font-bismillah tracking-widest leading-tight">
                        Nina Rahell Project
                      </h1>
                      <p className="text-[7px] md:text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">
                        Manajemen Akademik
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-sm md:text-xl text-slate-300 uppercase font-black tracking-widest leading-tight">
                      Kwitansi
                    </h2>
                    <p className="text-[8px] md:text-[10px] font-bold text-slate-700 mt-1 uppercase tracking-widest bg-slate-100 inline-block px-1.5 py-0.5 rounded-sm">
                      No: {getNomorKwitansi(activeSiswa.id)}
                    </p>
                  </div>
                </div>

                {/* DETAIL PENERIMA */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 text-[9px] md:text-[11px]">
                  <table className="w-full text-left text-slate-800">
                    <tbody>
                      <tr>
                        <td className="font-bold py-1 w-20 text-slate-500 uppercase tracking-widest">
                          Nama
                        </td>
                        <td className="py-1 w-2 font-black text-slate-400">
                          :
                        </td>
                        <td className="py-1 font-bold text-[10px] md:text-[12px] text-slate-800">
                          {activeSiswa.nama}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold py-1 text-slate-500 uppercase tracking-widest">
                          Kategori
                        </td>
                        <td className="py-1 w-2 font-black text-slate-400">
                          :
                        </td>
                        <td className="py-1 font-bold text-slate-800">
                          {activeSiswa.kelas}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold py-1 text-slate-500 uppercase tracking-widest">
                          Metode
                        </td>
                        <td className="py-1 w-2 font-black text-slate-400">
                          :
                        </td>
                        <td className="py-1 font-bold flex items-center gap-1.5 text-slate-800">
                          {keuanganData[activeSiswa.id]?.metode || "Cash"}
                          <span
                            className={`px-1.5 py-0.5 rounded-sm text-[7px] md:text-[8px] uppercase tracking-widest ${keuanganData[activeSiswa.id]?.status === "Sudah" ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"}`}
                          >
                            {keuanganData[activeSiswa.id]?.status === "Sudah"
                              ? "Lunas"
                              : "Belum Selesai"}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* TABEL RINCIAN BIAYA */}
                <table className="w-full border-2 border-slate-300 text-[9px] md:text-[10px] mb-6 bg-white overflow-hidden rounded-md">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-1.5 md:p-2 border-r border-b border-slate-300 text-slate-700 font-black uppercase tracking-widest">
                        Rincian Pembayaran
                      </th>
                      <th className="p-1.5 md:p-2 border-b border-slate-300 text-right text-slate-700 w-24 md:w-32 font-black uppercase tracking-widest">
                        Nominal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    <tr>
                      <td className="p-1.5 md:p-2 border-r border-slate-300 font-semibold text-slate-600">
                        Infaq Pendidikan
                      </td>
                      <td className="p-1.5 md:p-2 text-right font-black text-slate-800">
                        {formatRp(keuanganData[activeSiswa.id]?.infaq)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1.5 md:p-2 border-r border-slate-300 font-semibold text-slate-600">
                        Cicilan Daftar Ulang
                      </td>
                      <td className="p-1.5 md:p-2 text-right font-black text-slate-800">
                        {formatRp(keuanganData[activeSiswa.id]?.cicilan)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1.5 md:p-2 border-r border-slate-300 font-semibold text-slate-600">
                        Biaya Konsumsi
                      </td>
                      <td className="p-1.5 md:p-2 text-right font-black text-slate-800">
                        {formatRp(keuanganData[activeSiswa.id]?.konsumsi)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1.5 md:p-2 border-r border-slate-300 font-semibold text-slate-600">
                        Makan Siang
                      </td>
                      <td className="p-1.5 md:p-2 text-right font-black text-slate-800">
                        {formatRp(keuanganData[activeSiswa.id]?.makan)}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-800 text-white">
                    <tr>
                      <td className="p-2 md:p-2.5 border-r border-slate-700 text-right uppercase tracking-widest text-[8px] md:text-[9px] font-black">
                        Total Pembayaran
                      </td>
                      <td className="p-2 md:p-2.5 text-right text-[11px] md:text-[13px] font-black text-teal-300">
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

                {/* TANDA TANGAN */}
                <div className="flex justify-end pr-2 md:pr-4 text-center">
                  <div className="flex flex-col items-center">
                    <p className="mb-0 text-[8px] md:text-[9px] uppercase text-slate-500 font-black tracking-[0.2em]">
                      Penerima
                    </p>
                    <div className="w-24 h-12 md:w-32 md:h-16 flex items-center justify-center overflow-hidden my-0.5">
                      <img
                        src="/assets/ttd.svg"
                        alt="Tanda Tangan"
                        className="w-full h-full object-cover scale-90 mix-blend-multiply"
                      />
                    </div>
                    <p className="border-b-[1.5px] border-slate-800 pb-0.5 text-slate-800 font-black text-[9px] md:text-[11px] tracking-wide">
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
