package com.jobportal.config;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

/**
 * Production-grade Async and Task Scheduling Configuration.
 *
 * <ul>
 *   <li>Core Pool Size: 5 (expandable up to 25 under burst traffic)</li>
 *   <li>Queue Capacity: 500 tasks</li>
 *   <li>Rejection Policy: CallerRunsPolicy (prevents task loss under high load)</li>
 *   <li>Graceful Shutdown: 30s timeout</li>
 * </ul>
 */
@Configuration
@EnableScheduling
@EnableAsync
public class AsyncSchedulingConfig implements AsyncConfigurer {

    private static final Logger log = LoggerFactory.getLogger(AsyncSchedulingConfig.class);

    // ── Defaults are deliberately low for Render Free 512MB container ──────────
    // application.properties sets async.core-pool-size=2, async.max-pool-size=4.
    // Fallback defaults here match production values so even if the property file
    // is missing, the container does NOT spin up 25 threads.
    @Value("${async.core-pool-size:2}")
    private int corePoolSize;

    @Value("${async.max-pool-size:4}")
    private int maxPoolSize;

    @Value("${async.queue-capacity:100}")
    private int queueCapacity;

    @Value("${async.thread-name-prefix:jobportal-async-}")
    private String threadNamePrefix;

    @Bean(name = "taskExecutor")
    @Primary
    public ThreadPoolTaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix(threadNamePrefix);
        executor.setKeepAliveSeconds(60);
        executor.setAllowCoreThreadTimeOut(true);
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        log.info("Initialized TaskExecutor: corePoolSize={}, maxPoolSize={}, queueCapacity={}",
                corePoolSize, maxPoolSize, queueCapacity);
        return executor;
    }

    @Override
    public Executor getAsyncExecutor() {
        return taskExecutor();
    }

    @Bean
    public ThreadPoolTaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        // A single scheduler thread is optimal for periodic notification cleanup cron jobs
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("jobportal-scheduler-");
        scheduler.setWaitForTasksToCompleteOnShutdown(true);
        scheduler.setAwaitTerminationSeconds(30);
        scheduler.initialize();
        return scheduler;
    }
}
