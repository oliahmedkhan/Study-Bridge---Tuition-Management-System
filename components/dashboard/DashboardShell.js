import React from "react";
import NavBar from "../../components/NavBar";
import Sidebar from "../ui/sidebar";

export default function DashboardShell({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
