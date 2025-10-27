// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// State
let tasks = [];
let currentFilters = {
    status: '',
    priority: '',
    search: '',
    sortBy: 'created_at'
};

// DOM Elements
const taskModal = document.getElementById('taskModal');
const taskForm = document.getElementById('taskForm');
const addTaskBtn = document.getElementById('addTaskBtn');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const toast = document.getElementById('toast');

// Filter Elements
const statusFilter = document.getElementById('statusFilter');
const priorityFilter = document.getElementById('priorityFilter');
const sortBySelect = document.getElementById('sortBy');
const searchInput = document.getElementById('searchInput');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadTasks();
});

// Event Listeners
function setupEventListeners() {
    addTaskBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    taskForm.addEventListener('submit', handleFormSubmit);
    
    // Filters
    statusFilter.addEventListener('change', (e) => {
        currentFilters.status = e.target.value;
        renderTasks();
    });
    
    priorityFilter.addEventListener('change', (e) => {
        currentFilters.priority = e.target.value;
        renderTasks();
    });
    
    sortBySelect.addEventListener('change', (e) => {
        currentFilters.sortBy = e.target.value;
        renderTasks();
    });
    
    searchInput.addEventListener('input', (e) => {
        currentFilters.search = e.target.value.toLowerCase();
        renderTasks();
    });
    
    // Close modal on outside click
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) closeModal();
    });
}

// API Functions
async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showToast(`Error: ${error.message}`, 'error');
        throw error;
    }
}

async function loadTasks() {
    showLoading(true);
    try {
        const data = await apiRequest('/tasks/');
        tasks = data;
        renderTasks();
        updateStats();
    } catch (error) {
        console.error('Failed to load tasks:', error);
    } finally {
        showLoading(false);
    }
}

async function createTask(taskData) {
    showLoading(true);
    try {
        await apiRequest('/tasks/', 'POST', taskData);
        showToast('Task created successfully!', 'success');
        await loadTasks();
        closeModal();
    } catch (error) {
        console.error('Failed to create task:', error);
    } finally {
        showLoading(false);
    }
}

async function updateTask(taskId, taskData) {
    showLoading(true);
    try {
        await apiRequest(`/tasks/${taskId}/`, 'PATCH', taskData);
        showToast('Task updated successfully!', 'success');
        await loadTasks();
        closeModal();
    } catch (error) {
        console.error('Failed to update task:', error);
    } finally {
        showLoading(false);
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    showLoading(true);
    try {
        await apiRequest(`/tasks/${taskId}/`, 'DELETE');
        showToast('Task deleted successfully!', 'success');
        await loadTasks();
    } catch (error) {
        console.error('Failed to delete task:', error);
    } finally {
        showLoading(false);
    }
}

// UI Functions
function openModal(task = null) {
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtn');
    
    if (task) {
        // Edit mode
        modalTitle.textContent = 'Edit Task';
        submitBtn.textContent = 'Update Task';
        fillForm(task);
    } else {
        // Create mode
        modalTitle.textContent = 'Create New Task';
        submitBtn.textContent = 'Create Task';
        taskForm.reset();
        document.getElementById('taskId').value = '';
    }
    
    taskModal.classList.add('active');
}

function closeModal() {
    taskModal.classList.remove('active');
    taskForm.reset();
}

function fillForm(task) {
    document.getElementById('taskId').value = task.id;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskStatus').value = task.status;
    
    if (task.due_date) {
        // Convert ISO datetime to datetime-local format
        const date = new Date(task.due_date);
        const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        document.getElementById('taskDueDate').value = localDateTime;
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('taskId').value;
    const taskData = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        priority: document.getElementById('taskPriority').value,
        status: document.getElementById('taskStatus').value,
    };
    
    const dueDateInput = document.getElementById('taskDueDate').value;
    if (dueDateInput) {
        taskData.due_date = new Date(dueDateInput).toISOString();
    }
    
    if (taskId) {
        updateTask(taskId, taskData);
    } else {
        createTask(taskData);
    }
}

function renderTasks() {
    const filteredTasks = filterTasks(tasks);
    const sortedTasks = sortTasks(filteredTasks);
    
    // Clear all columns
    document.getElementById('todoTasks').innerHTML = '';
    document.getElementById('progressTasks').innerHTML = '';
    document.getElementById('doneTasks').innerHTML = '';
    
    // Group by status
    const grouped = {
        todo: [],
        in_progress: [],
        done: []
    };
    
    sortedTasks.forEach(task => {
        grouped[task.status].push(task);
    });
    
    // Render each column
    renderColumn('todoTasks', grouped.todo, 'todoColumnCount');
    renderColumn('progressTasks', grouped.in_progress, 'progressColumnCount');
    renderColumn('doneTasks', grouped.done, 'doneColumnCount');
}

function renderColumn(columnId, tasks, countId) {
    const column = document.getElementById(columnId);
    const countEl = document.getElementById(countId);
    
    countEl.textContent = tasks.length;
    
    if (tasks.length === 0) {
        column.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <div class="empty-state-text">No tasks here</div>
            </div>
        `;
        return;
    }
    
    column.innerHTML = tasks.map(task => createTaskCard(task)).join('');
    
    // Add event listeners
    tasks.forEach(task => {
        const card = column.querySelector(`[data-task-id="${task.id}"]`);
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.task-action-btn')) {
                openModal(task);
            }
        });
        
        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTask(task.id);
        });
    });
}

function createTaskCard(task) {
    const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : '';
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
    
    return `
        <div class="task-card priority-${task.priority}" data-task-id="${task.id}">
            <div class="task-header">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <div class="task-actions">
                    <button class="task-action-btn delete-btn" title="Delete">🗑️</button>
                </div>
            </div>
            ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
            <div class="task-meta">
                <span class="task-badge priority-badge ${task.priority}">${task.priority}</span>
                ${dueDate ? `<span class="due-date ${isOverdue ? 'overdue' : ''}">📅 ${dueDate}</span>` : ''}
            </div>
        </div>
    `;
}

function filterTasks(tasks) {
    return tasks.filter(task => {
        // Status filter
        if (currentFilters.status && task.status !== currentFilters.status) {
            return false;
        }
        
        // Priority filter
        if (currentFilters.priority && task.priority !== currentFilters.priority) {
            return false;
        }
        
        // Search filter
        if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase();
            const titleMatch = task.title.toLowerCase().includes(searchLower);
            const descMatch = task.description && task.description.toLowerCase().includes(searchLower);
            if (!titleMatch && !descMatch) {
                return false;
            }
        }
        
        return true;
    });
}

function sortTasks(tasks) {
    const sorted = [...tasks];
    const sortBy = currentFilters.sortBy;
    
    sorted.sort((a, b) => {
        if (sortBy === 'priority') {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        } else if (sortBy === 'due_date') {
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;
            return new Date(a.due_date) - new Date(b.due_date);
        } else {
            // created_at
            return new Date(b.created_at) - new Date(a.created_at);
        }
    });
    
    return sorted;
}

function updateStats() {
    const stats = {
        todo: tasks.filter(t => t.status === 'todo').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        done: tasks.filter(t => t.status === 'done').length,
        total: tasks.length
    };
    
    document.getElementById('todoCount').textContent = stats.todo;
    document.getElementById('progressCount').textContent = stats.in_progress;
    document.getElementById('doneCount').textContent = stats.done;
    document.getElementById('totalCount').textContent = stats.total;
}

function showLoading(show) {
    if (show) {
        loadingOverlay.classList.add('active');
    } else {
        loadingOverlay.classList.remove('active');
    }
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
