import React from "react";
import { Edit, Trash2, ReceiptText } from "lucide-react";
import EditableCell from "../../components/EditableCell";

export default function KeuanganTab({
  filteredKeuangan,
  siswaData,
  handleInlineKeuangan,
  openModal,
  handleDeleteKeuangan,
  formatRp,
  formatTanggalLengkap,
}) {
  return (
    <div className="bg-white/90 shadow-sm border border-slate-200 rounded-xl md:rounded-2xl overflow-hidden">
      <div className="hidden md:block print:block w-full overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="sticky left-0 z-30 bg-slate-50 w-12 min-w-[3rem] max-w-[3rem] border-r border-slate-200 px-2 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap outline outline-1 outline-slate-200">
                No
              </th>
              <th className="sticky left-12 z-30 bg-slate-50 min-w-[200px] border-r border-slate-200 shadow-[4px_0_10px_rgba(0,0,0,0.04)] px-4 py-4 text-slate-500 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap outline outline-1 outline-slate-200">
                Siswa
              </th>
              <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                Tgl Bayar
              </th>
              <th className="px-4 py-4 text-slate-500 text-right text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                Infaq
              </th>
              <th className="px-4 py-4 text-slate-500 text-right text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                Daftar Ulang
              </th>
              <th className="px-4 py-4 text-slate-500 text-right text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                Konsumsi
              </th>
              <th className="px-4 py-4 text-slate-500 text-right text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                Makan
              </th>
              <th className="px-4 py-4 text-teal-700 bg-teal-50 text-right text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                Total
              </th>
              <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                Metode
              </th>
              <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-4 text-slate-500 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest no-print whitespace-nowrap">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredKeuangan.length === 0 ? (
              <tr>
                <td
                  colSpan="11"
                  className="py-10 text-center text-slate-400 font-medium"
                >
                  Data tidak ditemukan
                </td>
              </tr>
            ) : (
              filteredKeuangan.map((k, idx) => {
                const s =
                  siswaData.find(
                    (siswa) => String(siswa.id) === String(k.siswa_id),
                  ) || {};
                const total =
                  (Number(k.infaq) || 0) +
                  (Number(k.cicilan) || 0) +
                  (Number(k.konsumsi) || 0) +
                  (Number(k.makan) || 0);
                return (
                  <tr
                    key={k.id || idx}
                    className="group hover:bg-teal-50/50 transition-colors"
                  >
                    <td className="sticky left-0 z-20 bg-white group-hover:bg-[#f0fdfa] w-12 min-w-[3rem] max-w-[3rem] border-r border-slate-100 px-2 py-3 text-slate-500 text-center text-[10px] md:text-xs font-semibold whitespace-nowrap">
                      {idx + 1}
                    </td>
                    <td className="sticky left-12 z-20 bg-white group-hover:bg-[#f0fdfa] min-w-[200px] border-r border-slate-200 shadow-[4px_0_10px_rgba(0,0,0,0.04)] px-4 py-3 text-left text-slate-800 text-[10px] md:text-xs font-bold whitespace-nowrap">
                      {s.nama || "Siswa Dihapus"} <br />
                      <span className="text-[7px] md:text-[9px] text-slate-400 tracking-widest uppercase">
                        {s.kelas || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="w-28 mx-auto">
                        <EditableCell
                          alignCenter={true}
                          type="date"
                          value={k.tanggal}
                          onSave={(val) =>
                            handleInlineKeuangan(k.id, "tanggal", val)
                          }
                          placeholder="-"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="w-24 ml-auto">
                        <EditableCell
                          type="number"
                          isCurrency
                          value={k.infaq}
                          onSave={(val) =>
                            handleInlineKeuangan(k.id, "infaq", val)
                          }
                          placeholder="0"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="w-24 ml-auto">
                        <EditableCell
                          type="number"
                          isCurrency
                          value={k.cicilan}
                          onSave={(val) =>
                            handleInlineKeuangan(k.id, "cicilan", val)
                          }
                          placeholder="0"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="w-24 ml-auto">
                        <EditableCell
                          type="number"
                          isCurrency
                          value={k.konsumsi}
                          onSave={(val) =>
                            handleInlineKeuangan(k.id, "konsumsi", val)
                          }
                          placeholder="0"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="w-24 ml-auto">
                        <EditableCell
                          type="number"
                          isCurrency
                          value={k.makan}
                          onSave={(val) =>
                            handleInlineKeuangan(k.id, "makan", val)
                          }
                          placeholder="0"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-teal-700 bg-teal-50/50 text-right text-[11px] md:text-xs font-black whitespace-nowrap">
                      {formatRp(total)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="w-24 mx-auto">
                        <EditableCell
                          type="select"
                          options={["Cash", "Transfer"]}
                          value={k.metode || "Cash"}
                          onSave={(val) =>
                            handleInlineKeuangan(k.id, "metode", val)
                          }
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="w-24 mx-auto">
                        <EditableCell
                          type="select"
                          options={["Belum", "Sudah"]}
                          value={k.status || "Belum"}
                          onSave={(val) =>
                            handleInlineKeuangan(k.id, "status", val)
                          }
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center no-print whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openModal("kwitansi", s, k)}
                          className="p-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg"
                        >
                          <ReceiptText size={14} />
                        </button>
                        <button
                          onClick={() => openModal("edit_keuangan", s, k)}
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteKeuangan(k.id)}
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg"
                        >
                          <Trash2 size={14} />
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

      <div className="md:hidden flex flex-col gap-3 p-3 bg-slate-50/50">
        {filteredKeuangan.length === 0 ? (
          <p className="text-center py-10 text-slate-400 text-xs">
            Data tidak ditemukan
          </p>
        ) : (
          filteredKeuangan.map((k, idx) => {
            const s =
              siswaData.find(
                (siswa) => String(siswa.id) === String(k.siswa_id),
              ) || {};
            const total =
              (Number(k.infaq) || 0) +
              (Number(k.cicilan) || 0) +
              (Number(k.konsumsi) || 0) +
              (Number(k.makan) || 0);
            return (
              <div
                key={k.id || idx}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
              >
                <div className="bg-slate-50/80 p-3 flex justify-between items-start border-b border-slate-100">
                  <div>
                    <div className="font-black text-slate-800 text-sm">
                      {s.nama || "Siswa Dihapus"}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      {s.kelas || "-"} •{" "}
                      {k.tanggal ? formatTanggalLengkap(k.tanggal) : "-"}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-[9px] font-black uppercase ${k.status === "Sudah" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-rose-100 text-rose-700 border border-rose-200"}`}
                  >
                    {k.status}
                  </span>
                </div>
                <div className="p-3 space-y-1">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 border-dashed">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Infaq
                    </span>
                    <div className="w-28 text-right">
                      <EditableCell
                        type="number"
                        isCurrency
                        value={k.infaq}
                        onSave={(val) =>
                          handleInlineKeuangan(k.id, "infaq", val)
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 border-dashed">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Daftar Ulang
                    </span>
                    <div className="w-28 text-right">
                      <EditableCell
                        type="number"
                        isCurrency
                        value={k.cicilan}
                        onSave={(val) =>
                          handleInlineKeuangan(k.id, "cicilan", val)
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 border-dashed">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Konsumsi
                    </span>
                    <div className="w-28 text-right">
                      <EditableCell
                        type="number"
                        isCurrency
                        value={k.konsumsi}
                        onSave={(val) =>
                          handleInlineKeuangan(k.id, "konsumsi", val)
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 border-dashed">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Makan
                    </span>
                    <div className="w-28 text-right">
                      <EditableCell
                        type="number"
                        isCurrency
                        value={k.makan}
                        onSave={(val) =>
                          handleInlineKeuangan(k.id, "makan", val)
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Metode
                    </span>
                    <div className="w-28 text-right">
                      <EditableCell
                        type="select"
                        options={["Cash", "Transfer"]}
                        value={k.metode || "Cash"}
                        onSave={(val) =>
                          handleInlineKeuangan(k.id, "metode", val)
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-teal-50/50 p-3 border-t border-teal-100 flex justify-between items-center">
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
                    Total Bayar
                  </span>
                  <span className="text-base font-black text-teal-700">
                    {formatRp(total)}
                  </span>
                </div>
                <div className="p-3 bg-white flex gap-2 border-t border-slate-100">
                  <button
                    onClick={() => openModal("kwitansi", s, k)}
                    className="flex-1 py-2 bg-teal-600 text-white border border-teal-700 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ReceiptText size={14} /> Kwitansi
                  </button>
                  <button
                    onClick={() => openModal("edit_keuangan", s, k)}
                    className="px-3 py-2 bg-white text-blue-600 rounded-xl border border-blue-100 shadow-sm"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteKeuangan(k.id)}
                    className="px-3 py-2 bg-white text-rose-600 rounded-xl border border-rose-100 shadow-sm"
                  >
                    <Trash2 size={16} />
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
