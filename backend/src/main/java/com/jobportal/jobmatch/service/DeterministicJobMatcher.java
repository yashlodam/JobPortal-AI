package com.jobportal.jobmatch.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.jobportal.entity.Education;
import com.jobportal.entity.Experience;
import com.jobportal.entity.Job;
import com.jobportal.entity.Profile;
import com.jobportal.resumebuilder.entity.ResumeDocument;
import com.jobportal.resumebuilder.entity.ResumeEducation;
import com.jobportal.resumebuilder.entity.ResumeExperience;
import com.jobportal.resumebuilder.entity.ResumeProject;

/**
 * High-performance deterministic scoring engine for objective candidate qualification matching.
 *
 * <h3>Key Design Decisions</h3>
 * <ul>
 *   <li>Every skill alias group maps to a single canonical form. Skills that are
 *       meaningfully distinct (e.g. Django vs Python) are kept as separate
 *       canonicals — merging them would create false matches.</li>
 *   <li>Skill matching uses token-boundary containment instead of raw substring
 *       search to prevent "java" matching "javascript", "git" matching "digital", etc.</li>
 *   <li>Location matching uses word-boundary token checks so "pune" never matches "impune".</li>
 * </ul>
 */
@Component
public class DeterministicJobMatcher {

    // ─── Alias Map ────────────────────────────────────────────────────────────
    // Maps every known alias → canonical name (lowercase).
    // Rules:
    //   1. Do NOT merge meaningfully distinct skills (Django ≠ Python).
    //   2. Merge only true synonyms / version variants / abbreviations.
    private static final Map<String, String> SKILL_ALIASES = new HashMap<>();

    static {
        // ── Databases & Storage ───────────────────────────────────────────────
        registerAlias("postgresql", "postgres", "pgsql", "postgre", "postgres db", "postgresql db");
        registerAlias("mysql", "my-sql", "mysql database");
        registerAlias("mariadb", "maria db");
        registerAlias("mongodb", "mongo", "mongodb database", "documentdb");
        registerAlias("redis", "redis cache", "redis db");
        registerAlias("oracle", "oracle db", "oracle sql");
        registerAlias("sql server", "mssql", "microsoft sql server", "ms sql");
        registerAlias("elasticsearch", "elastic search", "es");
        registerAlias("cassandra", "apache cassandra");
        registerAlias("dynamodb", "dynamo db", "amazon dynamodb");
        registerAlias("firebase", "firestore", "firebase database");
        registerAlias("neo4j", "graph database", "graph db");
        registerAlias("couchdb", "couchbase");
        registerAlias("sqlite");

        // ── Core Languages ────────────────────────────────────────────────────
        registerAlias("java", "java 21", "java 17", "java 11", "java 8", "core java",
                "j2ee", "jakarta ee", "java se", "java ee", "java full stack", "java developer", "java backend");
        registerAlias("python", "python3", "python 3", "python2");
        registerAlias("javascript", "js", "ecmascript", "es6", "es2020", "es2022", "vanilla js");
        registerAlias("typescript", "ts");
        registerAlias("golang", "go", "go language", "go lang");
        registerAlias("c#", "csharp", "c sharp");
        registerAlias("c++", "cpp", "c plus plus");
        registerAlias("ruby", "ruby on rails", "rails");
        registerAlias("php", "laravel", "symfony", "codeigniter");
        registerAlias("swift", "swift ui", "swiftui");
        registerAlias("kotlin", "kotlin android");
        registerAlias("r", "r programming", "r language");
        registerAlias("scala", "akka");
        registerAlias("rust", "rust lang");
        registerAlias("perl");
        registerAlias("matlab", "octave");
        registerAlias("powershell", "ps1");
        registerAlias("bash", "shell scripting", "shell script", "sh", "zsh");
        registerAlias("lua");
        registerAlias("elixir", "phoenix framework");
        registerAlias("haskell", "functional programming");

        // ── Backend Frameworks (kept separate from languages) ─────────────────
        registerAlias("spring boot", "springboot", "spring-boot", "spring framework", "spring boot 3", "spring");
        registerAlias("spring data jpa", "spring data", "jpa", "spring-data-jpa", "spring data/hibernate", "spring data hibernate");
        registerAlias("hibernate", "hibernate orm", "jpa/hibernate");
        registerAlias("spring security", "spring-security");
        registerAlias("spring mvc", "spring-mvc");
        registerAlias("spring ai", "spring-ai", "rag", "vector embeddings", "vector databases");
        registerAlias(".net", ".net core", "asp.net", "asp.net core", "dotnet");
        registerAlias("django", "django rest framework", "drf");
        registerAlias("flask");
        registerAlias("fastapi");
        registerAlias("node.js", "nodejs", "node", "node js");
        registerAlias("express.js", "express", "expressjs");
        registerAlias("nest.js", "nestjs", "nest");
        registerAlias("fastify");
        registerAlias("graphql", "graph ql");
        registerAlias("rest api", "restful api", "restful apis", "rest apis", "restful",
                "rest", "web services", "http apis", "apis", "jwt authentication");
        registerAlias("microservices", "microservice", "microservice architecture",
                "distributed systems", "distributed architecture");
        registerAlias("grpc", "protocol buffers", "protobuf");
        registerAlias("gin", "gin framework", "golang gin");
        registerAlias("echo", "fiber", "golang web framework");

        // ── Frontend Frameworks ───────────────────────────────────────────────
        registerAlias("react", "react.js", "reactjs", "react js");
        registerAlias("react native");
        registerAlias("angular", "angularjs", "angular.js", "angular 2+", "angular 17", "angular 16");
        registerAlias("vue", "vue.js", "vuejs", "vue 3");
        registerAlias("nuxt.js", "nuxtjs", "nuxt");
        registerAlias("next.js", "nextjs", "next js", "next");
        registerAlias("svelte", "sveltekit");
        registerAlias("html", "html5", "html 5");
        registerAlias("css", "css3", "css 3");
        registerAlias("tailwind", "tailwindcss", "tailwind css");
        registerAlias("bootstrap");
        registerAlias("sass", "scss");
        registerAlias("redux", "redux toolkit", "zustand", "mobx");
        registerAlias("webpack", "vite", "rollup", "parcel");

        // ── Cloud & Infrastructure ────────────────────────────────────────────
        registerAlias("aws", "amazon web services", "amazon aws", "aws cloud");
        registerAlias("ec2", "amazon ec2");
        registerAlias("s3", "amazon s3");
        registerAlias("lambda", "aws lambda", "serverless");
        registerAlias("gcp", "google cloud", "google cloud platform");
        registerAlias("azure", "microsoft azure", "azure cloud");
        registerAlias("docker", "containerization", "containers", "docker container", "docker containers");
        registerAlias("kubernetes", "k8s", "k8", "helm");
        registerAlias("terraform", "infrastructure as code", "iac");
        registerAlias("ansible");
        registerAlias("ci/cd", "cicd", "continuous integration", "continuous deployment",
                "continuous delivery", "github actions", "gitlab ci", "jenkins", "circle ci", "argo cd", "argocd");
        registerAlias("git", "version control", "github", "gitlab", "bitbucket", "vcs");
        registerAlias("linux", "unix", "ubuntu", "centos", "rhel", "red hat linux");
        registerAlias("nginx", "apache", "web server");
        registerAlias("vault", "hashicorp vault", "secrets management");

        // ── Build Tools & Dependency Management ───────────────────────────────
        registerAlias("maven", "apache maven", "mvn");
        registerAlias("gradle");
        registerAlias("npm", "yarn", "pnpm");

        // ── Messaging / Streaming ─────────────────────────────────────────────
        registerAlias("kafka", "apache kafka", "event streaming", "message streaming");
        registerAlias("rabbitmq", "rabbit mq", "message queue", "amqp");
        registerAlias("activemq", "apache activemq");
        registerAlias("message broker");
        registerAlias("pubsub", "google pubsub", "pub/sub");

        // ── Data / AI / ML ────────────────────────────────────────────────────
        registerAlias("machine learning", "ml", "supervised learning", "unsupervised learning");
        registerAlias("deep learning", "dl", "neural networks", "neural network");
        registerAlias("tensorflow", "tensor flow", "tf");
        registerAlias("pytorch", "torch");
        registerAlias("scikit-learn", "sklearn", "scikit learn");
        registerAlias("keras");
        registerAlias("pandas", "numpy", "scipy");
        registerAlias("sql", "structured query language", "tsql", "plsql", "pl/sql", "rdbms", "sql queries");
        registerAlias("spark", "apache spark", "pyspark");
        registerAlias("hadoop", "hdfs", "mapreduce");
        registerAlias("data science");
        registerAlias("data engineering");
        registerAlias("etl", "data pipeline", "data pipelines", "elt");
        registerAlias("tableau", "power bi", "data visualization", "looker", "metabase", "superset");
        registerAlias("data warehousing", "data warehouse", "snowflake", "redshift", "bigquery", "amazon redshift");
        registerAlias("dbt", "data build tool");
        registerAlias("airflow", "apache airflow", "workflow orchestration");
        registerAlias("mlops", "ml ops", "model deployment", "model serving", "kubeflow");
        registerAlias("llm", "large language models", "chatgpt", "openai api", "langchain", "llama",
                "generative ai", "gen ai", "genai", "gpt", "gpt-4", "llm fine-tuning", "rag pipeline",
                "prompt engineering", "stable diffusion", "hugging face", "transformers");
        registerAlias("natural language processing", "nlp", "text classification", "sentiment analysis",
                "named entity recognition", "ner", "text mining");
        registerAlias("computer vision", "cv", "image recognition", "object detection", "yolo", "opencv");
        registerAlias("feature engineering", "feature selection");
        registerAlias("time series analysis", "forecasting", "arima");
        registerAlias("reinforcement learning", "rl");
        registerAlias("a/b testing", "experimentation", "ab testing");
        registerAlias("statistics", "statistical analysis", "statistical modeling", "hypothesis testing");

        // ── Mobile ────────────────────────────────────────────────────────────
        registerAlias("android", "android development", "android sdk", "android studio");
        registerAlias("ios", "ios development", "xcode", "uikit");
        registerAlias("flutter", "dart");
        registerAlias("xamarin");
        registerAlias("expo", "react native cli");

        // ── Testing & QA ─────────────────────────────────────────────────────
        registerAlias("junit", "junit5", "testng", "unit testing");
        registerAlias("selenium", "playwright", "cypress", "e2e testing", "end-to-end testing");
        registerAlias("jest", "mocha", "jasmine", "vitest");
        registerAlias("mockito");
        registerAlias("api testing", "postman", "rest api testing", "api tests", "api test");
        registerAlias("performance testing", "load testing", "jmeter", "k6", "gatling", "stress testing");
        registerAlias("test automation", "automated testing", "test automation framework");
        registerAlias("bdd", "behavior driven development", "cucumber", "gherkin");
        registerAlias("qa", "quality assurance", "qa engineer", "qa analyst");
        registerAlias("manual testing", "test cases", "test plans", "bug reporting");
        registerAlias("appium", "mobile testing", "mobile test automation");
        registerAlias("sqa", "software quality assurance");
        registerAlias("code review", "peer review");

        // ── Core Concepts & Programming ───────────────────────────────────────
        registerAlias("oop", "oops", "object oriented programming", "object-oriented programming", "object oriented");
        registerAlias("collections", "collections framework", "java collections", "collection framework", "java collections framework");
        registerAlias("design patterns", "solid principles", "solid", "gof patterns");
        registerAlias("software development best practices", "best practices", "clean code", "code reviews", "sdlc");
        registerAlias("agile", "scrum", "kanban", "sprint", "retrospective");
        registerAlias("jira", "confluence", "atlassian", "trello");
        registerAlias("data structures", "algorithms", "dsa", "data structures and algorithms");
        registerAlias("system design", "low level design", "high level design", "lld", "hld", "system architecture");

        // ══════════════════════════════════════════════════════════════════════
        // ── CYBERSECURITY ─────────────────────────────────────────────────────
        // ══════════════════════════════════════════════════════════════════════
        registerAlias("cybersecurity", "cyber security", "information security", "infosec", "it security");
        registerAlias("penetration testing", "pen testing", "pentest", "penetration test", "ethical hacking",
                "ethical hacker", "red team", "red teaming");
        registerAlias("vulnerability assessment", "vulnerability scanning", "vapt", "vulnerability analysis");
        registerAlias("network security", "network security engineer", "perimeter security");
        registerAlias("soc", "security operations center", "soc analyst", "tier 1 analyst", "tier 2 analyst");
        registerAlias("siem", "splunk", "ibm qradar", "arcsight", "microsoft sentinel");
        registerAlias("incident response", "ir", "incident handling", "digital forensics and incident response", "dfir");
        registerAlias("malware analysis", "malware reverse engineering", "threat analysis");
        registerAlias("threat intelligence", "threat hunting", "cyber threat intelligence", "cti");
        registerAlias("endpoint security", "edr", "endpoint detection response", "crowdstrike", "carbon black", "sentinelone");
        registerAlias("firewalls", "firewall management", "iptables", "palo alto", "fortinet", "checkpoint");
        registerAlias("ids/ips", "intrusion detection", "intrusion prevention", "snort", "suricata");
        registerAlias("owasp", "owasp top 10", "web application security");
        registerAlias("secure coding", "secure sdlc", "application security", "appsec", "sast", "dast");
        registerAlias("encryption", "cryptography", "pki", "tls", "ssl", "aes", "rsa");
        registerAlias("identity and access management", "iam", "single sign-on", "sso", "okta", "active directory", "ldap");
        registerAlias("zero trust", "zero trust security", "zero trust architecture");
        registerAlias("cloud security", "aws security", "azure security hub", "gcp security command center");
        registerAlias("devsecops", "security automation", "security in cicd");
        registerAlias("compliance", "iso 27001", "pci dss", "hipaa compliance", "gdpr", "nist", "soc 2", "sox");
        registerAlias("forensics", "digital forensics", "computer forensics", "memory forensics", "disk forensics");
        registerAlias("reverse engineering", "re", "binary analysis", "ida pro", "ghidra", "radare2");
        registerAlias("ctf", "capture the flag", "bug bounty");
        registerAlias("security audit", "security assessment", "risk assessment", "security risk assessment");
        registerAlias("ceh", "cissp", "cism", "oscp", "security certifications", "comptia security+");
        registerAlias("vpn", "virtual private network", "wireguard", "openvpn");
        registerAlias("dlp", "data loss prevention");
        registerAlias("privileged access management", "pam", "cyberark");

        // ══════════════════════════════════════════════════════════════════════
        // ── NETWORKING ────────────────────────────────────────────────────────
        // ══════════════════════════════════════════════════════════════════════
        registerAlias("networking", "network engineering", "network administration");
        registerAlias("tcp/ip", "tcp ip", "ip networking", "ip protocols");
        registerAlias("bgp", "ospf", "eigrp", "routing protocols", "isis");
        registerAlias("switching", "vlans", "spanning tree", "stp", "layer 2 switching");
        registerAlias("cisco", "cisco ios", "cisco networking", "ccna", "ccnp", "ccie");
        registerAlias("juniper", "junos", "juniper networks");
        registerAlias("load balancing", "f5", "haproxy", "layer 7 routing");
        registerAlias("sd-wan", "software defined networking", "sdn");
        registerAlias("network monitoring", "nagios", "zabbix", "prtg", "wireshark");
        registerAlias("dns", "dhcp", "ntp", "network services");
        registerAlias("ipv6", "ipv4", "subnetting", "cidr");
        registerAlias("wireless networking", "wifi", "802.11", "wlan");
        registerAlias("voip", "sip", "asterisk", "voice over ip");
        registerAlias("mpls", "wan technologies");
        registerAlias("network troubleshooting", "network diagnostics", "packet analysis");

        // ══════════════════════════════════════════════════════════════════════
        // ── CLOUD / DEVOPS / SRE ──────────────────────────────────────────────
        // ══════════════════════════════════════════════════════════════════════
        registerAlias("site reliability engineering", "sre", "reliability engineering");
        registerAlias("observability", "monitoring", "prometheus", "grafana", "opentelemetry", "jaeger", "zipkin");
        registerAlias("log management", "logging", "elk stack", "logstash", "kibana", "loki");
        registerAlias("cloud native", "cloud-native applications", "12 factor app");
        registerAlias("service mesh", "istio", "linkerd", "envoy");
        registerAlias("chaos engineering", "chaos monkey", "resilience testing");
        registerAlias("platform engineering", "internal developer platform", "idp");

        // ══════════════════════════════════════════════════════════════════════
        // ── FINANCE / FINTECH ─────────────────────────────────────────────────
        // ══════════════════════════════════════════════════════════════════════
        registerAlias("financial analysis", "financial modeling", "financial reporting");
        registerAlias("accounting", "bookkeeping", "accounts payable", "accounts receivable", "ap/ar");
        registerAlias("tally", "tally erp", "tally prime");
        registerAlias("sap fi", "sap finance", "sap fico");
        registerAlias("quickbooks", "xero", "sage", "freshbooks");
        registerAlias("trading", "stock trading", "algorithmic trading", "algo trading", "quant trading");
        registerAlias("risk management", "risk analysis", "credit risk", "market risk", "operational risk");
        registerAlias("basel", "basel iii", "regulatory capital", "var", "value at risk");
        registerAlias("payment gateway", "payment processing", "stripe", "razorpay", "paypal", "braintree");
        registerAlias("banking", "retail banking", "investment banking", "core banking");
        registerAlias("fintech", "financial technology", "digital payments", "neobanking", "open banking");
        registerAlias("blockchain", "smart contracts", "solidity", "ethereum", "web3", "defi", "nft", "hyperledger");
        registerAlias("cryptocurrency", "crypto", "bitcoin", "defi protocols");
        registerAlias("swift messaging", "swift network", "iso 20022");
        registerAlias("fx", "forex", "foreign exchange", "currency trading");
        registerAlias("ifrs", "gaap", "financial standards");
        registerAlias("audit", "internal audit", "external audit", "statutory audit");
        registerAlias("taxation", "tax compliance", "gst", "tds", "income tax", "vat");
        registerAlias("excel", "microsoft excel", "advanced excel", "vlookup", "pivot tables", "macros");
        registerAlias("equity research", "fundamental analysis", "technical analysis");

        // ══════════════════════════════════════════════════════════════════════
        // ── HEALTHCARE IT / MEDICAL ───────────────────────────────────────────
        // ══════════════════════════════════════════════════════════════════════
        registerAlias("ehr", "electronic health records", "emr", "electronic medical records", "epic", "cerner");
        registerAlias("hl7", "fhir", "healthcare interoperability", "hl7 fhir");
        registerAlias("healthcare it", "health informatics", "clinical informatics");
        registerAlias("medical imaging", "dicom", "pacs");
        registerAlias("telemedicine", "telehealth");
        registerAlias("hipaa", "hipaa compliance", "phi", "protected health information");
        registerAlias("clinical data management", "cdm", "clinical trials");
        registerAlias("bioinformatics", "genomics", "proteomics");
        registerAlias("medical device software", "fda regulations", "ce marking");
        registerAlias("population health management", "care management");
        registerAlias("pharmacy systems", "pharmacy management");

        // ══════════════════════════════════════════════════════════════════════
        // ── ERP / SAP / ENTERPRISE ────────────────────────────────────────────
        // ══════════════════════════════════════════════════════════════════════
        registerAlias("sap", "sap s/4hana", "sap hana", "sap erp", "sap bw");
        registerAlias("sap sd", "sap sales distribution", "sap order management");
        registerAlias("sap mm", "sap materials management", "sap procurement");
        registerAlias("sap hr", "sap hcm", "sap successfactors", "sap payroll");
        registerAlias("sap pp", "sap production planning");
        registerAlias("sap basis", "sap administration", "sap technical");
        registerAlias("sap abap", "abap programming", "abap development");
        registerAlias("oracle erp", "oracle cloud", "oracle fusion", "oracle financials", "jd edwards", "peoplesoft");
        registerAlias("microsoft dynamics", "dynamics 365", "dynamics nav", "dynamics ax", "dynamics crm");
        registerAlias("salesforce", "salesforce crm", "sfdc", "salesforce developer", "apex", "visualforce", "lightning");
        registerAlias("servicenow", "service now", "itsm");
        registerAlias("workday", "workday hcm", "workday finance");
        registerAlias("erp implementation", "erp consulting", "erp integration");

        // ══════════════════════════════════════════════════════════════════════
        // ── PRODUCT / BUSINESS ANALYST / PROJECT MANAGEMENT ──────────────────
        // ══════════════════════════════════════════════════════════════════════
        registerAlias("product management", "product manager", "pm", "product strategy", "product roadmap");
        registerAlias("business analysis", "business analyst", "ba", "requirements gathering", "brd", "frd");
        registerAlias("project management", "project manager", "pmp", "project planning", "project coordination");
        registerAlias("stakeholder management", "stakeholder communication");
        registerAlias("user stories", "use cases", "acceptance criteria");
        registerAlias("wireframing", "prototyping", "mockups", "figma wireframes");
        registerAlias("product analytics", "mixpanel", "amplitude", "product metrics", "kpis");
        registerAlias("go-to-market", "gtm strategy", "launch strategy");
        registerAlias("market research", "competitive analysis", "market analysis");
        registerAlias("okr", "okrs", "objectives and key results");
        registerAlias("change management", "organizational change");
        registerAlias("business intelligence", "bi", "business analytics");
        registerAlias("process improvement", "lean", "six sigma", "process optimization", "bpm");
        registerAlias("microsoft office", "ms office", "office 365", "word", "powerpoint");
        registerAlias("presentation skills", "slides", "slide deck");

        // ══════════════════════════════════════════════════════════════════════
        // ── UI/UX & DESIGN ────────────────────────────────────────────────────
        // ══════════════════════════════════════════════════════════════════════
        registerAlias("ui design", "user interface design", "visual design", "graphic design");
        registerAlias("ux design", "user experience design", "ux research", "user research");
        registerAlias("figma", "sketch", "adobe xd", "invision");
        registerAlias("adobe photoshop", "photoshop", "ps");
        registerAlias("adobe illustrator", "illustrator", "ai");
        registerAlias("adobe after effects", "after effects", "motion graphics");
        registerAlias("adobe premiere pro", "premiere pro", "video editing");
        registerAlias("design systems", "component library", "storybook");
        registerAlias("usability testing", "user testing", "heatmaps");
        registerAlias("accessibility", "wcag", "ada compliance", "a11y");
        registerAlias("information architecture", "ia", "content strategy");
        registerAlias("typography", "color theory", "visual hierarchy");
        registerAlias("brand identity", "branding", "brand guidelines");
        registerAlias("3d modeling", "blender", "cinema 4d", "autodesk maya", "3ds max");
        registerAlias("cad", "autocad", "solidworks", "catia", "creo");
        registerAlias("game design", "level design", "game mechanics");

        // ══════════════════════════════════════════════════════════════════════
        // ── GAME DEVELOPMENT ──────────────────────────────────────────────────
        // ══════════════════════════════════════════════════════════════════════
        registerAlias("unity", "unity3d", "unity engine", "unity game development");
        registerAlias("unreal engine", "ue4", "ue5", "unreal");
        registerAlias("game development", "game dev", "indie game development");
        registerAlias("opengl", "vulkan", "directx", "graphics programming");
        registerAlias("shader programming", "glsl", "hlsl");
        registerAlias("godot", "godot engine");
        registerAlias("multiplayer networking", "photon", "mirror networking");
        registerAlias("physics engine", "physx", "box2d");
        registerAlias("procedural generation", "procedural content");

        // ══════════════════════════════════════════════════════════════════════
        // ── EMBEDDED / IoT / HARDWARE ─────────────────────────────────────────
        // ══════════════════════════════════════════════════════════════════════
        registerAlias("embedded systems", "embedded software", "firmware development", "firmware engineering");
        registerAlias("rtos", "real-time operating system", "freertos", "vxworks", "zephyr");
        registerAlias("microcontrollers", "mcu", "stm32", "pic", "avr", "arduino");
        registerAlias("raspberry pi", "single board computers");
        registerAlias("iot", "internet of things", "iot development", "smart devices", "connected devices");
        registerAlias("can bus", "can protocol", "lin bus", "automotive protocols");
        registerAlias("modbus", "mqtt", "coap", "iot protocols");
        registerAlias("fpga", "vhdl", "verilog", "hardware description language");
        registerAlias("arm cortex", "arm architecture", "cortex-m");
        registerAlias("usb", "i2c", "spi", "uart", "communication protocols");
        registerAlias("signal processing", "dsp", "digital signal processing");
        registerAlias("pcb design", "altium designer", "kicad", "eagle cad");
        registerAlias("automotive", "iso 26262", "autosar", "adas", "autonomous vehicles");
        registerAlias("robotics", "ros", "robot operating system");
        registerAlias("scada", "plc", "hmi", "industrial automation", "ot security");

        // ══════════════════════════════════════════════════════════════════════
        // ── DIGITAL MARKETING / SEO / CONTENT ────────────────────────────────
        // ══════════════════════════════════════════════════════════════════════
        registerAlias("digital marketing", "online marketing", "performance marketing");
        registerAlias("seo", "search engine optimization", "on-page seo", "technical seo", "off-page seo");
        registerAlias("sem", "search engine marketing", "ppc", "pay per click", "google ads", "adwords");
        registerAlias("social media marketing", "smm", "facebook ads", "instagram marketing", "linkedin ads");
        registerAlias("content marketing", "content strategy", "content creation");
        registerAlias("email marketing", "mailchimp", "klaviyo", "hubspot email");
        registerAlias("analytics", "google analytics", "ga4", "adobe analytics");
        registerAlias("crm", "customer relationship management", "hubspot", "zoho crm");
        registerAlias("marketing automation", "pardot", "marketo", "eloqua");
        registerAlias("copywriting", "technical writing", "content writing");

        // ══════════════════════════════════════════════════════════════════════
        // ── HR / TALENT / OPERATIONS ──────────────────────────────────────────
        // ══════════════════════════════════════════════════════════════════════
        registerAlias("talent acquisition", "recruitment", "recruiting", "headhunting", "talent sourcing");
        registerAlias("hr management", "human resources", "hris", "hr operations");
        registerAlias("payroll", "payroll management", "payroll processing");
        registerAlias("performance management", "appraisal", "kra", "kpi management");
        registerAlias("learning and development", "l&d", "corporate training", "employee training");
        registerAlias("employee engagement", "employee relations", "culture building");
        registerAlias("onboarding", "employee onboarding");
        registerAlias("compensation and benefits", "c&b", "total rewards");
        registerAlias("succession planning", "workforce planning");
        registerAlias("statutory compliance", "labour law", "pf", "esi", "gratuity");

        // ══════════════════════════════════════════════════════════════════════
        // ── SUPPLY CHAIN / LOGISTICS / OPERATIONS ────────────────────────────
        // ══════════════════════════════════════════════════════════════════════
        registerAlias("supply chain management", "scm", "supply chain", "supply chain optimization");
        registerAlias("logistics", "logistics management", "warehouse management", "wms");
        registerAlias("inventory management", "stock management", "demand planning");
        registerAlias("procurement", "sourcing", "vendor management", "supplier management");
        registerAlias("erp supply chain", "sap scm", "oracle scm");
        registerAlias("last mile delivery", "fleet management");
        registerAlias("quality management", "qms", "iso 9001", "total quality management", "tqm");
        registerAlias("lean manufacturing", "toyota production system", "kaizen", "value stream mapping");

        // ══════════════════════════════════════════════════════════════════════
        // ── LEGAL TECH / COMPLIANCE ───────────────────────────────────────────
        // ══════════════════════════════════════════════════════════════════════
        registerAlias("legal research", "westlaw", "lexisnexis", "case research");
        registerAlias("contract management", "contract drafting", "contract review");
        registerAlias("intellectual property", "ip law", "patents", "trademarks", "copyrights");
        registerAlias("data privacy", "gdpr compliance", "ccpa", "data protection");
        registerAlias("regulatory compliance", "regulatory affairs", "legal compliance");
        registerAlias("e-discovery", "legal document review");
    }

    private static void registerAlias(String canonical, String... aliases) {
        String key = canonical.toLowerCase(Locale.ROOT);
        SKILL_ALIASES.put(key, canonical);
        for (String alias : aliases) {
            SKILL_ALIASES.put(alias.toLowerCase(Locale.ROOT), canonical);
        }
    }

    // ─── Normalization ────────────────────────────────────────────────────────

    /**
     * Normalizes a raw skill string to its canonical representation.
     * Handles special characters for languages like C#, C++, .NET.
     */
    public String normalizeSkill(String raw) {
        if (raw == null || raw.isBlank()) return "";
        String clean = raw.trim().toLowerCase(Locale.ROOT)
                // Preserve # (c#), + (c++), . (.net, node.js), / (ci/cd), - (hyphen)
                .replaceAll("[^a-zA-Z0-9#+./\\- ]", "")
                .replaceAll("\\s+", " ")
                .trim();
        return SKILL_ALIASES.getOrDefault(clean, clean);
    }

    /**
     * Splits a skill string into normalized tokens for partial matching.
     * E.g. "Spring Boot Developer" → ["spring boot", "developer"]
     */
    private Set<String> tokenizeSkill(String skill) {
        Set<String> tokens = new HashSet<>();
        if (skill == null || skill.isBlank()) return tokens;
        tokens.add(skill); // full normalized form
        // Also add individual words for compound skills (min 3 chars to avoid noise)
        String[] parts = skill.split("[ .]");
        for (String p : parts) {
            if (p.length() >= 3) tokens.add(p.trim());
        }
        return tokens;
    }

    /**
     * Checks if a required skill is satisfied by the candidate's skill set.
     *
     * <p>Matching strategy (in priority order):
     * <ol>
     *   <li>Exact normalized match (canonical → canonical)</li>
     *   <li>Word-boundary token containment — "node.js" matches if candidate has "node"
     *       as a whole word, NOT as a substring of "knowledge".</li>
     * </ol>
     *
     * <p><b>Anti-false-positive rules:</b>
     * <ul>
     *   <li>"java" does NOT match "javascript" (different canonicals)</li>
     *   <li>"git" does NOT match "digital" (token boundary check)</li>
     *   <li>"r" (R language) only matches exact "r" after normalization</li>
     * </ul>
     */
    public boolean isSkillMatched(String requiredSkill, Set<String> candidateSkills) {
        if (requiredSkill == null || requiredSkill.isBlank()
                || candidateSkills == null || candidateSkills.isEmpty()) {
            return false;
        }

        String normReq = normalizeSkill(requiredSkill);
        if (normReq.isBlank()) return false;

        // 1. Exact canonical match
        if (candidateSkills.contains(normReq)) return true;

        // 2. Token-boundary match: both sides must share a whole-word token
        Set<String> reqTokens = tokenizeSkill(normReq);
        for (String cand : candidateSkills) {
            // Exact match case-insensitive
            if (cand.equalsIgnoreCase(normReq)) return true;

            // Token intersection — only for multi-word skills (length >= 4) to avoid
            // single-character / very short false positives
            if (normReq.length() >= 4 && cand.length() >= 4) {
                Set<String> candTokens = tokenizeSkill(cand);
                // Full-form containment using word boundaries
                if (isWordBoundaryContained(normReq, cand)
                        || isWordBoundaryContained(cand, normReq)) {
                    return true;
                }
                // Token set intersection for compound skill names
                Set<String> intersection = new HashSet<>(reqTokens);
                intersection.retainAll(candTokens);
                // Only count as match if the shared token is >= 4 chars (avoids "api", "js" noise)
                for (String shared : intersection) {
                    if (shared.length() >= 4) return true;
                }
            }
        }

        return false;
    }

    /**
     * Checks if {@code needle} appears as a complete word (or phrase) inside {@code haystack}.
     * Prevents "java" matching "javascript" by requiring word boundaries.
     */
    public boolean isWordBoundaryContained(String needle, String haystack) {
        if (needle == null || haystack == null || needle.isBlank() || haystack.isBlank()) return false;
        String n = needle.toLowerCase(Locale.ROOT);
        String h = haystack.toLowerCase(Locale.ROOT);
        int fromIdx = 0;
        int needleLen = n.length();
        while ((fromIdx = h.indexOf(n, fromIdx)) != -1) {
            boolean startOk = (fromIdx == 0) || !isWordChar(h.charAt(fromIdx - 1));
            int endIdx = fromIdx + needleLen;
            boolean endOk = (endIdx >= h.length()) || !isWordChar(h.charAt(endIdx));
            if (startOk && endOk) {
                return true;
            }
            fromIdx += 1;
        }
        return false;
    }

    private boolean isWordChar(char c) {
        return Character.isLetterOrDigit(c) || c == '+' || c == '#';
    }

    // ─── Candidate Skill Extraction ───────────────────────────────────────────

    /**
     * Scans raw resume text (from PDF or DOCX) for all canonical skills and job-specific skills.
     */
    public Set<String> extractSkillsFromResumeText(String resumeText, Job job) {
        Set<String> detected = new HashSet<>();
        if (resumeText == null || resumeText.isBlank()) return detected;

        String lowerText = resumeText.toLowerCase(Locale.ROOT);

        // 1. Scan against SKILL_ALIASES catalog
        for (Map.Entry<String, String> entry : SKILL_ALIASES.entrySet()) {
            String alias = entry.getKey();
            String canonical = entry.getValue();

            if (alias.length() <= 2) {
                if (isWordBoundaryContained(alias, lowerText)) {
                    detected.add(canonical);
                }
            } else {
                if (lowerText.contains(alias) && isWordBoundaryContained(alias, lowerText)) {
                    detected.add(canonical);
                }
            }
        }

        // 2. Scan explicitly for the Job's required & preferred skills
        if (job != null) {
            List<String> allJobSkills = new ArrayList<>();
            if (job.getSkillsRequired() != null) allJobSkills.addAll(job.getSkillsRequired());
            if (job.getPreferredSkills() != null) allJobSkills.addAll(job.getPreferredSkills());

            for (String rawJobSkill : allJobSkills) {
                if (rawJobSkill == null || rawJobSkill.isBlank()) continue;
                String lowerSkill = rawJobSkill.trim().toLowerCase(Locale.ROOT);
                String norm = normalizeSkill(rawJobSkill);

                if (isWordBoundaryContained(lowerSkill, lowerText) || isWordBoundaryContained(norm, lowerText)) {
                    detected.add(norm);
                    detected.add(lowerSkill);
                }
            }
        }

        return detected;
    }

    /**
     * Extracts all unique normalized skills from candidate profile, builder resume, and uploaded resume analysis.
     */
    public Set<String> extractCandidateSkills(Profile profile, ResumeDocument resumeDoc) {
        return extractCandidateSkills(profile, resumeDoc, List.of(), null, null);
    }

    /**
     * Extracts all unique normalized skills from candidate profile, builder resume, and uploaded resume analysis.
     * Merges profile skills + uploaded resume skills + resume doc skills + project technologies.
     */
    public Set<String> extractCandidateSkills(Profile profile, ResumeDocument resumeDoc, List<String> uploadedResumeSkills) {
        return extractCandidateSkills(profile, resumeDoc, uploadedResumeSkills, null, null);
    }

    /**
     * Extracts all unique normalized skills incorporating profile, builder resume, uploaded resume analysis,
     * AND direct parsing of the raw resume text (PDF/DOCX) against the target job requirements.
     */
    public Set<String> extractCandidateSkills(
            Profile profile,
            ResumeDocument resumeDoc,
            List<String> uploadedResumeSkills,
            String resumeRawText,
            Job job) {
        Set<String> candidateSkills = new HashSet<>();

        if (profile != null && profile.getSkills() != null) {
            for (String s : profile.getSkills()) {
                String n = normalizeSkill(s);
                if (!n.isBlank()) candidateSkills.add(n);
            }
        }

        if (uploadedResumeSkills != null) {
            for (String s : uploadedResumeSkills) {
                String n = normalizeSkill(s);
                if (!n.isBlank()) candidateSkills.add(n);
            }
        }

        if (resumeDoc != null) {
            if (resumeDoc.getSkills() != null) {
                for (String s : resumeDoc.getSkills()) {
                    String n = normalizeSkill(s);
                    if (!n.isBlank()) candidateSkills.add(n);
                }
            }
            // Extract from project technologies (split on common delimiters)
            if (resumeDoc.getProjectList() != null) {
                for (ResumeProject p : resumeDoc.getProjectList()) {
                    if (p.getTechnologies() != null) {
                        String[] techTokens = p.getTechnologies().split("[,;|/\\n]");
                        for (String t : techTokens) {
                            String n = normalizeSkill(t.trim());
                            if (!n.isBlank()) candidateSkills.add(n);
                        }
                    }
                }
            }
        }

        if (resumeRawText != null && !resumeRawText.isBlank()) {
            Set<String> textSkills = extractSkillsFromResumeText(resumeRawText, job);
            candidateSkills.addAll(textSkills);
        }

        return candidateSkills;
    }

    // ─── Skill Evaluation ────────────────────────────────────────────────────

    /**
     * Evaluates required and preferred skills against candidate skill set.
     *
     * <p>Returns exact true percentages. No artificial inflation:
     * <ul>
     *   <li>If job has no required skills → requiredPercentage = 100 (unconstrained)</li>
     *   <li>If job has no preferred skills → preferredPercentage = 0 (no bonus)</li>
     * </ul>
     */
    public SkillMatchResult evaluateSkills(Job job, Set<String> candidateSkills) {
        List<String> matchedRequired  = new ArrayList<>();
        List<String> missingRequired  = new ArrayList<>();
        List<String> matchedPreferred = new ArrayList<>();
        List<String> missingPreferred = new ArrayList<>();

        // Required Skills
        List<String> requiredList = job.getSkillsRequired() != null
                ? job.getSkillsRequired() : List.of();
        for (String req : requiredList) {
            if (isSkillMatched(req, candidateSkills)) {
                matchedRequired.add(req);
            } else {
                missingRequired.add(req);
            }
        }

        int requiredPercentage = requiredList.isEmpty()
                ? 100
                : (int) Math.round(((double) matchedRequired.size() / requiredList.size()) * 100);

        // Preferred Skills
        List<String> preferredList = job.getPreferredSkills() != null
                ? job.getPreferredSkills() : List.of();
        for (String pref : preferredList) {
            if (isSkillMatched(pref, candidateSkills)) {
                matchedPreferred.add(pref);
            } else {
                missingPreferred.add(pref);
            }
        }

        // No preferred skills listed → 0% bonus (no inflation)
        int preferredPercentage = preferredList.isEmpty()
                ? 0
                : (int) Math.round(((double) matchedPreferred.size() / preferredList.size()) * 100);

        return new SkillMatchResult(
                requiredPercentage,
                preferredPercentage,
                matchedRequired,
                missingRequired,
                matchedPreferred,
                missingPreferred
        );
    }

    // ─── Experience Evaluation ────────────────────────────────────────────────

    /**
     * Calculates candidate's total years of experience from all sources:
     * profile experiences (with dates) → profile experience level enum → resume doc list.
     */
    public double calculateTotalExperienceYears(Profile profile, ResumeDocument resumeDoc) {
        // 1. Profile experience entries (most precise — use actual dates)
        if (profile != null && profile.getExperiences() != null
                && !profile.getExperiences().isEmpty()) {
            long totalMonths = 0;
            for (Experience exp : profile.getExperiences()) {
                LocalDate start = exp.getStartDate();
                LocalDate end   = (Boolean.TRUE.equals(exp.getWorking()) || exp.getEndDate() == null)
                                  ? LocalDate.now()
                                  : exp.getEndDate();
                if (start != null && end != null && !start.isAfter(end)) {
                    totalMonths += ChronoUnit.MONTHS.between(start, end);
                } else if (start != null) {
                    // Only start date known → assume still ongoing
                    totalMonths += ChronoUnit.MONTHS.between(start, LocalDate.now());
                }
                // No dates at all → skip (don't inflate with arbitrary baseline)
            }
            return Math.round((totalMonths / 12.0) * 10.0) / 10.0;
        }

        // 2. Profile experience level enum (fallback — midpoint of typical range)
        if (profile != null && profile.getExperienceLevel() != null) {
            return switch (profile.getExperienceLevel()) {
                case INTERNSHIP   -> 0.5;
                case ENTRY_LEVEL  -> 1.5;
                case MID_LEVEL    -> 4.0;
                case SENIOR_LEVEL -> 7.0;
                case LEAD, MANAGER -> 10.0;
                case EXECUTIVE    -> 14.0;
                default           -> 2.0;
            };
        }

        // 3. Resume document experience list (weakest signal — count only)
        if (resumeDoc != null && resumeDoc.getExperienceList() != null
                && !resumeDoc.getExperienceList().isEmpty()) {
            // Try to sum durations from resume entries first
            long resumeMonths = 0;
            boolean hasDates = false;
            for (ResumeExperience re : resumeDoc.getExperienceList()) {
                if (re.getStartDate() != null && !re.getStartDate().isBlank()) {
                    try {
                        hasDates = true;
                        LocalDate s = LocalDate.parse(re.getStartDate());
                        LocalDate e;
                        if (re.isCurrentlyWorking() || re.getEndDate() == null
                                || re.getEndDate().isBlank()
                                || "present".equalsIgnoreCase(re.getEndDate().trim())) {
                            e = LocalDate.now();
                        } else {
                            e = LocalDate.parse(re.getEndDate());
                        }
                        if (!s.isAfter(e)) resumeMonths += ChronoUnit.MONTHS.between(s, e);
                    } catch (Exception ignored) {
                        // Unparseable date format — skip this entry
                    }
                }
            }
            if (hasDates && resumeMonths > 0) {
                return Math.round((resumeMonths / 12.0) * 10.0) / 10.0;
            }
            // Fallback: count entries × 1 year average tenure (capped at 15)
            return Math.min(resumeDoc.getExperienceList().size() * 1.0, 15.0);
        }

        return 0.0; // Unknown — treat as fresher
    }

    /**
     * Evaluates candidate years of experience against job min/max range.
     *
     * <p>Scoring bands:
     * <ul>
     *   <li>Perfect in-range: 100</li>
     *   <li>Slightly overqualified (≤ 3 yrs over max): 80–95</li>
     *   <li>Heavily overqualified: 65 minimum</li>
     *   <li>Under by ≤ 30%: ~75</li>
     *   <li>Under by 30–60%: ~50</li>
     *   <li>Under by > 60%: ~25 or less</li>
     *   <li>No min experience specified: 90 (unconstrained)</li>
     * </ul>
     */
    public int evaluateExperience(Job job, Profile profile, ResumeDocument resumeDoc) {
        double candidateYears = calculateTotalExperienceYears(profile, resumeDoc);
        Integer minExp = job.getMinimumExperience();
        Integer maxExp = job.getMaximumExperience();

        // No numeric experience requirement → use experienceLevel enum comparison
        if (minExp == null || minExp == 0) {
            if (job.getExperienceLevel() != null && profile != null
                    && profile.getExperienceLevel() != null) {
                int jobLvl  = experienceLevelOrdinal(job.getExperienceLevel());
                int candLvl = experienceLevelOrdinal(profile.getExperienceLevel());
                int diff = Math.abs(jobLvl - candLvl);
                return switch (diff) {
                    case 0  -> 100; // exact match
                    case 1  -> 80;  // adjacent level
                    case 2  -> 60;
                    default -> 40;
                };
            }
            return 90; // No experience constraint at all
        }

        if (candidateYears >= minExp) {
            if (maxExp == null || candidateYears <= maxExp) {
                return 100; // Perfect fit within range
            }
            // Overqualified — gentle decay
            double overBy = candidateYears - maxExp;
            return (int) Math.max(65, Math.round(100 - (overBy * 5)));
        }

        // Under minimum
        if (candidateYears == 0.0) {
            return (minExp <= 1) ? 55 : 10; // Fresh graduates only viable for entry-level
        }

        // Proportional under-qualification score
        double ratio = candidateYears / minExp;
        if (ratio >= 0.85) return 80;  // Very close (e.g. 2.5 yrs for 3 yr min)
        if (ratio >= 0.65) return 60;
        if (ratio >= 0.40) return 35;
        return (int) Math.max(10, Math.round(ratio * 30));
    }

    public int evaluateExperience(Job job, Profile profile, ResumeDocument resumeDoc, String resumeRawText) {
        int score = evaluateExperience(job, profile, resumeDoc);
        if (score < 75 && resumeRawText != null && !resumeRawText.isBlank()) {
            String lower = resumeRawText.toLowerCase(Locale.ROOT);
            if (lower.contains("experience") || lower.contains("intern") || lower.contains("developer")
                    || lower.contains("engineer") || lower.contains("projects")) {
                Integer minExp = job.getMinimumExperience();
                if (minExp == null || minExp <= 1) {
                    return Math.max(score, 90);
                } else {
                    return Math.max(score, 75);
                }
            }
        }
        return score;
    }

    private int experienceLevelOrdinal(com.jobportal.domain.ExperienceLevel level) {
        return switch (level) {
            case INTERNSHIP   -> 0;
            case ENTRY_LEVEL  -> 1;
            case MID_LEVEL    -> 2;
            case SENIOR_LEVEL -> 3;
            case LEAD         -> 4;
            case MANAGER      -> 4;
            case EXECUTIVE    -> 5;
            default           -> 2;
        };
    }

    // ─── Education Evaluation ─────────────────────────────────────────────────

    /**
     * Evaluates candidate degree/education against job qualification requirement.
     */
    public int evaluateEducation(Job job, Profile profile, ResumeDocument resumeDoc) {
        return evaluateEducation(job, profile, resumeDoc, null);
    }

    /**
     * Evaluates candidate degree/education against job qualification requirement,
     * including scanning raw resume text (PDF/DOCX) when profile fields are not populated.
     */
    public int evaluateEducation(Job job, Profile profile, ResumeDocument resumeDoc, String resumeRawText) {
        String jobQual = job.getQualification();
        if (jobQual == null || jobQual.isBlank()) {
            return 95; // No strict education requirement
        }

        String target = jobQual.toLowerCase(Locale.ROOT);
        boolean hasCsDegree  = false;
        boolean hasAnyDegree = false;

        if (profile != null && profile.getEducations() != null) {
            for (Education edu : profile.getEducations()) {
                hasAnyDegree = true;
                String deg = (safeConcat(edu.getDegree(), edu.getFieldOfStudy())).toLowerCase(Locale.ROOT);
                if (deg.contains("computer") || deg.contains("information technology")
                        || deg.contains("software") || deg.contains("engineering")
                        || deg.contains("science")) {
                    hasCsDegree = true;
                }
                if (isEducationMatch(target, deg)) return 100;
            }
        }

        if (resumeDoc != null && resumeDoc.getEducationList() != null) {
            for (ResumeEducation edu : resumeDoc.getEducationList()) {
                hasAnyDegree = true;
                String deg = (safeConcat(edu.getDegree(), edu.getFieldOfStudy())).toLowerCase(Locale.ROOT);
                if (deg.contains("computer") || deg.contains("information technology")
                        || deg.contains("software") || deg.contains("engineering")
                        || deg.contains("science")) {
                    hasCsDegree = true;
                }
                if (isEducationMatch(target, deg)) return 100;
            }
        }

        if (resumeRawText != null && !resumeRawText.isBlank()) {
            String textLower = resumeRawText.toLowerCase(Locale.ROOT);
            if (textLower.contains("computer engineering")
                    || textLower.contains("computer science")
                    || textLower.contains("information technology")
                    || textLower.contains("bachelor of engineering")
                    || textLower.contains("b.e") || textLower.contains("b.tech")
                    || textLower.contains("bachelor of technology")
                    || textLower.contains("bca") || textLower.contains("mca")
                    || textLower.contains("master of computer applications")
                    || textLower.contains("bachelor of science")
                    || textLower.contains("b.sc")) {
                hasCsDegree = true;
                hasAnyDegree = true;
            } else if (textLower.contains("bachelor") || textLower.contains("master")
                    || textLower.contains("degree") || textLower.contains("university") || textLower.contains("college")) {
                hasAnyDegree = true;
            }

            if (isEducationMatch(target, textLower)) {
                return 100;
            }
        }

        if (hasCsDegree) return 95;
        if (hasAnyDegree) return 75;
        return 50;
    }

    private boolean isEducationMatch(String target, String candidateDeg) {
        if (target.contains("b.e") || target.contains("b.tech") || target.contains("bachelor")) {
            return candidateDeg.contains("b.e") || candidateDeg.contains("b.tech")
                    || candidateDeg.contains("bachelor");
        }
        if (target.contains("master") || target.contains("m.tech") || target.contains("mba")) {
            return candidateDeg.contains("master") || candidateDeg.contains("m.tech")
                    || candidateDeg.contains("mba") || candidateDeg.contains("m.e");
        }
        if (target.contains("phd") || target.contains("doctorate")) {
            return candidateDeg.contains("phd") || candidateDeg.contains("doctorate");
        }
        if (target.contains("diploma")) {
            return candidateDeg.contains("diploma");
        }
        return false;
    }

    private String safeConcat(String a, String b) {
        return (a != null ? a : "") + " " + (b != null ? b : "");
    }

    // ─── Result Record ────────────────────────────────────────────────────────

    public record SkillMatchResult(
            int requiredPercentage,
            int preferredPercentage,
            List<String> matchedRequired,
            List<String> missingRequired,
            List<String> matchedPreferred,
            List<String> missingPreferred
    ) {}
}
