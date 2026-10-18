export type DocumentCategory =
  | "overview"
  | "experience"
  | "projects"
  | "education"
  | "skills";

export type DocumentFileType = "pdf" | "json" | "image" | "web" | "doc";
export type DocumentSource = "backend" | "user";

export interface Document {
  id: string;
  name: string;
  title: string;
  category: DocumentCategory;
  source: DocumentSource;
  deletable: boolean;
  fileType: DocumentFileType;
  fileCount?: number;
  summary: string;
  tags: string[];
  updatedAt?: string;
  url?: string;
  pendingUpload?: boolean;
  serverId?: string;
  uploading?: boolean;
  error?: string;
}
