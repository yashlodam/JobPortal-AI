package com.jobportal.serviceImpl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.dto.response.JobSummaryResponse;
import com.jobportal.dto.response.SavedJobResponse;
import com.jobportal.entity.Job;
import com.jobportal.entity.SavedJob;
import com.jobportal.entity.User;
import com.jobportal.exception.JobPortalException;
import com.jobportal.mapper.JobMapper;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.SavedJobRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.SavedJobService;


@Service
public class SavedJobServiceImpl implements SavedJobService {

    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final JobMapper jobMapper;

    public SavedJobServiceImpl(
            SavedJobRepository savedJobRepository,
            JobRepository jobRepository,
            UserRepository userRepository,
            JobMapper jobMapper) {
        this.savedJobRepository = savedJobRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.jobMapper = jobMapper;
    }


    @Override
    @Transactional
    public SavedJobResponse saveJob(Long jobId, String email) throws JobPortalException {
        User user = findUserByEmail(email);
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> JobPortalException.notFound("Job not found with id: " + jobId));

        if (savedJobRepository.existsByUserIdAndJobId(user.getId(), jobId)) {
            throw JobPortalException.conflict("You have already saved this job.");
        }

        SavedJob savedJob = new SavedJob(user, job);
        job.setTotalBookmarks(job.getTotalBookmarks() + 1);
        jobRepository.save(job);

        return toResponse(savedJobRepository.save(savedJob));
    }

    @Override
    @Transactional
    public void unsaveJob(Long jobId, String email) throws JobPortalException {
        User user = findUserByEmail(email);
        SavedJob savedJob = savedJobRepository.findByUserIdAndJobId(user.getId(), jobId)
                .orElseThrow(() -> JobPortalException.notFound("Saved job not found."));

        Job job = savedJob.getJob();
        if (job.getTotalBookmarks() > 0) {
            job.setTotalBookmarks(job.getTotalBookmarks() - 1);
            jobRepository.save(job);
        }

        savedJobRepository.delete(savedJob);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SavedJobResponse> getMySavedJobs(String email, Pageable pageable)
            throws JobPortalException {
        User user = findUserByEmail(email);
        return savedJobRepository.findByUserId(user.getId(), pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isJobSaved(Long jobId, String email) throws JobPortalException {
        User user = findUserByEmail(email);
        return savedJobRepository.existsByUserIdAndJobId(user.getId(), jobId);
    }

    private User findUserByEmail(String email) throws JobPortalException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> JobPortalException.notFound("User not found"));
    }

    private SavedJobResponse toResponse(SavedJob savedJob) {
        SavedJobResponse dto = new SavedJobResponse();
        dto.setSavedJobId(savedJob.getId());
        dto.setSavedAt(savedJob.getCreatedAt());

        JobSummaryResponse jobDto = jobMapper.toSummary(savedJob.getJob());

        dto.setJob(jobDto);
        return dto;
    }
}
