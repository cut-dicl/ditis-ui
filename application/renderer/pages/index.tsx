import React, { useContext, useLayoutEffect, useState } from "react";
import Head from "next/head";
import { Divider } from "primereact/divider";

function Home() {
  return (
    <div className="p-10">
      <Head>
        <title>DITIS Simulator</title>
      </Head>
    
      <h1 className="text-4xl font-bold">Welcome to DITIS Simulator</h1>
        <p className="text-lg mt-5">
        A comprehensive simulator for distributed multi-tiered data storage systems
        </p>
        <Divider  />
      <img src="/images/home.png" className="m-auto dark:hidden" />
      <img src="/images/homedark.png" className="m-auto hidden dark:block" />
      
    </div>
  );
}

export default Home;
