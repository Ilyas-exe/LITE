package com.lite.lite_backend.service;

import com.lite.lite_backend.dto.TaskDTO;
import com.lite.lite_backend.entity.Task;
import com.lite.lite_backend.entity.User;
import com.lite.lite_backend.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    /**
     * Get the currently logged-in user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }

    /**
     * Convert Task entity to DTO
     */
    private TaskDTO convertToDTO(Task task) {
        return new TaskDTO(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPosition(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getUpdatedAt());
    }

    /**
     * Get all tasks for the logged-in user, ordered by position
     */
    public List<TaskDTO> getAllTasks() {
        User currentUser = getCurrentUser();
        List<Task> tasks = taskRepository.findByUserOrderByPositionAsc(currentUser);
        return tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get tasks by status (for Kanban columns)
     */
    public List<TaskDTO> getTasksByStatus(String status) {
        User currentUser = getCurrentUser();
        List<Task> tasks = taskRepository.findByUserAndStatusOrderByPositionAsc(currentUser, status);
        return tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a single task by ID
     */
    public TaskDTO getTaskById(Long id) {
        User currentUser = getCurrentUser();
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Security check
        if (!task.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        return convertToDTO(task);
    }

    /**
     * Create a new task
     */
    public TaskDTO createTask(TaskDTO dto) {
        User currentUser = getCurrentUser();

        // Get the highest position for this status column
        List<Task> existingTasks = taskRepository.findByUserAndStatusOrderByPositionAsc(
                currentUser, dto.getStatus());
        int newPosition = existingTasks.isEmpty() ? 0 : existingTasks.get(existingTasks.size() - 1).getPosition() + 1;

        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStatus(dto.getStatus());
        task.setPosition(newPosition);
        task.setDueDate(dto.getDueDate());
        task.setUser(currentUser);

        Task saved = taskRepository.save(task);
        return convertToDTO(saved);
    }

    /**
     * Update an existing task
     */
    public TaskDTO updateTask(Long id, TaskDTO dto) {
        User currentUser = getCurrentUser();
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Security check
        if (!task.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setDueDate(dto.getDueDate());

        // If status changed, update position
        if (!task.getStatus().equals(dto.getStatus())) {
            task.setStatus(dto.getStatus());
            // Get the highest position in the new status column
            List<Task> tasksInNewStatus = taskRepository.findByUserAndStatusOrderByPositionAsc(
                    currentUser, dto.getStatus());
            int newPosition = tasksInNewStatus.isEmpty() ? 0
                    : tasksInNewStatus.get(tasksInNewStatus.size() - 1).getPosition() + 1;
            task.setPosition(newPosition);
        }

        Task updated = taskRepository.save(task);
        return convertToDTO(updated);
    }

    /**
     * Delete a task
     */
    public void deleteTask(Long id) {
        User currentUser = getCurrentUser();
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Security check
        if (!task.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        taskRepository.delete(task);
    }

    /**
     * Update task position (for drag-and-drop)
     */
    public TaskDTO updateTaskPosition(Long id, String newStatus, Integer newPosition) {
        User currentUser = getCurrentUser();
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Security check
        if (!task.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        String oldStatus = task.getStatus();
        Integer oldPosition = task.getPosition();

        // Update task status and position
        task.setStatus(newStatus);
        task.setPosition(newPosition);
        taskRepository.save(task);

        // Reorder other tasks in the old column (if status changed)
        if (!oldStatus.equals(newStatus)) {
            List<Task> oldColumnTasks = taskRepository.findByUserAndStatusOrderByPositionAsc(
                    currentUser, oldStatus);
            for (int i = 0; i < oldColumnTasks.size(); i++) {
                Task t = oldColumnTasks.get(i);
                if (t.getPosition() > oldPosition) {
                    t.setPosition(t.getPosition() - 1);
                    taskRepository.save(t);
                }
            }
        }

        // Reorder tasks in the new column
        List<Task> newColumnTasks = taskRepository.findByUserAndStatusOrderByPositionAsc(
                currentUser, newStatus);
        for (Task t : newColumnTasks) {
            if (!t.getId().equals(id) && t.getPosition() >= newPosition) {
                t.setPosition(t.getPosition() + 1);
                taskRepository.save(t);
            }
        }

        return convertToDTO(task);
    }
}
