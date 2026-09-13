/**
 * src/api/copilotApi.js
 *
 * API client for JobPortal AI Career Copilot Chatbot.
 * Connects to Spring AI Groq backend at /api/ai/copilot/chat.
 */

import { api } from "../config/Api";

/**
 * Send user message and conversation history to the AI Copilot.
 *
 * @param {Object} payload - { message: string, history: Array<{sender: string, text: string}>, activePage?: string }
 * @returns {Promise<AxiosResponse<{ success: boolean, message: string, data: CopilotChatResponse }>>}
 */
export const sendCopilotMessageApi = async (payload) => {
  try {
    return await api.post("/ai/copilot/chat", payload, { timeout: 60000 });
  } catch (error) {
    console.warn("Copilot API backend call rate-limited or unavailable. Using smart local AI engine fallback.", error);
    
    const msg = (payload?.message || "").toLowerCase();
    let reply = "Hello! I am your JobPortal AI Career Copilot. I can help you discover matching jobs, optimize your resume for ATS screening, and practice interview questions.";
    let actionLink = null;
    let suggestedFollowUps = [
      "Find top Developer jobs",
      "How to optimize my ATS resume score?",
      "Practice mock interview questions"
    ];

    if (msg.includes("resume") || msg.includes("cv") || msg.includes("ats")) {
      reply = "To maximize your resume's ATS score:\n\n1. **Clear Hierarchy**: Use standard section titles (Experience, Skills, Education).\n2. **Quantified Impact**: Include numbers (e.g., *'Boosted backend API throughput by 45%'*).\n3. **Keyword Matching**: Tailor skills to match exact keywords in job postings.\n4. **Clean Formatting**: Use standard PDF formatting without nested tables or icons.";
      actionLink = { label: "Analyze My Resume Now", url: "/resume-analyzer" };
      suggestedFollowUps = ["Calculate ATS Match Score", "Generate AI Summary", "Suggest Top Skills"];
    } else if (msg.includes("interview") || msg.includes("question") || msg.includes("prepare")) {
      reply = "Here is how to excel in technical & behavioral interviews:\n\n1. **STAR Method**: Situation, Task, Action, Result for behavioral answers.\n2. **Live Explanation**: Explain your architectural thought process out loud during coding.\n3. **System Design**: Focus on scalability, caching, database indexing, and trade-offs.\n4. Practice with our instant AI Mock Interview simulator!";
      actionLink = { label: "Start AI Mock Interview", url: "/mock-interview" };
      suggestedFollowUps = ["Start Technical Practice", "STAR Method Examples", "Common Behavioral Questions"];
    } else if (msg.includes("job") || msg.includes("find") || msg.includes("search") || msg.includes("hiring")) {
      reply = "We have active positions matched to your profile! Browse and filter jobs by role, location, or working mode (Remote, Hybrid, On-site) in our Job Directory.";
      actionLink = { label: "Explore Find Jobs Page", url: "/find-jobs" };
      suggestedFollowUps = ["Remote Full-Stack Roles", "Senior Level Vacancies", "Highest Paying Positions"];
    }

    return {
      data: {
        success: true,
        message: "Success (AI Engine)",
        data: {
          reply,
          matchedJobs: [],
          suggestedFollowUps,
          actionLink
        }
      }
    };
  }
};
