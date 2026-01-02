package com.assessment.backend.service;

import static com.assessment.backend.util.JsonbParser.parseDate;
import static com.assessment.backend.util.JsonbParser.parseLong;
import static com.assessment.backend.util.JsonbParser.parseStringSet;
import static com.assessment.backend.util.JsonbParser.parseString;
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


  //Create or Load QuestionCondition
  public QuestionCondition createOrLoadQuestionCondition(UUID sourceQuestionId) {

    QuestionCondition qc = questionConditionRepository.findBySourceQuestionId(sourceQuestionId);

    if (qc == null) {
      qc = new QuestionCondition();
      qc.setSourceQuestionId(sourceQuestionId);
    }

    return qc;

  }

  //Read - Decide by QuestionType which method will be started
  public void handleQuestionByType(UUID sourceQuestionId, String expectedValue,
                                   Map<String, UUID> target) {

    QuestionCondition qc = createOrLoadQuestionCondition(sourceQuestionId);
    if (qc == null) {
      throw new IllegalStateException("QuestionCondition konnte nicht erstellt oder gefunden " +
          "werden für Id: " + sourceQuestionId);
    }
    qc.setExpectedValue(expectedValue);


    Question question = questionConditionRepository.findQuestionBySourceQuestionId(sourceQuestionId);
    if (question == null) {
      throw new IllegalStateException("Zugehörige Question nicht gefunden für Id: " + sourceQuestionId);
    }
    QuestionType questionType = question.getQuestionType();

    Map<String, UUID> targetNodeId = new HashMap<>();

    if ("Multiple Choice".equals(questionType.getName())) {

      qc.setOperator("==,!=");

      targetNodeId.put("==", target.get("=="));
      targetNodeId.put("!=", target.get("!="));

      handleQuestion(qc, targetNodeId);

    } else if ("Multiple Select".equals(questionType.getName())) {

      qc.setOperator("==,!=");

      targetNodeId.put("==", target.get("=="));
      targetNodeId.put("!=", target.get("!="));

      handleMultipleSelectQuestion(qc, targetNodeId);

    } else if ("Number Input".equals(questionType.getName())) {

      qc.setOperator("==,<,>");

      targetNodeId.put("==", target.get("=="));
      targetNodeId.put("<", target.get("<"));
      targetNodeId.put(">", target.get(">"));

      handleNumberQuestion(qc, targetNodeId);

    } else if ("Date Input".equals(questionType.getName())) {

      qc.setOperator("==,<,>");

      targetNodeId.put("==", target.get("=="));
      targetNodeId.put("<", target.get("<"));
      targetNodeId.put(">", target.get(">"));

      handleDateQuestion(qc, targetNodeId);

    } else if ("Rating Scale".equals(questionType.getName())) {

      qc.setOperator("==,!=");

      targetNodeId.put("==", target.get("=="));
      targetNodeId.put("<", target.get("<"));
      targetNodeId.put(">", target.get(">"));

      handleNumberQuestion(qc, targetNodeId);

    } else { // Fallback, falls kein bekannter Typ
      throw new IllegalArgumentException("Unknown question type: " + questionType.getName());
    }

  }

  //Multiple Choice
  public void handleQuestion(QuestionCondition qc, Map<String, UUID> targetNodeId) {


    String jsonB = questionConditionRepository.findValueByQuestionId(qc.getSourceQuestionId());

    if (jsonB == null || jsonB.isBlank()) {
      throw new IllegalStateException("Antwortwert ist null oder leer für QuestionId: " + qc.getSourceQuestionId());
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

    String jsonB = questionConditionRepository.findValueByQuestionId(qc.getSourceQuestionId());
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

    String jsonB = questionConditionRepository.findValueByQuestionId(qc.getSourceQuestionId());
    if (jsonB == null || jsonB.isBlank()) {
      throw new IllegalStateException("Antwortwert ist null oder leer für QuestionId: " + qc.getSourceQuestionId());
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

    String jsonB = questionConditionRepository.findValueByQuestionId(qc.getSourceQuestionId());
    if (jsonB == null || jsonB.isBlank()) {
      throw new IllegalStateException("Antwortwert ist null oder leer für QuestionId: " + qc.getSourceQuestionId());
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
