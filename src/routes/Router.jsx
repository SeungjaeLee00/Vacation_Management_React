import { BrowserRouter, Routes, Route } from "react-router-dom";

import CalendarMain from "../pages/CalendarMain";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/calendar" element={<CalendarMain />} />
      </Routes>
    </BrowserRouter>
  );
}
