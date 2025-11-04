import React from "react";
import api from "@libs/axios";
import { useTitle } from "@contexts";
import { Plus, Trash2, Pencil, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
	const [rows, setRows] = React.useState<Charger[]>([]);
	const [stations, setStations] = React.useState<Station[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [search, setSearch] = React.useState("");


	React.useEffect(() => { setTitle("Quản lí trụ"); }, [setTitle]);

	const asRecord = (v: unknown): Record<string, unknown> | null =>
		v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;

	const getErrorMessage = (e: unknown) => {
		try {
			const ae = e as { response?: { data?: { message?: string } }; message?: string };
			return ae?.response?.data?.message || ae?.message || "Không tải được danh sách trụ";
		} catch {
			return "Không tải được danh sách trụ";
		}
	};

	const load = React.useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const [cRes, sRes] = await Promise.all([api.get("/chargers", { params: { limit: 1000 } }), api.get("/stations", { params: { limit: 1000 } })]);
			const cData: unknown = cRes.data;
			const sData: unknown = sRes.data;
			const list = (Array.isArray(cData)
				? (cData as Charger[])
				: (asRecord(cData)?.items ?? asRecord(cData)?.data ?? [])) as Charger[];
			const sts = (Array.isArray(sData)
				? (sData as Station[])
				: (asRecord(sData)?.items ?? asRecord(sData)?.data ?? [])) as Station[];
			setRows(list);
			setStations(sts);
		} catch (err: unknown) {
			setError(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	}, []);

	React.useEffect(() => { load(); }, [load]);

	const openCreate = () => { navigate("/admin/infrastructure/chargers/create"); };
	const openEdit = (c: Charger) => { navigate(`/admin/infrastructure/chargers/edit/${c._id}`); };

	// creation/edit moved to dedicated pages

	const remove = async (id: string) => {
		if (!confirm("Xoá trụ này?")) return;
		try {
			await api.delete(`/chargers/${id}`);
			await load();
		} catch (err: unknown) {
			const msg = getErrorMessage(err);
			console.error("Failed to delete charger", err);
			setError(msg);
		}
	};

	const filtered = rows.filter((c) => {
		const q = search.trim().toLowerCase();
		if (!q) return true;
		const stationName = stations.find((s) => s._id === c.stationId)?.name || "";
		return (
			c.name.toLowerCase().includes(q) ||
			c.code.toLowerCase().includes(q) ||
			stationName.toLowerCase().includes(q) ||
			c.connectorType.toLowerCase().includes(q)
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
							placeholder="Tìm kiếm trụ..."
							value={search}
							className="border border-[#333333] rounded-lg pl-10 pr-7 py-1 w-72 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333]"
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</div>
				<button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"><Plus size={18} /> Tạo trụ mới</button>
			</div>
			<div className="bg-white rounded-xl border">
				<table className="min-w-full text-sm">
					<thead>
						<tr className="text-gray-500 border-b">
							<th className="px-4 py-3 text-left font-semibold">Trạm</th>
							<th className="px-4 py-3 text-left font-semibold">Tên</th>
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
							<tr><td className="px-4 py-6 text-gray-500" colSpan={7}>Chưa có trụ</td></tr>
						) : filtered.map((c) => {
							const stationName = stations.find((s) => s._id === c.stationId)?.name || "—";
							return (
								<tr key={c._id} className="border-b last:border-b-0">
									<td className="px-4 py-3">{stationName}</td>
									<td className="px-4 py-3">{c.name}</td>
									<td className="px-4 py-3">{c.code}</td>
									<td className="px-4 py-3">{c.connectorType}</td>
									<td className="px-4 py-3">{c.powerKw}</td>
									<td className="px-4 py-3">{c.status}</td>
									<td className="px-4 py-3 text-right">
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

export default ChargersManager;
