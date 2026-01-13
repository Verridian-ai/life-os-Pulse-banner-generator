/**
 * Projects Section Types
 */

export type Platform = 'linkedin' | 'twitter' | 'facebook' | 'instagram';
export type ProjectStatus = 'draft' | 'completed' | 'archived';
export type ViewMode = 'grid' | 'list';
export type SortDirection = 'asc' | 'desc';
export type BulkAction = 'delete' | 'archive' | 'move';

export interface Project {
  id: string;
  name: string;
  description?: string;
  coverImages: string[];
  designCount: number;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  status?: ProjectStatus;
  platform?: Platform;
}

export interface Folder {
  id: string;
  name: string;
  projectCount: number;
}

export interface ProjectStats {
  totalProjects: number;
  totalDesigns: number;
  recentActivity: number;
}

export interface ProjectDesign {
  id: string;
  title: string;
  thumbnailUrl: string;
  platform: string;
  status: 'draft' | 'completed';
  createdAt: string;
}

export type SortOption = 'recent' | 'name' | 'designs';

export interface FilterOption {
  label: string;
  value: string;
}

export interface PlatformOption {
  platform: Platform;
  label: string;
  icon: string;
}

export interface ProjectsData {
  projects: Project[];
  folders: Folder[];
  stats: ProjectStats;
}

export interface ProjectsViewState {
  viewMode: ViewMode;
  sortBy: SortOption;
  sortDirection: SortDirection;
  selectedProjects: string[];
}

export interface ProjectActionHandlers {
  onOpen: (projectId: string) => void;
  onEdit: (projectId: string) => void;
  onDelete: (projectId: string) => void;
  onArchive: (projectId: string) => void;
  onDuplicate: (projectId: string) => void;
}

export interface FolderActionHandlers {
  onOpen: (folderId: string) => void;
  onRename: (folderId: string, newName: string) => void;
  onDelete: (folderId: string) => void;
}

export interface BulkActionHandlers {
  onBulkDelete: (projectIds: string[]) => void;
  onBulkArchive: (projectIds: string[]) => void;
  onBulkMove: (projectIds: string[], folderId: string) => void;
}

export interface ProjectsListViewProps {
  projects: Project[];
  recentProjects: Project[];
  searchQuery: string;
  sortBy: SortOption;
  isLoading: boolean;
  onSearch: (query: string) => void;
  onSort: (sortBy: SortOption) => void;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (projectId: string) => void;
  onArchiveProject: (projectId: string) => void;
}

export interface ProjectDetailViewProps {
  project: Project;
  designs: ProjectDesign[];
  platformFilter: string | null;
  statusFilter: 'all' | 'draft' | 'completed';
  isLoading: boolean;
  onFilterPlatform: (platform: string | null) => void;
  onFilterStatus: (status: 'all' | 'draft' | 'completed') => void;
  onOpenDesign: (designId: string) => void;
  onMoveDesign: (designId: string, targetProjectId: string) => void;
  onRemoveDesign: (designId: string) => void;
  onShareProject: () => void;
  onEditProject: () => void;
  onBack: () => void;
}
