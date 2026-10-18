export interface SocialLink {
  label: string;
  url: string;
  type: "github" | "linkedin" | "email" | "website";
}

export interface CandidateProfile {
  name: string;
  role: string;
  headline: string;
  location: string;
  availability: "Open to opportunities" | "Consulting" | "Employed";
  bio: string;
  coreSpecialties: string[];
  socialLinks: SocialLink[];
  stats: {
    label: string;
    value: string;
  }[];
}
