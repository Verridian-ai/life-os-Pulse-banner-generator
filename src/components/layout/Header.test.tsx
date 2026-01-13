import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import Header from './Header';
import { Tab } from '../../constants';

const mockAuthContext = {
  isAuthenticated: true,
  user: {
    id: 'test-user',
    email: 'test@example.com',
    full_name: 'Test User',
  },
  authUser: null,
  signOut: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
  isLoading: false,
  error: null,
};

// Mock useAuth hook
vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: () => mockAuthContext,
  };
});

describe('Header - Keyboard Navigation', () => {
  const mockProps = {
    activeTab: Tab.STUDIO,
    setActiveTab: vi.fn(),
    onOpenSettings: vi.fn(),
    onOpenAuth: vi.fn(),
    onOpenInstructions: vi.fn(),
    isVoiceActive: false,
    voiceConnectionState: 'disconnected' as const,
    onToggleVoice: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens dropdown menu when Enter is pressed on profile button', () => {
    render(<Header {...mockProps} />);

    const profileButtons = screen.getAllByLabelText('User profile menu');
    const profileButton = profileButtons[1]; // Use desktop button

    // Menu should not be visible initially
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    // Press Enter on profile button
    fireEvent.keyDown(profileButton, { key: 'Enter', code: 'Enter' });

    // Menu should now be visible
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('opens dropdown menu when Space is pressed on profile button', () => {
    render(<Header {...mockProps} />);

    const profileButtons = screen.getAllByLabelText('User profile menu');
    const profileButton = profileButtons[1]; // Use desktop button

    // Press Space on profile button
    fireEvent.keyDown(profileButton, { key: ' ', code: 'Space' });

    // Menu should be visible
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('closes dropdown menu when Escape is pressed', () => {
    render(<Header {...mockProps} />);

    const profileButtons = screen.getAllByLabelText('User profile menu');
    const profileButton = profileButtons[1]; // Use desktop button

    // Open menu
    fireEvent.click(profileButton);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    // Press Escape on a menu item
    const menuItems = screen.getAllByRole('menuitem');
    fireEvent.keyDown(menuItems[0], { key: 'Escape', code: 'Escape' });

    // Menu should be closed
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('navigates menu items with arrow keys', async () => {
    render(<Header {...mockProps} />);

    const profileButtons = screen.getAllByLabelText('User profile menu');
    const profileButton = profileButtons[1]; // Use desktop button

    // Open menu via keyboard (sets focusedIndex to 0)
    fireEvent.keyDown(profileButton, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(2);

      // First item should be focused when opened via keyboard
      expect(menuItems[0]).toHaveAttribute('tabIndex', '0');
      expect(menuItems[1]).toHaveAttribute('tabIndex', '-1');
    });

    // Press ArrowDown
    const menuItems = screen.getAllByRole('menuitem');
    fireEvent.keyDown(menuItems[0], { key: 'ArrowDown', code: 'ArrowDown' });

    // Second item should now be focused
    await waitFor(() => {
      expect(menuItems[0]).toHaveAttribute('tabIndex', '-1');
      expect(menuItems[1]).toHaveAttribute('tabIndex', '0');
    });
  });

  it('has proper ARIA attributes on profile button', () => {
    render(<Header {...mockProps} />);

    const profileButtons = screen.getAllByLabelText('User profile menu');
    const profileButton = profileButtons[1]; // Use desktop button

    // Check ARIA attributes when closed
    expect(profileButton).toHaveAttribute('aria-haspopup', 'menu');
    expect(profileButton).toHaveAttribute('aria-expanded', 'false');

    // Open menu
    fireEvent.click(profileButton);

    // Check ARIA attributes when open
    expect(profileButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('has proper ARIA attributes on menu and menu items', () => {
    render(<Header {...mockProps} />);

    const profileButtons = screen.getAllByLabelText('User profile menu');
    const profileButton = profileButtons[1]; // Use desktop button
    fireEvent.click(profileButton);

    const menu = screen.getByRole('menu');
    expect(menu).toHaveAttribute('aria-label', 'User profile menu');

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(2);

    menuItems.forEach((item) => {
      expect(item).toHaveAttribute('role', 'menuitem');
      expect(item).toHaveAttribute('tabIndex');
    });
  });

  it('calls onOpenSettings when Enter is pressed on Settings menu item', async () => {
    render(<Header {...mockProps} />);

    const profileButtons = screen.getAllByLabelText('User profile menu');
    const profileButton = profileButtons[1]; // Use desktop button

    // Open menu via keyboard to set focusedIndex to 0
    fireEvent.keyDown(profileButton, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    const settingsItem = screen.getByText('Settings').closest('button');
    expect(settingsItem).toBeInTheDocument();

    // Press Enter on Settings item (focusedIndex is 0 from keyboard open)
    fireEvent.keyDown(settingsItem!, { key: 'Enter', code: 'Enter' });

    expect(mockProps.onOpenSettings).toHaveBeenCalled();
  });

  it('navigates to first item with Home key', async () => {
    render(<Header {...mockProps} />);

    const profileButtons = screen.getAllByLabelText('User profile menu');
    const profileButton = profileButtons[1]; // Use desktop button

    // Open menu via keyboard to set focusedIndex
    fireEvent.keyDown(profileButton, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    const menuItems = screen.getAllByRole('menuitem');

    // Press ArrowDown to move to second item
    fireEvent.keyDown(menuItems[0], { key: 'ArrowDown', code: 'ArrowDown' });

    // Press Home to go back to first item
    fireEvent.keyDown(menuItems[1], { key: 'Home', code: 'Home' });

    await waitFor(() => {
      expect(menuItems[0]).toHaveAttribute('tabIndex', '0');
    });
  });

  it('navigates to last item with End key', async () => {
    render(<Header {...mockProps} />);

    const profileButtons = screen.getAllByLabelText('User profile menu');
    const profileButton = profileButtons[1]; // Use desktop button

    // Open menu via keyboard to set focusedIndex
    fireEvent.keyDown(profileButton, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    const menuItems = screen.getAllByRole('menuitem');

    // Press End to go to last item
    fireEvent.keyDown(menuItems[0], { key: 'End', code: 'End' });

    await waitFor(() => {
      expect(menuItems[1]).toHaveAttribute('tabIndex', '0');
    });
  });

  it('has visible focus indicators on menu items', async () => {
    render(<Header {...mockProps} />);

    const profileButtons = screen.getAllByLabelText('User profile menu');
    const profileButton = profileButtons[1]; // Use desktop button

    // Open menu via keyboard to set focusedIndex to 0
    fireEvent.keyDown(profileButton, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    const menuItems = screen.getAllByRole('menuitem');

    // First item should have focus indicator (ring-2 ring-blue-500/50) when focusedIndex is 0
    expect(menuItems[0]).toHaveClass('ring-2', 'ring-blue-500/50');
  });
});

describe('Header - Voice Status Label', () => {
  const mockProps = {
    activeTab: Tab.STUDIO,
    setActiveTab: vi.fn(),
    onOpenSettings: vi.fn(),
    onOpenAuth: vi.fn(),
    onOpenInstructions: vi.fn(),
    isVoiceActive: false,
    voiceConnectionState: 'disconnected' as const,
    onToggleVoice: vi.fn(),
  };

  it('shows "Connecting..." label when state is connecting', () => {
    render(<Header {...mockProps} voiceConnectionState="connecting" />);
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('shows "Connected" label when state is connected', () => {
    render(<Header {...mockProps} voiceConnectionState="connected" />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('shows "Failed" label when state is error', () => {
    render(<Header {...mockProps} voiceConnectionState="error" />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('shows "Closing..." label when state is disconnecting', () => {
    render(<Header {...mockProps} voiceConnectionState="disconnecting" />);
    expect(screen.getByText('Closing...')).toBeInTheDocument();
  });

  it('does not show label when disconnected', () => {
    render(<Header {...mockProps} voiceConnectionState="disconnected" />);
    // The text might be in the DOM but hidden/empty depending on implementation.
    // In Header.tsx: ternary returns '' string if not matched, OR opacity-0 class.
    // The ternary: voiceConnectionState === 'connecting' ? 'Connecting...' ... : ''
    // So if disconnected, it renders empty string.

    // We can check that none of the status texts are present
    expect(screen.queryByText('Connecting...')).not.toBeInTheDocument();
    expect(screen.queryByText('Connected')).not.toBeInTheDocument();
    expect(screen.queryByText('Failed')).not.toBeInTheDocument();
    expect(screen.queryByText('Closing...')).not.toBeInTheDocument();
  });
});
