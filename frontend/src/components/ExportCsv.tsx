import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export interface ExportCsvColumn {
  key: string;
  label: string;
}

export interface ExportCsvOptions {
  filename: string;
  columns: ExportCsvColumn[];
  rows: Array<Record<string, string | number | null | undefined>>;
}

const escapeCsv = (value: string | number | null | undefined): string => {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const toCsvContent = (options: ExportCsvOptions): string => {
  const headerLine = options.columns.map((column) => escapeCsv(column.label)).join(",");
  const rowLines = options.rows.map((row) =>
    options.columns.map((column) => escapeCsv(row[column.key])).join(",")
  );
  return [headerLine, ...rowLines].join("\n");
};

const downloadCsvWeb = (filename: string, content: string) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const toBase64 = (content: string): string => {
  return btoa(unescape(encodeURIComponent(content)));
};

async function exportCsv (options: ExportCsvOptions) {
  const csvContent = toCsvContent(options);
  const safeName = options.filename.endsWith(".csv") ? options.filename : `${options.filename}.csv`;

  if (!Capacitor.isNativePlatform()) {
    downloadCsvWeb(safeName, csvContent);
    return;
  }

  try {
    const path = `exports/${safeName}`;
    await Filesystem.writeFile({
      path,
      data: toBase64(csvContent),
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
      recursive: true,
    });

    const fileUri = await Filesystem.getUri({
      path,
      directory: Directory.Cache,
    });

    await Share.share({
      title: "Export CSV",
      text: safeName,
      url: fileUri.uri,
      dialogTitle: "Share CSV file",
    });
  } catch (error) {
    console.error("Failed to export/share CSV, falling back to web download:", error);
    downloadCsvWeb(safeName, csvContent);
  }
};

export default exportCsv;
