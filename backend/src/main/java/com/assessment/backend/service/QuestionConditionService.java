package com.assessment.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import static com.assessment.backend.util.JsonbParser.parseDate;
import static com.assessment.backend.util.JsonbParser.parseLong;
import static com.assessment.backend.util.JsonbParser.parseStringSet;
import static com.assessment.backend.util.JsonbParser.parseString;
import static com.assessment.backend.util.JsonbParser.readTargetFromDbJson;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import com.assessment.backend.entity.Question;
import com.assessment.backend.entity.QuestionCondition;
import com.assessment.backend.entity.QuestionType;
import com.assessment.backend.repository.QuestionConditionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuestionConditionService {


  @Autowired
  private QuestionConditionRepository questionConditionRepository;

  private final ObjectMapper objectMapper;

  public QuestionConditionService(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }


  //Create a Question Object
  public QuestionCondition createQuestionCondition(UUID sourceQuestionId,UUID targetNodeId, String operator, String expectedValue){

    QuestionCondition qc = new QuestionCondition();

    qc.setSourceQuestionId(sourceQuestionId);
    qc.setTargetNodeId(targetNodeId);
    qc.setOperator(operator);
    qc.setExpectedValue(expectedValue);

    if (questionConditionRepository.existsBySourceQuestionIdAndOperatorAndExpectedValue(
        sourceQuestionId, operator, expectedValue)) {
      throw new IllegalArgumentException("Diese QuestionCondition existiert bereits.");
    }

    Question question = questionConditionRepository.findQuestionBySourceQuestionId(sourceQuestionId);
    if (question == null) {
      throw new IllegalStateException("Zugehörige Question nicht gefunden für Id: " + sourceQuestionId);
    }
    QuestionType questionType = question.getQuestionType();

    String questionTypeName = questionType.getName();

    String sign = qc.getOperator();

    Set<String> wordAllowed = Set.of("==", "!=");

    Set<String> numberAllowed = Set.of("==", "<", ">");


    if ("Multiple Choice".equals(questionTypeName)||"Multiple Select".equals(questionTypeName)|| "Dropdown".equals(questionTypeName)) {

      if(!wordAllowed.contains(sign)){

        throw new IllegalArgumentException("Der übergebene Operator ist für den Question Type: " + questionTypeName + " nicht gestattet.");

      }

    } else if ("Number Input".equals(questionTypeName)||"Date Input".equals(questionTypeName)||"Rating Scale".equals(questionTypeName)) {

      if(!numberAllowed.contains(sign)){

        throw new IllegalArgumentException("Der übergebene Operator ist für den Question Type: " + questionTypeName + " nicht gestattet.");

      }

    } else { // Fallback, falls kein bekannter Typ
      throw new IllegalArgumentException("Unknown question type: " + questionTypeName);
    }

    return questionConditionRepository.save(qc);

  }

    //Load QuestionCondition
  public List<QuestionCondition> loadQuestionCondition(UUID sourceQuestionId) {

    List<QuestionCondition> qc = questionConditionRepository.findAllBySourceQuestionIdOrderByCreatedAtAsc(sourceQuestionId);

    return qc;

  }

  //TargetNodeId aus Liste lesen abhängig vom Operator
  public UUID findTargetNodeIdByOperator(List<QuestionCondition> list, String operator) {
    return list.stream()
        .filter(qc -> operator.equals(qc.getOperator()))
        .map(QuestionCondition::getTargetNodeId)
        .findFirst()
        .orElse(null);
  }

  //Read - Decide by QuestionType which method will be started
  public UUID handleQuestionByType(UUID sourceQuestionId,UUID sessionId) {

    List<QuestionCondition> qc = loadQuestionCondition(sourceQuestionId);
    if (qc == null || qc.isEmpty()) {
      throw new IllegalStateException("QuestionCondition konnte nicht gefunden werden für " + "Question Id: " + sourceQuestionId + ".");
    }


    Question question = questionConditionRepository.findQuestionBySourceQuestionId(sourceQuestionId);
    if (question == null) {
      throw new IllegalStateException("Zugehörige Question nicht gefunden für Id: " + sourceQuestionId);
    }
    QuestionType questionType = question.getQuestionType();
    String questionTypeName = questionType.getName();

    if ("Multiple Choice".equals(questionTypeName)||"Dropdown".equals(questionTypeName)) {
      return handleQuestion(sourceQuestionId, qc, sessionId);

    } else if ("Multiple Select".equals(questionTypeName)) {
      return handleMultipleSelectQuestion(sourceQuestionId, qc, sessionId);

    } else if ("Number Input".equals(questionTypeName)||"Rating Scale".equals(questionTypeName)) {
      return handleNumberQuestion(sourceQuestionId, qc, sessionId);

    } else if ("Date Input".equals(questionTypeName)) {
      return handleDateQuestion(sourceQuestionId, qc, sessionId);

    } else { // Fallback, falls kein bekannter Typ
      throw new IllegalArgumentException("Unknown question type: " + questionTypeName);
    }

  }

  //Multiple Choice + Dropdown
  public UUID handleQuestion(UUID sourceQuestionID, List<QuestionCondition> conditions, UUID sessionId) {

    String jsonB = questionConditionRepository.findValueByQuestionIdAndSessionId(sourceQuestionID,sessionId);

    if (jsonB == null || jsonB.isBlank()) {
      throw new IllegalStateException("Antwortwert ist null oder leer für QuestionId: " + sourceQuestionID + "und Session Id:" + sessionId);
    }

    String answer = parseString(jsonB).trim().toLowerCase();

    // Prüfe jede Condition einzeln mit ihrem eigenen expectedValue
    for (QuestionCondition cond : conditions) {
      String expectedAnswer = cond.getExpectedValue() != null ? cond.getExpectedValue().trim().toLowerCase() : "";
      String operator = cond.getOperator();
      
      if ("==".equals(operator) && answer.equalsIgnoreCase(expectedAnswer)) {
        return cond.getTargetNodeId();
      } else if ("!=".equals(operator) && !answer.equalsIgnoreCase(expectedAnswer)) {
        return cond.getTargetNodeId();
      }
    }
    
    return null; // Keine Condition erfüllt

  }


  //Multiple Select
  public UUID handleMultipleSelectQuestion(UUID sourceQuestionID, List<QuestionCondition> conditions, UUID sessionId) {

    String jsonB = questionConditionRepository.findValueByQuestionIdAndSessionId(sourceQuestionID,sessionId);

    Set<String> answers = parseStringSet(jsonB).stream().map(String::trim).map(String::toLowerCase).collect(Collectors.toSet());
    if (answers == null) {
      answers = new HashSet<>();
    }

    // Prüfe jede Condition einzeln
    for (QuestionCondition cond : conditions) {
      String expectedAnswer = cond.getExpectedValue();
      Set<String> expectedAnswers = Arrays.stream(expectedAnswer.split(",")).map(String::trim).map(String::toLowerCase).collect(Collectors.toSet());
      String operator = cond.getOperator();
      
      if ("==".equals(operator) && answers.equals(expectedAnswers)) {
        return cond.getTargetNodeId();
      } else if ("!=".equals(operator) && !answers.equals(expectedAnswers)) {
        return cond.getTargetNodeId();
      }
    }
    
    return null; // Keine Condition erfüllt
  }

  //Number Input + Rating Scale
  public UUID handleNumberQuestion(UUID sourceQuestionID, List<QuestionCondition> conditions, UUID sessionId) {

    String jsonB = questionConditionRepository.findValueByQuestionIdAndSessionId(sourceQuestionID,sessionId);
    if (jsonB == null || jsonB.isBlank()) {
      throw new IllegalStateException("Antwortwert ist null oder leer für QuestionId: " + sourceQuestionID + "und Session Id:" + sessionId);
    }

    long answer;
    try {
      answer = parseLong(jsonB);
    } catch (NumberFormatException e) {
      throw new IllegalArgumentException("Antwortwert ist keine gültige Zahl: " + jsonB);
    }

    // Prüfe jede Condition einzeln mit ihrem eigenen expectedValue
    for (QuestionCondition cond : conditions) {
      String expected = cond.getExpectedValue();
      if (expected == null || expected.isBlank()) {
        continue; // Überspringe ungültige Conditions
      }
      
      long expectedAnswer;
      try {
        expectedAnswer = Long.parseLong(expected.trim());
      } catch (NumberFormatException e) {
        continue; // Überspringe ungültige Conditions
      }
      
      String operator = cond.getOperator();
      
      if ("==".equals(operator) && answer == expectedAnswer) {
        return cond.getTargetNodeId();
      } else if ("<".equals(operator) && answer < expectedAnswer) {
        return cond.getTargetNodeId();
      } else if (">".equals(operator) && answer > expectedAnswer) {
        return cond.getTargetNodeId();
      }
    }
    
    return null; // Keine Condition erfüllt
  }

  //Date Input
  public UUID handleDateQuestion(UUID sourceQuestionID, List<QuestionCondition> conditions, UUID sessionId) {

    String jsonB = questionConditionRepository.findValueByQuestionIdAndSessionId(sourceQuestionID,sessionId);
    if (jsonB == null || jsonB.isBlank()) {
      throw new IllegalStateException("Antwortwert ist null oder leer für QuestionId: " + sourceQuestionID + "und Session Id:" + sessionId);
    }

    LocalDate date;
    try {
      date = parseDate(jsonB);
    } catch (Exception e) {
      throw new IllegalArgumentException("Antwortwert ist kein gültiges Datum: " + jsonB);
    }

    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    // Prüfe jede Condition einzeln mit ihrem eigenen expectedValue
    for (QuestionCondition cond : conditions) {
      String expected = cond.getExpectedValue();
      if (expected == null || expected.isBlank()) {
        continue; // Überspringe ungültige Conditions
      }

      LocalDate expectedDate;
      try {
        expectedDate = LocalDate.parse(expected.trim(), formatter);
      } catch (Exception e) {
        continue; // Überspringe ungültige Conditions
      }

      String operator = cond.getOperator();

      if ("==".equals(operator) && date.equals(expectedDate)) {
        return cond.getTargetNodeId();
      } else if ("<".equals(operator) && date.isBefore(expectedDate)) {
        return cond.getTargetNodeId();
      } else if (">".equals(operator) && date.isAfter(expectedDate)) {
        return cond.getTargetNodeId();
      }
    }
    
    return null; // Keine Condition erfüllt
  }

  //Update a existing Question Condition Object
  @Transactional
  public QuestionCondition updateQuestionConditionEntity(UUID sourceQuestionId, String operator,
                                                         String expectedValue, UUID targetNodeId) {

    DateTimeFormatter EU_DATE = DateTimeFormatter.ofPattern("dd.MM.uuuu", Locale.GERMANY)
        .withResolverStyle(ResolverStyle.STRICT);

    QuestionCondition qc =
        questionConditionRepository.findBySourceQuestionIdAndOperator(sourceQuestionId, operator);

    Question question = questionConditionRepository.findQuestionBySourceQuestionId(sourceQuestionId);
    QuestionType qT = question.getQuestionType();
    String questionType = qT.getName();

    if ("Number Input".equals(questionType) || "Rating Scale".equals(questionType)) {
      if (expectedValue == null || expectedValue.isBlank()) {
        throw new IllegalArgumentException("expectedValue darf nicht leer sein");
      }
      if (expectedValue.contains(",")) {
        throw new IllegalArgumentException("expectedValue muss eine ganze Zahl ohne Komma sein");
      }
      try {
        Long.parseLong(expectedValue.replace(".", ""));
      } catch (NumberFormatException e) {
        throw new IllegalArgumentException("expectedValue muss eine ganze Zahl sein");
      }

    } else if ("Multiple Choice".equals(questionType)||"Dropdown".equals(questionType)) {
      if (expectedValue == null || expectedValue.trim().isEmpty()) {
        throw new IllegalArgumentException("expectedValue darf nicht leer sein");
      }
      expectedValue = expectedValue.trim();
      if (expectedValue.length() > 255) {
        throw new IllegalArgumentException("expectedValue ist zu lang (max 255 Zeichen)");
      }

    } else if ("Multiple Select".equals(questionType)) {
      if (expectedValue == null || expectedValue.trim().isEmpty()) {
        throw new IllegalArgumentException("expectedValue darf nicht leer sein");
      }
      List<String> values = Arrays.stream(expectedValue.split(","))
          .map(String::trim)
          .filter(s -> !s.isEmpty())
          .toList();

      if (values.size() < 2) {
        throw new IllegalArgumentException("expectedValue muss mindestens 2 Werte enthalten " +
            "getrennt mit einen Komma");
      }

    } else if ("Date Input".equals(questionType)) {
      if (expectedValue == null || expectedValue.trim().isEmpty()) {
        throw new IllegalArgumentException("expectedValue darf nicht leer sein");
      }
      try {
        LocalDate.parse(expectedValue.trim(), EU_DATE);
      } catch (DateTimeParseException e) {
        throw new IllegalArgumentException("expectedValue muss ein Datum sein");
      }

    } else {
      if (expectedValue == null) {
        throw new IllegalArgumentException("expectedValue darf nicht null sein");
      }
    }

    qc.setExpectedValue(expectedValue);
    qc.setTargetNodeId(targetNodeId);
    return questionConditionRepository.save(qc);
  }

  //Delete a Single Question Condition Object
  @Transactional
  public void deleteASingleQuestionCondition(UUID sourceQuestionId, String operator){

    QuestionCondition qc = questionConditionRepository.findBySourceQuestionIdAndOperator(sourceQuestionId,operator);

    questionConditionRepository.delete(qc);

  }

  //Delete All Question Conditions for a Source Question ID
  @Transactional
  public void deleteAllQuestionConditions(UUID sourceQuestionId){

    List<QuestionCondition> qc = questionConditionRepository.findAllBySourceQuestionIdOrderByCreatedAtAsc(sourceQuestionId);

    questionConditionRepository.deleteAll(qc);

  }

}
