# Admin Dashboard — Test Instructions

Write tests for administrative features.

## Core User Flows

### 1. View Dashboard
- Admin sees overview stats
- Charts load with data
- Recent activity displayed
- System status visible

### 2. Search Users
- Admin searches by name/email
- Results update as typed
- Pagination works
- Filters apply correctly

### 3. Manage User
- Admin opens user details
- Activity history shown
- Admin actions available
- Actions require confirmation

### 4. Monitor Agents
- Agent cards show status
- Metrics display correctly
- Toggle enable/disable
- Configuration accessible

### 5. View Logs
- Logs stream in real-time
- Filters work (level, service)
- Search finds matches
- Time range applies

### 6. Review Finance
- Revenue chart displays
- Costs breakdown shown
- Projections visible
- Export data available

## Access Control

- Non-admin users redirected
- Admin actions require auth
- Audit log records actions

## Edge Cases

- Handle large user lists (virtualization)
- Handle log volume (pagination)
- Handle agent offline status
- Handle financial data gaps
- Handle concurrent admin actions

## Accessibility

- Tables have proper headers
- Charts have text alternatives
- Actions have confirmations
- Forms have error handling
- Focus management in drawers
