/**
 * Seed Platform Agent Knowledge Base
 *
 * This script populates the Cognee knowledge base with platform-specific
 * expertise documents for each social media specialist agent.
 *
 * Usage: npx tsx server/src/scripts/seedPlatformAgentKnowledge.ts
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

const PLATFORM_AGENT_KNOWLEDGE: AgentKnowledge[] = [
  {
    agentId: 'linkedin-specialist',
    name: 'LinkedIn Specialist',
    documents: [
      {
        title: 'LinkedIn Algorithm Guide 2026',
        content: `# LinkedIn Algorithm Guide 2026

## Critical Signals (Ranked by Impact)
1. **Comments** - #1 factor for reach. Each comment = 4x the weight of a like
2. **Dwell Time** - How long users pause on your content
3. **First 60 Minutes** - Initial engagement determines total reach
4. **Creator Authenticity** - Personal stories outperform corporate content

## Content Performance Metrics
- Carousels: 3.03x higher engagement than single images
- Native video: 5x more reach than external links
- Text-only posts: 2.5x higher comment rate
- External links: 60% reach reduction

## Optimal Posting Times (2026 Data)
- Best days: Tuesday, Wednesday, Thursday
- Peak hours: 7-8 AM, 12-1 PM (lunch), 5-6 PM (commute)
- Worst times: Weekends, after 8 PM

## Hook Strategies
- First 210 characters appear before "...see more"
- Start with a bold statement or question
- Use line breaks to create visual breathing room
- Avoid starting with "I" (perceived as self-centered)

## Hashtag Strategy
- 3-5 hashtags optimal
- Mix: 1 broad, 2 medium, 2 niche
- Place at end or in first comment
- Avoid banned/spammy hashtags`
      },
      {
        title: 'LinkedIn Banner Design Guidelines',
        content: `# LinkedIn Banner Design Guidelines

## Dimensions & Safe Zones
- Banner size: 1584 x 396 pixels (4:1 ratio)
- Profile safe zone: 524px diameter circle at bottom-left
- Exact position: 19.31% from left edge, overlapping bottom
- Mobile crop: Center 60% always visible

## Professional Design Principles
1. **Corporate Trust Colors**: Navy (#0A66C2), Teal, Gold accents
2. **Clean Typography**: Sans-serif, high contrast
3. **Value Proposition**: Clear headline stating your impact
4. **Credibility Signals**: Certifications, company logos (with permission)

## What Works
- Gradient backgrounds with professional overlay
- Subtle patterns (geometric, topographic)
- Single strong focal point
- Contact info or CTA on right side

## What to Avoid
- Busy backgrounds that compete with text
- Text in profile overlap zone
- Low-resolution or pixelated images
- Cluttered designs with too many elements
- Faces cut off by profile picture overlap`
      },
      {
        title: 'LinkedIn Thought Leadership Strategy',
        content: `# LinkedIn Thought Leadership

## Content Pillars
1. **Industry Insights**: Data-backed observations
2. **Behind the Scenes**: Process and journey content
3. **Contrarian Takes**: Challenge industry assumptions
4. **Educational Value**: Teach something actionable

## Engagement Tactics
- Ask questions at end of posts
- Share failures, not just wins
- Tag relevant people (sparingly)
- Reply to every comment within first hour

## Building Authority
- Consistent posting schedule (3-5x/week)
- Long-form articles for depth
- Newsletters for owned audience
- Comment on others' posts strategically

## Content Mix
- 40% Original insights
- 30% Curated industry news with commentary
- 20% Personal stories and lessons
- 10% Promotional/company content`
      }
    ]
  },
  {
    agentId: 'youtube-specialist',
    name: 'YouTube Specialist',
    documents: [
      {
        title: 'YouTube Thumbnail Optimization 2026',
        content: `# YouTube Thumbnail Optimization

## Dimensions
- Standard: 1280 x 720 pixels (16:9)
- Minimum: 640 x 360 pixels
- Maximum file size: 2MB
- Formats: JPG, PNG, GIF, BMP

## High-CTR Thumbnail Elements
1. **Faces with Emotion**: 38% higher CTR
2. **Bold Text**: 3-4 words maximum
3. **High Contrast**: Colors that pop against YouTube's UI
4. **Curiosity Gap**: Show part of the story

## Color Psychology for YouTube
- Yellow/Orange: Energy, excitement (highest CTR)
- Blue: Trust, calm (educational content)
- Red: Urgency, passion (drama, news)
- Green: Growth, money (finance, success)

## Text Guidelines
- Font: Bold sans-serif (Impact, Bebas Neue, Oswald)
- Size: Readable at 100px width (mobile preview)
- Stroke/shadow: Ensure visibility on any background
- Position: Bottom 1/3 or top 1/3 (avoid center)

## Common Mistakes
- Clickbait that doesn't match content
- Too much text (more than 4 words)
- Generic stock imagery
- Low contrast/hard to read
- Thumbnail doesn't tell a story`
      },
      {
        title: 'YouTube Shorts Optimization',
        content: `# YouTube Shorts Strategy

## Dimensions
- Aspect ratio: 9:16 (vertical)
- Resolution: 1080 x 1920 pixels
- Max duration: 60 seconds
- Minimum: 15 seconds for monetization

## Algorithm Signals
1. **Watch Time %**: Complete views > partial
2. **Loop Rate**: How often users rewatch
3. **Engagement**: Likes, comments, shares
4. **Subscriber Conversion**: New subs from Shorts

## Hook Strategies (First 1-3 Seconds)
- Start with action, no intro
- Use pattern interrupts (unexpected visuals)
- Text hooks: "Wait for it" is dead - be specific
- Sound design: Trending audio boosts reach

## Content Structure
- 0-1s: Hook
- 1-10s: Setup
- 10-40s: Payoff/Value
- 40-60s: Callback or twist

## Cross-Platform Tips
- Repurpose TikToks (remove watermarks)
- Vertical clips from long-form content
- Shorts can drive traffic to main channel`
      },
      {
        title: 'YouTube Channel Branding',
        content: `# YouTube Channel Branding

## Banner Dimensions
- Desktop: 2560 x 1440 pixels
- Tablet: 1855 x 423 visible
- Mobile: 1546 x 423 visible
- TV: Full 2560 x 1440 visible

## Safe Area for Text
- Center safe zone: 1546 x 423 pixels
- Keep all text and logos in this area
- Upload schedule on right side is common

## Branding Elements
- Consistent color palette (2-3 colors)
- Logo/avatar that works at small sizes
- Tagline or value proposition
- Upload schedule (optional but helpful)

## Profile Picture
- 800 x 800 pixels recommended
- Displays as circle
- Should be recognizable at 40px

## Brand Consistency
- Match thumbnail style across videos
- Consistent intro/outro sequence
- Recognizable fonts and colors
- Cohesive description templates`
      }
    ]
  },
  {
    agentId: 'instagram-specialist',
    name: 'Instagram Specialist',
    documents: [
      {
        title: 'Instagram Algorithm 2026',
        content: `# Instagram Algorithm 2026

## Ranking Signals
1. **Interest**: How likely you'll engage (based on history)
2. **Recency**: Fresh content prioritized
3. **Relationship**: Close connections shown first
4. **Frequency**: How often you open the app
5. **Following Count**: More following = more competition

## Reels vs Feed
- Reels: 5x reach of static posts
- Reels: 40% of time spent on Instagram
- Algorithm: Separate ranking for Reels
- Feed: Better for followers, Reels for discovery

## Engagement Windows
- First 30 minutes critical
- Post when audience is online
- Engage before and after posting
- Reply to comments within 1 hour

## Content Buckets
- 40% Reels (discovery)
- 30% Carousels (saves/shares)
- 20% Stories (connection)
- 10% Single images (brand moments)`
      },
      {
        title: 'Instagram Visual Design Standards',
        content: `# Instagram Visual Standards

## Image Dimensions
- Square: 1080 x 1080 (1:1)
- Portrait: 1080 x 1350 (4:5) - BEST for feed
- Landscape: 1080 x 566 (1.91:1)
- Stories/Reels: 1080 x 1920 (9:16)

## Carousel Best Practices
- 10 slides maximum (use all 10)
- First slide: Hook
- Last slide: CTA
- Consistent design language
- Swipe indicators help engagement

## Feed Aesthetic Tips
- Choose 2-3 consistent filters/presets
- Maintain color palette consistency
- Grid planning (row-by-row themes)
- Balance content types visually

## Story Design
- Keep text large (thumb zone)
- Use polls, questions, sliders
- Behind-the-scenes content
- Vertical format optimized

## Reels Thumbnail
- Same dimensions as cover
- Can upload custom thumbnail
- Should work in 9:16 AND 1:1 crop
- Clear subject even at small size`
      },
      {
        title: 'Instagram Hashtag Strategy',
        content: `# Instagram Hashtag Strategy 2026

## Current Recommendations
- Use 3-5 relevant hashtags
- Place in caption (not comments)
- Mix sizes: small, medium, large
- Avoid banned hashtags

## Hashtag Categories
1. **Large (1M+)**: Brand awareness, low targeting
2. **Medium (100K-1M)**: Balanced reach
3. **Small (10K-100K)**: Niche, higher conversion
4. **Micro (<10K)**: Community building

## Research Process
- Check "Related hashtags"
- Analyze competitor hashtags
- Track performance in Insights
- Rotate sets to avoid shadowban

## What NOT to Do
- 30 hashtags (looks spammy)
- Irrelevant trending tags
- Same hashtags every post
- Banned or flagged hashtags
- Hashtags in first comment (less effective now)`
      }
    ]
  },
  {
    agentId: 'facebook-specialist',
    name: 'Facebook Specialist',
    documents: [
      {
        title: 'Facebook Algorithm 2026',
        content: `# Facebook Algorithm 2026

## Ranking Priorities
1. **Meaningful Interactions**: Comments > reactions
2. **Friends & Family**: Personal connections first
3. **Informative Content**: News, educational value
4. **Video Content**: Especially Reels and Live

## Feed Preferences
- Groups content heavily promoted
- Reels tab competing with TikTok
- Live video gets notification push
- Stories for daily engagement

## Engagement Signals
- Share to Stories: High signal
- Save for later: Growing importance
- Comments with replies: Best signal
- Reactions: Varies by type (Love > Like)

## Content Types by Reach
1. Live Video (6x organic reach)
2. Reels (4x engagement)
3. Native Video (3x reach vs links)
4. Groups posts (2x visibility)
5. Link posts (lowest reach)

## Best Posting Times
- Peak: 1-4 PM weekdays
- Second peak: 8-9 PM evenings
- Avoid: Early mornings, late nights`
      },
      {
        title: 'Facebook Page Optimization',
        content: `# Facebook Page Optimization

## Cover Photo Dimensions
- Desktop: 820 x 312 pixels
- Mobile: 640 x 360 pixels
- Safe area: Center-weighted content
- Profile picture overlap: Bottom-left

## Profile Picture
- Displays at 170 x 170 pixels (desktop)
- Displays at 128 x 128 pixels (mobile)
- Upload at 360 x 360 minimum
- Circular crop applied

## Page Features to Utilize
- Call-to-Action button (Book Now, Shop, etc.)
- Services section for businesses
- Shop integration if applicable
- Reviews/Recommendations enabled

## Content Strategy
- Mix of content types
- Native video preferred
- Groups linked to Page
- Events for community building

## Engagement Tactics
- Ask questions in posts
- Use Facebook-native polls
- Reply to every comment
- Go Live regularly`
      },
      {
        title: 'Facebook Groups & Community',
        content: `# Facebook Groups Strategy

## Why Groups Matter
- 10x higher engagement than Pages
- Algorithm favors group content
- Community building opportunity
- Direct line to audience

## Group Types
- Public: Discovery, SEO
- Private: Exclusivity, value
- Hidden: VIP, paid communities

## Admin Best Practices
- Set clear rules (enforce them)
- Welcome new members personally
- Create recurring content themes
- Use announcements sparingly

## Engagement Tactics
- Prompt discussions, not broadcasts
- Create member spotlight posts
- Use polls and questions
- Live Q&As build community

## Growth Strategies
- Cross-promote with Page
- Invite email list members
- Partnerships with other admins
- Valuable free content draws members`
      }
    ]
  },
  {
    agentId: 'tiktok-specialist',
    name: 'TikTok Specialist',
    documents: [
      {
        title: 'TikTok Algorithm Deep Dive',
        content: `# TikTok Algorithm 2026

## How For You Page Works
1. **Initial Push**: 300-500 views to test
2. **Watch Time**: Primary signal
3. **Completion Rate**: Full watches = boost
4. **Engagement**: Shares > Comments > Likes
5. **Loop Rate**: Rewatches multiply reach

## Video Performance Signals
- Watch through rate (most important)
- Replay rate
- Profile visits from video
- Follows from video
- Shares (highest weight)

## Timing
- Peak hours: 7-9 AM, 12-3 PM, 7-11 PM
- Days: Tuesday-Thursday best
- Post 1-4 times per day optimal
- Consistency > frequency

## Content Velocity
- First 1-3 hours critical
- Initial batch determines trajectory
- Viral potential assessed in 48 hours
- Old videos can resurface anytime`
      },
      {
        title: 'TikTok Creative Best Practices',
        content: `# TikTok Creative Guide

## Video Specifications
- Aspect ratio: 9:16 (vertical)
- Resolution: 1080 x 1920 pixels
- Length: 15-60 seconds optimal
- Max length: 10 minutes
- Format: MP4, MOV

## Hook Framework (First 1-3 Seconds)
- Pattern interrupt (unexpected visual)
- Bold statement or question
- "Here's the secret..." structures
- Numbers and lists ("3 ways to...")

## Sound Strategy
- Trending sounds boost reach
- Original sounds for brand recognition
- Audio is 50%+ of content
- Music + voiceover combination

## Editing Style
- Quick cuts (0.5-2 second clips)
- On-screen text for silent viewing
- B-roll transitions
- Trending transitions and effects

## Captions
- Hook in first line
- 150 characters visible before "..."
- 3-5 hashtags optimal
- Mix trending + niche tags`
      },
      {
        title: 'TikTok Trends & Virality',
        content: `# TikTok Trends & Going Viral

## Trend Lifecycle
1. **Emerging** (24-48 hours): Best time to join
2. **Peak** (3-7 days): High competition
3. **Saturated** (1-2 weeks): Too late
4. **Nostalgic** (months later): Comeback potential

## Finding Trends
- For You Page observation
- TikTok Creative Center
- Trending sounds in-app
- Competitor monitoring
- Cross-platform trend tracking

## Niche-ifying Trends
- Take any trend, apply to your topic
- "As a [profession], this trend means..."
- Educational spin on entertainment trends
- Industry-specific versions

## Viral Triggers
- Controversy (carefully)
- Relatability
- Tutorials/How-tos
- Behind the scenes
- Duets and Stitches
- Unexpected outcomes

## Content Pillars for Growth
- 1 pillar: Educational value
- 1 pillar: Entertainment/personality
- 1 pillar: Trending/timely
- Rotate to keep feed fresh`
      }
    ]
  },
  {
    agentId: 'x-specialist',
    name: 'X (Twitter) Specialist',
    documents: [
      {
        title: 'X Algorithm 2026',
        content: `# X (Twitter) Algorithm 2026

## Feed Types
- For You: Algorithmic, personalized
- Following: Chronological (opt-in)
- Algorithm now default for all users

## Ranking Signals
1. **Engagement velocity**: Fast replies boost
2. **X Premium status**: Verified = more reach
3. **Recency**: Still matters (within reason)
4. **Follower interaction history**
5. **Media attachment**: Images/video boost

## Content Performance
- Threads: 2-3x engagement of single tweets
- Images: 150% more retweets
- Video: Native video prioritized
- Polls: High engagement driver
- Links: Reach penalty (put in replies)

## Engagement Windows
- First 30-60 minutes critical
- Peak times: 8-10 AM, 12-1 PM, 5-6 PM
- Engagement before posting helps
- Reply to your own tweet with thread

## X Premium Benefits
- Higher visibility in algorithm
- Edit tweet functionality
- Longer posts (25,000 chars)
- Revenue sharing eligible`
      },
      {
        title: 'X Profile Optimization',
        content: `# X Profile Optimization

## Header Image
- Dimensions: 1500 x 500 pixels
- Safe zones: Corners may be cropped
- Keep text centered
- Avoid bottom-left (profile overlap)

## Profile Picture
- Displays: 400 x 400 pixels
- Circular crop
- High contrast for visibility
- Recognizable at small sizes

## Bio Optimization
- 160 character limit
- Clear value proposition
- Keywords for discovery
- Call-to-action or link
- Emojis for visual breaks

## Pinned Tweet
- First impression for profile visitors
- Best performing tweet OR
- Key value proposition tweet OR
- Thread introduction

## Highlights
- Curate best content
- Organize by topic
- Update regularly
- Feature threads and spaces`
      },
      {
        title: 'X Threads & Engagement',
        content: `# X Threads & Engagement Strategy

## Thread Structure
1. **Hook**: First tweet = make or break
2. **Promise**: What they'll learn
3. **Value**: Deliver insights
4. **CTA**: Follow, like, retweet

## Thread Best Practices
- Number your tweets (1/10)
- Self-replies to keep thread together
- Add images/media every 3-4 tweets
- End with strong CTA

## Engagement Tactics
- Quote tweet with insights
- Reply to larger accounts thoughtfully
- Engage before and after posting
- Build genuine relationships

## Growth Strategies
- Consistent posting (3-5 tweets/day)
- Daily thread or one big weekly thread
- Engage in relevant communities
- Cross-promote other platforms

## Analytics to Track
- Profile visits
- Link clicks
- Engagement rate
- Follower growth rate
- Thread completion rate

## Content Types
- Hot takes (controversial opinions)
- Educational threads
- Industry news commentary
- Personal stories
- Curated lists/resources`
      }
    ]
  }
];

async function seedPlatformKnowledge() {
  console.log('🌱 Starting platform agent knowledge seeding...\n');

  for (const agent of PLATFORM_AGENT_KNOWLEDGE) {
    console.log(`📚 Seeding knowledge for: ${agent.name}`);

    for (const doc of agent.documents) {
      try {
        await CogneeService.addText(agent.agentId, doc.content, {
          title: doc.title,
          type: 'platform_knowledge',
          agent: agent.agentId,
          platform: agent.agentId.replace('-specialist', ''),
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

  console.log('✨ Platform agent knowledge seeding complete!');
  console.log('\n📊 Summary:');
  console.log(`   - ${PLATFORM_AGENT_KNOWLEDGE.length} platform agents seeded`);
  console.log(`   - ${PLATFORM_AGENT_KNOWLEDGE.reduce((acc, a) => acc + a.documents.length, 0)} documents added`);
}

// Run if executed directly
seedPlatformKnowledge().catch(console.error);
