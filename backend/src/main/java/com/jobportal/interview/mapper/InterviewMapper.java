package com.jobportal.interview.mapper;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.jobportal.interview.dto.AnswerEvaluationResponse;
import com.jobportal.interview.dto.InterviewReportResponse;
import com.jobportal.interview.dto.InterviewSessionResponse;
import com.jobportal.interview.dto.QuestionResponse;
import com.jobportal.interview.entity.InterviewAnswer;
import com.jobportal.interview.entity.InterviewQuestion;
import com.jobportal.interview.entity.InterviewSession;

/**
 * Component for mapping Interview domain entities to DTOs.
 */
@Component
public class InterviewMapper {

    public InterviewSessionResponse toSessionResponse(InterviewSession session) {
        if (session == null) return null;

        InterviewSessionResponse response = new InterviewSessionResponse();
        response.setId(session.getId());
        response.setUserEmail(session.getUser().getEmail());
        response.setUserName(session.getUser().getName());
        response.setInterviewTrack(session.getInterviewTrack());
        response.setInterviewType(session.getInterviewType());
        response.setDifficulty(session.getDifficulty());
        response.setTotalQuestions(session.getTotalQuestions());
        response.setCurrentQuestion(session.getCurrentQuestion());
        response.setOverallScore(session.getOverallScore() != null ? session.getOverallScore() : 0);
        response.setStatus(session.getStatus());
        response.setTrackTitle(session.getTrackTitle());
        response.setTrackId(session.getTrackId());
        response.setResumeId(session.getResumeId());
        response.setJobId(session.getJobId());
        response.setStartedAt(session.getStartedAt());
        response.setCompletedAt(session.getCompletedAt());
        return response;
    }

    public QuestionResponse toQuestionResponse(InterviewQuestion question) {
        if (question == null) return null;

        QuestionResponse response = new QuestionResponse();
        response.setId(question.getId());
        response.setSessionId(question.getSession().getId());
        response.setQuestion(question.getQuestion());
        response.setDifficulty(question.getDifficulty());
        response.setOrderNumber(question.getOrderNumber());
        response.setTotalQuestions(question.getSession().getTotalQuestions());
        return response;
    }

    public AnswerEvaluationResponse toAnswerEvaluationResponse(InterviewAnswer answer) {
        if (answer == null) return null;

        AnswerEvaluationResponse response = new AnswerEvaluationResponse();
        response.setId(answer.getId());
        response.setQuestionId(answer.getQuestion().getId());
        response.setQuestion(answer.getQuestion().getQuestion());
        response.setUserAnswer(answer.getUserAnswer());
        response.setAiFeedback(answer.getAiFeedback());
        response.setScore(answer.getScore());
        response.setStrengths(toList(answer.getStrengths()));
        response.setWeaknesses(toList(answer.getWeaknesses()));
        response.setSuggestions(toList(answer.getSuggestions()));
        response.setSubmittedAt(answer.getSubmittedAt());
        return response;
    }

    public InterviewReportResponse toReportResponse(InterviewSession session, List<InterviewAnswer> answers) {
        if (session == null) return null;

        InterviewReportResponse report = new InterviewReportResponse();
        report.setSessionId(session.getId());
        report.setCandidateName(session.getUser().getName());
        report.setCandidateEmail(session.getUser().getEmail());
        report.setTrack(session.getInterviewTrack());
        report.setTrackTitle(session.getTrackTitle());
        report.setTrackId(session.getTrackId());
        report.setDifficulty(session.getDifficulty());
        report.setStatus(session.getStatus());
        report.setTotalQuestions(session.getTotalQuestions());

        List<InterviewAnswer> validAnswers = answers != null
                ? answers.stream()
                        .filter(a -> a.getUserAnswer() != null && !a.getUserAnswer().trim().isEmpty())
                        .toList()
                : List.of();

        int answeredCount = validAnswers.size();
        report.setAnsweredQuestions(answeredCount);
        report.setStartedAt(session.getStartedAt());
        report.setCompletedAt(session.getCompletedAt());

        if (answeredCount == 0) {
            // No answers were submitted
            report.setOverallScore(0);
            report.setTechnicalScore(0);
            report.setCommunicationScore(0);
            report.setProblemSolvingScore(0);
            report.setConfidenceScore(0);
            report.setBestPracticesScore(0);

            report.setEvaluations(answers != null ? answers.stream().map(this::toAnswerEvaluationResponse).toList() : List.of());
            report.setOverallStrengths(List.of());
            report.setOverallWeaknesses(List.of("No answers were submitted during this interview session."));
            report.setOverallRecommendations(List.of("Answer questions during your next interview session to receive a complete AI evaluation report."));
            return report;
        }

        double avgScore = validAnswers.stream()
                .filter(a -> a.getScore() != null)
                .mapToInt(InterviewAnswer::getScore)
                .average()
                .orElse(0);

        int base = (int) Math.round(avgScore);
        report.setOverallScore(base);
        report.setTechnicalScore(Math.min(100, Math.max(0, base)));
        report.setCommunicationScore(Math.min(100, Math.max(0, base)));
        report.setProblemSolvingScore(Math.min(100, Math.max(0, base)));
        report.setConfidenceScore(Math.min(100, Math.max(0, base)));
        report.setBestPracticesScore(Math.min(100, Math.max(0, base)));

        List<AnswerEvaluationResponse> evaluations = new ArrayList<>();
        List<String> overallStrengths = new ArrayList<>();
        List<String> overallWeaknesses = new ArrayList<>();
        List<String> overallRecommendations = new ArrayList<>();

        if (answers != null) {
            for (InterviewAnswer ans : answers) {
                evaluations.add(toAnswerEvaluationResponse(ans));
                if (ans.getStrengths() != null) overallStrengths.addAll(ans.getStrengths());
                if (ans.getWeaknesses() != null) overallWeaknesses.addAll(ans.getWeaknesses());
                if (ans.getSuggestions() != null) overallRecommendations.addAll(ans.getSuggestions());
            }
        }

        report.setEvaluations(evaluations);
        report.setOverallStrengths(overallStrengths.stream().filter(s -> s != null && !s.isBlank()).distinct().limit(5).toList());
        report.setOverallWeaknesses(overallWeaknesses.stream().filter(w -> w != null && !w.isBlank()).distinct().limit(5).toList());
        report.setOverallRecommendations(overallRecommendations.stream().filter(r -> r != null && !r.isBlank()).distinct().limit(5).toList());

        return report;
    }

    private List<String> toList(List<String> source) {
        if (source == null) return List.of();
        return new ArrayList<>(source);
    }
}
