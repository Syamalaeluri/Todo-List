document.addEventListener('DOMContentLoaded', () => {
    // Views
    const mainView = document.getElementById('mainView');
    const addTaskView = document.getElementById('addTaskView');
    const settingsView = document.getElementById('settingsView');
    const notificationsView = document.getElementById('notificationsView');
    const accountView = document.getElementById('accountView');
    const aboutView = document.getElementById('aboutView');

    // Buttons
    const openAddTaskBtn = document.getElementById('openAddTaskBtn');
    const backBtn = document.getElementById('backBtn');
    const createTaskBtn = document.getElementById('createTaskBtn');

    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const notificationBtn = document.getElementById('notificationBtn');
    const closeNotificationsBtn = document.getElementById('closeNotificationsBtn');
    const accountBtn = document.getElementById('accountBtn');
    const aboutBtn = document.getElementById('aboutBtn');
    const closeAccountBtn = document.getElementById('closeAccountBtn');
    const closeAboutBtn = document.getElementById('closeAboutBtn');
    const darkModeToggle = document.getElementById('darkModeToggle');

    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const appTitle = document.getElementById('appTitle');

    // Inputs
    const taskInput = document.getElementById('taskInput');
    const taskStart = document.getElementById('taskStart');
    const taskEnd = document.getElementById('taskEnd');
    const taskCategory = document.getElementById('taskCategory');

    // Areas
    const taskList = document.getElementById('taskList');
    const completedTaskList = document.getElementById('completedTaskList');
    const toast = document.getElementById('toast');
    const categoryCards = document.querySelectorAll('.category-card');

    // Tabs
    const tabToday = document.getElementById('tabToday');
    const tabCompleted = document.getElementById('tabCompleted');

    let currentCategoryFilter = null;

    fetchTasks();

    // Navigation
    openAddTaskBtn.addEventListener('click', () => {
        mainView.classList.add('view-hidden');
        addTaskView.classList.remove('view-hidden');
    });

    backBtn.addEventListener('click', () => {
        addTaskView.classList.add('view-hidden');
        mainView.classList.remove('view-hidden');
    });

    settingsBtn.addEventListener('click', () => {
        mainView.classList.add('view-hidden');
        settingsView.classList.remove('view-hidden');
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsView.classList.add('view-hidden');
        mainView.classList.remove('view-hidden');
    });

    notificationBtn.addEventListener('click', () => {
        mainView.classList.add('view-hidden');
        notificationsView.classList.remove('view-hidden');
    });

    closeNotificationsBtn.addEventListener('click', () => {
        notificationsView.classList.add('view-hidden');
        mainView.classList.remove('view-hidden');
    });

    accountBtn.addEventListener('click', () => {
        settingsView.classList.add('view-hidden');
        accountView.classList.remove('view-hidden');
    });

    closeAccountBtn.addEventListener('click', () => {
        accountView.classList.add('view-hidden');
        settingsView.classList.remove('view-hidden');
    });

    aboutBtn.addEventListener('click', () => {
        settingsView.classList.add('view-hidden');
        aboutView.classList.remove('view-hidden');
    });

    closeAboutBtn.addEventListener('click', () => {
        aboutView.classList.add('view-hidden');
        settingsView.classList.remove('view-hidden');
    });

    darkModeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    });

    searchBtn.addEventListener('click', () => {
        if (searchInput.classList.contains('view-hidden')) {
            searchInput.classList.remove('view-hidden');
            appTitle.classList.add('view-hidden');
            searchInput.focus();
        } else {
            searchInput.classList.add('view-hidden');
            appTitle.classList.remove('view-hidden');
            searchInput.value = '';
            // reset search
            const allTasks = document.querySelectorAll('.task-item');
            allTasks.forEach(task => task.style.display = 'flex');
        }
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const allTasks = document.querySelectorAll('.task-item');
        allTasks.forEach(task => {
            const title = task.querySelector('.task-title').textContent.toLowerCase();
            if (title.includes(query)) {
                task.style.display = 'flex';
            } else {
                task.style.display = 'none';
            }
        });
    });

    // Filtering by Category on Main Page
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const isAlreadyActive = card.style.opacity === '0.5' ? false : card.dataset.active === 'true';

            categoryCards.forEach(c => {
                c.style.opacity = '1';
                c.dataset.active = 'false';
            });

            if (isAlreadyActive) {
                currentCategoryFilter = null; // deselect
            } else {
                categoryCards.forEach(c => {
                    if (c !== card) c.style.opacity = '0.5';
                });
                card.dataset.active = 'true';
                currentCategoryFilter = card.dataset.category;
            }
            fetchTasks();
        });
    });

    // Tab toggling logic
    tabToday.addEventListener('click', () => {
        tabToday.classList.add('active');
        tabToday.classList.remove('inactive');
        tabCompleted.classList.remove('active');
        tabCompleted.classList.add('inactive');

        taskList.classList.remove('view-hidden');
        completedTaskList.classList.add('view-hidden');
    });

    tabCompleted.addEventListener('click', () => {
        tabCompleted.classList.add('active');
        tabCompleted.classList.remove('inactive');
        tabToday.classList.remove('active');
        tabToday.classList.add('inactive');

        completedTaskList.classList.remove('view-hidden');
        taskList.classList.add('view-hidden');
    });


    // Create Task
    createTaskBtn.addEventListener('click', async () => {
        const title = taskInput.value.trim();
        if (!title) {
            showToast('Please enter a task label', true);
            return;
        }

        const timeString = `${taskStart.value} - ${taskEnd.value}`;
        const category = taskCategory.value;

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    time: timeString,
                    category: category
                })
            });

            if (res.ok) {
                taskInput.value = '';
                fetchTasks();
                backBtn.click(); // go back to main view
                showToast('Task added successfully');
            } else {
                showToast('Failed to add task', true);
            }
        } catch (error) {
            showToast('Network error', true);
        }
    });

    // Core Logic
    async function fetchTasks() {
        try {
            const res = await fetch('/api/tasks');
            const data = await res.json();
            renderTasks(data.tasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }

    async function toggleTaskStatus(id, newStatus) {
        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: newStatus })
            });
            if (res.ok) fetchTasks();
        } catch (error) {
            console.error(error);
        }
    }

    async function deleteTask(id) {
        try {
            const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchTasks();
                showToast('Task deleted');
            }
        } catch (error) {
            console.error(error);
        }
    }

    function renderTasks(tasks) {
        taskList.innerHTML = '';
        completedTaskList.innerHTML = '';

        let filteredTasks = tasks;
        if (currentCategoryFilter) {
            filteredTasks = tasks.filter(t => t.category === currentCategoryFilter);
        }

        const activeTasks = filteredTasks.filter(t => !t.completed);
        const completedTasks = filteredTasks.filter(t => t.completed);

        if (activeTasks.length === 0) {
            taskList.innerHTML = `<div class="empty-state">No tasks to show here.</div>`;
        } else {
            activeTasks.forEach(task => taskList.appendChild(createTaskElement(task)));
        }

        if (completedTasks.length === 0) {
            completedTaskList.innerHTML = `<div class="empty-state">No completed tasks.</div>`;
        } else {
            completedTasks.forEach(task => completedTaskList.appendChild(createTaskElement(task)));
        }
    }

    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;

        const timeDisplay = task.time ? task.time : 'No time specified';

        li.innerHTML = `
            <div class="checkbox">
                <i class="fa-solid fa-check"></i>
            </div>
            <div class="task-details">
                <span class="task-title">${escapeHTML(task.title)}</span>
                <span class="task-time">${escapeHTML(timeDisplay)}</span>
            </div>
            <button class="delete-btn" aria-label="Delete Task"><i class="fa-solid fa-trash"></i></button>
        `;

        li.querySelector('.checkbox').addEventListener('click', () => {
            // Instantly show local state change
            if (!task.completed) {
                li.classList.add('completed');
            } else {
                li.classList.remove('completed');
            }
            // Add a slight delay before shifting lists so the user sees the checkmark
            setTimeout(() => {
                toggleTaskStatus(task.id, !task.completed);
            }, 300);
        });

        li.querySelector('.delete-btn').addEventListener('click', () => {
            deleteTask(task.id);
        });

        return li;
    }

    function showToast(message, isError = false) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[tag] || tag));
    }

    // Dismiss notifications logic
    const dismissBtns = document.querySelectorAll('.dismiss-notification-btn');
    const badge = document.querySelector('.notification .badge');

    function updateBadge() {
        const remaining = document.querySelectorAll('.notification-item').length;
        const noMsg = document.getElementById('noNotificationsMsg');
        if (remaining === 0) {
            badge.style.display = 'none';
            if (noMsg) noMsg.classList.remove('view-hidden');
        } else {
            badge.style.display = 'block';
            if (noMsg) noMsg.classList.add('view-hidden');
        }
    }

    dismissBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.closest('.notification-item');
            if (item) {
                // smooth fade out
                item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                item.style.opacity = '0';
                item.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    item.remove();
                    updateBadge();
                }, 300); // match transition time
            }
        });
    });

    // Initialize badge state
    updateBadge();
});
