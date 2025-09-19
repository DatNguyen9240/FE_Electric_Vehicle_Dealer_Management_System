import { TitleProvider } from "./contexts";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <TitleProvider>
      <AppRoutes />
    </TitleProvider>
  );
}

export default App;
