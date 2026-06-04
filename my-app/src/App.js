import React from "react";
import "./App.css";
import "./site.css";
import Header from "./components/Header";
import Characters from "./components/Characters";
import Character from "./components/Character";
import Planets from "./components/Planets";
import Films from "./components/Films";
import Login from "./components/Login";
import Register from "./components/Register";
import PrivateRoute from "./components/PrivateRoute";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Characters />
            </PrivateRoute>
          }
        />
        <Route
          path="/characters/:id"
          element={
            <PrivateRoute>
              <Character />
            </PrivateRoute>
          }
        />
        <Route
          path="/films/:id"
          element={
            <PrivateRoute>
              <Films />
            </PrivateRoute>
          }
        />
        <Route
          path="/planets/:id"
          element={
            <PrivateRoute>
              <Planets />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
