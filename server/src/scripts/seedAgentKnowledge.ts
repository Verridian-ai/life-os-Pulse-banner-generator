/**
 * Seed Agent Knowledge Base
 * 
 * This script populates the Cognee knowledge base with expertise documents
 * for each specialized agent. Run this after deploying the Cognee service.
 * 
 * Usage: npx tsx server/src/scripts/seedAgentKnowledge.ts
 */

import { CogneeService } from '../services/cognee';

interface AgentKnowledge {
  agentId: string;
  name: string;
  documents: Array<{
    title: string;
    content: string;
  }>;
}

const AGENT_KNOWLEDGE: AgentKnowledge[] = [
  {
    agentId: 'benno',
    name: 'Benno - Primary Assistant',
    documents: [
      {
        title: 'LinkedIn Banner Best Practices',
        content: `# LinkedIn Banner Best Practices

## Optimal Dimensions
- LinkedIn banner size: 1584 x 396 pixels (4:1 aspect ratio)
- Safe zone: Keep important content away from edges (50px margin)
- Profile picture overlap: Bottom-left 120px is covered by profile photo

## Design Principles
1. Keep it simple and professional
2. Use high-contrast text for readability
3. Align with your personal brand
4. Include a clear call-to-action or value proposition
5. Use high-quality images (minimum 2K resolution)

## Common Mistakes to Avoid
- Cluttered designs with too many elements
- Low-resolution or pixelated images
- Text in the profile picture overlap zone
- Inconsistent branding with profile photo
- Poor color contrast making text unreadable`
      },
      {
        title: 'Getting Started Guide',
        content: `# Getting Started with Nanobanna Pro

## Quick Start Steps
1. Choose a template or start from scratch
2. Generate a background using AI prompts
3. Add text elements (headline, tagline)
4. Position elements using safe zone guides
5. Export in high resolution

## Voice Commands
Say "Hey Benno" followed by:
- "Generate a background for [industry/style]"
- "Add text saying [your message]"
- "Save my design"
- "Show me templates"

## Tips for Best Results
- Be specific in your prompts
- Describe colors, mood, and style
- Mention your industry for tailored suggestions`
      }
    ]
  },
  {
    agentId: 'art-director',
    name: 'Art Director',
    documents: [
      {
        title: 'Color Theory for Professional Banners',
        content: `# Color Theory for LinkedIn Banners

## Professional Color Palettes
- **Corporate**: Navy (#1e3a5f), White, Gold accents
- **Tech**: Deep blue (#0066cc), Cyan (#00d4ff), Dark backgrounds
- **Creative**: Bold gradients, Vibrant accents, Unique combinations
- **Finance**: Navy, Forest green, Gold, Conservative tones
- **Healthcare**: Teal, White, Soft blues, Clean and trustworthy

## Color Psychology
- Blue: Trust, professionalism, stability
- Green: Growth, health, sustainability
- Orange: Energy, creativity, enthusiasm
- Purple: Innovation, luxury, wisdom
- Black: Sophistication, authority, elegance

## Contrast Guidelines
- Minimum 4.5:1 ratio for normal text (WCAG AA)
- Minimum 7:1 ratio for enhanced accessibility (WCAG AAA)
- Use dark text on light backgrounds or vice versa
- Avoid pure black on pure white (use #1a1a1a on #f5f5f5)`
      },
      {
        title: 'Visual Composition Techniques',
        content: `# Visual Composition for Banners

## Rule of Thirds
- Divide canvas into 3x3 grid
- Place key elements at intersection points
- Creates natural visual flow

## Visual Hierarchy
1. Primary: Main headline or focal point
2. Secondary: Supporting text or imagery
3. Tertiary: Background and subtle details

## Balance Types
- Symmetrical: Formal, stable, professional
- Asymmetrical: Dynamic, modern, creative
- Radial: Centered focus, impactful

## Negative Space
- Don't fill every pixel
- White space creates breathing room
- Improves readability and focus`
      }
    ]
  },
  {
    agentId: 'copy-specialist',
    name: 'Copy Specialist',
    documents: [
      {
        title: 'Headline Writing for LinkedIn',
        content: `# Headline Writing for LinkedIn Banners

## Headline Formulas
1. **Value Proposition**: "I help [audience] achieve [result]"
2. **Expertise Statement**: "[Role] | [Specialty] | [Unique Value]"
3. **Question Hook**: "Ready to [desirable outcome]?"
4. **Social Proof**: "Trusted by [number] [clients/companies]"

## Character Limits
- Keep headlines under 50 characters for impact
- Taglines: 80-100 characters maximum
- Ensure readability at small sizes

## Power Words
- Transform, Accelerate, Unlock, Discover
- Expert, Proven, Trusted, Innovative
- Results, Growth, Success, Impact

## Typography Tips
- Use 2 fonts maximum (heading + body)
- Sans-serif for modern, professional look
- Minimum 24pt for banner headlines
- Bold for emphasis, not entire text`
      }
    ]
  },
  {
    agentId: 'tech-wizard',
    name: 'Tech Wizard',
    documents: [
      {
        title: 'Image Processing Techniques',
        content: `# Image Processing for Banners

## Upscaling
- Use AI upscaling for low-resolution images
- Target 2K-4K resolution for crisp output
- Preserve details while removing artifacts

## Background Removal
- Clean edges around subjects
- Handle hair and fine details
- Transparent PNG output for compositing

## Image Restoration
- Remove noise and compression artifacts
- Fix color balance issues
- Enhance sharpness without over-processing

## Face Enhancement
- Subtle improvements only
- Maintain natural appearance
- Focus on lighting and skin smoothing`
      }
    ]
  },
  {
    agentId: 'accessibility-expert',
    name: 'Accessibility Expert',
    documents: [
      {
        title: 'WCAG Compliance for Banners',
        content: `# Accessibility Guidelines for LinkedIn Banners

## Color Contrast (WCAG 2.1)
- AA Standard: 4.5:1 for normal text, 3:1 for large text
- AAA Standard: 7:1 for normal text, 4.5:1 for large text
- Large text: 18pt+ regular or 14pt+ bold

## Colorblind Considerations
- Don't rely on color alone to convey information
- Test with deuteranopia, protanopia, tritanopia filters
- Use patterns or labels alongside colors

## Text Readability
- Minimum 16px font size for body text
- Adequate line spacing (1.5x font size)
- Avoid all-caps for long text
- High contrast between text and background

## Visual Hierarchy
- Clear focal points guide the eye
- Consistent alignment and spacing
- Avoid flashing or animated elements`
      }
    ]
  },
  {
    agentId: 'industry-specialist',
    name: 'Industry Specialist',
    documents: [
      {
        title: 'Industry-Specific Design Guidelines',
        content: `# Industry-Specific Banner Design

## Technology
- Modern, clean aesthetics
- Blue, cyan, dark themes
- Abstract tech imagery, circuits, data visualization
- Keywords: Innovation, Digital, Future

## Finance & Banking
- Conservative, trustworthy appearance
- Navy, gold, forest green
- Subtle patterns, professional imagery
- Keywords: Trust, Security, Growth

## Healthcare
- Clean, calming designs
- Teal, white, soft blues
- Medical imagery, caring themes
- Keywords: Care, Health, Wellness

## Creative Industries
- Bold, expressive designs
- Vibrant colors, unique layouts
- Artistic elements, portfolio hints
- Keywords: Creative, Design, Innovation

## Consulting & Professional Services
- Sophisticated, authoritative
- Dark backgrounds, gold accents
- Abstract professional imagery
- Keywords: Expert, Results, Strategy`
      }
    ]
  },
  {
    agentId: 'layout-expert',
    name: 'Layout Expert',
    documents: [
      {
        title: 'LinkedIn Banner Layout Guide',
        content: `# LinkedIn Banner Layout Specifications

## Safe Zones
- Profile picture overlap: Bottom-left 120x120px
- Mobile crop: Center 60% is always visible
- Desktop full view: 1584x396px

## Grid System
- Use 12-column grid for alignment
- Maintain consistent margins (40-60px)
- Align elements to grid lines

## Element Positioning
- Primary content: Center-right area
- Avoid bottom-left quadrant (profile overlap)
- Keep text away from edges (50px minimum)

## Visual Balance
- Distribute visual weight evenly
- Use asymmetry for dynamic feel
- Anchor elements with consistent spacing

## Responsive Considerations
- Test at multiple viewport sizes
- Ensure key message visible on mobile
- Avoid small text that won't scale`
      }
    ]
  }
];

async function seedKnowledge() {
  console.log('🌱 Starting agent knowledge seeding...\n');

  for (const agent of AGENT_KNOWLEDGE) {
    console.log(`📚 Seeding knowledge for: ${agent.name}`);

    for (const doc of agent.documents) {
      try {
        await CogneeService.addText(agent.agentId, doc.content, {
          title: doc.title,
          type: 'knowledge_base',
          agent: agent.agentId,
        });
        console.log(`  ✅ Added: ${doc.title}`);
      } catch (error) {
        console.error(`  ❌ Failed: ${doc.title}`, error);
      }
    }

    // Trigger cognify to build knowledge graph
    try {
      await CogneeService.cognify(agent.agentId);
      console.log(`  🧠 Knowledge graph built for ${agent.name}\n`);
    } catch (error) {
      console.error(`  ❌ Cognify failed for ${agent.name}`, error);
    }
  }

  console.log('✨ Agent knowledge seeding complete!');
}

// Run if executed directly
seedKnowledge().catch(console.error);

