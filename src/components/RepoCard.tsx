import React from "react";
import { Link } from "react-router-dom";
import { GitHubRepo } from "../types/github";
import "../styles/RepoCard.css";

interface RepoCardProps {
  repo: GitHubRepo;
}

const RepoCard: React.FC<RepoCardProps> = ({ repo }) => {
  return (
    <div className="repo-card">
      <Link to={`/repo/${repo.name}`} className="repo-card-link">
        <h2>{repo.name}</h2>
        <p>{repo.description || "No description available."}</p>
        <div className="repo-card-meta">
          <span>Language: {repo.language || "N/A"}</span>
          <span>Forks: {repo.forks_count}</span>
          <span>Stars: {repo.stargazers_count}</span>
        </div>
      </Link>
    </div>
  );
};

export default RepoCard;
