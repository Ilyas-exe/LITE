package com.lite.lite_backend.repository;

import com.lite.lite_backend.entity.Task;
import com.lite.lite_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Find all tasks for a specific user
     */
    List<Task> findByUser(User user);

    /**
     * Find all tasks for a specific user, ordered by position
     */
    List<Task> findByUserOrderByPositionAsc(User user);

    /**
     * Find all tasks for a specific user with a specific status, ordered by
     * position
     */
    List<Task> findByUserAndStatusOrderByPositionAsc(User user, String status);
}
