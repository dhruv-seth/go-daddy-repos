import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { GitHubRepo } from "../types/github";
import "../styles/RepoDetail.css";

const RepoDetail: React.FC = () => {
  const { repoName } = useParams<{ repoName: string }>();
  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepoDetails = async () => {
      if (!repoName) {
        setError("Repository name not provided in URL.");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get<GitHubRepo>(
          `https://api.github.com/repos/godaddy/${repoName}`,
        );
        setRepo(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            setError("Repository not found.");
          } else {
            setError(err.message);
          }
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRepoDetails();
  }, [repoName]);

  if (loading) {
    return <div className="loading">Loading repository details...</div>;
  }

  if (error) {
    return (
      <div className="error">
        Error: {error}. Could not load repository details.
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="not-found">Repository details could not be loaded.</div>
    );
  }

  return (
    <div className="repo-detail-container">
      <Link to="/" className="back-button">
        &larr; Back to all repositories
      </Link>
      <h2>{repo.name}</h2>
      <p>
        <strong>Description:</strong>{" "}
        {repo.description || "No description available."}
      </p>
      <p>
        <strong>Language(s) Used:</strong> {repo.language || "N/A"}
      </p>
      <p>
        <strong>Forks:</strong> {repo.forks_count}
      </p>
      <p>
        <strong>Open Issues:</strong> {repo.open_issues_count}
      </p>
      <p>
        <strong>Watchers:</strong> {repo.watchers_count}
      </p>
      <p>
        <strong>Repo Page:</strong>{" "}
        <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
          {repo.html_url}
        </a>
      </p>
    </div>
  );
};

export default RepoDetail;
