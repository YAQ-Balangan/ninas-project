// File: src/pages/views/TabKisi.jsx
import React from "react";
import { Printer } from "lucide-react";
import EditableCell from "../../components/EditableCell";

export default function TabKisi({
  filteredSiswa,
  kisiData,
  handleInlineKisi,
  openModal,
}) {
  return (
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
                      onSave={(val) => handleInlineKisi(s.id, "tahun", val)}
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
                        "PTS",
                        "PAS",
                        "Ujian Praktik",
                      ]}
                      value={k.jenis_ujian || "Ulangan Harian"}
                      onSave={(val) =>
                        handleInlineKisi(s.id, "jenis_ujian", val)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-xs md:text-sm">
                    <EditableCell
                      value={k.materi}
                      onSave={(val) => handleInlineKisi(s.id, "materi", val)}
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
                        onSave={(val) => handleInlineKisi(s.id, "tahun", val)}
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
                        "PTS",
                        "PAS",
                        "Ujian Praktik",
                      ]}
                      value={k.jenis_ujian || "Ulangan Harian"}
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
                      onSave={(val) => handleInlineKisi(s.id, "materi", val)}
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
  );
}
