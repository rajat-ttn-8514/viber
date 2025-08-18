# 🚀 Vibe Coder Agent - Quick Start Guide

Get up and running with Vibe Coder Agent in less than 5 minutes!

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **OpenAI API Key** or **Anthropic API Key**

## ⚡ Quick Setup

### 1. Clone the Repository
```bash
git clone https://github.com/rajatsharma/vibe-coder-agent.git
cd vibe-coder-agent
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure API Keys
```bash
# Copy the environment template
cp .env.example .env

# Edit .env and add your API keys
nano .env  # or use your preferred editor
```

**Required:** Add at least one AI provider API key:
- `OPENAI_API_KEY=your_openai_api_key_here`
- `ANTHROPIC_API_KEY=your_anthropic_api_key_here`

### 4. Start the Application
```bash
npm start
```

🎉 **That's it!** Open http://localhost:3000 in your browser.

## 🎯 What You Can Do

### 🏗️ Create Projects
- **Web Applications** (React, Vue, Angular)
- **Mobile Apps** (React Native, Flutter)
- **API Services** (Express, FastAPI, Django)

### 🐛 Debug Code
- Upload files or paste code
- Get AI-powered bug analysis
- Receive specific fix suggestions
- Security vulnerability detection

### 👁️ Review Code Quality
- Code style analysis
- Performance recommendations
- Best practices enforcement
- Architecture suggestions

## 🖥️ Interface Options

### Web Dashboard (Default)
```bash
npm start
# Visit: http://localhost:3000
```

### Command Line Interface
```bash
npm start -- --cli
```

### Programmatic API
```javascript
import { AgentCoordinator } from './src/core/AgentCoordinator.js';

const coordinator = new AgentCoordinator();
await coordinator.initialize();

const result = await coordinator.executeTask({
  type: 'create_project',
  description: 'Build an e-commerce app',
  requirements: { type: 'web_app', frontend: 'react' }
});
```

## 🔧 Configuration

### Environment Variables (.env)
```bash
# AI Provider (required)
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here

# Server Settings
PORT=3000
NODE_ENV=development

# Agent Configuration
MAX_CONCURRENT_AGENTS=5
AGENT_TIMEOUT=300000
DEFAULT_MODEL=gpt-4
```

## 🤖 Available Agents

- **🏗️ Project Architect** - Application design & architecture
- **🎨 Frontend Developer** - UI components & interfaces
- **⚙️ Backend Developer** - APIs & server logic
- **🗄️ Database Designer** - Data models & optimization
- **🚀 DevOps Engineer** - Deployment & infrastructure
- **🧪 QA Tester** - Testing frameworks & quality
- **🐛 Debug Detective** - Bug detection & fixes
- **👁️ Code Reviewer** - Code quality & best practices

## 📖 Examples

### Create a Blog Application
```javascript
{
  "type": "create_project",
  "description": "Personal blog with authentication",
  "requirements": {
    "projectName": "my-blog",
    "type": "web_app", 
    "frontend": "react",
    "features": ["authentication", "responsive"]
  }
}
```

### Debug JavaScript Code
```javascript
{
  "type": "debug_code",
  "description": "Find security issues in authentication",
  "requirements": {
    "files": [{"path": "auth.js", "content": "..."}],
    "issues": ["security", "bugs"]
  }
}
```

## 🆘 Troubleshooting

### Common Issues

**❌ "Invalid API Key"**
- Check your `.env` file has the correct API key
- Restart the application after adding keys

**❌ "Port already in use"**
- Change PORT in `.env` file
- Or kill existing process: `lsof -ti:3000 | xargs kill`

**❌ "Module not found"**
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version: `node --version` (should be ≥18)

### Getting Help

1. **Check logs:** Look at the console output for detailed error messages
2. **API Documentation:** See `/docs/API.md` for full API reference
3. **Examples:** Check `/examples/` folder for usage examples
4. **GitHub Issues:** Report bugs or request features

## 🔗 Next Steps

- **Explore Examples:** Check out `/examples/basic-usage.js`
- **Read API Docs:** Full documentation in `/docs/API.md`
- **Customize Agents:** Modify agent behavior in `/src/agents/`
- **Add Templates:** Create new project templates in `/src/templates/`

---

**Happy Coding! 🎉** 

If you find Vibe Coder Agent helpful, please ⭐ star the repository!
