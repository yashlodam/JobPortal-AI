/**
 * src/features/resume-analyzer/constants/mockAnalysisData.js
 * Comprehensive realistic mock data matching backend Spring Boot ResumeAnalysisResponse DTO.
 * NOTE: This mock data should ONLY be used as a fallback when the real API fails.
 */

export const INITIAL_MOCK_ANALYSIS = {
  id: 1,
  resumeId: 1,
  resumeName: "My_Resume (6).pdf",
  fileSize: "1.8 MB",
  analyzedAt: "2026-08-07T16:14:44.723362",
  overallScore: 92,
  atsScore: 95,
  fromCache: true,

  // Executive AI Summary
  summary:
    "Yash's resume is exceptionally strong for an entry-level Java Full Stack Developer, showcasing hands-on experience with modern technologies including AI/LLM integration, robust projects, and a solid academic background. While the resume excels in ATS compatibility and technical depth, further quantifying achievements with specific metrics and clarifying project timelines would enhance its impact.",

  // Skills Found
  skills: [
    "Java",
    "JavaScript",
    "SQL",
    "React.js",
    "HTML5",
    "CSS3",
    "Responsive Web Design",
    "Tailwind CSS",
    "Bootstrap",
    "Spring Boot",
    "Spring MVC",
    "Spring Security",
    "Spring Data JPA",
    "Hibernate",
    "RESTful APIs",
    "JWT Authentication",
    "JSP",
    "Servlets",
    "JDBC",
    "PostgreSQL",
    "MySQL",
    "Database Design",
    "Query Optimization",
    "Spring AI",
    "LLM Integration",
    "Retrieval-Augmented Generation (RAG)",
    "Vector Databases",
    "Embeddings",
    "Object-Oriented Programming (OOP)",
    "Data Structures & Algorithms (DSA)",
    "Collections Framework",
    "Exception Handling",
    "MVC Architecture",
    "System Design Basics",
    "Git",
    "GitHub",
    "Maven",
    "Postman",
    "Agile/Scrum",
    "SDLC",
    "VS Code",
    "Eclipse",
    "Collaboration",
    "Manual Testing",
  ],

  // Missing Skills
  missingSkills: [
    "Cloud Platforms (AWS/Azure/GCP)",
    "Containerization (Docker/Kubernetes)",
    "Testing Frameworks (JUnit, Mockito, Jest)",
    "Message Brokers (Kafka/RabbitMQ)",
    "CI/CD Tools (Jenkins/GitLab CI/CD)",
  ],

  // Key Strengths
  strengths: [
    "Strong Professional Summary: Clearly defines the candidate's profile, key technologies, and unique selling points, including AI/LLM integration.",
    "Comprehensive Technical Skills Section: Well-categorized and extensive list of relevant technologies, making it highly ATS-friendly and easy to parse.",
    "Relevant Project Experience with Modern Tech: Projects demonstrate practical application of full-stack development, including cutting-edge AI/LLM integration, showcasing initiative and skill.",
    "Quantifiable Achievements & Coding Profile: Inclusion of CGPA, competition wins, and LeetCode problem count provides concrete evidence of capability and dedication.",
    "Clear and Action-Oriented Bullet Points: Experience and project descriptions use strong action verbs and explicitly state technologies used and contributions.",
  ],

  // Key Improvements
  improvements: [
    "Quantify impact more: Enhance bullet points with specific metrics (e.g., 'optimized queries, reducing processing time by X%') to demonstrate tangible results.",
    "Clarify/Adjust Dates: The internship and project dates (e.g., Dec 2025 – Feb 2026) appear to be in the future, which is confusing and needs to be corrected to reflect actual past experience or expected completion if still ongoing.",
    "Elaborate on Soft Skills: While collaboration and Agile are mentioned, integrate more explicit soft skills (e.g., problem-solving, communication, leadership) into bullet points where applicable.",
    "Consider a 'Key Achievements' Section: Given the strong academic and competition achievements, a brief section near the top could quickly showcase top accomplishments, making them more prominent.",
    "Tailor Summary for Specific Roles: While the current summary is good, for specific applications, slightly tailor it to match keywords and requirements of the target job description.",
  ],

  // Recommended Job Matches
  recommendedJobs: [
    "Junior Java Full Stack Developer",
    "Backend Developer (Java/Spring Boot)",
    "Frontend Developer (React.js)",
    "AI/LLM Integration Engineer (Entry-Level)",
    "Software Engineer",
  ],

  // Scores Object for Radial Gauges
  scores: {
    overall: 92,
    ats: 95,
    skills: 90,
    experience: 88,
    education: 95,
    grammar: 98,
    readability: 92,
    formatting: 96,
  },

  benchmarks: {
    percentile: 96,
    candidateTier: "Top 4% Candidate Pool Match",
    estimatedCallbacks: "High (4.5x industry average)",
    recruiterRating: "A+",
  },
};
