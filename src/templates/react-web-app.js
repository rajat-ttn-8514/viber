export const reactWebAppTemplate = {
  name: 'React Web Application',
  description: 'Modern React application with TypeScript, routing, and styling',
  type: 'web_app',
  framework: 'react',
  
  structure: {
    'package.json': {
      type: 'json',
      content: {
        name: '{{projectName}}',
        version: '0.1.0',
        private: true,
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0',
          'react-router-dom': '^6.8.0',
          '@types/react': '^18.0.27',
          '@types/react-dom': '^18.0.10',
          typescript: '^4.9.4'
        },
        devDependencies: {
          '@vitejs/plugin-react': '^3.1.0',
          vite: '^4.1.0',
          eslint: '^8.34.0',
          '@typescript-eslint/eslint-plugin': '^5.51.0',
          '@typescript-eslint/parser': '^5.51.0'
        },
        scripts: {
          dev: 'vite',
          build: 'tsc && vite build',
          preview: 'vite preview',
          lint: 'eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0'
        }
      }
    },
    
    'tsconfig.json': {
      type: 'json',
      content: {
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true
        },
        include: ['src'],
        references: [{ path: './tsconfig.node.json' }]
      }
    },

    'vite.config.ts': {
      type: 'typescript',
      content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
})`
    },

    'index.html': {
      type: 'html',
      content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{projectName}}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
    },

    'src/main.tsx': {
      type: 'typescript',
      content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)`
    },

    'src/App.tsx': {
      type: 'typescript', 
      content: `import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import './App.css'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Layout>
  )
}

export default App`
    },

    'src/components/Layout.tsx': {
      type: 'typescript',
      content: `import { ReactNode } from 'react'
import Navigation from './Navigation'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

export default Layout`
    },

    'src/components/Navigation.tsx': {
      type: 'typescript',
      content: `import { Link } from 'react-router-dom'

const Navigation = () => {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="font-bold text-xl text-gray-800">
            {{projectName}}
          </Link>
          <div className="flex space-x-4">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation`
    },

    'src/pages/Home.tsx': {
      type: 'typescript',
      content: `const Home = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Welcome to {{projectName}}
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Your modern React application is ready!
      </p>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
        <ul className="text-left space-y-2">
          <li>• Edit <code>src/pages/Home.tsx</code> to customize this page</li>
          <li>• Add new routes in <code>src/App.tsx</code></li>
          <li>• Create components in <code>src/components/</code></li>
          <li>• Style with Tailwind CSS classes</li>
        </ul>
      </div>
    </div>
  )
}

export default Home`
    },

    'src/pages/About.tsx': {
      type: 'typescript',
      content: `const About = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">About</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600 leading-relaxed">
          This is a React application built with modern tools and best practices:
        </p>
        <ul className="mt-4 space-y-2 text-gray-600">
          <li>• ⚡ <strong>Vite</strong> - Fast build tool and dev server</li>
          <li>• 📘 <strong>TypeScript</strong> - Type-safe JavaScript</li>
          <li>• 🗺️ <strong>React Router</strong> - Client-side routing</li>
          <li>• 🎨 <strong>Tailwind CSS</strong> - Utility-first styling</li>
          <li>• 🔍 <strong>ESLint</strong> - Code linting and formatting</li>
        </ul>
      </div>
    </div>
  )
}

export default About`
    },

    'src/index.css': {
      type: 'css',
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

code {
  background-color: #f4f4f5;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace;
  font-size: 0.875em;
}`
    },

    'src/App.css': {
      type: 'css',
      content: `/* Custom app styles */

.loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}`
    },

    'tailwind.config.js': {
      type: 'javascript',
      content: `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`
    },

    'README.md': {
      type: 'markdown',
      content: `# {{projectName}}

A modern React application built with Vite, TypeScript, and Tailwind CSS.

## 🚀 Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

\`\`\`
src/
├── components/     # Reusable UI components
├── pages/         # Route components
├── hooks/         # Custom React hooks
├── services/      # API calls and external services
├── utils/         # Utility functions
└── types/         # TypeScript type definitions
\`\`\`

## 🛠️ Built With

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **React Router** - Declarative routing for React
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint** - Code linting and formatting

## 📝 Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
- \`npm run lint\` - Lint code with ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
`
    },

    '.gitignore': {
      type: 'text',
      content: `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production build
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs/
*.log

# Coverage
coverage/
.nyc_output/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity`
    }
  },

  features: {
    authentication: {
      dependencies: ['@auth0/auth0-react', 'jsonwebtoken'],
      files: {
        'src/contexts/AuthContext.tsx': {
          type: 'typescript',
          content: `// Authentication context implementation`
        },
        'src/components/LoginButton.tsx': {
          type: 'typescript',
          content: `// Login button component`
        }
      }
    },
    api: {
      dependencies: ['axios'],
      files: {
        'src/services/api.ts': {
          type: 'typescript',
          content: `// API service layer with axios`
        }
      }
    },
    testing: {
      dependencies: ['@testing-library/react', '@testing-library/jest-dom', 'vitest'],
      files: {
        'src/components/__tests__/Home.test.tsx': {
          type: 'typescript',
          content: `// Test files for components`
        }
      }
    }
  }
};
