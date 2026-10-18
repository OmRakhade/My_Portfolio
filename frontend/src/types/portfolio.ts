export interface PortfolioPersonal {
  name: string;
  headline: string;
  location: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  portfolio: string;
  about?: string;
  short_about?: string;
}

export interface PortfolioEducation {
  degree: string;
  field: string;
  institution: string;
  status: string;
  year: string;
}

export interface PortfolioProject {
  name: string;
  description: string;
  technologies: string[];
  role: string;
  evidence: string[];
}

export interface Portfolio {
  personal: PortfolioPersonal;
  education: PortfolioEducation[];
  skills: Record<string, string[]>;
  projects: PortfolioProject[];
  experience: Record<string, unknown>[];
  achievements: { title: string; description: string; year: string }[];
  certifications: { name: string; issuer: string; year: string }[];
  research: { title: string; description: string; technologies: string[] }[];
  resume: { url: string };
}