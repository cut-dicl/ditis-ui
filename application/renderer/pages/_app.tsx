import type { AppProps } from "next/app";
import "../styles/index.css";
import Sidebar from "../UI/sidebar";
import { ThemeProvider } from "next-themes";
import "primereact/resources/primereact.min.css";
import { AppControllerProvider } from "../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";

const App = ({ Component, pageProps }: AppProps) => (
  <ThemeProvider attribute="class">
    <AppControllerProvider>
    <div className="flex flex-row nowrap max-h-screen overflow-hidden">
      <Sidebar />
      <div className="w-full overflow-auto">
        <Component {...pageProps} />
      </div>
    </div>
    </AppControllerProvider>
  </ThemeProvider>
);
export default App;
