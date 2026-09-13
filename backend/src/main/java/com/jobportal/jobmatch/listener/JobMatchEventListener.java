package com.jobportal.jobmatch.listener;

import org.slf4j.Logger;


import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.jobportal.event.ApplicationSubmittedEvent;
import com.jobportal.jobmatch.service.JobMatchOrchestratorService;

/**
 * Asynchronously processes AI job matching after a job application is committed to PostgreSQL.
 *
 * <p>Uses {@code @TransactionalEventListener(phase = AFTER_COMMIT)} + {@code @Async} to guarantee
 * that the candidate never waits for AI inference, and database rollbacks do not trigger background tasks.</p>
 */
@Component
public class JobMatchEventListener {

    private static final Logger log = LoggerFactory.getLogger(JobMatchEventListener.class);

    private final JobMatchOrchestratorService orchestratorService;

    public JobMatchEventListener(JobMatchOrchestratorService orchestratorService) {
        this.orchestratorService = orchestratorService;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onApplicationSubmitted(ApplicationSubmittedEvent event) {
        log.info("Received ApplicationSubmittedEvent for Application ID=[{}]. Triggering async AI Match.",
                event.getApplicationId());

        try {
            orchestratorService.processMatchAnalysis(event.getApplicationId());
        } catch (Exception e) {
            log.error("Async Job Match execution failed for Application ID=[{}]: {}",
                    event.getApplicationId(), e.getMessage(), e);
        }
    }
}
