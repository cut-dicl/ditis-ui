import React, { useContext, useState } from "react";
import "primeicons/primeicons.css";
import Link from "next/link";
import { AppController } from "../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import { Linebreak } from "./Linebreak";
import { Tag } from "primereact/tag";

export default function BasicDemo() {
  const [expanded, setExpanded] = useState(false);
  const controller = useContext(AppController);

  const Option = (props: {
    optionIcon: string;
    optionName: string;
    optionLink: string;
  }) => {
    return (
      <Link
        href={props.optionLink}
        className="flex flex-row items-center w-[90%]"
      >
        <button className="bg-gray-100 shadow-md shadow-gray-400 dark:shadow-black hover:bg-gray-400 hover:dark:bg-gray-600 text-black dark:text-white dark:bg-[#283444] sidebarButton ">
          <i
            className={props.optionIcon}
            style={{ fontSize: "1.8rem" }}
          ></i>
          <span style={{whiteSpace:"normal", textAlign:"justify"}}>{props.optionName}</span>
        </button>
      </Link>
    );
  };

  const OptionCollapsed = (props: {
    optionIcon: string;
    optionName: string;
    optionLink: string;
  }) => {
    return (
      <Link
        href={props.optionLink}
        className="flex flex-row items-center w-[90%]"
      >
        <button className="bg-gray-100 shadow-md shadow-gray-400 dark:shadow-black hover:bg-gray-400 hover:dark:bg-gray-600 text-black dark:text-white dark:bg-[#283444] sidebarButton justify-center">
          <i
            className={props.optionIcon + " custom-target-icon"}
            style={{ fontSize: "1.8rem", cursor: "pointer" }}
          />
        </button>
      </Link>
    );
  };

  return (
    <>
      <div
        className={
          "bg-gray-300 dark:bg-gray-900 w-[325px] lg:flex " +
          (expanded ? "flex" : "hidden") +
          " min-h-screen flex-col items-center transition transform duration-300 overflow-auto "
        }
        onMouseLeave={() => setExpanded(false)}
      >
        <img
          src="/images/ditis-logo-full.png"
          className="w-[90%] mt-5 mb-2"
          alt="DITIS logo"
        />
        <div className="flex flex-col w-full px-3">
          {controller.mode === "Local" && (<>
            <Tag style={{  color: 'white'}}
              value="Mode: Local" className="mb-2 flex dark:hidden"
              icon="pi pi-globe"
            ></Tag>
            <Tag style={{ background: "linear-gradient(180deg, rgb(0, 45, 210) 30%, rgb(0, 0, 198) 100%)",color: 'white'}}
              value="Mode: Local" className="mb-2 hidden dark:flex"
              icon="pi pi-globe"
            ></Tag>
          </>
              )}
          {controller.mode === "Online" && (<>
            <Tag value="Mode: Online" className="mb-2 flex dark:hidden" icon="pi pi-globe"           
              style={{
                color: 'white'
              }}
            ></Tag>
            <Tag value="Mode: Online" className="mb-2 hidden dark:flex" icon="pi pi-globe"           
              style={{
                background: 'linear-gradient(180deg, rgb(0, 45, 210) 30%, rgb(0, 0, 198) 100%)',
                color: 'white'
              }}
            ></Tag>
            <Tag
              style={{color: 'white'}}
              icon="pi pi-server"
              className="flex dark:hidden"
              value={"Server: " + controller.onlineServer.serverName} ></Tag>
            <Tag
              style={{
                background: 'linear-gradient(180deg, rgb(0, 0, 198) 30%, rgb(0, 0, 150) 100%)', color: 'white'
              }}
              className="hidden dark:flex"
              icon="pi pi-server"
              value={"Server: " + controller.onlineServer.serverName} ></Tag>
            </>
          )}
        </div>
        <div className="flex flex-row w-[90%] mt-2 items-center space-x-2 ">
          <Linebreak />
          <span className="text-lg">Common</span>
          <Linebreak />
        </div>
        <Option optionIcon="pi pi-home" optionName="Home" optionLink="/" />
        <Option
          optionIcon="pi pi-file"
          optionName="Traces"
          optionLink="/traces"
        />
        <Option
          optionIcon="pi pi-file-edit"
          optionName="Configurations"
          optionLink="/configurations"
        />
        <div className="flex flex-row w-[90%] items-center space-x-2 ">
          <Linebreak />
          <span className="text-lg">Simulator</span>
          <Linebreak />
        </div>
        <Option
          optionIcon="pi pi-plus"
          optionName="New Simulation"
          optionLink="/simulator"
        />
        <Option
          optionIcon="pi pi-book"
          optionName="Completed Simulations"
          optionLink="/simulatorruns"
        />
        <div className="flex flex-row w-[90%] items-center space-x-2">
          <Linebreak />
          <span className="text-lg">Optimizer</span>
          <Linebreak />
        </div>
        <Option
          optionIcon="pi pi-plus"
          optionName="New Optimization"
          optionLink="/optimizer"
        />
        <Option
          optionIcon="pi pi-book"
          optionName="Completed Optimizations"
          optionLink="/optimizerruns"
        />
        
        <div className="flex-1"></div>
        <Linebreak />
        <Option
          optionIcon="pi pi-cog"
          optionName="Preferences"
          optionLink="/preferences"
        />
        <Linebreak />
        <Option
          optionIcon="pi pi-question-circle"
          optionName="Help"
          optionLink="/help"
        />
      </div>
      <div
        className={
          "bg-gray-300 dark:bg-gray-900 max-w-[55px] min-h-screen flex-col items-center lg:hidden overflow-hidden " +
          (expanded ? "hidden" : "flex")
        }
        onMouseOver={() => setExpanded(true)}
      >
        <img
          src="/images/ditis-logo.png"
          className="w-[80%] mt-5 mb-2"
          alt="Cyprus University of Technology logo"
        />
        <OptionCollapsed
          optionIcon="pi pi-home"
          optionName="Home"
          optionLink="/"
        />
        <OptionCollapsed
          optionIcon="pi pi-file"
          optionName="Traces"
          optionLink="/traces"
        />
        <OptionCollapsed
          optionIcon="pi pi-file-edit"
          optionName="Configurations"
          optionLink="/configurations"
        />
        <Linebreak />
        <OptionCollapsed
          optionIcon="pi pi-plus"
          optionName="New Simulation"
          optionLink="/simulator"
        />
        <OptionCollapsed
          optionIcon="pi pi-book"
          optionName="Completed Simulations"
          optionLink="/simulatorruns"
        />
        <Linebreak />
        <OptionCollapsed
          optionIcon="pi pi-plus"
          optionName="New Optimization"
          optionLink="/optimizer"
        />
        <OptionCollapsed
          optionIcon="pi pi-book"
          optionName="Completed Optimizations"
          optionLink="/optimizerruns"
        />

        <div className="flex-1"></div>
        <Linebreak />
        <OptionCollapsed
          optionIcon="pi pi-cog"
          optionName="Preferences"
          optionLink="/preferences"
        />
      </div>
    </>
  );
}
