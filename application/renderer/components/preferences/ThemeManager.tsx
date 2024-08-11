import { useTheme } from "next-themes";
import React from "react";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import { InputSwitch } from "primereact/inputswitch";

export default function ThemeManager() {
  const controller = React.useContext(AppController);
  const { theme } = useTheme();

  const handleTheme = (newTheme) => {
    controller.setAppTheme(newTheme);
    window.ipc.invoke("edit-preferences-file", {
      key: "theme",
      value: newTheme,
    });
  };

  return (
    <div>
      <div className="flex flex-row space-x-5">
        <h1>Enable/disable darkmode</h1>
        <InputSwitch checked={theme == "dark"} onChange={(e) => handleTheme(e.value ? "dark" : "light")} />
      
      </div>
      <small className="italic">Enables or disables the dark mode theme</small>
    </div>
  );
}
