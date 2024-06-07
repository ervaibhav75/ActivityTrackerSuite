import React from "react";
import Landing from "./components/habit_tracker/Landing";
import Home from "./pages/Home";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import MistakeLogs from "./components/MistakeLogs";
import CreateMistakefact from "./components/CreateMistakefact";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { CommonContextProvider } from "./context/CommonContext";
import ProfilePage from "./components/ProfilePage";
import ContactMe from "./components/ContactMe";

function App() {
  function Logout() {
    localStorage.clear();
    return <Navigate to="/login" />;
  }

  return (
    <CommonContextProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>

                <MistakeLogs />

              </ProtectedRoute>
            }
          />
          <Route
            path="/habit_tracker"
            element={
              <ProtectedRoute>

                <Landing />

              </ProtectedRoute>
            }
          />
          <Route
            path="/contactme"
            element={
              <ProtectedRoute>

                <ContactMe />

              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>

                <ProfilePage />

              </ProtectedRoute>
            }
          />
          <Route path="/login" element={
            <Login />}
          />

  

          <Route path="/register" element={
            <Register />
          } />

          <Route
            path="/activity_logs"
            element={
              <ProtectedRoute>
                <MistakeLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/CreateLogs"
            element={
              <ProtectedRoute>
                <CreateMistakefact />
              </ProtectedRoute>
            }
          />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </CommonContextProvider>

  );
}

export default App;
