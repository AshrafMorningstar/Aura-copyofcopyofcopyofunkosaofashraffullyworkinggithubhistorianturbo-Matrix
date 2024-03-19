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
export enum ActivityType {
  ISSUE = 'ISSUE',
  PR = 'PR',
  COMMIT = 'COMMIT',
  DISCUSSION = 'DISCUSSION',
  RELEASE = 'RELEASE'
}

export interface SimulationConfig {
  githubToken: string;
  repoName: string; // Format: owner/repo
  language: string;
  issueCount: number;
  prCount: number;
  commitCount: number;
  discussionCount: number;
  megaFeatures: string[];
  startDate: string;
  autoMerge: boolean;
}

export interface GeneratedItem {
  id: number;
  type: ActivityType;
  title: string;
  description: string;
  status: 'pending' | 'created' | 'merged' | 'failed';
  timestamp: string;
  author: string;
  url?: string; // Real GitHub URL
  coAuthors?: string[];
}

export interface SimulationState {
  isRunning: boolean;
  progress: number; // 0 to 100
  logs: string[];
  items: GeneratedItem[];
  stats: {
    issues: number;
    prs: number;
    commits: number;
    discussions: number;
  };
}

export interface Contributor {
  name: string;
  role: string;
  speed: 'fast' | 'medium' | 'slow';
  email: string;
}