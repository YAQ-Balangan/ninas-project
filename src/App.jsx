import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  BookOpen,
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
          className="w-full p-1.5 border-2 border-teal-500 rounded outline-none text-sm text-teal-900 bg-teal-50 font-bold shadow-sm min-w-[100px]"
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
        className="w-full p-1.5 border-2 border-teal-500 rounded outline-none text-sm text-teal-900 bg-teal-50 font-bold shadow-sm min-w-[80px]"
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
      <span className="text-teal-600 flex items-center gap-1 font-bold text-xs">
        <CheckCircle2 size={14} /> Lunas
      </span>
    );
  } else if (type === "select" && value === "Belum") {
    displayValue = (
      <span className="text-amber-500 flex items-center gap-1 font-bold text-xs">
        <AlertCircle size={14} /> Belum
      </span>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="w-full min-h-[28px] cursor-text hover:bg-teal-50 hover:ring-1 hover:ring-teal-200 rounded px-1.5 flex items-center transition-colors text-slate-700"
      title="Klik untuk mengubah"
    >
      {displayValue || (
        <span className="text-slate-300 italic text-xs">{placeholder}</span>
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

  // --- STATE DATA (Local Storage / Supabase Ready) ---
  const [kelasOptions, setKelasOptions] = useState(() => {
    const saved = localStorage.getItem("nina_kelas");
    return saved ? JSON.parse(saved) : ["Kelas Tahfidz", "Kelas Sore"];
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

  // --- FILTER & CALCULATIONS ---
  const filteredSiswa = useMemo(() => {
    return siswaData.filter((s) => {
      const matchSearch = s.nama.toLowerCase().includes(search.toLowerCase());
      const matchKelas = filterKelas ? s.kelas === filterKelas : true;
      return matchSearch && matchKelas;
    });
  }, [siswaData, search, filterKelas]);

  const grandTotalKeuangan = useMemo(() => {
    let total = 0;
    siswaData.forEach((s) => {
      const k = keuanganData[s.id];
      if (k) {
        total +=
          (Number(k.infaq) || 0) +
          (Number(k.cicilan) || 0) +
          (Number(k.konsumsi) || 0) +
          (Number(k.makan) || 0);
      }
    });
    return total;
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-teal-200 pb-20 md:pb-0">
      {/* CSS KHUSUS UNTUK PRINT */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `,
        }}
      />

      {/* --- TOP NAVBAR --- */}
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setActiveTab("home")}
            >
              <div className="bg-teal-50 border border-teal-100 p-2 rounded-xl">
                <BookOpen className="w-5 h-5 text-teal-600" />
              </div>
              {/* BRAND: NINA'S PROJECT (Warna Navy, Jarak Huruf Lebar) */}
              <span className="font-black text-lg md:text-xl text-[#000080] tracking-[0.25em] uppercase drop-shadow-sm ml-1">
                Nina's Project
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-1">
              <button
                onClick={() => setActiveTab("home")}
                className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === "home" ? "bg-teal-50 text-teal-700 shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <Home size={18} /> Beranda
              </button>
              <button
                onClick={() => setActiveTab("siswa")}
                className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === "siswa" ? "bg-teal-50 text-teal-700 shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <Users size={18} /> Data Siswa
              </button>
              <button
                onClick={() => setActiveTab("nilai")}
                className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === "nilai" ? "bg-teal-50 text-teal-700 shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <GraduationCap size={18} /> Rekap Nilai
              </button>
              <button
                onClick={() => setActiveTab("keuangan")}
                className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === "keuangan" ? "bg-teal-50 text-teal-700 shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <Wallet size={18} /> Keuangan
              </button>
            </div>

            {/* Mobile Header Profile */}
            <div className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center border border-teal-200">
                <span className="font-bold text-sm text-teal-700">N</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* --- BOTTOM NAVIGATION BAR (Khusus Mobile Ala Bank) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center pb-safe pt-2 pb-2 z-40 px-2 no-print shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-2xl">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center p-2 rounded-xl min-w-[64px] ${activeTab === "home" ? "text-teal-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          <div
            className={`${activeTab === "home" ? "bg-teal-50 p-1.5 rounded-lg mb-1" : "mb-2"}`}
          >
            <Home
              size={22}
              className={activeTab === "home" ? "fill-teal-100" : ""}
            />
          </div>
          <span className="text-[10px] font-bold">Beranda</span>
        </button>
        <button
          onClick={() => setActiveTab("siswa")}
          className={`flex flex-col items-center p-2 rounded-xl min-w-[64px] ${activeTab === "siswa" ? "text-teal-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          <div
            className={`${activeTab === "siswa" ? "bg-teal-50 p-1.5 rounded-lg mb-1" : "mb-2"}`}
          >
            <Users
              size={22}
              className={activeTab === "siswa" ? "fill-teal-100" : ""}
            />
          </div>
          <span className="text-[10px] font-bold">Siswa</span>
        </button>
        <button
          onClick={() => setActiveTab("nilai")}
          className={`flex flex-col items-center p-2 rounded-xl min-w-[64px] ${activeTab === "nilai" ? "text-teal-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          <div
            className={`${activeTab === "nilai" ? "bg-teal-50 p-1.5 rounded-lg mb-1" : "mb-2"}`}
          >
            <GraduationCap
              size={22}
              className={activeTab === "nilai" ? "fill-teal-100" : ""}
            />
          </div>
          <span className="text-[10px] font-bold">Nilai</span>
        </button>
        <button
          onClick={() => setActiveTab("keuangan")}
          className={`flex flex-col items-center p-2 rounded-xl min-w-[64px] ${activeTab === "keuangan" ? "text-teal-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          <div
            className={`${activeTab === "keuangan" ? "bg-teal-50 p-1.5 rounded-lg mb-1" : "mb-2"}`}
          >
            <Wallet
              size={22}
              className={activeTab === "keuangan" ? "fill-teal-100" : ""}
            />
          </div>
          <span className="text-[10px] font-bold">Keuangan</span>
        </button>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 no-print">
        {/* =========================================
            TAB 1: BERANDA / DASHBOARD (MOBILE & DESKTOP)
        ========================================= */}
        {activeTab === "home" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Card Saldo / Total Kas */}
            <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <p className="text-teal-100 text-sm font-semibold mb-1 flex items-center gap-2">
                <TrendingUp size={16} /> Total Dana Terkumpul
              </p>
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                {formatRp(grandTotalKeuangan)}
              </h2>

              <div className="flex gap-4 border-t border-teal-400/30 pt-4">
                <div>
                  <p className="text-teal-100 text-xs uppercase tracking-widest font-bold mb-1">
                    Total Siswa
                  </p>
                  <p className="font-bold text-lg">{siswaData.length} Anak</p>
                </div>
                <div>
                  <p className="text-teal-100 text-xs uppercase tracking-widest font-bold mb-1">
                    Total Kelas
                  </p>
                  <p className="font-bold text-lg">
                    {kelasOptions.length} Kelas
                  </p>
                </div>
              </div>
            </div>

            {/* Grid Menu Ala m-Banking */}
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">
                Menu Cepat
              </h3>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                <button
                  onClick={() => {
                    setActiveTab("siswa");
                    openSiswaModal();
                  }}
                  className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                >
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-teal-600">
                    <UserPlus size={28} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 text-center">
                    Siswa
                    <br />
                    Baru
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("keuangan")}
                  className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                >
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-amber-500">
                    <Banknote size={28} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 text-center">
                    Input
                    <br />
                    Uang
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("nilai")}
                  className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                >
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-500">
                    <FileText size={28} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 text-center">
                    Input
                    <br />
                    Nilai
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("keuangan")}
                  className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                >
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-rose-500">
                    <ReceiptText size={28} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 text-center">
                    Cetak
                    <br />
                    Kwitansi
                  </span>
                </button>
              </div>
            </div>

            {/* List Riwayat / Pendaftar Terbaru (Khusus Tampilan Home) */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800">
                  Siswa Terdaftar Baru
                </h3>
                <button
                  onClick={() => setActiveTab("siswa")}
                  className="text-teal-600 text-xs font-bold hover:underline"
                >
                  Lihat Semua
                </button>
              </div>
              <div className="space-y-3">
                {siswaData.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-4">
                    Belum ada siswa terdaftar.
                  </p>
                ) : (
                  siswaData
                    .slice(-4)
                    .reverse()
                    .map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-4 p-3 rounded-2xl border border-slate-50 bg-slate-50/50"
                      >
                        <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold">
                          {s.nama.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 truncate text-sm">
                            {s.nama}
                          </p>
                          <p className="text-xs text-slate-500">{s.kelas}</p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab("keuangan");
                            openKeuanganModal(s);
                          }}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-teal-600 rounded-lg text-xs font-bold shadow-sm"
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
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex gap-4 items-center">
                <div className="bg-teal-50 p-3 rounded-2xl text-teal-600 shrink-0 border border-teal-100">
                  {activeTab === "siswa" && <Users size={24} />}
                  {activeTab === "nilai" && <FileText size={24} />}
                  {activeTab === "keuangan" && <Wallet size={24} />}
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 capitalize">
                    {activeTab === "siswa"
                      ? "Master Data Siswa"
                      : `Manajemen ${activeTab}`}
                  </h2>
                  <p className="text-sm text-slate-500 font-medium">
                    Total {filteredSiswa.length} Siswa ditemukan
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-48">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Cari nama..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500 focus:bg-white transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500 font-medium text-slate-700"
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
                      className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-sm font-bold flex items-center gap-2"
                    >
                      <Plus size={16} /> Kelas
                    </button>
                    <button
                      onClick={() => openSiswaModal()}
                      className="px-3 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-teal-600/30"
                    >
                      <Plus size={16} /> Siswa
                    </button>
                  </>
                )}
                {activeTab === "nilai" && (
                  <button
                    onClick={handleExportNilai}
                    className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg"
                  >
                    <Download size={16} /> CSV
                  </button>
                )}
                {activeTab === "keuangan" && (
                  <button
                    onClick={handleExportKeuangan}
                    className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg"
                  >
                    <Download size={16} /> CSV
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
            <div className="md:hidden space-y-3">
              {filteredSiswa.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-2xl border border-slate-100">
                  <p className="text-slate-400 font-medium">
                    Tidak ada data siswa.
                  </p>
                </div>
              ) : (
                filteredSiswa.map((s, idx) => (
                  <div
                    key={s.id}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center font-bold text-lg">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800">{s.nama}</h3>
                      <span className="inline-block mt-1 bg-teal-100 text-teal-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest">
                        {s.kelas}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => openSiswaModal(s)}
                        className="p-2 text-blue-500 bg-blue-50 rounded-xl"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteSiswa(s.id)}
                        className="p-2 text-rose-500 bg-rose-50 rounded-xl"
                      >
                        <Trash2 size={16} />
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
                    <th className="px-6 py-4 font-bold text-slate-500 w-16">
                      No
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-500">
                      Nama Lengkap
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-500">
                      Kelas
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-500 text-center w-32">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSiswa.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-8 text-center text-slate-400"
                      >
                        Tidak ada data siswa.
                      </td>
                    </tr>
                  ) : (
                    filteredSiswa.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-teal-50/50">
                        <td className="px-6 py-4 text-slate-500 font-medium">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          <EditableCell
                            value={s.nama}
                            onSave={(val) =>
                              handleInlineSiswa(s.id, "nama", val)
                            }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <EditableCell
                            type="select"
                            options={kelasOptions}
                            value={s.kelas}
                            onSave={(val) =>
                              handleInlineSiswa(s.id, "kelas", val)
                            }
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openSiswaModal(s)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit via Form"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteSiswa(s.id)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
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
            TAB 3: REKAP NILAI
        ========================================= */}
        {activeTab === "nilai" && (
          <div id="print-area-nilai">
            {/* TAMPILAN MOBILE: KARTU NILAI */}
            <div className="md:hidden space-y-3">
              {filteredSiswa.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-2xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Belum ada siswa.</p>
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
                      className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100"
                    >
                      <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="font-bold text-slate-800 text-base">
                            {s.nama}
                          </h3>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                            {s.kelas}
                          </p>
                        </div>
                        <button
                          onClick={() => openNilaiModal(s)}
                          className="px-3 py-1.5 bg-teal-50 text-teal-600 rounded-lg text-xs font-bold border border-teal-100"
                        >
                          Input
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mb-3 text-center">
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">
                            Hafal
                          </p>
                          <p className="font-bold text-slate-700 text-sm mt-0.5">
                            {n.hafalan || "-"}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">
                            Catat
                          </p>
                          <p className="font-bold text-slate-700 text-sm mt-0.5">
                            {n.catatan || "-"}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">
                            UH
                          </p>
                          <p className="font-bold text-slate-700 text-sm mt-0.5">
                            {n.ulangan || "-"}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">
                            Ujian
                          </p>
                          <p className="font-bold text-slate-700 text-sm mt-0.5">
                            {n.ujian || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center bg-teal-600 text-white p-3 rounded-xl">
                        <span className="text-xs font-bold uppercase tracking-widest text-teal-100">
                          Rata-rata
                        </span>
                        <span className="font-black text-lg">
                          {rata > 0 ? rata.toFixed(1) : "-"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* TAMPILAN DESKTOP: TABEL DENGAN INLINE EDIT */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-4 font-bold text-slate-500 sticky left-0 bg-slate-50 z-10 w-12 text-center">
                        No
                      </th>
                      <th className="px-4 py-4 font-bold text-slate-500 sticky left-12 bg-slate-50 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                        Nama Siswa
                      </th>
                      <th className="px-4 py-4 font-bold text-slate-500 text-center w-24">
                        Hafalan
                      </th>
                      <th className="px-4 py-4 font-bold text-slate-500 text-center w-24">
                        Catatan
                      </th>
                      <th className="px-4 py-4 font-bold text-slate-500 text-center w-24">
                        Ulangan
                      </th>
                      <th className="px-4 py-4 font-bold text-slate-500 text-center w-24">
                        Ujian
                      </th>
                      <th className="px-4 py-4 font-black text-teal-600 bg-teal-50/50 text-center w-24">
                        Rata-rata
                      </th>
                      <th className="px-4 py-4 font-bold text-slate-500 min-w-[200px]">
                        Keterangan
                      </th>
                      <th className="px-4 py-4 font-bold text-slate-500 text-center no-print">
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
                          <td className="px-4 py-3 text-slate-500 sticky left-0 bg-white text-center font-medium">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-800 sticky left-12 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                            {s.nama} <br />
                            <span className="text-[10px] text-slate-400 font-normal">
                              {s.kelas}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-semibold text-center">
                            <EditableCell
                              type="number"
                              value={n.hafalan}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "hafalan", val)
                              }
                              placeholder="-"
                            />
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-semibold text-center">
                            <EditableCell
                              type="number"
                              value={n.catatan}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "catatan", val)
                              }
                              placeholder="-"
                            />
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-semibold text-center">
                            <EditableCell
                              type="number"
                              value={n.ulangan}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "ulangan", val)
                              }
                              placeholder="-"
                            />
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-semibold text-center">
                            <EditableCell
                              type="number"
                              value={n.ujian}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "ujian", val)
                              }
                              placeholder="-"
                            />
                          </td>
                          <td className="px-4 py-3 font-black text-teal-700 bg-teal-50/30 text-center">
                            {rata > 0 ? rata.toFixed(1) : "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs">
                            <EditableCell
                              value={n.keterangan}
                              onSave={(val) =>
                                handleInlineNilai(s.id, "keterangan", val)
                              }
                              placeholder="Ketik keterangan..."
                            />
                          </td>
                          <td className="px-4 py-3 text-center no-print">
                            <button
                              onClick={() => openNilaiModal(s)}
                              className="p-2 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors"
                              title="Buka Form"
                            >
                              <Edit size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end no-print hidden md:flex">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center gap-2"
                >
                  <Printer size={16} /> Print Tabel Nilai
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
            {/* TAMPILAN MOBILE: KARTU KEUANGAN ALA BANK */}
            <div className="md:hidden space-y-3">
              {filteredSiswa.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-2xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Belum ada siswa.</p>
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
                      className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden"
                    >
                      <div
                        className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-bl-xl ${k.status === "Sudah" ? "bg-teal-500 text-white" : "bg-amber-400 text-amber-900"}`}
                      >
                        {k.status === "Sudah"
                          ? "Lunas / Selesai"
                          : "Belum Selesai"}
                      </div>

                      <div className="flex gap-3 mb-4 mt-2">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex justify-center items-center text-slate-500">
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-base leading-tight">
                            {s.nama}
                          </h3>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                            {s.kelas}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100 text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-500">Infaq</span>
                          <span className="font-bold">{formatRp(k.infaq)}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-500">Daftar Ulang</span>
                          <span className="font-bold">
                            {formatRp(k.cicilan)}
                          </span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-500">Konsumsi</span>
                          <span className="font-bold">
                            {formatRp(k.konsumsi)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Makan</span>
                          <span className="font-bold">{formatRp(k.makan)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Total Bayar
                        </span>
                        <span className="font-black text-xl text-teal-600">
                          {formatRp(total)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openKeuanganModal(s)}
                          className="py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold flex justify-center items-center gap-2"
                        >
                          <Edit size={16} /> Edit Data
                        </button>
                        <button
                          onClick={() => openKwitansi(s)}
                          className="py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold flex justify-center items-center gap-2 shadow-md shadow-teal-500/30"
                        >
                          <ReceiptText size={16} /> Kwitansi
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* TAMPILAN DESKTOP: TABEL DENGAN INLINE EDIT */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-4 font-bold text-slate-500 sticky left-0 bg-slate-50 z-10 w-12 text-center">
                        No
                      </th>
                      <th className="px-4 py-4 font-bold text-slate-500 sticky left-12 bg-slate-50 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                        Siswa
                      </th>
                      <th className="px-4 py-4 font-bold text-slate-500 text-right w-32">
                        Infaq
                      </th>
                      <th className="px-4 py-4 font-bold text-slate-500 text-right w-32">
                        Daftar Ulang
                      </th>
                      <th className="px-4 py-4 font-bold text-slate-500 text-right w-32">
                        Konsumsi
                      </th>
                      <th className="px-4 py-4 font-bold text-slate-500 text-right w-32">
                        Makan Siang
                      </th>
                      <th className="px-4 py-4 font-black text-teal-600 bg-teal-50/50 text-right">
                        Total
                      </th>
                      <th className="px-4 py-4 font-bold text-slate-500 text-center w-28">
                        Metode
                      </th>
                      <th className="px-4 py-4 font-bold text-slate-500 text-center w-32">
                        Status
                      </th>
                      <th className="px-4 py-4 font-bold text-slate-500 text-center no-print w-24">
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
                          <td className="px-4 py-3 text-slate-500 sticky left-0 bg-white text-center font-medium">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-800 sticky left-12 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                            {s.nama} <br />
                            <span className="text-[10px] text-slate-400 font-normal">
                              {s.kelas}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 text-right font-semibold">
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
                          <td className="px-4 py-3 text-slate-600 text-right font-semibold">
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
                          <td className="px-4 py-3 text-slate-600 text-right font-semibold">
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
                          <td className="px-4 py-3 text-slate-600 text-right font-semibold">
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
                          <td className="px-4 py-3 font-bold text-teal-700 bg-teal-50/20 text-right">
                            {formatRp(total)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <EditableCell
                              type="select"
                              options={["Cash", "Transfer"]}
                              value={k.metode || "Cash"}
                              onSave={(val) =>
                                handleInlineKeuangan(s.id, "metode", val)
                              }
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <EditableCell
                              type="select"
                              options={["Belum", "Sudah"]}
                              value={k.status || "Belum"}
                              onSave={(val) =>
                                handleInlineKeuangan(s.id, "status", val)
                              }
                            />
                          </td>
                          <td className="px-4 py-3 text-center no-print">
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() => openKwitansi(s)}
                                className="p-2 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors"
                                title="Cetak Kwitansi"
                              >
                                <ReceiptText size={16} />
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
                        className="px-4 py-4 text-right sticky left-0 bg-teal-700 z-10 uppercase tracking-widest text-xs border-r border-teal-600"
                      >
                        Grand Total Kas Masuk:
                      </td>
                      <td className="px-4 py-4 text-teal-100 text-right text-base">
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
          ALL MODALS (SLIDE UP FOR MOBILE)
      ========================================= */}
      {modalType && modalType !== "kwitansi" && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm overflow-y-auto no-print">
          <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl w-full max-w-lg mt-auto md:mt-8 md:mb-8 overflow-hidden animate-in slide-in-from-bottom-full md:slide-in-from-bottom-10 md:fade-in duration-300">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-5 md:p-6 border-b border-slate-100 bg-white">
              <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
                {modalType === "kelas" && (
                  <>
                    <Plus size={22} className="text-teal-500" /> Tambah Kelas
                    Baru
                  </>
                )}
                {modalType === "siswa" && (
                  <>
                    <UserPlus size={22} className="text-teal-500" /> Data Siswa
                    Baru
                  </>
                )}
                {modalType === "nilai" && (
                  <>
                    <FileText size={22} className="text-blue-500" /> Input Nilai
                    Akademik
                  </>
                )}
                {modalType === "keuangan" && (
                  <>
                    <Banknote size={22} className="text-amber-500" /> Transaksi
                    Keuangan
                  </>
                )}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors bg-slate-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveData} className="p-5 md:p-6 space-y-4">
              {/* Form Kelas */}
              {modalType === "kelas" && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Nama Kategori Kelas
                  </label>
                  <input
                    autoFocus
                    required
                    type="text"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all text-sm font-medium"
                    placeholder="Misal: Kelas 3A, Kelas Sore..."
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
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Nama Lengkap Anak
                    </label>
                    <input
                      autoFocus
                      required
                      type="text"
                      placeholder="Masukkan nama..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all text-sm font-medium"
                      value={formData.nama || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, nama: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Penempatan Kelas
                    </label>
                    <select
                      required
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all text-sm font-bold text-teal-700"
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
                  <div className="bg-slate-50 p-4 rounded-2xl mb-2 border border-slate-200 flex gap-3 items-center">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex justify-center items-center font-bold">
                      {activeSiswa?.nama.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                        Siswa Terpilih
                      </p>
                      <p className="font-bold text-slate-800">
                        {activeSiswa?.nama}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Nilai Hafalan
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-bold text-slate-700"
                        value={formData.hafalan || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, hafalan: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Nilai Catatan
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-bold text-slate-700"
                        value={formData.catatan || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, catatan: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Ulangan Harian
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-bold text-slate-700"
                        value={formData.ulangan || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, ulangan: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Ujian Akhir
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-bold text-slate-700"
                        value={formData.ujian || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, ujian: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Keterangan Khusus
                    </label>
                    <textarea
                      rows="2"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium"
                      placeholder="Tambahkan catatan (opsional)..."
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
                  <div className="bg-slate-50 p-4 rounded-2xl mb-2 border border-slate-200 flex gap-3 items-center">
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex justify-center items-center">
                      <Banknote size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                        Penagihan ke
                      </p>
                      <p className="font-bold text-slate-800">
                        {activeSiswa?.nama}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Infaq (Rp)
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-bold text-slate-800 text-sm"
                        value={formData.infaq || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, infaq: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Daftar Ulang
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-bold text-slate-800 text-sm"
                        value={formData.cicilan || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, cicilan: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Konsumsi
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-bold text-slate-800 text-sm"
                        value={formData.konsumsi || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, konsumsi: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Makan Siang
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-bold text-slate-800 text-sm"
                        value={formData.makan || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, makan: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <label className="block text-[10px] font-bold text-amber-700 uppercase mb-1">
                        Metode
                      </label>
                      <select
                        className="w-full p-2.5 bg-white border border-amber-200 rounded-lg outline-none text-xs font-bold text-slate-700"
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
                      <label className="block text-[10px] font-bold text-amber-700 uppercase mb-1">
                        Status Lunas
                      </label>
                      <select
                        className="w-full p-2.5 bg-white border border-amber-200 rounded-lg outline-none text-xs font-bold text-slate-700"
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
                className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg flex justify-center items-center gap-2 mt-6 active:scale-95 transition-all text-sm uppercase tracking-wider
                ${
                  modalType === "keuangan"
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 shadow-amber-500/30"
                    : modalType === "nilai"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/30"
                      : "bg-gradient-to-r from-teal-500 to-teal-600 shadow-teal-500/30"
                }
              `}
              >
                <Save size={18} /> Simpan Data
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL KWITANSI DIGITAL --- */}
      {modalType === "kwitansi" && activeSiswa && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 overflow-y-auto p-4 md:p-8 animate-in fade-in duration-300">
          <div className="absolute top-4 right-4 flex gap-2 no-print z-50">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-teal-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-teal-600 shadow-lg active:scale-95 transition-transform text-sm"
            >
              <Printer size={18} /> PDF / Cetak
            </button>
            <button
              onClick={() => setModalType(null)}
              className="p-2 bg-slate-800 text-white rounded-xl hover:bg-rose-500 transition-colors shadow-lg active:scale-95"
            >
              <X size={20} />
            </button>
          </div>

          <div
            id="print-area"
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 md:p-8 relative print:shadow-none print:p-0 print:rounded-none mt-12 md:mt-0"
          >
            <div className="flex justify-between items-start border-b-[3px] border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-teal-50 border-2 border-teal-600 rounded-xl flex items-center justify-center overflow-hidden">
                  <BookOpen size={28} className="text-teal-600" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-[#000080] tracking-[0.25em] uppercase">
                    NINA'S PROJECT
                  </h1>
                  <p className="text-xs md:text-sm text-slate-500 font-bold uppercase mt-1">
                    Manajemen Akademik
                  </p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl md:text-3xl font-black text-slate-200 uppercase tracking-widest leading-none">
                  Kwitansi
                </h2>
                <p className="text-sm font-bold text-slate-600 mt-2">
                  No: #{Date.now().toString().slice(-6)}
                </p>
                <p className="text-[10px] md:text-xs text-slate-500">
                  {new Date().toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 md:p-5 rounded-xl border border-slate-200 mb-6 space-y-3">
              <div className="flex items-end border-b border-dotted border-slate-300 pb-1.5">
                <span className="w-32 md:w-48 font-bold text-slate-500 text-[10px] md:text-xs uppercase tracking-wider">
                  Terima Dari
                </span>
                <span className="flex-1 font-black text-base md:text-lg text-slate-800 ml-2 leading-tight">
                  {activeSiswa.nama}
                </span>
              </div>
              <div className="flex items-end border-b border-dotted border-slate-300 pb-1.5">
                <span className="w-32 md:w-48 font-bold text-slate-500 text-[10px] md:text-xs uppercase tracking-wider">
                  Kategori Kelas
                </span>
                <span className="flex-1 font-bold text-slate-800 ml-2">
                  {activeSiswa.kelas}
                </span>
              </div>
              <div className="flex items-end border-b border-dotted border-slate-300 pb-1.5">
                <span className="w-32 md:w-48 font-bold text-slate-500 text-[10px] md:text-xs uppercase tracking-wider">
                  Metode Bayar
                </span>
                <span className="flex-1 font-bold text-slate-800 ml-2">
                  {keuanganData[activeSiswa.id]?.metode || "Cash"}
                  {keuanganData[activeSiswa.id]?.status === "Sudah"
                    ? " (Lunas)"
                    : " (Belum Diserahkan)"}
                </span>
              </div>
            </div>

            <table className="w-full mb-8 border border-slate-300 text-xs md:text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 border-r border-slate-300 text-center font-bold text-slate-700 w-10">
                    #
                  </th>
                  <th className="p-3 border-r border-slate-300 text-left font-bold text-slate-700">
                    Rincian Pembayaran
                  </th>
                  <th className="p-3 text-right font-bold text-slate-700 w-32 md:w-48">
                    Nominal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                <tr>
                  <td className="p-3 border-r border-slate-300 text-center text-slate-500 font-medium">
                    1
                  </td>
                  <td className="p-3 border-r border-slate-300 text-slate-800 font-bold">
                    Infaq Pendidikan
                  </td>
                  <td className="p-3 text-right text-slate-800 font-semibold">
                    {formatRp(keuanganData[activeSiswa.id]?.infaq)}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 border-r border-slate-300 text-center text-slate-500 font-medium">
                    2
                  </td>
                  <td className="p-3 border-r border-slate-300 text-slate-800 font-bold">
                    Cicilan Daftar Ulang
                  </td>
                  <td className="p-3 text-right text-slate-800 font-semibold">
                    {formatRp(keuanganData[activeSiswa.id]?.cicilan)}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 border-r border-slate-300 text-center text-slate-500 font-medium">
                    3
                  </td>
                  <td className="p-3 border-r border-slate-300 text-slate-800 font-bold">
                    Biaya Konsumsi
                  </td>
                  <td className="p-3 text-right text-slate-800 font-semibold">
                    {formatRp(keuanganData[activeSiswa.id]?.konsumsi)}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 border-r border-slate-300 text-center text-slate-500 font-medium">
                    4
                  </td>
                  <td className="p-3 border-r border-slate-300 text-slate-800 font-bold">
                    Katering / Makan Siang
                  </td>
                  <td className="p-3 text-right text-slate-800 font-semibold">
                    {formatRp(keuanganData[activeSiswa.id]?.makan)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-800 text-white">
                <tr>
                  <td
                    colSpan="2"
                    className="p-3 border-r border-slate-700 text-right font-black uppercase tracking-widest text-[10px] md:text-xs"
                  >
                    Total Pembayaran
                  </td>
                  <td className="p-3 text-right font-black text-base md:text-lg">
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

            <div className="flex justify-end pr-4 md:pr-8">
              <div className="text-center">
                <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
                  Penerima / Admin
                </p>
                {/* Tempat Tanda Tangan: Masukkan foto dengan cara uncomment tag <img> di bawah ini */}
                <div className="w-32 h-20 md:w-40 md:h-24 border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center mb-2 mx-auto rounded overflow-hidden">
                  <span className="text-[10px] text-slate-400 font-medium">
                    [Foto TTD]
                  </span>
                  {/* <img src="URL_FOTO_TTD_ANDA.png" alt="Tanda Tangan" className="w-full h-full object-contain mix-blend-multiply" /> */}
                </div>
                <p className="font-black text-slate-800 underline text-sm md:text-base">
                  Nina M.
                </p>
              </div>
            </div>

            {keuanganData[activeSiswa.id]?.status === "Sudah" && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 opacity-5 pointer-events-none">
                <span className="text-[6rem] md:text-[8rem] font-black uppercase">
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
