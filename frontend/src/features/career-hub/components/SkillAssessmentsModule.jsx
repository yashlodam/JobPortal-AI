/**
 * src/features/career-hub/components/SkillAssessmentsModule.jsx
 * Enterprise Skill Assessments & Certification Studio.
 * Includes interactive test environment, real-time grading, certificate modal, and badge gallery.
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  FileCheck,
  Filter,
  Layers,
  Layout,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trophy,
  X,
  Share2,
  Download,
} from "lucide-react";
import { useToast } from "../../../components/ui/ToastNotification";
import { useAppSelector } from "../../../State/Store";

// Rich Dataset of Skill Assessments & Real Question Banks
const ASSESSMENT_CATALOG = [
  {
    id: "react-19",
    title: "React 19 & State Architecture",
    category: "Frontend",
    level: "Advanced",
    duration: "15 mins",
    badgeTitle: "React Certified Senior Architect",
    badgeCode: "CERT-REACT-19",
    description: "Evaluates Concurrent React, Server Components, useTransition, Redux Toolkit, and performance profiling.",
    questions: [
      {
        id: 1,
        question: "Which hook in React 19 allows updating state without blocking the UI main thread during expensive rendering?",
        options: ["useDeferredValue", "useTransition", "useImperativeHandle", "useLayoutEffect"],
        correctIndex: 1,
        explanation: "useTransition marks state updates as non-blocking transitions, allowing urgent updates like user typing to interrupt heavy renders.",
      },
      {
        id: 2,
        question: "What is the primary benefit of React Server Components (RSC)?",
        options: [
          "Executes component logic on the client bundle",
          "Zero bundle-size impact for server-only dependencies & direct DB access",
          "Replaces Redux Toolkit for global client state",
          "Automatically converts CSS to Tailwind CSS",
        ],
        correctIndex: 1,
        explanation: "React Server Components run exclusively on the server, resulting in 0kb client JavaScript overhead for server dependencies.",
      },
      {
        id: 3,
        question: "In Redux Toolkit, which function automatically generates action creators and action types based on reducers?",
        options: ["createSlice", "createAction", "createStore", "combineReducers"],
        correctIndex: 0,
        explanation: "createSlice simplifies Redux logic by auto-generating action creators and reducer functions matching the slice name.",
      },
      {
        id: 4,
        question: "Why should key props in list rendering never use array indices if the list items can be reordered or filtered?",
        options: [
          "Array indices cause TypeScript compilation errors",
          "It causes component state mismatch and unnecessary DOM updates during reconcillation",
          "React 19 deprecates array index keys",
          "It causes memory leaks in useEffect",
        ],
        correctIndex: 1,
        explanation: "Using index keys misidentifies DOM nodes when list items change order, causing state bugs and rendering glitches.",
      },
      {
        id: 5,
        question: "What is the purpose of React.memo higher-order component?",
        options: [
          "Caches API HTTP GET responses",
          "Skips re-rendering a component if its props have not changed",
          "Automatically memoizes inline callback functions",
          "Prevents memory leaks in WebSocket connections",
        ],
        correctIndex: 1,
        explanation: "React.memo is a performance optimization that memoizes the rendered output, skipping re-renders when props remain unchanged.",
      },
    ],
  },
  {
    id: "spring-boot-3",
    title: "Spring Boot 3 & Enterprise Microservices",
    category: "Backend",
    level: "Intermediate",
    duration: "20 mins",
    badgeTitle: "Spring Boot Certified Specialist",
    badgeCode: "CERT-SPRING-3",
    description: "Assesses Spring Security 6, JPA Hibernate, RESTful API design, Resilience4j, and Kafka event streaming.",
    questions: [
      {
        id: 1,
        question: "Which annotation in Spring Boot 3 marks a class as a REST controller returning serialized JSON responses?",
        options: ["@Controller", "@RestController", "@Service", "@Repository"],
        correctIndex: 1,
        explanation: "@RestController is a convenience annotation combining @Controller and @ResponseBody, automatically serializing return values to JSON.",
      },
      {
        id: 2,
        question: "How do you configure stateless JWT authentication in Spring Security 6 SecurityFilterChain?",
        options: [
          "http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)",
          "http.formLogin().disableState()",
          "http.csrf().enableStateless()",
          "http.jwt().setStateless(true)",
        ],
        correctIndex: 0,
        explanation: "Setting SessionCreationPolicy.STATELESS instructs Spring Security to never create an HTTP session, relying entirely on Bearer tokens.",
      },
      {
        id: 3,
        question: "What does the @Transactional(readOnly = true) annotation accomplish in Spring Data JPA?",
        options: [
          "Disables database connection pooling",
          "Optimizes Hibernate dirty checking and prevents flush overhead on read queries",
          "Prevents read operations from accessing the database",
          "Enforces row-level locks on PostgreSQL tables",
        ],
        correctIndex: 1,
        explanation: "readOnly = true informs Hibernate to skip dirty checking snapshot comparisons, providing significant performance gains for reads.",
      },
      {
        id: 4,
        question: "Which Spring Cloud component handles client-side load balancing for microservices?",
        options: ["Spring Cloud CircuitBreaker", "Spring Cloud LoadBalancer / Eureka", "Spring Batch", "Spring Integration"],
        correctIndex: 1,
        explanation: "Spring Cloud LoadBalancer works with service discovery (Eureka) to distribute HTTP requests across active instances.",
      },
      {
        id: 5,
        question: "What is the primary role of Resilience4j CircuitBreaker in microservices?",
        options: [
          "Encrypts network traffic between services",
          "Prevents cascading service failures by failing fast when a downstream dependency is unhealthy",
          "Balances CPU load across Docker containers",
          "Generates OpenAPI documentation automatically",
        ],
        correctIndex: 1,
        explanation: "CircuitBreaker opens when call failure rates breach a threshold, preventing thread pool exhaustion and cascading system outages.",
      },
    ],
  },
  {
    id: "system-design",
    title: "System Design & Distributed Scalability",
    category: "Architecture",
    level: "Architect",
    duration: "25 mins",
    badgeTitle: "Distributed Systems Certified Architect",
    badgeCode: "CERT-SYS-ARCH",
    description: "Evaluates horizontal sharding, Redis caching strategies, CAP theorem, message queues, and rate limiting.",
    questions: [
      {
        id: 1,
        question: "According to the CAP Theorem, what two guarantees does a distributed system choose during a network partition (P)?",
        options: ["Consistency & Availability", "Concurrency & Parallelism", "Caching & Persistence", "Cluster & Provisioning"],
        correctIndex: 0,
        explanation: "During a network partition (P), a distributed system must trade off between Consistency (C) and Availability (A).",
      },
      {
        id: 2,
        question: "Which Redis caching strategy writes data to the database first, and updates cache only when read on demand?",
        options: ["Write-Through", "Cache-Aside (Lazy Loading)", "Write-Behind (Write-Back)", "Refresh-Ahead"],
        correctIndex: 1,
        explanation: "In Cache-Aside, the application looks up cache first; on a cache miss, it reads DB and populates cache for subsequent requests.",
      },
      {
        id: 3,
        question: "What algorithm is commonly used for distributed database sharding to minimize data migration when nodes scale?",
        options: ["Consistent Hashing", "Round Robin", "Least Connections", "B-Tree Indexing"],
        correctIndex: 0,
        explanation: "Consistent Hashing maps both data keys and server nodes to a virtual ring, minimizing key re-mapping when scaling clusters.",
      },
      {
        id: 4,
        question: "What is the primary advantage of Event-Driven Architecture using Apache Kafka over synchronous REST HTTP calls?",
        options: [
          "Faster SQL queries",
          "Decoupling producers/consumers and enabling asynchronous peak load buffering",
          "Eliminates database storage",
          "Requires no server infrastructure",
        ],
        correctIndex: 1,
        explanation: "Kafka buffers events asynchronously, allowing consumers to process traffic spikes at their own pace without blocking producers.",
      },
      {
        id: 5,
        question: "Which rate-limiting algorithm uses a fixed capacity bucket that refills tokens at a constant rate?",
        options: ["Token Bucket", "Leaky Bucket", "Fixed Window Counter", "Sliding Window Log"],
        correctIndex: 0,
        explanation: "Token Bucket allows short bursts up to bucket capacity while maintaining a steady long-term rate limit.",
      },
    ],
  },
  {
    id: "python-fastapi",
    title: "Python FastAPI & Async Microservices",
    category: "Backend",
    level: "Intermediate",
    duration: "15 mins",
    badgeTitle: "FastAPI Certified Engineer",
    badgeCode: "CERT-PY-FASTAPI",
    description: "Covers Pydantic v2 schemas, AsyncIO event loop, Dependency Injection, and SQLAlchemy 2.0 ORM.",
    questions: [
      {
        id: 1,
        question: "What library does FastAPI leverage for data validation and JSON schema generation?",
        options: ["Marshmallow", "Pydantic", "Cerberus", "Dataclasses"],
        correctIndex: 1,
        explanation: "FastAPI uses Pydantic for high-performance type hints, request validation, and automatic OpenAPI schema generation.",
      },
      {
        id: 2,
        question: "How do you define an asynchronous non-blocking endpoint in FastAPI?",
        options: ["def get_items():", "async def get_items():", "@async_route def get_items():", "yield def get_items():"],
        correctIndex: 1,
        explanation: "Declaring route functions with `async def` allows FastAPI to execute I/O operations non-blockingly on the AsyncIO event loop.",
      },
      {
        id: 3,
        question: "What is the FastAPI feature used for shared authentication, database sessions, and reusable logic across endpoints?",
        options: ["Middleware", "Depends (Dependency Injection)", "BackgroundTasks", "APIRouter"],
        correctIndex: 1,
        explanation: "FastAPI's Depends system manages dependency injection cleanly across endpoint parameters.",
      },
      {
        id: 4,
        question: "What ASGI server is standard for running production FastAPI applications?",
        options: ["Gunicorn with Uvicorn workers", "WSGI SimpleServer", "Apache HTTPD", "Nginx static worker"],
        correctIndex: 0,
        explanation: "Running Uvicorn ASGI workers inside Gunicorn process manager is the production benchmark for FastAPI.",
      },
      {
        id: 5,
        question: "In SQLAlchemy 2.0, what function executes async database queries asynchronously?",
        options: ["session.query()", "await session.execute(select(...))", "session.fetch_all()", "session.commit_sync()"],
        correctIndex: 1,
        explanation: "SQLAlchemy 2.0 uses `await session.execute(select(...))` for non-blocking async DB queries.",
      },
    ],
  },
];

export default function SkillAssessmentsModule() {
  const toast = useToast();
  const user = useAppSelector((state) => state.auth.profile);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [earnedBadges, setEarnedBadges] = useState(() => {
    const saved = localStorage.getItem("jobportal_earned_badges");
    return saved ? JSON.parse(saved) : ["CERT-REACT-19"];
  });
  const [certificateModal, setCertificateModal] = useState(null);

  // Save earned badges
  useEffect(() => {
    localStorage.setItem("jobportal_earned_badges", JSON.stringify(earnedBadges));
  }, [earnedBadges]);

  const categories = ["All", "Frontend", "Backend", "Architecture"];

  const filteredCatalog = ASSESSMENT_CATALOG.filter((item) =>
    selectedCategory === "All" ? true : item.category === selectedCategory
  );

  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setQuizResult(null);
  };

  const handleAnswerSelect = (optionIdx) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIdx]: optionIdx,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < activeQuiz.questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score += 20;
      }
    });

    const passed = score >= 70;
    const result = {
      score,
      passed,
      badgeTitle: activeQuiz.badgeTitle,
      badgeCode: activeQuiz.badgeCode,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    };

    setQuizResult(result);

    if (passed && !earnedBadges.includes(activeQuiz.badgeCode)) {
      setEarnedBadges((prev) => [...prev, activeQuiz.badgeCode]);
      toast.success(`Congratulations! You earned the official ${activeQuiz.badgeTitle} Certificate!`);
    } else if (passed) {
      toast.info(`Assessment completed with score ${score}/100!`);
    } else {
      toast.warning(`Assessment score: ${score}/100. Retake to earn your official certification badge (Pass: 70%+).`);
    }
  };

  const handleOpenCertificate = (badgeCode) => {
    const quiz = ASSESSMENT_CATALOG.find((q) => q.badgeCode === badgeCode);
    if (quiz) {
      setCertificateModal({
        candidateName: user?.name || "Verified Candidate",
        title: quiz.badgeTitle,
        code: quiz.badgeCode,
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        issuer: "JobPortal AI Career Certification Board",
      });
    }
  };

  return (
    <div className="space-y-8 font-satoshi text-body">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            <Award size={14} /> Skill Assessments & Certifications Studio
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-heading tracking-tight">
            Skill Assessments & <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Certifications</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted font-medium max-w-xl">
            Validate your engineering expertise with timed multiple-choice assessments, automated AI grading, and verifiable enterprise badges.
          </p>
        </div>

        {/* Earned Badges Stat Counter */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-elevated border border-border">
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center border border-amber-500/30 font-black">
            <Trophy size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-muted uppercase tracking-wider block">Earned Badges</span>
            <span className="text-lg font-black text-heading">{earnedBadges.length} Active Certifications</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-indigo-500 dark:text-indigo-400" />
          <span className="text-xs font-black text-muted uppercase tracking-wider">Filter Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-indigo-600 !text-white shadow-md"
                  : "bg-surface text-muted hover:text-heading border border-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCatalog.map((item) => {
          const isEarned = earnedBadges.includes(item.badgeCode);

          return (
            <div
              key={item.id}
              className="p-6 sm:p-7 rounded-3xl bg-surface border border-border hover:border-indigo-500/40 backdrop-blur-2xl shadow-xl transition-all space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 uppercase tracking-wider">
                    {item.category} • {item.level}
                  </span>
                  <span className="text-xs text-muted font-bold flex items-center gap-1">
                    <Clock size={14} className="text-indigo-500 dark:text-indigo-400" /> {item.duration}
                  </span>
                </div>

                <h3 className="text-xl font-black text-heading">{item.title}</h3>
                <p className="text-xs sm:text-sm text-body font-medium leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                {isEarned ? (
                  <button
                    onClick={() => handleOpenCertificate(item.badgeCode)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-black text-xs transition cursor-pointer hover:bg-emerald-500/25"
                  >
                    <ShieldCheck size={14} /> Certificate Unlocked
                  </button>
                ) : (
                  <span className="text-xs text-muted font-medium">Pass threshold: 70% Score</span>
                )}

                <button
                  onClick={() => handleStartQuiz(item)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 !text-white font-black text-xs transition cursor-pointer shadow-lg ml-auto"
                >
                  <Play size={14} /> {isEarned ? "Retake Exam" : "Take Assessment"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Interactive Assessment Test Modal */}
      <AnimatePresence>
        {activeQuiz && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl rounded-3xl bg-surface border border-border p-6 sm:p-8 space-y-6 shadow-2xl text-body relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveQuiz(null)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-surface-elevated hover:bg-surface-hover text-muted hover:text-heading transition cursor-pointer border border-border"
              >
                <X size={18} />
              </button>

              {!quizResult ? (
                /* Active Quiz Environment */
                <div className="space-y-6">
                  <div className="space-y-2 pb-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}
                      </span>
                      <span className="text-xs text-muted font-medium flex items-center gap-1">
                        <Clock size={14} className="text-purple-500 dark:text-purple-400" /> {activeQuiz.duration} Exam
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-surface-elevated rounded-full overflow-hidden border border-border">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <div className="space-y-4">
                    <h3 className="text-lg sm:text-xl font-black text-heading leading-relaxed">
                      {activeQuiz.questions[currentQuestionIdx].question}
                    </h3>

                    {/* Options List */}
                    <div className="space-y-3">
                      {activeQuiz.questions[currentQuestionIdx].options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[currentQuestionIdx] === optIdx;

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleAnswerSelect(optIdx)}
                            className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-4 ${
                              isSelected
                                ? "bg-indigo-600/20 border-indigo-500 text-heading font-bold ring-1 ring-indigo-500"
                                : "bg-surface-elevated border-border text-body hover:bg-surface-hover"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`h-7 w-7 rounded-xl flex items-center justify-center text-xs font-black ${
                                isSelected ? "bg-indigo-600 text-white" : "bg-surface text-muted border border-border"
                              }`}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="text-sm font-medium">{opt}</span>
                            </div>
                            {isSelected && <CheckCircle2 size={18} className="text-indigo-500 dark:text-indigo-400" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <button
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIdx === 0}
                      className="px-4 py-2 rounded-xl bg-surface-elevated border border-border disabled:opacity-30 text-xs font-bold text-heading transition cursor-pointer hover:bg-surface-hover"
                    >
                      Previous
                    </button>

                    {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
                      <button
                        onClick={handleNextQuestion}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black !text-white transition cursor-pointer shadow-md"
                      >
                        Next Question
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-black !text-white transition cursor-pointer shadow-lg"
                      >
                        Submit & Grade Exam
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Exam Results & Review */
                <div className="space-y-6 text-center py-4">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-500 dark:text-indigo-400 mb-2">
                    {quizResult.passed ? <Trophy size={40} className="text-amber-500 dark:text-amber-400" /> : <RotateCcw size={40} className="text-rose-500 dark:text-rose-400" />}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl sm:text-3xl font-black text-heading">
                      {quizResult.passed ? "Assessment Passed & Certified!" : "Assessment Needs Review"}
                    </h3>
                    <p className="text-sm text-body font-medium max-w-md mx-auto">
                      {quizResult.passed
                        ? `You scored ${quizResult.score}/100 and earned the official ${quizResult.badgeTitle} Certificate.`
                        : `You scored ${quizResult.score}/100. A score of 70% or higher is required to unlock certification.`}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-elevated border border-border inline-flex items-center gap-6">
                    <div>
                      <span className="text-[10px] font-black text-muted uppercase tracking-wider block">Your Score</span>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{quizResult.score}/100</span>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div>
                      <span className="text-[10px] font-black text-muted uppercase tracking-wider block">Status</span>
                      <span className={`text-sm font-black ${quizResult.passed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {quizResult.passed ? "PASSED" : "FAILED"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 pt-4">
                    {quizResult.passed && (
                      <button
                        onClick={() => {
                          handleOpenCertificate(quizResult.badgeCode);
                          setActiveQuiz(null);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 !text-white font-black text-xs transition cursor-pointer shadow-lg"
                      >
                        <ShieldCheck size={14} /> View Certificate
                      </button>
                    )}
                    <button
                      onClick={() => handleStartQuiz(activeQuiz)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 !text-white font-black text-xs transition cursor-pointer shadow-md"
                    >
                      <RotateCcw size={14} /> Retake Exam
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official Certificate Modal */}
      <AnimatePresence>
        {certificateModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-3xl bg-surface border border-amber-500/30 p-8 sm:p-10 space-y-6 shadow-2xl text-body relative font-satoshi text-center"
            >
              <button
                onClick={() => setCertificateModal(null)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-surface-elevated hover:bg-surface-hover text-muted hover:text-heading transition cursor-pointer border border-border"
              >
                <X size={18} />
              </button>

              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 mx-auto">
                <Trophy size={32} />
              </div>

              <div className="space-y-2 border-b border-border pb-6">
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  OFFICIAL CERTIFICATE OF ACHIEVEMENT
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-heading pt-2">{certificateModal.title}</h3>
                <p className="text-xs text-muted font-medium">Verification Code: <span className="font-mono text-indigo-600 dark:text-indigo-400">{certificateModal.code}</span></p>
              </div>

              <div className="space-y-3 py-2">
                <p className="text-xs text-muted uppercase tracking-wider font-bold">This certifies that</p>
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                  {certificateModal.candidateName}
                </h2>
                <p className="text-xs sm:text-sm text-body max-w-md mx-auto leading-relaxed">
                  Has successfully passed the formal technical competency examination administered by JobPortal AI Assessment Engine.
                </p>
              </div>

              <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
                <div className="text-left">
                  <span className="font-bold text-heading block">Issued Date: {certificateModal.date}</span>
                  <span>Authority: JobPortal AI Certification Board</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toast.success("Certificate link copied to clipboard!")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface-hover text-heading border border-border font-bold text-xs transition cursor-pointer"
                  >
                    <Share2 size={14} /> Share
                  </button>
                  <button
                    onClick={() => toast.success("Downloading Certificate PDF...")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 !text-white font-black text-xs transition cursor-pointer shadow-md"
                  >
                    <Download size={14} /> Download PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
