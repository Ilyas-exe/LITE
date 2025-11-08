package com.lite.lite_backend.repository;

import com.lite.lite_backend.entity.JobApplication;
import com.lite.lite_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    /**
     * Find all job applications for a specific user
     * 
     * @param user the user whose job applications to find
     * @return list of job applications
     */
    List<JobApplication> findByUser(User user);

    /**
     * Find all job applications for a specific user, ordered by date applied
     * (newest first)
     * 
     * @param user the user whose job applications to find
     * @return list of job applications ordered by date
     */
    List<JobApplication> findByUserOrderByDateAppliedDesc(User user);
}
