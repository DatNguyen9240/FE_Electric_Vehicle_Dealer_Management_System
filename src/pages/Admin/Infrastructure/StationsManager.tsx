import React from "react";
import api from "@libs/axios";
import { useTitle } from "@contexts";
import { Plus, Trash2, Pencil, Search, ChevronRight, Power, PowerOff } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

type Station = {
	_id: string;
	name: string;
	lat: number;
	lng: number;
	status: string;
};

// form moved to create/edit page

const asRecord = (v: unknown): Record<string, unknown> => (typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {});
const getErrorMessage = (eVal: unknown, fallback = "An error occurred") => {
	if (!eVal) return fallback;
	if (typeof eVal === "string") return eVal;
	if (eVal instanceof Error) return eVal.message;
	const r = asRecord(eVal);
	if (typeof r.message === "string") return r.message;
	const response = asRecord(r.response);
	const data = asRecord(response.data);
	if (typeof data.message === "string") return data.message;
	return fallback;
};

const StationsManager: React.FC = () => {
	const { setTitle } = useTitle();
	const [rows, setRows] = React.useState<Station[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [search, setSearch] = React.useState("");
	const navigate = useNavigate();

	React.useEffect(() => { setTitle("Station Management"); }, [setTitle]);

	const load = React.useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await api.get("/stations", { params: { limit: 1000 } });
			const data = res.data as unknown;
			let list: Station[] = [];
			if (Array.isArray(data)) list = data as Station[];
			else {
				const r = asRecord(data);
				const items = r.items ?? r.data ?? r.stations ?? r.list;
				if (Array.isArray(items)) list = items as Station[];
			}
			setRows(list);
		} catch (err: unknown) {
			setError(getErrorMessage(err, "Failed to load station list"));
		} finally {
			setLoading(false);
		}
	}, []);

	React.useEffect(() => { load(); }, [load]);

	const openCreate = () => { navigate("/admin/infrastructure/stations/create"); };
	const openEdit = (s: Station) => { navigate(`/admin/infrastructure/stations/edit/${s._id}`); };
	const viewChargers = (s: Station) => { navigate(`/admin/infrastructure/stations/${s._id}/chargers`); };

	// creation/edit moved to dedicated pages like Tariffs

	const toggleStatus = async (s: Station) => {
		// Cycle: ONLINE → OFFLINE → MAINTENANCE → ONLINE
		let next: string;
		if (s.status === "ONLINE") {
			next = "OFFLINE";
		} else if (s.status === "OFFLINE") {
			next = "MAINTENANCE";
		} else {
			next = "ONLINE";
		}
		// Optimistic update
		setRows(prevRows => 
			prevRows.map(station => 
				station._id === s._id ? { ...station, status: next } : station
			)
		);
		try {
			const response = await api.put(`/stations/${s._id}`, { ...s, status: next });
			if (response.data && response.data.status) {
				setRows(prevRows => 
					prevRows.map(station => 
						station._id === s._id ? { ...station, status: response.data.status } : station
					)
				);
			}
			const statusMessages: Record<string, string> = {
				ONLINE: "activated",
				OFFLINE: "deactivated",
				MAINTENANCE: "set to maintenance"
			};
			toast.success(`Station ${statusMessages[next] || "updated"}`);
		} catch (e: any) {
			// Rollback on error
			setRows(prevRows => 
				prevRows.map(station => 
					station._id === s._id ? { ...station, status: s.status } : station
				)
			);
			const errorMsg = e?.response?.data?.message || e?.message || "Error changing status";
			toast.error(errorMsg);
		}
	};

	const remove = async (id: string) => {
		if (!confirm("Delete this station?")) return;
		try {
			await api.delete(`/stations/${id}`);
			toast.success("Station deleted successfully!");
			await load();
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, "Error deleting station"));
		}
	};

	// filter client-side similar to Tariffs
	const filtered = rows.filter((s) => {
		const q = search.trim().toLowerCase();
		if (!q) return true;
		return (
			(s.name || "").toLowerCase().includes(q) ||
			String(s.lat).includes(q) ||
			String(s.lng).includes(q) ||
			(s.status || "").toLowerCase().includes(q)
		);
	});

	return (
		<div className="p-6">
			{/* Toolbar like Tariffs */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
						<input
							type="text"
							placeholder="Search station..."
							value={search}
							className="border border-[#333333] rounded-lg pl-10 pr-7 py-1 w-72 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333]"
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</div>
				<button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
					<Plus size={16} />
					Create New Station
				</button>
			</div>

			<div className="bg-white rounded-xl border">
				<table className="min-w-full text-sm">
					<thead>
						<tr className="text-gray-500 border-b">
							<th className="px-4 py-3 text-left font-semibold">Name</th>
							<th className="px-4 py-3 text-left font-semibold">Coordinates</th>
							<th className="px-4 py-3 text-left font-semibold">Status</th>
							<th className="px-4 py-3 text-right font-semibold">Actions</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr><td className="px-4 py-6 text-gray-500" colSpan={4}>Loading...</td></tr>
						) : filtered.length === 0 ? (
							<tr><td className="px-4 py-6 text-gray-500" colSpan={4}>No stations yet</td></tr>
						) : filtered.map((s) => (
							<tr key={s._id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
								<td className="px-4 py-3">
									<button
										onClick={() => viewChargers(s)}
										className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium hover:underline"
									>
										{s.name}
										<ChevronRight size={16} />
									</button>
								</td>
								<td className="px-4 py-3">{s.lat}, {s.lng}</td>
								<td className="px-4 py-3">
									<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
										s.status === "ONLINE" 
											? "bg-green-50 text-green-600" 
											: s.status === "MAINTENANCE"
											? "bg-yellow-50 text-yellow-600"
											: "bg-gray-50 text-gray-600"
									}`}>
										{s.status}
									</span>
								</td>
								<td className="px-4 py-3 text-right">
									<button 
										onClick={() => toggleStatus(s)} 
										className={`mr-3 transition-colors ${
											s.status === "ONLINE" 
												? "text-green-600 hover:text-green-700" 
												: s.status === "OFFLINE"
												? "text-gray-400 hover:text-gray-600"
												: "text-yellow-600 hover:text-yellow-700"
										}`}
										title={
											s.status === "ONLINE" 
												? "Turn off station" 
												: s.status === "OFFLINE"
												? "Set to maintenance"
												: "Activate station"
										}
									>
										{s.status === "ONLINE" ? (
											<div className="flex items-center gap-1">
												<Power size={18} className="text-green-600" />
												<span className="text-xs text-green-600">ON</span>
											</div>
										) : s.status === "OFFLINE" ? (
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
									<button onClick={() => openEdit(s)} className="text-gray-500 hover:text-blue-600 mr-3" title="Edit"><Pencil size={16} /></button>
									<button onClick={() => remove(s._id)} className="text-gray-500 hover:text-red-600" title="Delete"><Trash2 size={16} /></button>
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

export default StationsManager;
