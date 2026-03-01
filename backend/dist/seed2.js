"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = require("dotenv");
const Product_1 = require("./models/Product");
const User_1 = require("./models/User");
const ImageAsset_1 = require("./models/ImageAsset");
const auth_1 = require("./lib/auth");
(0, dotenv_1.config)();
function toSlug(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
async function ensureSlug(base) {
    let slug = base;
    let i = 0;
    while (await Product_1.Product.exists({ slug })) {
        slug = `${base}-${++i}`;
    }
    return slug;
}
const SAMPLE_PDF = "https://www.africau.edu/images/general/sample.pdf";
// Category-themed Unsplash image sets
const IMG = {
    "ai-prompt-pack": [
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&q=80",
        "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=900&q=80",
        "https://images.unsplash.com/photo-1686191128892-3b37add4c844?w=900&q=80",
        "https://images.unsplash.com/photo-1676277791608-ac54525aa94d?w=900&q=80",
        "https://images.unsplash.com/photo-1701194640178-ceeebc073e59?w=900&q=80",
    ],
    "notion-template": [
        "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=900&q=80",
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=900&q=80",
        "https://images.unsplash.com/photo-1517842645767-c639042777db?w=900&q=80",
        "https://images.unsplash.com/photo-1607706189992-eae578626c86?w=900&q=80",
        "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=900&q=80",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80",
    ],
    "resume-template": [
        "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=900&q=80",
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80",
        "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=900&q=80",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80",
    ],
    "ui-kit": [
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&q=80",
        "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=900&q=80",
        "https://images.unsplash.com/photo-1613068687893-5e85b4638b56?w=900&q=80",
        "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=900&q=80",
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=900&q=80",
        "https://images.unsplash.com/photo-1576153192621-7a3be10b356e?w=900&q=80",
    ],
    "figma-assets": [
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&q=80",
        "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=900&q=80",
        "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=900&q=80",
        "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=900&q=80",
        "https://images.unsplash.com/photo-1558655146-d09347e92766?w=900&q=80",
    ],
    "productivity-dashboard": [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80",
        "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=900&q=80",
        "https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=900&q=80",
        "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=900&q=80",
        "https://images.unsplash.com/photo-1600267175161-cfaa711b4a81?w=900&q=80",
    ],
    "dev-boilerplate": [
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=900&q=80",
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&q=80",
        "https://images.unsplash.com/photo-1587620962725-abab19836100?w=900&q=80",
        "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=900&q=80",
        "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=900&q=80",
        "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=900&q=80",
    ],
    "mern-starter": [
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&q=80",
        "https://images.unsplash.com/photo-1587620962725-abab19836100?w=900&q=80",
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&q=80",
        "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=900&q=80",
        "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=900&q=80",
    ],
    "auth-system": [
        "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=900&q=80",
        "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=900&q=80",
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&q=80",
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=900&q=80",
        "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=900&q=80",
    ],
    "saas-starter": [
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80",
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&q=80",
        "https://images.unsplash.com/photo-1618044733300-9472054094ee?w=900&q=80",
        "https://images.unsplash.com/photo-1559526324-593bc073d938?w=900&q=80",
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=900&q=80",
        "https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=80",
    ],
    "api-scaffold": [
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&q=80",
        "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=900&q=80",
        "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=900&q=80",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80",
        "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=900&q=80",
    ],
    "workflow-system": [
        "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=900&q=80",
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80",
        "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=900&q=80",
        "https://images.unsplash.com/photo-1600267175161-cfaa711b4a81?w=900&q=80",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80",
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&q=80",
    ],
    "automation-pipeline": [
        "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=900&q=80",
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=900&q=80",
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&q=80",
        "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=900&q=80",
        "https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=900&q=80",
    ],
    "ai-productivity": [
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&q=80",
        "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=900&q=80",
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=900&q=80",
        "https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=900&q=80",
        "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=900&q=80",
    ],
    "business-guide": [
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80",
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&q=80",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80",
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&q=80",
    ],
    "automation-guide": [
        "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=900&q=80",
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=900&q=80",
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80",
        "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=900&q=80",
        "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=900&q=80",
    ],
    "productivity-framework": [
        "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=900&q=80",
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=900&q=80",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80",
        "https://images.unsplash.com/photo-1517842645767-c639042777db?w=900&q=80",
        "https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?w=900&q=80",
    ],
    "react-template": [
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=900&q=80",
        "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=900&q=80",
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=900&q=80",
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&q=80",
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=900&q=80",
        "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=900&q=80",
    ],
    "typescript-component": [
        "https://images.unsplash.com/photo-1587620962725-abab19836100?w=900&q=80",
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&q=80",
        "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=900&q=80",
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=900&q=80",
        "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=900&q=80",
    ],
    "css-template": [
        "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=900&q=80",
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&q=80",
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=900&q=80",
        "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=900&q=80",
        "https://images.unsplash.com/photo-1558655146-d09347e92766?w=900&q=80",
    ],
};
function getImages(cat) {
    return IMG[cat] || IMG["ui-kit"];
}
// 20 product templates – one per category
const PRODUCT_TEMPLATES = [
    {
        category: "ai-prompt-pack",
        title: "Ultimate AI Writing Prompt Pack",
        desc: "500+ battle-tested prompts for ChatGPT, Claude & Gemini covering marketing, copywriting, email, and social media.",
        price: 799,
        installInstructions: "Copy the prompt you need, paste into your preferred AI tool, and customise the variables in [brackets].",
        deliverables: [
            { label: "Prompt Pack PDF Guide", url: SAMPLE_PDF, kind: "file" },
            { label: "View Notion Template", url: "https://notion.so/ai-prompts", kind: "link" },
        ],
        code: `// AI Prompt Pack - Quick Start
const prompts = {
  marketing: "Write a compelling [product] ad for [audience] that emphasises [benefit].",
  email: "Draft a follow-up email for [lead] after [event] with CTA: [action].",
  social: "Create 5 Twitter threads about [topic] for [niche] audience.",
};
module.exports = prompts;`,
        aiPromptPack: {
            categories: ["marketing", "writing", "business"],
            difficulty: "beginner",
            supportedModels: ["ChatGPT", "Claude", "Gemini"],
            promptCount: 500,
            usageInstructions: "Replace bracketed variables with your context.",
            format: "markdown",
            downloadType: "structured",
            prompts: [
                { label: "Marketing Hook", content: "Write a compelling hook for [product] targeting [audience]." },
                { label: "Email Subject", content: "Generate 10 email subject lines for [campaign] with high open rates." },
            ],
        },
    },
    {
        category: "notion-template",
        title: "Notion Life OS – All-in-One Dashboard",
        desc: "Complete life management system in Notion. Track goals, habits, projects, finances and reading list in one workspace.",
        price: 499,
        installInstructions: "Duplicate the template to your Notion workspace. Customise the database properties to fit your workflow.",
        deliverables: [
            { label: "Setup Guide PDF", url: SAMPLE_PDF, kind: "file" },
            { label: "Duplicate Notion Template", url: "https://notion.so/templates/life-os", kind: "link" },
        ],
        code: `// Notion API integration example
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function getGoals(databaseId) {
  const response = await notion.databases.query({ database_id: databaseId });
  return response.results;
}
module.exports = { getGoals };`,
        template: {
            templateType: "notion",
            compatibility: ["Notion 2.0", "Web", "Mobile App"],
            features: ["Goal Tracking", "Habit Tracker", "Project Manager", "Finance Tracker", "Reading List"],
            customizationLevel: "high",
            includesAssets: true,
        },
    },
    {
        category: "resume-template",
        title: "Modern ATS Resume Template",
        desc: "Clean, ATS-optimised resume template for software engineers and designers. Fully editable in Figma and Notion.",
        price: 299,
        installInstructions: "Open in Figma, replace placeholder text with your details, and export as PDF.",
        deliverables: [
            { label: "Resume Template PDF", url: SAMPLE_PDF, kind: "file" },
            { label: "Figma Source File", url: "https://figma.com/resume-template", kind: "link" },
        ],
        code: `/* Resume CSS Styles */
.resume-container { max-width: 800px; margin: 0 auto; font-family: 'Inter', sans-serif; }
.header { display: flex; justify-content: space-between; border-bottom: 2px solid #6366f1; padding-bottom: 1rem; }
.section-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #6366f1; }
.experience-item { margin-bottom: 1.5rem; }`,
        template: {
            templateType: "resume",
            compatibility: ["Figma", "Google Docs", "Microsoft Word"],
            features: ["ATS Optimised", "Multiple Colour Schemes", "Print Ready", "Two Pages"],
            customizationLevel: "high",
            includesAssets: true,
        },
    },
    {
        category: "ui-kit",
        title: "Glassmorphic React UI Kit – 80+ Components",
        desc: "Production-ready glassmorphic component library for React and TailwindCSS. Cards, modals, forms, navbars and more.",
        price: 1299,
        installInstructions: "Run `npm install` then import components from the `components/` directory.",
        deliverables: [
            { label: "Component Documentation PDF", url: SAMPLE_PDF, kind: "file" },
            { label: "Storybook Preview", url: "https://storybook.js.org/glass-ui-kit", kind: "link" },
        ],
        code: `import React from 'react';

export const GlassCard = ({ children, className = '' }) => (
  <div className={\`backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl \${className}\`}>
    {children}
  </div>
);

export const GlassButton = ({ children, onClick }) => (
  <button onClick={onClick} className="backdrop-blur-sm bg-white/20 hover:bg-white/30 border border-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all">
    {children}
  </button>
);`,
        template: {
            templateType: "ui-kit",
            compatibility: ["React 18", "TailwindCSS", "TypeScript"],
            features: ["80+ Components", "Dark Mode", "Responsive", "TypeScript Support", "Storybook Docs"],
            customizationLevel: "high",
            includesAssets: true,
        },
    },
    {
        category: "figma-assets",
        title: "Figma Icon Pack – 1200 Icons",
        desc: "Comprehensive icon library in 6 styles: outline, filled, duotone, sharp, bulk and broken. Available in Figma and SVG.",
        price: 699,
        installInstructions: "Open the Figma file, find the icon you need, copy as SVG or component, paste into your design.",
        deliverables: [
            { label: "Icon Usage Guide PDF", url: SAMPLE_PDF, kind: "file" },
            { label: "Figma Source File", url: "https://figma.com/icon-pack-1200", kind: "link" },
        ],
        code: `<!-- SVG Icon Example -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
  <path d="M2 17l10 5 10-5"/>
  <path d="M2 12l10 5 10-5"/>
</svg>

<!-- React component wrapper -->
export const LayersIcon = (props) => <svg {...props}>{/* paths */}</svg>;`,
        template: {
            templateType: "figma",
            compatibility: ["Figma", "React", "Vue", "SVG"],
            features: ["1200 Icons", "6 Styles", "Auto Layout", "SVG Export", "React Components"],
            customizationLevel: "medium",
            includesAssets: true,
        },
    },
    {
        category: "productivity-dashboard",
        title: "Personal Productivity Notion Dashboard",
        desc: "All-in-one productivity dashboard with daily planner, task prioritisation (Eisenhower Matrix), and weekly review system.",
        price: 399,
        installInstructions: "Duplicate the Notion template, connect your databases and start filling in your tasks.",
        deliverables: [
            { label: "Productivity Guide PDF", url: SAMPLE_PDF, kind: "file" },
            { label: "Notion Template", url: "https://notion.so/productivity-dashboard", kind: "link" },
        ],
        code: `// Weekly Review Script
const weeklyReview = {
  wins: [],
  struggles: [],
  nextWeekGoals: [],
  habitScores: {},
  energyLevel: 0,
  
  log(field, value) {
    if (Array.isArray(this[field])) this[field].push(value);
    else this[field] = value;
  },
};
module.exports = weeklyReview;`,
        template: {
            templateType: "dashboard",
            compatibility: ["Notion 2.0"],
            features: ["Daily Planner", "Eisenhower Matrix", "Habit Tracker", "Weekly Review", "Goal Setting"],
            customizationLevel: "high",
            includesAssets: false,
        },
    },
    {
        category: "dev-boilerplate",
        title: "Next.js SaaS Boilerplate with Auth & Payments",
        desc: "Production-ready Next.js 14 boilerplate with NextAuth, Stripe, Prisma, Tailwind and shadcn/ui pre-configured.",
        price: 2499,
        installInstructions: "Clone the repo, run `npm install`, copy `.env.example` to `.env.local`, fill in credentials, run `npm run dev`.",
        deliverables: [
            { label: "Setup Documentation PDF", url: SAMPLE_PDF, kind: "file" },
            { label: "GitHub Repository", url: "https://github.com/example/nextjs-saas-boilerplate", kind: "link" },
        ],
        code: `// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { typedRoutes: true },
  images: { domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'] },
};
module.exports = nextConfig;

// lib/auth.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [],
});`,
        developerBoilerplate: {
            techStack: ["Next.js 14", "TypeScript", "Prisma", "PostgreSQL", "Stripe", "TailwindCSS"],
            architecture: "fullstack",
            includesAuth: true,
            includesDatabase: true,
            includesTesting: true,
            deploymentReady: true,
            documentation: true,
            starterType: "nextjs",
        },
    },
    {
        category: "mern-starter",
        title: "MERN Stack Starter with Redux & JWT",
        desc: "Full-stack MERN boilerplate featuring Redux Toolkit, JWT auth, role-based access control, and Docker support.",
        price: 1999,
        installInstructions: "Run `docker-compose up` or start frontend and backend separately with `npm run dev`.",
        deliverables: [
            { label: "Architecture Guide PDF", url: SAMPLE_PDF, kind: "file" },
            { label: "GitHub Repository", url: "https://github.com/example/mern-starter", kind: "link" },
        ],
        code: `// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

app.listen(5000, () => console.log('Server on port 5000'));`,
        developerBoilerplate: {
            techStack: ["MongoDB", "Express.js", "React", "Node.js", "Redux Toolkit", "JWT"],
            architecture: "fullstack",
            includesAuth: true,
            includesDatabase: true,
            includesTesting: true,
            deploymentReady: true,
            documentation: true,
            starterType: "mern",
        },
    },
    {
        category: "auth-system",
        title: "Complete JWT Auth System with Refresh Tokens",
        desc: "Secure authentication system with access/refresh tokens, email verification, password reset, and 2FA support.",
        price: 1499,
        installInstructions: "Install dependencies, set JWT_SECRET and JWT_REFRESH_SECRET in .env, then import the auth middleware.",
        deliverables: [
            { label: "Security Guide PDF", url: SAMPLE_PDF, kind: "file" },
            { label: "GitHub Repository", url: "https://github.com/example/jwt-auth-system", kind: "link" },
        ],
        code: `// middleware/auth.js
const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
module.exports = { requireAuth };`,
        developerBoilerplate: {
            techStack: ["Node.js", "Express.js", "JWT", "bcrypt", "nodemailer"],
            architecture: "mvc",
            includesAuth: true,
            includesDatabase: true,
            includesTesting: true,
            deploymentReady: false,
            documentation: true,
            starterType: "express",
        },
    },
    {
        category: "saas-starter",
        title: "SaaS Starter Kit – Multi-Tenant with Stripe Billing",
        desc: "Launch your SaaS in days. Includes multi-tenancy, Stripe subscriptions, team management, and a polished dashboard.",
        price: 3999,
        installInstructions: "Clone repo, configure Stripe webhooks, set up your database, deploy to Vercel or Railway.",
        deliverables: [
            { label: "Launch Checklist PDF", url: SAMPLE_PDF, kind: "file" },
            { label: "Live Demo", url: "https://saas-starter-demo.vercel.app", kind: "link" },
        ],
        code: `// stripe/webhook.ts
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

export async function handleWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'customer.subscription.created':
      await prisma.subscription.create({ data: { /* ... */ } });
      break;
    case 'invoice.payment_failed':
      await prisma.subscription.update({ where: { /* ... */ }, data: { status: 'past_due' } });
      break;
  }
}`,
        developerBoilerplate: {
            techStack: ["Next.js", "TypeScript", "Stripe", "Prisma", "PostgreSQL", "TailwindCSS", "shadcn/ui"],
            architecture: "fullstack",
            includesAuth: true,
            includesDatabase: true,
            includesTesting: false,
            deploymentReady: true,
            documentation: true,
            starterType: "nextjs",
        },
    },
    {
        category: "api-scaffold",
        title: "Express REST API Scaffold with OpenAPI Docs",
        desc: "Scalable Express.js API scaffold with Zod validation, Swagger/OpenAPI auto-docs, rate limiting, and logging.",
        price: 1299,
        installInstructions: "Clone, run `npm install`, copy `.env.example` to `.env`, run `npm run dev`. Docs at `/api-docs`.",
        deliverables: [
            { label: "API Design Guide PDF", url: SAMPLE_PDF, kind: "file" },
            { label: "GitHub Repository", url: "https://github.com/example/express-api-scaffold", kind: "link" },
        ],
        code: `// routes/users.ts
import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';

const router = Router();
const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

router.post('/', validate(createUserSchema), async (req, res) => {
  // handler
});
export default router;`,
        developerBoilerplate: {
            techStack: ["Node.js", "Express.js", "TypeScript", "Zod", "Swagger", "Winston"],
            architecture: "mvc",
            includesAuth: false,
            includesDatabase: false,
            includesTesting: true,
            deploymentReady: true,
            documentation: true,
            starterType: "express",
        },
    },
    {
        category: "workflow-system",
        title: "Client Onboarding Workflow System",
        desc: "Complete client onboarding automation using Make.com (Integromat). Auto-creates Notion pages, sends welcome emails, and schedules calls.",
        price: 899,
        installInstructions: "Import the Make.com blueprint JSON, connect your apps (Gmail, Notion, Calendly), and activate.",
        deliverables: [
            { label: "Setup Walkthrough PDF", url: SAMPLE_PDF, kind: "file" },
            { label: "Make.com Blueprint", url: "https://make.com/blueprints/client-onboarding", kind: "link" },
        ],
        code: `// Webhook trigger payload (Make.com compatible)
{
  "event": "new_client",
  "client": {
    "name": "{{name}}",
    "email": "{{email}}",
    "package": "{{package}}",
    "start_date": "{{start_date}}"
  },
  "actions": [
    "create_notion_page",
    "send_welcome_email",
    "schedule_kickoff_call",
    "add_to_crm"
  ]
}`,
        workflowSystem: {
            workflowType: "business",
            stepsCount: 8,
            tools: ["Make.com", "Notion", "Gmail", "Calendly", "Airtable"],
            integrationLevel: "intermediate",
            timeToImplement: "2 hours",
            platforms: ["Web"],
        },
    },
    {
        category: "automation-pipeline",
        title: "Social Media Automation Pipeline",
        desc: "Fully automated content pipeline: generate ideas with AI, schedule posts across LinkedIn, Twitter and Instagram from one Notion database.",
        price: 749,
        installInstructions: "Set up the Notion database, connect Buffer/Hootsuite via Make.com, add your OpenAI API key.",
        deliverables: [
            { label: "Pipeline Setup Guide PDF", url: SAMPLE_PDF, kind: "file" },
            { label: "Make.com Blueprint", url: "https://make.com/blueprints/social-media-pipeline", kind: "link" },
        ],
        code: `// Content pipeline config
const pipeline = {
  sources: ['notion_ideas_db'],
  enrichment: { provider: 'openai', model: 'gpt-4o', prompt: 'Expand this idea into a post for {platform}' },
  scheduling: { tool: 'buffer', times: ['09:00', '13:00', '18:00'] },
  platforms: ['linkedin', 'twitter', 'instagram'],
};
module.exports = pipeline;`,
        workflowSystem: {
            workflowType: "automation",
            stepsCount: 12,
            tools: ["Make.com", "OpenAI", "Notion", "Buffer", "Canva API"],
            integrationLevel: "advanced",
            timeToImplement: "3 hours",
            platforms: ["Web", "Mobile"],
        },
    },
    {
        category: "ai-productivity",
        title: "AI-Powered Daily Planner System",
        desc: "Combine ChatGPT with Notion to auto-plan your day, prioritise tasks by energy level, and generate end-of-day summaries.",
        price: 599,
        installInstructions: "Duplicate the Notion template, add your OpenAI API key to the automation, run the daily script.",
        deliverables: [
            { label: "System Overview PDF", url: SAMPLE_PDF, kind: "file" },
            { label: "Notion Template", url: "https://notion.so/ai-daily-planner", kind: "link" },
        ],
        code: `// daily-planner.js
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function planDay(tasks) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a productivity coach. Prioritise these tasks by impact/effort.' },
      { role: 'user', content: JSON.stringify(tasks) },
    ],
  });
  return res.choices[0].message.content;
}
module.exports = { planDay };`,
        workflowSystem: {
            workflowType: "ai",
            stepsCount: 6,
            tools: ["OpenAI", "Notion", "Make.com", "Google Calendar"],
            integrationLevel: "intermediate",
            timeToImplement: "1 hour",
            platforms: ["Web", "Mobile"],
        },
    },
    {
        category: "business-guide",
        title: "Freelance Business Launch Blueprint",
        desc: "Step-by-step guide to launching a 6-figure freelance business: niche selection, pricing, client acquisition, contracts and scaling.",
        price: 999,
        installInstructions: "Read the PDF, complete the worksheets, use the Notion template to track your progress.",
        deliverables: [
            { label: "Full Blueprint PDF", url: SAMPLE_PDF, kind: "file" },
            { label: "Resource Notion Page", url: "https://notion.so/freelance-blueprint", kind: "link" },
        ],
        code: `// Client proposal template
const proposal = {
  header: { company: '[YOUR COMPANY]', date: new Date().toLocaleDateString() },
  problem: '[DESCRIBE THE CLIENT PROBLEM]',
  solution: '[YOUR PROPOSED SOLUTION]',
  deliverables: ['[DELIVERABLE 1]', '[DELIVERABLE 2]'],
  timeline: '[X WEEKS]',
  investment: { discovery: 0, development: 0, total: 0 },
  nextStep: 'Reply to schedule a 30-minute kick-off call.',
};
module.exports = proposal;`,
        automationGuide: {
            guideType: "business",
            complexity: "beginner",
            prerequisites: ["Basic computer skills", "Internet access"],
            toolsRequired: ["Notion", "Canva", "Gmail"],
            estimatedTime: "2 weeks",
            outcomes: ["Launched freelance profile", "First client proposal sent", "Pricing structure set"],
            includesTemplates: true,
        },
    },
    {
        category: "automation-guide",
        title: "No-Code Business Automation Masterclass",
        desc: "Learn to automate your entire business operations using Zapier, Make.com, and Airtable. No coding required.",
        price: 1199,
        installInstructions: "Follow the PDF guide chapter by chapter. Each chapter includes a hands-on exercise.",
        deliverables: [
            { label: "Masterclass PDF", url: SAMPLE_PDF, kind: "file" },
            { label: "Bonus Workflow Templates", url: "https://make.com/bonus-workflows", kind: "link" },
        ],
        code: `# Zapier Workflow YAML Config
trigger:
  app: Gmail
  event: new_email
  filter: subject contains "Invoice"

actions:
  - app: Airtable
    event: create_record
    table: Invoices
    fields:
      From: "{{trigger.from}}"
      Subject: "{{trigger.subject}}"
      Date: "{{trigger.date}}"
  - app: Slack
    event: send_message
    channel: "#finance"
    text: "New invoice from {{trigger.from}}"`,
        automationGuide: {
            guideType: "automation",
            complexity: "intermediate",
            prerequisites: ["Zapier free account", "Make.com account", "Airtable account"],
            toolsRequired: ["Zapier", "Make.com", "Airtable", "Gmail"],
            estimatedTime: "5 hours",
            outcomes: ["10+ automated workflows", "Saved 5+ hours/week", "Integrated tool stack"],
            includesTemplates: true,
        },
    },
    {
        category: "productivity-framework",
        title: "Second Brain GTD Framework",
        desc: "Implement David Allen's Getting Things Done system in Notion. Capture, clarify, organise, reflect and engage – all in one place.",
        price: 599,
        installInstructions: "Duplicate the Notion template, watch the onboarding video linked inside, and complete the Weekly Review setup.",
        deliverables: [
            { label: "GTD Reference Guide PDF", url: SAMPLE_PDF, kind: "file" },
            { label: "Notion Template", url: "https://notion.so/gtd-second-brain", kind: "link" },
        ],
        code: `// GTD Capture script
const inbox = [];

function capture(item) {
  inbox.push({ id: Date.now(), text: item, captured: new Date(), status: 'inbox' });
}

function clarify(id) {
  const item = inbox.find(i => i.id === id);
  if (!item) return;
  item.status = item.text.length < 2 ? 'trash' : 'next-action';
}

module.exports = { capture, clarify, inbox };`,
        productivityFramework: {
            frameworkType: "productivity",
            methodology: "GTD (Getting Things Done)",
            components: ["Inbox", "Projects", "Next Actions", "Someday/Maybe", "Reference", "Weekly Review"],
            integrations: ["Notion", "Google Calendar", "Gmail"],
            scalability: "personal",
            includesTemplates: true,
            includesWorkflows: true,
        },
    },
    {
        category: "react-template",
        title: "React Admin Dashboard Template",
        desc: "Beautiful, fully responsive React admin dashboard with charts, tables, auth pages, and dark/light mode built with TailwindCSS.",
        price: 1799,
        installInstructions: "Clone the repo, run `npm install && npm run dev`. Swap mock data endpoints with your API.",
        deliverables: [
            { label: "Component Guide PDF", url: SAMPLE_PDF, kind: "file" },
            { label: "Live Demo", url: "https://react-admin-demo.vercel.app", kind: "link" },
        ],
        code: `// Dashboard.tsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', revenue: 4000, users: 240 },
  { month: 'Feb', revenue: 3000, users: 221 },
  { month: 'Mar', revenue: 5000, users: 290 },
];

export default function Dashboard() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revenue)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}`,
        codeTemplate: {
            framework: "react",
            language: "tsx",
            componentType: "page",
            dependencies: ["recharts", "react-router-dom", "tailwindcss", "@headlessui/react"],
            hasLivePreview: true,
            codeFiles: [{ filename: "Dashboard.tsx", content: "// See deliverable", language: "tsx" }],
            sandboxEnabled: true,
        },
    },
    {
        category: "typescript-component",
        title: "TypeScript Utility Hooks Collection",
        desc: "30+ production-ready React hooks in TypeScript: useDebounce, useLocalStorage, useFetch, useIntersectionObserver, and more.",
        price: 899,
        installInstructions: "Copy the hooks you need into your `hooks/` directory. Each hook is self-contained with zero dependencies.",
        deliverables: [
            { label: "Hooks API Reference PDF", url: SAMPLE_PDF, kind: "file" },
            { label: "GitHub Repository", url: "https://github.com/example/typescript-hooks", kind: "link" },
        ],
        code: `// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debounced;
}

// hooks/useLocalStorage.ts
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try { return JSON.parse(localStorage.getItem(key) || '') as T; }
    catch { return initial; }
  });
  const set = (v: T) => { setValue(v); localStorage.setItem(key, JSON.stringify(v)); };
  return [value, set] as const;
}`,
        codeTemplate: {
            framework: "typescript",
            language: "typescript",
            componentType: "hook",
            dependencies: ["react"],
            hasLivePreview: false,
            codeFiles: [{ filename: "hooks.ts", content: "// See deliverable", language: "typescript" }],
            sandboxEnabled: false,
        },
    },
    {
        category: "css-template",
        title: "CSS Animation Library – 50 Ready-to-Use Animations",
        desc: "Pure CSS animation collection with 50 smooth, GPU-accelerated animations. Fade, slide, bounce, morph, and more.",
        price: 399,
        installInstructions: "Add `animations.css` to your project and apply class names to your elements.",
        deliverables: [
            { label: "Animation Reference PDF", url: SAMPLE_PDF, kind: "file" },
            { label: "CodePen Preview", url: "https://codepen.io/css-animation-library", kind: "link" },
        ],
        code: `/* animations.css */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.05); }
}

@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.animate-fade-in-up  { animation: fadeInUp 0.5s ease forwards; }
.animate-pulse-soft  { animation: pulse 2s ease-in-out infinite; }
.animate-shimmer     { background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);
                       background-size: 200% 100%; animation: shimmer 1.5s infinite; }`,
        codeTemplate: {
            framework: "css",
            language: "css",
            componentType: "utility",
            dependencies: [],
            hasLivePreview: true,
            codeFiles: [{ filename: "animations.css", content: "/* See deliverable */", language: "css" }],
            sandboxEnabled: true,
        },
    },
];
async function seed() {
    await mongoose_1.default.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    const NUM_USERS = 12;
    const createdUsers = [];
    // Create users
    for (let i = 1; i <= NUM_USERS; i++) {
        const email = `user${i}@gmail.com`;
        const passwordHash = await (0, auth_1.hashPassword)(`user${i}`);
        const user = await User_1.User.create({
            name: `User ${i}`,
            email,
            passwordHash,
            isCreator: true,
        });
        createdUsers.push(user);
        console.log(`Created user: ${email}`);
    }
    // Create products for each user
    for (const user of createdUsers) {
        const userId = user._id;
        for (let ti = 0; ti < PRODUCT_TEMPLATES.length; ti++) {
            const tmpl = PRODUCT_TEMPLATES[ti];
            const userIdx = createdUsers.indexOf(user) + 1;
            const titleVariant = `${tmpl.title} v${userIdx}`;
            const slug = await ensureSlug(toSlug(titleVariant));
            // Build product data
            const productData = {
                creatorId: userId,
                title: titleVariant,
                description: tmpl.desc,
                price: tmpl.price,
                currency: "INR",
                visibility: "published",
                slug,
                category: tmpl.category,
                installInstructions: tmpl.installInstructions,
                license: "Personal Use",
                requirements: ["Internet connection", "Modern browser"],
                deliverables: [
                    ...tmpl.deliverables,
                    { label: "Source Code", url: `data:text/plain;charset=utf-8,${encodeURIComponent(tmpl.code)}`, kind: "code" },
                ],
                tags: [tmpl.category, "digital-product", "template"],
                stats: { viewCount: 0, soldCount: 0, revenue: 0, averageRating: 0, reviewCount: 0, conversionRate: 0 },
                seo: {
                    title: titleVariant,
                    description: tmpl.desc.slice(0, 160),
                    keywords: [tmpl.category, "template", "digital"],
                    tags: [tmpl.category],
                },
                page: {
                    sections: [
                        { heading: "What's Included", bullets: ["Full source files", "Documentation", "Lifetime updates"] },
                        { heading: "Who Is This For", bullets: ["Developers", "Designers", "Entrepreneurs", "Freelancers"] },
                    ],
                    pricingTiers: [
                        { name: "Personal", price: String(tmpl.price), features: ["Personal use", "Lifetime access", "Free updates"], popular: true, license: "personal" },
                        { name: "Commercial", price: String(tmpl.price * 2), features: ["Commercial use", "Client projects", "Priority support"], popular: false, license: "commercial" },
                    ],
                },
                coverImageAssetId: null,
            };
            if (tmpl.aiPromptPack)
                productData.aiPromptPack = tmpl.aiPromptPack;
            if (tmpl.template)
                productData.template = tmpl.template;
            if (tmpl.codeTemplate)
                productData.codeTemplate = tmpl.codeTemplate;
            if (tmpl.developerBoilerplate)
                productData.developerBoilerplate = tmpl.developerBoilerplate;
            if (tmpl.workflowSystem)
                productData.workflowSystem = tmpl.workflowSystem;
            if (tmpl.automationGuide)
                productData.automationGuide = tmpl.automationGuide;
            if (tmpl.productivityFramework)
                productData.productivityFramework = tmpl.productivityFramework;
            const product = await Product_1.Product.create(productData);
            const productId = product._id;
            // Create image assets
            const urls = getImages(tmpl.category);
            const imageAssets = [];
            for (let imgIdx = 0; imgIdx < urls.length; imgIdx++) {
                const url = urls[imgIdx];
                const asset = await ImageAsset_1.ImageAsset.create({
                    productId,
                    creatorId: userId,
                    source: { sourceUrl: url, sourcePageUrl: url },
                    cloudinary: {
                        publicId: `seed/${slug}-${imgIdx}`,
                        secureUrl: url,
                        folder: "quotient/products",
                    },
                    meta: { filename: `image-${imgIdx + 1}.jpg`, contentType: "image/jpeg", sizeBytes: 204800, width: 900, height: 600 },
                    orderIndex: imgIdx,
                });
                imageAssets.push(asset);
            }
            // Set cover image to first asset
            await Product_1.Product.updateOne({ _id: productId }, { coverImageAssetId: imageAssets[0]._id });
            console.log(`  ✓ ${titleVariant} (${tmpl.category})`);
        }
        console.log(`Finished products for user${createdUsers.indexOf(user) + 1}@gmail.com`);
    }
    console.log("\n✅ Seed complete!");
    console.log(`Users: ${NUM_USERS}`);
    console.log(`Products: ${NUM_USERS * PRODUCT_TEMPLATES.length}`);
    process.exit(0);
}
seed().catch((e) => { console.error(e); process.exit(1); });
