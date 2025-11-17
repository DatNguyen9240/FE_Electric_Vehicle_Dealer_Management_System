import React from "react";
import api from "@libs/axios";
import { toast } from "react-toastify";
import { useTitle } from "@contexts";
import { Plus, Trash2, Power, PowerOff, Search, ChevronRight, Home } from "lucide-react";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";

type Station = { _id: string; name?: string; code?: string };
 type Charger = { _id: string; name?: string; code?: string; stationId: string };

type Connector = {
	_id: string;
	stationId: string;
	chargerId: string;
	type: string;
	powerKw: number;
	status: string;
	code: string;
};

// form moved to create/edit page

const ConnectorsManager: React.FC = () => {
	const { setTitle } = useTitle();
	const navigate = useNavigate();
	const location = useLocation();
	const { stationId, chargerId } = useParams<{ stationId?: string; chargerId?: string }>();
	const [rows, setRows] = React.useState<Connector[]>([]);
	const [station, setStation] = React.useState<Station | null>(null);
	const [charger, setCharger] = React.useState<Charger | null>(null);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [search, setSearch] = React.useState("");
	const [statusFilter, setStatusFilter] = React.useState<string>("");
	const isFirstMount = React.useRef(true);

	React.useEffect(() => { 
		setTitle(charger ? `Connectors - ${charger.name}` : station ? `Connectors - ${station.name}` : "Connector Management"); 
	}, [setTitle, station, charger]);

	const asRecord = (v: unknown): Record<string, unknown> | null =>
		v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;

	const getErrorMessage = (e: unknown) => {
		try {
			const ae = e as { response?: { data?: { message?: string } }; message?: string };
			return ae?.response?.data?.message || ae?.message || "Failed to load connector list";
		} catch {
			return "Failed to load connector list";
		}
	};

	const load = React.useCallback(async () => {
		if (!stationId || !chargerId) {
			setError("Station ID and Charger ID are required");
			return;
		}
		setLoading(true);
		setError(null);
		try {
			// Load station and charger info
			const [sRes, chRes] = await Promise.all([
				api.get(`/stations/${stationId}`),
				api.get(`/chargers/${chargerId}`),
			]);
			const stationData = sRes.data as Station;
			const chargerData = chRes.data as Charger;
			setStation(stationData);
			setCharger(chargerData);

			// Load connectors for this charger
			const connectorParams: any = { limit: 1000, stationId, chargerId };
			if (statusFilter) connectorParams.status = statusFilter;

			const coRes = await api.get("/connectors", { params: connectorParams });
			const cData: unknown = coRes.data;
			const list = (Array.isArray(cData) ? (cData as Connector[]) : (asRecord(cData)?.items ?? asRecord(cData)?.data ?? [])) as Connector[];
			setRows(list);
		} catch (err: unknown) {
			setError(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	}, [stationId, chargerId, statusFilter]);

	React.useEffect(() => { load(); }, [load]);

	// Reload data when returning from edit/create page
	React.useEffect(() => {
		if (location.pathname === "/admin/infrastructure/connectors" && !isFirstMount.current) {
			load();
		}
		isFirstMount.current = false;
	}, [location.pathname, load]);

	const openCreate = () => { 
		if (stationId && chargerId) {
			navigate(`/admin/infrastructure/stations/${stationId}/chargers/${chargerId}/connectors/create`); 
		} else {
			navigate("/admin/infrastructure/connectors/create"); 
		}
	};

// creation/edit moved to dedicated pages

	const toggleStatus = async (c: Connector) => {
		// Toggle between IDLE and OFFLINE only
		// Only allow toggle if status is IDLE or OFFLINE
		if (c.status !== "IDLE" && c.status !== "OFFLINE") {
			toast.info("Cannot toggle connector while in use (RESERVED, CHARGING, or FINISHED)");
			return;
		}
		const next = c.status === "IDLE" ? "OFFLINE" : "IDLE";
		// Optimistic update
		setRows(prevRows => 
			prevRows.map(connector => 
				connector._id === c._id ? { ...connector, status: next } : connector
			)
		);
		try {
			const response = await api.patch(`/connectors/${c._id}/status`, { status: next });
			if (response.data && response.data.status) {
				setRows(prevRows => 
					prevRows.map(connector => 
						connector._id === c._id ? { ...connector, status: response.data.status } : connector
					)
				);
			}
			toast.success(`Connector ${next === "IDLE" ? "activated" : "deactivated"}`);
		} catch (e: any) {
			// Rollback on error
			setRows(prevRows => 
				prevRows.map(connector => 
					connector._id === c._id ? { ...connector, status: c.status } : connector
				)
			);
			const errorMsg = e?.response?.data?.message || e?.message || "Error changing status";
			toast.error(errorMsg);
		}
	};

	const remove = async (id: string) => {
		if (!confirm("Delete this connector?")) return;
		try {
			await api.delete(`/connectors/${id}`);
			toast.success("Connector deleted successfully!");
			await load();
		} catch (e: any) {
			const errorMsg = e?.response?.data?.message || e?.message || "Error deleting connector";
			toast.error(errorMsg);
		}
	};

	

	const filtered = rows.filter((c) => {
		const q = search.trim().toLowerCase();
		if (!q) return true;
		return (
			c.code.toLowerCase().includes(q) ||
			c.type.toLowerCase().includes(q)
		);
	});

	return (
		<div className="p-6">
			{/* Breadcrumb */}
			<div className="flex items-center gap-2 text-sm mb-4">
				<Link to="/admin/infrastructure/stations" className="hover:text-blue-600 flex items-center gap-1 text-gray-600">
					<Home size={16} />
					Stations
				</Link>
				<ChevronRight size={16} className="text-gray-400" />
				{station && (
					<>
						<Link 
							to={`/admin/infrastructure/stations/${stationId}/chargers`} 
							className="hover:text-blue-600 text-gray-600"
						>
							{station.name}
						</Link>
						<ChevronRight size={16} className="text-gray-400" />
					</>
				)}
				{charger && (
					<>
						<Link 
							to={`/admin/infrastructure/stations/${stationId}/chargers`} 
							className="hover:text-blue-600 text-gray-600"
						>
							{charger.name}
						</Link>
						<ChevronRight size={16} className="text-gray-400" />
					</>
				)}
				<span className="text-gray-900 font-medium">Connectors</span>
			</div>

			{/* Toolbar */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-4 flex-wrap">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
						<input
							type="text"
							placeholder="Search connector..."
							value={search}
							className="border border-[#333333] rounded-lg pl-10 pr-7 py-1 w-72 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333]"
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
					>
						<option value="">Status: All</option>
						<option value="IDLE">IDLE</option>
						<option value="OFFLINE">OFFLINE</option>
						<option value="RESERVED">RESERVED</option>
						<option value="CHARGING">CHARGING</option>
						<option value="FINISHED">FINISHED</option>
					</select>
				</div>
				<button 
					onClick={openCreate} 
					disabled={rows.length >= 2}
					className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
						rows.length >= 2
							? "bg-gray-400 text-white cursor-not-allowed"
							: "bg-blue-600 text-white hover:bg-blue-700"
					}`}
					title={rows.length >= 2 ? "Maximum 2 connectors per charger" : "Add Connector"}
				>
					<Plus size={16} /> Add Connector
				</button>
			</div>
			<div className="bg-white rounded-xl border">
				<table className="min-w-full text-sm">
					<thead>
						<tr className="text-gray-500 border-b">
							<th className="px-4 py-3 text-left font-semibold">Code</th>
							<th className="px-4 py-3 text-left font-semibold">Type</th>
							<th className="px-4 py-3 text-left font-semibold">Power (kW)</th>
							<th className="px-4 py-3 text-left font-semibold">Status</th>
							<th className="px-4 py-3 text-right font-semibold">Actions</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr><td className="px-4 py-6 text-gray-500" colSpan={5}>Loading...</td></tr>
						) : filtered.length === 0 ? (
							<tr><td className="px-4 py-6 text-gray-500" colSpan={5}>No connectors yet</td></tr>
						) : filtered.map((c) => (
							<tr key={c._id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
								<td className="px-4 py-3">{c.code}</td>
								<td className="px-4 py-3">{c.type}</td>
								<td className="px-4 py-3">{c.powerKw}</td>
								<td className="px-4 py-3">
									<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
										c.status === "IDLE" 
											? "bg-green-50 text-green-600" 
											: c.status === "OFFLINE"
											? "bg-gray-50 text-gray-600"
											: "bg-yellow-50 text-yellow-600"
									}`}>
										{c.status}
									</span>
								</td>
								<td className="px-4 py-3 text-right">
									<button 
										onClick={() => toggleStatus(c)} 
										className={`mr-3 transition-colors ${
											c.status === "IDLE" 
												? "text-green-600 hover:text-green-700" 
												: c.status === "OFFLINE"
												? "text-gray-400 hover:text-gray-600"
												: "text-yellow-600 hover:text-yellow-700 cursor-not-allowed opacity-60"
										}`}
										title={
											c.status === "IDLE" 
												? "Deactivate connector" 
												: c.status === "OFFLINE"
												? "Activate connector"
												: "Cannot toggle while in use"
										}
										disabled={c.status !== "IDLE" && c.status !== "OFFLINE"}
									>
										{c.status === "IDLE" ? (
											<div className="flex items-center gap-1">
												<Power size={18} className="text-green-600" />
												<span className="text-xs text-green-600">ON</span>
											</div>
										) : c.status === "OFFLINE" ? (
											<div className="flex items-center gap-1">
												<PowerOff size={18} className="text-gray-400" />
												<span className="text-xs text-gray-400">OFF</span>
											</div>
										) : (
											<div className="flex items-center gap-1">
												<Power size={18} className="text-yellow-600" />
												<span className="text-xs text-yellow-600">{c.status}</span>
											</div>
										)}
									</button>
									<button onClick={() => remove(c._id)} className="text-gray-500 hover:text-red-600" title="Delete"><Trash2 size={16} /></button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{error && <div className="px-4 py-3 text-red-600 text-sm">{error}</div>}
			</div>
		</div>
	);
};

export default ConnectorsManager;
