import React, { useEffect } from "react";
import api from "@libs/axios";
import { Loader2, Plug, Power, PowerOff, RefreshCw } from "lucide-react";
import { useTitle } from "../../contexts";
import { toast } from "react-toastify";

const REFRESH_INTERVAL_MS = 30000; // 30 seconds

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

    const interval = setInterval(() => {
      if (mounted) {
        load();
      }
    }, REFRESH_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(interval);
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

  const [toggling, setToggling] = React.useState<Record<string, boolean>>({});

  const toggleConnectorStatus = async (connectorId: string | undefined, currentStatus?: string) => {
    if (!connectorId) return;
    const status = String(currentStatus || '').toUpperCase();
    
    // Allow toggle: IDLE <-> OFFLINE, and FINISHED -> IDLE
    if (status === "IDLE") {
      // IDLE -> OFFLINE
      const next = "OFFLINE";
      setToggling((s) => ({ ...s, [connectorId]: true }));
      try {
        await api.patch(`/connectors/${connectorId}/status`, { status: next });
        toast.success("Connector deactivated");
        await loadStations();
      } catch (err) {
        console.error(err);
        const errorMsg = (err as any)?.response?.data?.message || (err as any)?.message || "Error changing status";
        toast.error(errorMsg);
      } finally {
        setToggling((s) => ({ ...s, [connectorId]: false }));
      }
    } else if (status === "OFFLINE") {
      // OFFLINE -> IDLE
      const next = "IDLE";
      setToggling((s) => ({ ...s, [connectorId]: true }));
      try {
        await api.patch(`/connectors/${connectorId}/status`, { status: next });
        toast.success("Connector activated");
        await loadStations();
      } catch (err) {
        console.error(err);
        const errorMsg = (err as any)?.response?.data?.message || (err as any)?.message || "Error changing status";
        toast.error(errorMsg);
      } finally {
        setToggling((s) => ({ ...s, [connectorId]: false }));
      }
    } else if (status === "FINISHED") {
      // FINISHED -> IDLE (reset after charging session)
      const next = "IDLE";
      setToggling((s) => ({ ...s, [connectorId]: true }));
      try {
        await api.patch(`/connectors/${connectorId}/status`, { status: next });
        toast.success("Connector reset to available");
        await loadStations();
      } catch (err) {
        console.error(err);
        const errorMsg = (err as any)?.response?.data?.message || (err as any)?.message || "Error changing status";
        toast.error(errorMsg);
      } finally {
        setToggling((s) => ({ ...s, [connectorId]: false }));
      }
    } else {
      // RESERVED, CHARGING - cannot toggle
      toast.info("Cannot toggle connector while in use (RESERVED or CHARGING)");
    }
  };

  const toggleChargerStatus = async (chargerId: string | undefined, currentStatus?: string) => {
    if (!chargerId) return;
    // Staff can only toggle between ONLINE and OFFLINE (no MAINTENANCE)
    const status = String(currentStatus || '').toUpperCase();
    const next = status === "ONLINE" ? "OFFLINE" : "ONLINE";
    setToggling((s) => ({ ...s, [chargerId]: true }));
    try {
      await api.patch(`/staff/chargers/${chargerId}/power`, { status: next });
      toast.success(`Charger ${next === "ONLINE" ? "turned on" : "turned off"}`);
      await loadStations();
    } catch (err) {
      console.error(err);
      const errorMsg = (err as any)?.response?.data?.message || (err as any)?.message || "Error changing status";
      toast.error(errorMsg);
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
      const m = cur.metrics || {};
      const sc = m.statusCounts || {};
      Object.keys(sc).forEach((k) => {
        acc.connectors[k] = (acc.connectors[k] || 0) + (sc[k] || 0);
      });

      // Count chargers by status
      const chargers = cur.chargers || [];
      chargers.forEach((ch: Charger) => {
        const status = String(ch.status || '').toUpperCase();
        if (status === 'MAINTENANCE') {
          acc.maintenanceChargers = (acc.maintenanceChargers || 0) + 1;
        }
      });

      const pw = m.powerKw || {};
      acc.power.total += pw.total || 0;
      acc.power.charging += pw.charging || 0;
      acc.power.available += pw.available || 0;
      return acc;
    },
    {
      connectors: {} as Record<string, number>,
      maintenanceChargers: 0,
      power: { total: 0, charging: 0, available: 0 },
    }
  );

  const filteredStations = stationsArr;

  const percentUsed =
    aggregated.power.total > 0
      ? Math.round((aggregated.power.charging / aggregated.power.total) * 100)
      : 0;

  const formatNumber = (value: number | undefined | null) =>
    Number(value ?? 0).toLocaleString("vi-VN");

  const MetricCard: React.FC<{
    title: string;
    value: number | string;
    subtitle?: string;
    subtitleClassName?: string;
    bgClassName?: string;
  }> = ({ title, value, subtitle, subtitleClassName, bgClassName }) => (
    <div className={`${bgClassName ?? "bg-white"} rounded-xl border p-6 flex flex-col h-35 relative`}>
      <span className="text-sm text-gray-500 mb-3 font-medium uppercase tracking-wide leading-tight">
        {title}
      </span>
      <span className="text-5xl font-bold text-black ps-3">
        {typeof value === "number" ? formatNumber(value) : value}
      </span>
      {subtitle && (
        <span
          className={`text-sm font-medium absolute bottom-3 right-3 ${subtitleClassName ?? "text-gray-600"
            }`}
        >
          {subtitle}
        </span>
      )}
    </div>
  );

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
    <div className="space-y-6">
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={loadStations}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 transition"
        >
          <RefreshCw size={16} />
          Refresh data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="RESERVED"
          value={aggregated.connectors.RESERVED || 0}
          subtitle="Connectors reserved"
          subtitleClassName="text-green-600"
        />
        <MetricCard
          title="CHARGING"
          value={aggregated.connectors.CHARGING || 0}
          subtitle="Active charging"
          subtitleClassName="text-green-600"
        />
        <MetricCard
          title="MAINTENANCE"
          value={aggregated.maintenanceChargers || 0}
          subtitle="Chargers in maintenance"
          subtitleClassName="text-green-600"
        />
        <div className="bg-blue-50 rounded-xl border p-6 flex flex-col h-35 relative">
          <span className="text-sm text-gray-500 mb-3 font-medium uppercase tracking-wide leading-tight">
            POWER USAGE
          </span>
          <span className="text-5xl font-bold text-black ">
            {formatNumber(aggregated.power.charging)} / {formatNumber(aggregated.power.total)} <span className="text-lg">kW</span>
          </span>
          <span className="text-sm font-medium absolute bottom-3 right-3 text-green-600">
            {percentUsed}% used
          </span>
        </div>
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
                    {(s.connectors ?? []).map((c: Connector) => {
                      const status = String(c.status || '').toUpperCase();
                      const isIdle = status === "IDLE";
                      const isOffline = status === "OFFLINE";
                      const isFinished = status === "FINISHED";
                      const canToggle = isIdle || isOffline || isFinished;
                      return (
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
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              isIdle 
                                ? "bg-green-50 text-green-600" 
                                : isOffline
                                ? "bg-gray-50 text-gray-600"
                                : "bg-yellow-50 text-yellow-600"
                            }`}>
                              {c.status}
                            </span>
                            {canToggle ? (
                              <button 
                                onClick={() => toggleConnectorStatus(c.id, c.status)} 
                                disabled={Boolean(toggling[c.id ?? ""])}
                                className={`transition-colors ${
                                  isIdle 
                                    ? "text-green-600 hover:text-green-700" 
                                    : isFinished
                                    ? "text-green-600 hover:text-green-700"
                                    : "text-gray-400 hover:text-gray-600"
                                }`}
                                title={
                                  isIdle 
                                    ? "Deactivate connector" 
                                    : isFinished
                                    ? "Reset connector to available"
                                    : "Activate connector"
                                }
                              >
                                {isIdle || isFinished ? (
                                  <div className="flex items-center gap-1">
                                    <Power size={18} className="text-green-600" />
                                    <span className="text-xs text-green-600">ON</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <PowerOff size={18} className="text-gray-400" />
                                    <span className="text-xs text-gray-400">OFF</span>
                                  </div>
                                )}
                              </button>
                            ) : (
                              <span className="text-xs text-gray-500 italic" title="Cannot toggle while in use (RESERVED or CHARGING)">
                                In use
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
                      const status = String(ch.status || "").toUpperCase();
                      const isOnline = status === "ONLINE";
                      const isOffline = status === "OFFLINE";
                      const isMaintenance = status === "MAINTENANCE";
                      // Staff can only toggle ONLINE/OFFLINE, but can view MAINTENANCE status
                      const canToggle = isOnline || isOffline;
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
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              isOnline 
                                ? "bg-green-50 text-green-600" 
                                : isMaintenance
                                ? "bg-yellow-50 text-yellow-600"
                                : "bg-gray-50 text-gray-600"
                            }`}>
                              {ch.status}
                            </span>
                            {canToggle ? (
                              <button
                                onClick={() => toggleChargerStatus(ch.id, ch.status)}
                                disabled={Boolean(toggling[ch.id ?? ""])}
                                className={`transition-colors ${
                                  isOnline 
                                    ? "text-green-600 hover:text-green-700" 
                                    : "text-gray-400 hover:text-gray-600"
                                }`}
                                title={isOnline ? "Turn off charger" : "Turn on charger"}
                              >
                                {isOnline ? (
                                  <div className="flex items-center gap-1">
                                    <Power size={18} className="text-green-600" />
                                    <span className="text-xs text-green-600">ON</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <PowerOff size={18} className="text-gray-400" />
                                    <span className="text-xs text-gray-400">OFF</span>
                                  </div>
                                )}
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 opacity-60 cursor-not-allowed" title="Maintenance mode - cannot toggle">
                                <Power size={18} className="text-yellow-600" />
                                <span className="text-xs text-yellow-600">MAINT</span>
                              </div>
                            )}
                          </div>
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
