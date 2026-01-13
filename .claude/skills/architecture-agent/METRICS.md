# Architecture Metrics Reference

Comprehensive guide to all metrics calculated by the Architecture Analyzer Agent.

---

## Table of Contents

1. [Complexity Metrics](#complexity-metrics)
2. [Coupling Metrics](#coupling-metrics)
3. [Size Metrics](#size-metrics)
4. [Quality Metrics](#quality-metrics)
5. [Thresholds & Scoring](#thresholds--scoring)

---

## Complexity Metrics

### 1. Cyclomatic Complexity (McCabe)

**Definition**: Measures the number of linearly independent paths through a program's source code.

**Formula**:
```
M = E - N + 2P
```
Where:
- **E** = Number of edges in control flow graph
- **N** = Number of nodes in control flow graph
- **P** = Number of connected components (usually 1 for a single function)

**Simplified Calculation** (for TypeScript/JavaScript):
```
Cyclomatic Complexity = 1 + (number of decision points)
```

**Decision Points**:
- `if` statement: +1
- `else if` clause: +1
- `while` loop: +1
- `for` loop: +1
- `for...of` loop: +1
- `for...in` loop: +1
- `do...while` loop: +1
- `case` clause in switch: +1
- `catch` clause: +1
- `&&` operator: +1
- `||` operator: +1
- `?` ternary operator: +1
- Optional chaining `?.` with branching: +1

**Example**:
```typescript
function processUser(user: User): string {  // Base: 1
  if (!user) {                               // +1 (if)
    return 'Invalid user';
  }

  if (user.age < 18) {                       // +1 (if)
    return 'Minor';
  } else if (user.age > 65) {                // +1 (else if)
    return 'Senior';
  }

  return user.isPremium ? 'Premium' : 'Standard';  // +1 (ternary)
}
// Total Cyclomatic Complexity: 5
```

**Thresholds**:
| Range | Rating | Interpretation | Action |
|-------|--------|----------------|--------|
| 1-5 | ✅ Simple | Easy to test, low risk | None |
| 6-10 | ✅ Good | Well-structured, manageable | None |
| 11-15 | 🟡 Moderate | Requires attention | Consider refactoring |
| 16-20 | 🟠 High | Complex, hard to test | Refactor recommended |
| 21+ | 🔴 Very High | Very complex, high risk | Refactor required |

**Benefits**:
- Objective measure of complexity
- Predicts testing effort (test cases ≈ complexity)
- Industry standard (used by SonarQube, ESLint)

---

### 2. Cognitive Complexity (SonarSource)

**Definition**: Measures how difficult code is to understand for a human reader.

**Key Differences from Cyclomatic**:
- Penalizes nested structures more heavily
- Ignores shorthand constructs (e.g., `||` for default values)
- Focuses on "breaks in linear flow"

**Calculation Rules**:

1. **Base Increments** (+1 each):
   - `if`, `else if`, `else`
   - Ternary operator `? :`
   - `switch`, `case`
   - `for`, `while`, `do...while`
   - `catch`
   - `&&`, `||` (in conditions, not for defaults)
   - `break`, `continue` with label

2. **Nesting Multiplier**:
   - Each level of nesting adds +1 to the increment
   - Nesting contexts: functions, loops, conditionals, try-catch

3. **Recursion**: +1

**Example**:
```typescript
function validateOrder(order: Order): boolean {
  if (!order) {                           // +1 (if, level 0)
    return false;
  }

  if (order.items.length === 0) {         // +1 (if, level 0)
    return false;
  }

  for (const item of order.items) {       // +1 (for, level 0) -> nesting level 1
    if (item.quantity <= 0) {             // +2 (if, level 1: +1 base +1 nesting)
      return false;
    }

    if (item.price < 0) {                 // +2 (if, level 1)
      return false;
    }

    if (item.stock) {                     // +2 (if, level 1)
      if (item.stock < item.quantity) {   // +3 (if, level 2: +1 base +2 nesting)
        return false;
      }
    }
  }

  return true;
}
// Total Cognitive Complexity: 1 + 1 + 1 + 2 + 2 + 2 + 3 = 12
```

**Thresholds**:
| Range | Rating | Interpretation | Action |
|-------|--------|----------------|--------|
| 0-5 | ✅ Simple | Very easy to understand | None |
| 6-15 | ✅ Good | Reasonable complexity | None |
| 16-25 | 🟡 Moderate | Requires focus to understand | Consider refactoring |
| 26-40 | 🟠 High | Hard to understand | Refactor recommended |
| 41+ | 🔴 Very High | Very hard to understand | Refactor required |

**Refactoring Strategies**:
1. **Extract nested logic** into separate functions
2. **Use early returns** to reduce nesting
3. **Replace conditionals with polymorphism** (strategy pattern)
4. **Use guard clauses** at function entry

---

### 3. Nesting Depth

**Definition**: Maximum level of nested control structures.

**Calculation**: Count the deepest level of nested blocks.

**Example**:
```typescript
function processData(data: Data) {        // Level 0
  if (data) {                             // Level 1
    for (const item of data.items) {      // Level 2
      if (item.isValid) {                 // Level 3
        try {                             // Level 4
          if (item.needsProcessing) {     // Level 5 ❌ TOO DEEP
            // ...
          }
        } catch (e) {
          // ...
        }
      }
    }
  }
}
// Max Nesting Depth: 5 (too deep)
```

**Thresholds**:
| Depth | Rating | Action |
|-------|--------|--------|
| 0-2 | ✅ Good | None |
| 3 | 🟡 Acceptable | Monitor |
| 4 | 🟠 High | Refactor recommended |
| 5+ | 🔴 Too Deep | Refactor required |

**Refactoring Strategies**:
1. **Extract nested blocks** into separate functions
2. **Use early returns/continues** to reduce nesting
3. **Invert conditions** to flatten structure
4. **Use polymorphism** instead of nested switches

---

## Coupling Metrics

### 4. Afferent Coupling (Ca)

**Definition**: Number of modules that depend on this module.

**Also Known As**: "Incoming dependencies", "Dependents", "Consumers"

**Calculation**:
```typescript
Ca = Count of unique modules that import this module
```

**Example**:
```
// File: src/utils/formatters.ts

// src/components/UserProfile.tsx imports formatters.ts
// src/services/api.ts imports formatters.ts
// src/pages/Dashboard.tsx imports formatters.ts

// Afferent Coupling (Ca) = 3
```

**Interpretation**:
- **High Ca (10+)**: Module is heavily depended upon (stable, hard to change)
- **Low Ca (0-2)**: Module has few dependents (easier to change/delete)

---

### 5. Efferent Coupling (Ce)

**Definition**: Number of modules this module depends on.

**Also Known As**: "Outgoing dependencies", "Dependencies"

**Calculation**:
```typescript
Ce = Count of unique modules imported by this module
```

**Example**:
```typescript
// File: src/services/llm.ts

import { z } from 'zod';                        // +1
import { openai } from '@/lib/openai';          // +1
import { replicate } from '@/lib/replicate';    // +1
import type { User } from '@/types/user';       // +1
import { useAuth } from '@/context/AuthContext'; // +1

// Efferent Coupling (Ce) = 5
```

**Interpretation**:
- **High Ce (10+)**: Module has many dependencies (unstable, hard to reuse)
- **Low Ce (0-3)**: Module has few dependencies (stable, easy to reuse)

---

### 6. Instability (I)

**Definition**: Ratio of efferent coupling to total coupling. Measures how "stable" a module is.

**Formula**:
```
I = Ce / (Ca + Ce)
```

**Range**: [0, 1]
- **I = 0**: Maximally stable (depended on by many, depends on nothing)
- **I = 1**: Maximally unstable (depends on many, no dependents)

**Example**:
```
Module A: Ca = 15, Ce = 3
I = 3 / (15 + 3) = 0.167 (Very Stable)

Module B: Ca = 2, Ce = 12
I = 12 / (2 + 12) = 0.857 (Very Unstable)
```

**Interpretation**:
| Range | Category | Characteristics | Ideal Use |
|-------|----------|-----------------|-----------|
| 0.0-0.2 | Very Stable | Hard to change, widely used | Core utilities, types |
| 0.2-0.4 | Stable | Moderate reuse | Services, contexts |
| 0.4-0.6 | Balanced | Good for business logic | Features |
| 0.6-0.8 | Unstable | Easy to change | UI components |
| 0.8-1.0 | Very Unstable | Highly dependent | App entry, pages |

**Guidelines**:
- **Stable modules (I < 0.3)** should be abstract (interfaces, types)
- **Unstable modules (I > 0.7)** should be concrete (implementations)
- **Balanced modules (0.3 < I < 0.7)** are good for business logic

---

### 7. Abstractness (A)

**Definition**: Ratio of abstract classes/interfaces to total classes.

**Formula** (for TypeScript):
```
A = (Number of interfaces + abstract classes) / (Total classes + interfaces)
```

**Range**: [0, 1]
- **A = 0**: Completely concrete (only implementations)
- **A = 1**: Completely abstract (only interfaces/types)

**Example**:
```typescript
// File: src/types/user.ts
export interface User { ... }          // Abstract
export interface UserRole { ... }     // Abstract
export type UserStatus = ...           // Abstract

// A = 3 / 3 = 1.0 (Completely abstract)

// File: src/services/auth.ts
export class AuthService { ... }       // Concrete
export function login() { ... }        // Concrete

// A = 0 / 2 = 0.0 (Completely concrete)
```

**Note**: For TypeScript/JavaScript, this metric is less relevant since the language doesn't enforce abstraction like Java/C#. Use sparingly.

---

### 8. Distance from Main Sequence (D)

**Definition**: Measures how close a module is to the "ideal" balance of abstractness and instability.

**Formula**:
```
D = | A + I - 1 |
```

**Range**: [0, 1]
- **D = 0**: On the main sequence (ideal)
- **D = 1**: Far from main sequence (problematic)

**Main Sequence**: The line where `A + I = 1`
- Stable modules should be abstract (I≈0, A≈1)
- Unstable modules should be concrete (I≈1, A≈0)

**Zones**:
```
Abstractness (A)
      ^
  1.0 |  Zone of           Main
      |  Uselessness      Sequence
      |       \           /
  0.5 |        \         /
      |         \       /
      |   Zone of  \   /
  0.0 |     Pain    \ /
      +-----------------> Instability (I)
      0.0    0.5    1.0
```

**Zone Interpretation**:

1. **Main Sequence (D ≈ 0)**: ✅ Ideal
   - Stable abstractions (I≈0, A≈1): Core interfaces, types
   - Balanced (I≈0.5, A≈0.5): Business logic
   - Unstable concretes (I≈1, A≈0): UI components, pages

2. **Zone of Pain (High I, Low A, D > 0.5)**: 🔴 Problematic
   - Characteristics: Concrete implementations with many dependencies
   - Problem: Hard to change (many dependencies) AND hard to use (concrete)
   - Solution: Extract interfaces, use dependency injection

3. **Zone of Uselessness (Low I, High A, D > 0.5)**: 🟡 Wasteful
   - Characteristics: Abstract interfaces with no dependents
   - Problem: Unused abstractions, over-engineering
   - Solution: Delete or make concrete

**Example Analysis**:
```
Module: src/context/AuthContext.tsx
Ca = 23, Ce = 5
I = 5 / (23 + 5) = 0.179
A = 0.0 (concrete implementation)
D = | 0.0 + 0.179 - 1 | = 0.821

Interpretation: Distance is high (0.821), but this is actually GOOD.
AuthContext is stable (I=0.179) and concrete (A=0), which is correct for a context.
The high D value comes from being far from the "Zone of Pain".
```

**Thresholds**:
| Range | Rating | Interpretation |
|-------|--------|----------------|
| 0.0-0.2 | ✅ Excellent | On main sequence |
| 0.2-0.4 | ✅ Good | Near main sequence |
| 0.4-0.6 | 🟡 Moderate | Review architecture |
| 0.6-0.8 | 🟠 Poor | Likely in pain/uselessness zone |
| 0.8-1.0 | 🔴 Bad | Definitely in pain/uselessness zone |

---

## Size Metrics

### 9. Lines of Code (LOC)

**Variants**:
- **Physical LOC**: Total lines including whitespace and comments
- **Logical LOC**: Lines with executable statements
- **Source LOC (SLOC)**: Physical LOC minus blank lines and comments

**We use**: Logical LOC (most meaningful for complexity)

**Thresholds**:

#### Per Function
| LOC | Rating | Action |
|-----|--------|--------|
| 1-20 | ✅ Ideal | None |
| 21-50 | ✅ Good | None |
| 51-100 | 🟡 Large | Consider splitting |
| 101-200 | 🟠 Very Large | Refactor recommended |
| 201+ | 🔴 Too Large | Refactor required |

#### Per File
| LOC | Rating | Action |
|-----|--------|--------|
| 1-200 | ✅ Good | None |
| 201-500 | ✅ Acceptable | Monitor |
| 501-1000 | 🟡 Large | Consider splitting |
| 1001-2000 | 🟠 Very Large | Refactor recommended |
| 2001+ | 🔴 Too Large | Refactor required |

**Note**: LOC alone is not a quality metric. A 500-line file with clear structure is better than 5 poorly organized 100-line files.

---

### 10. Number of Parameters

**Definition**: Count of parameters in a function signature.

**Thresholds**:
| Count | Rating | Action |
|-------|--------|--------|
| 0-3 | ✅ Good | None |
| 4-5 | 🟡 Moderate | Consider options object |
| 6+ | 🔴 Too Many | Refactor to options object |

**Refactoring Example**:
```typescript
// BAD: Too many parameters
function createUser(
  name: string,
  email: string,
  age: number,
  role: string,
  isPremium: boolean,
  credits: number
) { ... }

// GOOD: Options object
type CreateUserOptions = {
  name: string;
  email: string;
  age: number;
  role: string;
  isPremium?: boolean;
  credits?: number;
};

function createUser(options: CreateUserOptions) { ... }
```

---

## Quality Metrics

### 11. Test Coverage

**Definition**: Percentage of code executed by tests.

**Variants**:
- **Line Coverage**: % of lines executed
- **Branch Coverage**: % of branches (if/else) taken
- **Function Coverage**: % of functions called
- **Statement Coverage**: % of statements executed

**We use**: Branch Coverage (most comprehensive)

**Thresholds**:
| Coverage | Rating | Action |
|----------|--------|--------|
| 90-100% | ✅ Excellent | Maintain |
| 80-89% | ✅ Good | Target for new code |
| 70-79% | 🟡 Acceptable | Improve for critical paths |
| 50-69% | 🟠 Poor | Increase coverage |
| 0-49% | 🔴 Insufficient | Requires immediate attention |

**Guidelines**:
- **New code**: 80% minimum (enforced in CI)
- **Critical paths**: 90% minimum (auth, payments, data persistence)
- **UI components**: 70% acceptable (visual testing covers rest)
- **Utilities**: 90% minimum (pure functions, easy to test)

---

### 12. Code Duplication

**Definition**: Percentage of code that is duplicated elsewhere.

**Detection**: Identify code blocks with >6 consecutive identical lines.

**Thresholds**:
| Duplication | Rating | Action |
|-------------|--------|--------|
| 0-3% | ✅ Excellent | None |
| 3-5% | ✅ Good | Monitor |
| 5-10% | 🟡 Moderate | Refactor recommended |
| 10-15% | 🟠 High | Refactor required |
| 15%+ | 🔴 Very High | Major refactoring needed |

**Refactoring Strategies**:
1. Extract duplicated code into shared functions
2. Use utility libraries for common patterns
3. Create reusable components (React)
4. Use mixins or composition

---

### 13. Dead Code

**Definition**: Code that is never executed or imported.

**Types**:
- **Unreachable code**: After `return`, `throw`, `break`
- **Unused exports**: Functions/variables never imported
- **Unused imports**: Imported but never used
- **Commented code**: Old code left in comments

**Detection Methods**:
```typescript
// 1. Unreachable code
function example() {
  return 'done';
  console.log('never runs'); // DEAD CODE
}

// 2. Unused export
export function neverCalled() { ... } // DEAD CODE if no imports

// 3. Unused import
import { never, used } from './utils'; // 'never' is DEAD CODE

// 4. Commented code
// function oldImplementation() { ... } // DEAD CODE
```

**Action**: Delete all dead code. No exceptions.

---

## Thresholds & Scoring

### Architecture Health Score

**Formula**:
```
Health Score = (Modularity + Complexity + Coupling + Tech Debt) / 4
```

**Component Scoring**:

#### 1. Modularity (0-25 points)
- Vertical slice compliance: 10 pts
- Feature co-location: 10 pts
- Module independence: 5 pts

#### 2. Complexity (0-25 points)
- Average cyclomatic < 10: 10 pts
- No functions > 50 LOC: 10 pts
- Max nesting depth < 4: 5 pts

#### 3. Coupling (0-25 points)
- No circular dependencies: 10 pts
- Average instability 0.3-0.7: 10 pts
- Max dependencies < 15: 5 pts

#### 4. Technical Debt (0-25 points)
- No dead code: 10 pts
- No files > 500 LOC: 10 pts
- Import order compliance: 5 pts

**Overall Thresholds**:
| Score | Grade | Status | Action |
|-------|-------|--------|--------|
| 90-100 | A | ✅ Excellent | Maintain |
| 80-89 | B | ✅ Good | Minor improvements |
| 70-79 | C | 🟡 Acceptable | Refactoring recommended |
| 60-69 | D | 🟠 Poor | Refactoring required |
| 0-59 | F | 🔴 Failing | Major refactoring needed |

---

## Metric Priorities

**Critical (Block PR)**:
1. Circular dependencies
2. Functions with complexity > 20
3. Test coverage < 70% (for new code)

**High (Review required)**:
1. Files > 1000 LOC
2. Instability > 0.9 for core modules
3. Functions > 100 LOC
4. Nesting depth > 4

**Medium (Warning)**:
1. Complexity 15-20
2. Files 500-1000 LOC
3. Functions 50-100 LOC
4. Code duplication 5-10%

**Low (Informational)**:
1. Complexity 10-15
2. LOC metrics within thresholds
3. Coupling metrics in acceptable range

---

## References

1. **Cyclomatic Complexity**: McCabe, T.J. (1976). "A Complexity Measure"
2. **Cognitive Complexity**: G. Ann Campbell, SonarSource (2018)
3. **Coupling Metrics**: Robert C. Martin, "Clean Architecture" (2017)
4. **Main Sequence**: Robert C. Martin, "Agile Software Development" (2002)

---

*Last Updated: 2026-01-13*
*Version: 1.0.0*
