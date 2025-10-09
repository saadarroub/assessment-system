package com.assessment.backend.repository;

import com.assessment.backend.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkerRepository extends JpaRepository<Worker, UUID> {
    
    List<Worker> findByCompanyId(UUID companyId);
    
    Optional<Worker> findByEmail(String email);
    
    List<Worker> findByWorkSpaceRef(String workSpaceRef);
}

