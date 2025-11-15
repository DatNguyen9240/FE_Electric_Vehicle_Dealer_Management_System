import React, { useEffect } from "react";
import api from "@libs/axios";
import { Loader2, Plug, Gauge, Power } from "lucide-react";
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {filteredStations.length === 1 ? (
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{filteredStations[0].station?.name ?? 'Station'}</h1>
                {getStatusBadge(filteredStations[0].station?.status)}
              </div>
              {/* Last updated removed per request */}
            </div>
          ) : (
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Station Dashboard</h1>
              <div className="text-sm text-gray-500">{filteredStations.length} stations</div>
            </div>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[0, 1].map((i) => {
          const entry = firstTwoConnectors[i];
          if (entry) {
            const [k, v] = entry;
            return (
              <div
                key={k}
                className="bg-gradient-to-r from-gray-50 to-gray-25 p-5 rounded-2xl shadow-sm border border-gray-200"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-600">{k}</div>
                    <div className="text-3xl font-bold text-gray-800">{String(v)}</div>
                  </div>
                  <Plug className="text-blue-600 w-8 h-8" />
                </div>
              </div>
            );
          }

          return (
            <div
              key={`placeholder-${i}`}
              className="bg-gradient-to-r from-gray-50 to-gray-25 p-5 rounded-2xl shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">Connector</div>
                  <div className="text-3xl font-bold text-gray-800">-</div>
                </div>
                <Plug className="text-gray-400 w-8 h-8" />
              </div>
            </div>
          );
        })}

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

      {/* Connector Summary removed — connector stats promoted to top cards */}

      {/* Per Station Details */}
      <div className="space-y-5">
          {filteredStations.map((s: StationOverview, idx: number) => (
          <div
            key={s.station?.id ?? idx}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
          >
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
                        className="bg-gray-50 p-2 rounded-lg border border-gray-100 hover:bg-gray-100 transition flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-gray-800">
                            {ch.name} ({ch.code})
                          </div>
                          <div className="text-xs text-gray-500">
                            Status: {ch.status} • {ch.powerKw} kW
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleChargerPower(ch.id, ch.status)}
                            disabled={Boolean(toggling[ch.id ?? ''])}
                            className={`text-xs px-2 py-1 rounded-md font-medium transition ${
                              String(ch.status || '').toUpperCase() === 'ONLINE'
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                          >
                            {String(ch.status || '').toUpperCase() === 'ONLINE' ? 'Turn off' : 'Turn on'}
                          </button>
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
