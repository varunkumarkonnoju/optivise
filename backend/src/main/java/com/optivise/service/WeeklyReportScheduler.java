package com.optivise.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class WeeklyReportScheduler {

    private static final Logger log = LoggerFactory.getLogger(WeeklyReportScheduler.class);

    @Autowired
    private WeeklyReportService weeklyReportService;

    // Every Monday at 8:00 AM UTC
    @Scheduled(cron = "0 0 8 * * MON")
    public void sendWeeklyReports() {
        log.info("Weekly report scheduler triggered");
        weeklyReportService.sendWeeklyReportsToAllUsers();
    }

}