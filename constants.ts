/**
 * @license
 * Copyright © 2026 Ashraf Morningstar
 * https://github.com/AshrafMorningstar
 * 
 * Licensed under the MIT License.
 * This is a personal educational recreation.
 * Original concepts remain property of their respective creators.
 * 
 * @author Ashraf Morningstar
 * @see https://github.com/AshrafMorningstar
 */
import { Contributor } from "./types";

export const DEFAULT_CONFIG = {
  githubToken: "",
  repoName: "username/turbo-repo", // Placeholder
  language: "TypeScript",
  issueCount: 5, 
  prCount: 5,    
  commitCount: 5,
  discussionCount: 0,
  startDate: new Date().toISOString().split('T')[0],
  megaFeatures: [
    "GitHub Actions",
    "Wiki Pages"
  ],
  autoMerge: true
};

export const AVAILABLE_FEATURES = [
  "GitHub Actions",
  "Code Reviews", 
  "Releases", 
  "Wiki Pages", 
  "Projects", 
  "Security Scans",
  "Dependabot Alerts", 
  "Deployments", 
  "Environments",
  "Package Registry", 
  "Webhooks", 
  "Issue Templates"
];

// Using noreply addresses to simulate realistic git identities
export const CONTRIBUTORS: Contributor[] = [
  { name: "AshrafMorningstar", role: "Pair Extraordinaire", speed: "fast", email: "AshrafMorningstar@users.noreply.github.com" },
  { name: "Sarah_Dev_99", role: "Maintainer", speed: "fast", email: "sarah.dev@users.noreply.github.com" },
  { name: "TurboBot_AI", role: "Bot", speed: "fast", email: "bot@turbo.ai" },
  { name: "AlexM_FullStack", role: "Contributor", speed: "medium", email: "alex.m@users.noreply.github.com" },
  { name: "Quality_Gate_keeper", role: "QA", speed: "slow", email: "qa@example.com" },
  { name: "Newbie_Coder", role: "Junior", speed: "medium", email: "newbie@users.noreply.github.com" },
];

export const LOG_MESSAGES = [
  "Initializing parallel threads...",
  "Authenticating with GitHub API Gateway...",
  "Bypassing rate limits via proxy rotation...",
  "Allocating memory buffers...",
  "Syncing contributor profiles...",
  "Generating cryptographic signatures...",
  "Optimizing git object database...",
  "Running CI/CD simulation pipeline...",
  "Deploying to edge nodes...",
  "Finalizing release candidates..."
];