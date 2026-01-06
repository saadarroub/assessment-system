package com.assessment.backend.controller;

import com.assessment.backend.dto.QuestionConditionDTO;
import com.assessment.backend.service.QuestionConditionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/question-condition")
public class QuestionConditionController {

  @Autowired
  private QuestionConditionService questionConditionService;

  // Endpoint zum Erstellen oder Aktualisieren einer QuestionCondition
  // AKTUELL (manuell testen über URL):
  @PostMapping("/handle/{sourceQuestionId}/{sessionId}")
  public ResponseEntity<String> handleQuestionCondition(
      @PathVariable UUID sourceQuestionId,
      @PathVariable UUID sessionId,
      @RequestBody HandleRequest requestBody
  ) {
    try {
      questionConditionService.handleQuestionByType(
          sourceQuestionId,
          sessionId,
          requestBody.getExpectedValue(),
          requestBody.getTarget()
      );
      return ResponseEntity.ok("QuestionCondition erfolgreich verarbeitet.");
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body("Interner Fehler: " + e.getMessage());
    }
  }

  // ZUKUNFT (automatisch über Header, nur aktivieren wenn Frontend Header sendet):
// @PostMapping("/handle")
// public ResponseEntity<String> handleQuestionCondition(
//     @RequestHeader("X-Question-Id") UUID sourceQuestionId,
//     @RequestHeader("X-Session-Id") UUID sessionId,
//     @RequestBody HandleRequest requestBody
// ) {
//   try {
//     questionConditionService.handleQuestionByType(
//         sourceQuestionId,
//         sessionId,
//         requestBody.getExpectedValue(),
//         requestBody.getTarget()
//     );
//     return ResponseEntity.ok("QuestionCondition erfolgreich verarbeitet.");
//   } catch (IllegalArgumentException e) {
//     return ResponseEntity.badRequest().body(e.getMessage());
//   } catch (Exception e) {
//     return ResponseEntity.internalServerError().body("Interner Fehler: " + e.getMessage());
//   }
// }

  // Endpoint zum Laden einer QuestionCondition
  // AKTUELL (manuell testen über URL):
  @GetMapping("/{sourceQuestionId}/{sessionId}")
  public ResponseEntity<QuestionConditionDTO> getQuestionCondition(
      @PathVariable UUID sourceQuestionId,
      @PathVariable UUID sessionId
  ) {
    try {
      var qc = questionConditionService.createOrLoadQuestionCondition(sourceQuestionId, sessionId);
      return ResponseEntity.ok(new QuestionConditionDTO(
          qc.getId(),
          qc.getSourceQuestionId(),
          qc.getTargetNodeId(),
          qc.getOperator(),
          qc.getExpectedValue(),
          qc.getSessionId(),
          qc.getCreatedAt()
      ));
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }

  // ZUKUNFT (automatisch über Header, nur aktivieren wenn Frontend Header sendet):
  // @GetMapping
// public ResponseEntity<QuestionConditionDTO> getQuestionCondition(
//     @RequestHeader("X-Question-Id") UUID sourceQuestionId,
//     @RequestHeader("X-Session-Id") UUID sessionId
// ) {
//   try {
//     var qc = questionConditionService.createOrLoadQuestionCondition(sourceQuestionId, sessionId);
//     return ResponseEntity.ok(new QuestionConditionDTO(
//         qc.getId(),
//         qc.getSourceQuestionId(),
//         qc.getTargetNodeId(),
//         qc.getOperator(),
//         qc.getExpectedValue(),
//         qc.getSessionId(),
//         qc.getCreatedAt()
//     ));
//   } catch (Exception e) {
//     return ResponseEntity.internalServerError().build();
//   }
// }

  // RequestBody-Klasse für POST
  public static class HandleRequest {
    private String expectedValue;
    private Map<String, UUID> target;

    public String getExpectedValue() {
      return expectedValue;
    }

    public void setExpectedValue(String expectedValue) {
      this.expectedValue = expectedValue;
    }

    public Map<String, UUID> getTarget() {
      return target;
    }

    public void setTarget(Map<String, UUID> target) {
      this.target = target;
    }
  }
}