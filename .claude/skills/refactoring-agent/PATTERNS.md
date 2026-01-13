# Refactoring Patterns Library

> Production-tested refactoring patterns with before/after examples

---

## Table of Contents

1. [Class Component → Functional Component with Hooks](#1-class-component--functional-component-with-hooks)
2. [Callback Hell → Async/Await](#2-callback-hell--asyncawait)
3. [Any Types → Proper TypeScript Types](#3-any-types--proper-typescript-types)
4. [CommonJS → ES Modules](#4-commonjs--es-modules)
5. [Redux → React Query Migration](#5-redux--react-query-migration)
6. [Props Drilling → Context API](#6-props-drilling--context-api)
7. [useEffect Cleanup Patterns](#7-useeffect-cleanup-patterns)
8. [Error Boundaries → Error Handling Hooks](#8-error-boundaries--error-handling-hooks)

---

## 1. Class Component → Functional Component with Hooks

### Pattern Overview

**When to use**: Modernizing legacy React class components
**Complexity**: Medium
**Risk**: Low (if tests exist)
**Estimated cost**: $0.40-$0.60 per component

### Before (Class Component)

```typescript
// src/components/CanvasEditor.tsx
import React, { Component } from 'react';
import { Canvas } from './Canvas';
import type { CanvasState, Tool } from './types';

type Props = {
  initialState?: CanvasState;
  onSave: (state: CanvasState) => void;
};

type State = {
  canvasState: CanvasState;
  history: CanvasState[];
  selectedTool: Tool;
  isLoading: boolean;
};

class CanvasEditor extends Component<Props, State> {
  private canvasRef: React.RefObject<HTMLCanvasElement>;
  private containerRef: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);
    this.state = {
      canvasState: props.initialState || this.getDefaultState(),
      history: [],
      selectedTool: 'pen',
      isLoading: false,
    };
    this.canvasRef = React.createRef();
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    this.loadCanvas();
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.canvasState !== this.state.canvasState) {
      this.addToHistory(this.state.canvasState);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  getDefaultState = (): CanvasState => {
    return { elements: [], width: 1200, height: 600 };
  };

  loadCanvas = async () => {
    this.setState({ isLoading: true });
    try {
      // Load canvas logic
    } finally {
      this.setState({ isLoading: false });
    }
  };

  addToHistory = (state: CanvasState) => {
    this.setState(prev => ({
      history: [...prev.history, state].slice(-20), // Keep last 20
    }));
  };

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey && e.key === 'z') {
      this.handleUndo();
    }
  };

  handleToolSelect = (tool: Tool) => {
    this.setState({ selectedTool: tool });
  };

  handleSave = () => {
    this.props.onSave(this.state.canvasState);
  };

  handleUndo = () => {
    const { history } = this.state;
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      this.setState({
        canvasState: previousState,
        history: history.slice(0, -1),
      });
    }
  };

  render() {
    const { canvasState, selectedTool, isLoading } = this.state;

    return (
      <div ref={this.containerRef} className="canvas-editor">
        <Canvas
          ref={this.canvasRef}
          state={canvasState}
          selectedTool={selectedTool}
          isLoading={isLoading}
          onToolSelect={this.handleToolSelect}
          onSave={this.handleSave}
        />
      </div>
    );
  }
}

export default CanvasEditor;
```

### After (Functional Component with Hooks)

```typescript
// src/components/CanvasEditor.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from './Canvas';
import type { CanvasState, Tool } from './types';

type Props = {
  initialState?: CanvasState;
  onSave: (state: CanvasState) => void;
};

export function CanvasEditor({ initialState, onSave }: Props) {
  // State hooks (converted from this.state)
  const [canvasState, setCanvasState] = useState<CanvasState>(
    () => initialState || getDefaultState()
  );
  const [history, setHistory] = useState<CanvasState[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool>('pen');
  const [isLoading, setIsLoading] = useState(false);

  // Refs (converted from class instance properties)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper function (extracted outside component or kept inside)
  function getDefaultState(): CanvasState {
    return { elements: [], width: 1200, height: 600 };
  }

  // componentDidMount → useEffect with empty deps
  useEffect(() => {
    loadCanvas();
  }, []);

  // componentDidMount + componentWillUnmount for event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'z') {
        handleUndo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup (componentWillUnmount)
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [history]); // Include deps used in handleKeyDown

  // componentDidUpdate → useEffect with deps
  useEffect(() => {
    addToHistory(canvasState);
  }, [canvasState]);

  // Instance methods → useCallback
  const loadCanvas = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load canvas logic
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToHistory = useCallback((state: CanvasState) => {
    setHistory(prev => [...prev, state].slice(-20)); // Keep last 20
  }, []);

  const handleToolSelect = useCallback((tool: Tool) => {
    setSelectedTool(tool);
  }, []);

  const handleSave = useCallback(() => {
    onSave(canvasState);
  }, [canvasState, onSave]);

  const handleUndo = useCallback(() => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setCanvasState(previousState);
      setHistory(prev => prev.slice(0, -1));
    }
  }, [history]);

  return (
    <div ref={containerRef} className="canvas-editor">
      <Canvas
        ref={canvasRef}
        state={canvasState}
        selectedTool={selectedTool}
        isLoading={isLoading}
        onToolSelect={handleToolSelect}
        onSave={handleSave}
      />
    </div>
  );
}
```

### Transformation Rules

| Class Feature | Hooks Equivalent |
|--------------|------------------|
| `this.state.X` | `const [x, setX] = useState()` |
| `this.setState()` | `setX()` |
| `componentDidMount` | `useEffect(() => {}, [])` |
| `componentDidUpdate` | `useEffect(() => {}, [deps])` |
| `componentWillUnmount` | `useEffect(() => { return () => {} }, [])` |
| `this.method = () => {}` | `const method = useCallback(() => {}, [deps])` |
| `this.ref = createRef()` | `const ref = useRef()` |
| `constructor` | `useState(() => initialValue)` (lazy init) |

### Gotchas

1. **Stale Closures**: Use deps correctly in useEffect/useCallback
2. **Infinite Loops**: Avoid setState in useEffect without deps
3. **Ref Callbacks**: Use `useImperativeHandle` for ref forwarding
4. **Performance**: Use `useMemo`/`useCallback` for expensive operations

---

## 2. Callback Hell → Async/Await

### Pattern Overview

**When to use**: Simplifying nested callbacks
**Complexity**: Medium
**Risk**: Medium (ensure error handling preserved)
**Estimated cost**: $0.30-$0.50 per function

### Before (Callback Hell)

```typescript
// src/services/imageUpload.ts
export function uploadImage(
  file: File,
  onComplete: (url: string) => void,
  onError: (error: Error) => void
): void {
  validateImage(file, (validationError, isValid) => {
    if (validationError) {
      return onError(validationError);
    }
    if (!isValid) {
      return onError(new Error('Invalid image format'));
    }

    compressImage(file, (compressError, compressed) => {
      if (compressError) {
        return onError(compressError);
      }

      uploadToS3(compressed, (uploadError, s3Url) => {
        if (uploadError) {
          return onError(uploadError);
        }

        updateDatabase(s3Url, (dbError, result) => {
          if (dbError) {
            return onError(dbError);
          }

          notifyUser('Upload complete', () => {
            onComplete(s3Url);
          });
        });
      });
    });
  });
}

// Helper functions also use callbacks
function validateImage(
  file: File,
  callback: (error: Error | null, isValid: boolean) => void
): void {
  // Async validation logic
  setTimeout(() => {
    if (file.size > 10_000_000) {
      callback(new Error('File too large'), false);
    } else {
      callback(null, true);
    }
  }, 100);
}

function compressImage(
  file: File,
  callback: (error: Error | null, compressed: Blob | null) => void
): void {
  // Compression logic
  setTimeout(() => {
    callback(null, new Blob([file]));
  }, 500);
}

function uploadToS3(
  blob: Blob,
  callback: (error: Error | null, url: string | null) => void
): void {
  // S3 upload logic
  setTimeout(() => {
    callback(null, 'https://s3.amazonaws.com/bucket/image.png');
  }, 1000);
}

function updateDatabase(
  url: string,
  callback: (error: Error | null, result: any) => void
): void {
  // DB update logic
  setTimeout(() => {
    callback(null, { id: 123, url });
  }, 200);
}

function notifyUser(message: string, callback: () => void): void {
  console.log(message);
  setTimeout(callback, 100);
}
```

### After (Async/Await)

```typescript
// src/services/imageUpload.ts
export async function uploadImage(file: File): Promise<string> {
  // Step 1: Validate image
  const isValid = await validateImage(file);
  if (!isValid) {
    throw new Error('Invalid image format');
  }

  // Step 2: Compress image
  const compressed = await compressImage(file);

  // Step 3: Upload to S3
  const s3Url = await uploadToS3(compressed);

  // Step 4: Update database
  await updateDatabase(s3Url);

  // Step 5: Notify user
  await notifyUser('Upload complete');

  return s3Url;
}

// Helper functions converted to return Promises
async function validateImage(file: File): Promise<boolean> {
  // Async validation logic
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (file.size > 10_000_000) {
        reject(new Error('File too large'));
      } else {
        resolve(true);
      }
    }, 100);
  });
}

async function compressImage(file: File): Promise<Blob> {
  // Compression logic
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(new Blob([file]));
    }, 500);
  });
}

async function uploadToS3(blob: Blob): Promise<string> {
  // S3 upload logic
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('https://s3.amazonaws.com/bucket/image.png');
    }, 1000);
  });
}

async function updateDatabase(url: string): Promise<{ id: number; url: string }> {
  // DB update logic
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: 123, url });
    }, 200);
  });
}

async function notifyUser(message: string): Promise<void> {
  console.log(message);
  return new Promise((resolve) => {
    setTimeout(resolve, 100);
  });
}
```

### Usage Comparison

**Before (Callback)**:
```typescript
uploadImage(
  file,
  (url) => {
    console.log('Success:', url);
  },
  (error) => {
    console.error('Error:', error);
  }
);
```

**After (Async/Await)**:
```typescript
try {
  const url = await uploadImage(file);
  console.log('Success:', url);
} catch (error) {
  console.error('Error:', error);
}
```

### Transformation Rules

| Callback Pattern | Async/Await Equivalent |
|-----------------|------------------------|
| `func(arg, callback)` | `await func(arg)` |
| `callback(error, result)` | `throw error` or `return result` |
| `if (error) return callback(error)` | `throw error` |
| Nested callbacks | Linear `await` statements |

### Gotchas

1. **Error Handling**: Wrap in try/catch (errors no longer passed as first argument)
2. **Parallel Execution**: Use `Promise.all()` if callbacks ran in parallel
3. **Optional Callbacks**: Handle cases where callback might be undefined

---

## 3. Any Types → Proper TypeScript Types

### Pattern Overview

**When to use**: Enforcing TypeScript strict mode
**Complexity**: Medium-High (requires type inference)
**Risk**: Low (caught by compiler)
**Estimated cost**: $0.10-$0.30 per file

### Before (Implicit Any / Explicit Any)

```typescript
// src/services/llm.ts

// Implicit any on parameters
export function generateImage(prompt, options) {
  const response = fetch('/api/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt, ...options }),
  });
  return response;
}

// Explicit any types
export async function callOpenRouter(config: any): Promise<any> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify(config.body),
  });
  return response.json();
}

// Any in function return
export function parseResponse(data: any) {
  if (data.error) {
    return { success: false, error: data.error };
  }
  return { success: true, data: data.result };
}

// Any in arrays/objects
export function processImages(images: any[]) {
  return images.map((img: any) => ({
    url: img.url,
    width: img.width,
    height: img.height,
  }));
}
```

### After (Proper Types)

```typescript
// src/services/llm.ts

// Define explicit types
type GenerateImageOptions = {
  model?: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  n?: number;
};

type OpenRouterConfig = {
  headers: {
    Authorization: string;
    'Content-Type': string;
  };
  body: {
    model: string;
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    temperature?: number;
    max_tokens?: number;
  };
};

type OpenRouterResponse = {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

type ParsedResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type ProcessedImage = {
  url: string;
  width: number;
  height: number;
};

type RawImage = {
  url: string;
  width: number;
  height: number;
  metadata?: Record<string, unknown>;
};

// Explicit return types and parameter types
export function generateImage(
  prompt: string,
  options?: GenerateImageOptions
): Promise<Response> {
  const response = fetch('/api/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt, ...options }),
  });
  return response;
}

export async function callOpenRouter(
  config: OpenRouterConfig
): Promise<OpenRouterResponse> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify(config.body),
  });
  return response.json() as Promise<OpenRouterResponse>;
}

export function parseResponse<T>(data: unknown): ParsedResponse<T> {
  // Type guard
  if (typeof data !== 'object' || data === null) {
    return { success: false, error: 'Invalid response format' };
  }

  const obj = data as Record<string, unknown>;

  if ('error' in obj && typeof obj.error === 'string') {
    return { success: false, error: obj.error };
  }

  if ('result' in obj) {
    return { success: true, data: obj.result as T };
  }

  return { success: false, error: 'Unknown response format' };
}

export function processImages(images: RawImage[]): ProcessedImage[] {
  return images.map((img) => ({
    url: img.url,
    width: img.width,
    height: img.height,
  }));
}
```

### Transformation Rules

| Any Pattern | Proper Type |
|------------|-------------|
| `param: any` | `param: SpecificType` |
| `Promise<any>` | `Promise<ResponseType>` |
| `any[]` | `SpecificType[]` |
| No return type | `: ReturnType` |
| Implicit any | Add explicit type annotation |
| `obj as any` | `obj as SpecificType` or type guard |

### Type Guard Pattern

```typescript
// Before
function isError(x: any): boolean {
  return x && x.error;
}

// After
function isError(x: unknown): x is { error: string } {
  return typeof x === 'object' && x !== null && 'error' in x;
}
```

---

## 4. CommonJS → ES Modules

### Pattern Overview

**When to use**: Modernizing to ES modules
**Complexity**: Low
**Risk**: Low (syntax-only change)
**Estimated cost**: $0.10-$0.20 per file

### Before (CommonJS)

```javascript
// utils/formatters.js
const dayjs = require('dayjs');
const { z } = require('zod');

function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD');
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

const validators = {
  email: z.string().email(),
  url: z.string().url(),
};

module.exports = {
  formatDate,
  formatCurrency,
  validators,
};

// Or single export
module.exports = formatDate;

// Using it
const { formatDate, formatCurrency } = require('./utils/formatters');
```

### After (ES Modules)

```typescript
// utils/formatters.ts
import dayjs from 'dayjs';
import { z } from 'zod';

export function formatDate(date: Date | string): string {
  return dayjs(date).format('YYYY-MM-DD');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export const validators = {
  email: z.string().email(),
  url: z.string().url(),
};

// Using it
import { formatDate, formatCurrency } from './utils/formatters';
```

### Transformation Rules

| CommonJS | ES Modules |
|----------|-----------|
| `const X = require('x')` | `import X from 'x'` |
| `const { a, b } = require('x')` | `import { a, b } from 'x'` |
| `module.exports = X` | `export default X` (avoid) or `export { X }` |
| `module.exports = { a, b }` | `export { a, b }` or `export const a; export const b;` |
| `exports.a = X` | `export const a = X` |

### Package.json Update

```json
{
  "type": "module"
}
```

---

## 5. Redux → React Query Migration

### Pattern Overview

**When to use**: Moving server state to React Query
**Complexity**: High
**Risk**: Medium (requires careful testing)
**Estimated cost**: $1.00-$2.00 per feature

### Before (Redux)

```typescript
// store/userSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from './types';

export const fetchUser = createAsyncThunk(
  'user/fetch',
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: null as User | null,
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user';
      });
  },
});

export default userSlice.reducer;

// Component usage
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from './store/userSlice';

function UserProfile({ userId }: { userId: string }) {
  const dispatch = useDispatch();
  const { data: user, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUser(userId));
  }, [userId, dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return null;

  return <div>{user.name}</div>;
}
```

### After (React Query)

```typescript
// services/userApi.ts
import type { User } from './types';

export async function fetchUser(userId: string): Promise<User> {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
}

// hooks/useUser.ts
import { useQuery } from '@tanstack/react-query';
import { fetchUser } from '../services/userApi';

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
}

// Component usage (much simpler!)
import { useUser } from './hooks/useUser';

function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, error } = useUser(userId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return null;

  return <div>{user.name}</div>;
}
```

### Migration Steps

1. **Install React Query**:
```bash
npm install @tanstack/react-query
```

2. **Set up QueryClient**:
```typescript
// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}
```

3. **Convert Actions → Queries**:
   - Redux actions/thunks → API functions
   - Selectors → useQuery hooks
   - Reducers → Removed (React Query manages state)

4. **Convert Mutations**:
```typescript
// Before (Redux)
const updateUser = createAsyncThunk('user/update', async (user: User) => {
  const response = await fetch(`/api/users/${user.id}`, {
    method: 'PUT',
    body: JSON.stringify(user),
  });
  return response.json();
});

// After (React Query)
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: User) =>
      fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(user),
      }).then((res) => res.json()),
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });
}
```

### Benefits

- 85% less boilerplate code
- Automatic caching and background refetching
- Better TypeScript inference
- Simpler component code
- Built-in loading/error states

---

## 6. Props Drilling → Context API

### Pattern Overview

**When to use**: Eliminating deeply nested prop passing
**Complexity**: Medium
**Risk**: Low
**Estimated cost**: $0.40-$0.70

### Before (Props Drilling)

```typescript
// App.tsx
function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<User | null>(null);

  return (
    <Layout theme={theme} user={user}>
      <Dashboard theme={theme} user={user} setTheme={setTheme}>
        <Sidebar theme={theme} user={user}>
          <UserMenu theme={theme} user={user} setTheme={setTheme} />
        </Sidebar>
      </Dashboard>
    </Layout>
  );
}

// Every component in the chain needs to accept and pass down props
function Dashboard({ theme, user, setTheme, children }) {
  return <div className={theme}>{children}</div>;
}

function Sidebar({ theme, user, children }) {
  return <aside className={theme}>{children}</aside>;
}

function UserMenu({ theme, user, setTheme }) {
  return (
    <div>
      <span>{user?.name}</span>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  );
}
```

### After (Context API)

```typescript
// context/AppContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

type AppContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  user: User | null;
  setUser: (user: User | null) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

type AppProviderProps = {
  children: ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  const [theme, setTheme] = useState<Theme>('light');
  const [user, setUser] = useState<User | null>(null);

  const value = {
    theme,
    setTheme,
    user,
    setUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// App.tsx
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <Layout>
        <Dashboard>
          <Sidebar>
            <UserMenu />
          </Sidebar>
        </Dashboard>
      </Layout>
    </AppProvider>
  );
}

// Components no longer need to pass props
function Dashboard({ children }) {
  const { theme } = useAppContext();
  return <div className={theme}>{children}</div>;
}

function Sidebar({ children }) {
  const { theme } = useAppContext();
  return <aside className={theme}>{children}</aside>;
}

function UserMenu() {
  const { theme, setTheme, user } = useAppContext();

  return (
    <div>
      <span>{user?.name}</span>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  );
}
```

---

## 7. useEffect Cleanup Patterns

### Before (Missing Cleanup)

```typescript
function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Subscribe to WebSocket
    const ws = new WebSocket('wss://api.example.com/chat');

    ws.onmessage = (event) => {
      setMessages(prev => [...prev, JSON.parse(event.data)]);
    };

    // ❌ Missing cleanup - WebSocket never closed!
  }, []);

  return <div>{/* Render messages */}</div>;
}
```

### After (With Cleanup)

```typescript
function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Subscribe to WebSocket
    const ws = new WebSocket('wss://api.example.com/chat');

    ws.onmessage = (event) => {
      setMessages(prev => [...prev, JSON.parse(event.data)]);
    };

    // ✅ Cleanup function
    return () => {
      ws.close();
    };
  }, []);

  return <div>{/* Render messages */}</div>;
}
```

---

## 8. Error Boundaries → Error Handling Hooks

For modern error handling patterns, see React Query's error handling or Suspense boundaries.

---

## Summary

These patterns provide battle-tested transformations for common refactoring scenarios. The Refactoring Agent uses these patterns as templates, adapting them to your specific codebase structure and requirements.

**Key Principles**:
- Preserve behavior (no functional changes)
- Use AST transformations (not regex)
- Validate at every step
- Create atomic, reversible changes
