import React, { useState, useMemo } from 'react';

// Types
type Platform = 'linkedin' | 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'x';
type ProjectStatus = 'draft' | 'published';
type ViewMode = 'grid' | 'list';

interface Project {
  id: string;
  name: string;
  platform: Platform;
  status: ProjectStatus;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
  folderId?: string;
}

interface Folder {
  id: string;
  name: string;
  projectIds: string[];
}

// Glass styles utility
const glassStyles = {
  card: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]',
  cardHover: 'hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
  neumorphicRaised: 'shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)]',
  neumorphicInset: 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.05)]',
};

// Platform colors
const platformColors: Record<Platform, { gradient: string; glow: string; text: string }> = {
  linkedin: {
    gradient: 'from-blue-600 to-cyan-400',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
    text: 'text-blue-400',
  },
  youtube: {
    gradient: 'from-red-600 to-rose-400',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]',
    text: 'text-red-400',
  },
  instagram: {
    gradient: 'from-purple-600 via-pink-500 to-orange-400',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    text: 'text-pink-400',
  },
  facebook: {
    gradient: 'from-blue-700 to-indigo-500',
    glow: 'shadow-[0_0_20px_rgba(37,99,235,0.4)]',
    text: 'text-blue-500',
  },
  tiktok: {
    gradient: 'from-cyan-400 to-pink-500',
    glow: 'shadow-[0_0_20px_rgba(236,72,153,0.4)]',
    text: 'text-cyan-400',
  },
  x: {
    gradient: 'from-zinc-500 to-zinc-300',
    glow: 'shadow-[0_0_20px_rgba(161,161,170,0.3)]',
    text: 'text-zinc-300',
  },
};

// Sample data
const sampleProjects: Project[] = [
  { id: '1', name: 'Q1 Product Launch Banner', platform: 'linkedin', status: 'published', thumbnailUrl: '', createdAt: '2025-01-02', updatedAt: '2025-01-08', folderId: '1' },
  { id: '2', name: 'AI Tools Tutorial Thumbnail', platform: 'youtube', status: 'published', thumbnailUrl: '', createdAt: '2025-01-03', updatedAt: '2025-01-07', folderId: '2' },
  { id: '3', name: 'Summer Campaign Carousel', platform: 'instagram', status: 'draft', thumbnailUrl: '', createdAt: '2025-01-04', updatedAt: '2025-01-09' },
  { id: '4', name: 'Company Anniversary Cover', platform: 'facebook', status: 'published', thumbnailUrl: '', createdAt: '2025-01-01', updatedAt: '2025-01-05', folderId: '1' },
  { id: '5', name: 'New Year Promo Video', platform: 'tiktok', status: 'published', thumbnailUrl: '', createdAt: '2024-12-28', updatedAt: '2025-01-02', folderId: '3' },
  { id: '6', name: 'Tech Announcement Thread', platform: 'x', status: 'draft', thumbnailUrl: '', createdAt: '2025-01-06', updatedAt: '2025-01-08' },
  { id: '7', name: 'Webinar Promotion Post', platform: 'linkedin', status: 'draft', thumbnailUrl: '', createdAt: '2025-01-07', updatedAt: '2025-01-09', folderId: '1' },
  { id: '8', name: 'Behind the Scenes Reel', platform: 'instagram', status: 'published', thumbnailUrl: '', createdAt: '2025-01-05', updatedAt: '2025-01-06', folderId: '3' },
];

const sampleFolders: Folder[] = [
  { id: '1', name: 'Marketing Campaigns', projectIds: ['1', '4', '7'] },
  { id: '2', name: 'YouTube Content', projectIds: ['2'] },
  { id: '3', name: 'Social Videos', projectIds: ['5', '8'] },
];

// Platform Icon Component
function PlatformIcon({ platform, className = '' }: { platform: Platform; className?: string }) {
  const icons: Record<Platform, React.ReactNode> = {
    linkedin: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    youtube: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    instagram: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    facebook: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    tiktok: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
    x: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  };

  return <>{icons[platform]}</>;
}

// Project Card Component
function ProjectCard({
  project,
  isSelected,
  isSelectionMode,
  onSelect,
  onClick,
  onDelete,
  onDuplicate,
}: {
  project: Project;
  isSelected: boolean;
  isSelectionMode: boolean;
  onSelect: (id: string) => void;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const colors = platformColors[project.platform];

  return (
    <div
      className={`
        ${glassStyles.card} rounded-2xl overflow-hidden group
        ${glassStyles.cardHover}
        ${isSelected ? 'ring-2 ring-teal-500 border-teal-500/50' : ''}
        transition-all duration-300 cursor-pointer
      `}
      onClick={() => isSelectionMode ? onSelect(project.id) : onClick(project.id)}
    >
      {/* Thumbnail */}
      <div className="aspect-video relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-20`} />
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />

        {/* Placeholder icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-12 h-12 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Selection checkbox */}
        {isSelectionMode && (
          <div className="absolute top-3 left-3 z-10">
            <div className={`
              w-6 h-6 rounded-lg border-2
              ${isSelected
                ? 'bg-teal-500 border-teal-500'
                : 'bg-white/10 border-white/30 backdrop-blur-sm'}
              flex items-center justify-center transition-all
            `}>
              {isSelected && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        )}

        {/* Platform badge */}
        <div className="absolute top-3 right-3 z-10">
          <div className={`
            w-8 h-8 rounded-lg
            bg-white/10 backdrop-blur-md border border-white/20
            flex items-center justify-center
            ${glassStyles.neumorphicRaised}
          `}>
            <PlatformIcon platform={project.platform} className={`w-4 h-4 ${colors.text}`} />
          </div>
        </div>

        {/* Status badge */}
        <div className="absolute bottom-3 left-3 z-10">
          <div className={`
            px-2.5 py-1 rounded-full text-xs font-medium
            ${project.status === 'published'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}
            backdrop-blur-sm
          `}>
            {project.status === 'published' ? 'Published' : 'Draft'}
          </div>
        </div>

        {/* Hover overlay */}
        <div className={`
          absolute inset-0 bg-black/60 backdrop-blur-sm
          flex items-center justify-center gap-3
          opacity-0 group-hover:opacity-100 transition-all duration-300
        `}>
          <button
            onClick={(e) => { e.stopPropagation(); onClick(project.id); }}
            className={`
              px-4 py-2 rounded-xl
              bg-gradient-to-r from-sky-500 to-teal-500
              text-white text-sm font-medium
              hover:shadow-[0_0_20px_rgba(20,184,166,0.5)]
              transition-all
            `}
          >
            Open
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(project.id); }}
            className={`
              w-10 h-10 rounded-xl
              bg-white/10 backdrop-blur-md border border-white/20
              flex items-center justify-center text-white
              hover:bg-white/20 transition-colors
            `}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-sky-400 group-hover:to-teal-400 transition-all">
              {project.name}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Updated {project.updatedAt}</p>
          </div>

          {/* Menu button */}
          <div className="relative ml-2">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className={`
                w-8 h-8 rounded-lg
                bg-white/5 hover:bg-white/10
                flex items-center justify-center
                transition-colors
              `}
            >
              <svg className="w-4 h-4 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="6" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="18" r="2" />
              </svg>
            </button>

            {showMenu && (
              <div className={`
                absolute right-0 top-full mt-1 z-20
                w-36 py-1 rounded-xl
                ${glassStyles.card}
              `}>
                <button
                  onClick={(e) => { e.stopPropagation(); onDuplicate(project.id); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Duplicate
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  Move to...
                </button>
                <hr className="border-white/10 my-1" />
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(project.id); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Folder Sidebar Component
function FolderSidebar({
  folders,
  selectedFolderId,
  onFolderSelect,
  projectCounts,
}: {
  folders: Folder[];
  selectedFolderId: string | null;
  onFolderSelect: (id: string | null) => void;
  projectCounts: { all: number; drafts: number; published: number };
}) {
  return (
    <div className={`${glassStyles.card} rounded-2xl p-4 h-fit`}>
      <h3 className="text-sm font-semibold text-white mb-4 px-2">Library</h3>

      <div className="space-y-1">
        {/* All Designs */}
        <button
          onClick={() => onFolderSelect(null)}
          className={`
            w-full flex items-center justify-between px-3 py-2.5 rounded-xl
            transition-all duration-200
            ${selectedFolderId === null
              ? 'bg-gradient-to-r from-sky-500/20 to-teal-500/20 border border-teal-500/30'
              : 'hover:bg-white/5'}
          `}
        >
          <div className="flex items-center gap-3">
            <svg className={`w-5 h-5 ${selectedFolderId === null ? 'text-teal-400' : 'text-zinc-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className={`text-sm ${selectedFolderId === null ? 'text-white font-medium' : 'text-zinc-300'}`}>
              All Designs
            </span>
          </div>
          <span className="text-xs text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">
            {projectCounts.all}
          </span>
        </button>

        {/* Drafts */}
        <button
          onClick={() => onFolderSelect('drafts')}
          className={`
            w-full flex items-center justify-between px-3 py-2.5 rounded-xl
            transition-all duration-200
            ${selectedFolderId === 'drafts'
              ? 'bg-gradient-to-r from-sky-500/20 to-teal-500/20 border border-teal-500/30'
              : 'hover:bg-white/5'}
          `}
        >
          <div className="flex items-center gap-3">
            <svg className={`w-5 h-5 ${selectedFolderId === 'drafts' ? 'text-teal-400' : 'text-yellow-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className={`text-sm ${selectedFolderId === 'drafts' ? 'text-white font-medium' : 'text-zinc-300'}`}>
              Drafts
            </span>
          </div>
          <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">
            {projectCounts.drafts}
          </span>
        </button>

        {/* Published */}
        <button
          onClick={() => onFolderSelect('published')}
          className={`
            w-full flex items-center justify-between px-3 py-2.5 rounded-xl
            transition-all duration-200
            ${selectedFolderId === 'published'
              ? 'bg-gradient-to-r from-sky-500/20 to-teal-500/20 border border-teal-500/30'
              : 'hover:bg-white/5'}
          `}
        >
          <div className="flex items-center gap-3">
            <svg className={`w-5 h-5 ${selectedFolderId === 'published' ? 'text-teal-400' : 'text-green-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`text-sm ${selectedFolderId === 'published' ? 'text-white font-medium' : 'text-zinc-300'}`}>
              Published
            </span>
          </div>
          <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
            {projectCounts.published}
          </span>
        </button>

        {/* Divider */}
        <div className="h-px bg-white/10 my-3" />

        {/* Folders */}
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Folders</span>
          <button className="text-teal-400 hover:text-teal-300 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => onFolderSelect(folder.id)}
            className={`
              w-full flex items-center justify-between px-3 py-2.5 rounded-xl
              transition-all duration-200 group
              ${selectedFolderId === folder.id
                ? 'bg-gradient-to-r from-sky-500/20 to-teal-500/20 border border-teal-500/30'
                : 'hover:bg-white/5'}
            `}
          >
            <div className="flex items-center gap-3">
              <svg className={`w-5 h-5 ${selectedFolderId === folder.id ? 'text-teal-400' : 'text-zinc-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className={`text-sm ${selectedFolderId === folder.id ? 'text-white font-medium' : 'text-zinc-300'}`}>
                {folder.name}
              </span>
            </div>
            <span className="text-xs text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">
              {folder.projectIds.length}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Bulk Action Toolbar Component
function BulkActionToolbar({
  selectedCount,
  onDelete,
  onMove,
  onMarkDraft,
  onMarkPublished,
  onSelectAll,
  onDeselectAll,
}: {
  selectedCount: number;
  onDelete: () => void;
  onMove: () => void;
  onMarkDraft: () => void;
  onMarkPublished: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}) {
  return (
    <div className={`
      ${glassStyles.card} rounded-2xl p-4
      flex items-center justify-between
      animate-in slide-in-from-bottom-2 duration-200
    `}>
      <div className="flex items-center gap-4">
        <span className="text-sm text-white">
          <span className="font-semibold text-teal-400">{selectedCount}</span> selected
        </span>
        <button
          onClick={onSelectAll}
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Select all
        </button>
        <button
          onClick={onDeselectAll}
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Deselect all
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onMove}
          className={`
            px-4 py-2 rounded-xl text-sm
            bg-white/5 border border-white/10
            text-white hover:bg-white/10
            flex items-center gap-2 transition-colors
          `}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Move
        </button>
        <button
          onClick={onMarkDraft}
          className={`
            px-4 py-2 rounded-xl text-sm
            bg-yellow-500/10 border border-yellow-500/30
            text-yellow-400 hover:bg-yellow-500/20
            flex items-center gap-2 transition-colors
          `}
        >
          Mark Draft
        </button>
        <button
          onClick={onMarkPublished}
          className={`
            px-4 py-2 rounded-xl text-sm
            bg-green-500/10 border border-green-500/30
            text-green-400 hover:bg-green-500/20
            flex items-center gap-2 transition-colors
          `}
        >
          Mark Published
        </button>
        <button
          onClick={onDelete}
          className={`
            px-4 py-2 rounded-xl text-sm
            bg-red-500/10 border border-red-500/30
            text-red-400 hover:bg-red-500/20
            flex items-center gap-2 transition-colors
          `}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className={`${glassStyles.card} rounded-3xl p-16 text-center`}>
      <div className={`
        w-20 h-20 mx-auto mb-6 rounded-2xl
        bg-gradient-to-br from-sky-500/20 to-teal-500/20
        ${glassStyles.neumorphicInset}
        flex items-center justify-center
      `}>
        <svg className="w-10 h-10 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 mb-6 max-w-sm mx-auto">{description}</p>
      <button className={`
        px-8 py-3 rounded-2xl
        bg-gradient-to-r from-sky-500 to-teal-500
        text-white font-medium
        shadow-lg shadow-teal-500/25
        hover:shadow-xl hover:shadow-teal-500/30
        hover:-translate-y-0.5
        transition-all duration-300
      `}>
        Create your first design
      </button>
    </div>
  );
}

// Main ProjectsView Component
export function ProjectsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('updatedAt');
  const [statusFilter, setStatusFilter] = useState('all');

  const isSelectionMode = selectedProjectIds.length > 0;

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = [...sampleProjects];

    // Filter by folder/status
    if (selectedFolderId === 'drafts') {
      filtered = filtered.filter(p => p.status === 'draft');
    } else if (selectedFolderId === 'published') {
      filtered = filtered.filter(p => p.status === 'published');
    } else if (selectedFolderId && selectedFolderId !== 'all') {
      const folder = sampleFolders.find(f => f.id === selectedFolderId);
      if (folder) {
        filtered = filtered.filter(p => folder.projectIds.includes(p.id));
      }
    }

    // Filter by status dropdown
    if (statusFilter === 'draft') {
      filtered = filtered.filter(p => p.status === 'draft');
    } else if (statusFilter === 'published') {
      filtered = filtered.filter(p => p.status === 'published');
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'platform') {
        return a.platform.localeCompare(b.platform);
      } else {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return filtered;
  }, [searchQuery, selectedFolderId, statusFilter, sortBy]);

  const projectCounts = {
    all: sampleProjects.length,
    drafts: sampleProjects.filter(p => p.status === 'draft').length,
    published: sampleProjects.filter(p => p.status === 'published').length,
  };

  const handleProjectSelect = (id: string) => {
    setSelectedProjectIds(prev =>
      prev.includes(id)
        ? prev.filter(pid => pid !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedProjectIds(filteredProjects.map(p => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedProjectIds([]);
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary teal orb - top right */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
        {/* Secondary sky orb - bottom left */}
        <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] bg-gradient-to-tr from-sky-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl animate-pulse delay-700" />
        {/* Accent orb - center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/5 via-teal-500/5 to-sky-500/5 rounded-full blur-3xl" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:50px_50px]"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 font-['Space_Grotesk']">
                Projects
              </h1>
              <p className="text-zinc-400 mt-1">
                {projectCounts.all} designs in your library
              </p>
            </div>

            {/* Share Coming Soon Badge */}
            <div className={`
              ${glassStyles.card} rounded-xl px-4 py-2
              flex items-center gap-2
            `}>
              <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="text-sm text-zinc-500">Share</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 font-medium">
                Q1 2026
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className={`${glassStyles.card} rounded-2xl p-4 mb-6`}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/50 focus:shadow-[0_0_20px_rgba(20,184,166,0.15)] transition-all duration-300"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="all" className="bg-zinc-900">All Status</option>
                <option value="draft" className="bg-zinc-900">Drafts</option>
                <option value="published" className="bg-zinc-900">Published</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="updatedAt" className="bg-zinc-900">Date Updated</option>
                <option value="createdAt" className="bg-zinc-900">Date Created</option>
                <option value="name" className="bg-zinc-900">Name</option>
                <option value="platform" className="bg-zinc-900">Platform</option>
              </select>

              {/* View Toggle */}
              <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-teal-500/20 text-teal-400' : 'text-zinc-400 hover:text-white'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-teal-500/20 text-teal-400' : 'text-zinc-400 hover:text-white'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FolderSidebar
              folders={sampleFolders}
              selectedFolderId={selectedFolderId}
              onFolderSelect={setSelectedFolderId}
              projectCounts={projectCounts}
            />
          </div>

          {/* Projects Grid */}
          <div className="lg:col-span-3 space-y-6">
            {/* Bulk Action Toolbar */}
            {isSelectionMode && (
              <BulkActionToolbar
                selectedCount={selectedProjectIds.length}
                onDelete={() => console.log('Delete:', selectedProjectIds)}
                onMove={() => console.log('Move:', selectedProjectIds)}
                onMarkDraft={() => console.log('Mark draft:', selectedProjectIds)}
                onMarkPublished={() => console.log('Mark published:', selectedProjectIds)}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
              />
            )}

            {filteredProjects.length > 0 ? (
              <div className={`
                grid gap-5
                ${viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-1'}
              `}>
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isSelected={selectedProjectIds.includes(project.id)}
                    isSelectionMode={isSelectionMode}
                    onSelect={handleProjectSelect}
                    onClick={(id) => console.log('Open project:', id)}
                    onDelete={(id) => console.log('Delete:', id)}
                    onDuplicate={(id) => console.log('Duplicate:', id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={searchQuery ? 'No projects found' : 'No projects yet'}
                description={searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Create your first design by selecting a platform from the dashboard'}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <button className={`
        md:hidden fixed bottom-20 right-4 w-14 h-14
        bg-gradient-to-r from-sky-500 to-teal-500
        rounded-full
        shadow-lg shadow-teal-500/25
        flex items-center justify-center text-white
        hover:shadow-xl hover:shadow-teal-500/30
        transition-all
      `}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}

export default ProjectsView;
