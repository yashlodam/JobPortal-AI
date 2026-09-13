package com.jobportal.serviceImpl;

import java.util.List;


import org.hibernate.Hibernate;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.jobportal.domain.ExperienceType;
import com.jobportal.dto.request.CertificationRequest;
import com.jobportal.dto.request.EducationRequest;
import com.jobportal.dto.request.ExperienceRequest;
import com.jobportal.dto.request.ProfileAboutRequest;
import com.jobportal.dto.request.ProfileHeaderRequest;
import com.jobportal.dto.request.ProfileLinksRequest;
import com.jobportal.dto.request.ProfileSkillsRequest;
import com.jobportal.dto.response.CertificationResponse;
import com.jobportal.dto.response.EducationResponse;
import com.jobportal.dto.response.ExperienceResponse;
import com.jobportal.dto.response.ProfileResponse;
import com.jobportal.entity.Certification;
import com.jobportal.entity.Education;
import com.jobportal.entity.Experience;
import com.jobportal.entity.Profile;
import com.jobportal.entity.Resume;
import com.jobportal.entity.User;
import com.jobportal.event.ProfileCompletedEvent;
import com.jobportal.exception.JobPortalException;
import com.jobportal.repository.CertificationRepository;
import com.jobportal.repository.EducationRepository;
import com.jobportal.repository.ExperienceRepository;
import com.jobportal.repository.ProfileRepository;
import com.jobportal.repository.ResumeRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.ProfileService;
import com.jobportal.utility.FileStorageService;
import java.util.Optional;

/**
 * Profile service implementation.
 *
 * <h3>Notifications (event-driven)</h3>
 * <p>{@link ProfileCompletedEvent} is published after every major profile mutation
 * whenever the profile crosses the "complete" threshold. A "complete" profile has:</p>
 * <ul>
 *   <li>A non-blank headline</li>
 *   <li>A non-blank about section</li>
 *   <li>At least one skill</li>
 *   <li>At least one experience OR education entry</li>
 *   <li>A resume uploaded</li>
 * </ul>
 * <p>The check is idempotent: repeating after each save ensures the notification
 * is sent the moment all conditions are met. The listener deduplicates by
 * checking for an existing {@code PROFILE_COMPLETED} notification before creating
 * a new one (see {@link com.jobportal.listener.NotificationEventListener}).</p>
 */
@Service
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository       profileRepository;
    private final UserRepository          userRepository;
    private final ExperienceRepository    experienceRepository;
    private final EducationRepository     educationRepository;
    private final CertificationRepository certificationRepository;
    private final ResumeRepository        resumeRepository;
    private final FileStorageService      fileStorageService;
    private final ApplicationEventPublisher eventPublisher;
    private final com.jobportal.service.ResumeService resumeService;

    public ProfileServiceImpl(
            ProfileRepository profileRepository,
            UserRepository userRepository,
            ExperienceRepository experienceRepository,
            EducationRepository educationRepository,
            CertificationRepository certificationRepository,
            ResumeRepository resumeRepository,
            FileStorageService fileStorageService,
            ApplicationEventPublisher eventPublisher,
            com.jobportal.service.ResumeService resumeService) {
        this.profileRepository       = profileRepository;
        this.userRepository          = userRepository;
        this.experienceRepository    = experienceRepository;
        this.educationRepository     = educationRepository;
        this.certificationRepository = certificationRepository;
        this.resumeRepository        = resumeRepository;
        this.fileStorageService      = fileStorageService;
        this.eventPublisher          = eventPublisher;
        this.resumeService           = resumeService;
    }

    // ── Profile Reads ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ProfileResponse getMyProfile(String email) throws JobPortalException {
        // findProfileByEmailWithDetails loads user + resume via EntityGraph;
        // skills/languages/experiences/educations/certifications are batch-loaded
        // by @BatchSize(25) on first access — all within this @Transactional boundary.
        return toResponse(findProfileByEmailWithDetails(email));
    }

    @Override
    @Transactional
    public ProfileResponse getProfileByEmail(String email) throws JobPortalException {
        return toResponse(findProfileByEmailWithDetails(email));
    }

    // ── Header ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ProfileResponse updateHeader(ProfileHeaderRequest request, String email)
            throws JobPortalException {
        Profile profile = findProfileByEmail(email);
        if (request.getName() != null && !request.getName().isBlank() && profile.getUser() != null) {
            profile.getUser().setName(request.getName().trim());
        }
        if (request.getHeadline() != null)        profile.setHeadline(request.getHeadline().trim());
        if (request.getCurrentCompany() != null)  profile.setCurrentCompany(request.getCurrentCompany().trim());
        if (request.getLocation() != null)        profile.setLocation(request.getLocation().trim());
        if (request.getAvailability() != null)    profile.setAvailability(request.getAvailability());
        if (request.getExperienceLevel() != null) profile.setExperienceLevel(request.getExperienceLevel());
        profileRepository.save(profile);

        Profile updated = findProfileByEmailWithDetails(email);
        publishProfileCompletedIfNeeded(updated);
        return toResponse(updated);
    }

    // ── Links ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ProfileResponse updateLinks(ProfileLinksRequest request, String email)
            throws JobPortalException {
        Profile profile = findProfileByEmail(email);
        if (request.getLinkedinUrl() != null)  profile.setLinkedinUrl(request.getLinkedinUrl().trim());
        if (request.getGithubUrl() != null)    profile.setGithubUrl(request.getGithubUrl().trim());
        if (request.getPortfolioUrl() != null) profile.setPortfolioUrl(request.getPortfolioUrl().trim());
        profileRepository.save(profile);
        return toResponse(findProfileByEmailWithDetails(email));
    }

    // ── About ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ProfileResponse updateAbout(ProfileAboutRequest request, String email)
            throws JobPortalException {
        Profile profile = findProfileByEmail(email);
        profile.setAbout(request.getAbout());
        profileRepository.save(profile);

        Profile updated = findProfileByEmailWithDetails(email);
        publishProfileCompletedIfNeeded(updated);
        return toResponse(updated);
    }

    // ── Skills ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ProfileResponse updateSkills(ProfileSkillsRequest request, String email)
            throws JobPortalException {
        // skills is @ElementCollection — must use the skills-loaded query to
        // safely access and mutate the collection within the session.
        Profile profile = findProfileByEmailWithDetails(email);
        profile.setSkills(request.getSkills());
        profileRepository.save(profile);

        Profile updated = findProfileByEmailWithDetails(email);
        publishProfileCompletedIfNeeded(updated);
        return toResponse(updated);
    }

    @Override
    @Transactional
    public ProfileResponse addSkill(String skill, String email) throws JobPortalException {
        Profile profile = findProfileByEmailWithDetails(email);
        List<String> skills = profile.getSkills();
        if (!skills.contains(skill)) {
            skills.add(skill);
        }
        profileRepository.save(profile);

        Profile updated = findProfileByEmailWithDetails(email);
        publishProfileCompletedIfNeeded(updated);
        return toResponse(updated);
    }

    @Override
    @Transactional
    public ProfileResponse removeSkill(String skill, String email) throws JobPortalException {
        Profile profile = findProfileByEmailWithDetails(email);
        if (!profile.getSkills().remove(skill)) {
            throw JobPortalException.notFound("Skill '" + skill + "' not found in profile");
        }
        profileRepository.save(profile);
        return toResponse(findProfileByEmailWithDetails(email));
    }

    // ── Experience ───────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ExperienceResponse addExperience(ExperienceRequest request, String email)
            throws JobPortalException {
        Profile profile = findProfileByEmail(email);
        Experience experience = new Experience();
        mapExperienceRequest(request, experience);
        profile.addExperience(experience);
        ExperienceResponse response = toExperienceResponse(experienceRepository.save(experience));
        publishProfileCompletedIfNeeded(findProfileByEmailWithDetails(email));
        return response;
    }

    @Override
    @Transactional
    public ExperienceResponse updateExperience(Long experienceId, ExperienceRequest request, String email)
            throws JobPortalException {
        Profile profile = findProfileByEmail(email);
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> JobPortalException.notFound(
                        "Experience not found with id: " + experienceId));

        if (!experience.getProfile().getId().equals(profile.getId())) {
            throw JobPortalException.forbidden("You are not authorized to update this experience");
        }

        mapExperienceRequest(request, experience);
        return toExperienceResponse(experienceRepository.save(experience));
    }

    @Override
    @Transactional
    public void deleteExperience(Long experienceId, String email) throws JobPortalException {
        Profile profile = findProfileByEmail(email);
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> JobPortalException.notFound(
                        "Experience not found with id: " + experienceId));

        if (!experience.getProfile().getId().equals(profile.getId())) {
            throw JobPortalException.forbidden("You are not authorized to delete this experience");
        }

        profile.removeExperience(experience);
        experienceRepository.delete(experience);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExperienceResponse> getExperiences(String email) throws JobPortalException {
        Profile profile = findProfileByEmail(email);
        return experienceRepository.findByProfile(profile)
                .stream().map(this::toExperienceResponse).toList();
    }

    // ── Education ────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public EducationResponse addEducation(EducationRequest request, String email)
            throws JobPortalException {
        Profile profile = findProfileByEmail(email);
        Education education = new Education();
        mapEducationRequest(request, education);
        profile.addEducation(education);
        Education saved = educationRepository.save(education);
        publishProfileCompletedIfNeeded(findProfileByEmailWithDetails(email));
        return toEducationResponse(saved);
    }

    @Override
    @Transactional
    public EducationResponse updateEducation(Long educationId, EducationRequest request, String email)
            throws JobPortalException {
        Profile profile = findProfileByEmail(email);
        Education education = educationRepository.findById(educationId)
                .orElseThrow(() -> JobPortalException.notFound(
                        "Education not found with id: " + educationId));

        if (!education.getProfile().getId().equals(profile.getId())) {
            throw JobPortalException.forbidden("You are not authorized to update this education");
        }

        mapEducationRequest(request, education);
        return toEducationResponse(educationRepository.save(education));
    }

    @Override
    @Transactional
    public void deleteEducation(Long educationId, String email) throws JobPortalException {
        Profile profile = findProfileByEmail(email);
        Education education = educationRepository.findById(educationId)
                .orElseThrow(() -> JobPortalException.notFound(
                        "Education not found with id: " + educationId));

        if (!education.getProfile().getId().equals(profile.getId())) {
            throw JobPortalException.forbidden("You are not authorized to delete this education");
        }

        profile.removeEducation(education);
        educationRepository.delete(education);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EducationResponse> getEducations(String email) throws JobPortalException {
        Profile profile = findProfileByEmail(email);
        return educationRepository.findByProfile(profile)
                .stream().map(this::toEducationResponse).toList();
    }

    // ── Certification ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public CertificationResponse addCertification(CertificationRequest request, String email)
            throws JobPortalException {
        Profile profile = findProfileByEmail(email);
        Certification certification = new Certification();
        mapCertificationRequest(request, certification);
        profile.addCertification(certification);
        return toCertificationResponse(certificationRepository.save(certification));
    }

    @Override
    @Transactional
    public CertificationResponse updateCertification(Long certificationId,
                                                      CertificationRequest request,
                                                      String email)
            throws JobPortalException {
        Profile profile = findProfileByEmail(email);
        Certification certification = certificationRepository.findById(certificationId)
                .orElseThrow(() -> JobPortalException.notFound(
                        "Certification not found with id: " + certificationId));

        if (!certification.getProfile().getId().equals(profile.getId())) {
            throw JobPortalException.forbidden("You are not authorized to update this certification");
        }

        mapCertificationRequest(request, certification);
        return toCertificationResponse(certificationRepository.save(certification));
    }

    @Override
    @Transactional
    public void deleteCertification(Long certificationId, String email) throws JobPortalException {
        Profile profile = findProfileByEmail(email);
        Certification certification = certificationRepository.findById(certificationId)
                .orElseThrow(() -> JobPortalException.notFound(
                        "Certification not found with id: " + certificationId));

        if (!certification.getProfile().getId().equals(profile.getId())) {
            throw JobPortalException.forbidden("You are not authorized to delete this certification");
        }

        profile.removeCertification(certification);
        certificationRepository.delete(certification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CertificationResponse> getCertifications(String email) throws JobPortalException {
        Profile profile = findProfileByEmail(email);
        return certificationRepository.findByProfile(profile)
                .stream().map(this::toCertificationResponse).toList();
    }

    // ── Languages ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ProfileResponse addLanguage(String language, String email) throws JobPortalException {
        // @ElementCollection — must load the collection proxy within this session
        // before mutating; withDetails ensures languages is initialized.
        Profile profile = findProfileByEmailWithDetails(email);
        List<String> languages = profile.getLanguages();
        if (!languages.contains(language)) {
            languages.add(language);
        }
        profileRepository.save(profile);
        return toResponse(findProfileByEmailWithDetails(email));
    }

    @Override
    @Transactional
    public ProfileResponse removeLanguage(String language, String email) throws JobPortalException {
        Profile profile = findProfileByEmailWithDetails(email);
        if (!profile.getLanguages().remove(language)) {
            throw JobPortalException.notFound("Language '" + language + "' not found in profile");
        }
        profileRepository.save(profile);
        return toResponse(findProfileByEmailWithDetails(email));
    }

    // ── Image Uploads ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ProfileResponse updateProfileImage(MultipartFile file, String email) throws Exception {
        Profile profile = findProfileByEmail(email);
        if (profile.getProfileImage() != null) {
            fileStorageService.delete(profile.getProfileImage());
        }
        String path = fileStorageService.store(file, "profile");
        profile.setProfileImage(path);
        profileRepository.save(profile);
        return toResponse(findProfileByEmailWithDetails(email));
    }

    @Override
    @Transactional
    public ProfileResponse updateBannerImage(MultipartFile file, String email) throws Exception {
        Profile profile = findProfileByEmail(email);
        if (profile.getBannerImage() != null) {
            fileStorageService.delete(profile.getBannerImage());
        }
        String path = fileStorageService.store(file, "banner");
        profile.setBannerImage(path);
        profileRepository.save(profile);
        return toResponse(findProfileByEmailWithDetails(email));
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private Profile findProfileByEmail(String email) throws JobPortalException {
        return findProfileByEmailWithDetails(email);
    }

    private Profile findProfileByEmailWithDetails(String email) throws JobPortalException {
        Optional<Profile> opt = profileRepository.findByUserEmailWithDetails(email);
        if (opt.isPresent()) {
            return opt.get();
        }

        // If no Profile row exists yet (e.g. registered as EMPLOYER or created before profile integration),
        // initialize a profile for the user automatically so /api/profile/{email} never 404s.
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            Profile profile = new Profile();
            profile = profileRepository.save(profile);
            user.setProfile(profile);
            userRepository.save(user);
            return profileRepository.findByUserEmailWithDetails(email).orElse(profile);
        }

        throw JobPortalException.notFound("Profile not found for email: " + email);
    }

    /**
     * Checks whether the profile meets the "complete" criteria and, if so,
     * publishes a {@link ProfileCompletedEvent}.
     *
     * <p>The listener deduplicates: it only creates one {@code PROFILE_COMPLETED}
     * notification per user ever. So even if this method is called many times,
     * the user receives the celebration notification exactly once.</p>
     *
     * <p>Called within an open {@code @Transactional} session, so Hibernate
     * collection access (skills, experiences, educations) is safe without
     * explicit {@code Hibernate.initialize()} calls.</p>
     */
    private void publishProfileCompletedIfNeeded(Profile profile) {
        boolean hasHeadline    = hasText(profile.getHeadline());
        boolean hasAbout       = hasText(profile.getAbout());
        boolean hasSkills      = !profile.getSkills().isEmpty();
        boolean hasExperience  = !profile.getExperiences().isEmpty();
        boolean hasEducation   = !profile.getEducations().isEmpty();
        boolean hasResume      = !profile.getResumes().isEmpty();

        if (hasHeadline && hasAbout && hasSkills && (hasExperience || hasEducation) && hasResume) {
            if (profile.getUser() != null) {
                eventPublisher.publishEvent(new ProfileCompletedEvent(this, profile.getUser().getId(), profile.getUser().getEmail()));
            }
        }
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private void mapExperienceRequest(ExperienceRequest req, Experience exp) {
        if (req.getTitle() != null)         exp.setTitle(req.getTitle());
        if (req.getCompany() != null)       exp.setCompany(req.getCompany());
        if (req.getLocation() != null)      exp.setLocation(req.getLocation());
        if (req.getStartDate() != null)     exp.setStartDate(req.getStartDate());
        exp.setEndDate(req.getEndDate());
        if (req.getWorking() != null)       exp.setWorking(req.getWorking());
        if (req.getDescription() != null)   exp.setDescription(req.getDescription());
        if (req.getEmploymentType() != null) {
            try {
                exp.setEmploymentType(ExperienceType.valueOf(req.getEmploymentType()));
            } catch (IllegalArgumentException ignored) {
                // Invalid enum value — leave unchanged
            }
        }
    }

    private void mapEducationRequest(EducationRequest req, Education edu) {
        if (req.getDegree() != null)      edu.setDegree(req.getDegree());
        if (req.getCollegeName() != null) edu.setCollegeName(req.getCollegeName());
        if (req.getUniversity() != null)  edu.setUniversity(req.getUniversity());
        if (req.getStartDate() != null)   edu.setStartDate(req.getStartDate());
        edu.setEndDate(req.getEndDate());
        if (req.getLocation() != null)    edu.setLocation(req.getLocation());
        if (req.getGrade() != null)       edu.setFieldOfStudy(req.getGrade());
    }

    private void mapCertificationRequest(CertificationRequest req, Certification cert) {
        if (req.getTitle() != null)          cert.setTitle(req.getTitle());
        if (req.getIssuer() != null)         cert.setIssuer(req.getIssuer());
        if (req.getIssueDate() != null)      cert.setIssueDate(req.getIssueDate());
        if (req.getCertificateId() != null)  cert.setCertificateId(req.getCertificateId());
        if (req.getCertificateUrl() != null) cert.setCertificateUrl(req.getCertificateUrl());
    }

    // ── Response Mappers ──────────────────────────────────────────────────────

    private ProfileResponse toResponse(Profile profile) {
        Hibernate.initialize(profile.getSkills());
        Hibernate.initialize(profile.getLanguages());
        Hibernate.initialize(profile.getExperiences());
        Hibernate.initialize(profile.getEducations());
        Hibernate.initialize(profile.getCertifications());
        Hibernate.initialize(profile.getResumes());

        ProfileResponse dto = new ProfileResponse();

        dto.setId(profile.getId());
        dto.setHeadline(profile.getHeadline());
        dto.setCurrentCompany(profile.getCurrentCompany());
        dto.setLocation(profile.getLocation());
        dto.setAvailability(profile.getAvailability());
        dto.setExperienceLevel(profile.getExperienceLevel());
        dto.setAbout(profile.getAbout());
        dto.setProfileImage(profile.getProfileImage());
        dto.setBannerImage(profile.getBannerImage());
        dto.setLinkedinUrl(profile.getLinkedinUrl());
        dto.setGithubUrl(profile.getGithubUrl());
        dto.setPortfolioUrl(profile.getPortfolioUrl());

        dto.setSkills(profile.getSkills());
        dto.setLanguages(profile.getLanguages());

        dto.setCreatedAt(profile.getCreatedAt());
        dto.setUpdatedAt(profile.getUpdatedAt());

        if (profile.getUser() != null) {
            dto.setUserId(profile.getUser().getId());
            dto.setName(profile.getUser().getName());
            dto.setEmail(profile.getUser().getEmail());
        }

        dto.setExperiences(profile.getExperiences().stream()
                .map(this::toExperienceResponse)
                .toList());

        dto.setEducations(profile.getEducations().stream()
                .map(this::toEducationResponse)
                .toList());

        dto.setCertifications(profile.getCertifications().stream()
                .map(this::toCertificationResponse)
                .toList());

        if (profile.getResumes() != null && !profile.getResumes().isEmpty()) {
            dto.setResumes(profile.getResumes().stream()
                    .map(resumeService::toResponse)
                    .toList());

            Resume defaultResume = profile.getResumes().stream()
                    .filter(r -> Boolean.TRUE.equals(r.getIsDefault()))
                    .findFirst()
                    .orElse(profile.getResumes().get(0));

            dto.setResumeUrl(defaultResume.getResumeUrl());
            dto.setResumeName(defaultResume.getResumeName());
        }

        return dto;
    }

    private ExperienceResponse toExperienceResponse(Experience exp) {
        ExperienceResponse dto = new ExperienceResponse();
        dto.setId(exp.getId());
        dto.setTitle(exp.getTitle());
        dto.setCompany(exp.getCompany());
        dto.setLocation(exp.getLocation());
        dto.setStartDate(exp.getStartDate());
        dto.setEndDate(exp.getEndDate());
        dto.setWorking(exp.getWorking());
        dto.setDescription(exp.getDescription());
        if (exp.getEmploymentType() != null) {
            dto.setEmploymentType(exp.getEmploymentType().name());
        }
        return dto;
    }

    private EducationResponse toEducationResponse(Education edu) {
        EducationResponse dto = new EducationResponse();
        dto.setId(edu.getId());
        dto.setDegree(edu.getDegree());
        dto.setCollegeName(edu.getCollegeName());
        dto.setUniversity(edu.getUniversity());
        dto.setStartDate(edu.getStartDate());
        dto.setEndDate(edu.getEndDate());
        dto.setLocation(edu.getLocation());
        dto.setGrade(edu.getFieldOfStudy());
        return dto;
    }

    private CertificationResponse toCertificationResponse(Certification cert) {
        CertificationResponse dto = new CertificationResponse();
        dto.setId(cert.getId());
        dto.setTitle(cert.getTitle());
        dto.setIssuer(cert.getIssuer());
        dto.setIssueDate(cert.getIssueDate());
        dto.setCertificateId(cert.getCertificateId());
        dto.setCertificateUrl(cert.getCertificateUrl());
        return dto;
    }
}
