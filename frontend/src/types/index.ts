export type RoleName = 'ADMIN' | 'LECTURER' | 'STUDENT';

export interface User {
  id: number;
  email: string;
  full_name: string;
  user_code?: string;
  faculty?: string;
  avatar_url?: string;
  role_id: number;
  role_name: RoleName;
  is_active: boolean;
  is_blocked: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface MaterialFile {
  id: number;
  original_name: string;
  file_size: number;
  mime_type: string;
  file_extension: string;
  created_at: string;
}

export type ApprovalStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';
export type AccessLevel = 'PUBLIC' | 'AUTHENTICATED' | 'ROLE_BASED' | 'PRIVATE';

export interface AuthorInfo {
  id: number;
  full_name: string;
  avatar_url?: string;
  role_name?: string;
  faculty?: string;
}

export interface Material {
  id: number;
  title: string;
  slug: string;
  description?: string;
  subject: string;
  course_code?: string;
  academic_year?: string;
  semester?: number;
  faculty?: string;
  language?: string;
  category_id: number;
  category_name: string;
  author_id: number;
  author_name: string;
  author?: AuthorInfo;
  approval_status: ApprovalStatus;
  access_level: AccessLevel;
  rejection_reason?: string;
  thumbnail_url?: string;
  view_count: number;
  download_count: number;
  is_favorite?: boolean;
  files: MaterialFile[];
  tags: Tag[];
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}
