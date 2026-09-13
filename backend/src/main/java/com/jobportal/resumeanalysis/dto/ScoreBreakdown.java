package com.jobportal.resumeanalysis.dto;

/**
 * Score breakdown DTO presenting mathematically explainable component scores (0–100).
 */
public class ScoreBreakdown {

    private int atsStructure;
    private int keywords;
    private int skills;
    private int experience;
    private int education;
    private int formatting;
    private int completeness;
    private int semanticScore;
    private int deterministicScore;
    private int finalScore;

    public ScoreBreakdown() {}

    public ScoreBreakdown(
            int atsStructure,
            int keywords,
            int skills,
            int experience,
            int education,
            int formatting,
            int completeness,
            int semanticScore,
            int deterministicScore,
            int finalScore) {
        this.atsStructure = atsStructure;
        this.keywords = keywords;
        this.skills = skills;
        this.experience = experience;
        this.education = education;
        this.formatting = formatting;
        this.completeness = completeness;
        this.semanticScore = semanticScore;
        this.deterministicScore = deterministicScore;
        this.finalScore = finalScore;
    }

    public ScoreBreakdown(int keywords, int skills, int experience, int education, int formatting, int completeness) {
        this(75, keywords, skills, experience, education, formatting, completeness, 80, 78, 80);
    }

    public int getAtsStructure() { return atsStructure; }
    public void setAtsStructure(int atsStructure) { this.atsStructure = atsStructure; }

    public int getKeywords() { return keywords; }
    public void setKeywords(int keywords) { this.keywords = keywords; }

    public int getSkills() { return skills; }
    public void setSkills(int skills) { this.skills = skills; }

    public int getExperience() { return experience; }
    public void setExperience(int experience) { this.experience = experience; }

    public int getEducation() { return education; }
    public void setEducation(int education) { this.education = education; }

    public int getFormatting() { return formatting; }
    public void setFormatting(int formatting) { this.formatting = formatting; }

    public int getCompleteness() { return completeness; }
    public void setCompleteness(int completeness) { this.completeness = completeness; }

    public int getSemanticScore() { return semanticScore; }
    public void setSemanticScore(int semanticScore) { this.semanticScore = semanticScore; }

    public int getDeterministicScore() { return deterministicScore; }
    public void setDeterministicScore(int deterministicScore) { this.deterministicScore = deterministicScore; }

    public int getFinalScore() { return finalScore; }
    public void setFinalScore(int finalScore) { this.finalScore = finalScore; }
}
