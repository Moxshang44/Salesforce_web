# Admin Website - Figma to Angular

An Angular 18+ admin website with pixel-perfect designs powered by Figma through the MCP server integration.

## Features

- 🎨 **Design System Integration**: CSS variables and SCSS tokens extracted from Figma
- 🧩 **Reusable Components**: Pre-built UI components (buttons, cards, inputs)
- 📱 **Responsive Design**: Mobile-first approach with flexible layouts
- ⚡ **Modern Angular**: Standalone components, signals, and latest best practices
- 🎯 **Type Safety**: Full TypeScript support
- 🏗️ **Scalable Architecture**: Clear separation of concerns (core, shared, features)

## Project Structure

```
admin-website/
├── src/
│   ├── app/
│   │   ├── core/              # Core services, guards, interceptors
│   │   │   ├── services/
│   │   │   ├── guards/
│   │   │   └── interceptors/
│   │   ├── shared/            # Reusable components, directives, pipes
│   │   │   ├── components/
│   │   │   │   ├── button/
│   │   │   │   ├── card/
│   │   │   │   └── input/
│   │   │   ├── directives/
│   │   │   └── pipes/
│   │   ├── features/          # Feature modules
│   │   │   ├── dashboard/
│   │   │   └── components-demo/
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── styles/                # Global styles and design tokens
│   │   ├── _design-tokens.scss
│   │   ├── _variables.scss
│   │   └── _reset.scss
│   └── assets/                # Static assets (images, icons)
├── public/                    # Public assets
└── angular.json
```

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- Angular CLI (optional, but recommended)

## Installation

1. Install dependencies:

```bash
cd admin-website
npm install
```

2. Start the development server:

```bash
npm start
```

3. Open your browser and navigate to `http://localhost:4200`

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run watch` - Build in watch mode
- `npm test` - Run unit tests
- `npm run lint` - Lint the codebase

## Using with Figma MCP Server

### Step 1: Set Up the MCP Server

Follow the instructions in the `figma-mcp-server` README to configure and connect the MCP server to your Figma file.

### Step 2: Extract Design Tokens

Once the MCP server is running, you can extract design tokens from your Figma file:

1. In Claude Desktop, ask: "Extract design tokens from my Figma file in SCSS format"
2. Copy the generated SCSS variables
3. Replace the placeholder content in `src/styles/_design-tokens.scss`

### Step 3: Generate Components

To create new components from your Figma designs:

1. Ask Claude: "Generate Angular component code for [Component Name] from my Figma file"
2. The MCP server will analyze the Figma component and generate:
   - TypeScript component class
   - HTML template
   - SCSS styles
3. Create the files in the appropriate location (shared/components or features)

### Example Workflow

```
You: "Show me all the pages in my Figma file"
Claude: [Lists all pages and components]

You: "Extract the color palette and typography"
Claude: [Generates design tokens]

You: "Create an Angular component for the User Profile Card"
Claude: [Generates component files with matching styles]
```

## Design System

### Color Tokens

The design system uses CSS custom properties defined in `_design-tokens.scss`:

```scss
var(--color-primary)
var(--color-secondary)
var(--color-success)
var(--color-error)
var(--color-text-primary)
var(--color-background)
// ... and more
```

### Typography

```scss
var(--font-family-base)
var(--font-size-base)
var(--font-weight-medium)
var(--line-height-normal)
// ... and more
```

### Spacing Scale

```scss
var(--spacing-xs)    // 4px
var(--spacing-sm)    // 8px
var(--spacing-md)    // 16px
var(--spacing-lg)    // 24px
var(--spacing-xl)    // 32px
var(--spacing-2xl)   // 48px
var(--spacing-3xl)   // 64px
```

## Component Library

### Button Component

```html
<app-button variant="primary" size="md">Click Me</app-button>
<app-button variant="outline" [loading]="true">Loading</app-button>
<app-button variant="danger" [disabled]="true">Disabled</app-button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `loading`: boolean
- `fullWidth`: boolean
- `type`: 'button' | 'submit' | 'reset'

### Card Component

```html
<app-card title="Card Title" subtitle="Optional subtitle" [elevated]="true">
  <p>Card content goes here</p>
</app-card>
```

**Props:**
- `title`: string (optional)
- `subtitle`: string (optional)
- `elevated`: boolean - adds shadow
- `hoverable`: boolean - adds hover effect

### Input Component

```html
<app-input
  label="Email"
  type="email"
  placeholder="you@example.com"
  [required]="true"
  [(value)]="email"
></app-input>
```

**Props:**
- `label`: string (optional)
- `placeholder`: string
- `type`: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
- `disabled`: boolean
- `required`: boolean
- `error`: string (optional)
- `hint`: string (optional)

## Component Demo

Visit `/demo` route to see all components in action with various states and configurations.

## Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Build Optimizations

- Tree-shaking for smaller bundle size
- Lazy loading for feature modules
- AOT compilation
- Code splitting

## Development Guidelines

### Creating New Components

1. Use Angular CLI (if installed):
```bash
ng generate component shared/components/my-component --standalone
```

2. Or manually create the component files in the appropriate location

3. Make the component standalone and export it

4. Use design tokens from `_design-tokens.scss` for styling

### Adding New Features

1. Create a new feature directory in `src/app/features/`
2. Create feature components as standalone
3. Add routes to `app.routes.ts` with lazy loading
4. Follow the existing structure

### Styling Best Practices

- Use CSS custom properties (design tokens) instead of hardcoded values
- Use SCSS variables from `_variables.scss` for layout constants
- Follow BEM naming convention for component-specific classes
- Ensure responsive design with mobile-first approach

## Responsive Breakpoints

Defined in `_variables.scss`:

```scss
$breakpoint-mobile: 480px
$breakpoint-tablet: 768px
$breakpoint-desktop: 1024px
$breakpoint-wide: 1440px
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Development Server Won't Start

- Ensure Node.js v18+ is installed: `node --version`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Angular cache: `rm -rf .angular/cache`

### Styles Not Applying

- Check that design tokens are imported in `styles.scss`
- Verify SCSS files are using correct CSS variable syntax
- Clear browser cache

### Components Not Found

- Ensure components are properly exported
- Check import paths are correct
- Verify component is added to imports array

## Contributing

1. Follow the existing code structure
2. Use TypeScript strict mode
3. Write meaningful component and variable names
4. Add comments for complex logic
5. Test components in different states

## License

MIT

## Next Steps

1. **Configure MCP Server**: Set up the Figma MCP server to extract your designs
2. **Extract Design Tokens**: Pull colors, typography, and spacing from your Figma file
3. **Generate Components**: Use the MCP server to create components from Figma
4. **Build Features**: Create admin features (users, settings, analytics, etc.)
5. **Add State Management**: Implement NgRx or signals for complex state
6. **API Integration**: Connect to your backend services
7. **Authentication**: Add auth guards and login flow
8. **Testing**: Write unit and e2e tests

## Resources

- [Angular Documentation](https://angular.io/docs)
- [Figma API Documentation](https://www.figma.com/developers/api)
- [MCP Protocol](https://modelcontextprotocol.io)
- [Figma MCP Server README](../figma-mcp-server/README.md)

