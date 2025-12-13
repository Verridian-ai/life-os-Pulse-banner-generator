# Contributing to Nanobanna Pro

Thank you for your interest in contributing to Nanobanna Pro! This document provides guidelines and best practices for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all.

### Our Standards

**Positive behavior includes:**

- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Unacceptable behavior includes:**

- Harassment, trolling, or discriminatory comments
- Publishing others' private information
- Other conduct considered inappropriate

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Initial Setup

1. **Fork the repository**

   ```bash
   # Click "Fork" button on GitHub
   ```

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/nanobanna-pro.git
   cd nanobanna-pro
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/nanobanna-pro.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Copy environment file**

   ```bash
   cp .env .env.local
   # Edit .env.local with your credentials
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

---

## Development Workflow

### Branch Strategy

```
main (production)
  └─ develop (staging)
      └─ feature/your-feature (your work)
```

### Creating a Feature Branch

```bash
# Update your local develop branch
git checkout develop
git pull upstream develop

# Create feature branch
git checkout -b feature/your-feature-name
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `hotfix/` - Emergency fixes for production
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions or updates
- `chore/` - Maintenance tasks

**Examples:**

- `feature/voice-agent-improvements`
- `fix/canvas-export-bug`
- `docs/update-deployment-guide`

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types for all functions and variables
- Avoid `any` type unless absolutely necessary
- Use interfaces for object shapes

**Example:**

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): User | null {
  // implementation
}

// Bad
function getUser(id: any): any {
  // implementation
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use proper prop typing

**Example:**

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};
```

### Code Style

- Follow existing code style
- Use Prettier for formatting (runs automatically)
- Use ESLint rules (runs on commit)
- Use meaningful variable and function names
- Keep functions small (max 50 lines recommended)
- Add comments for complex logic

### File Organization

```
src/
├── components/
│   ├── features/      # Feature-specific components
│   ├── layout/        # Layout components
│   └── accessibility/ # Accessibility components
├── services/          # API and service integrations
├── hooks/             # Custom React hooks
├── context/           # React context providers
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

---

## Testing Guidelines

### Writing Tests

- Write tests for all new features
- Maintain or improve code coverage
- Test edge cases and error scenarios
- Use descriptive test names

**Example:**

```typescript
describe('generateImage', () => {
  it('should generate image with valid prompt', async () => {
    const result = await generateImage('test prompt', [], '1K');
    expect(result).toBeDefined();
  });

  it('should throw error for empty prompt', async () => {
    await expect(generateImage('', [], '1K')).rejects.toThrow();
  });

  it('should handle API failures gracefully', async () => {
    // Mock API failure
    // Test error handling
  });
});
```

### Running Tests

```bash
# Run all tests
npx vitest run

# Run tests in watch mode
npx vitest watch

# Run tests with coverage
npx vitest run --coverage
```

### Coverage Requirements

- Statements: 70%
- Branches: 65%
- Functions: 65%
- Lines: 70%

---

## Commit Guidelines

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or updates
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```bash
feat(voice): add support for OpenAI Realtime API

- Implemented OpenAIRealtimeClient class
- Added voice provider selection in settings
- Updated ActionExecutor for OpenAI tool calls

Closes #123
```

```bash
fix(canvas): resolve export issue with large images

The canvas export was failing for images larger than 10MB.
Fixed by compressing images before export.

Fixes #456
```

### Commit Best Practices

- Keep commits atomic and focused
- Write clear commit messages
- Reference issues when applicable
- Don't commit commented-out code
- Don't commit console.log statements

---

## Pull Request Process

### Before Creating a PR

1. **Update your branch**

   ```bash
   git checkout develop
   git pull upstream develop
   git checkout your-feature-branch
   git rebase develop
   ```

2. **Run checks locally**

   ```bash
   npm run lint
   npm run format
   npx vitest run
   npm run build
   ```

3. **Review your changes**
   ```bash
   git diff develop
   ```

### Creating a PR

1. **Push your branch**

   ```bash
   git push origin your-feature-branch
   ```

2. **Open PR on GitHub**
   - Go to repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out PR template completely
   - Link related issues

3. **PR Checklist**
   - [ ] PR title follows conventional commit format
   - [ ] Description explains what and why
   - [ ] All CI checks pass
   - [ ] Tests are added/updated
   - [ ] Documentation is updated
   - [ ] No merge conflicts
   - [ ] Screenshots added (if UI changes)

### PR Review Process

1. **Automated Checks**
   - CI pipeline runs automatically
   - Must pass all checks
   - Preview deployment created

2. **Code Review**
   - Wait for review from maintainers
   - Address feedback promptly
   - Keep discussion professional

3. **Updates**
   - Push additional commits to same branch
   - CI re-runs automatically
   - Notify reviewers when ready for re-review

### Merging

- **Squash and merge** is preferred
- **Rebase and merge** for clean history
- Delete branch after merging

---

## Reporting Bugs

### Before Reporting

1. Check if bug already reported
2. Verify it's not a local environment issue
3. Test on latest version

### Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug.

**To Reproduce**
Steps to reproduce:

1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**

- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.0.0]

**Additional context**
Any other relevant information.
```

---

## Feature Requests

### Before Requesting

1. Check if feature already requested
2. Verify it aligns with project goals
3. Consider if it's generally useful

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features.

**Additional context**
Any other context, screenshots, or examples.
```

---

## Development Tips

### VS Code Extensions (Recommended)

- ESLint
- Prettier
- TypeScript Vue Plugin
- GitLens
- Error Lens

### Debugging

**React DevTools:**

```bash
# Install browser extension
# Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/
```

**Console Logging:**

```typescript
// Use tagged console logs
console.log('[ComponentName] Data:', data);
console.error('[ServiceName] Error:', error);
```

### Performance

- Use React DevTools Profiler
- Check bundle size with `npm run build`
- Monitor Lighthouse scores in CI

---

## Getting Help

### Resources

- **Documentation**: See [README.md](README.md), [CLAUDE.md](CLAUDE.md), [DEPLOYMENT.md](DEPLOYMENT.md)
- **Issues**: Check [open issues](https://github.com/Verridian-ai/life-os-Pulse-banner-generator/issues)
- **Discussions**: Use [GitHub Discussions](https://github.com/Verridian-ai/life-os-Pulse-banner-generator/discussions)

### Contact

- **Email**: support@careersy.com
- **Discord**: [Join our community](https://discord.gg/careersy)

---

## Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in significant feature announcements

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Nanobanna Pro! 🎉**
