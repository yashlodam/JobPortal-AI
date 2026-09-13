/**
 * src/features/resume-builder/constants/resumeTemplates.js
 * Catalog of 6 ATS-Friendly Enterprise Resume Templates & Data Schema.
 */

export const RESUME_TEMPLATES = [
  {
    id: "professional",
    name: "Professional",
    badge: "Default",
    category: "ATS Standard",
    description: "Clean single-column layout, ATS-friendly, professional typography and minimal colors. Suitable for 90% of users.",
    previewColor: "from-slate-700 to-indigo-900",
    isPopular: true,
  },
  {
    id: "modern",
    name: "Modern",
    badge: "Popular",
    category: "Clean Hierarchy",
    description: "Modern clean layout with subtle color accents and distinct visual hierarchy. Ideal for software engineers and product roles.",
    previewColor: "from-indigo-600 to-purple-900",
    isPopular: true,
  },
  {
    id: "minimal",
    name: "Minimal",
    badge: "High ATS Pass",
    category: "Black & White",
    description: "Extremely ATS-friendly, black & white layout without graphics or icons. Ideal for campus placements and freshers.",
    previewColor: "from-zinc-800 to-black",
    isPopular: false,
  },
  {
    id: "software_engineer",
    name: "Software Engineer",
    badge: "Tech Specific",
    category: "Engineering",
    description: "Specifically engineered for tech professionals. Highlights technical stack, GitHub repos, live projects, and certifications.",
    previewColor: "from-blue-600 to-slate-900",
    isPopular: true,
  },
  {
    id: "corporate",
    name: "Corporate",
    badge: "Executive",
    category: "Leadership",
    description: "Executive traditional business style suitable for experienced professionals, managers, architects, and senior leads.",
    previewColor: "from-amber-700 to-slate-900",
    isPopular: false,
  },
  {
    id: "creative",
    name: "Creative",
    badge: "Design & Marketing",
    category: "Modern Creative",
    description: "Modern layout with enhanced typography and subtle visual accents. Designed for UI/UX, product design, and marketing while maintaining 100% ATS compatibility.",
    previewColor: "from-purple-600 to-pink-900",
    isPopular: false,
  },
];

export const BLANK_RESUME_SCHEMA = {
  id: null,
  title: "Untitled Full Stack Resume",
  templateId: "professional",
  lastUpdated: new Date().toISOString(),
  completionPercentage: 35,
  atsScore: 78,
  personalInfo: {
    fullName: "Vitthal Lodam",
    professionalTitle: "Senior Full Stack Software Engineer",
    email: "lodamsunil05@gmail.com",
    phone: "+91 98765 43210",
    location: "Pune, India",
    linkedIn: "https://linkedin.com/in/vitthal-lodam",
    gitHub: "https://github.com/vitthallodam",
    portfolio: "https://vitthallodam.dev",
  },
  summary:
    "Results-driven Senior Full Stack Software Engineer with 4+ years of experience designing scalable microservices with Spring Boot 3, React 19, and PostgreSQL. Demonstrated expertise in building high-throughput REST APIs and AI-integrated applications.",
  experience: [
    {
      id: "exp-1",
      company: "TechNova Global Solutions",
      position: "Senior Full Stack Developer",
      location: "Mumbai, India",
      startDate: "Jan 2023",
      endDate: "Present",
      current: true,
      description:
        "• Architected high-throughput Spring Boot 3 microservices handling 500k+ daily transactions with 99.99% uptime.\n• Spearheaded React 19 frontend integration with Redux Toolkit, improving Core Web Vitals performance score by 42%.\n• Built automated CI/CD pipelines using Docker and Kubernetes, reducing deployment rollout time from 45 mins to 8 mins.",
    },
    {
      id: "exp-2",
      company: "Vercel Systems Inc.",
      position: "Software Engineer",
      location: "Pune, India",
      startDate: "Jun 2021",
      endDate: "Dec 2022",
      current: false,
      description:
        "• Engineered RESTful services in Java and PostgreSQL for real-time analytics dashboards.\n• Implemented secure JWT authentication and OAuth2 SSO integration across 12 internal microservices.\n• Mentored 4 junior developers in clean code practices, unit testing with JUnit 5, and Git workflows.",
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Pune Institute of Computer Technology (PICT)",
      degree: "Bachelor of Technology (B.Tech)",
      fieldOfStudy: "Computer Science & Engineering",
      grade: "8.9 / 10 CGPA",
      startDate: "Aug 2017",
      endDate: "May 2021",
      location: "Pune, India",
      description: "Graduated with First Class Distinction. Specialized in Distributed Systems and Cloud Architectures.",
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "AI Job Portal & Mock Interview SaaS Platform",
      technologies: ["React 19", "Spring Boot 3", "Redux Toolkit", "PostgreSQL", "Tailwind CSS"],
      githubUrl: "https://github.com/vitthallodam/job-portal-frontend",
      liveUrl: "https://jobportal-demo.com",
      startDate: "Jan 2024",
      endDate: "Mar 2024",
      description:
        "Enterprise recruitment platform featuring real-time AI mock interview evaluations, structured ATS resume builder, and Spring Boot REST microservices backend.",
    },
    {
      id: "proj-2",
      name: "Distributed Event-Driven Notification Engine",
      technologies: ["Java 21", "Apache Kafka", "Redis", "Docker"],
      githubUrl: "https://github.com/vitthallodam/notification-engine",
      liveUrl: "",
      startDate: "Sep 2023",
      endDate: "Nov 2023",
      description:
        "High-performance notification hub processing 10k messages/second using Kafka event streams and Redis caching layer.",
    },
  ],
  skills: {
    technical: ["Java 21", "JavaScript (ES6+)", "TypeScript", "SQL", "HTML5/CSS3"],
    frameworks: ["Spring Boot 3", "React 19", "Redux Toolkit", "FastAPI", "Tailwind CSS"],
    tools: ["Docker", "Kubernetes", "PostgreSQL", "Redis", "Git", "Maven", "Postman"],
    soft: ["System Architecture", "Technical Leadership", "Agile/Scrum", "Code Auditing"],
  },
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      date: "Mar 2023",
      credentialUrl: "https://aws.amazon.com/verification",
    },
    {
      id: "cert-2",
      name: "Spring Certified Professional",
      issuer: "Broadcom / VMware",
      date: "Nov 2022",
      credentialUrl: "https://vmware.com/credentials",
    },
  ],
  achievements: [
    {
      id: "ach-1",
      title: "Winner – National Cloud Hackathon 2023",
      date: "Oct 2023",
      description: "Awarded 1st place among 150+ developer teams for building a serverless micro-donation platform.",
    },
  ],
  languages: [
    { id: "lang-1", language: "English", proficiency: "Full Professional" },
    { id: "lang-2", language: "Hindi", proficiency: "Native / Bilingual" },
    { id: "lang-3", language: "Marathi", proficiency: "Native / Bilingual" },
  ],
  customSections: [],
};
