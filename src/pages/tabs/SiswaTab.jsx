// File: src/pages/tabs/SiswaTab.jsx
import React from "react";
import { Edit, Trash2 } from "lucide-react";
import EditableCell from "../../components/EditableCell";

export default function SiswaTab({
  filteredSiswa,
  kelasOptions,
  handleInlineSiswa,
  openModal,
  handleDeleteSiswa,
}) {
  return (
    <div className="bg-white/90 shadow-sm border border-slate-200 rounded-xl md:rounded-2xl overflow-hidden">
      {/* TAMPILAN DESKTOP (DIPERBAIKI: Pas Layar, Baris Rapat) */}
      <div className="hidden md:block print:block w-full">
        <table className="w-full text-left table-auto">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-2 py-2 md:py-2.5 text-slate-500 text-center text-[10px] md:text-[11px] font-bold uppercase tracking-widest w-12 border-r border-slate-200">
                No
              </th>
              <th className="px-3 py-2 md:py-2.5 text-slate-500 text-center text-[10px] md:text-[11px] font-bold uppercase tracking-widest border-r border-slate-200">
                Nama Lengkap
              </th>
              <th className="px-3 py-2 md:py-2.5 text-slate-500 text-center text-[10px] md:text-[11px] font-bold uppercase tracking-widest w-40">
                Kelas
              </th>
              <th className="px-3 py-2 md:py-2.5 text-slate-500 text-center text-[10px] md:text-[11px] font-bold uppercase tracking-widest no-print w-48">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSiswa.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-slate-400 font-medium text-[11px]"
                >
                  Data tidak ditemukan
                </td>
              </tr>
            ) : (
              filteredSiswa.map((s, idx) => (
                <tr
                  key={s.id}
                  className="group hover:bg-teal-50/50 transition-colors"
                >
                  <td className="px-2 py-1.5 border-r border-slate-100 text-slate-500 text-center text-[10px] md:text-[11px] font-semibold">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-1.5 border-r border-slate-100 text-slate-800 font-semibold text-[10px] md:text-[11px] leading-snug">
                    <EditableCell
                      value={s.nama}
                      onSave={(val) => handleInlineSiswa(s.id, "nama", val)}
                    />
                  </td>
                  <td className="px-3 py-1.5 text-[10px] md:text-[11px]">
                    <EditableCell
                      type="select"
                      options={kelasOptions}
                      value={s.kelas}
                      onSave={(val) => handleInlineSiswa(s.id, "kelas", val)}
                    />
                  </td>
                  <td className="px-3 py-1.5 text-center no-print">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openModal("bayar_baru", s)}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-teal-50 text-teal-700 font-bold rounded text-[9px] tracking-wide shadow-sm border border-slate-200 transition-colors uppercase"
                      >
                        Bayar
                      </button>
                      <button
                        onClick={() => openModal("siswa", s)}
                        className="p-1 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteSiswa(s.id)}
                        className="p-1 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded transition-colors"
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

      {/* TAMPILAN MOBILE (TETAP) */}
      <div className="md:hidden print:hidden flex flex-col gap-3 p-3 bg-slate-50/50">
        {filteredSiswa.length === 0 ? (
          <p className="text-center py-10 text-slate-400 text-xs font-medium">
            Data tidak ditemukan
          </p>
        ) : (
          filteredSiswa.map((s, idx) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
            >
              <div className="bg-slate-50/80 p-3 flex justify-between items-center border-b border-slate-100">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-black text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div className="w-full">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                      Nama Lengkap
                    </div>
                    <div className="font-bold text-slate-800 text-sm">
                      <EditableCell
                        value={s.nama}
                        onSave={(val) => handleInlineSiswa(s.id, "nama", val)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 border-dashed">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Kelas
                  </span>
                  <div className="w-32 text-right">
                    <EditableCell
                      type="select"
                      options={kelasOptions}
                      value={s.kelas}
                      onSave={(val) => handleInlineSiswa(s.id, "kelas", val)}
                    />
                  </div>
                </div>
              </div>
              <div className="p-3 bg-slate-50/50 flex gap-2 border-t border-slate-100">
                <button
                  onClick={() => openModal("bayar_baru", s)}
                  className="flex-1 py-2 bg-teal-50 border border-teal-100 text-teal-700 font-bold rounded-xl text-[10px] tracking-widest uppercase flex items-center justify-center"
                >
                  Input Pembayaran
                </button>
                <button
                  onClick={() => openModal("siswa", s)}
                  className="px-3 py-2 text-blue-600 bg-white border border-blue-100 rounded-xl shadow-sm"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteSiswa(s.id)}
                  className="px-3 py-2 text-rose-600 bg-white border border-rose-100 rounded-xl shadow-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
