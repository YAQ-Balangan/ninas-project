import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Banknote,
  CreditCard,
  Plus,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { formatRp, formatTanggalLengkap, autoRibuan } from "../utils/helpers";

export default function EditableCell({
  value,
  type = "text",
  options = [],
  onSave,
  placeholder = "Kosong...",
  isCurrency = false,
  alignCenter = false,
  useLongDate = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(value ?? "");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    setVal(value ?? "");
    if (type === "kisi_editor") {
      const initialRows = (value || "")
        .split("\n")
        .filter((r) => r.trim() !== "")
        .map((r, idx) => {
          // Logika baru: membaca 3 bagian (Jenis:::Nomor:::Teks)
          if (r.includes(":::")) {
            const parts = r.split(":::");
            if (parts.length >= 3)
              return {
                jenis: parts[0],
                no: parts[1],
                teks: parts.slice(2).join(":::"),
              };
            return { jenis: parts[0], no: String(idx + 1), teks: parts[1] };
          }
          return { jenis: "PG", no: String(idx + 1), teks: r };
        });
      setRows(
        initialRows.length > 0
          ? initialRows
          : [{ jenis: "PG", no: "1", teks: "" }],
      );
    }
  }, [value, type]);

  const triggerSave = () => {
    setIsEditing(false);
    if (type === "kisi_editor") {
      // Menyimpan 3 bagian
      const finalVal = rows
        .filter((r) => r.teks.trim() !== "")
        .map((r) => `${r.jenis}:::${r.no}:::${r.teks}`)
        .join("\n");
      onSave(finalVal);
    } else {
      let finalVal = val;
      if (type === "number" && isCurrency) finalVal = autoRibuan(val);
      if (String(finalVal).trim() !== String(value || "").trim()) {
        onSave(type === "number" ? parseFloat(finalVal) || 0 : finalVal);
      }
    }
  };

  if (isEditing) {
    if (type === "kisi_editor") {
      return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-200">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-black text-slate-700 uppercase text-xs tracking-widest">
                Kelola Baris Kisi-Kisi
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-slate-50/30">
              {rows.map((row, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 items-start bg-white p-3 rounded-xl border border-slate-200 shadow-sm"
                >
                  <select
                    value={row.jenis}
                    onChange={(e) => {
                      const newRows = [...rows];
                      newRows[idx].jenis = e.target.value;
                      setRows(newRows);
                    }}
                    className="p-2 border border-slate-200 rounded-lg bg-slate-50 text-[11px] font-bold text-teal-700 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer w-20"
                  >
                    <option value="PG">PG</option>
                    <option value="Essay">Essay</option>
                    <option value="Uraian">Uraian</option>
                  </select>
                  {/* INPUT BARU UNTUK NOMOR SOAL */}
                  <input
                    type="text"
                    value={row.no}
                    placeholder="No"
                    onChange={(e) => {
                      const newRows = [...rows];
                      newRows[idx].no = e.target.value;
                      setRows(newRows);
                    }}
                    className="p-2 border border-slate-200 rounded-lg text-xs font-bold text-center outline-none focus:ring-2 focus:ring-teal-500 w-16"
                  />
                  <textarea
                    autoFocus={idx === rows.length - 1}
                    value={row.teks}
                    onChange={(e) => {
                      const newRows = [...rows];
                      newRows[idx].teks = e.target.value;
                      setRows(newRows);
                    }}
                    placeholder="Tulis Capaian Pembelajaran..."
                    className="flex-1 p-2 border border-slate-200 rounded-lg text-xs min-h-[60px] outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                  <button
                    onClick={() => setRows(rows.filter((_, i) => i !== idx))}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setRows([
                    ...rows,
                    { jenis: "PG", no: String(rows.length + 1), teks: "" },
                  ])
                }
                className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50 transition-all"
              >
                <Plus size={16} /> Tambah Baris Baru
              </button>
            </div>
            <div className="p-4 border-t bg-white flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={triggerSave}
                className="px-6 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-600/30 hover:bg-teal-700 flex items-center gap-2 transition-all"
              >
                <Save size={16} /> Simpan
              </button>
            </div>
          </div>
        </div>
      );
    }
    if (type === "select") {
      return (
        <select
          autoFocus
          className={`w-full p-1.5 border-2 border-teal-500 rounded-lg outline-none text-[10px] md:text-xs text-teal-900 bg-white shadow-sm min-w-[70px] md:min-w-[90px] ${alignCenter ? "text-center" : ""}`}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={triggerSave}
          onKeyDown={(e) => e.key === "Enter" && triggerSave()}
        >
          <option value="">Pilih...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }
    return (
      <input
        autoFocus
        type={type}
        className={`w-full p-1.5 border-2 border-teal-500 rounded-lg outline-none text-[10px] md:text-xs text-teal-900 bg-white shadow-sm min-w-[50px] md:min-w-[70px] ${alignCenter ? "text-center" : ""}`}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={triggerSave}
        onKeyDown={(e) => e.key === "Enter" && triggerSave()}
        placeholder={placeholder}
      />
    );
  }

  let displayValue = value;
  if (type === "kisi_editor" && value) {
    displayValue = (value || "")
      .split("\n")
      .map((r) =>
        r.includes(":::")
          ? r.split(":::").length >= 3
            ? r.split(":::")[2]
            : r.split(":::")[1]
          : r,
      )
      .join("\n");
  }
  if (isCurrency && value) displayValue = formatRp(value);
  if (type === "date" && value) {
    displayValue = useLongDate
      ? formatTanggalLengkap(value)
      : new Date(value).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        });
  }

  if (type === "select") {
    if (value === "Sudah")
      displayValue = (
        <span className="text-teal-600 flex items-center gap-1 text-[9px] md:text-[11px] font-semibold whitespace-nowrap">
          <CheckCircle2 size={12} /> Lunas
        </span>
      );
    else if (value === "Belum")
      displayValue = (
        <span className="text-amber-500 flex items-center gap-1 text-[9px] md:text-[11px] font-semibold whitespace-nowrap">
          <AlertCircle size={12} /> Belum
        </span>
      );
    else if (value === "Cash")
      displayValue = (
        <span className="text-blue-600 flex items-center gap-1 text-[9px] md:text-[11px] font-semibold whitespace-nowrap">
          <Banknote size={12} /> Cash
        </span>
      );
    else if (value === "Transfer")
      displayValue = (
        <span className="text-purple-600 flex items-center gap-1 text-[9px] md:text-[11px] font-semibold whitespace-nowrap">
          <CreditCard size={12} /> Transfer
        </span>
      );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`w-full min-h-[24px] cursor-text hover:bg-teal-50/50 hover:ring-1 hover:ring-teal-200 rounded-md px-1 py-1 flex items-center transition-all duration-200 text-slate-700 text-[10px] md:text-sm font-medium whitespace-pre-line ${alignCenter ? "justify-center text-center" : ""}`}
    >
      {displayValue || (
        <span className="text-slate-300 italic text-[9px] md:text-xs">
          {placeholder}
        </span>
      )}
    </div>
  );
}
