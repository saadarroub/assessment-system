package com.assessment.backend;

import com.assessment.backend.entity.Question;
import com.assessment.backend.entity.QuestionCondition;
import com.assessment.backend.entity.QuestionType;
import com.assessment.backend.repository.QuestionConditionRepository;
import com.assessment.backend.service.QuestionConditionService;
import com.assessment.backend.util.JsonbParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.*;

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
    service = new QuestionConditionService(new ObjectMapper());
    ReflectionTestUtils.setField(service, "questionConditionRepository", questionConditionRepository);
  }

  @Test
  void handleQuestionByType_multipleChoice_match_setsEqualTarget() {
    UUID sourceQuestionId = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();
    UUID temporarySessionId = UUID.randomUUID();

    UUID eqTarget = UUID.randomUUID();
    UUID neTarget = UUID.randomUUID();

    QuestionCondition qc = new QuestionCondition();
    qc.setSourceQuestionId(sourceQuestionId);
    qc.setSessionId(temporarySessionId); // wird in loadQuestionCondition auf sessionId gesetzt
    qc.setExpectedValue("Yes");
    qc.setTarget("{\"==\":\"" + eqTarget + "\",\"!=\":\"" + neTarget + "\"}");

    Question question = mock(Question.class);
    QuestionType type = mock(QuestionType.class);

    when(questionConditionRepository.findBySourceQuestionIdAndSessionId(sourceQuestionId, temporarySessionId))
        .thenReturn(qc);
    when(questionConditionRepository.findQuestionBySourceQuestionId(sourceQuestionId))
        .thenReturn(question);
    when(question.getQuestionType()).thenReturn(type);
    when(type.getName()).thenReturn("Multiple Choice");
    when(questionConditionRepository.findValueByQuestionIdAndSessionId(sourceQuestionId, sessionId))
        .thenReturn("{\"value\":\"Yes\"}");

    Map<String, UUID> targetMap = new HashMap<>();
    targetMap.put("==", eqTarget);
    targetMap.put("!=", neTarget);

    try (MockedStatic<JsonbParser> mocked = mockStatic(JsonbParser.class)) {
      mocked.when(() -> JsonbParser.readTargetFromDbJson(anyString())).thenReturn(targetMap);
      mocked.when(() -> JsonbParser.parseString(anyString())).thenReturn("yes"); // ignoreCase

      service.handleQuestionByType(sourceQuestionId, sessionId, temporarySessionId);
    }

    ArgumentCaptor<QuestionCondition> captor = ArgumentCaptor.forClass(QuestionCondition.class);
    verify(questionConditionRepository, atLeastOnce()).save(captor.capture());

    QuestionCondition saved = captor.getValue();
    assertEquals(sessionId, saved.getSessionId());
    assertEquals(eqTarget, saved.getTargetNodeId());
  }

  @Test
  void handleQuestionByType_multipleChoice_noMatch_setsNotEqualTarget() {
    UUID sourceQuestionId = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();
    UUID temporarySessionId = UUID.randomUUID();

    UUID eqTarget = UUID.randomUUID();
    UUID neTarget = UUID.randomUUID();

    QuestionCondition qc = new QuestionCondition();
    qc.setSourceQuestionId(sourceQuestionId);
    qc.setSessionId(temporarySessionId);
    qc.setExpectedValue("Yes");
    qc.setTarget("{\"==\":\"" + eqTarget + "\",\"!=\":\"" + neTarget + "\"}");

    Question question = mock(Question.class);
    QuestionType type = mock(QuestionType.class);

    when(questionConditionRepository.findBySourceQuestionIdAndSessionId(sourceQuestionId, temporarySessionId))
        .thenReturn(qc);
    when(questionConditionRepository.findQuestionBySourceQuestionId(sourceQuestionId))
        .thenReturn(question);
    when(question.getQuestionType()).thenReturn(type);
    when(type.getName()).thenReturn("Multiple Choice");
    when(questionConditionRepository.findValueByQuestionIdAndSessionId(sourceQuestionId, sessionId))
        .thenReturn("{\"value\":\"No\"}");

    Map<String, UUID> targetMap = new HashMap<>();
    targetMap.put("==", eqTarget);
    targetMap.put("!=", neTarget);

    try (MockedStatic<JsonbParser> mocked = mockStatic(JsonbParser.class)) {
      mocked.when(() -> JsonbParser.readTargetFromDbJson(anyString())).thenReturn(targetMap);
      mocked.when(() -> JsonbParser.parseString(anyString())).thenReturn("No");

      service.handleQuestionByType(sourceQuestionId, sessionId, temporarySessionId);
    }

    ArgumentCaptor<QuestionCondition> captor = ArgumentCaptor.forClass(QuestionCondition.class);
    verify(questionConditionRepository, atLeastOnce()).save(captor.capture());

    assertEquals(neTarget, captor.getValue().getTargetNodeId());
  }

  @Test
  void handleQuestionByType_multipleSelect_equal_setsEqualTarget() {
    UUID sourceQuestionId = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();
    UUID temporarySessionId = UUID.randomUUID();

    UUID eqTarget = UUID.randomUUID();
    UUID neTarget = UUID.randomUUID();

    QuestionCondition qc = new QuestionCondition();
    qc.setSourceQuestionId(sourceQuestionId);
    qc.setSessionId(temporarySessionId);
    qc.setExpectedValue("A, b");
    qc.setTarget("{\"==\":\"" + eqTarget + "\",\"!=\":\"" + neTarget + "\"}");

    Question question = mock(Question.class);
    QuestionType type = mock(QuestionType.class);

    when(questionConditionRepository.findBySourceQuestionIdAndSessionId(sourceQuestionId, temporarySessionId))
        .thenReturn(qc);
    when(questionConditionRepository.findQuestionBySourceQuestionId(sourceQuestionId))
        .thenReturn(question);
    when(question.getQuestionType()).thenReturn(type);
    when(type.getName()).thenReturn("Multiple Select");
    when(questionConditionRepository.findValueByQuestionIdAndSessionId(sourceQuestionId, sessionId))
        .thenReturn("{\"value\":[\"a\",\"B \"]}");

    Map<String, UUID> targetMap = new HashMap<>();
    targetMap.put("==", eqTarget);
    targetMap.put("!=", neTarget);

    try (MockedStatic<JsonbParser> mocked = mockStatic(JsonbParser.class)) {
      mocked.when(() -> JsonbParser.readTargetFromDbJson(anyString())).thenReturn(targetMap);
      mocked.when(() -> JsonbParser.parseStringSet(anyString()))
          .thenReturn(new HashSet<>(Arrays.asList("a", "B ")));

      service.handleQuestionByType(sourceQuestionId, sessionId, temporarySessionId);
    }

    ArgumentCaptor<QuestionCondition> captor = ArgumentCaptor.forClass(QuestionCondition.class);
    verify(questionConditionRepository, atLeastOnce()).save(captor.capture());

    assertEquals(eqTarget, captor.getValue().getTargetNodeId());
  }

  @Test
  void handleQuestionByType_numberInput_less_setsLessTarget() {
    UUID sourceQuestionId = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();
    UUID temporarySessionId = UUID.randomUUID();

    UUID eqTarget = UUID.randomUUID();
    UUID ltTarget = UUID.randomUUID();
    UUID gtTarget = UUID.randomUUID();

    QuestionCondition qc = new QuestionCondition();
    qc.setSourceQuestionId(sourceQuestionId);
    qc.setSessionId(temporarySessionId);
    qc.setExpectedValue("10");
    qc.setTarget("{\"==\":\"" + eqTarget + "\",\"<\":\"" + ltTarget + "\",\">\":\"" + gtTarget + "\"}");

    Question question = mock(Question.class);
    QuestionType type = mock(QuestionType.class);

    when(questionConditionRepository.findBySourceQuestionIdAndSessionId(sourceQuestionId, temporarySessionId))
        .thenReturn(qc);
    when(questionConditionRepository.findQuestionBySourceQuestionId(sourceQuestionId))
        .thenReturn(question);
    when(question.getQuestionType()).thenReturn(type);
    when(type.getName()).thenReturn("Number Input");
    when(questionConditionRepository.findValueByQuestionIdAndSessionId(sourceQuestionId, sessionId))
        .thenReturn("{\"value\":5}");

    Map<String, UUID> targetMap = new HashMap<>();
    targetMap.put("==", eqTarget);
    targetMap.put("<", ltTarget);
    targetMap.put(">", gtTarget);

    try (MockedStatic<JsonbParser> mocked = mockStatic(JsonbParser.class)) {
      mocked.when(() -> JsonbParser.readTargetFromDbJson(anyString())).thenReturn(targetMap);
      mocked.when(() -> JsonbParser.parseLong(anyString())).thenReturn(5L);

      service.handleQuestionByType(sourceQuestionId, sessionId, temporarySessionId);
    }

    ArgumentCaptor<QuestionCondition> captor = ArgumentCaptor.forClass(QuestionCondition.class);
    verify(questionConditionRepository, atLeastOnce()).save(captor.capture());

    assertEquals(ltTarget, captor.getValue().getTargetNodeId());
  }

  @Test
  void handleQuestionByType_dateInput_before_setsLessTarget() {
    UUID sourceQuestionId = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();
    UUID temporarySessionId = UUID.randomUUID();

    UUID eqTarget = UUID.randomUUID();
    UUID ltTarget = UUID.randomUUID();
    UUID gtTarget = UUID.randomUUID();

    QuestionCondition qc = new QuestionCondition();
    qc.setSourceQuestionId(sourceQuestionId);
    qc.setSessionId(temporarySessionId);
    qc.setExpectedValue("02.01.2026");
    qc.setTarget("{\"==\":\"" + eqTarget + "\",\"<\":\"" + ltTarget + "\",\">\":\"" + gtTarget + "\"}");

    Question question = mock(Question.class);
    QuestionType type = mock(QuestionType.class);

    when(questionConditionRepository.findBySourceQuestionIdAndSessionId(sourceQuestionId, temporarySessionId))
        .thenReturn(qc);
    when(questionConditionRepository.findQuestionBySourceQuestionId(sourceQuestionId))
        .thenReturn(question);
    when(question.getQuestionType()).thenReturn(type);
    when(type.getName()).thenReturn("Date Input");
    when(questionConditionRepository.findValueByQuestionIdAndSessionId(sourceQuestionId, sessionId))
        .thenReturn("{\"value\":\"2026-01-01\"}");

    Map<String, UUID> targetMap = new HashMap<>();
    targetMap.put("==", eqTarget);
    targetMap.put("<", ltTarget);
    targetMap.put(">", gtTarget);

    try (MockedStatic<JsonbParser> mocked = mockStatic(JsonbParser.class)) {
      mocked.when(() -> JsonbParser.readTargetFromDbJson(anyString())).thenReturn(targetMap);
      mocked.when(() -> JsonbParser.parseDate(anyString())).thenReturn(LocalDate.of(2026, 1, 1));

      service.handleQuestionByType(sourceQuestionId, sessionId, temporarySessionId);
    }

    ArgumentCaptor<QuestionCondition> captor = ArgumentCaptor.forClass(QuestionCondition.class);
    verify(questionConditionRepository, atLeastOnce()).save(captor.capture());

    assertEquals(ltTarget, captor.getValue().getTargetNodeId());
  }

  @Test
  void createQuestionCondition_multipleChoice_setsOperatorAndSaves() {
    UUID sourceQuestionId = UUID.randomUUID();
    UUID tempSessionId = UUID.randomUUID();

    Map<String, UUID> target = new HashMap<>();
    target.put("==", UUID.randomUUID());
    target.put("!=", UUID.randomUUID());

    Question question = mock(Question.class);
    QuestionType type = mock(QuestionType.class);

    when(questionConditionRepository.findQuestionBySourceQuestionId(sourceQuestionId))
        .thenReturn(question);
    when(question.getQuestionType()).thenReturn(type);
    when(type.getName()).thenReturn("Multiple Choice");

    when(questionConditionRepository.save(any(QuestionCondition.class)))
        .thenAnswer(inv -> inv.getArgument(0));

    QuestionCondition saved = service.createQuestionCondition(sourceQuestionId, tempSessionId, target, "Yes");

    assertNotNull(saved);
    assertEquals(sourceQuestionId, saved.getSourceQuestionId());
    assertEquals(tempSessionId, saved.getSessionId());
    assertEquals("Yes", saved.getExpectedValue());
    assertEquals("==,!=", saved.getOperator());
    assertNotNull(saved.getTarget());
    verify(questionConditionRepository).save(any(QuestionCondition.class));
  }
}