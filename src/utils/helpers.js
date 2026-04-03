// File: src/utils/helpers.js

export const formatRp = (angka) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(angka || 0);
};

export const exportToCSV = (filename, rows) => {
    const csvContent =
        "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const formatTanggalLengkap = (tanggalStr) => {
    if (!tanggalStr) return "-";
    const dateObj = new Date(tanggalStr);

    const namaHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const namaBulan = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];

    const hari = namaHari[dateObj.getDay()];
    const tanggal = dateObj.getDate();
    const bulan = namaBulan[dateObj.getMonth()];
    const tahun = dateObj.getFullYear();

    return `${hari}, ${tanggal} ${bulan} ${tahun}`;
};

export const autoRibuan = (val) => {
    if (!val) return val;
    const strVal = String(val).trim();
    let num = parseFloat(strVal);
    if (num > 0 && num < 10000 && !strVal.endsWith("000")) {
        return (num * 1000).toString();
    }
    return strVal;
};