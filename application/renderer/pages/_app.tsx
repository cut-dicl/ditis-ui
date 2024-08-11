import type { AppProps } from "next/app";
import "../styles/globals.css";
import Sidebar from "../UI/sidebar";
import { ThemeProvider } from "next-themes";
import { AppControllerProvider } from "../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import { PrimeReactProvider } from "primereact/api";


const App = ({ Component, pageProps }: AppProps) => {

  

  return (
    <PrimeReactProvider value={{ unstyled: false }}>
      <ThemeProvider attribute="class">
        <AppControllerProvider >
          <div className="flex flex-row nowrap max-h-screen overflow-hidden grow">
            <Sidebar />
            <div className="w-full overflow-auto">
              <Component {...pageProps} />
            </div>
          </div>
        </AppControllerProvider>
      </ThemeProvider>
    </PrimeReactProvider>
  );
};
export default App;
