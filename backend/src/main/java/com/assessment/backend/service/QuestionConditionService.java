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
  public QuestionCondition createQuestionCondition(UUID sourceQuestionId, UUID temporarySessionId,Map<String, UUID> target, String expectedValue){

    QuestionCondition qc = new QuestionCondition();

    qc.setSourceQuestionId(sourceQuestionId);
    qc.setSessionId(temporarySessionId);
    qc.setExpectedValue(expectedValue);

    try {
      String targetJson = objectMapper.writeValueAsString(target); // Map -> JSON
      qc.setTarget(targetJson);
    } catch (JsonProcessingException e) {
      throw new IllegalArgumentException("target konnte nicht als JSON gespeichert werden", e);
    }

    Question question = questionConditionRepository.findQuestionBySourceQuestionId(sourceQuestionId);
    if (question == null) {
      throw new IllegalStateException("Zugehörige Question nicht gefunden für Id: " + sourceQuestionId);
    }
    QuestionType questionType = question.getQuestionType();

    String questionTypeName = questionType.getName();

    if ("Multiple Choice".equals(questionTypeName)||"Multiple Select".equals(questionTypeName)) {

      qc.setOperator("==,!=");

    } else if ("Number Input".equals(questionTypeName)||"Date Input".equals(questionTypeName)||"Rating Scale".equals(questionTypeName)) {

      qc.setOperator("==,<,>");

    } else { // Fallback, falls kein bekannter Typ
      throw new IllegalArgumentException("Unknown question type: " + questionTypeName);
    }

    return questionConditionRepository.save(qc);

  }

  //Load QuestionCondition for Getter
  public QuestionCondition getterLoaderQuestionCondition(UUID sourceQuestionId, UUID sessionId) {

    QuestionCondition qc =
        questionConditionRepository.findBySourceQuestionIdAndSessionId(sourceQuestionId, sessionId);

    return qc;

  }

    //Load QuestionCondition
  public QuestionCondition loadQuestionCondition(UUID sourceQuestionId, UUID sessionId, UUID temporarySessionId) {

    QuestionCondition qc = questionConditionRepository.findBySourceQuestionIdAndSessionId(sourceQuestionId, temporarySessionId);

    qc.setSessionId(sessionId);

    return qc;

  }

  //Read - Decide by QuestionType which method will be started
  public void handleQuestionByType(UUID sourceQuestionId,UUID sessionId,UUID temporarySessionId) {

    QuestionCondition qc = loadQuestionCondition(sourceQuestionId, sessionId, temporarySessionId);
    if (qc == null) {
      throw new IllegalStateException("QuestionCondition konnte nicht erstellt oder gefunden " +
          "werden für Question Id: " + sourceQuestionId + "und die Session Id:" + sessionId);
    }


    Question question = questionConditionRepository.findQuestionBySourceQuestionId(sourceQuestionId);
    if (question == null) {
      throw new IllegalStateException("Zugehörige Question nicht gefunden für Id: " + sourceQuestionId);
    }
    QuestionType questionType = question.getQuestionType();

    String questionTypeName = questionType.getName();

    Map<String, UUID> targetNodeId = new HashMap<>();

    Map<String, UUID> target = readTargetFromDbJson(qc.getTarget());

    if ("Multiple Choice".equals(questionTypeName)) {

      targetNodeId.put("==", target.get("=="));
      targetNodeId.put("!=", target.get("!="));

      handleQuestion(qc, targetNodeId);

    } else if ("Multiple Select".equals(questionTypeName)) {

      targetNodeId.put("==", target.get("=="));
      targetNodeId.put("!=", target.get("!="));

      handleMultipleSelectQuestion(qc, targetNodeId);

    } else if ("Number Input".equals(questionTypeName)||"Rating Scale".equals(questionTypeName)) {

      targetNodeId.put("==", target.get("=="));
      targetNodeId.put("<", target.get("<"));
      targetNodeId.put(">", target.get(">"));

      handleNumberQuestion(qc, targetNodeId);

    } else if ("Date Input".equals(questionTypeName)) {

      targetNodeId.put("==", target.get("=="));
      targetNodeId.put("<", target.get("<"));
      targetNodeId.put(">", target.get(">"));

      handleDateQuestion(qc, targetNodeId);

    } else { // Fallback, falls kein bekannter Typ
      throw new IllegalArgumentException("Unknown question type: " + questionTypeName);
    }

  }

  //Multiple Choice
  public void handleQuestion(QuestionCondition qc, Map<String, UUID> targetNodeId) {

    String jsonB = questionConditionRepository.findValueByQuestionIdAndSessionId(qc.getSourceQuestionId(), qc.getSessionId());

    if (jsonB == null || jsonB.isBlank()) {
      throw new IllegalStateException("Antwortwert ist null oder leer für QuestionId: " + qc.getSourceQuestionId() + "und Session Id:" + qc.getSessionId());
    }

    String answer = parseString(jsonB);

    String expectedAnswer = qc.getExpectedValue().trim();

    if (expectedAnswer == null || expectedAnswer.isBlank()) {
      throw new IllegalArgumentException("ExpectedValue darf nicht null oder leer sein für QuestionConditionId: " + qc.getId());
    }

    // Nur eine Bedingung pro Durchlauf trifft zu, daher if-else statt Schleife
    if (answer.equalsIgnoreCase(expectedAnswer)) {

      qc.setTargetNodeId(targetNodeId.get("=="));

    } else {

      qc.setTargetNodeId(targetNodeId.get("!="));

    }

    questionConditionRepository.save(qc);
  }


  //Multiple Select
  public void handleMultipleSelectQuestion(QuestionCondition qc, Map<String, UUID> targetNodeId) {

    String jsonB = questionConditionRepository.findValueByQuestionIdAndSessionId(qc.getSourceQuestionId(), qc.getSessionId());

    Set<String> answers =   parseStringSet(jsonB).stream().map(String::trim).map(String::toLowerCase).collect(Collectors.toSet());
    if (answers == null) {
      answers = new HashSet<>();
    }

    String expectedAnswer = qc.getExpectedValue();
    Set<String> expectedAnswers = Arrays.stream(expectedAnswer.split(",")).map(String::trim).map(String::toLowerCase).collect(Collectors.toSet());
    if (expectedAnswers == null) {
      answers = new HashSet<>();
    }

    if (answers.equals(expectedAnswers)) {
      qc.setTargetNodeId(targetNodeId.get("=="));
    } else {
      qc.setTargetNodeId(targetNodeId.get("!="));
    }

    questionConditionRepository.save(qc);
  }

  //Number Input + Rating Scale
  public void handleNumberQuestion(QuestionCondition qc, Map<String, UUID> targetNodeId) {

    String jsonB =
        questionConditionRepository.findValueByQuestionIdAndSessionId(qc.getSourceQuestionId(), qc.getSessionId());
    if (jsonB == null || jsonB.isBlank()) {
      throw new IllegalStateException("Antwortwert ist null oder leer für QuestionId: " + qc.getSourceQuestionId() + "und Session Id:" + qc.getSessionId());
    }

    long answer;
    try {
      answer = parseLong(jsonB);
    } catch (NumberFormatException e) {
      throw new IllegalArgumentException("Antwortwert ist keine gültige Zahl: " + jsonB);
    }

    String expected = qc.getExpectedValue();
    if (expected == null || expected.isBlank()) {
      throw new IllegalArgumentException("ExpectedValue darf nicht null oder leer sein für QuestionConditionId: " + qc.getId());
    }

    long expectedAnswer;
    try {
      expectedAnswer = Long.parseLong(expected);
    } catch (NumberFormatException e) {
      throw new IllegalArgumentException("ExpectedValue ist keine gültige Zahl: " + expected);
    }

    if (answer == expectedAnswer) {
      qc.setTargetNodeId(targetNodeId.get("=="));
    } else if (answer < expectedAnswer) {
      qc.setTargetNodeId(targetNodeId.get("<"));
    } else {
      qc.setTargetNodeId(targetNodeId.get(">"));
    }

    questionConditionRepository.save(qc);
  }

  //Date Input
  public void handleDateQuestion(QuestionCondition qc, Map<String, UUID> targetNodeId) {

    String jsonB =
        questionConditionRepository.findValueByQuestionIdAndSessionId(qc.getSourceQuestionId(), qc.getSessionId());
    if (jsonB == null || jsonB.isBlank()) {
      throw new IllegalStateException("Antwortwert ist null oder leer für QuestionId: " + qc.getSourceQuestionId() + "und Session Id:" + qc.getSessionId());
    }

    LocalDate date;
    try {
      date = parseDate(jsonB);
    } catch (Exception e) {
      throw new IllegalArgumentException("Antwortwert ist kein gültiges Datum: " + jsonB);
    }

    String expected = qc.getExpectedValue();
    if (expected == null || expected.isBlank()) {
      throw new IllegalArgumentException("ExpectedValue darf nicht null oder leer sein für QuestionConditionId: " + qc.getId());
    }

    LocalDate expectedDate;
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
    try {
      expectedDate = LocalDate.parse(expected, formatter);
    } catch (Exception e) {
      throw new IllegalArgumentException("ExpectedValue ist kein gültiges Datum: " + expected);
    }

    if (date.equals(expectedDate)) {
      qc.setTargetNodeId(targetNodeId.get("=="));
    } else if (date.isBefore(expectedDate)) {
      qc.setTargetNodeId(targetNodeId.get("<"));
    } else { // date.isAfter(expectedDate)
      qc.setTargetNodeId(targetNodeId.get(">"));
    }

    questionConditionRepository.save(qc);
  }

}
