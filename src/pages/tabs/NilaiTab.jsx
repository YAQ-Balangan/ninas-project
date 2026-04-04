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
              <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                Hafalan
              </th>
              <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                Catatan
              </th>
              <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest leading-tight whitespace-nowrap">
                Ulangan
              </th>
              <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                Ujian
              </th>
              <th className="px-4 py-4 text-teal-700 bg-teal-50 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                Rata-Rata
              </th>
              <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap min-w-[150px]">
                Keterangan
              </th>
              <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest no-print whitespace-nowrap">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSiswa.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="py-10 text-center text-slate-400 font-medium"
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
                    <td className="sticky left-0 z-20 bg-white group-hover:bg-[#f0fdfa] w-12 min-w-[3rem] max-w-[3rem] border-r border-slate-100 px-2 py-3 text-slate-500 text-center text-[10px] md:text-xs font-semibold whitespace-nowrap">
                      {idx + 1}
                    </td>
                    <td className="sticky left-12 z-20 bg-white group-hover:bg-[#f0fdfa] min-w-[200px] border-r border-slate-200 shadow-[4px_0_10px_rgba(0,0,0,0.04)] px-4 py-3 text-left text-slate-800 text-[10px] md:text-xs font-bold whitespace-nowrap">
                      {s.nama} <br />
                      <span className="text-[7px] md:text-[9px] text-slate-400 tracking-widest uppercase">
                        {s.kelas}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="w-16 mx-auto">
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
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="w-16 mx-auto">
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
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="w-16 mx-auto">
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
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="w-16 mx-auto">
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
                    <td className="px-4 py-3 text-teal-700 bg-teal-50/50 text-center text-[11px] md:text-xs font-bold whitespace-nowrap">
                      {rata > 0 ? rata.toFixed(1) : "-"}
                    </td>
                    <td className="px-4 py-3 text-center min-w-[150px]">
                      <EditableCell
                        alignCenter={true}
                        value={n.keterangan}
                        onSave={(val) =>
                          handleInlineNilai(s.id, "keterangan", val)
                        }
                        placeholder="..."
                      />
                    </td>
                    <td className="px-4 py-3 text-center no-print align-middle">
                      <button
                        onClick={() => handleDeleteNilai(s.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white font-bold rounded-lg shadow-sm border border-rose-200 transition-colors mx-auto flex"
                        title="Reset Nilai"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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
