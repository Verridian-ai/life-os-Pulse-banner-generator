# Templates Section — Test Instructions

Write tests for the templates browsing experience.

## Core User Flows

### 1. Template Browsing
- User sees template grid on Templates page
- Templates display preview image, title, and industry tag
- Grid is responsive (2 cols mobile, 3 cols tablet, 4+ cols desktop)

### 2. Search & Filter
- User can search templates by name
- User can filter by industry (Tech, Finance, Education, etc.)
- Clear filters button resets all filters
- Results count updates when filtering

### 3. Template Selection
- Clicking a template card triggers selection callback
- Selected template data is passed to parent component
- Visual feedback on hover/focus states

## Empty States

- **No templates match** — Show "No templates found" message with clear filters button
- **Loading** — Show skeleton cards during load

## Edge Cases

- Handle templates with missing preview images (fallback)
- Handle very long template titles (truncation)
- Handle templates with no industry tag
- Filter persistence across navigation

## Accessibility

- Template cards are keyboard navigable
- Focus states are visible
- Screen reader announces template names
- Industry filter dropdown is accessible
