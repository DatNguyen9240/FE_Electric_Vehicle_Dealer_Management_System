import React, { useEffect } from "react";
import api from "@libs/axios";
import { Loader2, Plug, Power, PowerOff, RefreshCw } from "lucide-react";
import { useTitle } from "../../contexts";
import { useUi } from "../../contexts/uiContextCore";

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
  // filter removed per design: show all stations by default

  const { setTitle } = useTitle();
  
  useEffect(() => {
    setTitle("Station Dashboard");
  }, [setTitle]);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    const load = async () => {
      try {
        const res = await api.get("/staff/stations/status");
        if (!mounted) return;
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // expose a reload function for actions
  const loadStations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/staff/stations/status");
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { showToast } = useUi();
  const [toggling, setToggling] = React.useState<Record<string, boolean>>({});

  const toggleChargerPower = async (chargerId: string | undefined, currentStatus?: string) => {
    if (!chargerId) return;
    const desired = (String(currentStatus || '').toUpperCase() === 'ONLINE') ? 'OFFLINE' : 'ONLINE';
    setToggling((s) => ({ ...s, [chargerId]: true }));
    try {
      await api.patch(`/staff/chargers/${chargerId}/power`, { status: desired });
      showToast(`Charger ${desired === 'ONLINE' ? 'turned on' : 'turned off'}`, 'success');
      await loadStations();
    } catch (err) {
      console.error(err);
      const msg = (err as any)?.response?.data?.message || 'Failed to change charger power';
      showToast(msg, 'error');
    } finally {
      setToggling((s) => ({ ...s, [chargerId]: false }));
    }
  };

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

  const filteredStations = stationsArr;

  const percentUsed =
    aggregated.power.total > 0
      ? Math.round((aggregated.power.charging / aggregated.power.total) * 100)
      : 0;

  const connectorEntries = Object.entries(aggregated.connectors || {});
  const firstTwoConnectors = connectorEntries.slice(0, 2);

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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase text-gray-500 tracking-wide">Staff Console</p>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Station dashboard</h1>
          <p className="text-sm text-gray-500">
            Monitor stations, connectors, and charger health in real time.
          </p>
        </div>
        <button
          onClick={loadStations}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 transition"
        >
          <RefreshCw size={16} />
          Refresh data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border p-5 shadow-sm">
          <p className="text-xs uppercase text-gray-500 font-medium">Stations online</p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">{aggregated.online}</p>
          <p className="text-xs text-gray-500 mt-1">Out of {filteredStations.length} stations</p>
        </div>
        <div className="bg-white rounded-2xl border p-5 shadow-sm">
          <p className="text-xs uppercase text-gray-500 font-medium">Stations offline</p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">{aggregated.offline}</p>
          <p className="text-xs text-gray-500 mt-1">Need investigation</p>
        </div>
        <div className="bg-white rounded-2xl border p-5 shadow-sm">
          <p className="text-xs uppercase text-gray-500 font-medium">Maintenance</p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">{aggregated.maintenance}</p>
          <p className="text-xs text-gray-500 mt-1">Scheduled repairs</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl text-white p-5 shadow-sm">
          <p className="text-xs uppercase font-medium opacity-80">Power usage</p>
          <p className="text-2xl font-semibold mt-2">
            {aggregated.power.charging} kW / {aggregated.power.total} kW
          </p>
          <p className="text-xs opacity-80 mt-1">{percentUsed}% used</p>
          <div className="w-full bg-white/20 rounded-full h-2 mt-3">
            <div className="bg-white rounded-full h-2" style={{ width: `${percentUsed}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {firstTwoConnectors.map(([k, v], idx) => (
          <div key={idx} className="bg-white rounded-2xl border p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <Plug className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">{k}</p>
              <p className="text-2xl font-semibold text-gray-900">{String(v)}</p>
              <p className="text-xs text-gray-500">Connector status</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {filteredStations.map((s: StationOverview, idx: number) => (
          <div
            key={s.station?.id ?? idx}
            className="bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">{s.station?.name ?? "Station"}</h2>
                {getStatusBadge(s.station?.status)}
              </div>
              <p className="text-xs text-gray-500">
                Total connectors: {s.metrics?.totalConnectors ?? 0}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Plug size={16} /> Connectors
                </p>
                {(s.connectors ?? []).length === 0 ? (
                  <p className="text-sm text-gray-500">No connectors available.</p>
                ) : (
                  <div className="space-y-2">
                    {(s.connectors ?? []).map((c: Connector) => (
                      <div
                        key={c.id}
                        className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-2 flex items-center justify-between text-sm"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{c.code ?? "Connector"}</p>
                          <p className="text-xs text-gray-500">
                            {c.type} • {c.powerKw} kW
                          </p>
                        </div>
                        <span className="text-xs text-gray-600">{c.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Power size={16} /> Chargers
                </p>
                {(s.chargers ?? []).length === 0 ? (
                  <p className="text-sm text-gray-500">No chargers available.</p>
                ) : (
                  <div className="space-y-2">
                    {(s.chargers ?? []).map((ch: Charger) => {
                      const online = String(ch.status || "").toUpperCase() === "ONLINE";
                      return (
                        <div
                          key={ch.id}
                          className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-2 flex items-center justify-between text-sm"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">{ch.name ?? ch.code}</p>
                            <p className="text-xs text-gray-500">
                              {ch.status} • {ch.powerKw} kW
                            </p>
                          </div>
                          <button
                            onClick={() => toggleChargerPower(ch.id, ch.status)}
                            disabled={Boolean(toggling[ch.id ?? ""])}
                            className={`text-xs rounded-md font-medium transition ${
                              online
                                ? "text-green-600 hover:text-green-700"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                          >
                            {online ? (
                              <div className="flex items-center gap-1">
                                <Power size={16} className="text-green-600" />
                                <span className="text-xs text-green-600">ON</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <PowerOff size={16} className="text-gray-400" />
                                <span className="text-xs text-gray-400">OFF</span>
                              </div>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
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
