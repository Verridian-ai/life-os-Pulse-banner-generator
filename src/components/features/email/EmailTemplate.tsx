import React from 'react';
import './EmailTemplate.css';

interface EmailTemplateProps {
  title?: string;
  previewText?: string;
  bodyContent: React.ReactNode;
  ctaText?: string;
  ctaLink?: string;
  footerText?: string;
}

/**
 * Life OS Pro Email Template
 * A responsive, neumorphic-inspired email template.
 */
export const EmailTemplate: React.FC<EmailTemplateProps> = ({
  title = "Update from Life OS",
  previewText,
  bodyContent,
  ctaText,
  ctaLink,
  footerText = "© 2025 Verridian AI. All rights reserved."
}) => {
  return (
    <div className="email-container">
      {previewText && (
        <div className="email-preview-text">
          {previewText}
        </div>
      )}
      
      <div className="email-card">
        {/* Header */}
        <div className="email-header">
          <h1 className="email-logo-text">LIFE OS</h1>
        </div>

        {/* content */}
        <div className="email-body">
          <h2 className="email-title">{title}</h2>
          
          <div>
            {bodyContent}
          </div>

          {ctaText && ctaLink && (
            <div className="email-button-container">
              <a href={ctaLink} className="email-button">
                {ctaText}
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="email-footer">
          <p>{footerText}</p>
          <p className="email-footer-links">
            <a href="#" className="email-footer-link">Unsubscribe</a>
            <a href="#" className="email-footer-link">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};
