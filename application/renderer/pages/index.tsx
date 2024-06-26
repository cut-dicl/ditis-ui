import React, { useContext, useLayoutEffect, useState } from "react";
import Head from "next/head";
import { Divider } from "primereact/divider";

function Home() {
  return (
    <div className="p-10 flex flex-col h-full">
      <Head>
        <title>DITIS Simulator</title>
      </Head>
    
      <h1 className="text-4xl font-bold">Welcome to DITIS Simulator</h1>
        <p className="text-lg mt-5">
        A comprehensive simulator for distributed multi-tiered data storage systems
        </p>
      <Divider />
      <div className="flex justify-center items-center flex-grow">
          <img src="/images/home.png" className="dark:hidden" />
        <img src="/images/homedark.png" className="hidden dark:block" />
        </div>
      
    </div>
  );
}

export default Home;
