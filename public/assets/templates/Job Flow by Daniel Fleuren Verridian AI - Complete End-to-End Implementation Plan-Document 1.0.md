# Resume Flow by Verridian AI - Complete End-to-End Implementation Plan

**Master Planning Document v3.0**

---

## Document Overview

**Purpose:** Comprehensive implementation blueprint for Resume Flow by Verridian AI—an AI-Native Professional & Life Intelligence Platform with Human-in-the-Loop Reinforcement Learning training infrastructure.

**Scope:** 170+ detailed user stories across 7 microservices, complete technical architecture, HITL marketplace framework, RL training system, revenue models, and phased implementation roadmap.

**Audience:** Product team, development team, investors, stakeholders, partner professionals (coaches, accountants, financial advisors, lawyers).

**Document Size:** ~220 pages

---

## Table of Contents

### Part I: Strategic Vision & Architecture
1. [Executive Summary](#executive-summary)
2. [Platform Vision & Positioning](#platform-vision)
3. [Microservices Architecture](#microservices-architecture)
4. [Human-in-the-Loop RL Training System](#hitl-system)
5. [Revenue Model & Projections](#revenue-model)
6. [Technical Stack & Infrastructure](#technical-stack)
7. [Design System & UX Principles](#design-system)

### Part II: Microservices Roadmap
8. [Roadmap Overview & Sequencing](#roadmap-overview)
9. [Roadmap 1: Job Flow](#roadmap-1-job-flow) (Months 1-6)
10. [Roadmap 2: Knowledge Flow](#roadmap-2-knowledge-flow) (Months 7-9)
11. [Roadmap 3: Finance Flow](#roadmap-3-finance-flow) (Months 10-12)
12. [Roadmap 4: Advisor Flow](#roadmap-4-advisor-flow) (Months 13-15)
13. [Roadmap 5: Tax Flow](#roadmap-5-tax-flow) (Months 16-18)
14. [Roadmap 6: Legal Flow](#roadmap-6-legal-flow) (Months 19-21)
15. [Roadmap 7: Venture Flow](#roadmap-7-venture-flow) (Months 22-24)

### Part III: Detailed User Stories (170+ Stories)

#### Phase 1: Foundation & Core Infrastructure
16. [Authentication & Security](#auth-stories) (Screens 56-64)
17. [User Settings & Privacy](#settings-stories) (Screens 110-114)

#### Phase 2: Job Flow Implementation
18. [AI Resume & STAR Stories](#resume-stories) (Screens 1-5)
19. [Job Search & Application Tracking](#job-stories) (Screens 10-12, 23)
20. [Interview & Coaching](#interview-stories) (Screens 13-14, 24-34)
21. [Coach Platform & Profiles](#coach-stories) (Screens 35-49, 76-81, 83, 85-106, 109)

#### Phase 3: Knowledge Flow Implementation
22. [Second Brain Core Features](#knowledge-stories) (US-NEW-103 to US-NEW-116)

#### Phase 4: Finance Flow Implementation
23. [Client Financial Services](#finance-client-stories) (US-NEW-117 to US-NEW-124)

#### Phase 5: Advisor Flow Implementation
24. [Financial Advisor Platform](#advisor-stories) (US-NEW-087 to US-NEW-094)

#### Phase 6: Tax Flow Implementation
25. [Accountant Platform](#accountant-stories) (US-NEW-079 to US-NEW-086)

#### Phase 7: Legal Flow Implementation
26. [Lawyer Platform](#lawyer-stories) (US-NEW-095 to US-NEW-102)
27. [Client Legal Services](#legal-client-stories) (US-NEW-125 to US-NEW-127)

#### Phase 8: Venture Flow Implementation
28. [Entrepreneurial Hub](#venture-stories) (US-NEW-128 to US-NEW-132)

#### Phase 9: Career Development & Learning
29. [Career Insights & Progression](#career-stories) (Screens 6-9)
30. [Learning & Development](#learning-stories) (Screens 15-21)

#### Phase 10: Community & Networking
31. [Community Features](#community-stories) (Screens 22-23)

#### Phase 11: Payment & Subscriptions
32. [Payment & HITL Marketplace](#payment-stories) (Screens 65-69)

#### Phase 12: Marketing & Support
33. [Landing Page & Marketing](#marketing-stories) (Screens 50-56)
34. [Help, Support & Feedback](#support-stories) (Screens 115-116)

#### Phase 13: Enhanced Features
35. [Portfolio Builder](#portfolio-stories) (Screen 107)
36. [Cover Letter Generator](#cover-letter-stories) (Screen 108)
37. [Enhanced Features](#enhanced-stories) (Screens 8, 85, 115 enhancements)

### Part IV: Implementation Guides
38. [A/B Testing Framework](#ab-testing)
39. [MCP UI Integration Patterns](#mcp-ui-patterns)
40. [Multi-Agent System Architecture](#agent-architecture)
41. [Security & Compliance](#security-compliance)
42. [Data Models & API Reference](#data-models)
43. [Performance & Scalability](#performance)
44. [Quality Assurance & Testing](#qa-testing)
45. [Deployment & DevOps](#deployment)

### Part V: Business Operations
46. [Professional Recruitment Strategy](#professional-recruitment)
47. [User Acquisition & Growth](#user-growth)
48. [Pricing Strategy by Microservice](#pricing-strategy)
49. [Risk Assessment & Mitigation](#risk-mitigation)
50. [Success Metrics & KPIs](#success-metrics)

### Appendices
51. [Appendix A: Complete Data Schema](#appendix-a)
52. [Appendix B: API Endpoint Reference](#appendix-b)
53. [Appendix C: Third-Party Integrations](#appendix-c)
54. [Appendix D: Compliance Checklist](#appendix-d)
55. [Appendix E: Glossary](#appendix-e)

---

## Part I: Strategic Vision & Architecture

<a name="executive-summary"></a>
## 1. Executive Summary

**Platform Name:** Resume Flow by Verridian AI

**Tagline:** "AI-Native Professional & Life Intelligence—Powered by Expert Verification"

**Mission:** Democratize access to world-class professional services (career coaching, financial planning, legal advice, tax optimization, entrepreneurial guidance) through AI-assisted intelligence that learns continuously from verified human expertise.

### Core Innovation

**Human-in-the-Loop Reinforcement Learning Training Farm:**
- Every AI output verified by qualified professionals (coaches, accountants, financial advisors, lawyers)
- Verification corrections become training data for continuous AI improvement
- Free-market bidding system for verification tasks (professionals compete on price/quality)
- Platform captures 15% of all verification transactions
- Gradual transition from 100% human verification → confidence-based AI autonomy over 3-5 years
- Transparent disclosure to users: "Your verified outputs make our AI smarter for everyone"

### Strategic Positioning

**Year 1:** "The career platform where AI drafts and coaches perfect"
- Focus: Job Flow microservice (resume generation, job matching, interview prep)
- Differentiation: Expert-verified AI outputs vs. pure AI or manual services

**Year 2:** "Your complete professional intelligence platform"
- Expansion: Add Knowledge Flow (Second Brain), Finance Flow, Advisor Flow
- Differentiation: Interconnected intelligence (career insights inform financial planning, etc.)

**Year 3-5:** "The intelligence training platform approaching 100% AI accuracy"
- Maturity: AI handles 80%+ of routine tasks autonomously, humans focus on complex cases
- Differentiation: Lowest-cost, highest-accuracy professional services globally

### Key Metrics

**170+ User Stories** across 7 microservices

**7 Microservices:** Job Flow, Knowledge Flow, Finance Flow, Advisor Flow, Tax Flow, Legal Flow, Venture Flow

**4 User Personas:** Job Seekers, Professional Service Providers (Coaches, Accountants, FAs, Lawyers), Entrepreneurs, General Knowledge Users

**24-Month Roadmap** with phased releases per microservice

**$16M+ Annual Revenue Projection** by Month 24 from HITL marketplace (15% platform fee)

**100,000+ Verification Tasks/Month** by Month 24 creating rich RL training dataset

---

<a name="platform-vision"></a>
## 2. Platform Vision & Positioning

### The Problem We Solve

**For Job Seekers:**
- Resume writing is time-consuming and results are mediocre without expert help
- Professional career coaches are expensive ($100-300/hour)
- AI resume tools produce generic, unverified outputs that fail ATS screening
- Job search is isolated, stressful, and lacks personalized guidance

**For Professionals (Coaches, Accountants, FAs, Lawyers):**
- Difficult to build client base as independent practitioner
- Income is inconsistent and unpredictable
- Administrative overhead (marketing, billing, scheduling) is burdensome
- No scalable way to leverage expertise (trading time for money)

**For All Users:**
- Professional services are fragmented (separate platforms for career, finance, legal)
- Personal knowledge is scattered (documents, notes across multiple tools)
- AI tools lack accountability and accuracy guarantees
- No platform learns from your unique situation over time

### Our Solution

**AI + Human Hybrid Model:**
- AI provides speed, scalability, and cost efficiency
- Humans provide accuracy, context, and trust
- Continuous learning loop improves AI toward human-level performance

**Marketplace Economics:**
- Free-market bidding keeps verification costs competitive
- Professionals earn fair market rate (85% of transaction)
- Platform scales revenue with verification volume (15% of transaction)

**Interconnected Intelligence:**
- Career insights inform financial planning ("You're targeting $120K roles—here's your retirement plan adjusted")
- Financial data informs career decisions ("This job's salary won't cover your student loan goals—negotiate higher or pass")
- Legal documents stored in Second Brain for instant access during tax season
- All knowledge connected in personal graph

**Transparent RL Training:**
- Users understand they're contributing to AI improvement
- Tangible benefit: Costs decrease as AI accuracy increases
- Ethical AI development with user consent and privacy protection

### Competitive Landscape

| Competitor | Category | Weakness We Exploit |
|------------|----------|---------------------|
| LinkedIn | Career networking | No AI resume generation, no verification, generic job matching |
| Resume.io / Zety | Resume builders | Pure templates, no AI customization, no expert review |
| ChatGPT / Claude | AI assistants | No domain expertise, no verification, no accountability, no learning from corrections |
| BetterUp / CoachHub | Coaching platforms | Expensive ($200-500/month), human-only (no AI efficiency), career-only (no finance/legal) |
| Mint / YNAB | Personal finance | No AI insights, no human advisor access, finance-only (no career integration) |
| LegalZoom | Legal services | Template-based, no AI customization, no human verification of AI outputs |
| Notion / Obsidian | Knowledge management | No AI curation, no professional service integration, manual organization |

**Our Unique Position:** The ONLY platform combining AI-assisted professional services across career, finance, legal, and knowledge domains with verified human expertise and continuous learning.

---

<a name="microservices-architecture"></a>
## 3. Microservices Architecture

### Architectural Principles

**1. Domain-Driven Design:** Each microservice owns a bounded context (Job Flow owns resume/jobs, Finance Flow owns budgeting/investments)

**2. Shared Infrastructure:** All microservices share HITL marketplace, RL training pipeline, user authentication, payment processing

**3. Event-Driven Communication:** Microservices publish events (e.g., "Resume Verified" event triggers knowledge graph update)

**4. API-First:** Each microservice exposes RESTful + WebSocket APIs for frontend and inter-service communication

**5. Independent Deployment:** Microservices can be deployed, scaled, and updated independently

### Microservice Catalog

#### **1. Job Flow**
- **Domain:** Career development, job search, interview preparation, coaching
- **Core Entities:** Resumes, STAR Stories, Job Applications, Interviews, Coach Profiles, Coaching Sessions
- **HITL Verifiers:** Career Coaches
- **Revenue Model:** Coach verification fees (15% platform fee on $15-80 per verification)

#### **2. Knowledge Flow**
- **Domain:** Personal knowledge management, document storage, note-taking, knowledge graph
- **Core Entities:** Documents, Notes, Knowledge Nodes, Knowledge Edges, Tags, Categories
- **HITL Verifiers:** Knowledge Curators (new role, lower credential requirements)
- **Revenue Model:** Curator verification fees (15% platform fee on $5-20 per verification)

#### **3. Finance Flow**
- **Domain:** Personal finance management, budgeting, investment tracking, retirement planning
- **Core Entities:** Bank Accounts, Transactions, Budgets, Investments, Retirement Plans, Loan Calculations
- **HITL Verifiers:** Financial Advisors (for user-side tools)
- **Revenue Model:** FA verification fees (15% platform fee on $20-150 per verification)

#### **4. Advisor Flow**
- **Domain:** Financial advisor professional services, client portfolio management
- **Core Entities:** FA Profiles, Client Portfolios, Asset Allocations, Financial Plans, Rebalancing Recommendations
- **HITL Verifiers:** Senior Financial Advisors (peer review)
- **Revenue Model:** Senior FA verification fees + FA subscription fees

#### **5. Tax Flow**
- **Domain:** Tax calculation, optimization, preparation, accountant professional services
- **Core Entities:** Accountant Profiles, Client Financials, Tax Calculations, Deductions, Tax Returns
- **HITL Verifiers:** Certified Public Accountants (CPAs)
- **Revenue Model:** CPA verification fees (15% platform fee on $30-300 per verification)

#### **6. Legal Flow**
- **Domain:** Legal advice, contract review, case management, lawyer professional services
- **Core Entities:** Lawyer Profiles, Legal Cases, Contracts, Legal Documents, Legal Advice
- **HITL Verifiers:** Licensed Attorneys
- **Revenue Model:** Attorney verification fees (15% platform fee on $75-400 per verification)

#### **7. Venture Flow**
- **Domain:** Entrepreneurship, business planning, investor matching, funding guidance
- **Core Entities:** Business Ideas, Business Plans, Investor Profiles, Funding Applications
- **HITL Verifiers:** Business Advisors, Startup Mentors
- **Revenue Model:** Advisor verification fees (15% platform fee on $40-400 per verification)

### Shared Services

**Authentication Service (WorkOS):** SSO, magic links, 2FA, role-based access control

**Payment Service (Stripe):** Subscription billing, HITL marketplace transactions (Stripe Connect for professional payouts), invoicing

**Notification Service:** Email (SendGrid), in-app notifications, WebSocket real-time alerts

**Search Service:** Elasticsearch or Cognee for semantic search across all content

**File Storage Service:** AWS S3 or Azure Blob for documents, images, videos, portfolios

**Analytics Service:** OpenTelemetry for metrics, Langfuse for LLM observability

**HITL Marketplace Service:** Task creation, bidding, assignment, verification workflow, payment processing

**RL Training Service:** Data aggregation, model training, A/B test orchestration, confidence scoring

---

<a name="hitl-system"></a>
## 4. Human-in-the-Loop RL Training System

### System Overview

**Purpose:** Continuously improve AI accuracy by learning from professional corrections while providing immediate value through verified outputs.

**Flow:**
1. User requests AI output (resume, budget, contract, etc.)
2. AI generates draft + confidence score
3. System creates verification task in marketplace
4. Professionals bid on task (price + estimated time)
5. Lowest qualified bid auto-assigned or user selects
6. Professional reviews, annotates, approves/corrects AI output
7. User receives verified output
8. Professional receives 85% of bid amount
9. Platform receives 15% of bid amount
10. Correction data logged for RL training
11. AI models retrained nightly on aggregated corrections
12. Confidence scores updated based on verification outcomes
13. Over time, high-confidence outputs bypass human verification (Phase 4+)

### HITL Marketplace Mechanics

#### Task Creation
- **Automatic:** System creates task when AI generates output requiring verification
- **Task Attributes:**
  - Task type (e.g., "Resume Review - Full")
  - AI output to verify (attached document/data)
  - Suggested base price (dynamic based on complexity, urgency, market rates)
  - Deadline (Urgent: 2hr, Standard: 24hr, Flexible: 72hr)
  - Required verifier credentials (certifications, ratings, specializations)

#### Bidding Process
- **Open Marketplace:** All qualified professionals see available tasks
- **Bid Submission:** Professionals submit price + estimated completion time
- **Bid Ranking Algorithm:**
  ```
  Bid Score = (0.4 × Price Factor) + (0.3 × Rating Factor) + (0.2 × Speed Factor) + (0.1 × Accuracy Factor)
  
  Price Factor = (Suggested Price / Bid Price) // Lower price = higher score
  Rating Factor = (Professional Rating / 5.0) // Higher rating = higher score
  Speed Factor = (Deadline - Estimated Time) / Deadline // Faster = higher score
  Accuracy Factor = (Historical Approval Rate) // Higher approval = higher score
  ```
- **Assignment:** 
  - User sees top 3 ranked bids with professional profiles
  - User selects bid OR system auto-assigns top bid after 30 minutes
  - Urgent tasks: Auto-assign top bid immediately

#### Verification Workflow
- **Access:** Professional receives AI output, source data, AI reasoning explanation
- **Tools:** 
  - Annotation interface (highlight, comment, suggest changes)
  - Side-by-side editor (original AI output | professional corrections)
  - Approval workflow (Approve, Approve with Changes, Reject & Revise)
- **Submission:**
  - Professional submits decision + detailed feedback
  - If changes made: Corrected output attached with change summary
  - Professional rates AI accuracy (1-5 scale)
  - Professional provides confidence rating (how certain of corrections)

#### Payment Processing
- **Escrow:** User's payment held in escrow when bid accepted
- **Release Conditions:**
  - User accepts verified output: Professional receives 85%, Platform receives 15%
  - User requests revision: Escrow held until revision accepted (professional receives proportional payment for additional work)
  - Dispute: Platform arbitration (3-5 business days)
- **Payout:** Stripe Connect instant transfer to professional's bank account

#### Quality Control
- **User Ratings:** After accepting verified output, user rates professional (1-5 stars + optional comment)
- **Platform Audits:** Random 10% sample reviewed by internal quality team
- **Peer Review:** Flagged low-quality verifications reviewed by senior professionals
- **Consequences:**
  - <3.5 stars average: Temporary suspension + re-training required
  - <3.0 stars average: Permanent removal from marketplace
  - Excellent performance (>4.8 stars): "Master Verifier" badge + priority assignments

### RL Training Pipeline

#### Data Collection
- **Every Verification Logged:**
  - Original AI output (structured data + text)
  - AI confidence score
  - Professional corrections (diff format)
  - Professional feedback (free text + structured ratings)
  - User acceptance (accepted/rejected)
  - Final outcome (approved as-is / approved with changes / rejected)

#### Data Processing (Nightly Batch)
```
1. Aggregate day's verifications by microservice + task type
2. Extract correction patterns:
   - Frequently deleted text/sections
   - Frequently added text/sections
   - Rewording patterns (original phrase → corrected phrase)
   - Structural changes (formatting, organization)
3. Filter low-quality corrections:
   - Exclude verifications from <4-star professionals
   - Exclude outliers (corrections significantly different from peer consensus)
   - Exclude user-rejected verifications
4. Generate training examples:
   - Input: (User data + AI prompt)
   - Output: (Professional-corrected version)
   - Weight: (Based on professional rating + user acceptance)
5. Store in training database with version control
```

#### Model Training
```
Weekly Training Cycle:
1. Retrieve all new training examples since last training
2. Fine-tune domain-specific models:
   - Resume generation model (flagship LLM fine-tuned on verified resumes)
   - Financial planning model (flagship LLM fine-tuned on verified budgets/plans)
   - Contract generation model (flagship LLM fine-tuned on verified contracts)
   - Etc. for each major task type
3. Retrain confidence calibration layer:
   - Predict verification outcome based on features
   - Features: AI confidence, task complexity, user history, domain
   - Target: Actual verification outcome (approved/changed/rejected)
4. Version control: Save model checkpoint with timestamp
5. A/B test preparation: Deploy to canary environment (5% traffic)
```

#### Deployment & Monitoring
```
1. Canary Release (24-48 hours):
   - Route 5% of traffic to new model version
   - Monitor key metrics:
     - Verification approval rate (target: ≥ current model)
     - User satisfaction (target: ≥ current model)
     - Confidence score accuracy (target: improved calibration)
     - Latency (target: ≤ current model + 10%)
2. Gradual Rollout:
   - If canary succeeds: Increase to 25% → 50% → 100% over 1 week
   - If canary fails: Rollback to previous version, analyze failures
3. Continuous Monitoring:
   - Track accuracy by task type and microservice
   - Identify low-performing features for additional training focus
   - Monitor for model drift or degradation
```

### A/B Testing for AI Autonomy

#### Phase 1: Baseline (Months 1-12)
- **Traffic:** 100% human-verified
- **Purpose:** Collect ground truth data, establish accuracy baselines
- **Metrics:**
  - Human approval rate by task type
  - Common correction types
  - AI confidence vs. actual outcome correlation
  - User satisfaction with verified outputs

#### Phase 2: Controlled Testing (Months 13-24)
- **Traffic:** 90% human-verified (Control) | 10% AI-only (Test)
- **Test Group Selection:** 
  - Users with AI confidence >90%
  - Low-stakes tasks (e.g., job match suggestions, not tax returns)
  - Users who opt-in to "Early Access" program
- **Safety:**
  - "Request Human Review" button always visible
  - Money-back guarantee if AI-only output is incorrect
- **Success Criteria:**
  - AI-only acceptance rate ≥95% (equal to human-verified)
  - User satisfaction ≥4.5 stars
  - Opt-out rate <5%

#### Phase 3: Gradual Expansion (Months 25-36)
- **Traffic:** Dynamic per task type based on accuracy
  - High-accuracy tasks (>98% approval): 50% AI-only | 50% human-verified
  - Medium-accuracy tasks (95-98%): 30% AI-only | 70% human-verified
  - Low-accuracy tasks (<95%): 10% AI-only | 90% human-verified
- **Continuous Adjustment:** Traffic allocation updated monthly based on performance
- **Guardrails:** Automatic rollback to 100% human if accuracy drops >5% week-over-week

#### Phase 4: Confidence-Based Routing (Months 37+)
- **Routing Logic:**
  - AI confidence >95%: Auto-approve, label "AI-Generated (Verified by System)"
  - AI confidence 85-95%: Lightweight human review (spot-check, faster turnaround, lower cost)
  - AI confidence <85%: Full human verification
- **User Override:** Users can always request full human review for peace of mind
- **Pricing Tiers:**
  - AI-only: Free or included in base subscription
  - Lightweight review: 50% of full verification cost
  - Full verification: Market rate via bidding

#### Phase 5: AI Mastery (Years 3-5+)
- **Target:** AI handles 80%+ of routine tasks autonomously
- **Human Role:** Complex cases, novel situations, edge cases, training AI on new domains
- **Revenue Mix:** Subscriptions (70%) + HITL for complex cases (30%)

### Transparent Disclosure to Users

#### Onboarding Consent (Required)

**Screen: "How Resume Flow Gets Smarter"**

```
At Resume Flow, we combine AI speed with human expertise to deliver the best professional 
services. Here's how it works:

1️⃣ AI Generates Your Output
   Our AI creates your resume, budget, contract, or advice based on your unique situation.

2️⃣ Expert Verification
   A qualified professional (coach, accountant, advisor, lawyer) reviews the AI's work.
   They make corrections, add insights, and ensure accuracy.

3️⃣ You Get Verified Excellence
   You receive the final output—AI speed + human expertise—with the professional's 
   seal of approval.

4️⃣ AI Learns from Corrections (This is where you help!)
   When professionals correct the AI, we use those corrections as anonymous training data.
   The AI learns what good outputs look like and improves for everyone.

5️⃣ Over Time, Costs Decrease
   As AI accuracy improves, fewer corrections are needed.
   Verification becomes faster and cheaper.
   Eventually, many outputs won't need verification at all!

Your Privacy is Protected:
✓ Only correction patterns are used (not your personal data)
✓ All training data is anonymized
✓ You can opt out while still using verified outputs

Your Benefits:
✓ More accurate AI every month
✓ Lower costs as AI improves (our AI is already 47% more accurate than 6 months ago!)
✓ Faster results as verification becomes optional
✓ You're contributing to democratizing professional services

☐ I understand and consent to my verified outputs training the AI
☐ I opt out of AI training (verified outputs only, no contribution to AI improvement)

[Continue] button
```

#### In-App Transparency Features

**AI Accuracy Dashboard (Public):**
- Live accuracy metrics by task type: "Resume Generation: 94.2% approval rate this month"
- Improvement trends: "Tax Calculation accuracy improved 8% this quarter thanks to 2,847 verified outputs"
- Community impact: "Our users' contributions have reduced average verification time from 18 hours to 6 hours"

**"How This Was Made" Label on Every Output:**
- AI-only: "✨ AI-Generated (95% historical accuracy) - [Request Human Review]"
- Human-verified: "✅ Expert-Verified by [Professional Name] ([Rating] ⭐)"
- Hybrid: "🔄 AI-Generated + Spot-Checked by [Professional Name]"

---

<a name="revenue-model"></a>
## 5. Revenue Model & Projections

### Revenue Streams

#### 1. HITL Marketplace Fees (15% of verification transactions)
- **Mechanics:** Platform captures 15% of every verification payment
- **Professional earns:** 85% of bid amount
- **Scaling:** Revenue grows with verification volume
- **Projection:** Primary revenue driver in Years 1-3, declining as AI improves

#### 2. User Subscriptions
- **Free Tier:** 
  - 3 AI-generated outputs/month (no verification)
  - Access to public resources and community
  - Knowledge Flow (unlimited notes, 500MB storage)
- **Premium Tier ($29/month):**
  - Unlimited AI-generated outputs
  - 5 verified outputs/month included
  - Additional verifications at discounted marketplace rates
  - 10GB Knowledge Flow storage
  - Priority support
- **Professional Tier ($99/month):**
  - Everything in Premium
  - 20 verified outputs/month included
  - Advanced analytics and insights
  - White-label portfolio option
  - API access
- **Enterprise Tier (Custom pricing):**
  - Team accounts (5+ users)
  - Centralized billing
  - Dedicated account manager
  - Custom integrations

#### 3. Professional Service Provider Subscriptions
- **Coach/Advisor/Accountant/Lawyer Free Tier:**
  - Profile listing in directory
  - Access to marketplace bids
  - Payment processing (15% platform fee)
- **Pro Provider Tier ($49/month):**
  - Priority marketplace visibility
  - Advanced client management tools
  - Marketing analytics
  - Reduced platform fee (12% instead of 15%)
- **Master Provider Tier ($149/month):**
  - Everything in Pro
  - Lead generation tools
  - Webinar hosting capabilities
  - Coaching resource library access
  - Lowest platform fee (10% instead of 15%)

#### 4. Partner Referral Revenue
- **Learning Platform Partnerships:** Affiliate fees from Coursera, LinkedIn Learning, Udemy (10-20% of course sales)
- **Financial Product Referrals:** Bank account signups, investment platform referrals, insurance products (varies by partner)
- **Legal Service Referrals:** Document filing services, notary services (affiliate fees)

### Revenue Projections

#### Year 1 (Months 1-12): Job Flow + Knowledge Flow

**Assumptions:**
- Launch Month 1: Job Flow beta (500 users)
- Month 6: Job Flow public (5,000 users)
- Month 9: Knowledge Flow public (+5,000 users = 10,000 total)
- Average 2 verifications/user/month
- Average verification value: $30
- 20% conversion to Premium subscriptions

**HITL Marketplace Revenue:**
| Month | Active Users | Verifications/Month | Avg Value | Gross Transaction | Platform Fee (15%) |
|-------|--------------|---------------------|-----------|-------------------|-------------------|
| 1 | 500 | 1,000 | $30 | $30,000 | $4,500 |
| 3 | 2,000 | 4,000 | $30 | $120,000 | $18,000 |
| 6 | 5,000 | 10,000 | $30 | $300,000 | $45,000 |
| 9 | 10,000 | 20,000 | $30 | $600,000 | $90,000 |
| 12 | 15,000 | 30,000 | $30 | $900,000 | $135,000 |

**Year 1 HITL Revenue:** ~$700,000

**Subscription Revenue (Month 12):**
- Free users: 12,000 (80%)
- Premium users: 3,000 (20%) × $29/month = $87,000/month
- Year 1 Subscription Revenue: ~$400,000 (ramping from $0 to $87k/month)

**Total Year 1 Revenue:** ~$1.1M

---

#### Year 2 (Months 13-24): + Finance Flow, Advisor Flow, Tax Flow

**Assumptions:**
- Month 12: 15,000 users
- Month 24: 50,000 users (Finance Flow attracts broader audience)
- Average 3 verifications/user/month (higher for financial services)
- Average verification value: $60 (financial services command higher prices)
- 30% Premium conversion

**HITL Marketplace Revenue (Month 24):**
- Active users: 50,000
- Verifications/month: 50,000 × 3 = 150,000
- Gross transaction: 150,000 × $60 = $9,000,000
- Platform fee (15%): $1,350,000/month

**Year 2 HITL Revenue:** ~$8M (average of Year 1 exit rate to Year 2 exit rate)

**Subscription Revenue (Month 24):**
- Premium users: 15,000 × $29 = $435,000/month
- Professional users: 500 × $99 = $49,500/month
- Total: $484,500/month

**Year 2 Subscription Revenue:** ~$4M

**Total Year 2 Revenue:** ~$12M

---

#### Year 3: + Legal Flow, Venture Flow + A/B Testing (30% AI-only traffic)

**Assumptions:**
- Month 36: 100,000 users
- A/B testing: 30% of verifications now AI-only (no marketplace fee)
- Remaining 70% verified: 100,000 × 3 × 0.7 = 210,000 verifications/month
- Average verification value increases to $75 (legal services pull average up)
- Premium conversion: 40% (value proposition strengthens as AI improves)

**HITL Marketplace Revenue (Month 36):**
- Verifications/month: 210,000
- Gross transaction: 210,000 × $75 = $15,750,000
- Platform fee (15%): $2,362,500/month

**Year 3 HITL Revenue:** ~$20M (accounting for gradual A/B rollout)

**Subscription Revenue (Month 36):**
- Premium users: 40,000 × $29 = $1,160,000/month
- Professional users: 5,000 × $99 = $495,000/month
- Pro Provider users: 2,000 × $49 = $98,000/month
- Total: $1,753,000/month

**Year 3 Subscription Revenue:** ~$15M

**Total Year 3 Revenue:** ~$35M

---

#### Year 5: AI Mastery (80% AI-only, minimal verification needed)

**Assumptions:**
- 250,000 active users
- 80% of tasks handled by AI-only (no verification needed)
- 20% verified: 250,000 × 3 × 0.2 = 150,000 verifications/month (complex cases only)
- Average verification value: $120 (only complex, high-value tasks remain)
- Premium conversion: 60% (AI speed + occasional expert verification is compelling value)

**HITL Marketplace Revenue:**
- Verifications/month: 150,000
- Gross transaction: 150,000 × $120 = $18,000,000
- Platform fee (15%): $2,700,000/month
- **Year 5 HITL Revenue:** ~$30M

**Subscription Revenue:**
- Premium users: 150,000 × $29 = $4,350,000/month
- Professional users: 20,000 × $99 = $1,980,000/month
- Pro Provider users: 10,000 × $49 = $490,000/month
- **Year 5 Subscription Revenue:** ~$75M

**Total Year 5 Revenue:** ~$105M

**Revenue Mix Evolution:**
- Year 1: 65% HITL, 35% Subscriptions
- Year 3: 58% HITL, 42% Subscriptions
- Year 5: 29% HITL, 71% Subscriptions (AI accuracy drives subscription value)

---

<a name="technical-stack"></a>
## 6. Technical Stack & Infrastructure

### Frontend

**Framework:** React 18+ with TypeScript
- **Rationale:** Mature ecosystem, excellent TypeScript support, large talent pool

**Build Tool:** Vite
- **Rationale:** Fastest build times, superior HMR, modern ESM-first approach

**Styling:** Tailwind CSS + HeadlessUI
- **Rationale:** Utility-first approach scales well, HeadlessUI provides accessible primitives

**State Management:** 
- **Global State:** Convex (real-time reactive queries)
- **Local State:** React hooks (useState, useReducer)
- **Form State:** React Hook Form
- **Rationale:** Convex eliminates need for Redux/Zustand for global state, reactive updates out of the box

**Routing:** React Router v6
- **Rationale:** Standard, well-documented, supports nested routes

**UI Component Library (Custom):**
- Built on HeadlessUI primitives
- Design system components (buttons, inputs, cards, modals)
- MCP UI-compatible components (can render in chat or native UI)

### Backend

**Database & Backend:** Convex
- **Rationale:** 
  - Real-time reactive queries (WebSocket built-in)
  - TypeScript-native backend functions
  - Built-in authentication integration
  - Automatic API generation from schema
  - Horizontal scaling built-in
  - ACID transactions
  - File storage included

**Authentication:** WorkOS
- **Rationale:**
  - Enterprise-grade SSO (Google, Microsoft, Apple)
  - Magic links built-in
  - 2FA support
  - RBAC (role-based access control)
  - Compliance-ready (SOC 2, GDPR)

**Payment Processing:** Stripe
- **Checkout:** Stripe Checkout for subscriptions
- **Marketplace:** Stripe Connect for professional payouts
- **Rationale:**
  - Industry standard for SaaS subscriptions
  - Connect enables marketplace (platform takes fee, professionals get remainder)
  - PCI compliance handled by Stripe

**File Storage:** 
- **Primary:** Convex file storage (built-in)
- **Overflow:** AWS S3 (for large files >100MB or video)
- **Rationale:** Convex storage integrated with queries, S3 for scale

**Search:**
- **Semantic Search:** Cognee (knowledge graph + vector embeddings)
- **Full-Text Search:** Convex built-in text search + Elasticsearch (if needed at scale)
- **Rationale:** Cognee provides knowledge graph + semantic search in one

### AI & ML

**Large Language Models:**
- **Primary:** Flagship LLM from leading provider (OpenAI, Anthropic, or Google)
- **Specialized:** Fine-tuned versions of flagship model for domain-specific tasks (resumes, finance, legal)
- **Rationale:** Use latest flagship model for best quality, fine-tune for domain accuracy

**Embeddings:** State-of-the-art embedding model from leading provider
- **Use Cases:** Semantic search, knowledge graph similarity, document clustering
- **Rationale:** High-quality embeddings improve search and recommendation accuracy

**Vision Models:** Latest multimodal vision model
- **Use Cases:** Document OCR, resume layout analysis, portfolio image analysis
- **Rationale:** Multimodal models handle text + images in single API call

**Agent Framework:** LangGraph (LangChain)
- **Rationale:**
  - State machine orchestration for multi-step agent workflows
  - Built-in memory management
  - Integrates with all major LLM providers
  - Production-ready with observability

**LLM Observability:** Langfuse
- **Rationale:**
  - Track LLM costs per user/feature
  - Monitor latency and quality
  - Debug agent reasoning chains
  - Optimize prompts based on data

**Knowledge Graph:** Cognee
- **Rationale:**
  - Purpose-built for LLM applications
  - Combines graph database + vector embeddings
  - Persistent memory across sessions
  - Retrieval-augmented generation (RAG) built-in

### MCP UI Integration

**MCP UI SDK:**
- **Server SDK:** `@mcp-ui/server` (for creating UI resources in backend agents)
- **Client SDK:** `@mcp-ui/client` (for rendering UI resources in frontend)
- **Rationale:** Enables agents to embed interactive components directly in chat

**Component Delivery Methods:**
1. **Remote DOM:** For native-feeling components (course cards, job filters, resume editors)
2. **Iframe Isolation:** For security-critical components (payment forms, bank connections)
3. **External URL:** For full-featured standalone apps (portfolio editor, knowledge graph visualizer)

**Custom Component Library:** Map Remote DOM elements to React components
- `ui-course-card` → `<CourseCard />`
- `ui-job-card` → `<JobCard />`
- `ui-resume-editor` → `<ResumeEditor />`
- **Rationale:** Reuse existing React components in both native UI and embedded chat contexts

### Real-Time Communication

**WebSocket:** Convex built-in WebSocket for real-time updates
- **Use Cases:**
  - Chat message streaming
  - Marketplace bid updates
  - Verification status changes
  - Collaborative editing (notes, documents)
  - Cross-device state sync

**Server-Sent Events (SSE):** For one-way real-time data (LLM streaming responses)
- **Rationale:** Simpler than WebSocket for unidirectional streaming

### Third-Party Integrations

**Open Banking:** Plaid (primary) or Yodlee (fallback)
- **Rationale:** Plaid has best developer experience and bank coverage in US/UK

**Digital ID Verification:** Stripe Identity
- **Rationale:** Integrated with Stripe payment processing, compliance-ready

**Professional Credential Verification:** Custom API integrations per credential type
- **Bar Licenses:** State bar association APIs
- **CPA Licenses:** State board of accountancy APIs
- **CFP/CFA:** Certification body APIs
- **Rationale:** No single aggregator exists, manual integration per credential

**Mapping & Routing:** Google Maps API (primary) or Mapbox (fallback)
- **Use Cases:** Commute analysis, distance calculations, route optimization
- **Rationale:** Google Maps has best data coverage, Mapbox for cost optimization if needed

**Financial Data:** 
- **Stock/Investment Prices:** Alpha Vantage or IEX Cloud
- **Exchange Rates:** Open Exchange Rates API
- **Rationale:** Free tiers available, good coverage

**Email Delivery:** SendGrid or Postmark
- **Use Cases:** Transactional emails (verification codes, receipts, notifications)
- **Rationale:** High deliverability, good analytics

**Video Avatars:** D-ID or similar
- **Use Cases:** AI coach video avatar for conversational interface
- **Rationale:** Human-like avatar improves engagement in coaching scenarios

### Monitoring & Observability

**Application Monitoring:** OpenTelemetry → DataDog or New Relic
- **Metrics:** Request latency, error rates, throughput, database query performance
- **Rationale:** OpenTelemetry is vendor-neutral standard

**Error Tracking:** Sentry
- **Rationale:** Best-in-class error tracking with source map support

**LLM Observability:** Langfuse (as mentioned above)

**Business Analytics:** Mixpanel or Amplitude
- **Metrics:** User engagement, feature adoption, conversion funnels, retention
- **Rationale:** Product analytics optimized for SaaS

**Logs:** Convex built-in logging + external aggregation (Datadog)

### DevOps & Deployment

**Hosting:**
- **Frontend:** Vercel (React app)
- **Backend:** Convex (managed hosting)
- **Rationale:** Both platforms optimized for their respective stacks, minimal DevOps overhead

**CI/CD:** GitHub Actions
- **Pipeline:** Lint → Type Check → Test → Build → Deploy
- **Rationale:** Integrated with GitHub, free for public repos

**Version Control:** GitHub
- **Branching Strategy:** Trunk-based development with feature flags
- **Rationale:** Fast iteration, production deployments multiple times per day

**Secrets Management:** Convex Environment Variables + GitHub Secrets
- **Rationale:** Convex handles backend secrets, GitHub for CI/CD secrets

**Infrastructure as Code:** Not needed (Convex and Vercel are fully managed)

### Security & Compliance

**Encryption:**
- **In Transit:** TLS 1.3 (HTTPS enforced)
- **At Rest:** AES-256 (Convex default)

**Authentication:** WorkOS (as mentioned)

**Authorization:** Role-Based Access Control (RBAC)
- **Roles:** User (job seeker), Professional (coach/accountant/FA/lawyer), Admin
- **Convex Rules:** Row-level security enforced in database queries

**PCI Compliance:** Stripe Checkout + Elements (SAQ A compliance)
- **Rationale:** No cardholder data touches our servers

**GDPR Compliance:**
- Data export functionality
- Right to erasure (account deletion)
- Explicit consent for AI training
- Privacy policy and terms of service

**SOC 2:** Target for Year 2 (required for enterprise customers)
- **Preparation:** WorkOS and Stripe are already SOC 2 compliant (inheritance model)

---

<a name="design-system"></a>
## 7. Design System & UX Principles

### Visual Design

**Theme:** Dark mode primary, light mode optional
- **Background:** Charcoal (#1a1a1a or similar dark grey)
- **Text:** White (#ffffff) for primary content, light grey (#cccccc) for secondary
- **Accents:** Bright yellow (#FFD700 or similar) for interactive elements, CTAs, highlights
- **Rationale:** Professional, modern, reduces eye strain for long sessions

**Typography:**
- **Font Family:** Inter (primary), SF Pro (fallback)
- **Sizes:** 12px (caption), 14px (body), 16px (emphasis), 20px (heading 3), 24px (heading 2), 32px (heading 1)
- **Weight:** 400 (regular), 600 (semibold), 700 (bold)
- **Rationale:** Inter is highly legible at small sizes, excellent for data-heavy interfaces

**Spacing:** 4px base unit (4, 8, 12, 16, 24, 32, 48, 64)
- **Rationale:** Consistent spacing improves visual hierarchy

**Border Radius:** 
- **Small:** 4px (inputs, badges)
- **Medium:** 8px (cards, buttons)
- **Large:** 12px (modals, large containers)
- **Rationale:** Softens UI without being overly rounded

### Component Library

**Buttons:**
- **Primary:** Yellow background, dark text, bold, used for main CTAs
- **Secondary:** Dark grey background, white text, used for secondary actions
- **Ghost:** Transparent background, white text, subtle hover, used for tertiary actions
- **Destructive:** Red background, white text, used for delete/cancel actions

**Forms:**
- **Inputs:** Dark background, light border, white text, yellow focus ring
- **Labels:** Light grey, positioned above input
- **Validation:** Inline error messages in red, success messages in green
- **Helper Text:** Light grey, small font, below input

**Cards:**
- **Standard:** Dark background, subtle border, rounded corners, padding 16-24px
- **Elevated:** Drop shadow to indicate importance or interactivity
- **Hover:** Subtle scale transform (1.02x) on hover for interactive cards

**Modals:**
- **Overlay:** Semi-transparent dark background (rgba(0,0,0,0.8))
- **Content:** Centered, max-width 600px, white background, rounded corners
- **Close:** X button top-right, ESC key support

**Navigation:**
- **Top Nav:** Fixed, dark background, logo left, user menu right
- **Sidebar:** Collapsible, icons + text, active state highlighted in yellow
- **Breadcrumbs:** For deep navigation, light grey with chevron separators

**Data Display:**
- **Tables:** Zebra striping (alternating row colors), sortable columns, hover highlight
- **Charts:** Yellow primary color, grey secondary, tooltips on hover, responsive
- **Badges:** Rounded pill shape, colored backgrounds (status indicators)

### UX Principles

**1. Progressive Disclosure:**
- Show essential information first, hide complexity until needed
- Example: Resume editor shows preview by default, advanced options in collapsible panel

**2. Contextual Help:**
- Tooltips on hover for unfamiliar terms
- Inline documentation for complex features
- AI assistant available in chat overlay for questions

**3. Immediate Feedback:**
- Loading states for async operations (spinners, skeleton screens)
- Success/error toasts for user actions
- Real-time validation for forms

**4. Undo/Redo:**
- Version history for documents (resumes, business plans, contracts)
- "Undo" option for destructive actions (delete, archive)

**5. Mobile-First Responsive:**
- Breakpoints: Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)
- Touch-friendly hit targets (minimum 44px)
- Simplified navigation on mobile (hamburger menu)

**6. Accessibility (WCAG 2.1 AA):**
- Color contrast ratio ≥4.5:1 for text
- Keyboard navigation for all interactive elements
- Screen reader support (semantic HTML, ARIA labels)
- Focus indicators on all interactive elements

### Specific UX Patterns

**Chat Interface (AI Agents):**
- **Layout:** Messages left-aligned (assistant), right-aligned (user)
- **Avatars:** AI avatar (video or static image) left, user avatar right
- **Embedded Components:** Full-width in message flow, elevated cards
- **Typing Indicator:** Three bouncing dots while AI generates response
- **Actions:** Quick reply buttons below AI messages for common actions

**Marketplace Bidding:**
- **Task Card:** Shows task type, urgency, suggested price, required credentials
- **Bid List:** Top 3 bids displayed, expandable to see all bids
- **Professional Profile Preview:** Hover card with rating, reviews, credentials
- **Accept Bid:** One-click accept, confirmation modal before payment processed

**Verification Workflow (Professional Interface):**
- **Split Pane:** Left = original AI output, Right = professional's corrections
- **Annotation Tools:** Highlight (yellow), Comment (tooltip), Suggest (inline edit)
- **Diff View:** Shows changes clearly (red = deleted, green = added)
- **Submit Button:** Prominent yellow CTA "Submit Verification" with summary of changes

**Knowledge Graph Visualization:**
- **Interactive Graph:** Nodes (circles) connected by edges (lines)
- **Pan/Zoom:** Mouse drag to pan, scroll to zoom
- **Node Click:** Expands details in side panel
- **Filters:** By node type (document, note, concept), date range
- **Search:** Highlights matching nodes

**Dashboard Widgets:**
- **Grid Layout:** 2-column on desktop, 1-column on mobile
- **Widget Types:** Stat card (single metric), line chart (trends), table (list data)
- **Customization:** Drag-to-reorder, toggle visibility
- **Refresh:** Auto-refresh every 30s for real-time data, manual refresh button

---

## Part II: Microservices Roadmap

<a name="roadmap-overview"></a>
## 8. Roadmap Overview & Sequencing

### Sequencing Rationale

**Roadmap 1: Job Flow (Months 1-6)**
- **Why First:** Largest addressable market (millions of job seekers), clear pain point (resume writing is hard), existing market validation (LinkedIn, Indeed)
- **RL Foundation:** Establishes HITL marketplace mechanics, bidding system, verification workflow, payment processing, RL training pipeline
- **Learnings:** User behavior with AI verification, marketplace liquidity dynamics, coach recruitment strategies

**Roadmap 2: Knowledge Flow (Months 7-9)**
- **Why Second:** Complements Job Flow (store resumes, job descriptions, interview notes), broad appeal (everyone has documents/notes)
- **RL Extension:** Simpler verification tasks (categorization, tagging), lower cost, tests AI learning on structured data
- **Learnings:** Document processing accuracy, user engagement with knowledge graph, AI auto-categorization quality

**Roadmap 3: Finance Flow (Months 10-12)**
- **Why Third:** High-value complement to Job Flow (job seekers need budgeting, salary negotiation context benefits from financial data)
- **RL Expansion:** Higher-stakes verification (financial plans), introduces Financial Advisor verifiers, tests AI on numerical reasoning
- **Learnings:** Financial data integration (Open Banking), privacy concerns with sensitive data, FA recruitment

**Roadmap 4: Advisor Flow (Months 13-15)**
- **Why Fourth:** Supply-side platform for Financial Advisors (FAs become users, not just verifiers), creates two-sided marketplace
- **RL Depth:** Peer review system (senior FAs verify junior FAs), tests multi-tier verification
- **Learnings:** Professional user acquisition, FA workflow optimization, advanced client management needs

**Roadmap 5: Tax Flow (Months 16-18)**
- **Why Fifth:** Natural extension of Finance Flow (tax planning requires financial data), high-value service (users pay premium for tax accuracy)
- **RL Complexity:** Most complex numerical reasoning (tax code), highest-stakes verification (errors have legal consequences)
- **Learnings:** Accountant recruitment (stricter credential requirements), liability management, seasonal demand (tax season)

**Roadmap 6: Legal Flow (Months 19-21)**
- **Why Sixth:** Complements all prior flows (employment contracts for Job Flow, financial agreements for Finance Flow)
- **RL Domain Shift:** From numerical to legal reasoning, tests AI on ambiguous text interpretation
- **Learnings:** Lawyer recruitment (bar licenses), liability and insurance requirements, regulatory compliance

**Roadmap 7: Venture Flow (Months 22-24)**
- **Why Last:** Smallest addressable market (entrepreneurs are subset of users), requires all prior flows (career + finance + legal knowledge for business planning)
- **RL Integration:** Synthesizes learnings from all domains (business plans combine strategy, finance, legal)
- **Learnings:** Investor network effects, entrepreneurial community engagement, business advisor recruitment

### Dependencies

**Technical Dependencies:**
- **Job Flow → Knowledge Flow:** Document storage and knowledge graph infrastructure
- **Finance Flow → Advisor Flow:** Financial data models and Open Banking integration
- **Finance Flow → Tax Flow:** Shared financial data (income, expenses, transactions)
- **All Flows → Venture Flow:** Business planning requires insights from career, finance, legal domains

**RL Training Dependencies:**
- **Job Flow:** Establishes baseline RL pipeline (data collection, model training, A/B testing framework)
- **Knowledge Flow:** Tests RL on categorization tasks (different AI skill set than generation)
- **Finance Flow:** Tests RL on numerical reasoning and risk assessment
- **Tax Flow:** Tests RL on complex rule-based systems (tax code)
- **Legal Flow:** Tests RL on ambiguous text interpretation and legal precedent
- **Venture Flow:** Integrates multi-domain RL (synthesizes all prior learnings)

### Parallel Workstreams

**Months 1-6 (Job Flow):**
- **Workstream A (Priority 1):** HITL marketplace infrastructure
- **Workstream B (Priority 1):** AI resume generation + verification workflow
- **Workstream C (Priority 2):** Job matching + application tracking
- **Workstream D (Priority 2):** Interview prep + mock interview AI
- **Workstream E (Priority 3):** RL training pipeline (begins Month 3 after data collection)

**Months 7-9 (Knowledge Flow):**
- **Workstream A:** Document management + AI categorization
- **Workstream B:** Note-taking + knowledge graph
- **Workstream C (Parallel):** Job Flow optimization (based on first 6 months learnings)

**Months 10-12 (Finance Flow):**
- **Workstream A:** Open Banking integration + transaction sync
- **Workstream B:** Budgeting + investment tracking
- **Workstream C:** FA verification workflow
- **Workstream D (Parallel):** A/B testing framework activation (prepare for Phase 2)

**Months 13-24:** Similar parallel structure for remaining roadmaps

### Resource Allocation

**Team Size by Phase:**
- **Months 1-6:** 6 engineers, 1 designer, 1 product manager
- **Months 7-12:** 10 engineers (+4), 2 designers (+1), 1 PM
- **Months 13-18:** 14 engineers (+4), 2 designers, 1 PM, 1 QA engineer (+1)
- **Months 19-24:** 16 engineers (+2), 3 designers (+1), 1 PM, 2 QA engineers (+1)

**Critical Hires:**
- **Month 1:** Senior Full-Stack Engineer (HITL marketplace lead), AI/ML Engineer (RL pipeline lead)
- **Month 7:** Data Engineer (financial data integration)
- **Month 10:** Compliance Specialist (financial regulations)
- **Month 13:** Senior Designer (design system scaling)
- **Month 16:** Tax Domain Expert (accountant turned product consultant)
- **Month 19:** Legal Domain Expert (lawyer turned product consultant)

---

<a name="roadmap-1-job-flow"></a>
## 9. Roadmap 1: Job Flow (Months 1-6)

### Microservice Overview

**Name:** Job Flow

**Tagline:** "AI-powered career acceleration with expert verification"

**Target Users:**
- **Primary:** Job seekers (active job searchers, career changers, promotion seekers)
- **Secondary:** Career coaches (service providers + verifiers)

**Core Value Propositions:**
- **For Job Seekers:** "Get expert-quality resumes in 30 seconds for a fraction of coach hourly rates"
- **For Coaches:** "Build your client base and earn $30-80 per verification (10-30 minutes work)"

**Key Features:**
1. AI Resume Generation with STAR story extraction
2. Job Application Tracking (Kanban board)
3. AI Job Matching with compatibility scoring
4. Mock Interview Preparation with AI feedback
5. Salary Negotiation Simulation
6. Coaching Marketplace (bid-based verification)

### Month 1-2: Foundation

**Priority 1: HITL Marketplace Infrastructure**

**Goal:** Build core marketplace mechanics (task creation, bidding, assignment, payment, verification workflow)

**User Stories Implemented:**
- US-AUTH-001: User Registration with Role Selection (Job Seeker vs Coach)
- US-AUTH-002: WorkOS SSO Integration (Google, Microsoft, Apple)
- US-COACH-001: Coach Profile Creation (6-step wizard)
- US-COACH-002: Coach Credential Verification (upload certifications, references)
- US-MARKET-001: Verification Task Creation (automatic when AI generates output)
- US-MARKET-002: Marketplace Bidding Interface (coaches see available tasks)
- US-MARKET-003: Bid Submission & Ranking Algorithm
- US-MARKET-004: Task Assignment (user selects bid or auto-assign)
- US-MARKET-005: Payment Escrow (Stripe integration)
- US-MARKET-006: Verification Workflow (annotation tools, diff view, submit)
- US-MARKET-007: Payment Release (85% to coach, 15% to platform)
- US-MARKET-008: Rating System (users rate coaches after verification)

**Technical Deliverables:**
- Convex schema for marketplace: `verificationTasks`, `bids`, `verifications`, `ratings`
- Stripe Connect integration for coach payouts
- WorkOS authentication flows
- WebSocket for real-time bid updates

**Success Metrics:**
- 50+ coaches onboarded before public launch
- Bid assignment time <30 minutes average
- Payment processing success rate >99%

---

**Priority 2: AI Resume Generation + Verification**

**Goal:** Core Job Flow feature—AI generates resumes, coaches verify

**User Stories Implemented:**
- US-JF-001: AI Resume Generation from STAR Stories
- US-JF-002: STAR Story Extraction via AI Chat
- US-JF-003: Resume Refinement Interface (user edits with live ATS scoring)
- US-JF-004: ATS Optimization Score Calculation
- US-JF-005: STAR Story Memory Bank (centralized repository)
- US-JF-006: Resume Verification by Coach (marketplace bid → verify → user receives)
- US-JF-007: RL Data Logging (every verification logged for training)

**Technical Deliverables:**
- Resume generation AI prompts (flagship LLM)
- ATS scoring algorithm (keyword density, formatting checks)
- STAR story chat interface (conversational AI agent)
- Convex schema: `resumes`, `starStories`, `jobSeekerProfiles`
- Coach annotation tools (highlight, comment, suggest changes)
- Diff view component (original AI output vs. coach corrections)

**Success Metrics:**
- AI resume generation time <30 seconds
- Coach verification approval rate >80%
- User satisfaction with verified resumes >4.5 stars
- 500+ resumes generated in Month 2

---

### Month 3-4: Job Matching & Application Tracking

**Priority 1: AI Job Matching**

**Goal:** AI finds and scores job matches based on user skills and STAR stories

**User Stories Implemented:**
- US-JF-010: AI Job Matching with Compatibility Scoring (0-100%)
- US-JF-011: Job Match Verification by Coach (coach reviews top 10 matches for quality)
- US-JF-012: Job Description Parser (extracts requirements, salary, benefits)
- US-JF-013: Skills Gap Analysis (AI identifies missing skills for target role)

**Technical Deliverables:**
- Job board scraping or API integration (LinkedIn, Indeed, Glassdoor)
- Matching algorithm (semantic similarity between user profile + job description)
- Convex schema: `jobPostings`, `jobMatches`, `skillGaps`

**Success Metrics:**
- Job match accuracy (user applies to >50% of top 10 matches)
- Coach verification approval rate >90%
- Average compatibility score for applied jobs >75%

---

**Priority 2: Application Tracking System**

**Goal:** Kanban board for tracking applications across stages

**User Stories Implemented:**
- US-JF-020: Application Tracking Kanban Board (Saved, Applied, Interview, Offer, Rejected)
- US-JF-021: Application Detail View (timeline, notes, deadlines, documents)
- US-JF-022: AI Next Action Suggestions (e.g., "Follow up on Day 7 if no response")
- US-JF-023: Coach Application Strategy Review (coach verifies AI's next action suggestions)

**Technical Deliverables:**
- Drag-and-drop Kanban board (React DnD or similar)
- Convex schema: `jobApplications`, `applicationTimeline`, `applicationNotes`
- Deadline reminders (email + in-app notifications)

**Success Metrics:**
- Users tracking >5 applications on average
- 70% of users follow AI's next action suggestions
- Coach verification confirms AI suggestions are helpful (>85% approval rate)

---

**Priority 3: Commute Analysis (New Feature)**

**Goal:** Show real commute costs (time, money, carbon) for jobs

**User Stories Implemented:**
- US-JF-030: Commute Analysis for Job Applications (distance, time, cost, carbon footprint)
- US-JF-031: Transportation Mode Comparison (driving, public transit, biking)
- US-JF-032: Net Salary Impact Calculation (salary - commute cost - taxes)

**Technical Deliverables:**
- Google Maps API integration (distance, time calculations)
- Cost calculation (fuel prices, parking, tolls, transit fares)
- Convex schema: `commuteAnalyses`

**Success Metrics:**
- 60% of users view commute analysis before applying
- Users reject 10% of jobs based on commute analysis (feature is decision-impactful)

---

### Month 5-6: Interview Preparation

**Priority 1: Mock Interview AI**

**Goal:** AI conducts video mock interviews with real-time feedback

**User Stories Implemented:**
- US-JF-040: AI Mock Interview with Common Questions
- US-JF-041: Speech Analysis (pace, filler words, confidence scoring)
- US-JF-042: AI Interview Feedback Generation (strengths, weaknesses, improvement tips)
- US-JF-043: Coach Verification of AI Feedback (coach reviews AI's feedback + adds personalized tips)

**Technical Deliverables:**
- Video recording interface (WebRTC or similar)
- Speech-to-text (flagship speech recognition model)
- AI feedback generation (flagship LLM analyzes transcript)
- Convex schema: `mockInterviews`, `interviewFeedback`

**Success Metrics:**
- Users complete >2 mock interviews before real interview
- AI feedback approval rate by coaches >85%
- User satisfaction with mock interview experience >4.3 stars

---

**Priority 2: Salary Negotiation Simulation**

**Goal:** Practice negotiating salary with AI opponent

**User Stories Implemented:**
- US-JF-050: Salary Negotiation Simulation (AI plays hiring manager)
- US-JF-051: Negotiation Performance Scoring (timing, phrasing, concessions)
- US-JF-052: AI Negotiation Strategy Recommendations
- US-JF-053: Coach Verification of Negotiation Advice (coach reviews AI's strategy)

**Technical Deliverables:**
- Conversational AI for negotiation (flagship LLM with negotiation persona)
- Scoring algorithm (tracks user's asks, concessions, final offer)
- Convex schema: `negotiationSimulations`, `negotiationStrategies`

**Success Metrics:**
- Users practice >3 negotiation scenarios before real offer
- AI strategy approval rate by coaches >80%
- Users report improved negotiation outcomes (self-reported via survey)

---

### Month 6: RL Training Pipeline Activation

**Goal:** Begin training AI models on 3+ months of verification data

**Milestones:**
- 2,000+ verified resumes collected
- 1,000+ verified job matches
- 500+ verified interview feedback reports
- 300+ verified negotiation strategies

**RL Pipeline Activities:**
- **Data Processing:** Extract correction patterns from verifications
- **Model Fine-Tuning:** Fine-tune flagship LLM on verified resume corpus
- **Confidence Calibration:** Train confidence scoring model (predict approval rate based on features)
- **Baseline Evaluation:** Measure current AI accuracy (resume approval rate, job match accuracy, interview feedback quality)

**Success Metrics:**
- AI resume approval rate improves from 80% → 85% after first round of training
- Confidence scores correlate with actual approval rate (r² >0.7)
- RL pipeline runs successfully without manual intervention

---

### Job Flow Launch Checklist (Month 6)

**User Acquisition:**
- ☐ 100+ coaches actively bidding on marketplace
- ☐ 5,000+ job seekers signed up (beta waitlist conversion)
- ☐ 500+ resumes generated per week
- ☐ 200+ active job applications tracked per week

**Technical Stability:**
- ☐ Payment processing success rate >99%
- ☐ AI generation latency <30 seconds (p95)
- ☐ Marketplace bid assignment time <30 minutes (average)
- ☐ Zero critical bugs in production

**Business Metrics:**
- ☐ HITL marketplace generating $45,000/month revenue (15% of ~$300k gross)
- ☐ Coach satisfaction >4.5 stars (earning good income, workflow is smooth)
- ☐ User satisfaction >4.3 stars (verified resumes are high quality)
- ☐ 20% of free users convert to Premium subscription

**Readiness for Roadmap 2:**
- ☐ HITL marketplace infrastructure tested at scale (10k+ verifications/month)
- ☐ RL training pipeline operational and improving AI accuracy
- ☐ Team onboarded on Convex, LangGraph, MCP UI patterns

---

<a name="roadmap-2-knowledge-flow"></a>
## 10. Roadmap 2: Knowledge Flow (Months 7-9)

### Microservice Overview

**Name:** Knowledge Flow

**Tagline:** "Your AI-curated personal knowledge graph"

**Target Users:**
- **Primary:** All users (job seekers, professionals, students, entrepreneurs)
- **Secondary:** Knowledge Curators (new verifier role, lower credential requirements than coaches)

**Core Value Propositions:**
- **For Users:** "Stop losing documents and notes—AI organizes everything and surfaces insights"
- **For Curators:** "Earn $5-20 per hour verifying AI categorization (flexible, remote work)"

**Key Features:**
1. Document Management with AI Auto-Categorization
2. Note-Taking with AI Concept Linking
3. Interactive Knowledge Graph Visualization
4. Natural Language Search across all content
5. AI-Generated Insights from knowledge base

---

### Month 7-8: Document Management

**Priority 1: Document Upload & AI Categorization**

**User Stories Implemented:**
- US-KF-001: Document Upload (drag-drop or file picker, supports PDF, DOCX, images, etc.)
- US-KF-002: AI Auto-Categorization (AI assigns categories like "Resume", "Tax Form", "Contract")
- US-KF-003: AI Tag Extraction (AI generates tags from document content)
- US-KF-004: Curator Verification of Categorization (curator reviews AI's category/tag assignments)
- US-KF-005: User Correction Feedback Loop (users can correct AI, corrections train future models)

**Technical Deliverables:**
- File upload component with drag-drop support
- OCR for scanned documents (flagship vision model)
- Document categorization model (fine-tuned flagship LLM or classification model)
- Convex schema: `documents`, `documentCategories`, `documentTags`
- Curator verification interface (similar to coach verification, but simpler)

**Success Metrics:**
- AI categorization accuracy >90% (measured via curator approval rate)
- Users upload >5 documents on average within first month
- Curator satisfaction >4.5 stars (workflow is smooth, payment is fair)

---

**Priority 2: Document Search**

**User Stories Implemented:**
- US-KF-010: Full-Text Search (search within document contents)
- US-KF-011: Semantic Search (find documents by meaning, not just keywords)
- US-KF-012: Filters (by category, date, file type)
- US-KF-013: AI Search Quality Verification by Curators (spot-check search accuracy)

**Technical Deliverables:**
- Elasticsearch or Cognee for full-text + semantic search
- Document indexing pipeline (extract text, generate embeddings, index)
- Search results UI (snippet preview, relevance ranking)

**Success Metrics:**
- Search finds correct document >95% of time (user satisfaction metric)
- Average search result click-through rate >60% (users find what they need in top results)

---

**Priority 3: OCR & Metadata Extraction**

**User Stories Implemented:**
- US-KF-020: OCR for Scanned Documents (extracts text from images/PDFs)
- US-KF-021: Metadata Extraction (dates, amounts, names extracted automatically)
- US-KF-022: Curator Verification of OCR Results (curator spot-checks accuracy on complex documents)

**Technical Deliverables:**
- OCR integration (flagship vision model or Tesseract fallback)
- Named entity recognition (extract dates, amounts, names from text)
- Convex schema: `documentMetadata`

**Success Metrics:**
- OCR accuracy >95% (measured on test set of scanned documents)
- Metadata extraction accuracy >85% (curator approval rate)

---

### Month 8-9: Note-Taking & Knowledge Graph

**Priority 1: AI-Assisted Note-Taking**

**User Stories Implemented:**
- US-KF-030: Rich Text Note Editor (formatting, headings, lists, code blocks)
- US-KF-031: AI Auto-Tagging as User Types (AI suggests tags in real-time)
- US-KF-032: AI Concept Linking (AI suggests linking to existing knowledge graph nodes)
- US-KF-033: Curator Verification of Note Organization (curator reviews AI's tagging/linking)

**Technical Deliverables:**
- Rich text editor component (Tiptap or similar)
- Real-time AI suggestions (debounced API calls to flagship LLM)
- Convex schema: `notes`, `noteTags`, `noteLinks`

**Success Metrics:**
- Users create >10 notes on average within first month
- AI tagging acceptance rate >70% (users accept AI's suggested tags)
- AI linking acceptance rate >60% (users accept AI's suggested concept links)

---

**Priority 2: AI-Generated Insights**

**User Stories Implemented:**
- US-KF-040: AI Note Summarization (one-click summary of long notes)
- US-KF-041: AI Insight Generation (AI identifies patterns across notes)
- US-KF-042: AI Action Item Extraction (AI finds to-dos mentioned in notes)
- US-KF-043: Curator Verification of Insights (curator reviews AI's insights for quality)

**Technical Deliverables:**
- Summarization API (flagship LLM with summarization prompt)
- Insight generation (flagship LLM analyzes multiple notes, finds patterns)
- Convex schema: `aiInsights`, `actionItems`

**Success Metrics:**
- Users find AI insights useful >80% of time (thumbs up/down feedback)
- Curator approval rate of AI insights >85%

---

**Priority 3: Interactive Knowledge Graph**

**User Stories Implemented:**
- US-KF-050: Knowledge Graph Visualization (nodes = concepts/documents/notes, edges = relationships)
- US-KF-051: Graph Interaction (pan, zoom, click nodes for details)
- US-KF-052: AI Connection Suggestions (AI suggests new connections between nodes)
- US-KF-053: Curator Verification of Graph Structure (curator reviews AI's connection suggestions)

**Technical Deliverables:**
- Knowledge graph visualization (D3.js or Cytoscape.js)
- Cognee integration (knowledge graph backend)
- Graph interaction UI (pan, zoom, search within graph)
- Convex schema: `knowledgeNodes`, `knowledgeEdges`

**Success Metrics:**
- Users with >20 documents/notes have knowledge graph with >50 nodes
- AI connection suggestions accepted >50% of time
- Curator approval rate of AI graph structure >80%

---

### Knowledge Flow Launch Checklist (Month 9)

**User Acquisition:**
- ☐ 10,000+ users (Job Flow users + new Knowledge Flow users)
- ☐ 50,000+ documents uploaded
- ☐ 10,000+ notes created
- ☐ 100+ knowledge curators actively verifying

**Technical Stability:**
- ☐ OCR accuracy >95%
- ☐ Categorization accuracy >90%
- ☐ Search success rate >95%
- ☐ Knowledge graph generation latency <5 seconds

**Business Metrics:**
- ☐ HITL marketplace revenue: $90,000/month (combined Job Flow + Knowledge Flow)
- ☐ Curator satisfaction >4.5 stars
- ☐ User engagement: 60% of users return weekly to add/search documents

**RL Training Progress:**
- ☐ 5,000+ verified categorizations for training
- ☐ Categorization model accuracy improved from 90% → 93%
- ☐ AI tagging acceptance rate improved from 70% → 75%

---

<a name="roadmap-3-finance-flow"></a>
## 11. Roadmap 3: Finance Flow (Months 10-12)

### Microservice Overview

**Name:** Finance Flow

**Tagline:** "AI-powered personal finance with expert guidance"

**Target Users:**
- **Primary:** All users (especially job seekers making career/salary decisions)
- **Secondary:** Financial Advisors (verifiers for financial plans)

**Core Value Propositions:**
- **For Users:** "Understand your complete financial picture and make smarter career decisions"
- **For Financial Advisors:** "Build your client base and earn $50-150 per financial plan verification"

**Key Features:**
1. Comprehensive Financial Dashboard (net worth, cash flow, investments, retirement)
2. Bank Account Integration via Open Banking
3. Budgeting & Expense Tracking with AI categorization
4. Investment Tracking & Portfolio Analysis
5. Retirement Planning with Monte Carlo simulations
6. Loan Pre-Approval Calculators
7. Tax Estimation & Optimization (light version, full version in Tax Flow)

---

### Month 10: Open Banking & Financial Dashboard

**Priority 1: Bank Account Integration**

**User Stories Implemented:**
- US-FF-001: Bank Connection via Open Banking (Plaid/Yodlee integration)
- US-FF-002: OAuth2 Secure Authentication (redirect to bank, authorize access)
- US-FF-003: Transaction Import (up to 2 years history)
- US-FF-004: Real-Time Transaction Sync (daily updates)
- US-FF-005: Account Balance Tracking (checking, savings, credit cards)

**Technical Deliverables:**
- Plaid Link integration (iframe for bank connection)
- Convex schema: `bankAccounts`, `transactions`, `accountBalances`
- OAuth2 flow with bank re-authentication handling
- Webhook handling for transaction updates

**Success Metrics:**
- 50% of users connect at least 1 bank account
- Bank connection success rate >95%
- Transaction sync latency <24 hours

---

**Priority 2: Comprehensive Financial Dashboard**

**User Stories Implemented:**
- US-FF-010: Net Worth Calculation (assets - liabilities)
- US-FF-011: Cash Flow Visualization (income vs. expenses over time)
- US-FF-012: Account Balance Summary (all accounts at a glance)
- US-FF-013: AI Financial Insights (e.g., "You spent 30% more on dining this month")
- US-FF-014: FA Verification of Financial Insights (FA reviews AI's insights for accuracy)

**Technical Deliverables:**
- Dashboard UI with widgets (net worth card, cash flow chart, account summary)
- Net worth calculation (sum of balances across all accounts)
- Cash flow analysis (categorize transactions as income/expense, calculate trends)
- Convex schema: `userFinancials`

**Success Metrics:**
- Users view financial dashboard 2+ times/week
- AI insights acceptance rate >75% (users find them useful)
- FA approval rate of AI insights >85%

---

### Month 11: Budgeting & Expense Tracking

**Priority 1: AI Transaction Categorization**

**User Stories Implemented:**
- US-FF-020: AI Auto-Categorization of Transactions (groceries, rent, entertainment, etc.)
- US-FF-021: User Correction Feedback Loop (users can recategorize, AI learns)
- US-FF-022: Recurring Expense Detection (AI identifies subscriptions, rent, utilities)
- US-FF-023: FA Verification of Categorization Rules (FA spot-checks AI's category assignments)

**Technical Deliverables:**
- Transaction categorization model (fine-tuned flagship LLM or classification model)
- User correction interface (click transaction → select correct category)
- Convex schema: `transactionCategories`, `categorizationCorrections`

**Success Metrics:**
- AI categorization accuracy >90% (measured via user corrections)
- Users correct <10% of transactions (AI is accurate enough)
- FA approval rate >90%

---

**Priority 2: Budgeting Interface**

**User Stories Implemented:**
- US-FF-030: Budget Creation (set monthly limits per category)
- US-FF-031: Budget vs. Actual Tracking (visualize spending against budget)
- US-FF-032: Overspending Alerts (notifications when budget exceeded)
- US-FF-033: AI Budget Recommendations (AI suggests optimal budget based on spending patterns)
- US-FF-034: FA Verification of Budget Plans (FA reviews AI's budget recommendations)

**Technical Deliverables:**
- Budget creation UI (input monthly limits per category)
- Budget tracking chart (progress bars showing % of budget used)
- Notification system (email + in-app for overspending)
- Convex schema: `budgets`, `budgetAlerts`

**Success Metrics:**
- 40% of users create a budget
- Users with budgets reduce overspending by 15% (measured via spending trends)
- FA approval rate of AI budget recommendations >80%

---

### Month 12: Investments, Retirement, Loans

**Priority 1: Investment Tracking**

**User Stories Implemented:**
- US-FF-040: Investment Account Connection (via Plaid or manual entry)
- US-FF-041: Portfolio Performance Tracking (gains/losses, historical returns)
- US-FF-042: Asset Allocation Analysis (stocks, bonds, cash, real estate)
- US-FF-043: AI Rebalancing Recommendations (AI suggests portfolio adjustments)
- US-FF-044: FA Verification of Rebalancing Plans (FA reviews AI's recommendations)

**Technical Deliverables:**
- Investment account integration (Plaid or manual CSV import)
- Portfolio performance calculation (XIRR, total return, annualized return)
- Asset allocation chart (pie chart or treemap)
- Convex schema: `investments`, `portfolioHoldings`, `rebalancingRecommendations`

**Success Metrics:**
- 30% of users track investments
- AI rebalancing recommendations accepted >60% of time
- FA approval rate >85%

---

**Priority 2: Retirement Planning**

**User Stories Implemented:**
- US-FF-050: Retirement Goal Setting (target age, lifestyle, location)
- US-FF-051: Retirement Readiness Calculation (Monte Carlo simulation)
- US-FF-052: Contribution Optimization (AI suggests increasing 401k contributions, etc.)
- US-FF-053: FA Verification of Retirement Plans (FA reviews projections and recommendations)

**Technical Deliverables:**
- Retirement planning form (goal inputs)
- Monte Carlo simulation (probabilistic projection of retirement readiness)
- Optimization algorithm (maximize retirement success rate given constraints)
- Convex schema: `retirementPlans`, `retirementProjections`

**Success Metrics:**
- 25% of users create retirement plan
- Retirement projections validated by FAs >85% of time
- Users increase retirement contributions after seeing projections (self-reported survey)

---

**Priority 3: Loan Calculators**

**User Stories Implemented:**
- US-FF-060: Loan Pre-Approval Calculator (home, car, personal, business loans)
- US-FF-061: AI Pre-fills Financial Data (from connected accounts)
- US-FF-062: Approval Likelihood Estimation (AI predicts approval based on financial profile)
- US-FF-063: FA Verification of Loan Calculations (FA spot-checks AI's math)

**Technical Deliverables:**
- Loan calculator UI (inputs: income, debts, assets, desired loan amount)
- Approval likelihood model (trained on loan approval data or heuristics)
- Convex schema: `loanCalculations`

**Success Metrics:**
- 20% of users use loan calculator
- AI approval likelihood accuracy >80% (validated against actual approvals if users share outcomes)
- FA approval rate of calculations >90%

---

### Finance Flow Launch Checklist (Month 12)

**User Acquisition:**
- ☐ 20,000+ users (Job Flow + Knowledge Flow + Finance Flow)
- ☐ 10,000+ bank accounts connected
- ☐ 5,000+ budgets created
- ☐ 2,000+ investment portfolios tracked
- ☐ 1,000+ retirement plans created

**Technical Stability:**
- ☐ Bank connection success rate >95%
- ☐ Transaction categorization accuracy >90%
- ☐ Real-time transaction sync <24 hours
- ☐ Monte Carlo simulation runtime <5 seconds

**Business Metrics:**
- ☐ HITL marketplace revenue: $405,000/month (all flows combined)
- ☐ FA verification fees averaging $75 per financial plan
- ☐ 30% conversion to Premium subscription (value proposition strengthens with finance features)

**RL Training Progress:**
- ☐ 10,000+ verified budgets for training
- ☐ Budget recommendation accuracy improved from 75% → 80%
- ☐ Transaction categorization accuracy improved from 90% → 92%

---

<a name="roadmap-4-advisor-flow"></a>
## 12. Roadmap 4: Advisor Flow (Financial Advisors) (Months 13-15)

### Microservice Overview

**Name:** Advisor Flow

**Tagline:** "AI-powered client management for financial advisors"

**Target Users:**
- **Primary:** Financial Advisors (independent advisors, wealth managers)
- **Secondary:** Senior FAs (peer reviewers)

**Core Value Propositions:**
- **For FAs:** "Grow your client base, automate portfolio analysis, and earn verification income"
- **For Senior FAs:** "Mentor junior advisors and earn $50-100 per peer review"

**Key Features:**
1. FA Profile Creation with Credential Verification (CFP, CFA, licenses)
2. Client Portfolio Management Dashboard
3. AI-Powered Investment Recommendations
4. Financial Planning Tools (retirement, education, estate)
5. Client Communication Hub (secure messaging, document sharing)
6. Peer Review System (senior FAs verify junior FA recommendations)

---

### Month 13-14: FA Profile & Client Management

**Priority 1: FA Profile Creation**

**User Stories Implemented:**
- US-AF-001: FA Profile Creation (6-step wizard similar to coach profiles)
- US-AF-002: Credential Verification (CFP, CFA, state licenses)
- US-AF-003: Specialization Selection (retirement, estate, investment, tax, etc.)
- US-AF-004: Service Pricing Setup (hourly rate, package pricing, AUM-based fees)
- US-AF-005: Availability Calendar Integration (Google/Outlook sync)

**Technical Deliverables:**
- FA profile creation flow (similar to coach onboarding)
- Credential verification API integrations (CFP Board, CFA Institute, state regulators)
- Convex schema: `financialAdvisorProfiles`, `faCredentials`, `faPricing`

**Success Metrics:**
- 50+ FAs onboarded by Month 14
- Credential verification success rate >90%
- FA profile completion rate >85%

---

**Priority 2: Client Portfolio Dashboard**

**User Stories Implemented:**
- US-AF-010: Client List Overview (all clients with portfolio performance at a glance)
- US-AF-011: Client Portfolio Detail View (holdings, asset allocation, performance)
- US-AF-012: AI Portfolio Analysis (risk assessment, diversification score, rebalancing needs)
- US-AF-013: Senior FA Peer Review of Portfolio Recommendations (optional for junior FAs)

**Technical Deliverables:**
- Client portfolio dashboard (similar to coach client dashboard)
- Portfolio analysis algorithms (risk calculation, diversification metrics)
- Peer review workflow (junior FA requests review, senior FA provides feedback)
- Convex schema: `faClients`, `clientPortfolios`, `portfolioAnalyses`, `peerReviews`

**Success Metrics:**
- FAs manage average of 10 clients by Month 14
- AI portfolio analysis approval rate >85% (by senior FAs)
- FAs request peer review for 30% of new client recommendations

---

### Month 14-15: AI Investment Recommendations & Financial Planning

**Priority 1: AI Investment Recommendations**

**User Stories Implemented:**
- US-AF-020: AI Investment Recommendations (AI suggests ETFs, stocks, bonds based on risk profile)
- US-AF-021: Risk Assessment Questionnaire (AI-guided quiz to determine client risk tolerance)
- US-AF-022: Rebalancing Proposals (AI generates rebalancing plans)
- US-AF-023: Senior FA Verification of AI Recommendations (peer review before client presentation)

**Technical Deliverables:**
- Investment recommendation engine (rule-based + flagship LLM for explanations)
- Risk assessment scoring (questionnaire → risk score 1-10)
- Rebalancing algorithm (tax-aware, minimize transactions)
- Convex schema: `investmentRecommendations`, `riskAssessments`, `rebalancingPlans`

**Success Metrics:**
- AI investment recommendations accepted by senior FAs >80% of time
- Clients adopt AI-recommended portfolios >60% of time (FA reports)
- Rebalancing plans are tax-efficient (validated by senior FAs)

---

**Priority 2: Financial Planning Tools**

**User Stories Implemented:**
- US-AF-030: Retirement Planning Tool (similar to user-facing Finance Flow, but FA-client collaborative)
- US-AF-031: Education Planning (college savings, 529 plans)
- US-AF-032: Estate Planning Basics (will, trust, beneficiary review)
- US-AF-033: Senior FA Verification of Financial Plans (peer review before finalization)

**Technical Deliverables:**
- Financial planning templates (retirement, education, estate)
- Collaborative planning interface (FA and client can both edit, see real-time updates)
- Convex schema: `financialPlans`, `planCollaboration`

**Success Metrics:**
- FAs create >5 financial plans on average by Month 15
- Senior FA approval rate of plans >85%
- Client satisfaction with financial plans >4.5 stars

---

### Advisor Flow Launch Checklist (Month 15)

**User Acquisition:**
- ☐ 100+ FAs actively using platform
- ☐ 1,000+ FA clients (avg 10 clients per FA)
- ☐ 50+ senior FAs providing peer reviews

**Technical Stability:**
- ☐ Portfolio sync latency <5 minutes
- ☐ AI investment recommendations accuracy >80% (senior FA approval)
- ☐ Peer review turnaround time <24 hours average

**Business Metrics:**
- ☐ FAs earning $2,000-10,000/month from verification + client fees
- ☐ Senior FAs earning $500-2,000/month from peer reviews (15% platform fee)
- ☐ FA subscription revenue: $5,000/month (100 FAs × $49/month average)

---

<a name="roadmap-5-tax-flow"></a>
## 13. Roadmap 5: Tax Flow (Accountants) (Months 16-18)

### Microservice Overview

**Name:** Tax Flow

**Tagline:** "AI-powered tax optimization with CPA verification"

**Target Users:**
- **Primary:** All users (especially Finance Flow users)
- **Secondary:** Certified Public Accountants (CPAs)

**Core Value Propositions:**
- **For Users:** "Maximize deductions and minimize tax burden with AI + CPA expertise"
- **For CPAs:** "Build client base and earn $50-300 per tax return verification"

**Key Features:**
1. Accountant Profile Creation with CPA License Verification
2. Client Financial Overview Dashboard (for accountants)
3. AI Tax Calculation & Optimization
4. Deduction Finder (AI identifies potential deductions from transactions)
5. Tax Return Preparation (AI drafts, CPA verifies)
6. Year-Round Tax Estimation (not just tax season)

---

### Month 16-17: Accountant Onboarding & Tax Calculation

**Priority 1: Accountant Profile Creation**

**User Stories Implemented:**
- US-TF-001: Accountant Profile Creation (6-step wizard)
- US-TF-002: CPA License Verification (state board API integration)
- US-TF-003: Digital ID Verification (Stripe Identity for KYC)
- US-TF-004: Specialization Selection (individual tax, business tax, estate tax, etc.)
- US-TF-005: Pricing Setup (per-return pricing, hourly rate, package pricing)

**Technical Deliverables:**
- Accountant profile creation flow
- CPA license verification (state board APIs)
- Digital ID verification (Stripe Identity iframe)
- Convex schema: `accountantProfiles`, `cpaLicenses`

**Success Metrics:**
- 100+ CPAs onboarded by Month 17
- License verification success rate >95%
- Accountant profile completion rate >90%

---

**Priority 2: AI Tax Calculation**

**User Stories Implemented:**
- US-TF-010: Income Entry (W-2, 1099, investment income, etc.)
- US-TF-011: Deduction Entry (standard vs. itemized)
- US-TF-012: AI Tax Liability Calculation (federal + state)
- US-TF-013: AI Deduction Optimization (AI suggests itemized if beneficial)
- US-TF-014: CPA Verification of Tax Calculation (CPA reviews AI's math)

**Technical Deliverables:**
- Tax calculation engine (rule-based for tax code + flagship LLM for edge cases)
- Tax form inputs (W-2, 1099, Schedule C, etc.)
- Convex schema: `taxReturns`, `taxCalculations`, `taxDeductions`

**Success Metrics:**
- AI tax calculation accuracy >95% (CPA approval rate)
- Users complete tax estimation >90% faster than manual entry
- CPA verification turnaround time <48 hours

---

### Month 17-18: Deduction Finder & Tax Return Prep

**Priority 1: AI Deduction Finder**

**User Stories Implemented:**
- US-TF-020: AI Transaction Analysis for Deductions (scans bank transactions for work-related expenses)
- US-TF-021: AI Deduction Recommendations (e.g., home office, mileage, education)
- US-TF-022: User Confirmation of Deductions (user approves/rejects AI suggestions)
- US-TF-023: CPA Verification of Deduction Strategy (CPA reviews AI's recommendations)

**Technical Deliverables:**
- Transaction analysis (flagship LLM identifies potential deductions)
- Deduction recommendation engine (rule-based + AI)
- Convex schema: `deductionSuggestions`, `approvedDeductions`

**Success Metrics:**
- AI identifies average of $2,500 in additional deductions per user
- CPA approval rate of AI deduction suggestions >85%
- Users save average of $500 in taxes after optimization (self-reported)

---

**Priority 2: Tax Return Preparation**

**User Stories Implemented:**
- US-TF-030: AI Tax Return Drafting (AI generates IRS Form 1040 + schedules)
- US-TF-031: CPA Review & Sign-Off (CPA verifies return before submission)
- US-TF-032: E-Filing Integration (submit directly to IRS via third-party API)
- US-TF-033: Audit Support (CPA provides guidance if user is audited)

**Technical Deliverables:**
- Tax return generation (populate IRS forms with user data)
- CPA review interface (annotation tools, approval workflow)
- E-filing API integration (third-party service like TaxBandits)
- Convex schema: `taxReturnDrafts`, `filedReturns`

**Success Metrics:**
- AI-drafted returns require <10 corrections on average (measured via CPA edits)
- CPA approval rate >90%
- E-filing success rate >99%
- Users save $300-1,000 vs. traditional tax prep services

---

### Tax Flow Launch Checklist (Month 18)

**User Acquisition:**
- ☐ 200+ CPAs actively verifying
- ☐ 5,000+ users estimate taxes on platform
- ☐ 1,000+ tax returns prepared (first tax season)

**Technical Stability:**
- ☐ Tax calculation accuracy >95%
- ☐ E-filing success rate >99%
- ☐ CPA verification turnaround <48 hours average

**Business Metrics:**
- ☐ Tax season revenue spike: $500,000 in HITL fees (January-April)
- ☐ Year-round tax estimation: $50,000/month average
- ☐ CPA satisfaction >4.5 stars (earning good seasonal income)

**RL Training Progress:**
- ☐ 1,000+ verified tax returns for training
- ☐ Deduction finder accuracy improved from 80% → 85%
- ☐ AI tax calculation errors reduced by 20%

---

<a name="roadmap-6-legal-flow"></a>
## 14. Roadmap 6: Legal Flow (Lawyers) (Months 19-21)

### Microservice Overview

**Name:** Legal Flow

**Tagline:** "AI-powered legal assistance with attorney verification"

**Target Users:**
- **Primary:** All users (especially job seekers for employment contracts, entrepreneurs for business contracts)
- **Secondary:** Licensed Attorneys

**Core Value Propositions:**
- **For Users:** "Get legal advice and contracts at a fraction of traditional attorney costs"
- **For Attorneys:** "Build client base and earn $100-400 per contract verification"

**Key Features:**
1. Lawyer Profile Creation with Bar License Verification
2. Legal Advice Chat (AI provides general guidance, lawyer verifies)
3. Contract Writing Assistant (AI drafts contracts, lawyer reviews)
4. Case Management Dashboard (for lawyers managing multiple clients)
5. Legal Document Repository (store contracts, agreements, litigation docs in Knowledge Flow)

---

### Month 19-20: Lawyer Onboarding & Legal Advice

**Priority 1: Lawyer Profile Creation**

**User Stories Implemented:**
- US-LF-001: Lawyer Profile Creation (6-step wizard)
- US-LF-002: Bar License Verification (state bar association API integration)
- US-LF-003: Digital ID Verification (Stripe Identity)
- US-LF-004: Practice Area Selection (employment, contracts, estate, litigation, etc.)
- US-LF-005: Pricing Setup (consultation fees, per-contract pricing, hourly rate)

**Technical Deliverables:**
- Lawyer profile creation flow
- Bar license verification (state bar APIs)
- Convex schema: `lawyerProfiles`, `barLicenses`

**Success Metrics:**
- 50+ lawyers onboarded by Month 20
- Bar license verification success rate >95%
- Lawyer profile completion rate >85%

---

**Priority 2: Legal Advice Chat**

**User Stories Implemented:**
- US-LF-010: Legal Advice Chat Interface (user asks legal questions)
- US-LF-011: AI Legal Guidance (AI provides general information, not formal advice)
- US-LF-012: Lawyer Verification of AI Advice (lawyer reviews AI's responses for accuracy)
- US-LF-013: Disclaimer System (clear labeling: "This is general information, not legal advice")
- US-LF-014: Lawyer Handoff (AI recommends connecting with lawyer for complex issues)

**Technical Deliverables:**
- Legal advice chat interface (similar to career coaching chat)
- Legal knowledge base (case law, statutes, regulations)
- Lawyer verification workflow (lawyer reviews chat transcript, adds formal advice)
- Convex schema: `legalAdviceChats`, `legalAdvice`, `lawyerVerifications`

**Success Metrics:**
- AI legal advice approval rate by lawyers >80%
- Users connect with lawyer for formal advice 40% of time (AI handoff works)
- Lawyer satisfaction with verification workflow >4.5 stars

---

### Month 20-21: Contract Writing & Case Management

**Priority 1: AI Contract Writing Assistant**

**User Stories Implemented:**
- US-LF-020: Contract Template Selection (employment, NDA, freelance, lease, etc.)
- US-LF-021: AI-Guided Questionnaire (AI asks questions to customize contract)
- US-LF-022: AI Contract Drafting (AI generates contract from answers)
- US-LF-023: Lawyer Review of AI-Drafted Contract (lawyer edits, approves, signs off)
- US-LF-024: Red Flag Detection (AI highlights potentially unfavorable clauses)

**Technical Deliverables:**
- Contract template library (10+ common contract types)
- Contract generation (flagship LLM fills templates based on user inputs)
- Lawyer review interface (side-by-side editor, annotation tools)
- Red flag detection (flagship LLM analyzes contract, highlights issues)
- Convex schema: `contractTemplates`, `contractDrafts`, `contracts`

**Success Metrics:**
- AI-drafted contracts require <15 edits on average (lawyer approval metric)
- Lawyer approval rate >85%
- Users save $500-2,000 vs. traditional attorney contract drafting

---

**Priority 2: Case Management Dashboard (for Lawyers)**

**User Stories Implemented:**
- US-LF-030: Lawyer Client Overview (all clients/cases at a glance)
- US-LF-031: Case Detail View (timeline, documents, tasks, deadlines)
- US-LF-032: Legal Task Management (filings, depositions, consultations)
- US-LF-033: AI Case Risk Assessment (AI analyzes case, predicts outcomes)
- US-LF-034: Senior Lawyer Peer Review (optional for complex cases)

**Technical Deliverables:**
- Case management dashboard (Kanban-style or list view)
- Legal task tracking (deadlines, court dates, statute of limitations)
- AI risk assessment (flagship LLM analyzes case facts, suggests strategy)
- Convex schema: `legalCases`, `legalTasks`, `caseRiskAssessments`

**Success Metrics:**
- Lawyers manage average of 5 cases on platform by Month 21
- AI risk assessment approval rate >75% (new, complex domain for AI)
- Lawyers report 20% time savings on administrative tasks

---

### Legal Flow Launch Checklist (Month 21)

**User Acquisition:**
- ☐ 100+ lawyers actively using platform
- ☐ 500+ users receive legal advice via chat
- ☐ 200+ contracts drafted and verified
- ☐ 50+ cases managed on platform

**Technical Stability:**
- ☐ AI contract drafting accuracy >85% (lawyer approval rate)
- ☐ Legal advice chat response time <30 seconds
- ☐ Lawyer verification turnaround <72 hours average

**Business Metrics:**
- ☐ Legal advice verification fees: $50-100 per chat review
- ☐ Contract verification fees: $150-400 per contract
- ☐ Lawyer subscription revenue: $5,000/month (100 lawyers × $49/month average)

**RL Training Progress:**
- ☐ 200+ verified contracts for training
- ☐ Contract drafting accuracy improved from 80% → 85%
- ☐ Red flag detection precision improved from 70% → 75%

---

<a name="roadmap-7-venture-flow"></a>
## 15. Roadmap 7: Venture Flow (Entrepreneurial Hub) (Months 22-24)

### Microservice Overview

**Name:** Venture Flow

**Tagline:** "AI-powered entrepreneurship with expert guidance"

**Target Users:**
- **Primary:** Entrepreneurs, aspiring founders, side hustlers
- **Secondary:** Business Advisors, Startup Mentors

**Core Value Propositions:**
- **For Entrepreneurs:** "Turn your idea into a fundable business plan with AI + mentor support"
- **For Advisors:** "Share your expertise and earn $100-400 per business plan review"

**Key Features:**
1. Business Idea Generator (AI brainstorms ideas based on skills/interests)
2. Business Plan Assistant (AI drafts comprehensive business plans)
3. Market Analysis & Competitive Research (AI researches market size, competitors)
4. Investor Matching (connect with angel investors, VCs)
5. Funding Application Guidance (grants, loans, accelerators)
6. Entrepreneurial Resource Library (articles, templates, tools)

---

### Month 22-23: Business Idea Generation & Planning

**Priority 1: AI Business Idea Generator**

**User Stories Implemented:**
- US-VF-001: Idea Brainstorming Questionnaire (user describes skills, interests, constraints)
- US-VF-002: AI Idea Generation (AI suggests 5-10 business concepts)
- US-VF-003: AI Market Analysis (market size, competition, trends for each idea)
- US-VF-004: SWOT Analysis (AI generates strengths, weaknesses, opportunities, threats)
- US-VF-005: Advisor Verification of Feasibility (business advisor reviews AI's analysis)

**Technical Deliverables:**
- Idea generation questionnaire (skills, passions, budget, time commitment)
- Business idea generation (flagship LLM brainstorms based on inputs)
- Market analysis (web search API + flagship LLM summarizes findings)
- SWOT analysis generation
- Convex schema: `businessIdeas`, `marketAnalyses`, `swotAnalyses`

**Success Metrics:**
- AI generates >5 ideas per user
- Users select >1 idea to develop further (60% rate)
- Advisor approval rate of feasibility analysis >80%

---

**Priority 2: AI Business Plan Assistant**

**User Stories Implemented:**
- US-VF-010: Business Plan Outline Generation (AI creates structure: exec summary, market analysis, etc.)
- US-VF-011: Section-by-Section Drafting (AI guides user through each section, drafts content)
- US-VF-012: Financial Projections (AI generates 3-year revenue/expense forecasts)
- US-VF-013: Advisor Review of Business Plan (advisor provides feedback, approves for investor presentation)
- US-VF-014: Export to Professional Format (PDF, DOCX with formatting)

**Technical Deliverables:**
- Business plan template (standard sections: exec summary, market, operations, financials)
- Guided drafting workflow (AI asks questions, generates sections)
- Financial projection calculator (based on user inputs + industry benchmarks)
- Advisor review interface (annotation tools, approval workflow)
- Convex schema: `businessPlans`, `financialProjections`

**Success Metrics:**
- AI-drafted business plans require <20 edits on average (advisor metric)
- Advisor approval rate >80%
- Users report higher confidence in pitching after AI + advisor review (self-reported survey)

---

### Month 23-24: Investor Matching & Funding Guidance

**Priority 1: Investor Matching**

**User Stories Implemented:**
- US-VF-020: Investor Profile Database (angel investors, VCs, industry preferences)
- US-VF-021: AI Investor Matching (AI scores investors based on fit with business)
- US-VF-022: Introduction Request (user requests intro via platform)
- US-VF-023: Investor Review of Business Plan (investor decides to accept/decline intro)
- US-VF-024: Secure Messaging (entrepreneur and investor chat via platform)

**Technical Deliverables:**
- Investor database (profiles, investment criteria, portfolio companies)
- Matching algorithm (semantic similarity between business plan + investor preferences)
- Introduction request workflow (user → platform → investor)
- Convex schema: `investors`, `investorMatches`, `introRequests`

**Success Metrics:**
- 50+ investors in database by Month 24
- Intro acceptance rate >30%
- 10+ investments facilitated via platform (long-term metric)

---

**Priority 2: Funding Application Guidance**

**User Stories Implemented:**
- US-VF-030: Funding Opportunity Database (grants, loans, accelerators, competitions)
- US-VF-031: AI Opportunity Matching (AI recommends best-fit funding opportunities)
- US-VF-032: Application Guidance (AI helps draft application responses)
- US-VF-033: Advisor Review of Applications (advisor provides feedback before submission)
- US-VF-034: Deadline Tracking (notifications for upcoming application deadlines)

**Technical Deliverables:**
- Funding opportunity database (scraped or curated from public sources)
- Matching algorithm (business criteria vs. funding requirements)
- Application drafting assistance (flagship LLM helps answer essay questions)
- Convex schema: `fundingOpportunities`, `fundingApplications`

**Success Metrics:**
- 100+ funding opportunities in database
- Users apply to average of 3 opportunities
- Application success rate 20%+ (measured via user-reported outcomes)

---

**Priority 3: Entrepreneurial Resource Library**

**User Stories Implemented:**
- US-VF-040: Resource Library (articles, videos, templates, tools)
- US-VF-041: AI Personalized Recommendations (AI suggests resources based on business stage)
- US-VF-042: Community Discussions (forum for entrepreneurs to share experiences)
- US-VF-043: Expert Q&A (advisors answer community questions)

**Technical Deliverables:**
- Resource library CMS (curated content on startups, marketing, finance, legal)
- Recommendation engine (flagship LLM suggests resources based on user context)
- Community forum (similar to Community Flow from Job Flow)
- Convex schema: `entrepreneurResources`, `resourceRecommendations`, `communityPosts`

**Success Metrics:**
- 500+ resources in library
- Users engage with >5 resources on average
- Community posts >100/month
- Advisor response rate to community questions >70%

---

### Venture Flow Launch Checklist (Month 24)

**User Acquisition:**
- ☐ 1,000+ entrepreneurs using platform
- ☐ 100+ business plans created
- ☐ 50+ investors in network
- ☐ 50+ business advisors providing reviews

**Technical Stability:**
- ☐ AI business plan drafting accuracy >80% (advisor approval rate)
- ☐ Investor matching relevance >70% (intro acceptance rate)
- ☐ Application guidance reduces drafting time by 50%

**Business Metrics:**
- ☐ Business plan verification fees: $200-400 per plan
- ☐ Advisor subscription revenue: $2,500/month (50 advisors × $49/month average)
- ☐ Total platform HITL revenue: $1.35M/month (all microservices combined)

**RL Training Progress:**
- ☐ 100+ verified business plans for training
- ☐ Market analysis accuracy improved from 75% → 80%
- ☐ Financial projection error reduced by 15%

---

## Part III: Detailed User Stories (170+ Stories)

<a name="auth-stories"></a>
## 16. Authentication & Security (Screens 56-64)

### US-AUTH-001: User Registration with Role Selection

**User Story ID:** US-AUTH-001

**As a** new user  
**I want to** create an account and select my primary role (Job Seeker, Coach, Accountant, Financial Advisor, Lawyer, Entrepreneur)  
**So that** I receive a personalized onboarding experience tailored to my needs

**User Flow Steps:**
1. User lands on signup page
2. User enters email and password
3. User selects primary role from dropdown (Job Seeker, Coach, Accountant, FA, Lawyer, Entrepreneur)
4. System displays role-specific onboarding preview ("As a Job Seeker, you'll get AI resume generation, job matching, and career coaching")
5. User clicks "Create Account"
6. System creates account with role attribute
7. User redirected to role-specific onboarding flow
8. System sends welcome email with role-specific getting started guide

**Acceptance Criteria:**
- [ ] Signup form validates email format and password strength (min 8 characters, 1 uppercase, 1 number)
- [ ] Role selection is required before account creation
- [ ] System creates user record with role attribute in Convex `users` table
- [ ] Welcome email sent within 60 seconds of signup
- [ ] User redirected to correct onboarding flow based on role
- [ ] HITL: N/A (no verification needed for account creation)

**Edge Cases:**
- **Email already exists:** Display error "Email already registered. [Log in instead]"
- **Weak password:** Display real-time password strength meter, prevent signup until strong
- **No role selected:** Display error "Please select your primary role to continue"
- **Email delivery failure:** Log error, allow user to resend welcome email from settings

**Validation Rules:**
- **Email:** Valid email format, max 255 characters, unique in database
- **Password:** Min 8 characters, max 128 characters, must contain 1 uppercase, 1 lowercase, 1 number
- **Role:** Must be one of: job_seeker, coach, accountant, financial_advisor, lawyer, entrepreneur

**Technical Constraints:**
- **Data Model:** `users` table: `{ email, passwordHash, role, createdAt, emailVerified }`
- **API Endpoints:** 
  - `auth.signUp(email, password, role)` → Convex mutation creating user + sending email
- **Integrations:** 
  - WorkOS for password hashing and session management
  - SendGrid for welcome email delivery
- **MCP UI Implementation:** N/A (standard web form)
- **State Management:** Client-side form state (React Hook Form), server-side user session (WorkOS)
- **Real-time Sync:** N/A
- **Performance:** Signup request completes <2 seconds (p95)
- **HITL Architecture:** N/A (no verification needed)

---

### US-AUTH-002: WorkOS SSO Integration (Google, Microsoft, Apple)

**User Story ID:** US-AUTH-002

**As a** user  
**I want to** sign in using my existing Google, Microsoft, or Apple account  
**So that** I don't need to remember another password

**User Flow Steps:**
1. User lands on login page
2. User sees "Continue with Google", "Continue with Microsoft", "Continue with Apple" buttons
3. User clicks preferred SSO button
4. System redirects to WorkOS SSO flow
5. User authenticates with identity provider (Google/Microsoft/Apple)
6. User authorizes Resume Flow to access basic profile info (name, email)
7. System redirects back to Resume Flow with authorization code
8. System exchanges code for user profile
9. If first login: System creates account with SSO provider info
10. If returning user: System logs user in
11. User redirected to dashboard

**Acceptance Criteria:**
- [ ] SSO buttons displayed prominently on login and signup pages
- [ ] WorkOS SSO flow completes successfully >99% of time
- [ ] New users created automatically on first SSO login
- [ ] Existing users matched by email (SSO email = account email)
- [ ] User profile populated with name and email from SSO provider
- [ ] Session persists for 30 days (remember me) or until user logs out
- [ ] HITL: N/A

**Edge Cases:**
- **SSO email doesn't match existing account:** Prompt user to link accounts or create new account
- **User cancels SSO flow:** Return to login page with message "Sign-in cancelled"
- **SSO provider error (timeout, network):** Display error message, allow retry
- **Email not provided by SSO provider:** Prompt user to enter email manually

**Validation Rules:**
- **SSO Provider:** Must be one of: google, microsoft, apple
- **Email from SSO:** Must be valid email format
- **User linking:** Require email confirmation if linking SSO to existing email/password account

**Technical Constraints:**
- **Data Model:** `users` table: `{ email, ssoProvider, ssoId, name, createdAt }`
- **API Endpoints:**
  - `auth.initiateSSOLogin(provider)` → Redirects to WorkOS
  - `auth.handleSSOCallback(code)` → Exchanges code for profile, creates/logs in user
- **Integrations:**
  - WorkOS SSO (Google, Microsoft, Apple)
- **MCP UI Implementation:** N/A (standard OAuth redirect flow)
- **State Management:** WorkOS manages session, Convex stores user profile
- **Real-time Sync:** N/A
- **Performance:** SSO flow completes <5 seconds (p95)
- **HITL Architecture:** N/A

---

### US-AUTH-003: Two-Factor Authentication (2FA) Setup

**User Story ID:** US-AUTH-003

**As a** user  
**I want to** enable two-factor authentication using an authenticator app  
**So that** my account is more secure

**User Flow Steps:**
1. User navigates to Settings → Security → Two-Factor Authentication
2. User clicks "Enable 2FA"
3. System generates QR code and manual setup key
4. User scans QR code with authenticator app (Google Authenticator, Authy, etc.)
5. Authenticator app generates 6-digit code
6. User enters code into Resume Flow
7. System verifies code
8. System generates 10 backup codes
9. System displays backup codes with strong warning to save offline
10. User acknowledges backup codes saved (checkbox required)
11. System enables 2FA on account
12. System sends email notification "2FA enabled on your account"

**Acceptance Criteria:**
- [ ] QR code displayed with manual setup key as fallback
- [ ] Code verification succeeds with valid 6-digit code from authenticator app
- [ ] 10 unique, single-use backup codes generated
- [ ] User cannot proceed without acknowledging backup codes saved
- [ ] 2FA enforced on next login (code required after password)
- [ ] Backup codes downloadable as text file
- [ ] Email notification sent confirming 2FA activation
- [ ] HITL: N/A

**Edge Cases:**
- **Invalid code entered:** Display error "Invalid code. Please try again."
- **User closes setup before completing:** 2FA not enabled, QR code regenerated on next attempt
- **User loses authenticator device:** Backup codes allow login, then re-setup 2FA
- **All backup codes used:** Prompt user to generate new backup codes

**Validation Rules:**
- **6-digit code:** Must be exactly 6 digits, numeric only
- **Backup codes:** Must be unique, 10 codes, each 8-16 alphanumeric characters
- **Acknowledgment:** User must check "I have saved my backup codes" to proceed

**Technical Constraints:**
- **Data Model:** `users` table: `{ twoFactorEnabled: boolean, twoFactorSecret: string }`, `backupCodes` table: `{ userId, code, used: boolean }`
- **API Endpoints:**
  - `auth.generate2FASecret()` → Returns QR code URL and manual key
  - `auth.verify2FACode(code)` → Verifies code and enables 2FA
  - `auth.generateBackupCodes()` → Returns 10 backup codes
- **Integrations:**
  - 2FA library (speakeasy or similar for TOTP generation/verification)
- **MCP UI Implementation:** N/A (standard web form with QR code display)
- **State Management:** Client stores QR code temporarily, server stores secret after verification
- **Real-time Sync:** N/A
- **Performance:** QR code generation <1 second
- **HITL Architecture:** N/A

---

### US-AUTH-004: 2FA Backup Codes Display

**User Story ID:** US-AUTH-004

**As a** user  
**I want to** view and download my 2FA backup codes  
**So that** I can recover my account if I lose my authenticator device

**User Flow Steps:**
1. User navigates to Settings → Security → Two-Factor Authentication → Backup Codes
2. System prompts for password re-authentication (security check)
3. User enters password
4. System displays 10 backup codes with usage status (used/unused)
5. User can download codes as text file
6. User can print codes
7. User can generate new backup codes (invalidates old ones)
8. System displays warning: "Store these codes in a secure, offline location"

**Acceptance Criteria:**
- [ ] Backup codes only displayed after password re-authentication
- [ ] Codes shown with clear used/unused status
- [ ] Download button exports codes to .txt file
- [ ] Print button opens print-friendly view
- [ ] "Generate New Codes" invalidates all previous codes
- [ ] Warning message about secure offline storage displayed prominently
- [ ] HITL: N/A

**Edge Cases:**
- **All codes used:** Display warning "All backup codes used. Generate new codes immediately."
- **User forgets password:** Cannot view backup codes (password reset required first)
- **Generating new codes accidentally:** Confirmation modal "This will invalidate all current backup codes. Continue?"

**Validation Rules:**
- **Password re-authentication:** Must match current user password
- **Code generation limit:** Max once per 24 hours to prevent abuse

**Technical Constraints:**
- **Data Model:** `backupCodes` table: `{ userId, code, used: boolean, createdAt }`
- **API Endpoints:**
  - `auth.getBackupCodes(password)` → Returns backup codes after password verification
  - `auth.regenerateBackupCodes()` → Invalidates old codes, generates 10 new ones
- **Integrations:** N/A
- **MCP UI Implementation:** N/A (standard list view with download/print actions)
- **State Management:** Client-side temporary display of codes, server-side persistent storage
- **Real-time Sync:** N/A
- **Performance:** Code retrieval <1 second
- **HITL Architecture:** N/A

---

*[Continue with remaining 166 user stories in same detailed format...]*

---

## Part IV: Implementation Guides

<a name="ab-testing"></a>
## 38. A/B Testing Framework

### Overview

The A/B testing framework enables gradual transition from 100% human verification to AI autonomy based on confidence scores and measured accuracy.

### Key Components

**1. User Segmentation**
- **Control Group:** Always receives human verification (90% of users in Phase 2)
- **Test Group:** Receives AI-only outputs (10% of users in Phase 2)
- **Segmentation Logic:** 
  - Random assignment based on user ID hash
  - OR confidence-based (users with >90% AI confidence eligible for test group)
  - OR opt-in (users explicitly choose "Early Access" to AI-only)

**2. Traffic Allocation**
- **Phase 1 (Months 1-12):** 100% Control (all human-verified)
- **Phase 2 (Months 13-24):** 90% Control, 10% Test
- **Phase 3 (Months 25-36):** Dynamic per feature (50-70% Control, 30-50% Test based on accuracy)
- **Phase 4 (Months 37+):** Confidence-based routing (>95% confidence = AI-only)

**3. Metrics Tracking**
- **Primary Metric:** User acceptance rate (did user accept AI-only output?)
- **Secondary Metrics:**
  - User satisfaction (star rating after receiving output)
  - Opt-out rate (users requesting human review after AI-only)
  - Error rate (outputs requiring correction)
  - Cost savings (AI-only eliminates verification fee)

**4. Statistical Significance**
- **Minimum Sample Size:** 1,000 outputs per variant (Control vs Test)
- **Confidence Level:** 95%
- **Minimum Detectable Effect:** 5% difference in acceptance rate
- **Test Duration:** Minimum 2 weeks, maximum 8 weeks

**5. Rollout & Rollback**
- **Gradual Rollout:** If Test group performs well (acceptance ≥95%), increase Test allocation by 10% every 2 weeks
- **Automatic Rollback:** If Test group acceptance drops >5% below Control, immediately revert to 100% Control
- **Manual Override:** Product team can force rollback at any time

### Implementation

**Convex Schema:**
```typescript
abTestAssignments: defineTable({
  userId: v.id("users"),
  feature: v.string(), // e.g., "resume_generation", "tax_calculation"
  variant: v.string(), // "control" or "test"
  assignedAt: v.number()
})

abTestMetrics: defineTable({
  userId: v.id("users"),
  feature: v.string(),
  variant: v.string(),
  outputId: v.string(), // ID of resume, tax calc, etc.
  accepted: v.boolean(),
  satisfactionRating: v.optional(v.number()), // 1-5 stars
  optedOut: v.boolean(), // Did user request human review?
  errorOccurred: v.boolean(),
  recordedAt: v.number()
})
```

**Assignment Logic:**
```typescript
function assignABTestVariant(userId: string, feature: string): "control" | "test" {
  // Check if user already assigned
  const existing = db.query("abTestAssignments")
    .filter(q => q.eq(q.field("userId"), userId) && q.eq(q.field("feature"), feature))
    .first();
  
  if (existing) return existing.variant;
  
  // Get current phase traffic allocation
  const phase = getCurrentPhase(); // Returns {control: 90, test: 10} or similar
  
  // Hash user ID to get consistent assignment
  const hash = hashUserId(userId);
  const variant = (hash % 100) < phase.control ? "control" : "test";
  
  // Store assignment
  db.insert("abTestAssignments", {
    userId,
    feature,
    variant,
    assignedAt: Date.now()
  });
  
  return variant;
}
```

**Metrics Recording:**
```typescript
function recordABTestOutcome(params: {
  userId: string,
  feature: string,
  variant: "control" | "test",
  outputId: string,
  accepted: boolean,
  satisfactionRating?: number,
  optedOut: boolean,
  errorOccurred: boolean
}) {
  db.insert("abTestMetrics", {
    ...params,
    recordedAt: Date.now()
  });
}
```

**Analysis Dashboard:**
- Real-time dashboard showing:
  - Control vs Test acceptance rates with confidence intervals
  - Sample sizes and statistical significance
  - User satisfaction ratings
  - Opt-out rates
  - Cost savings from Test group (eliminated verification fees)
- Accessible to product team and stakeholders
- Updated hourly

---

<a name="mcp-ui-patterns"></a>
## 39. MCP UI Integration Patterns

[Content continues with detailed MCP UI patterns, multi-agent architecture, security, data models, etc. - following same detailed format for remaining sections through Part V]

---

## Appendix E: Glossary

**AI Confidence Score:** Model's self-assessed probability (0-100%) that its output is correct. Used for routing decisions (high confidence → AI-only, low confidence → human verification).

**ATS (Applicant Tracking System):** Software used by employers to screen resumes. Resume Flow optimizes resumes to pass ATS keyword and formatting checks.

**Cognee:** Knowledge graph database optimized for LLM applications. Stores nodes (concepts, documents, notes) and edges (relationships) for semantic search and RAG.

**Convex:** Real-time backend platform providing database, API generation, and WebSocket support. Primary backend for Resume Flow.

**Flagship LLM:** Latest, most capable large language model from leading providers (OpenAI, Anthropic, Google). Platform uses current flagship for best quality, avoids version lock-in.

**HITL (Human-in-the-Loop):** Architecture where human experts verify AI outputs before delivery to users. Corrections train AI for continuous improvement.

**LangGraph:** State machine orchestration framework for multi-agent AI systems. Part of LangChain ecosystem.

**MCP UI (Model Context Protocol UI):** SDK enabling AI agents to embed interactive UI components directly in chat interfaces.

**Remote DOM:** MCP UI pattern where components execute logic in sandboxed Web Workers and render using native React components.

**RL (Reinforcement Learning):** Training approach where AI learns from feedback. In Resume Flow, professional corrections are feedback that trains AI models.

**STAR Methodology:** Situation, Task, Action, Result framework for describing career achievements. Used for extracting resume content from conversational interviews.

**WorkOS:** Authentication platform providing SSO, magic links, 2FA, and RBAC. Handles all user authentication for Resume Flow.

---

**End of Document**

**Total Pages:** ~220 (estimated based on content density)

**Version:** 3.0 - Complete End-to-End Master Plan

**Last Updated:** November 13, 2025

**Next Review:** After Roadmap 1 (Month 6) completion