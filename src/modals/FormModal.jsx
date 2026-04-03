// File: src/modals/FormModal.jsx
import React from "react";
import { Edit, Save, X } from "lucide-react";
import { autoRibuan } from "../utils/helpers";

export default function FormModal({
  modalType,
  formData,
  setFormData,
  handleSaveData,
  closeModal,
  kelasOptions,
}) {
  if (!modalType || modalType === "kwitansi") return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 no-print animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl w-full max-w-sm p-5 md:p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base md:text-lg font-black text-slate-800 capitalize flex items-center gap-2.5">
            <div className="p-1.5 md:p-2 bg-teal-50 text-teal-600 rounded-lg md:rounded-xl">
              <Edit size={16} className="md:w-5 md:h-5" />
            </div>
            Form {modalType}
          </h3>
          <button
            onClick={closeModal}
            className="p-1.5 md:p-2 bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSaveData} className="space-y-3.5">
          {modalType === "siswa" && (
            <>
              <div>
                <label className="block text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">
                  Nama Lengkap
                </label>
                <input
                  required
                  type="text"
                  placeholder="Masukkan nama..."
                  className="w-full p-2.5 md:p-3 bg-slate-50/80 border border-slate-200 focus:border-teal-500 focus:bg-white rounded-xl text-xs md:text-sm font-semibold outline-none transition-all shadow-sm"
                  value={formData.nama || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">
                  Kategori Kelas
                </label>
                <select
                  required
                  className="w-full p-2.5 md:p-3 bg-slate-50/80 border border-slate-200 focus:border-teal-500 focus:bg-white rounded-xl text-xs md:text-sm font-semibold outline-none transition-all shadow-sm"
                  value={formData.kelas || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, kelas: e.target.value })
                  }
                >
                  {kelasOptions.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {modalType === "kelas" && (
            <div>
              <label className="block text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">
                Nama Tingkat/Kelas
              </label>
              <input
                required
                type="text"
                placeholder="Misal: Kelas 1..."
                className="w-full p-2.5 md:p-3 bg-slate-50/80 border border-slate-200 focus:border-teal-500 focus:bg-white rounded-xl text-xs md:text-sm font-semibold outline-none transition-all shadow-sm"
                value={formData.nama_kelas || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nama_kelas: e.target.value })
                }
              />
            </div>
          )}

          {modalType === "keuangan" && (
            <div>
              <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Tanggal Input / Bayar
              </label>
              <input
                type="date"
                required
                className="w-full p-2.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold outline-none focus:border-teal-500"
                value={formData.tanggal || ""}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal: e.target.value })
                }
              />
            </div>
          )}

          {modalType === "nilai" && (
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Hafalan
                </label>
                <input
                  type="number"
                  className="w-full p-2.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold outline-none focus:border-blue-500"
                  value={formData.hafalan || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, hafalan: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Catatan
                </label>
                <input
                  type="number"
                  className="w-full p-2.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold outline-none focus:border-blue-500"
                  value={formData.catatan || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, catatan: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Ulangan
                </label>
                <input
                  type="number"
                  className="w-full p-2.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold outline-none focus:border-blue-500"
                  value={formData.ulangan || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, ulangan: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Ujian
                </label>
                <input
                  type="number"
                  className="w-full p-2.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold outline-none focus:border-blue-500"
                  value={formData.ujian || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, ujian: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Keterangan Opsional
                </label>
                <textarea
                  rows="2"
                  placeholder="Catatan guru..."
                  className="w-full p-2.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold outline-none focus:border-blue-500"
                  value={formData.keterangan || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, keterangan: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {modalType === "keuangan" && (
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Infaq
                </label>
                <input
                  type="number"
                  className="w-full p-2.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold outline-none focus:border-amber-500"
                  value={formData.infaq || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, infaq: e.target.value })
                  }
                  onBlur={(e) =>
                    setFormData({
                      ...formData,
                      infaq: autoRibuan(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Daftar Ulang
                </label>
                <input
                  type="number"
                  className="w-full p-2.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold outline-none focus:border-amber-500"
                  value={formData.cicilan || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, cicilan: e.target.value })
                  }
                  onBlur={(e) =>
                    setFormData({
                      ...formData,
                      cicilan: autoRibuan(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Konsumsi
                </label>
                <input
                  type="number"
                  className="w-full p-2.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold outline-none focus:border-amber-500"
                  value={formData.konsumsi || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, konsumsi: e.target.value })
                  }
                  onBlur={(e) =>
                    setFormData({
                      ...formData,
                      konsumsi: autoRibuan(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Makan Siang
                </label>
                <input
                  type="number"
                  className="w-full p-2.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold outline-none focus:border-amber-500"
                  value={formData.makan || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, makan: e.target.value })
                  }
                  onBlur={(e) =>
                    setFormData({
                      ...formData,
                      makan: autoRibuan(e.target.value),
                    })
                  }
                />
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-3 md:gap-4 mt-1 p-2 md:p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                <div>
                  <label className="block text-[9px] md:text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1.5">
                    Metode
                  </label>
                  <select
                    className="w-full p-2 md:p-2.5 bg-white border border-amber-200 rounded-lg text-[10px] md:text-xs font-bold outline-none text-slate-700"
                    value={formData.metode || "Cash"}
                    onChange={(e) =>
                      setFormData({ ...formData, metode: e.target.value })
                    }
                  >
                    <option value="Cash">Tunai (Cash)</option>
                    <option value="Transfer">Transfer Bank</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] md:text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1.5">
                    Status Lunas
                  </label>
                  <select
                    className="w-full p-2 md:p-2.5 bg-white border border-amber-200 rounded-lg text-[10px] md:text-xs font-bold outline-none text-slate-700"
                    value={formData.status || "Belum"}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="Belum">Belum Bayar</option>
                    <option value="Sudah">Sudah Lunas</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 md:py-4 mt-4 md:mt-6 rounded-xl text-white bg-gradient-to-r from-teal-500 to-emerald-600 shadow-[0_10px_20px_rgba(20,184,166,0.3)] hover:shadow-[0_15px_30px_rgba(20,184,166,0.4)] hover:-translate-y-1 flex justify-center items-center gap-2 font-black text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300"
          >
            <Save size={16} /> Simpan Data
          </button>
        </form>
      </div>
    </div>
  );
}
