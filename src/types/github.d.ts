export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  stargazers_count: number;
}
