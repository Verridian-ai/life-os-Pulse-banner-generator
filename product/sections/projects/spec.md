# Projects Section Specification

## Overview
Organization system for designs. Users can create projects, add designs, and manage collections.

## Section ID
`projects`

## Priority
Core

## User Stories
- As a user, I want to create projects to organize my designs
- As a user, I want to view all designs within a project
- As a user, I want to move designs between projects
- As a user, I want to share project links with collaborators

## Screens

### Projects List View
Overview of all user projects.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Projects                                     [+ New Project]│
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 🔍 Search projects...                                   ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  RECENT PROJECTS                                             │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐   │
│  │ ┌──┬──┬──┐     │ │ ┌──┬──┬──┐     │ │ ┌──┬──┬──┐     │   │
│  │ │  │  │  │     │ │ │  │  │  │     │ │ │  │  │  │     │   │
│  │ └──┴──┴──┘     │ │ └──┴──┴──┘     │ │ └──┴──┴──┘     │   │
│  │ Q1 Campaign    │ │ Product Launch │ │ Social Media   │   │
│  │ 12 designs     │ │ 8 designs      │ │ 23 designs     │   │
│  │ Updated 2h ago │ │ Updated 1d ago │ │ Updated 3d ago │   │
│  └────────────────┘ └────────────────┘ └────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ALL PROJECTS                               [Sort: Recent ▼] │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐   │
│  │     ...        │ │     ...        │ │     ...        │   │
│  └────────────────┘ └────────────────┘ └────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Project Detail View
Designs within a single project.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [← Projects]        Q1 Campaign               [⋮ Options]   │
├─────────────────────────────────────────────────────────────┤
│  12 designs • Updated 2h ago • [Share Link]                  │
├─────────────────────────────────────────────────────────────┤
│  FILTERS                                                     │
│  [All] [LinkedIn] [Instagram] [Drafts] [Completed]          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │          │ │          │ │  DRAFT   │ │          │       │
│  │  Design  │ │  Design  │ │  Design  │ │  Design  │       │
│  │          │ │          │ │          │ │          │       │
│  │ Banner 1 │ │ Post 1   │ │ Story    │ │ Banner 2 │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                             │
│               [+ Add Design to Project]                     │
└─────────────────────────────────────────────────────────────┘
```

## Component Props

### ProjectsListView
```typescript
interface ProjectsListViewProps {
  projects: Project[];
  recentProjects: Project[];
  searchQuery: string;
  sortBy: 'recent' | 'name' | 'designs';
  isLoading: boolean;
  onSearch: (query: string) => void;
  onSort: (sortBy: 'recent' | 'name' | 'designs') => void;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (projectId: string) => void;
  onArchiveProject: (projectId: string) => void;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  coverImages: string[]; // First 3 design thumbnails
  designCount: number;
  updatedAt: Date;
  isArchived: boolean;
}
```

### ProjectDetailView
```typescript
interface ProjectDetailViewProps {
  project: Project;
  designs: Design[];
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
```

## States

### Empty State (No Projects)
- Illustration of organized folders
- "Create your first project" message
- Benefits of organization

### Empty Project State
- "No designs yet" message
- "Add Design" prominent CTA
- Suggestion to create or import

### Loading State
- Skeleton cards for projects
- Animated thumbnails

## Interactions

### Project Card Hover
- Scale up (1.02)
- Shadow increase
- Quick actions appear (Edit, Delete, Archive)

### Design Multi-Select
- Shift+click for range
- Cmd/Ctrl+click for individual
- Bulk actions appear (Move, Delete)

### Drag and Drop
- Drag designs between projects
- Visual feedback during drag
- Drop zone highlight

## Design Tokens Applied
- Primary: Orange for CTAs and active filters
- Neutral: Stone for cards and backgrounds
- Motion: Smooth spring for card interactions

## Accessibility
- Grid navigation with arrow keys
- Drag and drop with keyboard alternative
- Project count announcements
- Focus management on navigation
