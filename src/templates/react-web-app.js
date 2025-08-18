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
          typescript: '^4.9.4',
          gsap: '^3.12.2',
          'three': '^0.157.0',
          '@react-three/fiber': '^8.15.11',
          '@react-three/drei': '^9.88.13',
          'framer-motion': '^10.16.4',
          'react-intersection-observer': '^9.5.2',
          'react-spring': '^9.7.3',
          'lottie-react': '^2.4.0'
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
      content: `import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import LoadingScreen from './components/LoadingScreen'
import ParticleBackground from './components/ParticleBackground'
import './App.css'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

function App() {
  useEffect(() => {
    // Initialize GSAP animations
    gsap.set('.app-container', { opacity: 0 })
    gsap.to('.app-container', { 
      opacity: 1, 
      duration: 1.2,
      ease: 'power2.out',
      delay: 0.5
    })
    
    // Parallax effect for background elements
    gsap.utils.toArray('.parallax-element').forEach((element: any) => {
      gsap.to(element, {
        yPercent: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      })
    })
  }, [])

  return (
    <div className="app-container relative overflow-hidden">
      <ParticleBackground />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5 pointer-events-none" />
      
      <Navigation />
      <main className="relative z-10 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

export default Layout`
    },

    'src/components/Navigation.tsx': {
      type: 'typescript',
      content: `import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'

const Navigation = () => {
  const navRef = useRef<HTMLElement>(null)
  const location = useLocation()

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(navRef.current, 
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power2.out' }
      )
    }
  }, [])

  useEffect(() => {
    // Animate nav items on route change
    gsap.from('.nav-item', {
      y: -20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    })
  }, [location])

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="nav-item font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent hover:scale-105 transition-transform">
            {{projectName}}
          </Link>
          <div className="flex space-x-4">
            <Link 
              to="/" 
              className="nav-item text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md transition-all hover:scale-105 hover:shadow-lg"
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="nav-item text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md transition-all hover:scale-105 hover:shadow-lg"
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

    'src/components/LoadingScreen.tsx': {
      type: 'typescript',
      content: `import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface LoadingScreenProps {
  onComplete?: () => void
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const loaderRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ onComplete })
    
    // Animate progress bar
    tl.to(progressRef.current, {
      width: '100%',
      duration: 2,
      ease: 'power2.inOut'
    })
    
    // Fade out loader
    .to(loaderRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.3')
  }, [onComplete])

  return (
    <div 
      ref={loaderRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
    >
      <div className="text-center">
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Experience</h2>
          <p className="text-white/70">Preparing your modern interface...</p>
        </div>
        <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden mx-auto">
          <div 
            ref={progressRef}
            className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full w-0"
          ></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen`
    },

    'src/components/ParticleBackground.tsx': {
      type: 'typescript',
      content: `import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const ParticleBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const particles: HTMLDivElement[] = []
    const colors = ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981']

    // Create particles
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div')
      particle.className = 'absolute rounded-full opacity-20 pointer-events-none'
      particle.style.background = colors[Math.floor(Math.random() * colors.length)]
      
      const size = Math.random() * 6 + 2
      particle.style.width = \`\${size}px\`
      particle.style.height = \`\${size}px\`
      
      particle.style.left = Math.random() * 100 + '%'
      particle.style.top = Math.random() * 100 + '%'
      
      containerRef.current.appendChild(particle)
      particles.push(particle)
    }

    // Animate particles
    particles.forEach((particle, index) => {
      gsap.to(particle, {
        x: () => Math.random() * 400 - 200,
        y: () => Math.random() * 400 - 200,
        duration: () => Math.random() * 20 + 10,
        ease: 'none',
        repeat: -1,
        yoyo: true,
        delay: index * 0.1
      })
      
      gsap.to(particle, {
        opacity: () => Math.random() * 0.5 + 0.1,
        duration: () => Math.random() * 3 + 2,
        ease: 'power2.inOut',
        repeat: -1,
        yoyo: true,
        delay: index * 0.05
      })
    })

    return () => {
      particles.forEach(particle => particle.remove())
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    />
  )
}

export default ParticleBackground`
    },

    'src/components/AnimatedCard.tsx': {
      type: 'typescript',
      content: `import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

const AnimatedCard = ({ children, className = '', delay = 0 }: AnimatedCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current) return

    gsap.fromTo(cardRef.current, 
      { 
        y: 60, 
        opacity: 0, 
        scale: 0.8,
        rotationX: 45
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        rotationX: 0,
        duration: 1,
        ease: 'power3.out',
        delay,
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    )

    // Hover animation
    const handleMouseEnter = () => {
      gsap.to(cardRef.current, {
        y: -10,
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out'
      })
    }

    const handleMouseLeave = () => {
      gsap.to(cardRef.current, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      })
    }

    const card = cardRef.current
    card.addEventListener('mouseenter', handleMouseEnter)
    card.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter)
      card.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [delay])

  return (
    <div 
      ref={cardRef}
      className={\`bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 \${className}\`}
    >
      {children}
    </div>
  )
}

export default AnimatedCard`
    },

    'src/components/FloatingElement.tsx': {
      type: 'typescript',
      content: `import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface FloatingElementProps {
  children: React.ReactNode
  className?: string
  intensity?: number
  speed?: number
}

const FloatingElement = ({ 
  children, 
  className = '', 
  intensity = 20,
  speed = 3
}: FloatingElementProps) => {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!elementRef.current) return

    const tl = gsap.timeline({ repeat: -1, yoyo: true })
    
    tl.to(elementRef.current, {
      y: intensity,
      rotation: intensity / 4,
      duration: speed,
      ease: 'power2.inOut'
    })
    .to(elementRef.current, {
      x: intensity / 2,
      rotation: -intensity / 4,
      duration: speed * 0.8,
      ease: 'power2.inOut'
    }, '-=50%')
  }, [intensity, speed])

  return (
    <div ref={elementRef} className={\`parallax-element \${className}\`}>
      {children}
    </div>
  )
}

export default FloatingElement`
    },

    'src/pages/Home.tsx': {
      type: 'typescript',
      content: `import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import AnimatedCard from '../components/AnimatedCard'
import FloatingElement from '../components/FloatingElement'

const Home = () => {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (!titleRef.current || !subtitleRef.current) return

    const tl = gsap.timeline()
    
    // Hero animations
    tl.fromTo(titleRef.current,
      { y: 100, opacity: 0, scale: 0.8 },
      { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }
    )
    .fromTo(subtitleRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
      '-=0.6'
    )
    
    // Animate gradient text
    gsap.to('.gradient-text', {
      backgroundPosition: '200% center',
      duration: 3,
      ease: 'power2.inOut',
      repeat: -1,
      yoyo: true
    })
  }, [])

  return (
    <div className="relative pt-20 pb-16 min-h-screen">
      {/* Hero Section */}
      <div ref={heroRef} className="text-center mb-16">
        <FloatingElement intensity={15} speed={4} className="inline-block">
          <h1 
            ref={titleRef}
            className="gradient-text text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent"
            style={{ backgroundSize: '200% auto' }}
          >
            Welcome to {{projectName}}
          </h1>
        </FloatingElement>
        
        <p 
          ref={subtitleRef}
          className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Your award-winning modern React application with stunning animations and interactive design
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
        <AnimatedCard className="p-8" delay={0.2}>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              ⚡
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Lightning Fast</h3>
            <p className="text-gray-600">Built with Vite for instant hot reload and blazing fast builds</p>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-8" delay={0.4}>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              🎨
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Modern Design</h3>
            <p className="text-gray-600">Glassmorphism UI with GSAP animations and interactive elements</p>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-8" delay={0.6}>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-green-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              📱
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Responsive</h3>
            <p className="text-gray-600">Fully responsive design that works beautifully on all devices</p>
          </div>
        </AnimatedCard>
      </div>

      {/* Getting Started */}
      <AnimatedCard className="p-8 max-w-4xl mx-auto" delay={0.8}>
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Get Started
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
              <span className="text-gray-700">Edit <code className="px-2 py-1 bg-gray-100 rounded text-sm">src/pages/Home.tsx</code> to customize this page</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
              <span className="text-gray-700">Add new routes in <code className="px-2 py-1 bg-gray-100 rounded text-sm">src/App.tsx</code></span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
              <span className="text-gray-700">Create components in <code className="px-2 py-1 bg-gray-100 rounded text-sm">src/components/</code></span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
              <span className="text-gray-700">Style with GSAP animations and modern CSS</span>
            </div>
          </div>
        </div>
      </AnimatedCard>
    </div>
  )
}

export default Home`
    },

    'src/pages/About.tsx': {
      type: 'typescript',
      content: `import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import AnimatedCard from '../components/AnimatedCard'
import FloatingElement from '../components/FloatingElement'

const About = () => {
  const headerRef = useRef<HTMLHeadingElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!headerRef.current || !contentRef.current) return

    const tl = gsap.timeline()
    
    // Animate header
    tl.fromTo(headerRef.current,
      { y: -50, opacity: 0, rotationX: 90 },
      { y: 0, opacity: 1, rotationX: 0, duration: 1, ease: 'power3.out' }
    )
    
    // Animate content
    .fromTo(contentRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
      '-=0.6'
    )
  }, [])

  return (
    <div className="relative pt-20 pb-16 min-h-screen max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <FloatingElement intensity={10} speed={5} className="inline-block">
          <h1 
            ref={headerRef}
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent"
          >
            About {{projectName}}
          </h1>
        </FloatingElement>
      </div>

      <div ref={contentRef} className="space-y-8">
        {/* Main Description */}
        <AnimatedCard className="p-8" delay={0.2}>
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center text-white text-3xl font-bold">
              🚀
            </div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Award-Winning Design
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
              This modern React application showcases cutting-edge web technologies with stunning animations, 
              interactive design elements, and a beautiful glassmorphism aesthetic that's worthy of recognition 
              on platforms like Awwwards.com.
            </p>
          </div>
        </AnimatedCard>

        {/* Technology Stack */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatedCard className="p-6" delay={0.3}>
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Vite</h3>
              <p className="text-gray-600">Lightning-fast build tool with instant hot module replacement</p>
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-6" delay={0.4}>
            <div className="text-center">
              <div className="text-4xl mb-4">📘</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">TypeScript</h3>
              <p className="text-gray-600">Type-safe JavaScript for better development experience</p>
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-6" delay={0.5}>
            <div className="text-center">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">React Router</h3>
              <p className="text-gray-600">Declarative routing for React applications</p>
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-6" delay={0.6}>
            <div className="text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">GSAP</h3>
              <p className="text-gray-600">Professional-grade animations and interactive experiences</p>
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-6" delay={0.7}>
            <div className="text-center">
              <div className="text-4xl mb-4">🌊</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Tailwind CSS</h3>
              <p className="text-gray-600">Utility-first CSS framework for rapid UI development</p>
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-6" delay={0.8}>
            <div className="text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">ESLint</h3>
              <p className="text-gray-600">Code linting and formatting for consistent quality</p>
            </div>
          </AnimatedCard>
        </div>

        {/* Features */}
        <AnimatedCard className="p-8" delay={0.9}>
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Modern Features
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 mt-1">✨</div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">GSAP Animations</h3>
                  <p className="text-gray-600 text-sm">Smooth, performant animations with scroll triggers and interactive effects</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 mt-1">🎭</div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Glassmorphism UI</h3>
                  <p className="text-gray-600 text-sm">Modern translucent design with backdrop blur effects</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 mt-1">🌟</div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Particle Effects</h3>
                  <p className="text-gray-600 text-sm">Dynamic background particles with smooth animations</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 mt-1">📱</div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Responsive Design</h3>
                  <p className="text-gray-600 text-sm">Seamless experience across all device sizes</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 mt-1">🎯</div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Performance Optimized</h3>
                  <p className="text-gray-600 text-sm">Fast loading with optimized bundle sizes</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 mt-1">🔧</div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Developer Experience</h3>
                  <p className="text-gray-600 text-sm">Hot reload, TypeScript support, and modern tooling</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>
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
