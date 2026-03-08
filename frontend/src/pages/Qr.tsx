import QRCode from "qrcode";
import { useEffect, useState } from "react";
import API from "../api/api";

function Qr() {
  const [qrUrl, setQrUrl] = useState<string>("");

  useEffect(() => {
    const generateQr = async () => {
      try {
        // Fetch QR data from backend
        const response = await API.get("/offices/qr/1");
        
        // Convert the object to JSON string
        const qrValue = JSON.stringify(response.data);

        // Generate QR code with JSON string
        const url = await QRCode.toDataURL(qrValue);
        setQrUrl(url);

        console.log("QR JSON:", qrValue);
        console.log("QR URL:", url);
      } catch (err) {
        console.error(err);
      }
    };

    generateQr();

    const interval = setInterval(generateQr, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {qrUrl ? <img src={qrUrl} alt="Generated QR" /> : <p>Loading QR...</p>}
    </div>
  );
}

export default Qr;