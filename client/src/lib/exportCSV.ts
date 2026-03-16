/**
 * Export companies to CSV with BOM for Excel compatibility
 */
export function exportToCSV(companies: any[], filename: string = "furniture_companies.csv") {
  const headers = [
    "Название", "Город", "Регион", "Тип", "Адрес", "Телефон", "WhatsApp",
    "Telegram", "Email", "Сайт", "Соцсети", "Специализация",
    "Краткое описание", "Сегмент", "Потенциал сотрудничества",
    "Первый шаг контакта", "Источник"
  ];

  const escapeCSV = (val: string) => {
    if (!val) return "";
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const rows = companies.map((c) =>
    headers.map((h) => escapeCSV(c[h] || "")).join(",")
  );

  const csv = "\uFEFF" + headers.join(",") + "\n" + rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToExcel(companies: any[], filename: string = "furniture_companies.xlsx") {
  // For simplicity, export as CSV with .xlsx-friendly format
  // Real xlsx would require a library like xlsx
  exportToCSV(companies, filename.replace(".xlsx", ".csv"));
}
