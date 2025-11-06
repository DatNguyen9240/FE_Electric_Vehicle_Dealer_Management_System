import React, { useEffect } from "react";
import api from "@libs/axios";
import { Loader2, Zap, Plug, Gauge, Power, Building2 } from "lucide-react";
import { useTitle } from "../../contexts";

const StationDashboard: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  type Connector = {
    id?: string;
    code?: string;
    type?: string;
    status?: string;
    powerKw?: number | string;
  };

  type Charger = {
    id?: string;
    name?: string;
    code?: string;
    status?: string;
    powerKw?: number | string;
  };

  type StationOverview = {
    station?: { id?: string; name?: string; status?: string } | null;
    metrics?: {
      statusCounts?: Record<string, number>;
      powerKw?: { total?: number; charging?: number; available?: number } | null;
      lastUpdatedAt?: string | null;
      totalConnectors?: number | null;
    } | null;
    connectors?: Connector[];
    chargers?: Charger[];
  };

  const [data, setData] = React.useState<{ stations?: StationOverview[] } | null>(null);
  const [filterStationId, setFilterStationId] = React.useState<string>("ALL");

  const { setTitle } = useTitle();
  
  useEffect(() => {
    setTitle("Station Dashboard");
  }, [setTitle]);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/staff/stations/status")
      .then((res) => {
        if (!mounted) return;
        setData(res.data);
      })
      .catch(console.error)
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading station overview...
      </div>
    );

  const stationsArr: StationOverview[] = Array.isArray(data?.stations) ? (data.stations as StationOverview[]) : [];

  const aggregated = stationsArr.reduce(
    (acc, cur) => {
      const st = cur.station || {};
      const m = cur.metrics || {};
      if (st.status === "ONLINE") acc.online += 1;
      else if (st.status === "OFFLINE") acc.offline += 1;
      else if (st.status === "MAINTENANCE") acc.maintenance += 1;

      const sc = m.statusCounts || {};
      Object.keys(sc).forEach((k) => {
        acc.connectors[k] = (acc.connectors[k] || 0) + (sc[k] || 0);
      });

      const pw = m.powerKw || {};
      acc.power.total += pw.total || 0;
      acc.power.charging += pw.charging || 0;
      acc.power.available += pw.available || 0;
      return acc;
    },
    {
      online: 0,
      offline: 0,
      maintenance: 0,
      connectors: {} as Record<string, number>,
      power: { total: 0, charging: 0, available: 0 },
    }
  );

  const filteredStations =
    filterStationId === "ALL"
      ? stationsArr
      : stationsArr.filter((s) => s.station?.id === filterStationId);

  const percentUsed =
    aggregated.power.total > 0
      ? Math.round((aggregated.power.charging / aggregated.power.total) * 100)
      : 0;

  const getStatusBadge = (status?: string | null) => {
    const base = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "ONLINE":
        return <span className={`${base} bg-green-100 text-green-700`}>Online</span>;
      case "OFFLINE":
        return <span className={`${base} bg-red-100 text-red-700`}>Offline</span>;
      case "MAINTENANCE":
        return <span className={`${base} bg-yellow-100 text-yellow-700`}>Maintenance</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-700`}>{status ?? "Unknown"}</span>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-800">
          <Zap className="text-yellow-500" /> Station Dashboard
        </h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Filter:</label>
          <select
            value={filterStationId}
            onChange={(e) => setFilterStationId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Stations</option>
            {stationsArr.map((s: StationOverview, idx: number) => (
              <option key={s.station?.id ?? idx} value={s.station?.id ?? ""}>
                {s.station?.name ?? `Station ${idx + 1}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-r from-green-100 to-green-50 p-5 rounded-2xl shadow-sm border border-green-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-600">Stations Online</div>
              <div className="text-3xl font-bold text-green-700">{aggregated.online}</div>
            </div>
            <Building2 className="text-green-600 w-8 h-8" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-100 to-red-50 p-5 rounded-2xl shadow-sm border border-red-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-600">Stations Offline</div>
              <div className="text-3xl font-bold text-red-700">{aggregated.offline}</div>
            </div>
            <Plug className="text-red-600 w-8 h-8" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-5 rounded-2xl shadow-sm border border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-600">Power Usage</div>
              <div className="text-xl font-bold text-blue-700">
                {aggregated.power.charging} kW / {aggregated.power.total} kW
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                <div
                  style={{ width: `${percentUsed}%` }}
                  className="h-2 bg-blue-600 rounded-full"
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">{percentUsed}% Used</div>
            </div>
            <Gauge className="text-blue-600 w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Connector Summary */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-800">
          <Plug className="text-blue-500" /> Connector Status
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.keys(aggregated.connectors).length === 0 ? (
            <div className="col-span-4 text-gray-500 text-sm">No connector data</div>
          ) : (
            Object.entries(aggregated.connectors).map(([k, v]) => (
              <div
                key={k}
                className="p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition"
              >
                <div className="text-sm text-gray-500">{k}</div>
                <div className="text-xl font-bold text-gray-800">{String(v)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Per Station Details */}
      <div className="space-y-5">
          {filteredStations.map((s: StationOverview, idx: number) => (
          <div
            key={s.station?.id ?? idx}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  {s.station?.name ?? "Unknown"} {getStatusBadge(s.station?.status)}
                </div>
                <div className="text-sm text-gray-500">
                  Last updated: {s.metrics?.lastUpdatedAt ? new Date(s.metrics.lastUpdatedAt).toLocaleString() : "Not available"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Connectors</div>
                <div className="text-xl font-bold text-gray-700">
                  {s.metrics?.totalConnectors ?? 0}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <div className="font-medium mb-2 flex items-center gap-1 text-gray-700">
                  <Plug size={16} /> Connectors
                </div>
                {(s.connectors ?? []).length === 0 ? (
                  <div className="text-sm text-gray-500">No connectors</div>
                ) : (
                  <ul className="text-sm space-y-2">
                    {(s.connectors ?? []).map((c: Connector) => (
                      <li
                        key={c.id}
                        className="flex justify-between bg-gray-50 p-2 rounded-lg border border-gray-100 hover:bg-gray-100 transition"
                      >
                        <div>
                          <div className="font-medium text-gray-800">
                            {c.code} — {c.type}
                          </div>
                          <div className="text-xs text-gray-500">
                            Status: {c.status} • {c.powerKw} kW
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <div className="font-medium mb-2 flex items-center gap-1 text-gray-700">
                  <Power size={16} /> Chargers
                </div>
                {(s.chargers ?? []).length === 0 ? (
                  <div className="text-sm text-gray-500">No chargers</div>
                ) : (
                  <ul className="text-sm space-y-2">
                    {(s.chargers ?? []).map((ch: Charger) => (
                      <li
                        key={ch.id}
                        className="bg-gray-50 p-2 rounded-lg border border-gray-100 hover:bg-gray-100 transition"
                      >
                        <div className="font-medium text-gray-800">
                          {ch.name} ({ch.code})
                        </div>
                        <div className="text-xs text-gray-500">
                          Status: {ch.status} • {ch.powerKw} kW
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StationDashboard;
