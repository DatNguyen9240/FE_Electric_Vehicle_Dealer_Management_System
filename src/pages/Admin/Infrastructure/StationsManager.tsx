import React from "react";
import api from "@libs/axios";
import { useTitle } from "@contexts";
import { Plus, Trash2, Pencil, Search } from "lucide-react";
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

	// creation/edit moved to dedicated pages like Tariffs

	const remove = async (id: string) => {
		if (!confirm("Delete this station?")) return;
		try {
			await api.delete(`/stations/${id}`);
			await load();
		} catch (err: unknown) {
			alert(getErrorMessage(err, "Error deleting station"));
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
				<button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
					<Plus size={18} />
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
							<tr key={s._id} className="border-b last:border-b-0">
								<td className="px-4 py-3">{s.name}</td>
								<td className="px-4 py-3">{s.lat}, {s.lng}</td>
								<td className="px-4 py-3">{s.status}</td>
								<td className="px-4 py-3 text-right">
									<button onClick={() => openEdit(s)} className="text-gray-500 hover:text-blue-600 mr-3"><Pencil size={16} /></button>
									<button onClick={() => remove(s._id)} className="text-gray-500 hover:text-red-600"><Trash2 size={16} /></button>
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
