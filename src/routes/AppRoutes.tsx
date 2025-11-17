import { Suspense, lazy } from "react";
const FakeStationPage = lazy(() => import("@pages/FakeStationPage"));
import { Routes, Route } from "react-router-dom";
import LazyLoading from "@components/Ui/LazyLoading";

// Lazy load layouts
const MainLayout = lazy(() => import("@layouts/MainLayout"));
const AdminLayout = lazy(() => import("@layouts/AdminLayout"));

// Lazy load main pages
const Home = lazy(() => import("@pages/Home"));
const ContactUs = lazy(() => import("@pages/ContactUs"));
const FAQ = lazy(() => import("@pages/FAQ"));
const News = lazy(() => import("@pages/News"));
const Login = lazy(() => import("@pages/Login"));
const Signup = lazy(() => import("@pages/Signup"));
const Pricing = lazy(() => import("@pages/Pricing"));
const AboutUs = lazy(() => import("@pages/AboutUs"));
const Booking = lazy(() => import("@pages/Booking"));
const Wallet = lazy(() => import("@pages/Wallet"));
const NewVehicle = lazy(() => import("@pages/Vehicles/NewVehicle"));
const Topup = lazy(() => import("@pages/Topup"));
const TopupCancel = lazy(() => import("@pages/TopupCancel"));
const TopupSuccess = lazy(() => import("@pages/TopupSuccess"));
const BookingSlots = lazy(() => import("@pages/BookingSlots"));
const ChargingHistory = lazy(() => import("@pages/ChargingHistory"));
const UserProfile = lazy(() => import("@pages/UserProfile"));
const UserChargerList = lazy(() => import("@pages/ChargerList"));
const UserBookingDetails = lazy(() => import("@pages/UserBookingDetails"));
const PurchaseMembership = lazy(
  () => import("@pages/PurchaseMembership")
);
const AdminDashboard = lazy(() => import("@pages/Admin/AdminDashboard"));
const UserManager = lazy(() => import("@pages/Admin/Users/UserManager"));
const EditUser = lazy(() => import("@pages/Admin/Users/EditUser"));
const UserDetail = lazy(() => import("@pages/Admin/Users/UserDetail"));
const AdminTariffs = lazy(() => import("@pages/Admin/Tariffs/Tariffs"));
const StaffLayout = lazy(() => import("@layouts/StaffLayout"));
const StaffStationDashboard = lazy(() => import("@pages/Staff/StationDashboard"));
const StaffBookings = lazy(() => import("@pages/Staff/Bookings"));
const StaffChargingSessions = lazy(() => import("@pages/Staff/ChargingSessions"));
const StaffIncidents = lazy(() => import("@pages/Staff/Incidents"));
const StaffInvoices = lazy(() => import("@pages/Staff/Invoices"));
const StaffFeedbacks = lazy(() => import("@pages/Staff/Feedbacks"));
const StationsManager = lazy(() => import("@pages/Admin/Infrastructure/StationsManager"));
const ChargersManager = lazy(() => import("@pages/Admin/Infrastructure/ChargersManager"));
const ConnectorsManager = lazy(() => import("@pages/Admin/Infrastructure/ConnectorsManager"));
const StationsCreateEdit = lazy(() => import("@pages/Admin/Infrastructure/StationsCreateEdit"));
const ChargersCreate = lazy(() => import("@pages/Admin/Infrastructure/ChargersCreate"));
const ConnectorsCreate = lazy(() => import("@pages/Admin/Infrastructure/ConnectorsCreate"));
const EditTariff = lazy(() => import("@pages/Admin/Tariffs/EditTariff"));
const CreateTariff = lazy(() => import("@pages/Admin/Tariffs/CreateTariff"));
const AIForecast = lazy(() => import("@pages/Admin/AIForecast"));



const PaymentManager = lazy(
  () => import("@pages/Admin/Payments/PaymentManager")
);
const BookingManagement = lazy(
  () => import("@pages/Admin/Bookings/BookingManagement")
);
const BookingManagementDetail = lazy(
  () => import("@pages/Admin/Bookings/BookingManagementDetail")
);

const SessionManagement = lazy(
  () => import("@pages/Admin/Sessions/SessionManagement")
);
const SessionManagementDetail = lazy(
  () => import("@pages/Admin/Sessions/SessionManagementDetail")
);
const InvoiceManagement = lazy(
  () => import("@pages/Admin/Invoices/InvoiceManagement")
);
const InvoiceManagementDetail = lazy(
  () => import("@pages/Admin/Invoices/InvoiceManagementDetail")
);
const MembershipPlansManagement = lazy(
  () => import("@pages/Admin/MembershipPlans/MembershipPlansManagement")
);
const MembershipPlanDetail = lazy(
  () => import("@pages/Admin/MembershipPlans/MembershipPlanDetail")
);
const MembershipPlanForm = lazy(
  () => import("@pages/Admin/MembershipPlans/MembershipPlanForm")
);
const InvoiceUpdate = lazy(
  () => import("@pages/Admin/Invoices/InvoiceUpdate")
);
const IncidentManager = lazy(
  () => import("@pages/Admin/Incidents/IncidentManager")
);
const IncidentDetail = lazy(
  () => import("@pages/Admin/Incidents/IncidentDetail")
);
const IncidentEdit = lazy(
  () => import("@pages/Admin/Incidents/IncidentEdit")
);
const FeedbackManager = lazy(
  () => import("@pages/Admin/Feedbacks/FeedbackManager")
);
const FeedbackDetail = lazy(
  () => import("@pages/Admin/Feedbacks/FeedbackDetail")
);

const createLazyRoute = (
  Component: React.LazyExoticComponent<React.ComponentType<object>>,
  message: string
) => (
  <Suspense fallback={<LazyLoading message={message} />}>
    <Component />
  </Suspense>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<LazyLoading message="Starting application..." />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={createLazyRoute(Home, "Loading home page...")}
          />
          <Route
            path="/contact"
            element={createLazyRoute(ContactUs, "Loading contact page...")}
          />
          <Route path="/faq" element={createLazyRoute(FAQ, "Loading FAQ...")} />
          <Route
            path="/news"
            element={createLazyRoute(News, "Loading news...")}
          />
          <Route
            path="/pricing"
            element={createLazyRoute(Pricing, "Loading pricing...")}
          />
          <Route
            path="/membership/purchase/:code"
            element={createLazyRoute(PurchaseMembership, "Loading purchase membership...")}
          />
          <Route
            path="/about"
            element={createLazyRoute(AboutUs, "Loading about us...")}
          />
          <Route
            path="/booking"
            element={createLazyRoute(Booking, "Loading booking system...")}
          />
          <Route
            path="/wallet"
            element={createLazyRoute(Wallet, "Loading wallet...")}
          />
          <Route
            path="/topup"
            element={createLazyRoute(Topup, "Loading top-up page...")}
          />
          <Route
            path="/topup/cancel"
            element={createLazyRoute(TopupCancel, "Loading cancel page...")}
          />
          <Route
            path="/topup/success"
            element={createLazyRoute(TopupSuccess, "Loading success page...")}
          />
          <Route
            path="/booking/station/:stationId"
            element={createLazyRoute(UserChargerList, "Loading chargers...")}
          />
          <Route
            path="/booking/station/:stationId/charger/:chargerId"
            element={createLazyRoute(BookingSlots, "Loading slot selection...")}
          />
          <Route
            path="/booking/station/:stationId/charger/:chargerId/book/:timeSlot"
            element={createLazyRoute(UserBookingDetails, "Loading booking details...")}
          />
          <Route
            path="/charging-history"
            element={createLazyRoute(ChargingHistory, "Loading charging history...")}
          />
          <Route
            path="/profile"
            element={createLazyRoute(UserProfile, "Loading user profile...")}
          />
          <Route
            path="/vehicles/new"
            element={createLazyRoute(NewVehicle, "Loading vehicle registration...")}
          />
          <Route
            path="/fake-station"
            element={createLazyRoute(FakeStationPage, "Loading fake station...")}
          />
          <Route
            path="/fake-station/:stationId"
            element={createLazyRoute(FakeStationPage, "Loading fake station...")}
          />
          {/* Đã bỏ route /fake-station/:stationId/charger/:chargerId */}
        </Route>
        <Route
          path="/login"
          element={createLazyRoute(Login, "Loading login page...")}
        />
        <Route
          path="/signup"
          element={createLazyRoute(Signup, "Loading signup page...")}
        />

        <Route element={<StaffLayout />}>
          <Route
            path="/staff"
            element={createLazyRoute(StaffStationDashboard, "Loading station dashboard...")}
          />
          <Route
            path="/staff/bookings"
            element={createLazyRoute(StaffBookings, "Loading bookings...")}
          />
          <Route
            path="/staff/feedbacks"
            element={createLazyRoute(StaffFeedbacks, "Loading feedbacks...")}
          />
          <Route
            path="/staff/sessions"
            element={createLazyRoute(StaffChargingSessions, "Loading charging sessions...")}
          />
          <Route
            path="/staff/incidents"
            element={createLazyRoute(StaffIncidents, "Loading incidents...")}
          />
          <Route
            path="/staff/invoices"
            element={createLazyRoute(StaffInvoices, "Loading invoices...")}
          />
        </Route>

        <Route element={<AdminLayout />}>
          <Route
            path="/admin"
            element={createLazyRoute(
              AdminDashboard,
              "Loading admin dashboard..."
            )}
          />
        
          <Route
            path="/admin/users"
            element={createLazyRoute(UserManager, "Loading user management...")}
          />
          <Route
            path="/admin/users/edit/:userId"
            element={createLazyRoute(EditUser, "Loading edit user...")}
          />
          <Route
            path="/admin/users/view/:userId"
            element={createLazyRoute(UserDetail, "Loading user details...")}
          />
          {/* Legacy tariffs route - optional keep */}
          <Route path="/admin/tariffs" element={createLazyRoute(AdminTariffs, "Loading tariff management...")} />
          {/* Infrastructure group - Hierarchical routes (must be before flat routes) */}
          <Route path="/admin/infrastructure/stations/:stationId/chargers/:chargerId/connectors/create" element={createLazyRoute(ConnectorsCreate, "Loading create connector...")} />
          <Route path="/admin/infrastructure/stations/:stationId/chargers/:chargerId/connectors" element={createLazyRoute(ConnectorsManager, "Loading connectors management...")} />
          <Route path="/admin/infrastructure/stations/:stationId/chargers/create" element={createLazyRoute(ChargersCreate, "Loading create charger...")} />
          <Route path="/admin/infrastructure/stations/:stationId/chargers" element={createLazyRoute(ChargersManager, "Loading chargers management...")} />
          {/* Infrastructure group - Flat routes (legacy support) */}
          <Route path="/admin/infrastructure/stations" element={createLazyRoute(StationsManager, "Loading stations management...")} />
          <Route path="/admin/infrastructure/stations/create" element={createLazyRoute(StationsCreateEdit, "Loading create station...")} />
          <Route path="/admin/infrastructure/stations/edit/:stationId" element={createLazyRoute(StationsCreateEdit, "Loading edit station...")} />
          <Route path="/admin/infrastructure/tariffs" element={createLazyRoute(AdminTariffs, "Loading tariff management...")} />
          <Route
            path="/admin/tariffs/create"
            element={createLazyRoute(CreateTariff, "Loading create tariff...")}
          />
          <Route
            path="/admin/ai-forecast"
            element={createLazyRoute(AIForecast, "Loading AI forecast...")}
          />
          <Route
            path="/admin/tariffs/edit/:tariffId"
            element={createLazyRoute(EditTariff, "Loading edit tariff...")}
          />
          <Route
            path="/admin/payments"
            element={createLazyRoute(
              PaymentManager,
              "Loading payment management..."
            )}
          />
          <Route
            path="/admin/bookings"
            element={createLazyRoute(
              BookingManagement,
              "Loading booking management..."
            )}
          />
          <Route
            path="/admin/bookings/view/:bookingId"
            element={createLazyRoute(
              BookingManagementDetail,
              "Loading booking detail..."
            )}
          />
          <Route
            path="/admin/sessions"
            element={createLazyRoute(
              SessionManagement,
              "Loading session management..."
            )}
          />
          <Route
            path="/admin/sessions/view/:sessionId"
            element={createLazyRoute(
              SessionManagementDetail,
              "Loading session detail..."
            )}
          />
          <Route
            path="/admin/invoices"
            element={createLazyRoute(
              InvoiceManagement,
              "Loading invoice management..."
            )}
          />
          <Route
            path="/admin/invoices/view/:invoiceId"
            element={createLazyRoute(
              InvoiceManagementDetail,
              "Loading invoice detail..."
            )}
          />
          <Route
            path="/admin/invoices/update"
            element={createLazyRoute(
              InvoiceUpdate,
              "Loading invoice update..."
            )}
          />
          <Route
            path="/admin/invoices/update/:invoiceId"
            element={createLazyRoute(
              InvoiceUpdate,
              "Loading invoice update..."
            )}
          />
          <Route
            path="/admin/incidents"
            element={createLazyRoute(
              IncidentManager,
              "Loading incident management..."
            )}
          />
          <Route
            path="/admin/incidents/view/:incidentId"
            element={createLazyRoute(
              IncidentDetail,
              "Loading incident detail..."
            )}
          />
          <Route
            path="/admin/incidents/edit/:incidentId"
            element={createLazyRoute(
              IncidentEdit,
              "Loading incident edit..."
            )}
          />
          <Route
            path="/admin/feedbacks"
            element={createLazyRoute(
              FeedbackManager,
              "Loading feedback management..."
            )}
          />
          <Route
            path="/admin/feedbacks/view/:feedbackId"
            element={createLazyRoute(
              FeedbackDetail,
              "Loading feedback detail..."
            )}
          />
          <Route
            path="/admin/membership-plans"
            element={createLazyRoute(
              MembershipPlansManagement,
              "Loading membership plans management..."
            )}
          />
          <Route
            path="/admin/membership-plans/view/:planId"
            element={createLazyRoute(
              MembershipPlanDetail,
              "Loading membership plan detail..."
            )}
          />
          <Route
            path="/admin/membership-plans/create"
            element={createLazyRoute(
              MembershipPlanForm,
              "Loading create membership plan..."
            )}
          />
          <Route
            path="/admin/membership-plans/edit/:planId"
            element={createLazyRoute(
              MembershipPlanForm,
              "Loading edit membership plan..."
            )}
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
