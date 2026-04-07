import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  BookOpen,
  GraduationCap,
  Plus,
  ArrowLeft,
  Check,
  RefreshCw,
  Trash2,
  Users,
  ArrowUpDown,
} from "lucide-react";

// ==========================================
// IMPORT SUPABASE CLIENT
// ==========================================
import { supabase } from "../utils/supabaseClient";

const KELAS_OPTIONS = [
  "Semua Kelas",
  "X MIPA 1",
  "X MIPA 2",
  "X IPS 1",
  "X IPS 2",
  "VII",
  "VIII",
  "IX",
];

const MAPEL_OPTIONS = [
  "Semua Mapel",
  "Al-Qur'an Hadis",
  "Tilawah",
  "Pendidikan Agama Islam",
];

export default function Absensi({ onBack }) {
  const [activeTab, setActiveTab] = useState("kehadiran");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSaved, setLastSaved] = useState(new Date());

  const [settings, setSettings] = useState({
    guru: "Ahmad Maulana",
    semester: "Ganjil",
    tahunAjaran: "2025/2026",
  });

  const [filterKelas, setFilterKelas] = useState("Semua Kelas");
  const [filterMapel, setFilterMapel] = useState("Semua Mapel");
  const [sortOrder, setSortOrder] = useState("asc");

  const [meetingDates, setMeetingDates] = useState(Array(18).fill(""));
  const [students, setStudents] = useState([]);

  const studentsRef = useRef(students);
  const meetingDatesRef = useRef(meetingDates);
  const settingsRef = useRef(settings);

  useEffect(() => {
    studentsRef.current = students;
  }, [students]);
  useEffect(() => {
    meetingDatesRef.current = meetingDates;
  }, [meetingDates]);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const pertemuanCols = Array.from({ length: 18 }, (_, i) => `p${i + 1}`);
  const tugasCols = ["t1", "t2", "t3", "t4", "t5"];
  const uhCols = ["uh1", "uh2", "uh3"];

  // ================= 1. FETCH DATA DARI SUPABASE ================= //
  useEffect(() => {
    const fetchStudents = async () => {
      setIsSyncing(true);
      try {
        const { data, error } = await supabase
          .from("absensi_ahmad")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setStudents(data);

          const dates = Array(18).fill("");
          for (let i = 0; i < 18; i++) {
            dates[i] = data[0][`tgl${i + 1}`] || "";
          }
          setMeetingDates(dates);

          setSettings((prev) => ({
            ...prev,
            semester: data[0].semester || prev.semester,
            tahunAjaran: data[0].tahun_ajaran || prev.tahunAjaran,
          }));
        }
      } catch (err) {
        console.error("Gagal menarik data dari Supabase:", err.message);
      } finally {
        setIsSyncing(false);
      }
    };

    fetchStudents();
  }, []);

  // ================= 2. FUNGSI AUTO-SAVE KE SUPABASE ================= //
  const triggerAutoSave = async () => {
    const currentStudents = studentsRef.current;
    const currentDates = meetingDatesRef.current;
    const currentSettings = settingsRef.current;

    if (currentStudents.length === 0) return;

    setIsSyncing(true);
    try {
      const studentsToSave = currentStudents.map((s) => {
        const record = { ...s };
        record.semester = currentSettings.semester;
        record.tahun_ajaran = currentSettings.tahunAjaran;
        for (let i = 0; i < 18; i++) {
          record[`tgl${i + 1}`] = currentDates[i] || null;
        }
        return record;
      });

      const { error } = await supabase
        .from("absensi_ahmad")
        .upsert(studentsToSave);

      if (error) throw error;
      setLastSaved(new Date());
    } catch (err) {
      console.error("Gagal auto-save ke Supabase:", err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // ================= 3. INTERVAL AUTO SAVE 20 DETIK ================= //
  useEffect(() => {
    const interval = setInterval(() => {
      triggerAutoSave();
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  // ================= SMART FILTER & SORTING LOGIC ================= //
  const handleFilterKelasChange = (e) => {
    const k = e.target.value;
    setFilterKelas(k);

    if (k === "VII" || k === "VIII" || k === "IX") {
      setFilterMapel("Tilawah");
    } else if (k.startsWith("X ")) {
      setFilterMapel("Al-Qur'an Hadis");
    } else if (k === "Semua Kelas") {
      setFilterMapel("Semua Mapel");
    }
  };

  const filteredStudents = useMemo(() => {
    let result = students.filter((s) => {
      const matchKelas =
        filterKelas === "Semua Kelas" || s.kelas === filterKelas;
      const matchMapel =
        filterMapel === "Semua Mapel" || s.mapel === filterMapel;
      return matchKelas && matchMapel;
    });

    result.sort((a, b) => {
      const nameA = (a.nama_siswa || "").toLowerCase();
      const nameB = (b.nama_siswa || "").toLowerCase();
      if (nameA < nameB) return sortOrder === "asc" ? -1 : 1;
      if (nameA > nameB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [students, filterKelas, filterMapel, sortOrder]);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // ================= CALCULATIONS ================= //
  const calculateAttendance = (student) => {
    let s = 0,
      i = 0,
      a = 0,
      t = 0;
    pertemuanCols.forEach((col) => {
      const val = (student[col] || "").toLowerCase();
      if (val === "s") s++;
      if (val === "i") i++;
      if (val === "a") a++;
      if (val === "v") t++;
    });
    return { s, i, a, t };
  };

  const calculateGrades = (student) => {
    const getAvg = (cols) => {
      const validVals = cols
        .map((c) => parseFloat(student[c]))
        .filter((v) => !isNaN(v) && v > 0);
      if (validVals.length === 0) return 0;
      return validVals.reduce((sum, val) => sum + val, 0) / validVals.length;
    };

    const avgT = getAvg(tugasCols);
    const avgUH = getAvg(uhCols);
    const nh = (avgT + avgUH) / (avgT > 0 && avgUH > 0 ? 2 : 1);
    const um = parseFloat(student.um) || 0;
    const nr = (nh + 2 * um) / 3;

    return {
      avgT: avgT.toFixed(1),
      avgUH: avgUH.toFixed(1),
      nh: nh.toFixed(1),
      nr: nr.toFixed(1),
    };
  };

  // ================= HANDLERS ================= //
  const handleSettingChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (index, value) => {
    const newDates = [...meetingDates];
    newDates[index] = value;
    setMeetingDates(newDates);
  };

  const handleStudentChange = (id, field, value) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const cycleAttendance = (id, field, currentValue) => {
    const cycle = { "": "v", v: "s", s: "i", i: "a", a: "" };
    const nextVal = cycle[(currentValue || "").toLowerCase()] ?? "";
    handleStudentChange(id, field, nextVal);
  };

  // ================= 4. TAMBAH & HAPUS SISWA ================= //
  const addNewStudent = () => {
    const defaultKelas =
      filterKelas !== "Semua Kelas" ? filterKelas : "X MIPA 1";
    const defaultMapel =
      filterMapel !== "Semua Mapel" ? filterMapel : "Al-Qur'an Hadis";
    const newId = crypto.randomUUID ? crypto.randomUUID() : "id-" + Date.now();

    setStudents([
      ...students,
      {
        id: newId,
        nama_siswa: "Siswa Baru",
        kelas: defaultKelas,
        mapel: defaultMapel,
      },
    ]);
  };

  const deleteStudent = async (id, nama) => {
    if (
      window.confirm(
        `Hapus data siswa ${nama}? Data yang dihapus tidak bisa dikembalikan.`,
      )
    ) {
      try {
        setIsSyncing(true);
        const { error } = await supabase
          .from("absensi_ahmad")
          .delete()
          .eq("id", id);

        if (error) throw error;
        setStudents((prev) => prev.filter((s) => s.id !== id));
      } catch (err) {
        alert("Gagal menghapus data dari Supabase: " + err.message);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const renderAttendanceCell = (val) => {
    const v = (val || "").toLowerCase();
    if (v === "v")
      return <Check size={16} className="text-emerald-500 mx-auto" />;
    if (v === "s") return <span className="text-blue-500 font-bold">S</span>;
    if (v === "i") return <span className="text-amber-500 font-bold">I</span>;
    if (v === "a") return <span className="text-red-500 font-bold">A</span>;
    return <span className="text-slate-200">-</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 md:p-8 font-sans pb-24">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* HEADER / BANNER */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-teal-600 to-emerald-700 rounded-3xl p-5 md:p-6 text-white shadow-xl relative overflow-hidden"
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="flex flex-col md:flex-row justify-between items-start relative z-10 gap-4">
            <div className="space-y-4 w-full">
              <div className="flex items-center justify-between md:justify-start gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={onBack}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h1 className="text-xl md:text-3xl font-black tracking-tight drop-shadow-md">
                    Panel Guru
                  </h1>
                </div>
                {/* Indikator Auto Save */}
                <div className="flex items-center gap-2 px-3 py-1 bg-black/20 rounded-full text-[10px] md:text-xs font-bold border border-white/10">
                  <RefreshCw
                    size={12}
                    className={
                      isSyncing
                        ? "animate-spin text-teal-300"
                        : "text-slate-300"
                    }
                  />
                  <span className="opacity-90 hidden sm:inline">
                    {isSyncing
                      ? "Menyinkronkan..."
                      : `Tersimpan ${lastSaved.getHours()}:${String(lastSaved.getMinutes()).padStart(2, "0")}`}
                  </span>
                </div>
              </div>

              {/* Editable Settings Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <div>
                  <label className="text-[10px] text-teal-100 uppercase font-bold tracking-wider flex items-center gap-1">
                    <Users size={12} /> Filter Kelas
                  </label>
                  <select
                    value={filterKelas}
                    onChange={handleFilterKelasChange}
                    className="w-full mt-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-sm font-bold focus:outline-none focus:bg-white focus:text-teal-900 [&>option]:text-slate-800 transition-colors"
                  >
                    {KELAS_OPTIONS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-teal-100 uppercase font-bold tracking-wider flex items-center gap-1">
                    <BookOpen size={12} /> Filter Mapel
                  </label>
                  <select
                    value={filterMapel}
                    onChange={(e) => setFilterMapel(e.target.value)}
                    className="w-full mt-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-sm font-bold focus:outline-none focus:bg-white focus:text-teal-900 [&>option]:text-slate-800 transition-colors"
                  >
                    {MAPEL_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-teal-100 uppercase font-bold tracking-wider flex items-center gap-1">
                    <Calendar size={12} /> Semester
                  </label>
                  <select
                    value={settings.semester}
                    onChange={(e) =>
                      handleSettingChange("semester", e.target.value)
                    }
                    className="w-full mt-1 bg-transparent border-b border-teal-400/50 text-sm font-bold focus:outline-none focus:border-white [&>option]:text-slate-800 transition-colors"
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-teal-100 uppercase font-bold tracking-wider flex items-center gap-1">
                    <Calendar size={12} /> Thn Ajaran
                  </label>
                  <input
                    type="text"
                    value={settings.tahunAjaran}
                    onChange={(e) =>
                      handleSettingChange("tahunAjaran", e.target.value)
                    }
                    className="w-full mt-1 bg-transparent border-b border-teal-400/50 text-sm font-bold focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* TABS & CONTROLS */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex w-full md:w-auto bg-white p-1.5 rounded-xl md:rounded-2xl shadow-sm border border-slate-200">
            <button
              onClick={() => setActiveTab("kehadiran")}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase transition-all ${activeTab === "kehadiran" ? "bg-teal-500 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
            >
              Kehadiran
            </button>
            <button
              onClick={() => setActiveTab("penilaian")}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase transition-all ${activeTab === "penilaian" ? "bg-teal-500 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
            >
              Penilaian
            </button>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={toggleSort}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white text-slate-600 font-bold text-[10px] md:text-xs uppercase rounded-xl hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm"
            >
              <ArrowUpDown
                size={16}
                className={
                  sortOrder === "asc" ? "text-emerald-500" : "text-amber-500"
                }
              />
              Sortir {sortOrder === "asc" ? "A-Z" : "Z-A"}
            </button>
            <button
              onClick={addNewStudent}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-100 text-emerald-700 font-black text-[10px] md:text-xs uppercase rounded-xl hover:bg-emerald-200 transition-colors border border-emerald-200/50"
            >
              <Plus size={16} /> Tambah Data
            </button>
          </div>
        </div>

        {/* ================= TAMPILAN HP (MOBILE CARDS) ================= */}
        <div className="md:hidden space-y-4">
          <AnimatePresence>
            {filteredStudents.map((s, idx) => {
              const att = calculateAttendance(s);
              const grades = calculateGrades(s);
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={s.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  <div className="bg-slate-50 border-b border-slate-100 p-3 flex justify-between items-start">
                    <div className="flex-1 mr-2">
                      <input
                        type="text"
                        value={s.nama_siswa || ""}
                        onChange={(e) =>
                          handleStudentChange(
                            s.id,
                            "nama_siswa",
                            e.target.value,
                          )
                        }
                        className="w-full bg-transparent font-black text-slate-800 text-sm focus:outline-none focus:border-b focus:border-teal-500"
                        placeholder="Nama Siswa..."
                      />
                      <div className="flex gap-2 mt-1">
                        <select
                          value={s.kelas || ""}
                          onChange={(e) =>
                            handleStudentChange(s.id, "kelas", e.target.value)
                          }
                          className="text-[10px] text-slate-500 font-bold bg-transparent outline-none border border-slate-200 rounded px-1 flex-1 py-0.5"
                        >
                          {KELAS_OPTIONS.filter((k) => k !== "Semua Kelas").map(
                            (k) => (
                              <option key={k} value={k}>
                                {k}
                              </option>
                            ),
                          )}
                        </select>
                        <select
                          value={s.mapel || "Al-Qur'an Hadis"}
                          onChange={(e) =>
                            handleStudentChange(s.id, "mapel", e.target.value)
                          }
                          className="text-[10px] text-slate-500 font-bold bg-transparent outline-none border border-slate-200 rounded px-1 flex-1 py-0.5"
                        >
                          {MAPEL_OPTIONS.filter((m) => m !== "Semua Mapel").map(
                            (m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteStudent(s.id, s.nama_siswa)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg shrink-0 mt-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="p-3">
                    {activeTab === "kehadiran" ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-6 gap-1.5">
                          {pertemuanCols.map((col, i) => (
                            <button
                              key={col}
                              onClick={() => cycleAttendance(s.id, col, s[col])}
                              className="h-8 rounded flex items-center justify-center bg-slate-50 border border-slate-100 text-xs shadow-sm"
                            >
                              {s[col] ? (
                                renderAttendanceCell(s[col])
                              ) : (
                                <span className="text-[9px] text-slate-300">
                                  P{i + 1}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-2 text-[11px] font-black">
                          <span className="text-blue-600">S: {att.s}</span>
                          <span className="text-amber-600">I: {att.i}</span>
                          <span className="text-red-600">A: {att.a}</span>
                          <span className="text-emerald-600 bg-emerald-50 px-2 rounded-full border border-emerald-100">
                            Hadir (T): {att.t}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                              Tugas Harian
                            </span>
                            <div className="flex gap-1">
                              {tugasCols.slice(0, 3).map((col) => (
                                <input
                                  key={col}
                                  type="number"
                                  placeholder="-"
                                  value={s[col] || ""}
                                  onChange={(e) =>
                                    handleStudentChange(
                                      s.id,
                                      col,
                                      e.target.value,
                                    )
                                  }
                                  className="w-full h-8 text-center bg-emerald-50 text-emerald-900 text-xs font-bold rounded border border-emerald-100 outline-none focus:ring-1 focus:ring-emerald-400"
                                />
                              ))}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                              Ulangan (UH)
                            </span>
                            <div className="flex gap-1">
                              {uhCols.slice(0, 3).map((col) => (
                                <input
                                  key={col}
                                  type="number"
                                  placeholder="-"
                                  value={s[col] || ""}
                                  onChange={(e) =>
                                    handleStudentChange(
                                      s.id,
                                      col,
                                      e.target.value,
                                    )
                                  }
                                  className="w-full h-8 text-center bg-blue-50 text-blue-900 text-xs font-bold rounded border border-blue-100 outline-none focus:ring-1 focus:ring-blue-400"
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <div className="flex-1">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">
                              U. Umum (UM)
                            </span>
                            <input
                              type="number"
                              value={s.um || ""}
                              onChange={(e) =>
                                handleStudentChange(s.id, "um", e.target.value)
                              }
                              className="w-full h-10 text-center bg-white border-2 border-amber-200 text-amber-900 text-sm font-black rounded-xl outline-none focus:border-amber-400 shadow-sm"
                            />
                          </div>
                          <div className="flex-1 bg-teal-50 rounded-xl p-2 border border-teal-100 text-center">
                            <span className="block text-[10px] font-black text-teal-600 uppercase">
                              Nilai Rapor
                            </span>
                            <span className="block text-xl font-black text-teal-800">
                              {grades.nr}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filteredStudents.length === 0 && (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300">
              <p className="text-sm font-bold text-slate-400">
                Tidak ada data untuk filter ini.
              </p>
            </div>
          )}
        </div>

        {/* ================= TAMPILAN PC / DEKSTOP (INLINE TABLE) ================= */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:block bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden relative"
        >
          <div className="overflow-x-auto p-1 scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-max">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-black whitespace-nowrap">
                <tr>
                  <th className="px-4 py-4 text-center sticky left-0 bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-12 align-bottom">
                    No
                  </th>
                  <th className="px-4 py-4 sticky left-[3rem] bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[220px] align-bottom">
                    <div className="flex items-center justify-between">
                      Data Siswa
                      <button
                        onClick={toggleSort}
                        className="text-slate-400 hover:text-emerald-500 p-1 transition-colors"
                        title="Urutkan A-Z"
                      >
                        <ArrowUpDown size={14} />
                      </button>
                    </div>
                  </th>

                  {activeTab === "kehadiran" && (
                    <>
                      {/* HEADER TANGGAL DENGAN INPUT DATE */}
                      {pertemuanCols.map((_, i) => (
                        <th
                          key={i}
                          className="px-1 py-2 text-center border-l border-slate-200 w-16 align-top"
                        >
                          <input
                            type="date"
                            value={meetingDates[i] || ""}
                            onChange={(e) =>
                              handleDateChange(i, e.target.value)
                            }
                            className="w-full text-[9px] bg-transparent outline-none text-slate-500 cursor-pointer text-center"
                          />
                          <div className="mt-1 border-t border-slate-200 pt-1 font-black">
                            P{i + 1}
                          </div>
                        </th>
                      ))}
                      {/* =============== KOLOM STICKY KANAN (KEHADIRAN) =============== 
                        Wajib pakai width fix (w-12 = 3rem = 48px) agar perhitungannya presisi
                      */}
                      <th className="px-3 py-4 text-center border-l border-slate-200 bg-blue-50 text-blue-700 align-bottom sticky right-[13rem] z-20 w-12 min-w-[3rem] max-w-[3rem] shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.05)]">
                        S
                      </th>
                      <th className="px-3 py-4 text-center bg-amber-50 text-amber-700 align-bottom sticky right-[10rem] z-20 w-12 min-w-[3rem] max-w-[3rem]">
                        I
                      </th>
                      <th className="px-3 py-4 text-center bg-red-50 text-red-700 align-bottom sticky right-[7rem] z-20 w-12 min-w-[3rem] max-w-[3rem]">
                        A
                      </th>
                      <th
                        className="px-3 py-4 text-center bg-emerald-50 text-emerald-700 align-bottom font-black sticky right-[4rem] z-20 w-12 min-w-[3rem] max-w-[3rem]"
                        title="Total Hadir"
                      >
                        T
                      </th>
                    </>
                  )}

                  {activeTab === "penilaian" && (
                    <>
                      {tugasCols.map((_, i) => (
                        <th
                          key={i}
                          className="px-2 py-4 text-center border-l border-slate-200 w-16 bg-emerald-50/50 align-bottom"
                        >
                          T{i + 1}
                        </th>
                      ))}
                      <th className="px-3 py-4 text-center bg-emerald-100 text-emerald-800 align-bottom">
                        R. Tgs
                      </th>

                      {uhCols.map((_, i) => (
                        <th
                          key={i}
                          className="px-2 py-4 text-center border-l border-slate-200 w-16 bg-blue-50/50 align-bottom"
                        >
                          UH{i + 1}
                        </th>
                      ))}
                      <th className="px-3 py-4 text-center bg-blue-100 text-blue-800 align-bottom">
                        R. UH
                      </th>

                      <th
                        className="px-4 py-4 text-center border-l border-slate-300 bg-slate-100 align-bottom"
                        title="Rata-rata Harian (Tugas + UH)"
                      >
                        Nilai Harian (nh)
                      </th>
                      <th className="px-4 py-4 text-center border-l border-slate-300 bg-amber-50 text-amber-800 align-bottom">
                        Ulangan Umum (UM)
                      </th>

                      {/* =============== KOLOM STICKY KANAN (PENILAIAN) =============== */}
                      <th className="px-4 py-4 text-center border-l border-slate-300 bg-teal-100 text-teal-800 font-black text-xs align-bottom sticky right-[4rem] z-20 w-24 min-w-[6rem] max-w-[6rem] shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.05)]">
                        NILAI RAPOR
                      </th>
                    </>
                  )}
                  {/* KOLOM OPSI STICKY PALING KANAN (KEDUA TAB SAMA) */}
                  <th className="px-4 py-4 text-center border-l border-slate-200 align-bottom sticky right-0 z-20 bg-slate-50 w-16 min-w-[4rem] max-w-[4rem]">
                    Opsi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={30}
                      className="text-center py-12 text-slate-400 font-bold text-sm"
                    >
                      Tidak ada data untuk kombinasi filter ini.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, idx) => {
                    const att = calculateAttendance(s);
                    const grades = calculateGrades(s);

                    return (
                      <tr
                        key={s.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="px-4 py-3 text-center text-xs font-bold text-slate-400 sticky left-0 bg-white group-hover:bg-slate-50 z-10">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 sticky left-[3rem] bg-white group-hover:bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                          <input
                            type="text"
                            value={s.nama_siswa || ""}
                            onChange={(e) =>
                              handleStudentChange(
                                s.id,
                                "nama_siswa",
                                e.target.value,
                              )
                            }
                            className="w-full bg-transparent font-bold text-slate-800 text-sm focus:outline-none focus:border-b-2 focus:border-teal-500 px-1"
                            placeholder="Nama Siswa..."
                          />
                          <div className="flex gap-1 mt-1 px-1">
                            <select
                              value={s.kelas || ""}
                              onChange={(e) =>
                                handleStudentChange(
                                  s.id,
                                  "kelas",
                                  e.target.value,
                                )
                              }
                              className="text-[10px] text-slate-400 font-bold bg-transparent outline-none border border-slate-200 rounded py-0.5"
                            >
                              {KELAS_OPTIONS.filter(
                                (k) => k !== "Semua Kelas",
                              ).map((k) => (
                                <option key={k} value={k}>
                                  {k}
                                </option>
                              ))}
                            </select>
                            <select
                              value={s.mapel || "Al-Qur'an Hadis"}
                              onChange={(e) =>
                                handleStudentChange(
                                  s.id,
                                  "mapel",
                                  e.target.value,
                                )
                              }
                              className="text-[10px] text-slate-400 font-bold bg-transparent outline-none border border-slate-200 rounded max-w-[100px] truncate py-0.5"
                            >
                              {MAPEL_OPTIONS.filter(
                                (m) => m !== "Semua Mapel",
                              ).map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        {activeTab === "kehadiran" && (
                          <>
                            {pertemuanCols.map((col) => (
                              <td
                                key={col}
                                onClick={() =>
                                  cycleAttendance(s.id, col, s[col])
                                }
                                className="px-2 py-3 text-center border-l border-slate-100 cursor-pointer hover:bg-slate-200 transition-colors select-none"
                              >
                                {renderAttendanceCell(s[col])}
                              </td>
                            ))}

                            {/* BODY STICKY KANAN (KEHADIRAN) */}
                            <td className="px-3 py-3 text-center font-bold text-blue-600 bg-blue-50 group-hover:bg-blue-100 border-l border-slate-200 sticky right-[13rem] z-10 w-12 min-w-[3rem] max-w-[3rem] shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.05)]">
                              {att.s || "-"}
                            </td>
                            <td className="px-3 py-3 text-center font-bold text-amber-600 bg-amber-50 group-hover:bg-amber-100 sticky right-[10rem] z-10 w-12 min-w-[3rem] max-w-[3rem]">
                              {att.i || "-"}
                            </td>
                            <td className="px-3 py-3 text-center font-bold text-red-600 bg-red-50 group-hover:bg-red-100 sticky right-[7rem] z-10 w-12 min-w-[3rem] max-w-[3rem]">
                              {att.a || "-"}
                            </td>
                            <td className="px-3 py-3 text-center font-black text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100 text-lg border-l border-emerald-100/50 sticky right-[4rem] z-10 w-12 min-w-[3rem] max-w-[3rem]">
                              {att.t || "-"}
                            </td>
                          </>
                        )}

                        {activeTab === "penilaian" && (
                          <>
                            {tugasCols.map((col) => (
                              <td
                                key={col}
                                className="px-1 py-2 border-l border-slate-100 bg-emerald-50/20"
                              >
                                <input
                                  type="number"
                                  value={s[col] || ""}
                                  onChange={(e) =>
                                    handleStudentChange(
                                      s.id,
                                      col,
                                      e.target.value,
                                    )
                                  }
                                  className="w-full text-center bg-transparent text-sm font-medium focus:outline-none focus:bg-white rounded p-1"
                                />
                              </td>
                            ))}
                            <td className="px-3 py-3 text-center font-bold text-emerald-700 bg-emerald-50/50">
                              {grades.avgT}
                            </td>

                            {uhCols.map((col) => (
                              <td
                                key={col}
                                className="px-1 py-2 border-l border-slate-100 bg-blue-50/20"
                              >
                                <input
                                  type="number"
                                  value={s[col] || ""}
                                  onChange={(e) =>
                                    handleStudentChange(
                                      s.id,
                                      col,
                                      e.target.value,
                                    )
                                  }
                                  className="w-full text-center bg-transparent text-sm font-medium focus:outline-none focus:bg-white rounded p-1"
                                />
                              </td>
                            ))}
                            <td className="px-3 py-3 text-center font-bold text-blue-700 bg-blue-50/50">
                              {grades.avgUH}
                            </td>

                            <td className="px-4 py-3 text-center font-black text-slate-700 border-l border-slate-200 bg-slate-50/50">
                              {grades.nh}
                            </td>

                            <td className="px-1 py-2 border-l border-slate-200 bg-amber-50/30">
                              <input
                                type="number"
                                value={s.um || ""}
                                onChange={(e) =>
                                  handleStudentChange(
                                    s.id,
                                    "um",
                                    e.target.value,
                                  )
                                }
                                className="w-full text-center bg-white border border-amber-200 text-amber-900 text-sm font-black focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-lg p-1.5 shadow-inner"
                              />
                            </td>

                            {/* BODY STICKY KANAN (PENILAIAN) */}
                            <td className="px-4 py-3 text-center font-black text-lg border-l border-slate-200 bg-teal-50 group-hover:bg-teal-100 text-teal-700 sticky right-[4rem] z-10 w-24 min-w-[6rem] max-w-[6rem] shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.05)]">
                              {grades.nr}
                            </td>
                          </>
                        )}

                        {/* BODY OPSI STICKY PALING KANAN */}
                        <td className="px-2 py-3 text-center border-l border-slate-100 sticky right-0 z-10 bg-white group-hover:bg-slate-50 w-16 min-w-[4rem] max-w-[4rem]">
                          <button
                            onClick={() => deleteStudent(s.id, s.nama_siswa)}
                            className="p-2 bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                            title="Hapus Siswa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
