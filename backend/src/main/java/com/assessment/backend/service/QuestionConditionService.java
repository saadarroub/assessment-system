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
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
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


    if ("Multiple Choice".equals(questionTypeName)||"Multiple Select".equals(questionTypeName)) {

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

    List<QuestionCondition> qc = questionConditionRepository.findAllBySourceQuestionId(sourceQuestionId);

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
    if (qc == null) {
      throw new IllegalStateException("QuestionCondition konnte nicht gefunden werden für " + "Question Id: " + sourceQuestionId + ".");
    }


    Question question = questionConditionRepository.findQuestionBySourceQuestionId(sourceQuestionId);
    if (question == null) {
      throw new IllegalStateException("Zugehörige Question nicht gefunden für Id: " + sourceQuestionId);
    }
    QuestionType questionType = question.getQuestionType();
    String questionTypeName = questionType.getName();
    String expectedValue = qc.get(0).getExpectedValue();

    Map<String, UUID> targetNodeId = new HashMap<>();

    if ("Multiple Choice".equals(questionTypeName)) {

      targetNodeId.put("==", findTargetNodeIdByOperator(qc,"=="));
      targetNodeId.put("!=", findTargetNodeIdByOperator(qc,"!="));

      return handleQuestion(sourceQuestionId, targetNodeId, sessionId, expectedValue);

    } else if ("Multiple Select".equals(questionTypeName)) {

      targetNodeId.put("==", findTargetNodeIdByOperator(qc,"=="));
      targetNodeId.put("!=", findTargetNodeIdByOperator(qc,"!="));

      return handleMultipleSelectQuestion(sourceQuestionId, targetNodeId, sessionId, expectedValue);

    } else if ("Number Input".equals(questionTypeName)||"Rating Scale".equals(questionTypeName)) {

      targetNodeId.put("==", findTargetNodeIdByOperator(qc,"=="));
      targetNodeId.put("<", findTargetNodeIdByOperator(qc,"<"));
      targetNodeId.put(">", findTargetNodeIdByOperator(qc,">"));

      return handleNumberQuestion(sourceQuestionId, targetNodeId, sessionId, expectedValue);

    } else if ("Date Input".equals(questionTypeName)) {

      targetNodeId.put("==", findTargetNodeIdByOperator(qc,"=="));
      targetNodeId.put("<", findTargetNodeIdByOperator(qc,"<"));
      targetNodeId.put(">", findTargetNodeIdByOperator(qc,">"));

      return handleDateQuestion(sourceQuestionId, targetNodeId, sessionId, expectedValue);

    } else { // Fallback, falls kein bekannter Typ
      throw new IllegalArgumentException("Unknown question type: " + questionTypeName);
    }

  }

  //Multiple Choice
  public UUID handleQuestion(UUID sourceQuestionID, Map<String, UUID> targetNodeId, UUID sessionId,
                          String expectedValue) {

    String jsonB = questionConditionRepository.findValueByQuestionIdAndSessionId(sourceQuestionID,sessionId);

    if (jsonB == null || jsonB.isBlank()) {
      throw new IllegalStateException("Antwortwert ist null oder leer für QuestionId: " + sourceQuestionID + "und Session Id:" + sessionId);
    }

    String answer = parseString(jsonB);

    String expectedAnswer = expectedValue.trim();

    if (expectedAnswer == null || expectedAnswer.isBlank()) {
      throw new IllegalArgumentException("ExpectedValue darf nicht null oder leer sein für " + "QuestionConditionId: " + sourceQuestionID);
    }

    // Nur eine Bedingung pro Durchlauf trifft zu, daher if-else statt Schleife
    if (answer.equalsIgnoreCase(expectedAnswer)) {

      return targetNodeId.get("==");

    } else {

      return targetNodeId.get("!=");

    }

  }


  //Multiple Select
  public UUID handleMultipleSelectQuestion(UUID sourceQuestionID, Map<String, UUID> targetNodeId, UUID sessionId, String expectedValue) {

    String jsonB = questionConditionRepository.findValueByQuestionIdAndSessionId(sourceQuestionID,sessionId);

    Set<String> answers =   parseStringSet(jsonB).stream().map(String::trim).map(String::toLowerCase).collect(Collectors.toSet());
    if (answers == null) {
      answers = new HashSet<>();
    }

    String expectedAnswer = expectedValue;
    Set<String> expectedAnswers = Arrays.stream(expectedAnswer.split(",")).map(String::trim).map(String::toLowerCase).collect(Collectors.toSet());
    if (expectedAnswers == null) {
      answers = new HashSet<>();
    }

    if (answers.equals(expectedAnswers)) {

      return targetNodeId.get("==");

    } else {

      return targetNodeId.get("!=");

    }
  }

  //Number Input + Rating Scale
  public UUID handleNumberQuestion(UUID sourceQuestionID, Map<String, UUID> targetNodeId, UUID sessionId, String expectedValue) {

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

    String expected = expectedValue;
    if (expected == null || expected.isBlank()) {
      throw new IllegalArgumentException("ExpectedValue darf nicht null oder leer sein für " + "QuestionConditionId: " + sourceQuestionID);
    }

    long expectedAnswer;
    try {
      expectedAnswer = Long.parseLong(expected);
    } catch (NumberFormatException e) {
      throw new IllegalArgumentException("ExpectedValue ist keine gültige Zahl: " + expected);
    }

    if (answer == expectedAnswer) {

      return targetNodeId.get("==");

    } else if (answer < expectedAnswer) {

      return targetNodeId.get("<");

    } else {

      return targetNodeId.get(">");

    }
  }

  //Date Input
  public UUID handleDateQuestion(UUID sourceQuestionID, Map<String, UUID> targetNodeId, UUID sessionId, String expectedValue) {

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

    String expected = expectedValue;
    if (expected == null || expected.isBlank()) {
      throw new IllegalArgumentException("ExpectedValue darf nicht null oder leer sein für " + "QuestionConditionId: " + sourceQuestionID);
    }

    LocalDate expectedDate;
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
    try {
      expectedDate = LocalDate.parse(expected, formatter);
    } catch (Exception e) {
      throw new IllegalArgumentException("ExpectedValue ist kein gültiges Datum: " + expected);
    }

    if (date.equals(expectedDate)) {

      return targetNodeId.get("==");

    } else if (date.isBefore(expectedDate)) {

      return targetNodeId.get("<");

    } else { // date.isAfter(expectedDate)

      return targetNodeId.get(">");

    }
  }

}
