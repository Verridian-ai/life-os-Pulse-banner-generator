import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import Header from './Header';

describe('Header', () => {
  const defaultProps = {
    onRefresh: vi.fn(),
    isRefreshLoading: false,
    onBackToDashboard: vi.fn(),
    activePlatform: 'linkedin' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Logo and Branding', () => {
    it('renders logo when not in studio mode', () => {
      render(<Header />);

      const logo = screen.getByAltText('Life OS Logo');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/assets/logo.svg');
    });

    it('hides logo when in studio mode (onBackToDashboard provided)', () => {
      render(<Header {...defaultProps} />);

      expect(screen.queryByAltText('Life OS Logo')).not.toBeInTheDocument();
    });
  });

  describe('Back to Dashboard Button', () => {
    it('renders back button when onBackToDashboard is provided', () => {
      render(<Header {...defaultProps} />);

      const backButton = screen.getByLabelText('Back to dashboard');
      expect(backButton).toBeInTheDocument();
    });

    it('does not render back button when onBackToDashboard is not provided', () => {
      render(<Header onRefresh={defaultProps.onRefresh} />);

      expect(screen.queryByLabelText('Back to dashboard')).not.toBeInTheDocument();
    });

    it('calls onBackToDashboard when back button is clicked', () => {
      const onBackToDashboard = vi.fn();
      render(<Header {...defaultProps} onBackToDashboard={onBackToDashboard} />);

      const backButton = screen.getByLabelText('Back to dashboard');
      fireEvent.click(backButton);

      expect(onBackToDashboard).toHaveBeenCalledTimes(1);
    });

    it('has proper touch target size (44x44px minimum)', () => {
      render(<Header {...defaultProps} />);

      const backButton = screen.getByLabelText('Back to dashboard');
      expect(backButton).toHaveClass('min-w-[44px]', 'min-h-[44px]');
    });
  });

  describe('Platform Indicator', () => {
    it('renders platform indicator for LinkedIn', () => {
      render(<Header {...defaultProps} activePlatform="linkedin" />);

      expect(screen.getByText('LinkedIn Studio')).toBeInTheDocument();
    });

    it('renders platform indicator for YouTube', () => {
      render(<Header {...defaultProps} activePlatform="youtube" />);

      expect(screen.getByText('YouTube Studio')).toBeInTheDocument();
    });

    it('renders platform indicator for Instagram', () => {
      render(<Header {...defaultProps} activePlatform="instagram" />);

      expect(screen.getByText('Instagram Studio')).toBeInTheDocument();
    });

    it('renders platform indicator for Facebook', () => {
      render(<Header {...defaultProps} activePlatform="facebook" />);

      expect(screen.getByText('Facebook Studio')).toBeInTheDocument();
    });

    it('renders platform indicator for TikTok', () => {
      render(<Header {...defaultProps} activePlatform="tiktok" />);

      expect(screen.getByText('TikTok Studio')).toBeInTheDocument();
    });

    it('renders platform indicator for X', () => {
      render(<Header {...defaultProps} activePlatform="x" />);

      expect(screen.getByText('X Studio')).toBeInTheDocument();
    });

    it('does not render platform indicator when activePlatform is not provided', () => {
      render(<Header onRefresh={defaultProps.onRefresh} />);

      expect(screen.queryByText(/Studio$/)).not.toBeInTheDocument();
    });
  });

  describe('Refresh Button', () => {
    it('renders refresh button when onRefresh is provided', () => {
      render(<Header {...defaultProps} />);

      const refreshButton = screen.getByLabelText('Refresh');
      expect(refreshButton).toBeInTheDocument();
    });

    it('does not render refresh button when onRefresh is not provided', () => {
      render(<Header onBackToDashboard={defaultProps.onBackToDashboard} />);

      expect(screen.queryByLabelText('Refresh')).not.toBeInTheDocument();
    });

    it('calls onRefresh when refresh button is clicked', () => {
      const onRefresh = vi.fn();
      render(<Header {...defaultProps} onRefresh={onRefresh} />);

      const refreshButton = screen.getByLabelText('Refresh');
      fireEvent.click(refreshButton);

      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    it('shows loading state when isRefreshLoading is true', () => {
      render(<Header {...defaultProps} isRefreshLoading={true} />);

      const refreshButton = screen.getByLabelText('Refreshing...');
      expect(refreshButton).toBeDisabled();
    });

    it('has proper touch target size (44x44px minimum)', () => {
      render(<Header {...defaultProps} />);

      const refreshButton = screen.getByLabelText('Refresh');
      expect(refreshButton).toHaveClass('min-w-[44px]', 'min-h-[44px]');
    });
  });

  describe('Styling and Layout', () => {
    it('has sticky positioning', () => {
      const { container } = render(<Header />);

      const header = container.querySelector('header');
      expect(header).toHaveClass('sticky', 'top-0');
    });

    it('has proper z-index for stacking', () => {
      const { container } = render(<Header />);

      const header = container.querySelector('header');
      expect(header).toHaveClass('z-50');
    });

    it('has backdrop blur effect', () => {
      const { container } = render(<Header />);

      const header = container.querySelector('header');
      expect(header).toHaveClass('backdrop-blur-xl');
    });
  });

  describe('Accessibility', () => {
    it('uses semantic header element', () => {
      const { container } = render(<Header />);

      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
    });

    it('provides accessible labels for buttons', () => {
      render(<Header {...defaultProps} />);

      expect(screen.getByLabelText('Back to dashboard')).toBeInTheDocument();
      expect(screen.getByLabelText('Refresh')).toBeInTheDocument();
    });

    it('uses type="button" for all buttons', () => {
      render(<Header {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });
});
