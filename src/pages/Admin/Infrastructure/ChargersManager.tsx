import React from "react";
import api from "@libs/axios";
import { toast } from "react-toastify";
import { useTitle } from "@contexts";
import { Plus, Trash2, Power, PowerOff, Search, ChevronRight, Home } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";

type Station = { _id: string; name?: string; code?: string };

type Charger = {
	_id: string;
	stationId: string;
	name: string;
	code: string;
	connectorType: string;
	powerKw: number;
	status: string;
};

// form moved to create/edit page

const ChargersManager: React.FC = () => {
	const { setTitle } = useTitle();
	const navigate = useNavigate();
	const { stationId } = useParams<{ stationId: string }>();
	const [rows, setRows] = React.useState<Charger[]>([]);
	const [station, setStation] = React.useState<Station | null>(null);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [search, setSearch] = React.useState("");

	React.useEffect(() => { 
		setTitle(station ? `Chargers - ${station.name}` : "Charger Management"); 
	}, [setTitle, station]);

	const asRecord = (v: unknown): Record<string, unknown> | null =>
		v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;

	const getErrorMessage = (e: unknown) => {
		try {
			const ae = e as { response?: { data?: { message?: string } }; message?: string };
			return ae?.response?.data?.message || ae?.message || "Failed to load charger list";
		} catch {
			return "Failed to load charger list";
		}
	};

	const load = React.useCallback(async () => {
		if (!stationId) {
			setError("Station ID is required");
			return;
		}
		setLoading(true);
		setError(null);
		try {
			// Load station info
			const sRes = await api.get(`/stations/${stationId}`);
			const stationData = sRes.data as Station;
			setStation(stationData);

			// Load chargers for this station
			const cRes = await api.get("/chargers", { params: { stationId, limit: 1000 } });
			const cData: unknown = cRes.data;
			const list = (Array.isArray(cData)
				? (cData as Charger[])
				: (asRecord(cData)?.items ?? asRecord(cData)?.data ?? [])) as Charger[];
			setRows(list);
		} catch (err: unknown) {
			setError(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	}, [stationId]);

	React.useEffect(() => { load(); }, [load]);

	const openCreate = () => { 
		if (stationId) {
			navigate(`/admin/infrastructure/stations/${stationId}/chargers/create`); 
		} else {
			navigate("/admin/infrastructure/chargers/create"); 
		}
	};
	const viewConnectors = (c: Charger) => { 
		if (stationId) {
			navigate(`/admin/infrastructure/stations/${stationId}/chargers/${c._id}/connectors`); 
		}
	};

	// creation/edit moved to dedicated pages

	const remove = async (id: string) => {
		if (!confirm("Delete this charger?")) return;
		try {
			await api.delete(`/chargers/${id}`);
			toast.success("Charger deleted successfully!");
			await load();
		} catch (e: any) {
			const errorMsg = e?.response?.data?.message || e?.message || "Error deleting charger";
			toast.error(errorMsg);
		}
	};

	const toggleStatus = async (c: Charger) => {
		// Cycle: ONLINE → OFFLINE → MAINTENANCE → ONLINE
		let next: string;
		if (c.status === "ONLINE") {
			next = "OFFLINE";
		} else if (c.status === "OFFLINE") {
			next = "MAINTENANCE";
		} else {
			next = "ONLINE";
		}
		// Optimistic update - cập nhật UI ngay lập tức
		setRows(prevRows => 
			prevRows.map(charger => 
				charger._id === c._id ? { ...charger, status: next } : charger
			)
		);
		try {
			const response = await api.put(`/chargers/${c._id}`, { ...c, status: next });
			// Cập nhật từ response của server nếu có
			if (response.data && response.data.status) {
				setRows(prevRows => 
					prevRows.map(charger => 
						charger._id === c._id ? { ...charger, status: response.data.status } : charger
					)
				);
			}
			const statusMessages: Record<string, string> = {
				ONLINE: "turned on",
				OFFLINE: "turned off",
				MAINTENANCE: "set to maintenance"
			};
			toast.success(`Charger ${statusMessages[next] || "updated"}`);
		} catch (e: any) {
			// Rollback on error
			setRows(prevRows => 
				prevRows.map(charger => 
					charger._id === c._id ? { ...charger, status: c.status } : charger
				)
			);
			const errorMsg = e?.response?.data?.message || e?.message || "Error changing status";
			toast.error(errorMsg);
		}
	};

	const filtered = rows.filter((c) => {
		const q = search.trim().toLowerCase();
		if (!q) return true;
		return (
			c.name.toLowerCase().includes(q) ||
			c.code.toLowerCase().includes(q) ||
			c.connectorType.toLowerCase().includes(q)
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
							to="/admin/infrastructure/stations" 
							className="hover:text-blue-600 text-gray-600"
						>
							{station.name}
						</Link>
						<ChevronRight size={16} className="text-gray-400" />
					</>
				)}
				<span className="text-gray-900 font-medium">Chargers</span>
			</div>

			{/* Toolbar */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
						<input
							type="text"
							placeholder="Search charger..."
							value={search}
							className="border border-[#333333] rounded-lg pl-10 pr-7 py-1 w-72 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333]"
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</div>
				<button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"><Plus size={16} /> Create New Charger</button>
			</div>
			<div className="bg-white rounded-xl border">
				<table className="min-w-full text-sm">
					<thead>
						<tr className="text-gray-500 border-b">
							<th className="px-4 py-3 text-left font-semibold">Name</th>
							<th className="px-4 py-3 text-left font-semibold">Code</th>
							<th className="px-4 py-3 text-left font-semibold">Type</th>
							<th className="px-4 py-3 text-left font-semibold">Power (kW)</th>
							<th className="px-4 py-3 text-left font-semibold">Status</th>
							<th className="px-4 py-3 text-right font-semibold">Actions</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr><td className="px-4 py-6 text-gray-500" colSpan={6}>Loading...</td></tr>
						) : filtered.length === 0 ? (
							<tr><td className="px-4 py-6 text-gray-500" colSpan={6}>No chargers yet</td></tr>
						) : filtered.map((c) => (
							<tr key={c._id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
								<td className="px-4 py-3">
									<button
										onClick={() => viewConnectors(c)}
										className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium hover:underline"
									>
										{c.name}
										<ChevronRight size={16} />
									</button>
								</td>
								<td className="px-4 py-3">{c.code}</td>
								<td className="px-4 py-3">{c.connectorType}</td>
								<td className="px-4 py-3">{c.powerKw}</td>
								<td className="px-4 py-3">
									<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
										c.status === "ONLINE" 
											? "bg-green-50 text-green-600" 
											: c.status === "MAINTENANCE"
											? "bg-yellow-50 text-yellow-600"
											: "bg-gray-50 text-gray-600"
									}`}>
										{c.status}
									</span>
								</td>
								<td className="px-4 py-3 text-right">
									<button 
										onClick={() => toggleStatus(c)} 
										className={`mr-3 transition-colors ${
											c.status === "ONLINE" 
												? "text-green-600 hover:text-green-700" 
												: c.status === "OFFLINE"
												? "text-gray-400 hover:text-gray-600"
												: "text-yellow-600 hover:text-yellow-700"
										}`}
										title={
											c.status === "ONLINE" 
												? "Turn off charger" 
												: c.status === "OFFLINE"
												? "Set to maintenance"
												: "Turn on charger"
										}
									>
										{c.status === "ONLINE" ? (
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
												<span className="text-xs text-yellow-600">MAINT</span>
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

export default ChargersManager;
