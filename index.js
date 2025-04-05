// Task Manager Application
// Add this at the start of syncWithServer

class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentEditId = null;
        this.initElements();
        this.initEventListeners();
        this.loadTasks();
        this.updateUI();
    }


    initElements() {
        // Form elements
        this.taskForm = document.getElementById('task-form');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.cancelBtn = document.getElementById('cancel-btn');
        this.titleInput = document.getElementById('title');
        this.descriptionInput = document.getElementById('description');
        this.dueDateInput = document.getElementById('due-date');
        this.priorityInput = document.getElementById('priority');
        this.statusInput = document.getElementById('status');

        // Task list and filters
        this.taskList = document.getElementById('task-list');
        this.emptyState = document.getElementById('empty-state');
        this.statusFilter = document.getElementById('status-filter');
        this.priorityFilter = document.getElementById('priority-filter');
        this.searchInput = document.getElementById('search');

        // Progress bar
        this.progressBar = document.getElementById('progress-bar');
        this.progressText = document.getElementById('progress-text');

        // Sync button
        this.syncBtn = document.getElementById('sync-btn');

        // Notification
        this.notification = document.getElementById('notification');
    }

    initEventListeners() {
        // Form events
        this.addTaskBtn.addEventListener('click', () => this.showForm());
        this.cancelBtn.addEventListener('click', () => this.hideForm());
        this.taskForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Filter events
        this.statusFilter.addEventListener('change', () => this.updateUI());
        this.priorityFilter.addEventListener('change', () => this.updateUI());
        this.searchInput.addEventListener('input', () => this.updateUI());

        // Sync button
        this.syncBtn.addEventListener('click', () => this.syncWithServer());

        // Task list events (event delegation)
        this.taskList.addEventListener('click', (e) => {
            const taskElement = e.target.closest('.task-card');
            if (!taskElement) return;

            const taskId = taskElement.dataset.id;
            const task = this.tasks.find(t => t.id === taskId);
            if (!task) return;

            // Handle status toggle
            if (e.target.closest('.status-btn')) {
                this.toggleTaskStatus(task);
                return;
            }

            // Handle edit
            if (e.target.closest('.edit-btn')) {
                this.editTask(task);
                return;
            }

            // Handle delete
            if (e.target.closest('.delete-btn')) {
                this.deleteTask(task.id);
                return;
            }
        });

        this.taskForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        console.log("Form submit listener attached");
    }

    // Task CRUD operations
    addTask(task) {
        // Generate unique ID
        task.id = Date.now().toString();
        task.createdAt = new Date().toISOString();
        this.tasks.push(task);
        this.saveTasks();
        this.updateUI();
        this.showNotification('Task added successfully!', 'success');
    }

    updateTask(updatedTask) {
        const index = this.tasks.findIndex(t => t.id === updatedTask.id);
        if (index !== -1) {
            this.tasks[index] = updatedTask;
            this.saveTasks();
            this.updateUI();
            this.showNotification('Task updated successfully!', 'success');
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.updateUI();
            this.showNotification('Task deleted successfully!', 'success');
        }
    }

    toggleTaskStatus(task) {
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        this.updateTask({ ...task, status: newStatus });
    }

    editTask(task) {
        this.currentEditId = task.id;
        this.titleInput.value = task.title;
        this.descriptionInput.value = task.description || '';

        // Properly handle date formatting for the input
        if (task.dueDate) {
            const date = new Date(task.dueDate);
            const formattedDate = date.toISOString().slice(0, 16);
            this.dueDateInput.value = formattedDate;
        } else {
            this.dueDateInput.value = '';
        }

        this.priorityInput.value = task.priority;
        this.statusInput.value = task.status;
        this.showForm();
    }

    // Form handling
    showForm() {
        this.taskForm.classList.remove('hidden');
        this.addTaskBtn.classList.add('hidden');
        this.titleInput.focus();
    }

    hideForm() {
        this.taskForm.classList.add('hidden');
        this.addTaskBtn.classList.remove('hidden');
        this.taskForm.reset();
        this.currentEditId = null;
        this.clearValidationErrors();
    }

    handleFormSubmit(e) {
        e.preventDefault();
        console.log("Form submitted with data:", {
            title: this.titleInput.value,
            description: this.descriptionInput.value,
            dueDate: this.dueDateInput.value,
            priority: this.priorityInput.value,
            status: this.statusInput.value
        });

        if (!this.validateForm()) {
            console.log("Form validation failed");
            return;
        }

        // Validate form
        // if (!this.validateForm()) {
        //     return;
        // }

        const taskData = {
            title: this.titleInput.value.trim(),
            description: this.descriptionInput.value.trim(),
            dueDate: this.dueDateInput.value ? new Date(this.dueDateInput.value).toISOString() : null,
            priority: this.priorityInput.value,
            status: this.statusInput.value
        };

        console.log("Processed task data:", taskData);

        if (this.currentEditId) {
            taskData.id = this.currentEditId;
            this.updateTask(taskData);
        } else {
            this.addTask(taskData);
        }

        this.hideForm();
    }

    validateForm() {
        let isValid = true;
        this.clearValidationErrors();

        // Title validation
        if (!this.titleInput.value.trim()) {
            this.showValidationError(this.titleInput, 'Title is required');
            console.log("Validation error: Title is required");
            isValid = false;
        }

        // Due date validation
        if (this.dueDateInput.value) {
            const dueDate = new Date(this.dueDateInput.value);
            const now = new Date();

            if (dueDate < now) {
                this.showValidationError(this.dueDateInput, 'Due date must be in the future');
                console.log("Validation error: Due date must be in future");
                isValid = false;
            }
        }

        return isValid;
    }

    showValidationError(inputElement, message) {
        const formGroup = inputElement.closest('.form-group');
        if (!formGroup) return;

        const errorElement = formGroup.querySelector('.error-message');
        if (!errorElement) return;

        inputElement.style.borderColor = 'var(--danger-color)';
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    clearValidationErrors() {
        document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
            const formGroup = input.closest('.form-group');
            if (!formGroup) return;

            input.style.borderColor = '';
            const errorElement = formGroup.querySelector('.error-message');

            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
        });
    }

    // UI updates
    updateUI() {
        this.taskList.innerHTML = '';
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            this.emptyState.style.display = 'block';
        } else {
            this.emptyState.style.display = 'none';
            filteredTasks.forEach(task => {
                this.taskList.appendChild(this.createTaskElement(task));
            });
        }

        this.updateProgressBar();
    }

    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-card ${task.priority}-priority ${task.status === 'done' ? 'done' : ''}`;
        taskElement.dataset.id = task.id;

        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isOverdue = dueDate && dueDate < new Date() && task.status !== 'done';

        taskElement.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                <div class="task-actions">
                    <button class="status-btn" title="Toggle status">
                        <i class="fas fa-${task.status === 'done' ? 'undo' : 'check'}"></i>
                    </button>
                    <button class="edit-btn" title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
            <div class="task-meta">
                <span class="task-meta-item">
                    <i class="fas fa-flag"></i>
                    <span>${task.priority}</span>
                </span>
                <span class="task-status status-${task.status.replace('-', '')}">${task.status.replace('-', ' ')}</span>
                ${dueDate ? `
                <span class="task-meta-item task-due-date ${isOverdue ? 'overdue' : ''}">
                    <i class="fas fa-calendar-alt"></i>
                    <span>${this.formatDate(dueDate)}</span>
                    ${isOverdue ? '<i class="fas fa-exclamation-circle"></i>' : ''}
                </span>
                ` : ''}
            </div>
        `;

        return taskElement;
    }

    updateProgressBar() {
        const totalTasks = this.tasks.length;
        if (totalTasks === 0) {
            this.progressBar.style.width = '0%';
            this.progressText.textContent = '0%';
            return;
        }

        const completedTasks = this.tasks.filter(task => task.status === 'done').length;
        const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

        this.progressBar.style.width = `${progressPercentage}%`;
        this.progressText.textContent = `${progressPercentage}%`;
    }

    // Filtering
    getFilteredTasks() {
        let filteredTasks = [...this.tasks];

        // Status filter
        const statusFilterValue = this.statusFilter.value;
        if (statusFilterValue !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.status === statusFilterValue);
        }

        // Priority filter
        const priorityFilterValue = this.priorityFilter.value;
        if (priorityFilterValue !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.priority === priorityFilterValue);
        }

        // Search filter
        const searchTerm = this.searchInput.value.toLowerCase();
        if (searchTerm) {
            filteredTasks = filteredTasks.filter(task =>
                task.title.toLowerCase().includes(searchTerm) ||
                (task.description && task.description.toLowerCase().includes(searchTerm)))
        }

        // Sort by due date (tasks with due date first, then by date)
        filteredTasks.sort((a, b) => {
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate) - new Date(b.dueDate);
            } else if (a.dueDate) {
                return -1;
            } else if (b.dueDate) {
                return 1;
            }
            return 0;
        });

        return filteredTasks;
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        this.tasks = savedTasks ? JSON.parse(savedTasks) : [];
    }

    // Helper methods
    formatDate(date) {
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatDateForInput(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showNotification(message, type = 'info') {
        this.notification.textContent = message;
        this.notification.className = `notification show ${type}`;

        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new TaskManager();
});