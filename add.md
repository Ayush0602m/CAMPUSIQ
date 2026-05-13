## 🎨 UI Components

This template includes shadcn/ui components that are:

- **Accessible** - Built with Radix UI primitives
- **Customizable** - Easy to modify and extend
- **Consistent** - Design system with CSS variables
- **Copy-paste friendly** - Own your components

The template includes 40+ pre-configured shadcn/ui components:

- **Layout**: Card, Separator, Tabs, Sheet, Dialog
- **Forms**: Button, Input, Textarea, Select, Checkbox, Switch
- **Navigation**: Navigation Menu, Breadcrumb, Pagination
- **Feedback**: Alert, Badge, Progress, Skeleton, Sonner
- **Data Display**: Table, Avatar, Calendar, Hover Card
- **Overlays**: Popover, Tooltip, Alert Dialog, Drawer
- **Interactive**: Accordion, Collapsible, Command, Context Menu

To add new components:

```bash
npx shadcn-ui@latest add component-name
```

## 🧠 AI Integration

### Component Introspection

The custom source-mapper plugin adds metadata to components in development:

```html
<div
  data-source-file="/src/components/Button.tsx"
  data-source-line="15"
  data-source-component="Button"
>
  Click Me
</div>
```

### Development Mode Integration

The dev-tools package provides:

- **Element selection**: Click to identify components
- **Live editing**: Modify component props in real-time
- **Source mapping**: Navigate directly to component source
- **AI integration**: Enhanced context for AI development tools

### AI-Friendly Patterns

- **Consistent naming**: PascalCase components, camelCase hooks
- **Clear file structure**: Logical separation of concerns
- **Type-first approach**: Comprehensive TypeScript types
- **Standard patterns**: CRUD operations, form handling, error boundaries

## 🗃️ API & Layouts

### API Routes

The template includes:

- `GET /api/health` - Health check endpoint
- Extensible API client setup in `src/lib/api-client.ts`

### Layout System

**RootLayout Pattern** (Recommended for multi-page sites):

Configure header and footer once in `App.tsx`, applies to all pages:

```tsx
// src/App.tsx
const headerConfig = {
  logo: { text: "MyApp" },
  navItems: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
  ],
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RootLayout config={{ header: headerConfig, footer: footerConfig }}>
        <Outlet />
      </RootLayout>
    ),
    children: routes,
  },
]);
```

Pages become simple content components:

```tsx
// src/pages/home.tsx
export default function HomePage() {
  return <div>Your content here</div>;
}
```

**Available Layouts**:

- **RootLayout** (`src/layouts/RootLayout.tsx`) - Centralized header/footer wrapper
- **Website** (`src/layouts/Website.tsx`) - Structural container (used by RootLayout)
- **Dashboard** (`src/layouts/Dashboard.tsx`) - Admin panels and dashboards

See `src/layouts/*.md` for detailed usage documentation.

## 🧪 Testing

Run tests with:

```bash
npm run test
```

The template includes:

- **Vitest** - Fast unit testing framework
- **React Testing Library** - Component testing utilities
- **Jest DOM** - Custom Jest matchers

## 📦 Deployment

### Build for production:

```bash
npm run build
```

### Deploy options:

- **Vercel/Netlify** - Frontend deployment
- **Railway/Render** - Full-stack deployment
- **Docker** - Containerized deployment

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```env
VITE_APP_NAME=V8 App Template
VITE_API_URL=http://localhost:5173/api
NODE_ENV=development
PORT=5173
```

### Custom Plugins

**Source Mapper Plugin**: Adds component introspection for AI tools
**Dev Tools Plugin**: Enables development mode enhancements
**Fullstory Integration**: Optional user analytics (configurable)

Configure in `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import { sourceMapperPlugin } from "./source-mapper";
import { devToolsPlugin } from "./dev-tools";

export default defineConfig({
  plugins: [sourceMapperPlugin(), devToolsPlugin()],
});
```

## 🎯 Best Practices

### Component Architecture

- Keep components small and focused
- Use composition over inheritance
- Extract reusable logic into hooks
- Prefer function components with hooks

### State Management

- Keep local state in components with useState/useReducer
- Use React Context for app-wide state (theme, auth)
- Consider external libraries (Zustand, Redux Toolkit) for complex state
- Leverage layout props for shared configuration

### Layout Usage

- Use RootLayout for multi-page sites (configure in `App.tsx`)
- Pages should only contain content, not layout concerns
- Define header/footer once, applies to all pages
- Follow layout documentation in `src/layouts/*.md`
- Never duplicate header/footer config across pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Run linting and tests
6. Submit a pull request

## 📄 License

MIT License - feel free to use this template for any project.

## 🙏 Acknowledgments

Built with amazing open-source tools:

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [Vitest](https://vitest.dev/)

---

**Happy coding! 🎉**
