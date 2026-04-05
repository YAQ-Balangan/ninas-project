// File: src/pages/tabs/KisiTab.jsx
import React from "react";
import { Printer, Trash2 } from "lucide-react";
import EditableCell from "../../components/EditableCell";

export default function KisiTab({
  filteredKisi,
  kelasOptions,
  handleInlineKisi,
  handleDeleteKisi,
  openModal,
}) {
  return (
    <div className="bg-white/90 shadow-sm border border-slate-200 rounded-xl md:rounded-2xl overflow-hidden">
      {/* TAMPILAN DESKTOP */}
      <div className="hidden md:block print:block w-full">
        <table className="w-full text-left table-fixed">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-2 py-2 md:py-2.5 text-slate-500 text-center text-[9px] md:text-[10px] font-bold uppercase tracking-widest w-10 border-r border-slate-200">
                No
              </th>
              <th className="px-3 py-2 md:py-2.5 text-slate-500 text-left text-[9px] md:text-[10px] font-bold uppercase tracking-widest w-24 border-r border-slate-200">
                Kelas
              </th>
              <th className="px-2 py-2 md:py-2.5 text-slate-500 text-left text-[9px] md:text-[10px] font-bold uppercase tracking-widest w-20">
                Tahun
              </th>
              <th className="px-3 py-2 md:py-2.5 text-slate-500 text-left text-[9px] md:text-[10px] font-bold uppercase tracking-widest w-40">
                Mata Pelajaran
              </th>
              <th className="px-2 py-2 md:py-2.5 text-slate-500 text-center text-[9px] md:text-[10px] font-bold uppercase tracking-widest w-28">
                Judul
              </th>
              <th className="px-3 py-2 md:py-2.5 text-slate-500 text-left text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                Materi Pokok / Indikator
              </th>
              <th className="px-2 py-2 md:py-2.5 text-slate-500 text-center text-[9px] md:text-[10px] font-bold uppercase tracking-widest no-print w-20">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredKisi.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-slate-400 font-medium text-[11px]"
                >
                  Data tidak ditemukan
                </td>
              </tr>
            ) : (
              filteredKisi.map((k, idx) => (
                <tr
                  key={k.id}
                  className="group hover:bg-indigo-50/50 transition-colors align-top"
                >
                  <td className="px-2 py-1.5 border-r border-slate-100 text-slate-500 text-center text-[10px] md:text-[11px] font-semibold">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-1.5 border-r border-slate-100 text-slate-800 text-[10px] md:text-[11px] font-bold">
                    <EditableCell
                      type="select"
                      options={kelasOptions}
                      value={k.kelas || ""}
                      onSave={(val) => handleInlineKisi(k.id, "kelas", val)}
                    />
                  </td>
                  <td className="px-2 py-1.5 text-[10px] md:text-[11px]">
                    <EditableCell
                      value={k.tahun}
                      onSave={(val) => handleInlineKisi(k.id, "tahun", val)}
                      placeholder="25/26"
                    />
                  </td>
                  <td className="px-3 py-1.5 text-[10px] md:text-[11px] leading-snug">
                    <EditableCell
                      value={k.mata_pelajaran}
                      onSave={(val) =>
                        handleInlineKisi(k.id, "mata_pelajaran", val)
                      }
                      placeholder="Mapel..."
                    />
                  </td>
                  <td className="px-2 py-1.5 text-[10px] md:text-[11px] text-center">
                    <EditableCell
                      type="text"
                      value={k.jenis_ujian}
                      onSave={(val) =>
                        handleInlineKisi(k.id, "jenis_ujian", val)
                      }
                      placeholder="Cth: SUMATIF AKHIR SEMESTER II"
                    />
                  </td>
                  <td className="px-3 py-1.5 text-[10px] md:text-[11px] leading-snug">
                    <EditableCell
                      type="kisi_editor"
                      value={k.materi}
                      onSave={(val) => handleInlineKisi(k.id, "materi", val)}
                      placeholder="Klik untuk mengelola baris soal..."
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center no-print">
                    <div className="flex flex-col xl:flex-row items-center justify-center gap-1">
                      <button
                        onClick={() =>
                          openModal("cetak_kisi", { kelas: k.kelas }, k)
                        }
                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded text-[9px] tracking-wide shadow-sm border border-indigo-200 transition-colors uppercase"
                      >
                        <Printer size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteKisi(k.id)}
                        className="p-1 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded shadow-sm border border-rose-200 transition-colors"
                      >
                        <Trash2 size={12} />
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
        {filteredKisi.length === 0 ? (
          <div className="py-10 text-center text-slate-400 font-semibold text-sm bg-white rounded-xl border border-slate-200">
            Data tidak ditemukan.
          </div>
        ) : (
          filteredKisi.map((k, idx) => (
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
                {/* 👇 PERUBAHAN DI SINI: Jenis Ujian menjadi Teks Bebas di Mobile 👇 */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                    Jenis Ujian
                  </span>
                  <div className="text-sm text-slate-700">
                    <EditableCell
                      type="text"
                      value={k.jenis_ujian}
                      onSave={(val) =>
                        handleInlineKisi(k.id, "jenis_ujian", val)
                      }
                      placeholder="Cth: SUMATIF AKHIR SEMESTER II"
                    />
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                    Materi Pokok / Indikator
                  </span>
                  <div className="text-sm text-slate-700">
                    <EditableCell
                      type="kisi_editor"
                      value={k.materi}
                      onSave={(val) => handleInlineKisi(k.id, "materi", val)}
                      placeholder="Klik untuk mengelola baris soal..."
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
