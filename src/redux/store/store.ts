import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slice/Auth/AuthSlice";
import tariffReducer from "../slice/Tariff/TariffSlice";
import PaymentReducer from "../slice/Payment/PaymentSlice";
import vehicalReducer from "../slice/Vehical/VehicalSlice";
import MembershipPlan  from "../slice/Membership/MembershipSlice";
import stationReducer from "../slice/Station/StationSlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    tariff: tariffReducer,
    payment: PaymentReducer,
    vehical: vehicalReducer,
    membership: MembershipPlan,
    station: stationReducer,
  },
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware(), // thunk mặc định
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
