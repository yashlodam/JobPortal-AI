package com.jobportal.mapper;

import org.springframework.stereotype.Component;

import com.jobportal.dto.response.NotificationResponse;
import com.jobportal.entity.Notification;

/**
 * Dedicated mapper between {@link Notification} entity and {@link NotificationResponse} DTO.
 *
 * <h3>Why a dedicated mapper?</h3>
 * <p>Mapping was previously inline in {@code NotificationServiceImpl.toResponse()}.
 * Extracting it here follows Single Responsibility — the service focuses on
 * business logic, the mapper focuses on data transformation. The mapper is
 * also independently unit-testable.</p>
 *
 * <h3>Lazy-loading safety</h3>
 * <p>This mapper only accesses scalar fields on the {@code Notification} entity.
 * It does NOT access {@code notification.getRecipient()} (lazy {@code @ManyToOne}).
 * All callers must ensure the mapper is invoked within an open Hibernate session
 * (i.e. inside a {@code @Transactional} method) so that {@code createdAt} /
 * {@code updatedAt} from the {@code Auditable} superclass are accessible.
 * Since notification queries are scoped by recipient_id, the recipient itself
 * is never needed in the response — no N+1 risk.</p>
 */
@Component
public class NotificationMapper {

    /**
     * Maps a {@link Notification} entity to a {@link NotificationResponse} DTO.
     *
     * @param n the entity (must be within an open session)
     * @return populated response DTO
     */
    public NotificationResponse toResponse(Notification n) {
        NotificationResponse dto = new NotificationResponse();
        dto.setId(n.getId());
        dto.setType(n.getType());
        dto.setPriority(n.getPriority());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setActionUrl(n.getActionUrl());
        dto.setImage(n.getImage());
        dto.setIcon(n.getIcon());
        dto.setReferenceId(n.getReferenceId());
        dto.setReferenceType(n.getReferenceType());
        dto.setRead(n.isRead());
        dto.setArchived(n.isArchived());
        dto.setCreatedAt(n.getCreatedAt());
        dto.setUpdatedAt(n.getUpdatedAt());
        dto.setExpiresAt(n.getExpiresAt());
        return dto;
    }
}
