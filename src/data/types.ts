export type ProjectStatus = "public" | "confidential" | "draft" | "deleted";
export type Sensitivity = "publique" | "confidentielle";

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  cover: string;
  gallery: string[];
  status: ProjectStatus;
  sensitivity: Sensitivity;
  published: boolean;
  company: string;
  client: string;
  role: string;
  team: string;
  period: string;
  problem: string;
  decisions: string;
  result: string;
  tags: {
    designType: string[];
    sector: string[];
    tools: string[];
    keywords: string[];
  };
}

export interface Designer {
  slug: string;
  fullName: string;
  headline: string;
  bio: string;
  avatar: string;
  linkedin: string;
  twitter: string;
  website: string;
  calUsername: string;
  email: string;
  location: string;
}

export type RequestStatus = "pending" | "approved" | "rejected";
export interface AccessRequest {
  id: string;
  fullName: string;
  company: string;
  email: string;
  projectTitles: string[];
  message: string;
  date: string; // ISO
  status: RequestStatus;
  rejectionReason?: string;
}

export type ContactStatus = "nouveau" | "traite" | "archive";
export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  message: string;
  date: string;
  status: ContactStatus;
}
