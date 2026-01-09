package com.assessment.backend.security.reset;

import com.assessment.backend.security.reset.dto.ResetRequestDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.assessment.backend.security.reset.dto.ResetVerifyDto;
import java.util.UUID;
import com.assessment.backend.security.reset.dto.ResetConfirmDto;


import java.util.Map;

@RestController
@RequestMapping("/auth/password-reset")
public class PasswordResetSmsController {

  private final PasswordResetSmsService service;

  public PasswordResetSmsController(PasswordResetSmsService service) {
    this.service = service;
  }

  @PostMapping("/sms/request")
  public ResponseEntity<?> request(@Valid @RequestBody ResetRequestDto dto) {
    service.requestCode(dto.phone());

    // Immer neutral antworten (nicht verraten, ob Nummer existiert)
    return ResponseEntity.ok(Map.of(
        "message", "Wenn die Nummer existiert, wurde ein Code gesendet."
    ));
  }
  @PostMapping("/sms/verify")
public Map<String, Object> verify(@Valid @RequestBody ResetVerifyDto dto) {
  UUID requestId = service.verifyCode(dto.phone(), dto.code());
  return Map.of("requestId", requestId.toString());
}
@PostMapping("/sms/confirm")
public ResponseEntity<?> confirm(@Valid @RequestBody ResetConfirmDto dto) {
  service.confirm(dto.requestId(), dto.newPassword());
  return ResponseEntity.ok().build();
}


}
