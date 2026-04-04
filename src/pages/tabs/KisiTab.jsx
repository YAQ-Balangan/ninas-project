// File: src/pages/tabs/KisiTab.jsx
import React from "react";
import { Printer, Trash2 } from "lucide-react";
import EditableCell from "../../components/EditableCell";

export default function KisiTab({
  kisiData,
  kelasOptions,
  handleInlineKisi,
  handleDeleteKisi,
  openModal,
}) {
  return (
    <div className="bg-white/90 shadow-sm border border-slate-200 rounded-xl md:rounded-2xl overflow-hidden">
      {/* TAMPILAN DESKTOP */}
      <div className="hidden md:block print:block w-full overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="sticky left-0 z-30 bg-slate-50 w-12 min-w-[3rem] max-w-[3rem] border-r border-slate-200 px-2 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap outline outline-1 outline-slate-200">
                No
              </th>
              <th className="sticky left-12 z-30 bg-slate-50 min-w-[150px] border-r border-slate-200 shadow-[4px_0_10px_rgba(0,0,0,0.04)] px-4 py-4 text-slate-500 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap outline outline-1 outline-slate-200">
                Kelas
              </th>
              <th className="px-4 py-4 text-slate-500 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest w-28 whitespace-nowrap">
                Tahun
              </th>
              <th className="px-4 py-4 text-slate-500 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest min-w-[180px]">
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
            {kisiData.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-10 text-center text-slate-400 font-semibold text-sm"
                >
                  Belum ada data kisi-kisi. Klik tombol "+ Kisi-Kisi" di atas.
                </td>
              </tr>
            ) : (
              kisiData.map((k, idx) => (
                <tr
                  key={k.id}
                  className="group hover:bg-indigo-50/50 transition-colors align-top"
                >
                  <td className="sticky left-0 z-20 bg-white group-hover:bg-[#eef2ff] w-12 min-w-[3rem] max-w-[3rem] border-r border-slate-100 px-2 py-3 text-slate-500 text-center text-[10px] md:text-xs font-semibold whitespace-nowrap">
                    {idx + 1}
                  </td>
                  <td className="sticky left-12 z-20 bg-white group-hover:bg-[#eef2ff] min-w-[150px] border-r border-slate-200 shadow-[4px_0_10px_rgba(0,0,0,0.04)] px-4 py-3 text-slate-800 text-[10px] md:text-xs font-bold whitespace-nowrap">
                    <EditableCell
                      type="select"
                      options={kelasOptions}
                      value={k.kelas || ""}
                      onSave={(val) => handleInlineKisi(k.id, "kelas", val)}
                    />
                  </td>
                  <td className="px-4 py-3 text-xs md:text-sm">
                    <EditableCell
                      value={k.tahun}
                      onSave={(val) => handleInlineKisi(k.id, "tahun", val)}
                      placeholder="2025/2026"
                    />
                  </td>
                  <td className="px-4 py-3 text-xs md:text-sm">
                    <EditableCell
                      value={k.mata_pelajaran}
                      onSave={(val) =>
                        handleInlineKisi(k.id, "mata_pelajaran", val)
                      }
                      placeholder="B. Indonesia..."
                    />
                  </td>
                  <td className="px-4 py-3 text-xs md:text-sm text-center">
                    <EditableCell
                      type="select"
                      options={[
                        "Ulangan Harian",
                        "UTS",
                        "UAS",
                        "Ujian Praktik",
                      ]}
                      value={k.jenis_ujian || "UAS"}
                      onSave={(val) =>
                        handleInlineKisi(k.id, "jenis_ujian", val)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-xs md:text-sm">
                    <EditableCell
                      value={k.materi}
                      onSave={(val) => handleInlineKisi(k.id, "materi", val)}
                      placeholder="Tulis materi pokok..."
                    />
                  </td>
                  <td className="px-4 py-3 text-center no-print align-middle">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() =>
                          openModal("cetak_kisi", { kelas: k.kelas }, k)
                        }
                        className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[10px] tracking-wide shadow-sm border border-indigo-200 transition-colors uppercase flex items-center gap-1"
                      >
                        <Printer size={14} /> Lihat
                      </button>
                      <button
                        onClick={() => handleDeleteKisi(k.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white font-bold rounded-lg shadow-sm border border-rose-200 transition-colors"
                        title="Hapus Kisi-Kisi"
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

      {/* TAMPILAN MOBILE */}
      <div className="md:hidden print:hidden flex flex-col gap-4 p-3 bg-slate-50/50">
        {kisiData.length === 0 ? (
          <div className="py-10 text-center text-slate-400 font-semibold text-sm bg-white rounded-xl border border-slate-200">
            Belum ada data kisi-kisi. Tambahkan di pojok kanan atas.
          </div>
        ) : (
          kisiData.map((k, idx) => (
            <div
              key={k.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
            >
              <div className="bg-slate-50/80 p-3 flex justify-between items-center border-b border-slate-100">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 font-bold text-sm text-slate-800 uppercase">
                    <EditableCell
                      type="select"
                      options={kelasOptions}
                      value={k.kelas || ""}
                      onSave={(val) => handleInlineKisi(k.id, "kelas", val)}
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteKisi(k.id)}
                  className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors ml-2"
                >
                  <Trash2 size={16} />
                </button>
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
                        onSave={(val) => handleInlineKisi(k.id, "tahun", val)}
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
                          handleInlineKisi(k.id, "mata_pelajaran", val)
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
                        "UTS",
                        "UAS",
                        "Ujian Praktik",
                      ]}
                      value={k.jenis_ujian || "UAS"}
                      onSave={(val) =>
                        handleInlineKisi(k.id, "jenis_ujian", val)
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
                      onSave={(val) => handleInlineKisi(k.id, "materi", val)}
                      placeholder="Ketik rincian materi..."
                    />
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white border-t border-slate-100">
                <button
                  onClick={() => openModal("cetak_kisi", { kelas: k.kelas }, k)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Printer size={16} /> Cetak Kisi-Kisi A4
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
