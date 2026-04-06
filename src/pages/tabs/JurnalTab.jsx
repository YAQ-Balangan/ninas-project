// File: src/pages/tabs/JurnalTab.jsx
import React from "react";
import { Printer, Trash2 } from "lucide-react";
import EditableCell from "../../components/EditableCell";

export default function JurnalTab({
  filteredSiswa,
  jurnalData,
  handleInlineJurnal,
  openModal,
  handleDeleteJurnal,
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
              <th className="px-3 py-2 md:py-2.5 text-slate-500 text-left text-[9px] md:text-[10px] font-bold uppercase tracking-widest w-36 border-r border-slate-200">
                Siswa
              </th>
              <th className="px-2 py-2 md:py-2.5 text-slate-500 text-left text-[9px] md:text-[10px] font-bold uppercase tracking-widest w-20">
                Tahun
              </th>
              <th className="px-3 py-2 md:py-2.5 text-slate-500 text-left text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                Potensi
              </th>
              <th className="px-3 py-2 md:py-2.5 text-slate-500 text-left text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                Catatan Observasi
              </th>
              <th className="px-3 py-2 md:py-2.5 text-slate-500 text-left text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                Rekomendasi
              </th>
              <th className="px-2 py-2 md:py-2.5 text-slate-500 text-center text-[9px] md:text-[10px] font-bold uppercase tracking-widest no-print w-20">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSiswa.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-slate-400 font-medium text-[11px]"
                >
                  Data tidak ditemukan
                </td>
              </tr>
            ) : (
              filteredSiswa.map((s, idx) => {
                const j = jurnalData[String(s.id)] || {};
                return (
                  <tr
                    key={s.id}
                    className="group hover:bg-teal-50/50 transition-colors align-top"
                  >
                    <td className="px-2 py-1.5 border-r border-slate-100 text-slate-500 text-center text-[10px] md:text-[11px] font-semibold">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-1.5 border-r border-slate-100 text-slate-800 text-[10px] md:text-[11px] font-bold leading-snug">
                      <div className="line-clamp-2">{s.nama}</div>
                      <span className="text-[8px] text-slate-400 tracking-widest uppercase mt-0.5 inline-block">
                        {s.kelas}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-[10px] md:text-[11px]">
                      <EditableCell
                        value={j.tahun}
                        onSave={(val) => handleInlineJurnal(s.id, "tahun", val)}
                        placeholder="2025/2026"
                      />
                    </td>
                    <td className="px-3 py-1.5 text-[10px] md:text-[11px] leading-snug">
                      <EditableCell
                        value={j.potensi}
                        onSave={(val) =>
                          handleInlineJurnal(s.id, "potensi", val)
                        }
                        placeholder="Tulis potensi..."
                      />
                    </td>
                    <td className="px-3 py-1.5 text-[10px] md:text-[11px] leading-snug">
                      <EditableCell
                        value={j.catatan_observasi}
                        onSave={(val) =>
                          handleInlineJurnal(s.id, "catatan_observasi", val)
                        }
                        placeholder="Tulis catatan..."
                      />
                    </td>
                    <td className="px-3 py-1.5 text-[10px] md:text-[11px] leading-snug">
                      <EditableCell
                        value={j.rekomendasi}
                        onSave={(val) =>
                          handleInlineJurnal(s.id, "rekomendasi", val)
                        }
                        placeholder="Tulis rekomendasi..."
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center no-print">
                      <div className="flex flex-col xl:flex-row items-center justify-center gap-1">
                        <button
                          onClick={() => openModal("cetak_jurnal", s, j)}
                          className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold rounded text-[9px] tracking-wide shadow-sm border border-teal-200 transition-colors uppercase"
                        >
                          <Printer size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteJurnal(s.id)}
                          className="p-1 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded shadow-sm border border-rose-200 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* TAMPILAN MOBILE (TETAP) */}
      <div className="md:hidden print:hidden flex flex-col gap-4 p-3 bg-slate-50/50">
        {filteredSiswa.length === 0 ? (
          <p className="text-center py-10 text-slate-400 text-xs font-medium">
            Data tidak ditemukan
          </p>
        ) : (
          filteredSiswa.map((s, idx) => {
            const j = jurnalData[String(s.id)] || {};
            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
              >
                <div className="bg-slate-50/80 p-3 flex justify-between items-center border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-black text-xs shrink-0">
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
                  <button
                    onClick={() => handleDeleteJurnal(s.id)}
                    className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="p-3 space-y-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                      Tahun Ajaran
                    </span>
                    <div className="text-sm font-semibold text-slate-700">
                      <EditableCell
                        value={j.tahun}
                        onSave={(val) => handleInlineJurnal(s.id, "tahun", val)}
                        placeholder="2025/2026"
                      />
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                      Potensi Siswa
                    </span>
                    <div className="text-sm text-slate-700">
                      <EditableCell
                        value={j.potensi}
                        onSave={(val) =>
                          handleInlineJurnal(s.id, "potensi", val)
                        }
                        placeholder="Ketik potensi..."
                      />
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                      Catatan Observasi
                    </span>
                    <div className="text-sm text-slate-700">
                      <EditableCell
                        value={j.catatan_observasi}
                        onSave={(val) =>
                          handleInlineJurnal(s.id, "catatan_observasi", val)
                        }
                        placeholder="Ketik catatan..."
                      />
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                      Rekomendasi
                    </span>
                    <div className="text-sm text-slate-700">
                      <EditableCell
                        value={j.rekomendasi}
                        onSave={(val) =>
                          handleInlineJurnal(s.id, "rekomendasi", val)
                        }
                        placeholder="Ketik rekomendasi..."
                      />
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-white border-t border-slate-100">
                  <button
                    onClick={() => openModal("cetak_jurnal", s, j)}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <Printer size={16} /> Cetak Jurnal A4
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
