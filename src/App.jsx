import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Users,
  FileSignature,
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
    if (String(val).trim() !== String(value || "").trim()) {
      onSave(type === "number" ? parseFloat(val) || 0 : val);
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
  const [activeTab, setActiveTab] = useState("home");
  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE DATA ---
  const [kelasOptions, setKelasOptions] = useState([]);
  const [siswaData, setSiswaData] = useState([]);
  const [nilaiData, setNilaiData] = useState({});
  const [keuanganData, setKeuanganData] = useState({});

  // --- MODAL STATE ---
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeSiswa, setActiveSiswa] = useState(null);

  // --- FETCH DATA DARI SUPABASE ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Ambil Kelas
      const { data: dKelas } = await supabase
        .from("kelas")
        .select("nama_kelas");
      if (dKelas) setKelasOptions(dKelas.map((k) => k.nama_kelas));

      // 2. Ambil Siswa
      const { data: dSiswa } = await supabase.from("siswa").select("*");
      if (dSiswa) setSiswaData(dSiswa);

      // 3. Ambil Nilai
      const { data: dNilai } = await supabase.from("nilai").select("*");
      if (dNilai) {
        const nData = {};
        dNilai.forEach((n) => (nData[n.siswa_id] = n));
        setNilaiData(nData);
      }

      // 4. Ambil Keuangan
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

  // --- HANDLERS INLINE EDIT (LANGSUNG TEMBAK KE DATABASE) ---
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

    // Upsert (Update jika ada, Insert jika belum ada)
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

  // --- HANDLERS MODAL ---
  const openSiswaModal = (siswa = null) => {
    setFormData(
      siswa || {
        id: Date.now().toString(),
        nama: "",
        kelas: kelasOptions[0] || "",
      },
    );
    setModalType("siswa");
  };

  const openKelasModal = () => {
    setFormData({ nama_kelas: "" });
    setModalType("kelas");
  };

  const openNilaiModal = (siswa) => {
    const exist = nilaiData[siswa.id] || {};
    setActiveSiswa(siswa);
    setFormData({ ...exist });
    setModalType("nilai");
  };

  const openKeuanganModal = (siswa) => {
    const exist = keuanganData[siswa.id] || { metode: "Cash", status: "Belum" };
    setActiveSiswa(siswa);
    setFormData({ ...exist });
    setModalType("keuangan");
  };

  const openKwitansi = (siswa) => {
    setActiveSiswa(siswa);
    setModalType("kwitansi");
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
      alert("Terjadi kesalahan saat menyimpan data ke server.");
    }

    setModalType(null);
  };

  const handleDeleteSiswa = async (id) => {
    if (
      window.confirm(
        "Yakin ingin menghapus data siswa ini? Semua nilai & keuangan akan otomatis terhapus dari database.",
      )
    ) {
      // Optimistic hapus dari UI
      setSiswaData(siswaData.filter((s) => s.id !== id));

      // Hapus dari Database (karena ada ON DELETE CASCADE, nilai & keuangan akan ikut terhapus otomatis)
      await supabase.from("siswa").delete().eq("id", id);
    }
  };

  const getNomorKwitansi = (siswaId) => {
    const index = siswaData.findIndex((s) => s.id === siswaId);
    return index !== -1 ? index + 1 : 1;
  };

  // --- FILTER & CALCULATIONS ---
  const filteredSiswa = useMemo(() => {
    return siswaData.filter((s) => {
      const matchSearch = s.nama?.toLowerCase().includes(search.toLowerCase());
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
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-teal-600 flex-col gap-3">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        <p className="font-bold text-sm">Menyinkronkan dengan Database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-teal-200 pb-16 md:pb-0">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cantora+One&display=swap');
        
        @font-face {
          font-family: 'Bismillah Script';
          src: url('/assets/fonts/BismillahScript.ttf') format('truetype');
          font-weight: normal; font-style: normal;
        }

        * { font-family: 'Cantora One', sans-serif; }
        .font-bismillah { font-family: 'Bismillah Script', cursive; }

        @media print {
          body * { visibility: hidden !important; }
          .print-mode, .print-mode * { visibility: visible !important; }
          .print-mode { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          @page { size: auto; margin: 15mm; }
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
              onClick={() => setActiveTab("home")}
            >
              <div className="bg-teal-50 border border-teal-100 p-1.5 md:p-2 rounded-lg md:rounded-xl">
                <FileSignature className="w-4 h-4 md:w-5 md:h-5 text-teal-600" />
              </div>
              <span className="font-bismillah text-2xl md:text-3xl text-[#000080] drop-shadow-sm pt-2">
                Nina's Project
              </span>
            </div>

            <div className="hidden md:flex space-x-1">
              {["home", "siswa", "nilai", "keuangan"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
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
            onClick={() => setActiveTab(tab)}
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
            {/* Card Kas */}
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

            {/* Menu Cepat */}
            <div>
              <h3 className="text-xs text-slate-500 uppercase tracking-widest mb-2.5 px-1">
                Menu Cepat
              </h3>
              <div className="grid grid-cols-4 gap-3 max-w-md md:max-w-2xl mx-auto md:mx-0">
                <button
                  onClick={() => {
                    setActiveTab("siswa");
                    openSiswaModal();
                  }}
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
                  onClick={() => setActiveTab("keuangan")}
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
                  onClick={() => setActiveTab("nilai")}
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
                  onClick={() => setActiveTab("keuangan")}
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

            {/* Pendaftar Terbaru */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs text-slate-800 uppercase tracking-wide">
                  Siswa Terdaftar Baru
                </h3>
                <button
                  onClick={() => setActiveTab("siswa")}
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
                          {s.nama.charAt(0).toUpperCase()}
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
                          onClick={() => {
                            setActiveTab("keuangan");
                            openKeuanganModal(s);
                          }}
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
                      onClick={openKelasModal}
                      className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[11px] flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Kelas
                    </button>
                    <button
                      onClick={() => openSiswaModal()}
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
            {/* Tampilan Desktop */}
            <div className="hidden md:block overflow-x-auto">
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
                          onSave={(val) => handleInlineSiswa(s.id, "nama", val)}
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
                          onClick={() => openSiswaModal(s)}
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
            {/* Tampilan Mobile */}
            <div className="md:hidden space-y-2.5 p-3">
              {filteredSiswa.map((s, idx) => (
                <div
                  key={s.id}
                  className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-800 text-xs">{s.nama}</h3>
                    <span className="inline-block bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded text-[9px] uppercase">
                      {s.kelas}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => openSiswaModal(s)}
                      className="p-1.5 text-blue-500 bg-blue-50 rounded-lg"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteSiswa(s.id)}
                      className="p-1.5 text-rose-500 bg-rose-50 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: REKAP NILAI */}
        {activeTab === "nilai" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print-mode">
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-3 text-slate-500 sticky left-0 bg-slate-50 text-center text-xs uppercase z-10">
                      No
                    </th>
                    <th className="px-3 py-3 text-slate-500 sticky left-10 bg-slate-50 text-xs uppercase z-10 shadow-sm">
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

            {/* Tampilan Mobile Nilai */}
            <div className="md:hidden space-y-2.5 p-3 no-print">
              {filteredSiswa.map((s, idx) => {
                const n = nilaiData[s.id] || {};
                return (
                  <div
                    key={s.id}
                    className="bg-white p-3.5 rounded-xl border border-slate-100"
                  >
                    <div className="flex justify-between items-start mb-2.5 border-b pb-2.5">
                      <div>
                        <h3 className="text-slate-800 text-xs">{s.nama}</h3>
                        <p className="text-[9px] text-slate-400 uppercase">
                          {s.kelas}
                        </p>
                      </div>
                      <button
                        onClick={() => openNilaiModal(s)}
                        className="px-2.5 py-1 bg-teal-50 text-teal-600 rounded-md text-[10px]"
                      >
                        Input
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 mb-2.5 text-center">
                      <div className="bg-slate-50 p-1.5 rounded-lg">
                        <p className="text-[8px] text-slate-400 uppercase">
                          Hafal
                        </p>
                        <p className="text-slate-700 text-xs">
                          {n.hafalan || "-"}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg">
                        <p className="text-[8px] text-slate-400 uppercase">
                          Catat
                        </p>
                        <p className="text-slate-700 text-xs">
                          {n.catatan || "-"}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg">
                        <p className="text-[8px] text-slate-400 uppercase">
                          UH
                        </p>
                        <p className="text-slate-700 text-xs">
                          {n.ulangan || "-"}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg">
                        <p className="text-[8px] text-slate-400 uppercase">
                          Ujian
                        </p>
                        <p className="text-slate-700 text-xs">
                          {n.ujian || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: KEUANGAN */}
        {activeTab === "keuangan" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-3 text-slate-500 sticky left-0 bg-slate-50 z-10 text-center text-xs uppercase">
                      No
                    </th>
                    <th className="px-3 py-3 text-slate-500 sticky left-10 bg-slate-50 z-10 shadow-sm text-xs uppercase">
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
                        <td className="px-3 py-2.5 text-slate-800 sticky left-10 bg-white text-xs">
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
                            onClick={() => openKwitansi(s)}
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

            {/* Tampilan Mobile Keuangan */}
            <div className="md:hidden p-3 space-y-2.5">
              {filteredSiswa.map((s) => {
                const k = keuanganData[s.id] || {};
                const total =
                  (Number(k.infaq) || 0) +
                  (Number(k.cicilan) || 0) +
                  (Number(k.konsumsi) || 0) +
                  (Number(k.makan) || 0);
                return (
                  <div
                    key={s.id}
                    className="bg-white p-3.5 rounded-xl border border-slate-100 relative overflow-hidden"
                  >
                    <div
                      className={`absolute top-0 right-0 px-2 py-0.5 text-[8px] uppercase rounded-bl-lg ${k.status === "Sudah" ? "bg-teal-500 text-white" : "bg-amber-400 text-amber-900"}`}
                    >
                      {k.status === "Sudah" ? "Lunas" : "Belum Selesai"}
                    </div>
                    <div className="flex gap-2.5 mb-3 mt-1">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex justify-center items-center text-slate-500">
                        <CreditCard size={16} />
                      </div>
                      <div>
                        <h3 className="text-slate-800 text-xs">{s.nama}</h3>
                        <p className="text-[9px] text-slate-400 uppercase">
                          {s.kelas}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] text-slate-400 uppercase">
                        Total Bayar
                      </span>
                      <span className="text-base text-teal-600">
                        {formatRp(total)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openKeuanganModal(s)}
                        className="py-2 bg-slate-100 rounded-lg text-[10px] flex justify-center items-center gap-1.5"
                      >
                        <Edit size={14} /> Edit Data
                      </button>
                      <button
                        onClick={() => openKwitansi(s)}
                        className="py-2 bg-teal-600 text-white rounded-lg text-[10px] flex justify-center items-center gap-1.5"
                      >
                        <ReceiptText size={14} /> Kwitansi
                      </button>
                    </div>
                  </div>
                );
              })}
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
                onClick={() => setModalType(null)}
                className="p-1.5 bg-slate-50 text-slate-400 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveData} className="space-y-3.5">
              {/* Form Siswa */}
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

              {/* Form Kelas */}
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

              {/* Form Nilai & Keuangan menggunakan input number sederhana */}
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
                  />
                  <input
                    type="number"
                    placeholder="Daftar Ulang"
                    className="w-full p-3 bg-slate-50 rounded-xl text-xs"
                    value={formData.cicilan || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, cicilan: e.target.value })
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
                  />
                  <input
                    type="number"
                    placeholder="Makan"
                    className="w-full p-3 bg-slate-50 rounded-xl text-xs"
                    value={formData.makan || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, makan: e.target.value })
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 p-4">
          <div className="absolute top-4 right-4 flex gap-2 no-print">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-teal-500 text-white rounded-lg flex items-center gap-1.5 text-xs"
            >
              <Printer size={14} /> Print PDF
            </button>
            <button
              onClick={() => setModalType(null)}
              className="p-1.5 bg-slate-800 text-white rounded-lg"
            >
              <X size={16} />
            </button>
          </div>
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-5 relative print-mode">
            <div className="flex justify-between items-start border-b-[2px] border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 border border-teal-600 rounded-lg flex items-center justify-center">
                  <FileSignature size={20} className="text-teal-600" />
                </div>
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
                <h2 className="text-lg text-slate-200 uppercase">Kwitansi</h2>
                <p className="text-xs text-slate-600">
                  No: {getNomorKwitansi(activeSiswa.id)}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 text-[10px]">
              <p>
                <b>Terima Dari:</b> {activeSiswa.nama}
              </p>
              <p>
                <b>Kategori:</b> {activeSiswa.kelas}
              </p>
              <p>
                <b>Metode:</b> {keuanganData[activeSiswa.id]?.metode || "Cash"}{" "}
                (
                {keuanganData[activeSiswa.id]?.status === "Sudah"
                  ? "Lunas"
                  : "Belum"}
                )
              </p>
            </div>

            <table className="w-full border border-slate-300 text-[10px] mb-4">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-1.5 border-r border-slate-300">Rincian</th>
                  <th className="p-1.5 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                <tr>
                  <td className="p-1.5 border-r border-slate-300">
                    Infaq Pendidikan
                  </td>
                  <td className="p-1.5 text-right">
                    {formatRp(keuanganData[activeSiswa.id]?.infaq)}
                  </td>
                </tr>
                <tr>
                  <td className="p-1.5 border-r border-slate-300">
                    Cicilan Daftar Ulang
                  </td>
                  <td className="p-1.5 text-right">
                    {formatRp(keuanganData[activeSiswa.id]?.cicilan)}
                  </td>
                </tr>
                <tr>
                  <td className="p-1.5 border-r border-slate-300">
                    Biaya Konsumsi
                  </td>
                  <td className="p-1.5 text-right">
                    {formatRp(keuanganData[activeSiswa.id]?.konsumsi)}
                  </td>
                </tr>
                <tr>
                  <td className="p-1.5 border-r border-slate-300">
                    Makan Siang
                  </td>
                  <td className="p-1.5 text-right">
                    {formatRp(keuanganData[activeSiswa.id]?.makan)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-end pr-2 text-center text-[9px]">
              <div>
                <p className="mb-0.5 uppercase text-slate-500">Penerima</p>
                <img
                  src="/assets/ttd.svg"
                  alt="Tanda Tangan"
                  className="w-24 h-12 object-contain mx-auto mix-blend-multiply"
                />
                <p className="underline mt-1 text-slate-800">
                  Nina Rahilah S.Pd.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
