// File: src/pages/tabs/NilaiTab.jsx
import React from "react";
import { Trash2 } from "lucide-react";
import EditableCell from "../../components/EditableCell";

export default function NilaiTab({
  filteredSiswa,
  nilaiData,
  handleInlineNilai,
  handleDeleteNilai,
}) {
  return (
    <div className="bg-white/90 shadow-sm border border-slate-200 rounded-xl md:rounded-2xl overflow-hidden">
      {/* TAMPILAN DESKTOP */}
      <div className="hidden md:block print:block w-full">
        <table className="w-full text-left table-auto">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-2 py-2 md:py-2.5 text-slate-500 text-center text-[9px] md:text-[10px] font-bold uppercase tracking-widest w-10 border-r border-slate-200">
                No
              </th>
              <th className="px-2 py-2 md:py-2.5 text-slate-500 text-center text-[9px] md:text-[10px] font-bold uppercase tracking-widest border-r border-slate-200">
                Siswa
              </th>
              <th className="px-2 py-2 md:py-2.5 text-slate-500 text-center text-[9px] md:text-[10px] font-bold uppercase tracking-widest w-14">
                Hafalan
              </th>
              <th className="px-2 py-2 md:py-2.5 text-slate-500 text-center text-[9px] md:text-[10px] font-bold uppercase tracking-widest w-14">
                Catatan
              </th>
              <th className="px-2 py-2 md:py-2.5 text-slate-500 text-center text-[9px] md:text-[10px] font-bold uppercase tracking-widest w-14">
                Ulangan
              </th>
              <th className="px-2 py-2 md:py-2.5 text-slate-500 text-center text-[9px] md:text-[10px] font-bold uppercase tracking-widest w-14">
                Ujian
              </th>
              <th className="px-2 py-2 md:py-2.5 text-teal-700 bg-teal-50 text-center text-[9px] md:text-[10px] font-bold uppercase tracking-widest w-16">
                Rata-Rata
              </th>
              <th className="px-2 py-2 md:py-2.5 text-slate-500 text-center text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                Keterangan
              </th>
              <th className="px-2 py-2 md:py-2.5 text-slate-500 text-center text-[9px] md:text-[10px] font-bold uppercase tracking-widest no-print w-10">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSiswa.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="py-8 text-center text-slate-400 font-medium text-[11px]"
                >
                  Data tidak ditemukan
                </td>
              </tr>
            ) : (
              filteredSiswa.map((s, idx) => {
                const n = nilaiData[String(s.id)] || {};
                const rata =
                  ((Number(n.hafalan) || 0) +
                    (Number(n.catatan) || 0) +
                    (Number(n.ulangan) || 0) +
                    (Number(n.ujian) || 0)) /
                  4;
                return (
                  <tr
                    key={s.id}
                    className="group hover:bg-teal-50/50 transition-colors"
                  >
                    <td className="px-2 py-1 border-r border-slate-100 text-slate-500 text-center text-[10px] md:text-[11px] font-semibold">
                      {idx + 1}
                    </td>
                    <td className="px-2 py-1 border-r border-slate-100 text-left text-slate-800 text-[10px] md:text-[11px] font-bold leading-snug">
                      {s.nama} <br />
                      <span className="text-[8px] text-slate-400 tracking-widest uppercase">
                        {s.kelas}
                      </span>
                    </td>
                    <td className="px-1 py-1 text-center text-[10px] md:text-[11px]">
                      <div className="w-12 mx-auto">
                        <EditableCell
                          alignCenter={true}
                          type="number"
                          value={n.hafalan}
                          onSave={(val) =>
                            handleInlineNilai(s.id, "hafalan", val)
                          }
                          placeholder="-"
                        />
                      </div>
                    </td>
                    <td className="px-1 py-1 text-center text-[10px] md:text-[11px]">
                      <div className="w-12 mx-auto">
                        <EditableCell
                          alignCenter={true}
                          type="number"
                          value={n.catatan}
                          onSave={(val) =>
                            handleInlineNilai(s.id, "catatan", val)
                          }
                          placeholder="-"
                        />
                      </div>
                    </td>
                    <td className="px-1 py-1 text-center text-[10px] md:text-[11px]">
                      <div className="w-12 mx-auto">
                        <EditableCell
                          alignCenter={true}
                          type="number"
                          value={n.ulangan}
                          onSave={(val) =>
                            handleInlineNilai(s.id, "ulangan", val)
                          }
                          placeholder="-"
                        />
                      </div>
                    </td>
                    <td className="px-1 py-1 text-center text-[10px] md:text-[11px]">
                      <div className="w-12 mx-auto">
                        <EditableCell
                          alignCenter={true}
                          type="number"
                          value={n.ujian}
                          onSave={(val) =>
                            handleInlineNilai(s.id, "ujian", val)
                          }
                          placeholder="-"
                        />
                      </div>
                    </td>
                    <td className="px-2 py-1 text-teal-700 bg-teal-50/50 text-center text-[10px] md:text-[11px] font-bold">
                      {rata > 0 ? rata.toFixed(1) : "-"}
                    </td>
                    <td className="px-2 py-1 text-center text-[10px] md:text-[11px]">
                      <EditableCell
                        alignCenter={true}
                        value={n.keterangan}
                        onSave={(val) =>
                          handleInlineNilai(s.id, "keterangan", val)
                        }
                        placeholder="..."
                      />
                    </td>
                    <td className="px-1 py-1 text-center no-print align-middle">
                      <button
                        onClick={() => handleDeleteNilai(s.id)}
                        className="p-1 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded shadow-sm border border-rose-200 transition-colors mx-auto flex"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* TAMPILAN MOBILE (TETAP) */}
      <div className="md:hidden print:hidden flex flex-col gap-3 p-3 bg-slate-50/50">
        {filteredSiswa.length === 0 ? (
          <p className="text-center py-10 text-slate-400 text-xs font-medium">
            Data tidak ditemukan
          </p>
        ) : (
          filteredSiswa.map((s, idx) => {
            const n = nilaiData[String(s.id)] || {};
            const rata =
              ((Number(n.hafalan) || 0) +
                (Number(n.catatan) || 0) +
                (Number(n.ulangan) || 0) +
                (Number(n.ujian) || 0)) /
              4;
            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
              >
                <div className="bg-slate-50/80 p-3 flex justify-between items-center border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">
                        {s.nama}
                      </div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        {s.kelas}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteNilai(s.id)}
                    className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="p-3 space-y-1">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 border-dashed">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Hafalan
                    </span>
                    <div className="w-20 text-right">
                      <EditableCell
                        type="number"
                        alignCenter={true}
                        value={n.hafalan}
                        onSave={(val) =>
                          handleInlineNilai(s.id, "hafalan", val)
                        }
                        placeholder="-"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 border-dashed">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Catatan
                    </span>
                    <div className="w-20 text-right">
                      <EditableCell
                        type="number"
                        alignCenter={true}
                        value={n.catatan}
                        onSave={(val) =>
                          handleInlineNilai(s.id, "catatan", val)
                        }
                        placeholder="-"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 border-dashed">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Ulangan
                    </span>
                    <div className="w-20 text-right">
                      <EditableCell
                        type="number"
                        alignCenter={true}
                        value={n.ulangan}
                        onSave={(val) =>
                          handleInlineNilai(s.id, "ulangan", val)
                        }
                        placeholder="-"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 border-dashed">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Ujian
                    </span>
                    <div className="w-20 text-right">
                      <EditableCell
                        type="number"
                        alignCenter={true}
                        value={n.ujian}
                        onSave={(val) => handleInlineNilai(s.id, "ujian", val)}
                        placeholder="-"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Keterangan
                    </span>
                    <div className="w-40 text-right">
                      <EditableCell
                        alignCenter={true}
                        value={n.keterangan}
                        onSave={(val) =>
                          handleInlineNilai(s.id, "keterangan", val)
                        }
                        placeholder="..."
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-teal-50/50 p-3 border-t border-teal-100 flex justify-between items-center">
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
                    Rata-Rata
                  </span>
                  <span className="text-base font-black text-teal-700">
                    {rata > 0 ? rata.toFixed(1) : "-"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
