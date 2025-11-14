package com.assessment.backend.repository;

import com.assessment.backend.entity.QuestionNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuestionNodeRepository extends JpaRepository<QuestionNode, UUID> {
    
    // Find all nodes by Thema
    List<QuestionNode> findByThemaId(UUID themaId);
    
    // Find all nodes by Thema ordered by orderIndex
    List<QuestionNode> findByThemaIdOrderByOrderIndexAsc(UUID themaId);
    
    // Find all root nodes (no parent) by Thema
    @Query("SELECT qn FROM QuestionNode qn WHERE qn.thema.id = :themaId AND qn.parentNode IS NULL ORDER BY qn.orderIndex ASC")
    List<QuestionNode> findRootNodesByThemaId(@Param("themaId") UUID themaId);
    
    // Find all child nodes by parent node
    List<QuestionNode> findByParentNodeId(UUID parentNodeId);
    
    // Find all child nodes by parent node ordered by orderIndex
    List<QuestionNode> findByParentNodeIdOrderByOrderIndexAsc(UUID parentNodeId);
    
    // ✅ NEU: Find siblings by Thema and Parent (für korrekten orderIndex bei Create/Move)
    @Query("SELECT qn FROM QuestionNode qn WHERE qn.thema.id = :themaId AND " +
           "((:parentNodeId IS NULL AND qn.parentNode IS NULL) OR qn.parentNode.id = :parentNodeId) " +
           "ORDER BY qn.orderIndex ASC")
    List<QuestionNode> findSiblingsByThemaAndParent(@Param("themaId") UUID themaId, @Param("parentNodeId") UUID parentNodeId);
    
    // Find node by Question and Thema
    Optional<QuestionNode> findByQuestionIdAndThemaId(UUID questionId, UUID themaId);
    
    // Find all nodes by Question
    List<QuestionNode> findByQuestionId(UUID questionId);
    
    // Find all required nodes by Thema
    @Query("SELECT qn FROM QuestionNode qn WHERE qn.thema.id = :themaId AND qn.isRequired = true ORDER BY qn.orderIndex ASC")
    List<QuestionNode> findRequiredNodesByThemaId(@Param("themaId") UUID themaId);
    
    // Find all optional nodes by Thema
    @Query("SELECT qn FROM QuestionNode qn WHERE qn.thema.id = :themaId AND qn.isRequired = false ORDER BY qn.orderIndex ASC")
    List<QuestionNode> findOptionalNodesByThemaId(@Param("themaId") UUID themaId);
    
    // Check if node exists in Thema
    boolean existsByQuestionIdAndThemaId(UUID questionId, UUID themaId);
    
    // Count nodes in Thema
    long countByThemaId(UUID themaId);
    
    // Count child nodes
    long countByParentNodeId(UUID parentNodeId);
    
    // Count required nodes in Thema
    @Query("SELECT COUNT(qn) FROM QuestionNode qn WHERE qn.thema.id = :themaId AND qn.isRequired = true")
    long countRequiredNodesByThemaId(@Param("themaId") UUID themaId);
    
    // Delete all nodes by Thema
    void deleteByThemaId(UUID themaId);
    
    // Delete all nodes by Question
    void deleteByQuestionId(UUID questionId);
    
    // Find nodes with eager loading
    @Query("SELECT qn FROM QuestionNode qn " +
           "LEFT JOIN FETCH qn.question q " +
           "LEFT JOIN FETCH q.questionType " +
           "LEFT JOIN FETCH qn.thema " +
           "WHERE qn.thema.id = :themaId " +
           "ORDER BY qn.orderIndex ASC")
    List<QuestionNode> findByThemaIdWithDetails(@Param("themaId") UUID themaId);
    
    // Find root nodes with eager loading
    @Query("SELECT qn FROM QuestionNode qn " +
           "LEFT JOIN FETCH qn.question q " +
           "LEFT JOIN FETCH q.questionType " +
           "LEFT JOIN FETCH qn.thema " +
           "WHERE qn.thema.id = :themaId AND qn.parentNode IS NULL " +
           "ORDER BY qn.orderIndex ASC")
    List<QuestionNode> findRootNodesByThemaIdWithDetails(@Param("themaId") UUID themaId);
    
    // Find child nodes with eager loading
    @Query("SELECT qn FROM QuestionNode qn " +
           "LEFT JOIN FETCH qn.question q " +
           "LEFT JOIN FETCH q.questionType " +
           "WHERE qn.parentNode.id = :parentNodeId " +
           "ORDER BY qn.orderIndex ASC")
    List<QuestionNode> findByParentNodeIdWithDetails(@Param("parentNodeId") UUID parentNodeId);
}