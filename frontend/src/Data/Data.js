import {
  Code2,
  Briefcase,
  Megaphone,
  BarChart3,
  HeartPulse,
  Palette,
  ShieldCheck,
  GraduationCap,
  Laptop,
  Home,
  Building2,
  Globe,
  FileText,
  MessageSquare,
  Mic,
  Bot,
  Sparkles,
  Search,
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  Star,
} from "lucide-react";

/* ===========================
    Category Gradients
=========================== */

const categoryGradients = [
  { from: "#6366F1", to: "#818CF8" },  // Indigo
  { from: "#EC4899", to: "#F472B6" },  // Pink
  { from: "#06B6D4", to: "#22D3EE" },  // Cyan
  { from: "#F59E0B", to: "#FBBF24" },  // Amber
  { from: "#10B981", to: "#34D399" },  // Emerald
  { from: "#8B5CF6", to: "#A78BFA" },  // Violet
  { from: "#EF4444", to: "#F87171" },  // Red
  { from: "#3B82F6", to: "#60A5FA" },  // Blue
];

export const categories = [
  { title: "Software", jobs: "Explore Roles", icon: Code2, gradient: categoryGradients[0] },
  { title: "Marketing", jobs: "Explore Roles", icon: Megaphone, gradient: categoryGradients[1] },
  { title: "Sales", jobs: "Explore Roles", icon: BarChart3, gradient: categoryGradients[2] },
  { title: "Finance", jobs: "Explore Roles", icon: Briefcase, gradient: categoryGradients[3] },
  { title: "Healthcare", jobs: "Explore Roles", icon: HeartPulse, gradient: categoryGradients[4] },
  { title: "Design", jobs: "Explore Roles", icon: Palette, gradient: categoryGradients[5] },
  { title: "Cyber Security", jobs: "Explore Roles", icon: ShieldCheck, gradient: categoryGradients[6] },
  { title: "Education", jobs: "Explore Roles", icon: GraduationCap, gradient: categoryGradients[7] },
];

export const workModes = [
  { title: "Remote", jobs: "Explore Roles", icon: Home, gradient: categoryGradients[4] },
  { title: "Hybrid", jobs: "Explore Roles", icon: Building2, gradient: categoryGradients[0] },
  { title: "On Site", jobs: "Explore Roles", icon: Laptop, gradient: categoryGradients[2] },
  { title: "Contract", jobs: "Explore Roles", icon: Briefcase, gradient: categoryGradients[3] },
  { title: "Internship", jobs: "Explore Roles", icon: GraduationCap, gradient: categoryGradients[5] },
  { title: "Full Time", jobs: "Explore Roles", icon: Globe, gradient: categoryGradients[7] },
  { title: "Part Time", jobs: "Explore Roles", icon: BarChart3, gradient: categoryGradients[1] },
  { title: "Freelance", jobs: "Explore Roles", icon: Code2, gradient: categoryGradients[6] },
];

/* ===========================
    Testimonials (Removed in favor of genuine ProductFeatures)
=========================== */

export const testimonials = [];

/* ===========================
    Featured Jobs
=========================== */

export const featuredJobs = [
  {
    id: 1,
    title: "Senior Fullstack Engineer",
    company: "Nexus Cloud Systems",
    location: "Bengaluru (Hybrid)",
    salary: "₹18,00,000 – ₹26,00,000",
    type: "Full Time",
    mode: "HYBRID",
    tags: ["React", "TypeScript", "Node.js"],
    posted: "1 day ago",
    featured: true,
  },
  {
    id: 2,
    title: "Product UI/UX Designer",
    company: "DesignCraft Studio",
    location: "Remote",
    salary: "₹12,00,000 – ₹18,00,000",
    type: "Full Time",
    mode: "REMOTE",
    tags: ["Figma", "Design Systems", "Prototyping"],
    posted: "2 days ago",
    featured: true,
  },
  {
    id: 3,
    title: "AI / ML Systems Engineer",
    company: "Cortex Intelligence",
    location: "Pune (Hybrid)",
    salary: "₹22,00,000 – ₹32,00,000",
    type: "Full Time",
    mode: "HYBRID",
    tags: ["Python", "PyTorch", "LLMs"],
    posted: "3 days ago",
    featured: true,
  },
  {
    id: 4,
    title: "DevOps & Cloud Architect",
    company: "ScaleFlow Infrastructure",
    location: "Hyderabad (On Site)",
    salary: "₹20,0,000 – ₹28,00,000",
    type: "Full Time",
    mode: "ON_SITE",
    tags: ["AWS", "Kubernetes", "Docker"],
    posted: "Just now",
    featured: true,
  },
  {
    id: 5,
    title: "Java Spring Boot Engineer",
    company: "FinVertex Solutions",
    location: "Bengaluru (Hybrid)",
    salary: "₹16,00,000 – ₹24,00,000",
    type: "Full Time",
    mode: "HYBRID",
    tags: ["Java", "Spring Boot", "PostgreSQL"],
    posted: "4 days ago",
    featured: true,
  },
  {
    id: 6,
    title: "Data Platform Engineer",
    company: "StreamCore Analytics",
    location: "Remote",
    salary: "₹18,00,000 – ₹25,00,000",
    type: "Full Time",
    mode: "REMOTE",
    tags: ["Kafka", "Python", "SQL"],
    posted: "5 days ago",
    featured: true,
  },
];

/* ===========================
    AI Tools
=========================== */

export const aiTools = [
  {
    id: 1,
    title: "AI Resume Builder",
    description: "Craft ATS-optimized resumes in minutes with AI-powered suggestions, formatting, and keyword optimization.",
    icon: FileText,
    gradient: { from: "#6366F1", to: "#8B5CF6" },
    stats: "ATS Compatible",
    tag: "Resume Suite",
  },
  {
    id: 2,
    title: "AI Cover Letter Generator",
    description: "Generate personalized, compelling cover letters tailored to specific job descriptions instantly.",
    icon: MessageSquare,
    gradient: { from: "#06B6D4", to: "#22D3EE" },
    stats: "Job Tailored",
    tag: "Applications",
  },
  {
    id: 3,
    title: "AI Interview Preparation",
    description: "Practice with AI-powered mock interviews. Get real-time feedback on your answers, tone, and technical precision.",
    icon: Mic,
    gradient: { from: "#EC4899", to: "#F472B6" },
    stats: "Instant Feedback",
    tag: "Interview Coach",
  },
  {
    id: 4,
    title: "AI Career Assistant",
    description: "Your 24/7 career advisor. Get personalized job recommendations, career path insights, and role alignment.",
    icon: Bot,
    gradient: { from: "#10B981", to: "#34D399" },
    stats: "Semantic Matching",
    tag: "Career AI",
  },
];

export const profile = {
  id: 1,

  name: "Yash Lodam",
  role: "Software Developer",
  company: "Google",
  location: "New York, United States",

  profileImage: "profile.png",
  bannerImage: "banner.png",

  about:
    "Passionate Full Stack Software Developer with experience in building scalable and user-friendly web applications. Skilled in React, Java, Spring Boot, and modern backend technologies. I enjoy solving complex problems and creating high-quality digital experiences.",

  skills: [
    "React",
    "JavaScript",
    "Java",
    "Spring Boot",
    "Tailwind CSS",
    "PostgreSQL",
    "MySQL",
    "Git",
    "Docker",
    "REST API",
  ],

  experience: [
    {
      id: 1,
      role: "Software Developer",
      company: "Google",
      location: "New York, United States",
      type: "Full Time",
      startDate: "Jan 2024",
      endDate: "Present",
      description:
        "Developing scalable web applications and collaborating with cross-functional teams to build high-quality software solutions.",
    },
    {
      id: 2,
      role: "Frontend Developer",
      company: "Microsoft",
      location: "Remote",
      type: "Internship",
      startDate: "Jun 2023",
      endDate: "Dec 2023",
      description:
        "Built responsive user interfaces using React and modern frontend technologies while improving application performance and user experience.",
    },
  ],

  education: [
    {
      id: 1,
      degree: "Bachelor of Engineering in Computer Engineering",
      college: "Savitribai Phule Pune University",
      location: "Pune, Maharashtra",
      startYear: "2022",
      endYear: "2026",
    },
  ],

  projects: [
    {
      id: 1,
      title: "AI-Powered Job Portal",
      description:
        "A full-stack job platform that helps candidates discover jobs, build profiles, and connect with recruiters.",
      technologies: [
        "React",
        "Spring Boot",
        "PostgreSQL",
        "Spring AI",
      ],
      url: "https://github.com/yashlodam",
    },
    {
      id: 2,
      title: "Multi-Vendor E-Commerce Platform",
      description:
        "A scalable e-commerce platform where multiple sellers can manage products, orders, and customers.",
      technologies: [
        "React",
        "Java",
        "Spring Boot",
        "PostgreSQL",
      ],
      url: "",
    },
  ],

  certifications: [
    {
      id: 1,
      title: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      issuedDate: "Mar 2024",
      credentialId: "AWS-SAA-C03-2024",
      credentialUrl: "https://aws.amazon.com/certification/",
    },
    {
      id: 2,
      title: "Google Cloud Professional Developer",
      issuer: "Google Cloud",
      issuedDate: "Jan 2025",
      credentialId: "GCP-PD-2025",
      credentialUrl: "https://cloud.google.com/certification",
    },
  ],

  availability: "Open to Work",

  experienceLevel: "Mid Level",

  languages: [
    "English",
    "Hindi",
    "Marathi",
  ],

  email: "yashlodam03@gmail.com",

  socialLinks: {
    linkedin: "https://linkedin.com/in/yashlodam",
    github: "https://github.com/yashlodam",
    portfolio: "https://yashlodam.dev",
    email: "mailto:yashlodam03@gmail.com",
  },
};