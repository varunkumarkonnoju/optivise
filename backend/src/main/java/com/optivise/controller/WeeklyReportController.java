package com.optivise.controller;

import com.optivise.service.WeeklyReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class WeeklyReportController {

    @Autowired
    private WeeklyReportService weeklyReportService;

    @PostMapping("/test")
    public ResponseEntity<?> sendTestReport() {
        try {
            weeklyReportService.sendWeeklyReportsToAllUsers();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Weekly reports sent to all users!"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}