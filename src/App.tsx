import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RepoList from "./components/RepoList";
import RepoDetail from "./components/RepoDetail";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <main>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <h1>GoDaddy GitHub Repositories</h1>
          </Link>
          <Routes>
            <Route path="/" element={<RepoList />} />
            <Route path="/repo/:repoName" element={<RepoDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
