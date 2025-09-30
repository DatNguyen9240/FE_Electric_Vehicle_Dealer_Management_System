import { TitleProvider } from "./contexts";
import store from "./redux/store/store";
import AppRoutes from "./routes/AppRoutes";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Provider store={store}>
      <ToastContainer position="top-center" autoClose={2000} />
      <TitleProvider>
        <AppRoutes />
      </TitleProvider>
    </Provider>
  );
}

export default App;
