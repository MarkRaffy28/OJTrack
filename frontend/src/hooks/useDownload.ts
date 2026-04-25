import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Report } from '@context/reportContext';
import { formatDate } from '@utils/date';
import { capitalize } from '@utils/string';

export const useDownload = () => {
  const downloadReport = async (data: Report | string, filename?: string) => {
    if (typeof data === 'string' && filename) {
      if (!Capacitor.isNativePlatform()) {
        try {
          const response = await fetch(data, { headers: { "ngrok-skip-browser-warning": "true" } });
          const blob = await response.blob();
          
          if (navigator.share) {
            try {
              const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' });
              await navigator.share({
                files: [file],
                title: filename
              });
              return;
            } catch (err) {
              console.log("Native share cancelled/failed", err);
            }
          }
          
          const objectUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = objectUrl;
          a.download = filename;
          a.target = "_blank";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(objectUrl);
        } catch (error) {
          console.error("Download failed:", error);
          window.open(data, "_blank");
        }
        return;
      }

      try {
        const filesystem = Filesystem as any;
        if (typeof filesystem.downloadFile === "function") {
          const result = await filesystem.downloadFile({
            url: data,
            path: `downloads/${filename}`,
            directory: Directory.Cache,
            recursive: true,
            headers: { "ngrok-skip-browser-warning": "true" },
          });

          await Share.share({
            title: filename,
            url: result.path || result.uri,
          });
        } else {
          const response = await fetch(data, {
            headers: { "ngrok-skip-browser-warning": "true" },
          });
          const blob = await response.blob();

          const reader = new FileReader();
          const base64Data = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              const base64 = reader.result as string;
              resolve(base64.split(",")[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          const path = `downloads/${filename}`;
          const result = await Filesystem.writeFile({
            path,
            data: base64Data,
            directory: Directory.Cache,
            recursive: true,
          });

          await Share.share({
            title: filename,
            url: result.uri,
          });
        }
      } catch (error) {
        console.error("Download failed:", error);
        window.open(data, "_blank");
      }
      return;
    }

    // Otherwise treat as a Report object
    const report = data as Report;
    const reportTitle = (report.title ?? "report").replace(/[^a-z0-9]/gi, "_");
    const content = [
      `REPORT: ${report.title ?? "Untitled"}`,
      `TYPE: ${capitalize(report.type)}`,
      `DATE: ${formatDate(report.reportDate)}`,
      `STATUS: ${capitalize(report.status)}`,
      ``,
      `CONTENT`,
      `------------`,
      report.content,
      ``,
      `ATTACHMENTS`,
      `------------`,
      report.attachments && report.attachments.length > 0
        ? report.attachments.map((a: any) => a.originalName).join(", ")
        : "No attachments.",
    ].join("\n");

    if (Capacitor.isNativePlatform()) {
      try {
        const fileName = `${reportTitle}.txt`;
        const result = await Filesystem.writeFile({
          path: fileName,
          data: content,
          directory: Directory.Cache,
          encoding: Encoding.UTF8
        });
        await Share.share({
          title: report.title ?? 'Activity Report',
          text: `Report submission details for ${report.title}`,
          url: result.uri,
          dialogTitle: 'Save or Share Report',
        });
      } catch (e) {
        console.error("Native share/download failed", e);
      }
      return;
    }

    const blob = new Blob([content], { type: "text/plain" });

    if (navigator.share) {
      try {
        const file = new File([blob], `${reportTitle}.txt`, { type: "text/plain" });
        await navigator.share({
          files: [file],
          title: report.title ?? "Activity Report",
          text: `Activity Report: ${report.title ?? "Untitled"}`
        });
        return;
      } catch (err) {
        console.log("Native share cancelled/failed", err);
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportTitle}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return { downloadReport };
};
