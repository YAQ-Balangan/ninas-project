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
// IMPORT SUPABASE CLIENT BAPAK DI SINI
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

const generateUUID = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

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
  const lastSavedDataRef = useRef("");

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
          lastSavedDataRef.current = JSON.stringify(data);
        }
      } catch (err) {
        console.error("Gagal menarik data dari Supabase:", err.message);
      } finally {
        setIsSyncing(false);
      }
    };
    fetchStudents();
  }, []);

  // ================= 2. FUNGSI SIMPAN KE SUPABASE (SMART AUTO-SAVE) ================= //
  const performAutoSave = async () => {
    const currStudents = studentsRef.current;
    if (currStudents.length === 0) return;

    const payload = currStudents.map((s) => {
      const record = { ...s };
      record.semester = settingsRef.current.semester;
      record.tahun_ajaran = settingsRef.current.tahunAjaran;
      for (let i = 0; i < 18; i++) {
        record[`tgl${i + 1}`] = meetingDatesRef.current[i] || null;
      }

      const numericCols = [...tugasCols, ...uhCols, "um"];
      numericCols.forEach((col) => {
        if (record[col] === "") record[col] = null;
      });

      delete record.created_at;
      return record;
    });

    const currentDataString = JSON.stringify(payload);
    if (currentDataString === lastSavedDataRef.current) return;

    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from("absensi_ahmad")
        .upsert(payload, { onConflict: "id" });

      if (error) throw error;

      lastSavedDataRef.current = currentDataString;
      setLastSaved(new Date());
    } catch (err) {
      console.error("Gagal auto-save ke Supabase:", err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // ================= 3. INTERVAL AUTO SAVE 20 DETIK ================= //
  useEffect(() => {
    const interval = setInterval(performAutoSave, 20000);
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

  const toggleSort = () =>
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));

  const markAllPresent = (col) => {
    const filteredIds = filteredStudents.map((s) => s.id);
    setStudents((prev) =>
      prev.map((s) => {
        if (filteredIds.includes(s.id)) {
          return { ...s, [col]: "v" };
        }
        return s;
      }),
    );
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
  const handleSettingChange = (field, value) =>
    setSettings((prev) => ({ ...prev, [field]: value }));
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

  const addNewStudent = () => {
    const defaultKelas =
      filterKelas !== "Semua Kelas" ? filterKelas : "X MIPA 1";
    const defaultMapel =
      filterMapel !== "Semua Mapel" ? filterMapel : "Al-Qur'an Hadis";
    const newId = generateUUID();

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
      return <Check size={14} className="text-emerald-500 mx-auto" />;
    if (v === "s") return <span className="text-blue-500 font-bold">S</span>;
    if (v === "i") return <span className="text-amber-500 font-bold">I</span>;
    if (v === "a") return <span className="text-red-500 font-bold">A</span>;
    return <span className="text-slate-200">-</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-2 md:p-4 font-sans pb-24">
      <div className="max-w-[1400px] mx-auto space-y-3 md:space-y-4">
        {/* HEADER / BANNER */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-teal-600 to-emerald-700 rounded-[1.5rem] p-4 text-white shadow-md relative overflow-hidden"
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="flex flex-col md:flex-row justify-between items-start relative z-10 gap-3">
            <div className="space-y-3 w-full">
              <div className="flex items-center justify-between md:justify-start gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={onBack}
                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <h1 className="text-lg md:text-xl font-black tracking-tight drop-shadow-sm">
                    Panel Guru
                  </h1>
                </div>
                {/* Indikator Auto Save */}
                <div className="flex items-center gap-2 px-2.5 py-1 bg-black/20 rounded-full text-[9px] md:text-[10px] font-bold border border-white/10">
                  <RefreshCw
                    size={10}
                    className={
                      isSyncing
                        ? "animate-spin text-teal-300"
                        : "text-slate-300"
                    }
                  />
                  <span className="opacity-90 hidden sm:inline">
                    {isSyncing
                      ? "Menyinkronkan..."
                      : `Auto-Save Aktif | ${lastSaved.getHours()}:${String(lastSaved.getMinutes()).padStart(2, "0")}`}
                  </span>
                </div>
              </div>

              {/* Editable Settings Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-black/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                <div>
                  <label className="text-[9px] text-teal-100 uppercase font-bold tracking-wider flex items-center gap-1">
                    <Users size={10} /> Filter Kelas
                  </label>
                  <select
                    value={filterKelas}
                    onChange={handleFilterKelasChange}
                    className="w-full mt-0.5 bg-white/10 border border-white/20 rounded md:rounded-lg px-1.5 py-1 text-[11px] font-bold focus:outline-none focus:bg-white focus:text-teal-900 [&>option]:text-slate-800 transition-colors"
                  >
                    {KELAS_OPTIONS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-teal-100 uppercase font-bold tracking-wider flex items-center gap-1">
                    <BookOpen size={10} /> Filter Mapel
                  </label>
                  <select
                    value={filterMapel}
                    onChange={(e) => setFilterMapel(e.target.value)}
                    className="w-full mt-0.5 bg-white/10 border border-white/20 rounded md:rounded-lg px-1.5 py-1 text-[11px] font-bold focus:outline-none focus:bg-white focus:text-teal-900 [&>option]:text-slate-800 transition-colors"
                  >
                    {MAPEL_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-teal-100 uppercase font-bold tracking-wider flex items-center gap-1">
                    <Calendar size={10} /> Semester
                  </label>
                  <select
                    value={settings.semester}
                    onChange={(e) =>
                      handleSettingChange("semester", e.target.value)
                    }
                    className="w-full mt-0.5 bg-transparent border-b border-teal-400/50 text-[11px] font-bold focus:outline-none focus:border-white [&>option]:text-slate-800 transition-colors"
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-teal-100 uppercase font-bold tracking-wider flex items-center gap-1">
                    <Calendar size={10} /> Thn Ajaran
                  </label>
                  <input
                    type="text"
                    value={settings.tahunAjaran}
                    onChange={(e) =>
                      handleSettingChange("tahunAjaran", e.target.value)
                    }
                    className="w-full mt-0.5 bg-transparent border-b border-teal-400/50 text-[11px] font-bold focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* TABS & CONTROLS */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex w-full md:w-auto bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button
              onClick={() => setActiveTab("kehadiran")}
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-[10px] md:text-[11px] font-black uppercase transition-all ${activeTab === "kehadiran" ? "bg-teal-500 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
            >
              Kehadiran
            </button>
            <button
              onClick={() => setActiveTab("penilaian")}
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-[10px] md:text-[11px] font-black uppercase transition-all ${activeTab === "penilaian" ? "bg-teal-500 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
            >
              Penilaian
            </button>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={addNewStudent}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-100 text-emerald-700 font-black text-[10px] uppercase rounded-xl hover:bg-emerald-200 transition-colors border border-emerald-200/50"
            >
              <Plus size={14} /> Tambah Data
            </button>
          </div>
        </div>

        {/* ================= TAMPILAN HP (MOBILE CARDS) ================= */}
        <div className="md:hidden space-y-3">
          {activeTab === "kehadiran" && filteredStudents.length > 0 && (
            <div className="mb-2 p-2 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-between shadow-sm">
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wide">
                Aksi Cepat:
              </span>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    markAllPresent(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="text-[9px] font-bold bg-white border border-emerald-200 text-emerald-700 px-2 py-1 rounded outline-none"
              >
                <option value="">Hadirkan Semua P...</option>
                {pertemuanCols.map((col, i) => (
                  <option key={col} value={col}>
                    Hadirkan P{i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

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
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  <div className="bg-slate-50 border-b border-slate-100 p-2 flex justify-between items-start">
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
                        className="w-full bg-transparent font-black text-slate-800 text-[11px] focus:outline-none focus:border-b focus:border-teal-500"
                        placeholder="Nama Siswa..."
                      />
                      <div className="flex gap-1 mt-0.5">
                        <select
                          value={s.kelas || ""}
                          onChange={(e) =>
                            handleStudentChange(s.id, "kelas", e.target.value)
                          }
                          className="text-[9px] text-slate-500 font-bold bg-transparent outline-none border border-slate-200 rounded px-1 flex-1 py-0"
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
                          className="text-[9px] text-slate-500 font-bold bg-transparent outline-none border border-slate-200 rounded px-1 flex-1 py-0"
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
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="p-2">
                    {activeTab === "kehadiran" ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-6 gap-1">
                          {pertemuanCols.map((col, i) => (
                            <div
                              key={col}
                              className="h-6 rounded bg-slate-50 border border-slate-100 text-[10px] shadow-sm relative overflow-hidden flex items-center justify-center"
                            >
                              <select
                                value={(s[col] || "").toLowerCase()}
                                onChange={(e) =>
                                  handleStudentChange(s.id, col, e.target.value)
                                }
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              >
                                <option value="">(Ksg)</option>
                                <option value="v">✔</option>
                                <option value="s">Sakit</option>
                                <option value="i">Izin</option>
                                <option value="a">Alpa</option>
                              </select>
                              <div className="pointer-events-none flex items-center justify-center w-full h-full">
                                {s[col] ? (
                                  renderAttendanceCell(s[col])
                                ) : (
                                  <span className="text-[8px] text-slate-300">
                                    P{i + 1}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-1.5 text-[9px] font-black">
                          <span className="text-blue-600">S: {att.s}</span>
                          <span className="text-amber-600">I: {att.i}</span>
                          <span className="text-red-600">A: {att.a}</span>
                          <span className="text-emerald-600 bg-emerald-50 px-1.5 rounded-sm border border-emerald-100">
                            T: {att.t}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-0.5">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">
                              Tugas
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
                                  className="w-full h-6 text-center bg-emerald-50 text-emerald-900 text-[10px] font-bold rounded border border-emerald-100 outline-none"
                                />
                              ))}
                            </div>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">
                              Ulangan
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
                                  className="w-full h-6 text-center bg-blue-50 text-blue-900 text-[10px] font-bold rounded border border-blue-100 outline-none"
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                          <div className="flex-1">
                            <span className="block text-[8px] font-bold text-slate-400 uppercase">
                              U. Umum
                            </span>
                            <input
                              type="number"
                              value={s.um || ""}
                              onChange={(e) =>
                                handleStudentChange(s.id, "um", e.target.value)
                              }
                              className="w-full h-7 text-center bg-white border border-amber-200 text-amber-900 text-[11px] font-black rounded-lg outline-none"
                            />
                          </div>
                          <div className="flex-1 bg-teal-50 rounded-lg p-1 border border-teal-100 text-center">
                            <span className="block text-[8px] font-black text-teal-600 uppercase">
                              Rapor
                            </span>
                            <span className="block text-sm font-black text-teal-800">
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
            <div className="text-center py-6 bg-white rounded-xl border border-dashed border-slate-300">
              <p className="text-[10px] font-bold text-slate-400">
                Tidak ada data untuk filter ini.
              </p>
            </div>
          )}
        </div>

        {/* ================= TAMPILAN PC / DEKSTOP (ULTRA-COMPACT TABLE) ================= */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          {/* Scroll Area untuk Tabel Padat */}
          <div className="overflow-x-auto overflow-y-auto max-h-[75vh] scrollbar-thin scrollbar-thumb-slate-200 p-0.5">
            <table className="w-full text-left border-collapse min-w-max">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[9px] font-black whitespace-nowrap sticky top-0 z-30 shadow-sm">
                <tr>
                  <th className="px-2 py-1.5 text-center bg-slate-100 w-8 align-middle">
                    No
                  </th>
                  <th className="px-2 py-1.5 bg-slate-100 min-w-[180px] align-middle border-r border-slate-200">
                    <div className="flex items-center justify-between">
                      Data Siswa
                      <button
                        onClick={toggleSort}
                        className="text-slate-400 hover:text-emerald-500 p-0.5 transition-colors"
                        title="Urutkan A-Z"
                      >
                        <ArrowUpDown size={12} />
                      </button>
                    </div>
                  </th>

                  {activeTab === "kehadiran" && (
                    <>
                      {/* HEADER TANGGAL */}
                      {pertemuanCols.map((_, i) => (
                        <th
                          key={i}
                          className="px-0.5 py-1 text-center border-r border-slate-200 w-10 align-top group/head bg-white"
                        >
                          <input
                            type="date"
                            value={meetingDates[i] || ""}
                            onChange={(e) =>
                              handleDateChange(i, e.target.value)
                            }
                            className="w-full text-[8px] bg-transparent outline-none text-slate-400 cursor-pointer text-center"
                          />
                          <div className="mt-0.5 border-t border-slate-100 pt-0.5 text-[9px] font-black flex flex-col items-center">
                            P{i + 1}
                            <button
                              onClick={() => markAllPresent(pertemuanCols[i])}
                              className="text-[7px] mt-0.5 bg-emerald-100 text-emerald-700 px-1 py-0 rounded hover:bg-emerald-200 w-full"
                            >
                              ✔ All
                            </button>
                          </div>
                        </th>
                      ))}
                      {/* STICKY HEADERS (KEHADIRAN) */}
                      <th className="px-1.5 py-1.5 text-center border-l-2 border-slate-300 bg-blue-50 text-blue-700 align-middle sticky right-[7.5rem] z-40 w-10 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">
                        S
                      </th>
                      <th className="px-1.5 py-1.5 text-center border-r border-amber-100 bg-amber-50 text-amber-700 align-middle sticky right-[5rem] z-40 w-10">
                        I
                      </th>
                      <th className="px-1.5 py-1.5 text-center border-r border-red-100 bg-red-50 text-red-700 align-middle sticky right-[2.5rem] z-40 w-10">
                        A
                      </th>
                      <th
                        className="px-1.5 py-1.5 text-center border-r border-emerald-100 bg-emerald-50 text-emerald-700 align-middle sticky right-0 z-40 w-10"
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
                          className="px-1 py-1.5 text-center border-r border-slate-200 w-10 bg-emerald-50/30 align-middle"
                        >
                          T{i + 1}
                        </th>
                      ))}
                      <th className="px-1.5 py-1.5 text-center border-r border-emerald-200 bg-emerald-100 text-emerald-800 align-middle">
                        R.Tgs
                      </th>

                      {uhCols.map((_, i) => (
                        <th
                          key={i}
                          className="px-1 py-1.5 text-center border-r border-slate-200 w-10 bg-blue-50/30 align-middle"
                        >
                          UH{i + 1}
                        </th>
                      ))}
                      <th className="px-1.5 py-1.5 text-center border-r border-blue-200 bg-blue-100 text-blue-800 align-middle">
                        R.UH
                      </th>

                      <th
                        className="px-2 py-1.5 text-center border-r border-slate-200 bg-slate-50 align-middle"
                        title="Rata-rata Harian"
                      >
                        NH
                      </th>
                      <th className="px-2 py-1.5 text-center border-r border-amber-200 bg-amber-50 text-amber-800 align-middle">
                        UM
                      </th>

                      {/* STICKY HEADERS (PENILAIAN) */}
                      <th className="px-2 py-1.5 text-center border-l-2 border-slate-300 bg-teal-100 text-teal-800 font-black text-[10px] align-middle sticky right-0 z-40 w-16 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">
                        RAPOR
                      </th>
                    </>
                  )}
                  {/* OPSI DIPINDAH KE KIRI JIKA DI PENILAIAN (AGAR RAPOR TETAP DI UJUNG KANAN) */}
                  {activeTab === "kehadiran" ? (
                    <th className="px-1 py-1.5 text-center bg-slate-100 border-l border-slate-200 align-middle w-8 opacity-0"></th> // Placeholder spacer
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[10px] text-slate-700">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={30}
                      className="text-center py-8 text-slate-400 font-bold"
                    >
                      Tidak ada data untuk kombinasi filter ini.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, idx) => {
                    const att = calculateAttendance(s);
                    const grades = calculateGrades(s);

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 group">
                        <td className="px-2 py-0.5 text-center font-bold text-slate-400 bg-white group-hover:bg-slate-50 relative">
                          {/* TOMBOL HAPUS (MUNCUL SAAT HOVER DI NOMOR) */}
                          <button
                            onClick={() => deleteStudent(s.id, s.nama_siswa)}
                            className="absolute left-1 top-1/2 -translate-y-1/2 p-0.5 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded"
                            title="Hapus"
                          >
                            <Trash2 size={10} />
                          </button>
                          <span className="group-hover:opacity-0 transition-opacity">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-2 py-0.5 bg-white group-hover:bg-slate-50 border-r border-slate-100">
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
                            className="w-full bg-transparent font-bold text-slate-800 text-[11px] focus:outline-none"
                            placeholder="Nama Siswa..."
                          />
                          <div className="flex gap-1 mt-0">
                            <select
                              value={s.kelas || ""}
                              onChange={(e) =>
                                handleStudentChange(
                                  s.id,
                                  "kelas",
                                  e.target.value,
                                )
                              }
                              className="text-[8px] text-slate-400 font-bold bg-transparent outline-none py-0"
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
                              className="text-[8px] text-slate-400 font-bold bg-transparent outline-none max-w-[70px] truncate py-0"
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
                            {/* SEL KEHADIRAN */}
                            {pertemuanCols.map((col) => (
                              <td
                                key={col}
                                className="px-0 py-0 text-center border-r border-slate-50 hover:bg-slate-100 relative"
                              >
                                <select
                                  value={(s[col] || "").toLowerCase()}
                                  onChange={(e) =>
                                    handleStudentChange(
                                      s.id,
                                      col,
                                      e.target.value,
                                    )
                                  }
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                >
                                  <option value="">-</option>
                                  <option value="v">✔ Hadir</option>
                                  <option value="s">Sakit</option>
                                  <option value="i">Izin</option>
                                  <option value="a">Alpa</option>
                                </select>
                                <div className="pointer-events-none flex items-center justify-center w-full h-5">
                                  {renderAttendanceCell(s[col])}
                                </div>
                              </td>
                            ))}

                            {/* STICKY BODY CELLS (KEHADIRAN) */}
                            <td className="px-1.5 py-0.5 text-center font-bold text-blue-600 bg-blue-50/50 group-hover:bg-blue-100/50 border-l-2 border-slate-200 sticky right-[7.5rem] z-20 w-10 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">
                              {att.s || "-"}
                            </td>
                            <td className="px-1.5 py-0.5 text-center font-bold text-amber-600 bg-amber-50/50 group-hover:bg-amber-100/50 border-r border-amber-100 sticky right-[5rem] z-20 w-10">
                              {att.i || "-"}
                            </td>
                            <td className="px-1.5 py-0.5 text-center font-bold text-red-600 bg-red-50/50 group-hover:bg-red-100/50 border-r border-red-100 sticky right-[2.5rem] z-20 w-10">
                              {att.a || "-"}
                            </td>
                            <td className="px-1.5 py-0.5 text-center font-black text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100 border-r border-emerald-100 sticky right-0 z-20 w-10">
                              {att.t || "-"}
                            </td>
                          </>
                        )}

                        {activeTab === "penilaian" && (
                          <>
                            {tugasCols.map((col) => (
                              <td
                                key={col}
                                className="px-0.5 py-0.5 border-r border-slate-50 bg-emerald-50/10"
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
                                  className="w-full h-5 text-center bg-transparent text-[10px] font-bold focus:outline-none focus:bg-white rounded"
                                />
                              </td>
                            ))}
                            <td className="px-1.5 py-0.5 text-center font-bold text-emerald-700 bg-emerald-50/50 border-r border-emerald-100">
                              {grades.avgT}
                            </td>

                            {uhCols.map((col) => (
                              <td
                                key={col}
                                className="px-0.5 py-0.5 border-r border-slate-50 bg-blue-50/10"
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
                                  className="w-full h-5 text-center bg-transparent text-[10px] font-bold focus:outline-none focus:bg-white rounded"
                                />
                              </td>
                            ))}
                            <td className="px-1.5 py-0.5 text-center font-bold text-blue-700 bg-blue-50/50 border-r border-blue-100">
                              {grades.avgUH}
                            </td>

                            <td className="px-2 py-0.5 text-center font-black text-slate-700 bg-slate-50/50 border-r border-slate-100">
                              {grades.nh}
                            </td>

                            <td className="px-0.5 py-0.5 border-r border-slate-100 bg-amber-50/20">
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
                                className="w-full h-5 text-center bg-white border border-amber-200 text-amber-900 text-[10px] font-black focus:outline-none rounded"
                              />
                            </td>

                            {/* STICKY BODY CELL (PENILAIAN - RAPOR) */}
                            <td className="px-2 py-0.5 text-center font-black text-[12px] border-l-2 border-slate-200 bg-teal-50 group-hover:bg-teal-100 text-teal-700 sticky right-0 z-20 w-16 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">
                              {grades.nr}
                            </td>
                          </>
                        )}
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
