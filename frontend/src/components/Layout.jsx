import React from "react";
import Navbar from "../components/layout/Navbar";

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div className="layout">
        {children}
      </div>
    </>
  );
}

export default Layout;