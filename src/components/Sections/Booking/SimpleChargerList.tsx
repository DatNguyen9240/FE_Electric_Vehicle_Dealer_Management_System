import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@libs/axios";
import { toast } from "react-toastify";

interface Connector {
  _id: string;
  type: string;
  powerKw?: number;
  status: string;
  code?: string;
}

interface Charger {
  _id: string;
  name?: string;
  code?: string;
  connectorType?: string;
  powerKw?: number;
  status?: string;
  connectors?: Connector[];
}

const SimpleChargerList: React.FC<{ stationId?: string }> = ({ stationId: propStationId }) => {
  const params = useParams<{ stationId: string }>();
  const stationId = propStationId || params.stationId;
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Không cần state modal QR nữa, luôn mở trang HTML mới

  // Hàm mở trang HTML mới với QR và nút Sạc ngay
  const openQrPage = (token: string, booking: any) => {
    const win = window.open('', '_blank');
    if (!win) return toast.error('Không thể mở trang mới');
    const qrImg = `<img src='https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(token)}' alt='QR code' style='width:224px;height:224px;object-fit:contain;border-radius:12px;border:1px solid #eee;margin-bottom:16px;'/><div style='font-size:12px;color:#666;word-break:break-all;margin-bottom:16px;'>${token}</div>`;
    let btn = '';
    if (booking?.canStartNow && booking?.startAction) {
      btn = `<button id='startBtn' style='padding:12px 32px;background:#16a34a;color:#fff;font-weight:600;border:none;border-radius:8px;font-size:16px;cursor:pointer;'>Sạc ngay</button>`;
    }
    const apiUrl = import.meta.env.VITE_API_URL || window.location.origin + '/api/v1';
    win.document.write(`<!DOCTYPE html><html><head><title>QR Connector</title></head><body style='display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#f9f9f9;'><div style='background:#fff;padding:32px 24px;border-radius:16px;box-shadow:0 4px 24px #0001;display:flex;flex-direction:column;align-items:center;'>${qrImg}${btn}</div><script>window.apiUrl='${apiUrl}';window.bookingId='${booking?._id || ''}';document.getElementById('startBtn')?.addEventListener('click',async()=>{try{const res=await fetch(window.apiUrl+'/sessions/start',{method:'POST',headers:{"Content-Type":"application/json"},body:JSON.stringify({bookingId:window.bookingId}),credentials:'include'});if(res.ok){alert('Bắt đầu sạc thành công!');window.close();}else{const d=await res.json();alert(d.msg||'Không thể bắt đầu sạc');}}catch(e){alert('Không thể bắt đầu sạc');}});</script></body></html>`);
    win.document.close();
  };

  useEffect(() => {
    if (!stationId) return;
    setLoading(true);
    setError(null);
    api.get<{ chargers?: Charger[] }>(`/stations/${stationId}/assets`)
      .then(res => {
        setChargers(Array.isArray(res.data.chargers) ? res.data.chargers : []);
      })
      .catch(err => {
        setError(err?.response?.data?.msg || err.message || "Failed to load chargers");
      })
      .finally(() => setLoading(false));
  }, [stationId]);

  return (
    <div className="min-h-[400px] w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">Danh sách trụ sạc</h2>
      {loading ? (
        <div className="text-center text-gray-500 py-10">Đang tải danh sách trụ...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {chargers.map(charger => {
            const availableConnectors = (charger.connectors || []).filter(c => c.status === 'IDLE').length;
            return (
              <div
                key={charger._id}
                className="border rounded-2xl p-6 bg-white shadow-md flex flex-col items-center transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-16 h-16 mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-green-600">
                    <path d="M7 2v11h3v9l7-12h-4l3-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-1 text-center">{charger.name || charger.code || `Charger ${charger._id}`}</h3>
                <p className="text-gray-500 text-sm mb-2 text-center">
                  Loại: {charger.connectorType || "Không rõ"} | Công suất: {charger.powerKw ? `${charger.powerKw}kW` : "-"}
                </p>
                <div className="mb-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                      ${availableConnectors > 0 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {availableConnectors > 0 ? `${availableConnectors} connector rảnh` : "Đang bận"}
                  </span>
                </div>
                {/* Danh sách connector */}
                {Array.isArray(charger.connectors) && charger.connectors.length > 0 && (
                  <div className="w-full mb-3">
                    <h4 className="font-semibold text-sm mb-1">Connectors:</h4>
                    <ul className="space-y-2">
                      {charger.connectors.map(connector => (
                        <li key={connector._id} className="flex items-center gap-2 border rounded-lg px-3 py-2">
                          <span className="font-medium">{connector.code || connector.type}</span>
                          <span className="text-xs text-gray-500">{connector.type}</span>
                          <span className="text-xs text-gray-500">{connector.powerKw ? `${connector.powerKw}kW` : "-"}</span>
                          <span className={`ml-auto px-2 py-1 rounded-full text-xs font-semibold
                            ${connector.status === "IDLE" ? "bg-green-100 text-green-700" : connector.status === "CHARGING" ? "bg-yellow-100 text-yellow-700" : "bg-gray-200 text-gray-500"}`}
                          >
                            {connector.status === "IDLE" ? "Rảnh" : connector.status === "CHARGING" ? "Đang sạc" : connector.status}
                          </span>
                          <button
                            className="ml-2 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200"
                            onClick={async () => {
                              if (!connector.code) return toast.error("Connector không có mã code");
                              try {
                                const res = await api.get(`/connectors/scan/${connector.code}`);
                                const token = res.data?.connector?.qr?.token;
                                openQrPage(token, res.data?.booking || {});
                              } catch (err: any) {
                                toast.error(err?.response?.data?.msg || err.message || "Quét thất bại");
                              }
                            }}
                          >
                            Quét QR
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Đã bỏ nút Xem slot */}
              </div>
            );
          })}
        </div>
      )}
      {/* Đã bỏ modal QR, luôn mở trang HTML mới khi quét QR */}
    </div>
  );
};

export default SimpleChargerList;
