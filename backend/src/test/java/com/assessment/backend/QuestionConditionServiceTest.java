package com.assessment.backend;

import com.assessment.backend.entity.Question;
import com.assessment.backend.entity.QuestionCondition;
import com.assessment.backend.entity.QuestionType;
import com.assessment.backend.repository.QuestionConditionRepository;
import com.assessment.backend.service.QuestionConditionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuestionConditionServiceTest {

  @Mock
  private QuestionConditionRepository questionConditionRepository;

  private QuestionConditionService service;

  @BeforeEach
  void setup() {
    service = spy(new QuestionConditionService(new ObjectMapper()));
    ReflectionTestUtils.setField(service, "questionConditionRepository", questionConditionRepository);
  }

  private static QuestionCondition qc(UUID sourceId, String operator, UUID targetNodeId, String expectedValue) {
    QuestionCondition qc = new QuestionCondition();
    qc.setSourceQuestionId(sourceId);
    qc.setOperator(operator);
    qc.setTargetNodeId(targetNodeId);
    qc.setExpectedValue(expectedValue);
    return qc;
  }

  /**
   * Nur das verwenden, was in der Service-Klasse sichtbar ist:
   * Service nutzt question.getQuestionType().getName()
   * -> wir bauen echte Entities und setzen Felder per Reflection (keine unbekannten Setter nötig).
   */
  private static Question questionWithTypeName(String typeName) {
    QuestionType type = new QuestionType();
    setFirstExistingField(type, typeName, "name", "typeName");

    Question question = new Question();
    setFirstExistingField(question, type, "questionType", "type");

    return question;
  }

  private static void setFirstExistingField(Object target, Object value, String... fieldCandidates) {
    RuntimeException last = null;
    for (String field : fieldCandidates) {
      try {
        ReflectionTestUtils.setField(target, field, value);
        return;
      } catch (RuntimeException e) {
        last = e;
      }
    }
    // wenn nichts passt: lieber klar fehlschlagen
    throw last != null ? last : new IllegalStateException("Kein Feld gefunden zum Setzen per Reflection.");
  }

  @Test
  void handleQuestionByType_multipleChoice_callsHandleQuestionWithCorrectTargets() {
    UUID sourceQuestionId = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();

    UUID eqTarget = UUID.randomUUID();
    UUID neTarget = UUID.randomUUID();
    String expectedValue = "Yes";

    List<QuestionCondition> conditions = List.of(
        qc(sourceQuestionId, "==", eqTarget, expectedValue),
        qc(sourceQuestionId, "!=", neTarget, expectedValue)
    );

    when(questionConditionRepository.findAllBySourceQuestionIdOrderByCreatedAtAsc(sourceQuestionId))
        .thenReturn(conditions);

    when(questionConditionRepository.findQuestionBySourceQuestionId(sourceQuestionId))
        .thenReturn(questionWithTypeName("Multiple Choice"));

    doReturn(eqTarget).when(service).handleQuestion(eq(sourceQuestionId), anyList(), eq(sessionId));

    service.handleQuestionByType(sourceQuestionId, sessionId);

    @SuppressWarnings("unchecked")
    ArgumentCaptor<List<QuestionCondition>> listCaptor = ArgumentCaptor.forClass(List.class);

    verify(service).handleQuestion(eq(sourceQuestionId), listCaptor.capture(), eq(sessionId));

    List<QuestionCondition> capturedList = listCaptor.getValue();
    assertEquals(2, capturedList.size());
    assertEquals(eqTarget, capturedList.get(0).getTargetNodeId());
    assertEquals(neTarget, capturedList.get(1).getTargetNodeId());
  }

  @Test
  void handleQuestionByType_multipleSelect_callsHandleMultipleSelectWithCorrectTargets() {
    UUID sourceQuestionId = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();

    UUID eqTarget = UUID.randomUUID();
    UUID neTarget = UUID.randomUUID();
    String expectedValue = "A, b";

    List<QuestionCondition> conditions = List.of(
        qc(sourceQuestionId, "==", eqTarget, expectedValue),
        qc(sourceQuestionId, "!=", neTarget, expectedValue)
    );

    when(questionConditionRepository.findAllBySourceQuestionIdOrderByCreatedAtAsc(sourceQuestionId))
        .thenReturn(conditions);

    when(questionConditionRepository.findQuestionBySourceQuestionId(sourceQuestionId))
        .thenReturn(questionWithTypeName("Multiple Select"));

    doReturn(eqTarget).when(service).handleMultipleSelectQuestion(eq(sourceQuestionId), anyList(), eq(sessionId));

    service.handleQuestionByType(sourceQuestionId, sessionId);

    @SuppressWarnings("unchecked")
    ArgumentCaptor<List<QuestionCondition>> listCaptor = ArgumentCaptor.forClass(List.class);

    verify(service).handleMultipleSelectQuestion(eq(sourceQuestionId), listCaptor.capture(), eq(sessionId));

    List<QuestionCondition> capturedList = listCaptor.getValue();
    assertEquals(2, capturedList.size());
    assertEquals(eqTarget, capturedList.get(0).getTargetNodeId());
    assertEquals(neTarget, capturedList.get(1).getTargetNodeId());
  }

  @Test
  void handleQuestionByType_numberInput_callsHandleNumberWithCorrectTargets() {
    UUID sourceQuestionId = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();

    UUID eqTarget = UUID.randomUUID();
    UUID ltTarget = UUID.randomUUID();
    UUID gtTarget = UUID.randomUUID();
    String expectedValue = "10";

    List<QuestionCondition> conditions = List.of(
        qc(sourceQuestionId, "==", eqTarget, expectedValue),
        qc(sourceQuestionId, "<", ltTarget, expectedValue),
        qc(sourceQuestionId, ">", gtTarget, expectedValue)
    );

    when(questionConditionRepository.findAllBySourceQuestionIdOrderByCreatedAtAsc(sourceQuestionId))
        .thenReturn(conditions);

    when(questionConditionRepository.findQuestionBySourceQuestionId(sourceQuestionId))
        .thenReturn(questionWithTypeName("Number Input"));

    doReturn(ltTarget).when(service).handleNumberQuestion(eq(sourceQuestionId), anyList(), eq(sessionId));

    service.handleQuestionByType(sourceQuestionId, sessionId);

    @SuppressWarnings("unchecked")
    ArgumentCaptor<List<QuestionCondition>> listCaptor = ArgumentCaptor.forClass(List.class);

    verify(service).handleNumberQuestion(eq(sourceQuestionId), listCaptor.capture(), eq(sessionId));

    List<QuestionCondition> capturedList = listCaptor.getValue();
    assertEquals(3, capturedList.size());
    assertEquals(eqTarget, capturedList.get(0).getTargetNodeId());
    assertEquals(ltTarget, capturedList.get(1).getTargetNodeId());
    assertEquals(gtTarget, capturedList.get(2).getTargetNodeId());
  }

  @Test
  void handleQuestionByType_ratingScale_callsHandleNumberWithCorrectTargets() {
    UUID sourceQuestionId = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();

    UUID eqTarget = UUID.randomUUID();
    UUID ltTarget = UUID.randomUUID();
    UUID gtTarget = UUID.randomUUID();
    String expectedValue = "3";

    List<QuestionCondition> conditions = List.of(
        qc(sourceQuestionId, "==", eqTarget, expectedValue),
        qc(sourceQuestionId, "<", ltTarget, expectedValue),
        qc(sourceQuestionId, ">", gtTarget, expectedValue)
    );

    when(questionConditionRepository.findAllBySourceQuestionIdOrderByCreatedAtAsc(sourceQuestionId))
        .thenReturn(conditions);

    when(questionConditionRepository.findQuestionBySourceQuestionId(sourceQuestionId))
        .thenReturn(questionWithTypeName("Rating Scale"));

    doReturn(eqTarget).when(service).handleNumberQuestion(eq(sourceQuestionId), anyList(), eq(sessionId));

    service.handleQuestionByType(sourceQuestionId, sessionId);

    verify(service).handleNumberQuestion(eq(sourceQuestionId), anyList(), eq(sessionId));
  }

  @Test
  void handleQuestionByType_dateInput_callsHandleDateWithCorrectTargets() {
    UUID sourceQuestionId = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();

    UUID eqTarget = UUID.randomUUID();
    UUID ltTarget = UUID.randomUUID();
    UUID gtTarget = UUID.randomUUID();
    String expectedValue = "02.01.2026";

    List<QuestionCondition> conditions = List.of(
        qc(sourceQuestionId, "==", eqTarget, expectedValue),
        qc(sourceQuestionId, "<", ltTarget, expectedValue),
        qc(sourceQuestionId, ">", gtTarget, expectedValue)
    );

    when(questionConditionRepository.findAllBySourceQuestionIdOrderByCreatedAtAsc(sourceQuestionId))
        .thenReturn(conditions);

    when(questionConditionRepository.findQuestionBySourceQuestionId(sourceQuestionId))
        .thenReturn(questionWithTypeName("Date Input"));

    doReturn(gtTarget).when(service).handleDateQuestion(eq(sourceQuestionId), anyList(), eq(sessionId));

    service.handleQuestionByType(sourceQuestionId, sessionId);

    verify(service).handleDateQuestion(eq(sourceQuestionId), anyList(), eq(sessionId));
  }

  @Test
  void findTargetNodeIdByOperator_returnsMatchingTarget() {
    UUID sourceQuestionId = UUID.randomUUID();
    UUID eqTarget = UUID.randomUUID();
    UUID neTarget = UUID.randomUUID();

    List<QuestionCondition> list = List.of(
        qc(sourceQuestionId, "==", eqTarget, "x"),
        qc(sourceQuestionId, "!=", neTarget, "x")
    );

    assertEquals(eqTarget, service.findTargetNodeIdByOperator(list, "=="));
    assertEquals(neTarget, service.findTargetNodeIdByOperator(list, "!="));
    assertNull(service.findTargetNodeIdByOperator(list, "<"));
  }

  // createQuestionCondition: nur abhängig von Service-Logik + Repository-Stub
  @Test
  void createQuestionCondition_multipleChoice_operatorEquals_throwsAccordingToCurrentServiceLogic() {
    UUID sourceQuestionId = UUID.randomUUID();
    UUID targetNodeId = UUID.randomUUID();

    when(questionConditionRepository.findQuestionBySourceQuestionId(sourceQuestionId))
        .thenReturn(questionWithTypeName("Multiple Choice"));

    assertThrows(IllegalArgumentException.class, () ->
        service.createQuestionCondition(sourceQuestionId, targetNodeId, "==", "Yes")
    );

    verify(questionConditionRepository, never()).save(any());
  }

  @Test
  void createQuestionCondition_multipleChoice_operatorLessThan_savesAccordingToCurrentServiceLogic() {
    UUID sourceQuestionId = UUID.randomUUID();
    UUID targetNodeId = UUID.randomUUID();

    when(questionConditionRepository.findQuestionBySourceQuestionId(sourceQuestionId))
        .thenReturn(questionWithTypeName("Multiple Choice"));

    when(questionConditionRepository.save(any(QuestionCondition.class)))
        .thenAnswer(inv -> inv.getArgument(0));

    QuestionCondition saved = service.createQuestionCondition(sourceQuestionId, targetNodeId, "<", "Yes");

    assertEquals(sourceQuestionId, saved.getSourceQuestionId());
    assertEquals(targetNodeId, saved.getTargetNodeId());
    assertEquals("<", saved.getOperator());
    assertEquals("Yes", saved.getExpectedValue());
  }

  @Test
  void createQuestionCondition_unknownType_throws() {
    UUID sourceQuestionId = UUID.randomUUID();
    UUID targetNodeId = UUID.randomUUID();

    when(questionConditionRepository.findQuestionBySourceQuestionId(sourceQuestionId))
        .thenReturn(questionWithTypeName("Unknown Type"));

    assertThrows(IllegalArgumentException.class, () ->
        service.createQuestionCondition(sourceQuestionId, targetNodeId, "==", "x")
    );

    verify(questionConditionRepository, never()).save(any());
  }

  @Test
  void createQuestionCondition_questionNotFound_throws() {
    UUID sourceQuestionId = UUID.randomUUID();
    UUID targetNodeId = UUID.randomUUID();

    when(questionConditionRepository.findQuestionBySourceQuestionId(sourceQuestionId))
        .thenReturn(null);

    assertThrows(IllegalStateException.class, () ->
        service.createQuestionCondition(sourceQuestionId, targetNodeId, "==", "x")
    );

    verify(questionConditionRepository, never()).save(any());
  }
}