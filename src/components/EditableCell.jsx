// File: src/components/EditableCell.jsx
import React, { useState, useEffect } from "react";
// Tambahkan Banknote (Uang) dan CreditCard (Kartu) dari lucide-react
import { CheckCircle2, AlertCircle, Banknote, CreditCard } from "lucide-react";
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

  useEffect(() => {
    setVal(value ?? "");
  }, [value]);

  const triggerSave = () => {
    setIsEditing(false);
    let finalVal = val;
    if (type === "number" && isCurrency) finalVal = autoRibuan(val);

    if (String(finalVal).trim() !== String(value || "").trim()) {
      onSave(type === "number" ? parseFloat(finalVal) || 0 : finalVal);
    }
  };

  if (isEditing) {
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

  // --- LOGIKA VISUAL UNTUK TAMPILAN DESKTOP (IKON & WARNA) ---
  if (type === "select" && value === "Sudah") {
    displayValue = (
      <span className="text-teal-600 flex items-center gap-1 text-[9px] md:text-[11px] font-semibold whitespace-nowrap">
        <CheckCircle2 size={12} /> Lunas
      </span>
    );
  } else if (type === "select" && value === "Belum") {
    displayValue = (
      <span className="text-amber-500 flex items-center gap-1 text-[9px] md:text-[11px] font-semibold whitespace-nowrap">
        <AlertCircle size={12} /> Belum
      </span>
    );
  } else if (type === "select" && value === "Cash") {
    // Tambahan baru untuk gaya Cash
    displayValue = (
      <span className="text-blue-600 flex items-center gap-1 text-[9px] md:text-[11px] font-semibold whitespace-nowrap">
        <Banknote size={12} /> Cash
      </span>
    );
  } else if (type === "select" && value === "Transfer") {
    // Tambahan baru untuk gaya Transfer
    displayValue = (
      <span className="text-purple-600 flex items-center gap-1 text-[9px] md:text-[11px] font-semibold whitespace-nowrap">
        <CreditCard size={12} /> Transfer
      </span>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`w-full min-h-[24px] cursor-text hover:bg-teal-50/50 hover:ring-1 hover:ring-teal-200 rounded-md px-1 flex items-center transition-all duration-200 text-slate-700 text-[10px] md:text-sm font-medium ${alignCenter ? "justify-center text-center" : ""}`}
    >
      {displayValue || (
        <span className="text-slate-300 italic text-[9px] md:text-xs">
          {placeholder}
        </span>
      )}
    </div>
  );
}
