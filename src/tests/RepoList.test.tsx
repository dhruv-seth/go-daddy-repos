import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import { BrowserRouter as Router } from "react-router-dom";
import RepoList from "../components/RepoList";
import { GitHubRepo } from "../types/github"; // Import the type definition
import axios from "axios"; // Import axios for mocking
import "@testing-library/jest-dom"; // For extended DOM matchers

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockRepos: GitHubRepo[] = [
  {
    id: 1,
    name: "repo-alpha",
    description: "Description for repo alpha",
    language: "JavaScript",
    forks_count: 10,
    stargazers_count: 50,
    html_url: "https://github.com/godaddy/repo-alpha",
    full_name: "godaddy/repo-alpha",
    open_issues_count: 2,
    watchers_count: 20,
  },
  {
    id: 2,
    name: "repo-beta",
    description: "Description for repo beta",
    language: "TypeScript",
    forks_count: 5,
    stargazers_count: 25,
    html_url: "https://github.com/godaddy/repo-beta",
    full_name: "godaddy/repo-beta",
    open_issues_count: 1,
    watchers_count: 10,
  },
];

describe("RepoList", () => {
  beforeEach(() => {
    mockedAxios.get.mockClear();
  });

  test("renders loading state initially", () => {
    mockedAxios.get.mockImplementationOnce(() => new Promise(() => {}));
    render(
      <Router>
        <RepoList />
      </Router>,
    );
    expect(
      screen.getByText(/Loading GoDaddy repositories.../i),
    ).toBeInTheDocument();
  });

  test("renders repositories after successful fetch", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockRepos,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    });

    render(
      <Router>
        <RepoList />
      </Router>,
    );

    await waitFor(() => {
      expect(screen.getByText(/repo-alpha/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Description for repo alpha/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/repo-beta/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Description for repo beta/i),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByText(/Loading GoDaddy repositories.../i),
    ).not.toBeInTheDocument();
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api.github.com/orgs/godaddy/repos",
    );
  });

  test("renders error message on fetch failure", async () => {
    // Mock axios.get to reject with a new Error object, simulating a network error.
    mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <Router>
        <RepoList />
      </Router>,
    );

    // Wait for the error message to appear due to the failed fetch.
    await waitFor(() => {
      // The error message includes "HTTP Error: N/A - Network Error" based on RepoList's error handling.
      expect(
        screen.getByText(
          /Error: HTTP Error: N\/A - Network Error. Please try again later./i,
        ),
      ).toBeInTheDocument();
    });

    // Ensure the loading message is gone.
    expect(
      screen.queryByText(/Loading GoDaddy repositories.../i),
    ).not.toBeInTheDocument();
  });

  test('renders "No repositories found" when API returns empty array', async () => {
    // Mock axios.get to resolve successfully but with an empty data array.
    mockedAxios.get.mockResolvedValueOnce({
      data: [],
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    });

    render(
      <Router>
        <RepoList />
      </Router>,
    );

    // Wait for the specific message indicating no repositories were found.
    await waitFor(() => {
      expect(
        screen.getByText(/No repositories found for GoDaddy./i),
      ).toBeInTheDocument();
    });
  });
});
