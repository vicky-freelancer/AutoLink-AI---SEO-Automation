export enum ProjectStatus {
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
  PAUSED = 'PAUSED',
}

export enum TierType {
  MONEY_SITE = 'Money Site',
  TIER_1 = 'Tier 1',
  TIER_2 = 'Tier 2',
  TIER_3 = 'Tier 3',
}

export interface Project {
  id: string;
  name: string;
  url: string;
  status: ProjectStatus;
  verifiedLinks: number;
  submittedLinks: number;
  rpm: number; // Requests per minute
  tier: TierType;
  engines: string[];
  content?: {
    title: string;
    body: string;
    keywords: string[];
  };
}

export interface LogEntry {
  id: number;
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  message: string;
  project: string;
}

export interface GraphNode {
  id: string;
  group: number;
  val: number; // size
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}