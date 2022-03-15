import React from "react";
import { Navigate } from "react-router";

// import logo from './logo.svg';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

function App(): React.ReactElement {
  return (
    <Router>
      {/* <div>
        <NavBar />
      </div> */}
      <div id="modal-root" />
      <Routes>
        <Route path="/app/*" element={<Dashboard />} />
        {/* <Route path="/" element={<Home />} /> */}
        {/* Router does not match */}
        <Route path="*" element={<NotFound />} />

        <Route path="/" element={<Navigate to="/app/*" />} />
      </Routes>
    </Router>
  );
}

export default App;
