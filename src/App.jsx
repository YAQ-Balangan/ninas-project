import React, { useState, useEffect, useMemo } from "react";
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

// --- UTILS: Format Rupiah ---
const formatRp = (angka) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka || 0);
};

// --- UTILS: Export to CSV (Excel) ---
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
// KOMPONEN INLINE EDIT (KLIK LANGSUNG DI TABEL)
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
          className="w-full p-1 border-2 border-teal-500 rounded outline-none text-xs text-teal-900 bg-teal-50 font-bold shadow-sm min-w-[90px]"
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
        className="w-full p-1 border-2 border-teal-500 rounded outline-none text-xs text-teal-900 bg-teal-50 font-bold shadow-sm min-w-[70px]"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={triggerSave}
        onKeyDown={(e) => e.key === "Enter" && triggerSave()}
        placeholder={placeholder}
      />
    );
  }

  // Display Render
  let displayValue = value;
  if (isCurrency && value) displayValue = formatRp(value);

  if (type === "select" && value === "Sudah") {
    displayValue = (
      <span className="text-teal-600 flex items-center gap-1 font-bold text-[11px]">
        <CheckCircle2 size={12} /> Lunas
      </span>
    );
  } else if (type === "select" && value === "Belum") {
    displayValue = (
      <span className="text-amber-500 flex items-center gap-1 font-bold text-[11px]">
        <AlertCircle size={12} /> Belum
      </span>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="w-full min-h-[24px] cursor-text hover:bg-teal-50 hover:ring-1 hover:ring-teal-200 rounded px-1 flex items-center transition-colors text-slate-700 text-xs md:text-sm"
      title="Klik untuk mengubah"
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

  // --- STATE DATA (Local Storage) ---
  const [kelasOptions, setKelasOptions] = useState(() => {
    const saved = localStorage.getItem("nina_kelas");
    return saved
      ? JSON.parse(saved)
      : ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6"];
  });

  const [siswaData, setSiswaData] = useState(() => {
    const saved = localStorage.getItem("nina_siswa");
    return saved ? JSON.parse(saved) : [];
  });

  const [nilaiData, setNilaiData] = useState(() => {
    const saved = localStorage.getItem("nina_nilai");
    return saved ? JSON.parse(saved) : {};
  });

  const [keuanganData, setKeuanganData] = useState(() => {
    const saved = localStorage.getItem("nina_keuangan");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("nina_kelas", JSON.stringify(kelasOptions));
  }, [kelasOptions]);
  useEffect(() => {
    localStorage.setItem("nina_siswa", JSON.stringify(siswaData));
  }, [siswaData]);
  useEffect(() => {
    localStorage.setItem("nina_nilai", JSON.stringify(nilaiData));
  }, [nilaiData]);
  useEffect(() => {
    localStorage.setItem("nina_keuangan", JSON.stringify(keuanganData));
  }, [keuanganData]);

  // --- STATE MODAL ---
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeSiswa, setActiveSiswa] = useState(null);

  // --- HANDLERS INLINE EDIT ---
  const handleInlineSiswa = (id, key, val) => {
    setSiswaData((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [key]: val } : s)),
    );
  };

  const handleInlineNilai = (siswaId, key, val) => {
    setNilaiData((prev) => {
      const exist = prev[siswaId] || {
        hafalan: "",
        catatan: "",
        ulangan: "",
        ujian: "",
        keterangan: "",
      };
      return { ...prev, [siswaId]: { ...exist, [key]: val } };
    });
  };

  const handleInlineKeuangan = (siswaId, key, val) => {
    setKeuanganData((prev) => {
      const exist = prev[siswaId] || {
        infaq: 0,
        cicilan: 0,
        konsumsi: 0,
        makan: 0,
        metode: "Cash",
        status: "Belum",
      };
      return { ...prev, [siswaId]: { ...exist, [key]: val } };
    });
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
    const exist = nilaiData[siswa.id] || {
      hafalan: "",
      catatan: "",
      ulangan: "",
      ujian: "",
      keterangan: "",
    };
    setActiveSiswa(siswa);
    setFormData({ ...exist });
    setModalType("nilai");
  };

  const openKeuanganModal = (siswa) => {
    const exist = keuanganData[siswa.id] || {
      infaq: 0,
      cicilan: 0,
      konsumsi: 0,
      makan: 0,
      metode: "Cash",
      status: "Belum",
    };
    setActiveSiswa(siswa);
    setFormData({ ...exist });
    setModalType("keuangan");
  };

  const openKwitansi = (siswa) => {
    setActiveSiswa(siswa);
    setModalType("kwitansi");
  };

  const handleSaveData = (e) => {
    e.preventDefault();
    if (modalType === "kelas") {
      if (formData.nama_kelas && !kelasOptions.includes(formData.nama_kelas)) {
        setKelasOptions([...kelasOptions, formData.nama_kelas]);
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
    } else if (modalType === "nilai") {
      setNilaiData({ ...nilaiData, [activeSiswa.id]: formData });
    } else if (modalType === "keuangan") {
      setKeuanganData({ ...keuanganData, [activeSiswa.id]: formData });
    }
    setModalType(null);
  };

  const handleDeleteSiswa = (id) => {
    if (
      window.confirm(
        "Yakin ingin menghapus data siswa ini? Semua nilai & keuangan akan terhapus.",
      )
    ) {
      setSiswaData(siswaData.filter((s) => s.id !== id));
      const newNilai = { ...nilaiData };
      delete newNilai[id];
      setNilaiData(newNilai);
      const newKeu = { ...keuanganData };
      delete newKeu[id];
      setKeuanganData(newKeu);
    }
  };

  // --- GET NOMOR KWITANSI TERSTRUKTUR (ANGKA 1, 2, 3...) ---
  const getNomorKwitansi = (siswaId) => {
    const index = siswaData.findIndex((s) => s.id === siswaId);
    return index !== -1 ? index + 1 : 1;
  };

  // --- FILTER & CALCULATIONS ---
  const filteredSiswa = useMemo(() => {
    return siswaData.filter((s) => {
      const matchSearch = s.nama.toLowerCase().includes(search.toLowerCase());
      const matchKelas = filterKelas ? s.kelas === filterKelas : true;
      return matchSearch && matchKelas;
    });
  }, [siswaData, search, filterKelas]);

  const { grandTotalKeuangan, totalCash, totalTransfer } = useMemo(() => {
    let total = 0;
    let cash = 0;
    let tf = 0;
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

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-800 selection:bg-teal-200 pb-16 md:pb-0"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* CSS KHUSUS UNTUK FONT & PRINT (PDF) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Montserrat', sans-serif;
        }

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
              <span className="font-black text-base md:text-xl text-[#000080] tracking-[0.2em] uppercase drop-shadow-sm">
                Nina's Project
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-1">
              <button
                onClick={() => setActiveTab("home")}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all text-sm ${activeTab === "home" ? "bg-teal-50 text-teal-700 shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <Home size={16} /> Beranda
              </button>
              <button
                onClick={() => setActiveTab("siswa")}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all text-sm ${activeTab === "siswa" ? "bg-teal-50 text-teal-700 shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <Users size={16} /> Data Siswa
              </button>
              <button
                onClick={() => setActiveTab("nilai")}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all text-sm ${activeTab === "nilai" ? "bg-teal-50 text-teal-700 shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <GraduationCap size={16} /> Rekap Nilai
              </button>
              <button
                onClick={() => setActiveTab("keuangan")}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all text-sm ${activeTab === "keuangan" ? "bg-teal-50 text-teal-700 shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <Wallet size={16} /> Keuangan
              </button>
            </div>

            {/* Mobile Header Profile (Pengaturan) */}
            <div className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 cursor-pointer active:scale-95 transition-transform text-slate-600">
                <Settings className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* --- BOTTOM NAVIGATION BAR --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center pt-1.5 pb-1.5 z-40 px-1 no-print shadow-[0_-4px_15px_rgba(0,0,0,0.03)]">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center p-1.5 rounded-lg min-w-[60px] ${activeTab === "home" ? "text-teal-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          <div
            className={`${activeTab === "home" ? "bg-teal-50 p-1 rounded-md mb-0.5" : "mb-1"}`}
          >
            <Home
              size={20}
              className={activeTab === "home" ? "fill-teal-100" : ""}
            />
          </div>
          <span className="text-[9px] font-bold">Beranda</span>
        </button>
        <button
          onClick={() => setActiveTab("siswa")}
          className={`flex flex-col items-center p-1.5 rounded-lg min-w-[60px] ${activeTab === "siswa" ? "text-teal-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          <div
            className={`${activeTab === "siswa" ? "bg-teal-50 p-1 rounded-md mb-0.5" : "mb-1"}`}
          >
            <Users
              size={20}
              className={activeTab === "siswa" ? "fill-teal-100" : ""}
            />
          </div>
          <span className="text-[9px] font-bold">Siswa</span>
        </button>
        <button
          onClick={() => setActiveTab("nilai")}
          className={`flex flex-col items-center p-1.5 rounded-lg min-w-[60px] ${activeTab === "nilai" ? "text-teal-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          <div
            className={`${activeTab === "nilai" ? "bg-teal-50 p-1 rounded-md mb-0.5" : "mb-1"}`}
          >
            <GraduationCap
              size={20}
              className={activeTab === "nilai" ? "fill-teal-100" : ""}
            />
          </div>
          <span className="text-[9px] font-bold">Nilai</span>
        </button>
        <button
          onClick={() => setActiveTab("keuangan")}
          className={`flex flex-col items-center p-1.5 rounded-lg min-w-[60px] ${activeTab === "keuangan" ? "text-teal-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          <div
            className={`${activeTab === "keuangan" ? "bg-teal-50 p-1 rounded-md mb-0.5" : "mb-1"}`}
          >
            <Wallet
              size={20}
              className={activeTab === "keuangan" ? "fill-teal-100" : ""}
            />
          </div>
          <span className="text-[9px] font-bold">Keuangan</span>
        </button>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-6 no-print">
        {/* =========================================
            TAB 1: BERANDA / DASHBOARD
        ========================================= */}
        {activeTab === "home" && (
          <div className="space-y-4 md:space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Card Saldo / Total Kas */}
            <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl p-4 md:p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                {/* Total Keseluruhan */}
                <div>
                  <p className="text-teal-100 text-xs font-semibold mb-0.5 flex items-center gap-1.5">
                    <TrendingUp size={14} /> Grand Total Dana
                  </p>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-none">
                    {formatRp(grandTotalKeuangan)}
                  </h2>
                </div>

                {/* Rincian Cash & Transfer */}
                <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
                  <div className="bg-white/10 p-3 rounded-xl border border-white/20 backdrop-blur-sm text-center md:text-left min-w-[120px]">
                    <p className="text-teal-100 text-[9px] md:text-[10px] uppercase tracking-widest font-bold mb-0.5">
                      Total Cash
                    </p>
                    <p className="font-bold text-base md:text-lg text-white leading-tight">
                      {formatRp(totalCash)}
                    </p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl border border-white/20 backdrop-blur-sm text-center md:text-left min-w-[120px]">
                    <p className="text-teal-100 text-[9px] md:text-[10px] uppercase tracking-widest font-bold mb-0.5">
                      Total Transfer
                    </p>
                    <p className="font-bold text-base md:text-lg text-white leading-tight">
                      {formatRp(totalTransfer)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistik Siswa & Kelas */}
              <div className="flex gap-4 border-t border-teal-400/30 pt-3 mt-4">
                <div>
                  <p className="text-teal-100 text-[9px] uppercase tracking-widest font-bold mb-0.5">
                    Jumlah Anak
                  </p>
                  <p className="font-bold text-sm md:text-base leading-none">
                    {siswaData.length} Siswa
                  </p>
                </div>
                <div>
                  <p className="text-teal-100 text-[9px] uppercase tracking-widest font-bold mb-0.5">
                    Total Kelas
                  </p>
                  <p className="font-bold text-sm md:text-base leading-none">
                    {kelasOptions.length} Kategori
                  </p>
                </div>
              </div>
            </div>

            {/* Grid Menu Ala m-Banking */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5 px-1">
                Menu Cepat
              </h3>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2.5">
                <button
                  onClick={() => {
                    setActiveTab("siswa");
                    openSiswaModal();
                  }}
                  className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                >
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-teal-600">
                    <UserPlus size={24} />
                  </div>
                  <span className="text-[9px] md:text-[10px] font-bold text-slate-600 text-center leading-tight">
                    Siswa
                    <br />
                    Baru
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("keuangan")}
                  className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                >
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-amber-500">
                    <Banknote size={24} />
                  </div>
                  <span className="text-[9px] md:text-[10px] font-bold text-slate-600 text-center leading-tight">
                    Input
                    <br />
                    Uang
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("nilai")}
                  className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                >
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-500">
                    <FileText size={24} />
                  </div>
                  <span className="text-[9px] md:text-[10px] font-bold text-slate-600 text-center leading-tight">
                    Input
                    <br />
                    Nilai
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("keuangan")}
                  className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                >
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-rose-500">
                    <ReceiptText size={24} />
                  </div>
                  <span className="text-[9px] md:text-[10px] font-bold text-slate-600 text-center leading-tight">
                    Cetak
                    <br />
                    Kwitansi
                  </span>
                </button>
              </div>
            </div>

            {/* List Pendaftar Terbaru */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Siswa Terdaftar Baru
                </h3>
                <button
                  onClick={() => setActiveTab("siswa")}
                  className="text-teal-600 text-[10px] font-bold hover:underline uppercase tracking-wider"
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
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-50 bg-slate-50/50"
                      >
                        <div className="w-9 h-9 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-sm">
                          {s.nama.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 truncate text-xs md:text-sm">
                            {s.nama}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {s.kelas}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab("keuangan");
                            openKeuanganModal(s);
                          }}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 text-teal-600 rounded-lg text-[10px] font-bold shadow-sm active:scale-95"
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

        {/* =========================================
            FILTER BAR (DITAMPILKAN JIKA BUKAN HOME)
        ========================================= */}
        {activeTab !== "home" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 md:p-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="flex gap-3 items-center">
                <div className="bg-teal-50 p-2.5 rounded-xl text-teal-600 shrink-0 border border-teal-100">
                  {activeTab === "siswa" && <Users size={20} />}
                  {activeTab === "nilai" && <FileText size={20} />}
                  {activeTab === "keuangan" && <Wallet size={20} />}
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold text-slate-800 capitalize leading-tight">
                    {activeTab === "siswa"
                      ? "Master Data Siswa"
                      : `Manajemen ${activeTab}`}
                  </h2>
                  <p className="text-[10px] md:text-xs text-slate-500 font-medium">
                    Total {filteredSiswa.length} data
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-40">
                  <Search
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={14}
                  />
                  <input
                    type="text"
                    placeholder="Cari nama..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 focus:bg-white transition-all font-medium"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-bold text-slate-700"
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
                      className="px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Kelas
                    </button>
                    <button
                      onClick={() => openSiswaModal()}
                      className="px-2.5 py-1.5 bg-teal-600 text-white hover:bg-teal-700 rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-md shadow-teal-600/30"
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
                    className="px-3 py-1.5 bg-slate-800 text-white hover:bg-slate-900 rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Download size={14} /> CSV
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            TAB 2: DATA SISWA
        ========================================= */}
        {activeTab === "siswa" && (
          <>
            {/* TAMPILAN MOBILE: KARTU */}
            <div className="md:hidden space-y-2.5">
              {filteredSiswa.length === 0 ? (
                <div className="text-center p-6 bg-white rounded-xl border border-slate-100">
                  <p className="text-slate-400 text-xs font-medium">
                    Tidak ada data siswa.
                  </p>
                </div>
              ) : (
                filteredSiswa.map((s, idx) => (
                  <div
                    key={s.id}
                    className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 text-xs">
                        {s.nama}
                      </h3>
                      <span className="inline-block mt-0.5 bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest">
                        {s.kelas}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => openSiswaModal(s)}
                        className="p-1.5 text-blue-500 bg-blue-50 rounded-lg active:scale-95"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteSiswa(s.id)}
                        className="p-1.5 text-rose-500 bg-rose-50 rounded-lg active:scale-95"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* TAMPILAN DESKTOP: TABEL DENGAN INLINE EDIT */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-500 w-12 text-center text-xs uppercase tracking-wide">
                      No
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wide">
                      Nama Lengkap
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wide w-48">
                      Kelas
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-500 text-center w-28 text-xs uppercase tracking-wide">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSiswa.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-4 py-6 text-center text-slate-400 text-sm"
                      >
                        Tidak ada data siswa.
                      </td>
                    </tr>
                  ) : (
                    filteredSiswa.map((s, idx) => (
                      <tr
                        key={s.id}
                        className="hover:bg-teal-50/40 transition-colors"
                      >
                        <td className="px-4 py-2.5 text-slate-500 font-semibold text-center text-xs">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-slate-800">
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
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => openSiswaModal(s)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit via Form"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteSiswa(s.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* =========================================
            TAB 3: REKAP NILAI (READY UNTUK PRINT PDF)
        ========================================= */}
        {activeTab === "nilai" && (
          <div>
            {/* TAMPILAN MOBILE: KARTU NILAI */}
            <div className="md:hidden space-y-2.5 no-print">
              {filteredSiswa.length === 0 ? (
                <div className="text-center p-6 bg-white rounded-xl border border-slate-100">
                  <p className="text-slate-400 text-xs font-medium">
                    Belum ada siswa.
                  </p>
                </div>
              ) : (
                filteredSiswa.map((s, idx) => {
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
                      className="bg-white p-3.5 rounded-xl shadow-sm border border-slate-100"
                    >
                      <div className="flex justify-between items-start mb-2.5 border-b border-slate-100 pb-2.5">
                        <div>
                          <h3 className="font-bold text-slate-800 text-xs">
                            {s.nama}
                          </h3>
                          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                            {s.kelas}
                          </p>
                        </div>
                        <button
                          onClick={() => openNilaiModal(s)}
                          className="px-2.5 py-1 bg-teal-50 text-teal-600 rounded-md text-[10px] font-bold border border-teal-100"
                        >
                          Input
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 mb-2.5 text-center">
                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                            Hafal
                          </p>
                          <p className="font-bold text-slate-700 text-xs mt-0.5">
                            {n.hafalan || "-"}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                            Catat
                          </p>
                          <p className="font-bold text-slate-700 text-xs mt-0.5">
                            {n.catatan || "-"}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                            UH
                          </p>
                          <p className="font-bold text-slate-700 text-xs mt-0.5">
                            {n.ulangan || "-"}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                            Ujian
                          </p>
                          <p className="font-bold text-slate-700 text-xs mt-0.5">
                            {n.ujian || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center bg-teal-600 text-white p-2 rounded-lg">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-teal-100">
                          Rata-rata
                        </span>
                        <span className="font-black text-sm">
                          {rata > 0 ? rata.toFixed(1) : "-"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* TAMPILAN DESKTOP: TABEL DENGAN INLINE EDIT */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print-mode">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-3 font-bold text-slate-500 sticky left-0 bg-slate-50 z-10 w-10 text-center text-xs uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-3 py-3 font-bold text-slate-500 sticky left-10 bg-slate-50 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.03)] text-xs uppercase tracking-wider">
                        Nama Siswa
                      </th>
                      <th className="px-3 py-3 font-bold text-slate-500 text-center w-20 text-xs uppercase tracking-wider">
                        Hafalan
                      </th>
                      <th className="px-3 py-3 font-bold text-slate-500 text-center w-20 text-xs uppercase tracking-wider">
                        Catatan
                      </th>
                      <th className="px-3 py-3 font-bold text-slate-500 text-center w-20 text-xs uppercase tracking-wider">
                        Ulangan
                      </th>
                      <th className="px-3 py-3 font-bold text-slate-500 text-center w-20 text-xs uppercase tracking-wider">
                        Ujian
                      </th>
                      <th className="px-3 py-3 font-black text-teal-600 bg-teal-50/50 text-center w-20 text-xs uppercase tracking-wider">
                        Rata-rata
                      </th>
                      <th className="px-3 py-3 font-bold text-slate-500 min-w-[150px] text-xs uppercase tracking-wider">
                        Keterangan
                      </th>
                      <th className="px-3 py-3 font-bold text-slate-500 text-center no-print w-16 text-xs uppercase tracking-wider">
                        Aksi
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
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-3 py-2.5 text-slate-500 sticky left-0 bg-white text-center font-semibold text-xs">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2.5 font-bold text-slate-800 sticky left-10 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.01)] text-xs md:text-sm">
                            {s.nama} <br />
                            <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">
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
                          <td className="px-3 py-2.5 font-black text-teal-700 bg-teal-50/30 text-center text-xs md:text-sm">
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
                          <td className="px-3 py-2.5 text-center no-print">
                            <button
                              onClick={() => openNilaiModal(s)}
                              className="p-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors"
                              title="Buka Form"
                            >
                              <Edit size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end no-print hidden md:flex">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-slate-900 active:scale-95 transition-transform"
                >
                  <Printer size={14} /> Print PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            TAB 4: KEUANGAN
        ========================================= */}
        {activeTab === "keuangan" && (
          <>
            {/* TAMPILAN MOBILE: KARTU KEUANGAN */}
            <div className="md:hidden space-y-2.5">
              {filteredSiswa.length === 0 ? (
                <div className="text-center p-6 bg-white rounded-xl border border-slate-100">
                  <p className="text-slate-400 text-xs font-medium">
                    Belum ada siswa.
                  </p>
                </div>
              ) : (
                filteredSiswa.map((s, idx) => {
                  const k = keuanganData[s.id] || {};
                  const total =
                    (Number(k.infaq) || 0) +
                    (Number(k.cicilan) || 0) +
                    (Number(k.konsumsi) || 0) +
                    (Number(k.makan) || 0);
                  return (
                    <div
                      key={s.id}
                      className="bg-white p-3.5 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden"
                    >
                      <div
                        className={`absolute top-0 right-0 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-bl-lg ${k.status === "Sudah" ? "bg-teal-500 text-white" : "bg-amber-400 text-amber-900"}`}
                      >
                        {k.status === "Sudah" ? "Lunas" : "Belum Selesai"}
                      </div>

                      <div className="flex gap-2.5 mb-3 mt-1">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex justify-center items-center text-slate-500">
                          <CreditCard size={16} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-xs leading-tight">
                            {s.nama}
                          </h3>
                          <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
                            {s.kelas}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg mb-3 border border-slate-100 text-xs font-medium">
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-500">Infaq</span>
                          <span className="font-bold text-slate-700">
                            {formatRp(k.infaq)}
                          </span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-500">Daftar Ulang</span>
                          <span className="font-bold text-slate-700">
                            {formatRp(k.cicilan)}
                          </span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-500">Konsumsi</span>
                          <span className="font-bold text-slate-700">
                            {formatRp(k.konsumsi)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Makan</span>
                          <span className="font-bold text-slate-700">
                            {formatRp(k.makan)}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-3 px-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Total Bayar
                        </span>
                        <span className="font-black text-base text-teal-600">
                          {formatRp(total)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openKeuanganModal(s)}
                          className="py-2 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold flex justify-center items-center gap-1.5 active:scale-95"
                        >
                          <Edit size={14} /> Edit Data
                        </button>
                        <button
                          onClick={() => openKwitansi(s)}
                          className="py-2 bg-teal-600 text-white rounded-lg text-[10px] font-bold flex justify-center items-center gap-1.5 shadow-sm shadow-teal-500/30 active:scale-95"
                        >
                          <ReceiptText size={14} /> Kwitansi
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* TAMPILAN DESKTOP: TABEL */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-3 font-bold text-slate-500 sticky left-0 bg-slate-50 z-10 w-10 text-center text-xs uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-3 py-3 font-bold text-slate-500 sticky left-10 bg-slate-50 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.03)] text-xs uppercase tracking-wider">
                        Siswa
                      </th>
                      <th className="px-3 py-3 font-bold text-slate-500 text-right w-28 text-xs uppercase tracking-wider">
                        Infaq
                      </th>
                      <th className="px-3 py-3 font-bold text-slate-500 text-right w-28 text-xs uppercase tracking-wider">
                        Daftar Ulang
                      </th>
                      <th className="px-3 py-3 font-bold text-slate-500 text-right w-28 text-xs uppercase tracking-wider">
                        Konsumsi
                      </th>
                      <th className="px-3 py-3 font-bold text-slate-500 text-right w-28 text-xs uppercase tracking-wider">
                        Makan Siang
                      </th>
                      <th className="px-3 py-3 font-black text-teal-600 bg-teal-50/50 text-right w-32 text-xs uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-3 py-3 font-bold text-slate-500 text-center w-24 text-xs uppercase tracking-wider">
                        Metode
                      </th>
                      <th className="px-3 py-3 font-bold text-slate-500 text-center w-24 text-xs uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 py-3 font-bold text-slate-500 text-center no-print w-16 text-xs uppercase tracking-wider">
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
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-3 py-2.5 text-slate-500 sticky left-0 bg-white text-center font-semibold text-xs">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2.5 font-bold text-slate-800 sticky left-10 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.01)] text-xs md:text-sm">
                            {s.nama} <br />
                            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                              {s.kelas}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold text-slate-700">
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
                          <td className="px-3 py-2.5 text-right font-semibold text-slate-700">
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
                          <td className="px-3 py-2.5 text-right font-semibold text-slate-700">
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
                          <td className="px-3 py-2.5 text-right font-semibold text-slate-700">
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
                          <td className="px-3 py-2.5 font-black text-teal-700 bg-teal-50/20 text-right text-xs md:text-sm">
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
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() => openKwitansi(s)}
                                className="p-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors"
                                title="Cetak Kwitansi"
                              >
                                <ReceiptText size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* GRAND TOTAL */}
                  <tfoot className="bg-teal-700 text-white font-bold">
                    <tr>
                      <td
                        colSpan="6"
                        className="px-3 py-3 text-right sticky left-0 bg-teal-700 z-10 uppercase tracking-widest text-[10px]"
                      >
                        Grand Total Kas Masuk:
                      </td>
                      <td className="px-3 py-3 text-teal-100 text-right text-sm md:text-base">
                        {formatRp(grandTotalKeuangan)}
                      </td>
                      <td colSpan="3" className="bg-teal-700"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* =========================================
          ALL MODALS
      ========================================= */}
      {modalType && modalType !== "kwitansi" && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm overflow-y-auto no-print">
          <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-md mt-auto md:mt-8 md:mb-8 overflow-hidden animate-in slide-in-from-bottom-8 md:fade-in duration-200">
            <div className="flex justify-between items-center p-4 md:p-5 border-b border-slate-100 bg-white">
              <h3 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
                {modalType === "kelas" && (
                  <>
                    <Plus size={20} className="text-teal-500" /> Tambah Kelas
                  </>
                )}
                {modalType === "siswa" && (
                  <>
                    <UserPlus size={20} className="text-teal-500" /> Data Siswa
                    Baru
                  </>
                )}
                {modalType === "nilai" && (
                  <>
                    <FileText size={20} className="text-blue-500" /> Input Nilai
                    Akademik
                  </>
                )}
                {modalType === "keuangan" && (
                  <>
                    <Banknote size={20} className="text-amber-500" /> Transaksi
                    Keuangan
                  </>
                )}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveData} className="p-4 md:p-5 space-y-3.5">
              {/* Form Kelas */}
              {modalType === "kelas" && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Nama Kategori Kelas
                  </label>
                  <input
                    autoFocus
                    required
                    type="text"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-all text-xs md:text-sm font-semibold"
                    placeholder="Misal: Kelas 1, Kelas 2..."
                    value={formData.nama_kelas || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, nama_kelas: e.target.value })
                    }
                  />
                </div>
              )}

              {/* Form Siswa */}
              {modalType === "siswa" && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Nama Lengkap Anak
                    </label>
                    <input
                      autoFocus
                      required
                      type="text"
                      placeholder="Masukkan nama..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-all text-xs md:text-sm font-semibold"
                      value={formData.nama || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, nama: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Penempatan Kelas
                    </label>
                    <select
                      required
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-all text-xs md:text-sm font-bold text-teal-700"
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

              {/* Form Nilai */}
              {modalType === "nilai" && (
                <>
                  <div className="bg-slate-50 p-3 rounded-xl mb-1 border border-slate-200 flex gap-2.5 items-center">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex justify-center items-center font-bold text-xs">
                      {activeSiswa?.nama.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                        Siswa Terpilih
                      </p>
                      <p className="font-bold text-slate-800 text-xs md:text-sm">
                        {activeSiswa?.nama}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Nilai Hafalan
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-xs font-bold text-slate-700"
                        value={formData.hafalan || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, hafalan: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Nilai Catatan
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-xs font-bold text-slate-700"
                        value={formData.catatan || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, catatan: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Ulangan Harian
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-xs font-bold text-slate-700"
                        value={formData.ulangan || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, ulangan: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Ujian Akhir
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-xs font-bold text-slate-700"
                        value={formData.ujian || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, ujian: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Keterangan Khusus
                    </label>
                    <textarea
                      rows="2"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-xs font-medium"
                      placeholder="Catatan opsional..."
                      value={formData.keterangan || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, keterangan: e.target.value })
                      }
                    ></textarea>
                  </div>
                </>
              )}

              {/* Form Keuangan */}
              {modalType === "keuangan" && (
                <>
                  <div className="bg-slate-50 p-3 rounded-xl mb-1 border border-slate-200 flex gap-2.5 items-center">
                    <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex justify-center items-center">
                      <Banknote size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                        Penagihan ke
                      </p>
                      <p className="font-bold text-slate-800 text-xs md:text-sm">
                        {activeSiswa?.nama}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Infaq (Rp)
                      </label>
                      <input
                        type="number"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-amber-500 font-bold text-slate-800 text-xs"
                        value={formData.infaq || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, infaq: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Daftar Ulang
                      </label>
                      <input
                        type="number"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-amber-500 font-bold text-slate-800 text-xs"
                        value={formData.cicilan || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, cicilan: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Konsumsi
                      </label>
                      <input
                        type="number"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-amber-500 font-bold text-slate-800 text-xs"
                        value={formData.konsumsi || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, konsumsi: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Makan Siang
                      </label>
                      <input
                        type="number"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-amber-500 font-bold text-slate-800 text-xs"
                        value={formData.makan || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, makan: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-xl grid grid-cols-2 gap-2.5 mt-1">
                    <div>
                      <label className="block text-[9px] font-bold text-amber-700 uppercase mb-1">
                        Metode
                      </label>
                      <select
                        className="w-full p-2 bg-white border border-amber-200 rounded-md outline-none text-[11px] font-bold text-slate-700"
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
                      <label className="block text-[9px] font-bold text-amber-700 uppercase mb-1">
                        Status Lunas
                      </label>
                      <select
                        className="w-full p-2 bg-white border border-amber-200 rounded-md outline-none text-[11px] font-bold text-slate-700"
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
                </>
              )}

              <button
                type="submit"
                className={`w-full py-3.5 rounded-xl font-bold text-white shadow-md flex justify-center items-center gap-2 mt-4 active:scale-95 transition-all text-xs md:text-sm uppercase tracking-wider
                ${
                  modalType === "keuangan"
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 shadow-amber-500/30"
                    : modalType === "nilai"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/30"
                      : "bg-gradient-to-r from-teal-500 to-teal-600 shadow-teal-500/30"
                }
              `}
              >
                <Save size={16} /> Simpan Data
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL KWITANSI DIGITAL --- */}
      {modalType === "kwitansi" && activeSiswa && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 overflow-y-auto p-4 animate-in fade-in duration-200">
          <div className="absolute top-4 right-4 flex gap-2 no-print z-50">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-teal-500 text-white rounded-lg font-bold flex items-center gap-1.5 hover:bg-teal-600 shadow-md active:scale-95 transition-transform text-xs"
            >
              <Printer size={14} /> Print PDF
            </button>
            <button
              onClick={() => setModalType(null)}
              className="p-1.5 bg-slate-800 text-white rounded-lg hover:bg-rose-500 transition-colors shadow-md active:scale-95"
            >
              <X size={16} />
            </button>
          </div>

          <div
            id="print-area"
            className="w-full max-w-md bg-white rounded-xl shadow-2xl p-5 md:p-6 relative print:shadow-none print:p-0 print:rounded-none mt-10 md:mt-0 print-mode"
          >
            <div className="flex justify-between items-start border-b-[2px] border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-teal-50 border border-teal-600 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                  <FileSignature size={20} className="text-teal-600" />
                </div>
                <div>
                  <h1 className="text-base md:text-lg font-black text-[#000080] tracking-[0.15em] uppercase leading-tight">
                    NINA'S PROJECT
                  </h1>
                  <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                    Manajemen Akademik
                  </p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-lg md:text-xl font-black text-slate-200 uppercase tracking-widest leading-none">
                  Kwitansi
                </h2>
                <p className="text-xs font-bold text-slate-600 mt-1">
                  No: {getNomorKwitansi(activeSiswa.id)}
                </p>
                <p className="text-[9px] text-slate-500">
                  {new Date().toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 md:p-4 rounded-lg border border-slate-200 mb-4 space-y-1.5">
              <div className="flex items-end border-b border-dotted border-slate-300 pb-1">
                <span className="w-24 md:w-28 font-medium text-slate-500 text-[10px] md:text-xs uppercase tracking-wider">
                  Terima Dari
                </span>
                <span className="flex-1 font-black text-[10px] md:text-xs text-slate-800 ml-2 leading-tight">
                  {activeSiswa.nama}
                </span>
              </div>
              <div className="flex items-end border-b border-dotted border-slate-300 pb-1">
                <span className="w-24 md:w-28 font-medium text-slate-500 text-[10px] md:text-xs uppercase tracking-wider">
                  Kategori Kelas
                </span>
                <span className="flex-1 font-black text-[10px] md:text-xs text-slate-800 ml-2">
                  {activeSiswa.kelas}
                </span>
              </div>
              <div className="flex items-end border-b border-dotted border-slate-300 pb-1">
                <span className="w-24 md:w-28 font-medium text-slate-500 text-[10px] md:text-xs uppercase tracking-wider">
                  Metode Bayar
                </span>
                <span className="flex-1 font-black text-[10px] md:text-xs text-slate-800 ml-2">
                  {keuanganData[activeSiswa.id]?.metode || "Cash"}
                  {keuanganData[activeSiswa.id]?.status === "Sudah"
                    ? " (Lunas)"
                    : " (Belum)"}
                </span>
              </div>
            </div>

            <table className="w-full mb-4 border border-slate-300 text-[10px] md:text-xs">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-1.5 border-r border-slate-300 text-center font-bold text-slate-700 w-6">
                    #
                  </th>
                  <th className="p-1.5 border-r border-slate-300 text-left font-bold text-slate-700">
                    Rincian Pembayaran
                  </th>
                  <th className="p-1.5 text-right font-bold text-slate-700 w-24 md:w-28">
                    Nominal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                <tr>
                  <td className="p-1.5 border-r border-slate-300 text-center text-slate-500 font-medium">
                    1
                  </td>
                  <td className="p-1.5 border-r border-slate-300 text-slate-800 font-bold">
                    Infaq Pendidikan
                  </td>
                  <td className="p-1.5 text-right text-slate-800 font-semibold">
                    {formatRp(keuanganData[activeSiswa.id]?.infaq)}
                  </td>
                </tr>
                <tr>
                  <td className="p-1.5 border-r border-slate-300 text-center text-slate-500 font-medium">
                    2
                  </td>
                  <td className="p-1.5 border-r border-slate-300 text-slate-800 font-bold">
                    Cicilan Daftar Ulang
                  </td>
                  <td className="p-1.5 text-right text-slate-800 font-semibold">
                    {formatRp(keuanganData[activeSiswa.id]?.cicilan)}
                  </td>
                </tr>
                <tr>
                  <td className="p-1.5 border-r border-slate-300 text-center text-slate-500 font-medium">
                    3
                  </td>
                  <td className="p-1.5 border-r border-slate-300 text-slate-800 font-bold">
                    Biaya Konsumsi
                  </td>
                  <td className="p-1.5 text-right text-slate-800 font-semibold">
                    {formatRp(keuanganData[activeSiswa.id]?.konsumsi)}
                  </td>
                </tr>
                <tr>
                  <td className="p-1.5 border-r border-slate-300 text-center text-slate-500 font-medium">
                    4
                  </td>
                  <td className="p-1.5 border-r border-slate-300 text-slate-800 font-bold">
                    Katering / Makan Siang
                  </td>
                  <td className="p-1.5 text-right text-slate-800 font-semibold">
                    {formatRp(keuanganData[activeSiswa.id]?.makan)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-800 text-white">
                <tr>
                  <td
                    colSpan="2"
                    className="p-1.5 border-r border-slate-700 text-right font-black uppercase tracking-widest text-[8px] md:text-[9px]"
                  >
                    Total Pembayaran
                  </td>
                  <td className="p-1.5 text-right font-black text-xs md:text-sm">
                    {formatRp(
                      (Number(keuanganData[activeSiswa.id]?.infaq) || 0) +
                        (Number(keuanganData[activeSiswa.id]?.cicilan) || 0) +
                        (Number(keuanganData[activeSiswa.id]?.konsumsi) || 0) +
                        (Number(keuanganData[activeSiswa.id]?.makan) || 0),
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="flex justify-end pr-2">
              <div className="text-center">
                <p className="text-[8px] md:text-[9px] font-bold text-slate-500 mb-0.5 uppercase tracking-widest">
                  Penerima
                </p>
                <div className="w-24 h-12 md:w-28 md:h-14 border-none bg-transparent flex items-center justify-center mx-auto overflow-hidden">
                  <img
                    src="/assets/ttd.png"
                    alt="Tanda Tangan"
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>
                <p className="font-black text-slate-800 underline text-[10px] md:text-xs">
                  Nina Rahilah S.Pd.
                </p>
              </div>
            </div>

            {keuanganData[activeSiswa.id]?.status === "Sudah" && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 opacity-5 pointer-events-none">
                <span className="text-[4rem] md:text-[5rem] font-black uppercase">
                  LUNAS
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
