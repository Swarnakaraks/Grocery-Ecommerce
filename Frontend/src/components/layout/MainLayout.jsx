import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function MainLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col ">
      <Navbar />
      <main className="w-full flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
