import React from "react";
import api from "@libs/axios";
import { toast } from "react-toastify";
import { useTitle } from "@contexts";
import { Plus, Trash2, Pencil,  Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

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
	const [rows, setRows] = React.useState<Connector[]>([]);
	const [stations, setStations] = React.useState<Station[]>([]);
	const [chargers, setChargers] = React.useState<Charger[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [search, setSearch] = React.useState("");
	const [stationFilter, setStationFilter] = React.useState<string>("");
	const [statusFilter, setStatusFilter] = React.useState<string>("");
	const isFirstMount = React.useRef(true);


	React.useEffect(() => { setTitle("Connector Management"); }, [setTitle]);

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
		setLoading(true);
		setError(null);
		try {
			// Build query params for connectors API
			const connectorParams: any = { limit: 1000 };
			if (stationFilter) connectorParams.stationId = stationFilter;
			if (statusFilter) connectorParams.status = statusFilter;

			const [coRes, sRes, chRes] = await Promise.all([
				api.get("/connectors", { params: connectorParams }),
				api.get("/stations", { params: { limit: 1000 } }),
				api.get("/chargers", { params: { limit: 1000 } }),
			]);
			const cData: unknown = coRes.data;
			const sData: unknown = sRes.data;
			const chData: unknown = chRes.data;
			const list = (Array.isArray(cData) ? (cData as Connector[]) : (asRecord(cData)?.items ?? asRecord(cData)?.data ?? [])) as Connector[];
			const sts = (Array.isArray(sData) ? (sData as Station[]) : (asRecord(sData)?.items ?? asRecord(sData)?.data ?? [])) as Station[];
			const chs = (Array.isArray(chData) ? (chData as Charger[]) : (asRecord(chData)?.items ?? asRecord(chData)?.data ?? [])) as Charger[];
			setRows(list);
			setStations(sts);
			setChargers(chs);
		} catch (err: unknown) {
			setError(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	}, [stationFilter, statusFilter]);

	React.useEffect(() => { load(); }, [load]);

	// Reload data when returning from edit/create page
	React.useEffect(() => {
		if (location.pathname === "/admin/infrastructure/connectors" && !isFirstMount.current) {
			load();
		}
		isFirstMount.current = false;
	}, [location.pathname, load]);

const openCreate = () => { navigate("/admin/infrastructure/connectors/create"); };
const openEdit = (c: Connector) => { navigate(`/admin/infrastructure/connectors/edit/${c._id}`); };

// creation/edit moved to dedicated pages

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
		const stationName = stations.find((s) => s._id === c.stationId)?.name || "";
		const chargerName = chargers.find((ch) => ch._id === c.chargerId)?.name || "";
		return (
			c.code.toLowerCase().includes(q) ||
			c.type.toLowerCase().includes(q) ||
			stationName.toLowerCase().includes(q) ||
			chargerName.toLowerCase().includes(q)
		);
	});

	return (
		<div className="p-6">
			{/* Toolbar like Tariffs */}
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
						value={stationFilter}
						onChange={(e) => setStationFilter(e.target.value)}
						className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
					>
						<option value="">Station: All</option>
						{stations.map((s) => (
							<option key={s._id} value={s._id}>
								{s.name || s.code || s._id}
							</option>
						))}
					</select>
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
				<button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"><Plus size={18} /> Add Connector</button>
			</div>
			<div className="bg-white rounded-xl border">
				<table className="min-w-full text-sm">
					<thead>
						<tr className="text-gray-500 border-b">
							<th className="px-4 py-3 text-left font-semibold">Station</th>
							<th className="px-4 py-3 text-left font-semibold">Charger</th>
							<th className="px-4 py-3 text-left font-semibold">Code</th>
							<th className="px-4 py-3 text-left font-semibold">Type</th>
							<th className="px-4 py-3 text-left font-semibold">Power (kW)</th>
							<th className="px-4 py-3 text-left font-semibold">Status</th>
							<th className="px-4 py-3 text-right font-semibold">Actions</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr><td className="px-4 py-6 text-gray-500" colSpan={7}>Loading...</td></tr>
						) : filtered.length === 0 ? (
							<tr><td className="px-4 py-6 text-gray-500" colSpan={7}>No connectors yet</td></tr>
						) : filtered.map((c) => {
							const stationName = stations.find((s) => s._id === c.stationId)?.name || "—";
							const chargerName = chargers.find((ch) => ch._id === c.chargerId)?.name || "—";
							return (
								<tr key={c._id} className="border-b last:border-b-0">
									<td className="px-4 py-3">{stationName}</td>
									<td className="px-4 py-3">{chargerName}</td>
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
										
										<button onClick={() => openEdit(c)} className="text-gray-500 hover:text-blue-600 mr-3" title="Edit"><Pencil size={16} /></button>
										<button onClick={() => remove(c._id)} className="text-gray-500 hover:text-red-600" title="Delete"><Trash2 size={16} /></button>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				{error && <div className="px-4 py-3 text-red-600 text-sm">{error}</div>}
			</div>


		</div>
	);
};

export default ConnectorsManager;
