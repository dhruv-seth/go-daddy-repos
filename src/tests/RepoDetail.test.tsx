import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RepoDetail from "../components/RepoDetail";
import { GitHubRepo } from "../types/github";
import "@testing-library/jest-dom";
import axios from "axios";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockRepoDetails: GitHubRepo = {
  id: 123,
  name: "example-repo",
  description: "This is an example repository for testing.",
  html_url: "https://github.com/godaddy/example-repo",
  language: "JavaScript",
  forks_count: 5,
  open_issues_count: 2,
  watchers_count: 15,
  stargazers_count: 100,
  full_name: "godaddy/example-repo",
};

describe("RepoDetail", () => {
  beforeEach(() => {
    mockedAxios.get.mockClear();
  });

  test("renders loading state initially", () => {
    // Simulate a pending API call for the detail view.

    mockedAxios.get.mockResolvedValue(new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={["/repo/example-repo"]}>
        <Routes>
          <Route path="/repo/:repoName" element={<RepoDetail />} />
        </Routes>
      </MemoryRouter>,
    );
    // Assert that the loading message is displayed on the screen.
    expect(
      screen.getByText(/Loading repository details.../i),
    ).toBeInTheDocument();
  });

  test("renders repository details after successful fetch", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockRepoDetails,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    });

    render(
      <MemoryRouter initialEntries={["/repo/example-repo"]}>
        <Routes>
          <Route path="/repo/:repoName" element={<RepoDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    // Wait for the component to finish fetching and display the details.
    await waitFor(() => {
      expect(screen.getByText(/example-repo/i)).toBeInTheDocument();
      expect(
        screen.getByText(
          /Description: This is an example repository for testing./i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Language\(s\) Used: JavaScript/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Forks: 5/i)).toBeInTheDocument();
      expect(screen.getByText(/Open Issues: 2/i)).toBeInTheDocument();
      expect(screen.getByText(/Watchers: 15/i)).toBeInTheDocument();
      expect(
        screen.getByRole("link", {
          name: /https:\/\/github.com\/godaddy\/example-repo/i,
        }),
      ).toHaveAttribute("href", "https://github.com/godaddy/example-repo");
    });

    // Ensure the loading message is no longer present.
    expect(
      screen.queryByText(/Loading repository details.../i),
    ).not.toBeInTheDocument();
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api.github.com/repos/godaddy/example-repo",
    );
  });

  test("renders error message on 404 fetch failure", async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 404 },
      isAxiosError: true,
      message: "Request failed with status code 404",
    });

    render(
      <MemoryRouter initialEntries={["/repo/non-existent-repo"]}>
        <Routes>
          <Route path="/repo/:repoName" element={<RepoDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /Error: Repository not found. Could not load repository details./i,
        ),
      ).toBeInTheDocument();
    });

    // Ensure loading message is not present.
    expect(
      screen.queryByText(/Loading repository details.../i),
    ).not.toBeInTheDocument();
  });

  test("renders generic error message on other fetch failures", async () => {
    // Mock axios.get to reject with a generic network error.
    mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <MemoryRouter initialEntries={["/repo/any-repo"]}>
        <Routes>
          <Route path="/repo/:repoName" element={<RepoDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /Error: HTTP Error: N\/A - Network Error. Could not load repository details./i,
        ),
      ).toBeInTheDocument();
    });
  });

  test('renders "Repository details could not be loaded" if repo data is null after loading', async () => {
    // This tests a defensive programming case for `!repo`.
    mockedAxios.get.mockResolvedValueOnce({
      data: null,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    });

    render(
      <MemoryRouter initialEntries={["/repo/null-repo"]}>
        <Routes>
          <Route path="/repo/:repoName" element={<RepoDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    // Wait for the specific message indicating details could not be loaded.
    await waitFor(() => {
      expect(
        screen.getByText(/Repository details could not be loaded./i),
      ).toBeInTheDocument();
    });
  });

  test("back button navigates to home", async () => {
    // Provide mock data for successful load to ensure the back button is rendered.
    mockedAxios.get.mockResolvedValueOnce({
      data: mockRepoDetails,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    });
    render(
      <MemoryRouter initialEntries={["/repo/example-repo"]}>
        <Routes>
          <Route path="/repo/:repoName" element={<RepoDetail />} />
          {/* A dummy route for the home page so React Router can match it */}
          <Route path="/" element={<div>Repo List Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    // Wait for the repo details to load and render the back button.
    await waitFor(() => {
      expect(screen.getByText(/example-repo/i)).toBeInTheDocument();
    });

    const backButton = screen.getByText(/Back to all repositories/i);
    expect(backButton).toBeInTheDocument();

    // In a testing environment with MemoryRouter, we check the `href` attribute of the Link.
    // In a real browser, clicking this would navigate.
    expect(backButton.closest("a")).toHaveAttribute("href", "/");
  });
});
