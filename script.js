// DOM Elements
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const tasksLeft = document.getElementById('tasks-left');
const clearCompletedBtn = document.getElementById('clear-completed');
const sparkleContainer = document.getElementById('sparkle-container');
const container = document.querySelector('.container');

// Create snowflakes
function createSnowflakes() {
    const snowflakesContainer = document.querySelector('.snowflakes');
    const snowflakeCount = 30;
    
    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.innerHTML = '❄';
        snowflake.style.left = `${Math.random() * 100}%`;
        snowflake.style.opacity = Math.random();
        snowflake.style.fontSize = `${Math.random() * 1 + 0.5}em`;
        snowflake.style.animationDuration = `${Math.random() * 10 + 5}s`;
        snowflake.style.animationDelay = `${Math.random() * 5}s`;
        snowflakesContainer.appendChild(snowflake);
    }
}

// Create sparkle effect
function createSparkles(x, y) {
    const sparkleCount = 15;
    
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = `${x + (Math.random() * 40 - 20)}px`;
        sparkle.style.top = `${y + (Math.random() * 40 - 20)}px`;
        sparkle.style.transform = `scale(${Math.random() * 0.5 + 0.5})`;
        sparkle.style.opacity = Math.random() * 0.5 + 0.5;
        
        // Randomize sparkle color between pink and blue
        const colors = ['#ffb6e6', '#a0e7ff'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        sparkle.style.filter = `hue-rotate(${Math.random() * 60 - 30}deg) brightness(1.2)`;
        
        sparkleContainer.appendChild(sparkle);
        
        // Animate sparkle
        gsap.to(sparkle, {
            x: Math.random() * 100 - 50,
            y: Math.random() * 100 - 50,
            opacity: 0,
            scale: 0,
            duration: 1,
            ease: "power2.out",
            onComplete: () => sparkle.remove()
        });
    }
}

// Load tasks from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Render tasks
function renderTasks(filter = 'all') {
    taskList.innerHTML = '';
    
    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true;
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
    });
    
    if (filteredTasks.length === 0) {
        const noTasks = document.createElement('p');
        noTasks.className = 'no-tasks';
        noTasks.textContent = 'No tasks here! Just like Elsa\'s empty ice palace...';
        taskList.appendChild(noTasks);
    } else {
        filteredTasks.forEach((task, index) => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item animate__animated animate__fadeIn';
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-index="${index}">
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.description}</span>
                <button class="delete-btn" data-index="${index}"><i class="fas fa-trash"></i></button>
            `;
            taskList.appendChild(taskItem);
        });
    }
    
    updateTasksLeft();
}

// Add new task with sparkles
function addTask() {
    const description = taskInput.value.trim();
    if (description) {
        // Create sparkles at button position
        const rect = addBtn.getBoundingClientRect();
        createSparkles(rect.left + rect.width/2, rect.top + rect.height/2);
        
        // Add task with animation
        tasks.push({ description, completed: false });
        saveTasks();
        taskInput.value = '';
        
        // Animate container for fun
        gsap.to(container, {
            y: -10,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: "power1.inOut"
        });
        
        renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
    }
}

// Toggle task completion
function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    
    // Add snowflake animation for completed tasks
    if (tasks[index].completed) {
        const taskItem = document.querySelector(`.task-checkbox[data-index="${index}"]`).closest('.task-item');
        gsap.fromTo(taskItem, 
            { scale: 1 }, 
            { scale: 1.05, duration: 0.2, yoyo: true, repeat: 1 }
        );
    }
    
    renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
}

// Delete task with animation
function deleteTask(index) {
    const taskItem = document.querySelector(`.delete-btn[data-index="${index}"]`).closest('.task-item');
    gsap.to(taskItem, {
        opacity: 0,
        x: 100,
        duration: 0.3,
        onComplete: () => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
        }
    });
}

// Clear completed tasks
function clearCompleted() {
    // Create melting animation
    const completedItems = document.querySelectorAll('.task-item input[type="checkbox"]:checked');
    completedItems.forEach(item => {
        const taskItem = item.closest('.task-item');
        gsap.to(taskItem, {
            opacity: 0,
            y: 20,
            scale: 0.9,
            duration: 0.3,
            ease: "power2.in"
        });
    });
    
    setTimeout(() => {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
    }, 300);
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Update tasks left counter
function updateTasksLeft() {
    const activeTasks = tasks.filter(task => !task.completed).length;
    tasksLeft.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} left to conquer`;
}

// Event Listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

taskList.addEventListener('click', (e) => {
    if (e.target.classList.contains('task-checkbox')) {
        toggleTask(parseInt(e.target.dataset.index));
    } else if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
        const btn = e.target.classList.contains('delete-btn') ? e.target : e.target.closest('.delete-btn');
        deleteTask(parseInt(btn.dataset.index));
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTasks(btn.dataset.filter);
    });
});

clearCompletedBtn.addEventListener('click', clearCompleted);

// Initialize
createSnowflakes();
renderTasks();