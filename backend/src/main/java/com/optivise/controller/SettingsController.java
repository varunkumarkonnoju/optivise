package com.optivise.controller;

import com.optivise.model.UserSettings;
import com.optivise.repository.UserSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @Autowired private UserSettingsRepository settingsRepo;

    @GetMapping
    public ResponseEntity<UserSettings> getSettings(Principal principal) {
        UserSettings settings = settingsRepo.findByEmail(principal.getName())
                .orElseGet(() -> {
                    UserSettings s = new UserSettings();
                    s.setEmail(principal.getName());
                    return settingsRepo.save(s);
                });
        return ResponseEntity.ok(settings);
    }

    @PutMapping
    public ResponseEntity<UserSettings> updateSettings(
            @RequestBody Map<String, Object> body, Principal principal) {
        UserSettings settings = settingsRepo.findByEmail(principal.getName())
                .orElseGet(() -> {
                    UserSettings s = new UserSettings();
                    s.setEmail(principal.getName());
                    return s;
                });

        if (body.containsKey("emailNotifications"))
            settings.setEmailNotifications((Boolean) body.get("emailNotifications"));
        if (body.containsKey("weeklyReport"))
            settings.setWeeklyReport((Boolean) body.get("weeklyReport"));
        if (body.containsKey("lowStockAlerts"))
            settings.setLowStockAlerts((Boolean) body.get("lowStockAlerts"));
        if (body.containsKey("newOrderAlerts"))
            settings.setNewOrderAlerts((Boolean) body.get("newOrderAlerts"));
        if (body.containsKey("aiSuggestions"))
            settings.setAiSuggestions((Boolean) body.get("aiSuggestions"));
        if (body.containsKey("theme"))
            settings.setTheme((String) body.get("theme"));
        if (body.containsKey("language"))
            settings.setLanguage((String) body.get("language"));
        if (body.containsKey("currency"))
            settings.setCurrency((String) body.get("currency"));
        if (body.containsKey("timezone"))
            settings.setTimezone((String) body.get("timezone"));

        return ResponseEntity.ok(settingsRepo.save(settings));
    }
}