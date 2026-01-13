# Signal Data Model

## Overview

Signal's data model centers around Users creating Designs for various social media Platforms. Designs are organized into Projects and can use Templates as starting points. Brands ensure visual consistency across all designs.

## Entity Descriptions

### User
A person using Signal, with authentication credentials, subscription status, and personal preferences. Users create and manage their visual content across social platforms.

### Design
A single visual creation such as a banner, post, or thumbnail. Contains the canvas state, layers, elements, and export settings. Designs are the core work product of Signal.

### Project
A container that groups related designs together for organization. Projects help users manage collections of designs for campaigns, clients, or themes.

### Template
A pre-designed starting point that users can customize. Templates provide professional layouts organized by platform and use case to accelerate the design process.

### Brand
A collection of colors, fonts, logos, and style guidelines that ensure visual consistency. Users can apply their brand to any design for cohesive professional presence.

### Platform
A social media destination such as LinkedIn, YouTube, Instagram, Facebook, TikTok, or X. Each platform has specific format presets, dimensions, and safe zone requirements.

### VoiceSession
A conversation with the voice agent, tracking commands, context, and design modifications. Voice sessions enable hands-free design through natural language.

## Relationships

```
User (1) ─────< (N) Project
User (1) ─────< (N) Brand
User (1) ─────< (N) VoiceSession

Project (1) ─────< (N) Design

Design (N) >───── (1) Project
Design (N) >───── (1) Platform
Design (N) >───── (0..1) Template
Design (N) >───── (0..1) Brand

Template (N) >───── (1) Platform

VoiceSession (N) >───── (0..1) Design
```

## Key Constraints

- A Design must target exactly one Platform (determines dimensions)
- A Design must belong to a Project
- A User can have one active Brand at a time
- Templates are read-only (users create Designs from them)
- VoiceSessions are linked to a User and optionally to the Design being modified
