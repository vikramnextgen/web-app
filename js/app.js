// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const datePicker = document.getElementById('date-picker');
const todoList = document.getElementById('todo-list');
const filterButtons = document.querySelectorAll('.filter-btn');
const itemsLeftSpan = document.getElementById('items-left');
const clearCompletedBtn = document.getElementById('clear-completed');
const toast = document.getElementById('toast');
const toastMessage = document.querySelector('.toast-message');

// Variables
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// Initialize the app
function init() {
    // Initialize flatpickr date picker
    flatpickr(datePicker, {
        dateFormat: "Y-m-d",
        defaultDate: new Date(),
        disableMobile: false,
        static: true
    });

    // Load todos
    renderTodos();
    updateItemsLeft();
}

// Format date for display
function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    return date.toLocaleDateString(undefined, options);
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Show toast notification
function showToast(message, type = 'success') {
    // Set message
    toastMessage.textContent = message;
    
    // Set icon based on type
    const toastIcon = document.querySelector('.toast-icon');
    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle toast-icon';
        toastIcon.style.color = '#2ecc71';
    } else if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle toast-icon';
        toastIcon.style.color = '#e74c3c';
    } else if (type === 'warning') {
        toastIcon.className = 'fas fa-exclamation-triangle toast-icon';
        toastIcon.style.color = '#f39c12';
    } else if (type === 'info') {
        toastIcon.className = 'fas fa-info-circle toast-icon';
        toastIcon.style.color = '#3498db';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Add a new todo
function addTodo(text, date) {
    if (text.trim() === '') {
        showToast('Please enter a task', 'error');
        return;
    }
    
    if (!date) {
        date = new Date().toISOString().split('T')[0]; // Default to today
    }
    
    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        date: date
    };
    
    todos.unshift(newTodo);
    saveTodos();
    renderTodos();
    updateItemsLeft();
    showToast('Task successfully added!', 'success');
}

// Delete a todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
    updateItemsLeft();
    showToast('Task deleted', 'info');
}

// Toggle todo completion status
function toggleTodoStatus(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            const newStatus = !todo.completed;
            showToast(newStatus ? 'Task completed!' : 'Task marked as active', newStatus ? 'success' : 'info');
            return { ...todo, completed: newStatus };
        }
        return todo;
    });
    
    saveTodos();
    renderTodos();
    updateItemsLeft();
}

// Clear all completed todos
function clearCompleted() {
    const completedCount = todos.filter(todo => todo.completed).length;
    
    if (completedCount === 0) {
        showToast('No completed tasks to clear', 'warning');
        return;
    }
    
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
    updateItemsLeft();
    showToast(`Cleared ${completedCount} completed task${completedCount !== 1 ? 's' : ''}`, 'info');
}

// Update items left count
function updateItemsLeft() {
    const activeCount = todos.filter(todo => !todo.completed).length;
    itemsLeftSpan.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
}

// Render todos based on current filter
function renderTodos() {
    todoList.innerHTML = '';
    
    // Apply current filter
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true; // 'all' filter
    });
    
    if (filteredTodos.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.classList.add('todo-item', 'empty-list');
        emptyMessage.innerHTML = `<span class="todo-text">No tasks found</span>`;
        todoList.appendChild(emptyMessage);
        return;
    }
    
    filteredTodos.forEach(todo => {
        const todoItem = document.createElement('li');
        todoItem.classList.add('todo-item');
        if (todo.completed) {
            todoItem.classList.add('completed');
        }
        
        todoItem.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <div class="todo-content">
                <span class="todo-text">${todo.text}</span>
                <span class="todo-date">${formatDateForDisplay(todo.date)}</span>
            </div>
            <button class="delete-btn"><i class="fas fa-trash"></i></button>
        `;
        
        const checkbox = todoItem.querySelector('.todo-checkbox');
        const deleteBtn = todoItem.querySelector('.delete-btn');
        
        checkbox.addEventListener('change', () => toggleTodoStatus(todo.id));
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
        
        todoList.appendChild(todoItem);
    });
}

// Set active filter
function setFilter(filter) {
    currentFilter = filter;
    
    // Update active filter button
    filterButtons.forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderTodos();
}

// Event Listeners
todoForm.addEventListener('submit', e => {
    e.preventDefault();
    addTodo(todoInput.value, datePicker.value);
    todoInput.value = '';
    datePicker._flatpickr.setDate(new Date()); // Reset date picker to today
});

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
    });
});

clearCompletedBtn.addEventListener('click', clearCompleted);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);