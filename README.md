# V8 App Template

A modern, production-ready web application template built with Vite, React, and TypeScript. Designed for AI-assisted development with component introspection, layout systems, and excellent developer experience.

## 🚀 Features

- **⚡ Lightning Fast**: Vite for instant hot module replacement and optimized builds
- **🎯 Type Safe**: Full TypeScript coverage across frontend and backend
- **🎨 Beautiful UI**: shadcn/ui components with Tailwind CSS
- **🧠 AI-Friendly**: Component introspection for AI development tools
- **📱 Responsive**: Mobile-first design with modern CSS
- **🔧 Developer Experience**: Hot reload, linting, formatting, and testing setup
- **🚀 Production Ready**: SSR support, optimized builds, and deployment-ready

## 🛠️ Tech Stack

### Frontend

- **React 18+** - Modern React with hooks and concurrent features
- **TypeScript 5** - Full type safety across the application
- **Vite 5** - Fast build tool and dev server with HMR
- **Tailwind CSS 3** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **React Router DOM** - Client-side routing
- **Framer Motion** - Smooth animations and transitions

### Backend

- **Node.js API** - Simple health check and utilities
- **TypeScript** - Type-safe backend development

### Development Tools

- **ESLint 9** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Fast unit testing
- **TypeScript ESLint** - TypeScript-specific linting

> **Note:** SSR support with vite-plugin-ssr has been temporarily removed due to compatibility issues with the directory structure. This can be re-added later when the plugin is updated or replaced with a more stable alternative.

## 📁 Project Structure

```
v8-app-template/
├── src/
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui base components (40+ components)
│   │   └── Spinner.tsx
│   ├── layouts/          # Layout systems
│   │   ├── RootLayout.tsx    # Centralized layout wrapper
│   │   ├── Website.tsx       # Structural container
│   │   ├── Dashboard.tsx     # Dashboard layout
│   │   ├── RootLayout.md     # RootLayout documentation
│   │   ├── Website.md        # Website layout documentation
│   │   └── parts/            # Layout components
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── pages/            # Page components (content only)
│   │   ├── index.tsx     # Homepage
│   │   └── _404.tsx      # 404 page
│   ├── lib/              # Utilities and API
│   │   ├── utils.ts      # Utility functions
│   │   └── api-client.ts # API client
│   ├── api/              # Backend API routes
│   │   └── health.ts     # Health check endpoint
│   ├── styles/           # Global styles
│   │   └── globals.css
│   ├── test/             # Test setup
│   │   └── setup.ts
│   ├── App.tsx           # Root application component
│   ├── main.tsx          # Application entry point
│   ├── router.ts         # Route definitions
│   └── routes.tsx        # Route components
├── dev-tools/            # Development mode enhancements
├── source-mapper/        # AI introspection plugin
├── public/               # Static assets
└── scripts/              # Development scripts
```

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run Vitest unit tests
- `npm run lint` - Run ESLint code linting
- `npm run type-check` - Run TypeScript type checking
- `npm run setup` - Initialize project with dependencies

