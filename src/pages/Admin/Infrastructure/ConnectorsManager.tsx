import React from "react";
import api from "@libs/axios";
import { useTitle } from "@contexts";
import { Plus, Trash2, Pencil, ToggleLeft, ToggleRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
	const [rows, setRows] = React.useState<Connector[]>([]);
	const [stations, setStations] = React.useState<Station[]>([]);
	const [chargers, setChargers] = React.useState<Charger[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [search, setSearch] = React.useState("");


	React.useEffect(() => { setTitle("Quản lí đầu sạc"); }, [setTitle]);

	const load = React.useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const [coRes, sRes, chRes] = await Promise.all([
				api.get<any>("/connectors", { params: { limit: 1000 } }),
				api.get<any>("/stations", { params: { limit: 1000 } }),
				api.get<any>("/chargers", { params: { limit: 1000 } }),
			]);
			const list: Connector[] = Array.isArray(coRes.data) ? coRes.data : (coRes.data?.items || []);
			setRows(list);
			setStations(Array.isArray(sRes.data) ? sRes.data : (sRes.data?.items || []));
			setChargers(Array.isArray(chRes.data) ? chRes.data : (chRes.data?.items || []));
		} catch (e: any) {
			setError(e?.response?.data?.message || e?.message || "Không tải được danh sách đầu sạc");
		} finally {
			setLoading(false);
		}
	}, []);

	React.useEffect(() => { load(); }, [load]);

const openCreate = () => { navigate("/admin/infrastructure/connectors/create"); };
const openEdit = (c: Connector) => { navigate(`/admin/infrastructure/connectors/edit/${c._id}`); };

// creation/edit moved to dedicated pages

	const remove = async (id: string) => {
		if (!confirm("Xoá đầu sạc này?")) return;
		try { await api.delete(`/connectors/${id}`); await load(); } catch (e: any) { alert(e?.response?.data?.message || e?.message || "Lỗi xoá đầu sạc"); }
	};

	const toggleStatus = async (c: Connector) => {
		const next = c.status === "IDLE" ? "OFFLINE" : "IDLE";
		try { await api.patch(`/connectors/${c._id}/status`, { status: next }); await load(); } catch (e: any) { alert(e?.response?.data?.message || e?.message || "Lỗi đổi trạng thái"); }
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
				<div className="flex items-center gap-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
						<input
							type="text"
							placeholder="Tìm kiếm đầu sạc..."
							value={search}
							className="border border-[#333333] rounded-lg pl-10 pr-7 py-1 w-72 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333]"
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</div>
				<button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"><Plus size={18} /> Thêm đầu sạc</button>
			</div>
			<div className="bg-white rounded-xl border">
				<table className="min-w-full text-sm">
					<thead>
						<tr className="text-gray-500 border-b">
							<th className="px-4 py-3 text-left font-semibold">Trạm</th>
							<th className="px-4 py-3 text-left font-semibold">Trụ</th>
							<th className="px-4 py-3 text-left font-semibold">Mã</th>
							<th className="px-4 py-3 text-left font-semibold">Loại</th>
							<th className="px-4 py-3 text-left font-semibold">Công suất (kW)</th>
							<th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
							<th className="px-4 py-3 text-right font-semibold">Thao tác</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr><td className="px-4 py-6 text-gray-500" colSpan={7}>Đang tải...</td></tr>
						) : filtered.length === 0 ? (
							<tr><td className="px-4 py-6 text-gray-500" colSpan={7}>Chưa có đầu sạc</td></tr>
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
									<td className="px-4 py-3">{c.status}</td>
									<td className="px-4 py-3 text-right">
										<button onClick={() => toggleStatus(c)} className="text-gray-500 hover:text-blue-600 mr-3">{c.status === "IDLE" ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}</button>
										<button onClick={() => openEdit(c)} className="text-gray-500 hover:text-blue-600 mr-3"><Pencil size={16} /></button>
										<button onClick={() => remove(c._id)} className="text-gray-500 hover:text-red-600"><Trash2 size={16} /></button>
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
