import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  User,
  MapPin,
  Calendar,
  BookOpen,
  GraduationCap,
  Save,
  Plus,
  ArrowLeft,
  Check,
  X,
} from "lucide-react";

export default function Absensi({ onBack }) {
  const [activeTab, setActiveTab] = useState("kehadiran"); // 'kehadiran' | 'penilaian'

  // State Identitas & Settings (Bisa di-CRUD)
  const [settings, setSettings] = useState({
    guru: "Ahmad Maulana",
    alamat: "Jl. Pendidikan No. 1, Banjarmasin",
    semester: "Ganjil",
    tahunAjaran: "2025/2026",
    kelas: "X MIPA 1",
    mapel: "Pendidikan Agama Islam",
  });

  // State Data Tabel (Dalam prakteknya, fetch dari Supabase di useEffect)
  const [students, setStudents] = useState([
    {
      id: 1,
      nama_siswa: "Aditya Pratama",
      p1: "v",
      p2: "v",
      p3: "i",
      t1: 80,
      t2: 85,
      uh1: 75,
      um: 70,
    },
    {
      id: 2,
      nama_siswa: "Bunga Lestari",
      p1: "v",
      p2: "s",
      p3: "v",
      t1: 90,
      t2: 85,
      uh1: 88,
      um: 85,
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);

  // Array Helper untuk Render Kolom
  const pertemuanCols = Array.from({ length: 18 }, (_, i) => `p${i + 1}`);
  const tugasCols = ["t1", "t2", "t3", "t4", "t5"];
  const uhCols = ["uh1", "uh2", "uh3"];

  // ================= CALCULATIONS ================= //
  const calculateAttendance = (student) => {
    let s = 0,
      i = 0,
      a = 0;
    pertemuanCols.forEach((col) => {
      const val = (student[col] || "").toLowerCase();
      if (val === "s") s++;
      if (val === "i") i++;
      if (val === "a") a++;
    });
    return { s, i, a };
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

    // Rata Harian (Rata-rata dari Tugas dan UH)
    const nh = (avgT + avgUH) / (avgT > 0 && avgUH > 0 ? 2 : 1);
    const um = parseFloat(student.um) || 0;

    // Rumus: (nh + (2 * UM)) / 3
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
    const newId = Date.now(); // Gunakan UUID/Supabase ID di produksi
    setStudents([...students, { id: newId, nama_siswa: "Siswa Baru" }]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Pasang fungsi Supabase .upsert() ke tabel absensi_ahmad disini
    setTimeout(() => {
      setIsSaving(false);
      alert("Data berhasil disimpan ke database!");
    }, 800);
  };

  // ================= RENDER HELPERS ================= //
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER / BANNER */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-teal-600 to-emerald-700 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden"
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-4 w-full max-w-3xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight drop-shadow-md">
                  Panel Guru: {settings.guru}
                </h1>
              </div>

              {/* Editable Settings Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <div>
                  <label className="text-[10px] text-teal-100 uppercase font-bold tracking-wider flex items-center gap-1">
                    <GraduationCap size={12} /> Kelas
                  </label>
                  <input
                    type="text"
                    value={settings.kelas}
                    onChange={(e) =>
                      handleSettingChange("kelas", e.target.value)
                    }
                    className="w-full bg-transparent border-b border-teal-400/50 text-sm font-bold focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-teal-100 uppercase font-bold tracking-wider flex items-center gap-1">
                    <BookOpen size={12} /> Mapel
                  </label>
                  <input
                    type="text"
                    value={settings.mapel}
                    onChange={(e) =>
                      handleSettingChange("mapel", e.target.value)
                    }
                    className="w-full bg-transparent border-b border-teal-400/50 text-sm font-bold focus:outline-none focus:border-white transition-colors"
                  />
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
                    className="w-full bg-transparent border-b border-teal-400/50 text-sm font-bold focus:outline-none focus:border-white [&>option]:text-slate-800 transition-colors"
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
                    className="w-full bg-transparent border-b border-teal-400/50 text-sm font-bold focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-white text-teal-700 font-black rounded-xl hover:scale-105 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)]"
            >
              {isSaving ? (
                <span className="animate-pulse">Menyimpan...</span>
              ) : (
                <>
                  <Save size={18} /> Simpan Data
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* TABS & CONTROLS */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
            <button
              onClick={() => setActiveTab("kehadiran")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${activeTab === "kehadiran" ? "bg-teal-500 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
            >
              Absensi Kehadiran
            </button>
            <button
              onClick={() => setActiveTab("penilaian")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${activeTab === "penilaian" ? "bg-teal-500 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
            >
              Buku Penilaian
            </button>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={addNewStudent}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 font-bold text-xs uppercase rounded-xl hover:bg-emerald-200 transition-colors"
            >
              <Plus size={16} /> Tambah Siswa
            </button>
            <button
              onClick={handleSave}
              className="md:hidden flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white font-bold text-xs uppercase rounded-xl"
            >
              <Save size={16} /> Simpan
            </button>
          </div>
        </div>

        {/* TABEL AREA */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="overflow-x-auto p-1">
            <table className="w-full text-left border-collapse min-w-max">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-black whitespace-nowrap">
                <tr>
                  <th className="px-4 py-4 text-center sticky left-0 bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-12">
                    No
                  </th>
                  <th className="px-4 py-4 sticky left-[3rem] bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[200px]">
                    Nama Siswa
                  </th>

                  {activeTab === "kehadiran" && (
                    <>
                      {pertemuanCols.map((_, i) => (
                        <th
                          key={i}
                          className="px-2 py-4 text-center border-l border-slate-200 w-10"
                          title={`Pertemuan ${i + 1}`}
                        >
                          P{i + 1}
                        </th>
                      ))}
                      <th className="px-3 py-4 text-center border-l border-slate-200 bg-blue-50 text-blue-700">
                        S
                      </th>
                      <th className="px-3 py-4 text-center bg-amber-50 text-amber-700">
                        I
                      </th>
                      <th className="px-3 py-4 text-center bg-red-50 text-red-700">
                        A
                      </th>
                    </>
                  )}

                  {activeTab === "penilaian" && (
                    <>
                      {tugasCols.map((_, i) => (
                        <th
                          key={i}
                          className="px-2 py-4 text-center border-l border-slate-200 w-16 bg-emerald-50/50"
                        >
                          T{i + 1}
                        </th>
                      ))}
                      <th className="px-3 py-4 text-center bg-emerald-100 text-emerald-800">
                        R. Tgs
                      </th>

                      {uhCols.map((_, i) => (
                        <th
                          key={i}
                          className="px-2 py-4 text-center border-l border-slate-200 w-16 bg-blue-50/50"
                        >
                          UH{i + 1}
                        </th>
                      ))}
                      <th className="px-3 py-4 text-center bg-blue-100 text-blue-800">
                        R. UH
                      </th>

                      <th
                        className="px-4 py-4 text-center border-l border-slate-300 bg-slate-100"
                        title="Rata-rata Harian (Tugas + UH)"
                      >
                        Nilai Harian (nh)
                      </th>
                      <th className="px-4 py-4 text-center border-l border-slate-300 bg-amber-50 text-amber-800">
                        Ulangan Umum (UM)
                      </th>
                      <th className="px-4 py-4 text-center border-l border-slate-300 bg-teal-100 text-teal-800 font-black text-xs">
                        NILAI RAPOR
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s, idx) => {
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
                          value={s.nama_siswa}
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
                      </td>

                      {activeTab === "kehadiran" && (
                        <>
                          {pertemuanCols.map((col) => (
                            <td
                              key={col}
                              onClick={() => cycleAttendance(s.id, col, s[col])}
                              className="px-2 py-3 text-center border-l border-slate-100 cursor-pointer hover:bg-slate-200 transition-colors select-none"
                            >
                              {renderAttendanceCell(s[col])}
                            </td>
                          ))}
                          <td className="px-3 py-3 text-center font-bold text-blue-600 bg-blue-50/30 border-l border-slate-200">
                            {att.s || "-"}
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-amber-600 bg-amber-50/30">
                            {att.i || "-"}
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-red-600 bg-red-50/30">
                            {att.a || "-"}
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
                                  handleStudentChange(s.id, col, e.target.value)
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
                                  handleStudentChange(s.id, col, e.target.value)
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
                                handleStudentChange(s.id, "um", e.target.value)
                              }
                              className="w-full text-center bg-white border border-amber-200 text-amber-900 text-sm font-black focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-lg p-1.5 shadow-inner"
                            />
                          </td>

                          <td className="px-4 py-3 text-center font-black text-lg border-l border-slate-200 bg-teal-50/50 text-teal-700">
                            {grades.nr}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
