package com.optivise.controller;

import com.optivise.dto.SuggestionDTO;
import com.optivise.model.AiSuggestion;
import com.optivise.model.User;
import com.optivise.repository.AiSuggestionRepository;
import com.optivise.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/suggestions")
public class SuggestionController {

    @Autowired private AiSuggestionRepository repo;
    @Autowired private UserRepository userRepo;

    @GetMapping
    public ResponseEntity<List<SuggestionDTO>> getAll(Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        return ResponseEntity.ok(
                repo.findByShopOrderByCreatedAtDesc(user.getShopDomain())
                        .stream().map(this::toDTO).collect(Collectors.toList())
        );
    }

    @PutMapping("/{id}/apply")
    public ResponseEntity<SuggestionDTO> apply(@PathVariable Long id) {
        AiSuggestion s = repo.findById(id).orElseThrow();
        s.setApplied(true);
        return ResponseEntity.ok(toDTO(repo.save(s)));
    }

    private SuggestionDTO toDTO(AiSuggestion s) {
        SuggestionDTO dto = new SuggestionDTO();
        dto.setId(s.getId());
        dto.setTitle(s.getTitle());
        dto.setDescription(s.getDescription());
        dto.setImpact(s.getImpact());
        dto.setCategory(s.getCategory());
        dto.setApplied(s.getApplied());
        dto.setCreatedAt(s.getCreatedAt());
        return dto;
    }
}