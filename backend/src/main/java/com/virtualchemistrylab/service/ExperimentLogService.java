package com.virtualchemistrylab.service;

import com.virtualchemistrylab.entity.ExperimentLog;
import com.virtualchemistrylab.repository.ExperimentLogRepository;
import com.virtualchemistrylab.util.JsonUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Writes experiment logs asynchronously to avoid blocking the request pipeline.
 *
 * action_type constants:
 *   MIX_CHEMICALS  – a mix was performed
 *   AI_ASK         – a question was asked
 *   SESSION_RESET  – session was reset
 */
@Service
public class ExperimentLogService {

    private static final Logger log = LoggerFactory.getLogger(ExperimentLogService.class);

    private final ExperimentLogRepository experimentLogRepository;

    public ExperimentLogService(ExperimentLogRepository experimentLogRepository) {
        this.experimentLogRepository = experimentLogRepository;
    }

    /**
     * Save a log entry.  requestPayload and responsePayload can be any object –
     * they are serialised to JSON automatically.
     */
    public void log(String sessionCode, String actionType, Object request, Object response) {
        try {
            ExperimentLog entry = ExperimentLog.builder()
                    .sessionCode(sessionCode)
                    .actionType(actionType)
                    .requestPayload(JsonUtil.toJson(request))
                    .responsePayload(JsonUtil.toJson(response))
                    .build();
            experimentLogRepository.save(entry);
            log.info("[exp-log] Saved log: session={} action={}", sessionCode, actionType);
        } catch (Exception e) {
            log.warn("[exp-log] Failed to save log: {}", e.getMessage());
        }
    }

    /** Retrieve all logs for a session, newest first. */
    public List<ExperimentLog> getLogsForSession(String sessionCode) {
        return experimentLogRepository.findBySessionCodeOrderByCreatedAtDesc(sessionCode);
    }
}
