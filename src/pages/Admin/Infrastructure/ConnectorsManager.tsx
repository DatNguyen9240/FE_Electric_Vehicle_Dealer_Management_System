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
	const isFirstMount = React.useRef(true);


	React.useEffect(() => { setTitle("Quản lí đầu sạc"); }, [setTitle]);

	const asRecord = (v: unknown): Record<string, unknown> | null =>
		v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;

	const getErrorMessage = (e: unknown) => {
		try {
			const ae = e as { response?: { data?: { message?: string } }; message?: string };
			return ae?.response?.data?.message || ae?.message || "Không tải được danh sách đầu sạc";
		} catch {
			return "Không tải được danh sách đầu sạc";
		}
	};

	const load = React.useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const [coRes, sRes, chRes] = await Promise.all([
				api.get("/connectors", { params: { limit: 1000 } }),
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
	}, []);

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
		if (!confirm("Xoá đầu sạc này?")) return;
		try {
			await api.delete(`/connectors/${id}`);
			toast.success("Xóa đầu sạc thành công!");
			await load();
		} catch (e: any) {
			const errorMsg = e?.response?.data?.message || e?.message || "Lỗi xoá đầu sạc";
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
										
										<button onClick={() => openEdit(c)} className="text-gray-500 hover:text-blue-600 mr-3" title="Chỉnh sửa"><Pencil size={16} /></button>
										<button onClick={() => remove(c._id)} className="text-gray-500 hover:text-red-600" title="Xóa"><Trash2 size={16} /></button>
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
