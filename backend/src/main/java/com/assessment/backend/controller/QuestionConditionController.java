package com.assessment.backend.controller;

import com.assessment.backend.dto.QuestionConditionDTO;
import com.assessment.backend.entity.QuestionCondition;
import com.assessment.backend.service.QuestionConditionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/question-condition")
public class QuestionConditionController {

  @Autowired
  private QuestionConditionService questionConditionService;

  @PostMapping("/create/{sourceQuestionId}")
  public ResponseEntity<String> createQuestionCondition(
      @PathVariable UUID sourceQuestionId,
      @RequestBody HandleRequest requestBody
  ) {
    try {
      questionConditionService.createQuestionCondition(
          sourceQuestionId,
          requestBody.getTargetNodeId(),
          requestBody.getOperator(),
          requestBody.getExpectedValue()
      );
      return ResponseEntity.ok("QuestionCondition erfolgreich erstellt.");
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body("Interner Fehler: " + e.getMessage());
    }
  }

// ZUKUNFT (sourceQuestionId kommt über Header, nur aktivieren wenn Frontend Header sendet)

// @PostMapping("/create")
// public ResponseEntity<String> createQuestionCondition(
//     @RequestHeader("X-Question-Id") UUID sourceQuestionId,
//     @RequestBody HandleRequest requestBody
// ) {
//   try {
//     questionConditionService.createQuestionCondition(
//         sourceQuestionId,
//         requestBody.getTargetNodeId(),
//         requestBody.getOperator(),
//         requestBody.getExpectedValue()
//     );
//     return ResponseEntity.ok("QuestionCondition erfolgreich erstellt.");
//   } catch (IllegalArgumentException e) {
//     return ResponseEntity.badRequest().body(e.getMessage());
//   } catch (Exception e) {
//     return ResponseEntity.internalServerError().body("Interner Fehler: " + e.getMessage());
//   }
// }

  // Endpoint zum Erstellen oder Aktualisieren einer QuestionCondition
  // AKTUELL (manuell testen über URL):
  @PostMapping("/handle/{sourceQuestionId}/{sessionId}")
  public ResponseEntity<String> handleQuestionCondition(
      @PathVariable UUID sourceQuestionId,
      @PathVariable UUID sessionId)
       {
    try {
      UUID nextNodeId = questionConditionService.handleQuestionByType(sourceQuestionId, sessionId);
      return ResponseEntity.ok("QuestionCondition erfolgreich verarbeitet." + "Der nächste " +
          "Zielknoten lautet:" + nextNodeId);
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
//     @RequestHeader("X-Session-Id") UUID sessionId
// ) {
//   try {
//     UUID nextNodeId = questionConditionService.handleQuestionByType(sourceQuestionId, sessionId);
//     return ResponseEntity.ok("QuestionCondition erfolgreich verarbeitet." + "Der nächste " +
//         "Zielknoten lautet:" + nextNodeId);
//   } catch (IllegalArgumentException e) {
//     return ResponseEntity.badRequest().body(e.getMessage());
//   } catch (Exception e) {
//     return ResponseEntity.internalServerError().body("Interner Fehler: " + e.getMessage());
//   }
// }
  // Endpoint zum Laden einer QuestionCondition
  // AKTUELL (manuell testen über URL):
  @GetMapping("/{sourceQuestionId}")
  public ResponseEntity<List<QuestionConditionDTO>> getQuestionCondition(
      @PathVariable UUID sourceQuestionId
  ) {
    try {
      List<QuestionCondition> qcList = questionConditionService.loadQuestionCondition(sourceQuestionId);

      if (qcList == null || qcList.isEmpty()) {
        return ResponseEntity.notFound().build();
      }

      List<QuestionConditionDTO> dtoList = qcList.stream()
          .map(qc -> new QuestionConditionDTO(
              qc.getId(),
              qc.getSourceQuestionId(),
              qc.getTargetNodeId(),
              qc.getOperator(),
              qc.getExpectedValue(),
              qc.getCreatedAt()
          ))
          .toList();

      return ResponseEntity.ok(dtoList);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }

  // ZUKUNFT (automatisch über Header, nur aktivieren wenn Frontend Header sendet):

// @GetMapping
// public ResponseEntity<List<QuestionConditionDTO>> getQuestionCondition(
//     @RequestHeader("X-Question-Id") UUID sourceQuestionId
// ) {
//   try {
//     List<QuestionCondition> qcList = questionConditionService.loadQuestionCondition(sourceQuestionId);
//
//     if (qcList == null || qcList.isEmpty()) {
//       return ResponseEntity.notFound().build();
//     }
//
//     List<QuestionConditionDTO> dtoList = qcList.stream()
//         .map(qc -> new QuestionConditionDTO(
//             qc.getId(),
//             qc.getSourceQuestionId(),
//             qc.getTargetNodeId(),
//             qc.getOperator(),
//             qc.getExpectedValue(),
//             qc.getCreatedAt()
//         ))
//         .toList();
//
//     return ResponseEntity.ok(dtoList);
//   } catch (Exception e) {
//     return ResponseEntity.internalServerError().build();
//   }
// }

  @PutMapping("/update/{sourceQuestionId}/{operator}/{expectedValue}")
  //@PreAuthorize("hasAuthority('questionCondition.edit')")
  public ResponseEntity<String> updateQuestionCondition(@PathVariable UUID sourceQuestionId,
                                                        @PathVariable String operator,
                                                        @PathVariable String expectedValue){

    try {

      questionConditionService.updateQuestionConditionEntity(sourceQuestionId, operator,expectedValue);

      return ResponseEntity.ok("QuestionCondition erfolgreich aktualisiert.");
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body("Interner Fehler: " + e.getMessage());
    }

  }

  // ZUKUNFT (automatisch über Header, expectedValue kommt aus Body, nur aktivieren wenn Frontend Header sendet):

// @PutMapping("/update")
// public ResponseEntity<String> updateQuestionCondition(
//     @RequestHeader("X-Question-Id") UUID sourceQuestionId,
//     @RequestHeader("X-Operator") String operator,
//     @RequestBody UpdateRequest requestBody
// ) {
//   try {
//     questionConditionService.updateQuestionConditionEntity(sourceQuestionId, operator, requestBody.getExpectedValue());
//     return ResponseEntity.ok("QuestionCondition erfolgreich aktualisiert.");
//   } catch (IllegalArgumentException e) {
//     return ResponseEntity.badRequest().body(e.getMessage());
//   } catch (Exception e) {
//     return ResponseEntity.internalServerError().body("Interner Fehler: " + e.getMessage());
//   }
// }

  @DeleteMapping("/deleteOne/{sourceQuestionId}/{operator}")
  //@PreAuthorize("hasAuthority('questionCondition.delete')")
  public ResponseEntity<String> deleteOneQuestionCondition(@PathVariable UUID sourceQuestionId,
                                                           @PathVariable String operator){
    try {

      questionConditionService.deleteASingleQuestionCondition(sourceQuestionId, operator);

      return ResponseEntity.ok("QuestionCondition erfolgreich gelöscht.");
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body("Interner Fehler: " + e.getMessage());
    }
  }

  // ZUKUNFT (automatisch über Header, alles mitsenden, nur aktivieren wenn Frontend Header sendet):

// @DeleteMapping("/deleteOne")
// public ResponseEntity<String> deleteOneQuestionCondition(
//     @RequestHeader("X-Question-Id") UUID sourceQuestionId,
//     @RequestHeader("X-Operator") String operator
// ) {
//   try {
//     questionConditionService.deleteASingleQuestionCondition(sourceQuestionId, operator);
//     return ResponseEntity.ok("QuestionCondition erfolgreich gelöscht.");
//   } catch (IllegalArgumentException e) {
//     return ResponseEntity.badRequest().body(e.getMessage());
//   } catch (Exception e) {
//     return ResponseEntity.internalServerError().body("Interner Fehler: " + e.getMessage());
//   }
// }

  @DeleteMapping("/deleteAll/{sourceQuestionId}")
  //@PreAuthorize("hasAuthority('questionCondition.delete')")
  public ResponseEntity<String> deleteAllQuestionCondition(@PathVariable UUID sourceQuestionId){
    try {

      questionConditionService.deleteAllQuestionConditions(sourceQuestionId);

      return ResponseEntity.ok("Alle QuestionConditions erfolgreich gelöscht.");
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body("Interner Fehler: " + e.getMessage());
    }

  }

  // @DeleteMapping("/deleteAll")
// public ResponseEntity<String> deleteAllQuestionCondition(
//     @RequestHeader("X-Question-Id") UUID sourceQuestionId
// ) {
//   try {
//     questionConditionService.deleteAllQuestionConditions(sourceQuestionId);
//     return ResponseEntity.ok("Alle QuestionConditions erfolgreich gelöscht.");
//   } catch (IllegalArgumentException e) {
//     return ResponseEntity.badRequest().body(e.getMessage());
//   } catch (Exception e) {
//     return ResponseEntity.internalServerError().body("Interner Fehler: " + e.getMessage());
//   }
// }

  // RequestBody-Klasse für POST
  public static class HandleRequest {
    private String expectedValue;
    private String operator;
    private UUID targetNodeId;
    private Map<String, UUID> target;

    public String getExpectedValue() {
      return expectedValue;
    }

    public String getOperator(){
      return operator;

    }

    public UUID getTargetNodeId() {

      return targetNodeId;

    }


  }
}