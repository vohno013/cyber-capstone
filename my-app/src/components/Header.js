import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>
          <Link
            to="/"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Star Wars Universe Lookup
          </Link>
        </h1>
        <span className="nowrap">
          {isAuthenticated ? (
            <>
              <span style={{ marginRight: 12 }}>
                Logged in as <strong>{user?.username}</strong>
              </span>
              <button onClick={handleLogout}>Log out</button>
            </>
          ) : null}
        </span>
      </div>
    </div>
  );
}

export default Header;