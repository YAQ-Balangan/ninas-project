// File: src/pages/tabs/KeuanganTab.jsx
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
      {/* TAMPILAN DESKTOP */}
      <div className="hidden md:block print:block w-full">
        <table className="w-full text-left table-auto">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-1.5 py-2 md:py-2.5 text-slate-500 text-center text-[8px] md:text-[9px] font-bold uppercase tracking-widest w-8 border-r border-slate-200">
                No
              </th>
              <th className="px-2 py-2 md:py-2.5 text-slate-500 text-left text-[8px] md:text-[9px] font-bold uppercase tracking-widest border-r border-slate-200 w-32">
                Siswa
              </th>
              <th className="px-1 py-2 md:py-2.5 text-slate-500 text-center text-[8px] md:text-[9px] font-bold uppercase tracking-widest w-24">
                Tgl Bayar
              </th>
              <th className="px-2 py-2 md:py-2.5 text-slate-500 text-right text-[8px] md:text-[9px] font-bold uppercase tracking-widest w-20">
                Infaq
              </th>
              <th className="px-2 py-2 md:py-2.5 text-slate-500 text-right text-[8px] md:text-[9px] font-bold uppercase tracking-widest w-20">
                Daftar Ulang
              </th>
              <th className="px-2 py-2 md:py-2.5 text-slate-500 text-right text-[8px] md:text-[9px] font-bold uppercase tracking-widest w-20">
                Konsumsi
              </th>
              <th className="px-2 py-2 md:py-2.5 text-slate-500 text-right text-[8px] md:text-[9px] font-bold uppercase tracking-widest w-20">
                Makan
              </th>
              <th className="px-2 py-2 md:py-2.5 text-teal-700 bg-teal-50 text-right text-[8px] md:text-[9px] font-bold uppercase tracking-widest w-20">
                Total
              </th>
              <th className="px-1 py-2 md:py-2.5 text-slate-500 text-center text-[8px] md:text-[9px] font-bold uppercase tracking-widest w-16">
                Metode
              </th>
              <th className="px-1 py-2 md:py-2.5 text-slate-500 text-center text-[8px] md:text-[9px] font-bold uppercase tracking-widest w-16">
                Status
              </th>
              <th className="px-1 py-2 md:py-2.5 text-slate-500 text-center text-[8px] md:text-[9px] font-bold uppercase tracking-widest no-print w-20">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredKeuangan.length === 0 ? (
              <tr>
                <td
                  colSpan="11"
                  className="py-8 text-center text-slate-400 font-medium text-[11px]"
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
                    <td className="px-1.5 py-1 border-r border-slate-100 text-slate-500 text-center text-[9px] md:text-[10px] font-semibold">
                      {idx + 1}
                    </td>
                    <td className="px-2 py-1 border-r border-slate-100 text-left text-slate-800 text-[9px] md:text-[10px] font-bold leading-snug">
                      {s.nama || "Siswa Dihapus"} <br />
                      <span className="text-[7px] md:text-[8px] text-slate-400 tracking-widest uppercase">
                        {s.kelas || "-"}
                      </span>
                    </td>
                    <td className="px-1 py-1 text-center text-[9px] md:text-[10px]">
                      <div className="w-[85px] mx-auto">
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
                    <td className="px-1 py-1 text-right text-[9px] md:text-[10px]">
                      <div className="w-[70px] ml-auto">
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
                    <td className="px-1 py-1 text-right text-[9px] md:text-[10px]">
                      <div className="w-[70px] ml-auto">
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
                    <td className="px-1 py-1 text-right text-[9px] md:text-[10px]">
                      <div className="w-[70px] ml-auto">
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
                    <td className="px-1 py-1 text-right text-[9px] md:text-[10px]">
                      <div className="w-[70px] ml-auto">
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
                    <td className="px-2 py-1 text-teal-700 bg-teal-50/50 text-right text-[9px] md:text-[10px] font-black">
                      {formatRp(total)}
                    </td>
                    <td className="px-1 py-1 text-center text-[9px] md:text-[10px]">
                      <div className="w-14 mx-auto">
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
                    <td className="px-1 py-1 text-center text-[9px] md:text-[10px]">
                      <div className="w-14 mx-auto">
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
                    <td className="px-1 py-1 text-center no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openModal("kwitansi", s, k)}
                          className="p-1 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded"
                        >
                          <ReceiptText size={12} />
                        </button>
                        <button
                          onClick={() => openModal("edit_keuangan", s, k)}
                          className="p-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteKeuangan(k.id)}
                          className="p-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded"
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
