import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectVehicles, selectSelectedVehicleId, setSelectedVehicle } from "@redux/slice/Vehical/VehicalSlice";
import { selectVehicalLoading } from "@redux/slice/Vehical/VehicalSelector";
import type { AppDispatch } from "@redux/store/store";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@components/Ui/Select";
import { Button } from "@components/Ui/Button";
import {
  User,
  Mail,
  Phone,
  Camera,
  Edit2,
  ArrowRight,
  Edit3,
} from "lucide-react";
import VehicleEditModal from "@components/Vehicle/VehicleEditModal";
import { useNavigate } from "react-router-dom";
import type {Vehicle} from "@redux/slice/Vehical/VehicalSlice";
import { deleteVehicleThunk } from "@redux/slice/Vehical/VehicalThunk";
import api from "../libs/axios";

// chart.js (react-chartjs-2). If these packages are not installed run:
// npm install chart.js react-chartjs-2
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface UserInfo {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  carModel?: string;
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "Đạt Nguyễn",
    email: "dat.nguyen@example.com",
    phone: "0123456789",
    role: "Customer",
    avatar: "/avatar/01.png",
  });

  const [editedInfo, setEditedInfo] = useState<UserInfo>(userInfo);
  const [previewAvatar, setPreviewAvatar] = useState<string>(userInfo.avatar);
  const dispatch = useDispatch<AppDispatch>();
  const vehicles = useSelector(selectVehicles);
  const selectedVehicle = useSelector(selectSelectedVehicleId);
  const vehicalLoading = useSelector(selectVehicalLoading);
  const [editingVehicle, setEditingVehicle] = React.useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);

  // analytics state
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [monthlyCosts, setMonthlyCosts] = useState<any | null>(null);
  const [habits, setHabits] = useState<any | null>(null);

  const monthNames = [
    'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
  ];

  const formatCurrency = (value: number | null | undefined, currency?: string) => {
    if (value == null) return '0';
    if (currency) {
      try {
        return new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency,
          maximumFractionDigits: 0,
        }).format(value);
      } catch (e) {
        // fallback
      }
    }
    return Number(value).toLocaleString();
  };

  const chartData = useMemo(() => {
    const labels = (monthlyCosts?.months || []).map((m: any) => monthNames[(m.month || 1) - 1]);
    const data = (monthlyCosts?.months || []).map((m: any) => m.amount || 0);
    return {
      labels,
      datasets: [
        {
          label: 'Spending',
          data,
          backgroundColor: 'rgba(247, 183, 0, 0.9)',
        },
      ],
    };
  }, [monthlyCosts]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Monthly Spending' },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  }), [monthlyCosts]);

  // hourly chart for habits.when.byHour
  const hoursChartData = useMemo(() => {
    const hours = habits?.when?.byHour ?? [];
    const labels = Array.from({ length: 24 }, (_, i) => String(i));
    const data = labels.map((_, i) => hours[i] || 0);
    return {
      labels,
      datasets: [
        {
          label: 'Sessions by hour',
          data,
          backgroundColor: 'rgba(36,101,234,0.9)',
        },
      ],
    };
  }, [habits]);

  const hoursChartOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Sessions by Hour' },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { title: { display: true, text: 'Hour' } },
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  }), [habits]);

  // keep editedInfo.carModel in sync with selectedVehicle
  React.useEffect(() => {
    if (!selectedVehicle) return;
    const v = vehicles.find((x) => x.id === selectedVehicle);
    if (v) setEditedInfo((prev) => ({ ...prev, carModel: v.model }));
  }, [selectedVehicle, vehicles]);

  // fetch analytics (monthly costs + charging habits)
  useEffect(() => {
    let mounted = true;
    setLoadingAnalytics(true);
    setAnalyticsError(null);

    Promise.all([
      api.get('/analytics/me/monthly-costs'),
      api.get('/analytics/me/habits'),
    ])
      .then(([mcRes, habitsRes]) => {
        if (!mounted) return;
        setMonthlyCosts(mcRes.data || null);
        setHabits(habitsRes.data || null);
      })
      .catch((err) => {
        if (!mounted) return;
        setAnalyticsError(err?.message || 'Failed to load analytics');
      })
      .finally(() => {
        if (!mounted) return;
        setLoadingAnalytics(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // TODO: Call API to update user info
    setUserInfo({ ...editedInfo, avatar: previewAvatar });
    setIsEditing(false);
    // Show success message
    alert("Profile updated successfully!");
  };

  const handleCancel = () => {
    setEditedInfo(userInfo);
    setPreviewAvatar(userInfo.avatar);
    setIsEditing(false);
  };

  // analytics presence flags
  const hasSpending = Boolean(monthlyCosts?.grandTotal && monthlyCosts.grandTotal > 0);
  const hasSessions = Boolean(habits?.counts?.totalSessions && habits.counts.totalSessions > 0);
  const hasTopStation = Boolean(habits?.where?.topStations && habits.where.topStations.length > 0);
  const hasHourly = Array.isArray(habits?.when?.byHour) && habits.when.byHour.some((v: any) => v > 0);
  const hasPowerBuckets = Boolean(habits?.power?.buckets && Object.values(habits.power.buckets).some((v: any) => v > 0));
  const visibleInfoCards = [] as { id: string; label: string; value: React.ReactNode; bg?: string }[];
  if (hasSessions) visibleInfoCards.push({ id: 'sessions', label: 'Total Charging Sessions', value: (habits?.counts?.totalSessions ?? 0).toLocaleString(), bg: 'bg-[#E5F4FF]' });
  if (hasEnergy() || hasTopStation) {
    // energy: prefer topStation.energyKwh if provided
    const energyVal = habits?.where?.topStations?.[0]?.energyKwh ?? null;
    if (energyVal) visibleInfoCards.push({ id: 'energy', label: 'Energy Used', value: `${energyVal} kWh`, bg: 'bg-gradient-to-br from-green-50 to-green-100' });
  }
  if (hasSpending) visibleInfoCards.push({ id: 'spending', label: 'Total Spending', value: formatCurrency(monthlyCosts?.grandTotal ?? 0, monthlyCosts?.currency), bg: 'bg-[#F7F7BF]' });

  // helper function to check energy availability
  function hasEnergy() {
    if (habits?.where?.topStations?.length) {
      const v = habits.where.topStations[0].energyKwh;
      return typeof v === 'number' && v > 0;
    }
    return false;
  }

  return (
    <>
      <div className=" px-20 py-10">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 bg-[#E5F4FF]"></div>

        {/* Profile Content */}
        <div className="relative px-10 pb-6">
          {/* Avatar Section */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
            <div className="relative group">
              <img
                src={previewAvatar}
                alt="Avatar"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
              {isEditing && (
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="text-white" size={32} />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Edit/Save Buttons */}
            <div className="mt-4 md:mt-0 flex gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-1.5 bg-[#2465EA] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                  <Edit2 size={18} />
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-6 py-1 bg-[#EEEEEE] text-semibold  rounded-lg hover:bg-[#D9D5D5] transition-colors shadow-md"
                  >
                   
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center  px-7.5 py-1 bg-blue-500 text-white rounded-lg hover:bg-[#2563EB] transition-colors shadow-md"
                  >
                    
                    Save
                  </button>
                </>
              )}
            </div>
          </div>

          {/* User Info Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User size={18} className="text-blue-500" />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editedInfo.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter full name"
                />
              ) : (
                <p className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-800 font-medium">
                  {userInfo.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Mail size={18} className="text-blue-500" />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editedInfo.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter email"
                />
              ) : (
                <p className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-800 font-medium">
                  {userInfo.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Phone size={18} className="text-blue-500" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={editedInfo.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-800 font-medium">
                  {userInfo.phone}
                </p>
              )}
            </div>

            {/* Car Model */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User size={18} className="text-blue-500" />
                Car Model
              </label>
              {vehicalLoading ? (
                // loading skeleton to avoid flicker while vehicles fetch
                <div className="w-full md:w-[420px] animate-pulse">
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              ) : vehicles.length === 0 ? (
                <Button variant="default" onClick={() => navigate("/vehicles/new")}>
                  Đăng ký xe
                </Button>
              ) : !isEditing ? (
                // non-interactive label-like trigger when not editing
                <div className="text-gray-700 inline-flex items-center gap-2 px-3 py-2 rounded bg-gray-50 w-full md:w-[420px]">
                  <span className="truncate">{editedInfo.carModel}</span>
                </div>
              ) : (
                <Select
                  value={selectedVehicle ?? ""}
                  onValueChange={(value) => {
                    if (value === "__register__") {
                      navigate("/vehicles/new");
                      return;
                    }
                    const v = vehicles.find((x) => x.id === value);
                    if (v) setEditedInfo((prev) => ({ ...prev, carModel: v.model }));
                    dispatch(setSelectedVehicle(value || null));
                  }}
                >
                  <SelectTrigger className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 focus:outline-none focus:ring-0 inline-flex items-center justify-between gap-2 w-full md:w-[420px]">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent className="md:w-[420px]">
                    {vehicles.map((v: Vehicle) => {
                      const key = v.id;
                      return (
                        <SelectItem key={key} value={key} className="group">
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate">{v.model}</span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setEditingVehicle(key);
                                  setEditModalOpen(true);
                                }}
                                aria-label={`Edit ${v.model}`}
                                className="ml-2 opacity-0 group-hover:opacity-100"
                              >
                                <Edit3 className="w-4 h-4 text-blue-600" />
                              </button>
                              <button
                                type="button"
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  if (window.confirm("Are you sure you want to delete this vehicle?")) {
                                    dispatch(deleteVehicleThunk(key));
                                  }
                                }}
                                aria-label={`Delete ${v.model}`}
                                className="ml-2 opacity-0 group-hover:opacity-100"
                              >
                                <svg width="16" height="16" fill="none" stroke="red" strokeWidth="2" viewBox="0 0 24 24">
                                  <path d="M3 6h18M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6m-6 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                    {vehicles.length > 0 && (
                      <SelectItem value="__register__">Register another</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

           {/* Additional Info Section */}
           <div className="mt-8 pt-6 border-t border-gray-200">
             <h3 className="text-lg font-semibold text-gray-800 mb-4">
               Additional Information
             </h3>
             {/* Dynamic info cards: only render cards that have data */}
             <div className="mt-2">
               {loadingAnalytics ? (
                 <div className="grid md:grid-cols-3 gap-4">
                   <div className="p-4 bg-[#E5F4FF] rounded-lg animate-pulse h-20" />
                   <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg animate-pulse h-20" />
                   <div className="p-4 bg-[#F7F7BF] rounded-lg animate-pulse h-20" />
                 </div>
               ) : analyticsError ? (
                 <p className="text-sm text-red-500">Could not load analytics</p>
                ) : visibleInfoCards.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                   {visibleInfoCards.map((c) => (
                     <div key={c.id} className={`${c.bg} p-3 rounded-lg min-h-[72px] flex flex-col justify-center shadow-sm`}>
                       <p className="text-sm text-gray-600 mb-1">{c.label}</p>
                       <p className={`text-2xl font-bold ${c.id === 'spending' ? 'text-[#B47700]' : c.id === 'sessions' ? 'text-blue-600' : 'text-green-600'}`}>{c.value}</p>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-sm text-gray-500">No analytics available</p>
               )}
             </div>

             {/* Monthly breakdown (compact) */}
             <div className="mt-4">
               {loadingAnalytics ? (
                 <div className="animate-pulse space-y-2">
                   <div className="h-3 bg-gray-200 rounded w-1/3" />
                   <div className="h-3 bg-gray-200 rounded w-1/2" />
                 </div>
               ) : analyticsError ? (
                 <p className="text-sm text-red-500">Could not load monthly breakdown</p>
               ) : monthlyCosts?.months ? (
                 <div className="grid grid-cols-3 gap-2 mt-3">
                   {monthlyCosts.months.map((m: any) => (
                     <div key={m.month} className="px-3 py-1.5 bg-gray-50 rounded min-h-[40px] flex items-center justify-between">
                       <div className="text-sm text-gray-600">{monthNames[(m.month || 1) - 1]}</div>
                       <div className="text-sm font-medium text-gray-800">{m.amount ? formatCurrency(m.amount, monthlyCosts.currency) : '-'}</div>
                     </div>
                   ))}
                 </div>
               ) : null}
             </div>

            {/* Chart (monthly spending) */}
            {!loadingAnalytics && !analyticsError && monthlyCosts?.months && (
              <div className="mt-6 p-4 bg-white rounded-lg shadow">
                <div className="text-sm text-gray-600 mb-3">Monthly Spending</div>
                <div className="h-72">
                  <Bar data={chartData as any} options={{ ...chartOptions, maintainAspectRatio: false } as any} />
                </div>
              </div>
            )}

            {/* Habits: top station, hourly chart, power buckets */}
            {!loadingAnalytics && !analyticsError && (hasTopStation || hasHourly || hasPowerBuckets) && (
              // use 4 columns so hourly chart can take 3/4 width when Top Station exists (a bit wider)
              <div className="mt-6 grid md:grid-cols-4 gap-4">
                {hasTopStation && (
                  // smaller, denser Top Station card: less padding, smaller text, constrained width
                  <div className="p-2 bg-white rounded-lg shadow min-h-0 self-start w-full md:w-auto md:max-w-[280px] flex flex-col items-center text-center gap-1 justify-start">
                    <p className="text-xs text-gray-600 mb-0">Top Station (last period)</p>
                    {habits?.where?.topStations?.length > 0 ? (
                      (() => {
                        const s = habits.where.topStations[0];
                        return (
                          <div className="flex flex-col gap-0 items-center">
                            <div className="text-sm font-medium truncate">{s.name}</div>
                            <div className="text-xs text-gray-600">Sessions: {s.sessions} · {s.energyKwh} kWh</div>
                            <div className="text-sm font-semibold text-[#B47700]">Amount: {formatCurrency(s.amount, monthlyCosts?.currency)}</div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-xs text-gray-500">No stations</div>
                    )}
                  </div>
                )}

                <div className={`${hasTopStation ? 'md:col-span-3' : 'md:col-span-4'} p-4 bg-white rounded-lg shadow`}>
                  {hasHourly && (
                    <div>
                      <div className="mb-3 text-sm text-gray-600">Hourly Charging Distribution</div>
                      <div className="h-64">
                        <Bar data={hoursChartData as any} options={{ ...hoursChartOptions, maintainAspectRatio: false } as any} />
                      </div>
                    </div>
                  )}

                  {hasPowerBuckets && (
                    <div className="mt-4">
                      <div className="text-sm text-gray-600 mb-2">Power buckets</div>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(habits.power.buckets).map(([k, v]: any) => (
                          <div key={k} className="px-3 py-1 rounded bg-gray-100 text-sm">
                            {k}: <span className="font-medium">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
             <div className="flex justify-end mt-4 me-15">
               <button
                 onClick={() => navigate("/charging-history")}
                 className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-800 font-medium group"
               >
                 View Details
                 <ArrowRight
                   size={16}
                   className="group-hover:translate-x-1 transition-transform"
                 />
               </button>
             </div>
           </div>
        </div>
      </div>
    </div>
      {/* Vehicle edit modal */}
      <VehicleEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        vehicle={vehicles.find((x) => x.id === editingVehicle) ?? null}
      />
    </>
  );
};

export default UserProfile;

