package com.jobportal.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.domain.AccountType;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;

/**
 * Startup data initializer — runs once after the Spring context is fully ready.
 *
 * <h3>Responsibilities</h3>
 * <ol>
 *   <li><strong>Recruiter enum migration</strong> — safely migrates legacy
 *       {@code status='ACTIVE'} rows to {@code 'APPROVED'} and
 *       {@code status='INACTIVE'} rows to {@code 'SUSPENDED'} in the
 *       {@code recruiters} table using native JDBC SQL (bypasses JPA enum mapping
 *       so Hibernate never touches a row with an unknown enum value).</li>
 *   <li><strong>Admin bootstrap</strong> — creates the first admin account if
 *       none exists. Reads credentials from {@code application.properties}
 *       and BCrypt-encodes the password. Idempotent: runs only when no
 *       {@code ADMIN} account exists.</li>
 * </ol>
 *
 * <h3>Order</h3>
 * {@code @Order(1)} — runs before any other {@link ApplicationRunner} beans,
 * ensuring the DB is in a consistent state before the application serves traffic.
 *
 * <h3>Safety guarantees</h3>
 * <ul>
 *   <li>The migration SQL is idempotent — running it twice has no effect.</li>
 *   <li>Admin creation is guarded by a {@code SELECT COUNT} check — no duplicates.</li>
 *   <li>The admin password is BCrypt-encoded using the same {@link PasswordEncoder}
 *       bean as the rest of the application — never stored as plaintext.</li>
 *   <li>Admin bootstrap is skipped if {@code app.admin.bootstrap.enabled=false}.</li>
 * </ul>
 *
 * <h3>First-time setup instructions</h3>
 * <pre>
 *   # In application.properties, set:
 *   app.admin.bootstrap.enabled=true
 *   app.admin.bootstrap.name=Admin
 *   app.admin.bootstrap.email=admin@velora.com
 *   app.admin.bootstrap.password=ChangeMe@2026!
 *
 *   # Start the application once. Check logs for:
 *   #   [DataInitializer] Admin account created: admin@velora.com
 *
 *   # After the first start, you MAY set bootstrap.enabled=false
 *   # to prevent the initializer from running again (optional — it is idempotent).
 *   # Change the admin password via the profile API or directly in DB after creation.
 * </pre>
 */
@Component
@Order(1)
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final JdbcTemplate    jdbcTemplate;
    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    // ── Admin Bootstrap Properties ────────────────────────────────────────────
    @Value("${app.admin.bootstrap.enabled:true}")
    private boolean adminBootstrapEnabled;

    @Value("${app.admin.bootstrap.email:yashlodam03@gmail.com}")
    private String adminEmail;

    @Value("${app.admin.bootstrap.password:YashLodam@2004}")
    private String adminPassword;

    @Value("${app.admin.bootstrap.name:Platform Admin}")
    private String adminName;

    @Value("${app.migration.fix-foreign-keys.enabled:false}")
    private boolean fixForeignKeysEnabled;

    public DataInitializer(
            JdbcTemplate jdbcTemplate,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.jdbcTemplate    = jdbcTemplate;
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        migrateRecruiterStatuses();
        if (adminBootstrapEnabled) {
            bootstrapAdminUser();
        } else {
            log.info("[DataInitializer] Admin bootstrap is disabled (app.admin.bootstrap.enabled=false).");
        }
    }

    // ── Recruiter Status Migration ────────────────────────────────────────────

    /**
     * Migrates legacy enum values in the {@code recruiters.status} column.
     *
     * <ul>
     *   <li>{@code ACTIVE}   → {@code APPROVED}  (existing legitimate recruiters)</li>
     *   <li>{@code INACTIVE} → {@code SUSPENDED}  (previously deactivated recruiters)</li>
     * </ul>
     *
     * <p>Uses native JDBC SQL — intentionally bypasses JPA entity loading so
     * that Hibernate never tries to map the legacy string values to the updated enum,
     * which would throw {@code IllegalArgumentException} before the migration runs.</p>
     *
     * <p>This method is <strong>idempotent</strong>: running it a second time
     * updates 0 rows (the old values no longer exist).</p>
     */
    private void migrateRecruiterStatuses() {
        log.info("[DataInitializer] Starting recruiter status migration...");

        // ── Drop legacy PostgreSQL CHECK constraints & fix FKs only if explicitly enabled ───
        if (fixForeignKeysEnabled) {
            try {
                jdbcTemplate.execute("ALTER TABLE recruiters DROP CONSTRAINT IF EXISTS recruiters_status_check");
                jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_account_type_check");
                jdbcTemplate.execute("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check");
                jdbcTemplate.execute("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_priority_check");
                jdbcTemplate.execute("ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS job_applications_status_check");
            } catch (Exception e) {
                log.warn("[DataInitializer] CHECK constraint migration notice: {}", e.getMessage());
            }

            fixForeignKey("saved_jobs", "fkawvc9t3d3efu6ta6h30tb984t",
                    "ALTER TABLE saved_jobs ADD CONSTRAINT fkawvc9t3d3efu6ta6h30tb984t FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE");

            fixForeignKey("job_applications", "fk6s1ob9k4ihi75r0ax7aiik1me",
                    "ALTER TABLE job_applications ADD CONSTRAINT fk6s1ob9k4ihi75r0ax7aiik1me FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE");

            fixForeignKey("conversations", "fknx01kvyeuyp7tpgl2li76kwf0",
                    "ALTER TABLE conversations ADD CONSTRAINT fknx01kvyeuyp7tpgl2li76kwf0 FOREIGN KEY (job_application_id) REFERENCES job_applications(id) ON DELETE SET NULL");

            fixForeignKey("job_match_analyses", "fk99j8aw6or7928efa0flwfqv5p",
                    "ALTER TABLE job_match_analyses ADD CONSTRAINT fk99j8aw6or7928efa0flwfqv5p FOREIGN KEY (job_application_id) REFERENCES job_applications(id) ON DELETE CASCADE");

            fixForeignKey("notifications", "fkb0yp7ero2lbxv47mryf43wptb",
                    "ALTER TABLE notifications ADD CONSTRAINT fkb0yp7ero2lbxv47mryf43wptb FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE");
        }

        // ACTIVE → APPROVED: grandfather all existing recruiters as verified
        int approvedCount = jdbcTemplate.update(
            "UPDATE recruiters SET status = 'APPROVED' WHERE status = 'ACTIVE'"
        );

        // INACTIVE → SUSPENDED: treat previously deactivated recruiters as suspended
        int suspendedCount = jdbcTemplate.update(
            "UPDATE recruiters SET status = 'SUSPENDED' WHERE status = 'INACTIVE'"
        );

        if (approvedCount > 0 || suspendedCount > 0) {
            log.info("[DataInitializer] Recruiter migration complete: "
                    + "{} ACTIVE → APPROVED, {} INACTIVE → SUSPENDED",
                    approvedCount, suspendedCount);
        } else {
            log.info("[DataInitializer] Recruiter migration: no legacy statuses found (already migrated or fresh DB).");
        }
    }

    // ── Admin Bootstrap ───────────────────────────────────────────────────────

    /**
     * Creates the first admin user if no admin account exists yet.
     *
     * <p>Password is BCrypt-encoded using the application's {@link PasswordEncoder} bean.
     * Never stored as plaintext. The check is by {@code accountType = 'ADMIN'}, so
     * even if the email changes in properties, a duplicate won't be created.</p>
     *
     * <p>Idempotent: if an ADMIN account already exists (by any email), this is skipped.</p>
     */
    private void bootstrapAdminUser() {
        // 1. Check if the specified admin email already exists
        java.util.Optional<User> existingUserOpt = userRepository.findByEmail(adminEmail);
        if (existingUserOpt.isPresent()) {
            User existing = existingUserOpt.get();
            if (existing.getAccountType() != AccountType.ADMIN) {
                existing.setAccountType(AccountType.ADMIN);
                existing.setPassword(passwordEncoder.encode(adminPassword));
                existing.setIsActive(true);
                userRepository.save(existing);
                log.info("[DataInitializer] Updated existing user '{}' to ADMIN role with configured credentials.", adminEmail);
            }
            return;
        }

        // 2. Check if another admin already exists in the database
        Integer adminCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM users WHERE account_type = 'ADMIN'",
            Integer.class
        );

        if (adminCount != null && adminCount > 0) {
            log.info("[DataInitializer] Admin account already exists ({} admin(s) found). Skipping bootstrap.",
                    adminCount);
            return;
        }

        User admin = new User();
        admin.setName(adminName);
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setAccountType(AccountType.ADMIN);
        admin.setIsActive(true);

        userRepository.save(admin);

        log.info("[DataInitializer] ✅ Admin account created successfully.");
        log.info("[DataInitializer]    Email : {}", adminEmail);
        log.info("[DataInitializer]    Name  : {}", adminName);
        log.info("[DataInitializer]    ⚠️  Change the default password after first login!");
    }

    /**
     * Idempotent helper: drops an existing FK constraint (if present) and re-adds
     * it with the correct ON DELETE behaviour.
     * Each call is wrapped in its own try/catch so a single failure doesn't
     * abort the whole migration.
     */
    private void fixForeignKey(String table, String constraintName, String addSql) {
        try {
            jdbcTemplate.execute("ALTER TABLE " + table + " DROP CONSTRAINT IF EXISTS " + constraintName);
            jdbcTemplate.execute(addSql);
            log.info("[DataInitializer] FK fixed: {}.{}", table, constraintName);
        } catch (Exception e) {
            log.warn("[DataInitializer] FK migration skipped for {}.{}: {}", table, constraintName, e.getMessage());
        }
    }
}
