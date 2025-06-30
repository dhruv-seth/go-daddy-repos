import React, { useState, useEffect } from "react";
import axios from "axios";
import RepoCard from "./RepoCard";
import { GitHubRepo } from "../types/github";
import "../styles/RepoList.css";

const RepoList: React.FC = () => {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await axios.get<GitHubRepo[]>(
          "https://api.github.com/orgs/godaddy/repos",
        );
        setRepos(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  if (loading) {
    return <div className="loading">Loading GoDaddy repositories...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}. Please try again later.</div>;
  }

  return (
    <div className="repo-list-container">
      <div className="repo-list">
        {repos.length > 0 ? (
          repos.map((repo) => <RepoCard key={repo.id} repo={repo} />)
        ) : (
          <p>No repositories found for GoDaddy.</p>
        )}
      </div>
    </div>
  );
};

export default RepoList;
