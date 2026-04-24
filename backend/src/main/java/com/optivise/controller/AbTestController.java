package com.optivise.controller;

import com.optivise.dto.AbTestDTO;
import com.optivise.dto.CreateAbTestRequest;
import com.optivise.model.AbTest;
import com.optivise.model.User;
import com.optivise.repository.AbTestRepository;
import com.optivise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/abtests")
@RequiredArgsConstructor
public class AbTestController {

    private final AbTestRepository repo;
    private final UserRepository userRepo;

    @GetMapping
    public ResponseEntity<List<AbTestDTO>> getAll(Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        return ResponseEntity.ok(
            repo.findByShopOrderByStartedAtDesc(user.getShopDomain())
                .stream().map(this::toDTO).collect(Collectors.toList())
        );
    }

    @PostMapping
    public ResponseEntity<AbTestDTO> create(@RequestBody CreateAbTestRequest req, Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        AbTest test = AbTest.builder()
                .shop(user.getShopDomain()).name(req.getName())
                .elementType(req.getElementType()).status("running")
                .variantALabel(req.getVariantALabel()).variantBLabel(req.getVariantBLabel())
                .variantAConversion(0.0).variantBConversion(0.0)
                .variantATraffic(50).variantBTraffic(50)
                .insight("Test just started. Check back in 24 hours.").build();
        return ResponseEntity.ok(toDTO(repo.save(test)));
    }

    @PutMapping("/{id}/pause")
    public ResponseEntity<AbTestDTO> pause(@PathVariable Long id) {
        AbTest test = repo.findById(id).orElseThrow();
        test.setStatus("paused");
        return ResponseEntity.ok(toDTO(repo.save(test)));
    }

    @PutMapping("/{id}/resume")
    public ResponseEntity<AbTestDTO> resume(@PathVariable Long id) {
        AbTest test = repo.findById(id).orElseThrow();
        test.setStatus("running");
        return ResponseEntity.ok(toDTO(repo.save(test)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private AbTestDTO toDTO(AbTest t) {
        return AbTestDTO.builder()
                .id(t.getId()).name(t.getName()).status(t.getStatus())
                .elementType(t.getElementType()).variantALabel(t.getVariantALabel())
                .variantBLabel(t.getVariantBLabel()).variantAConversion(t.getVariantAConversion())
                .variantBConversion(t.getVariantBConversion()).variantATraffic(t.getVariantATraffic())
                .variantBTraffic(t.getVariantBTraffic()).winner(t.getWinner())
                .insight(t.getInsight()).startedAt(t.getStartedAt()).build();
    }
}
