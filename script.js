// Данные пользователя
let userData = {
    name: '',
    email: '',
    registrationDate: ''
};

// Данные для хранения задач по датам
let tasksByDate = JSON.parse(localStorage.getItem('tasksByDate')) || {};
let routineData = JSON.parse(localStorage.getItem('routineData')) || {};
let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};

// Текущая выбранная дата
let currentSelectedDate = new Date();

// Функция для переключения видимости пароля
function setupPasswordToggle(passwordInputId, toggleButtonId) {
    const passwordInput = document.getElementById(passwordInputId);
    const toggleButton = document.getElementById(toggleButtonId);
    
    toggleButton.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Меняем иконку
        if (type === 'text') {
            toggleButton.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
        }
    });
}

// Управление экранами авторизации
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const formId = this.getAttribute('data-form');
        
        document.querySelectorAll('.auth-tab').forEach(t => {
            t.classList.remove('active');
        });
        
        this.classList.add('active');
        
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        
        document.getElementById(formId).classList.add('active');
    });
});

// Обработка формы входа
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'block';
    initializeApp();
});

// Обработка формы регистрации
document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (password !== confirmPassword) {
        alert('Пароли не совпадают!');
        return;
    }
    
    userData = {
        name: name,
        email: email,
        registrationDate: new Date().toLocaleDateString('ru-RU')
    };
    
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'block';
    initializeApp();
});

// Функции для работы с аккаунтом
function openAccountModal() {
    document.getElementById('account-modal').classList.add('active');
    updateAccountInfo();
}

function closeAccountModal() {
    document.getElementById('account-modal').classList.remove('active');
}

function updateAccountInfo() {
    document.getElementById('account-display-name').textContent = userData.name || 'Пользователь';
    document.getElementById('account-display-email').textContent = userData.email || 'email@example.com';
    document.getElementById('account-info-name').textContent = userData.name || 'Пользователь';
    document.getElementById('account-info-email').textContent = userData.email || 'email@example.com';
    document.getElementById('account-registration-date').textContent = userData.registrationDate || 'Не указана';
    
    // Подсчет выполненных задач
    let completedTasks = 0;
    Object.values(tasksByDate).forEach(tasks => {
        tasks.forEach(task => {
            if (task.completed) completedTasks++;
        });
    });
    document.getElementById('account-completed-tasks').textContent = completedTasks;
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        document.getElementById('app-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'block';
        
        // Очищаем формы
        document.getElementById('login-form').reset();
        document.getElementById('register-form').reset();
        
        closeAccountModal();
    }
}

// Функции для модального окна мероприятий
function openEventModal() {
    document.getElementById('eventModalOverlay').style.display = 'block';
    setTimeout(() => {
        document.getElementById('eventModalOverlay').classList.add('active');
    }, 10);
    document.getElementById('eventNameInput').focus();
    updateEventDoneButton();
}

function closeEventModal() {
    document.getElementById('eventModalOverlay').classList.remove('active');
    setTimeout(() => {
        document.getElementById('eventModalOverlay').style.display = 'none';
        document.getElementById('eventNameInput').value = '';
        document.getElementById('eventTimeInput').value = '';
    }, 300);
}

function updateEventDoneButton() {
    const eventName = document.getElementById('eventNameInput').value.trim();
    const eventTime = document.getElementById('eventTimeInput').value.trim();
    document.getElementById('eventDoneBtn').disabled = !(eventName && eventTime);
}

function addNewEvent() {
    const eventName = document.getElementById('eventNameInput').value.trim();
    const eventTime = document.getElementById('eventTimeInput').value.trim();
    
    if (eventName && eventTime) {
        const dateKey = `${selectedCalendarDate.getFullYear()}-${selectedCalendarDate.getMonth() + 1}-${selectedCalendarDate.getDate()}`;
        
        if (!events[dateKey]) {
            events[dateKey] = [];
        }
        
        events[dateKey].push({
            name: eventName,
            time: eventTime
        });
        
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        updateCalendar();
        updateEventsList();
        closeEventModal();
    }
}

// Инициализация приложения
function initializeApp() {
    // Настройка переключения видимости пароля
    setupPasswordToggle('login-password', 'login-password-toggle');
    setupPasswordToggle('register-password', 'register-password-toggle');
    setupPasswordToggle('register-confirm-password', 'register-confirm-password-toggle');

    // Обновляем текущую дату
    updateCurrentDate();

    // Элементы для главного экрана
    const currentDateEl = document.getElementById('currentDate');
    const datesScrollEl = document.getElementById('datesScroll');
    const dailyTasksEl = document.getElementById('dailyTasks');
    const routineTableEl = document.getElementById('routineTable');
    const dailyProgressEl = document.getElementById('dailyProgress');
    const dailyProgressBarEl = document.getElementById('dailyProgressBar');
    const weeklyProgressEl = document.getElementById('weeklyProgress');
    const weeklyProgressBarEl = document.getElementById('weeklyProgressBar');
    const modalOverlayEl = document.getElementById('modalOverlay');
    const taskInputEl = document.getElementById('taskInput');
    const backBtnEl = document.getElementById('backBtn');
    const doneBtnEl = document.getElementById('doneBtn');
    const openModalBtnEl = document.getElementById('openModalBtn');
    const categoryBtnEl = document.getElementById('categoryBtn');
    const timeBtnEl = document.getElementById('timeBtn');

    // Обработчики для аккаунта
    document.getElementById('account-icon').addEventListener('click', openAccountModal);
    document.getElementById('account-icon-calendar').addEventListener('click', openAccountModal);
    document.getElementById('close-account').addEventListener('click', closeAccountModal);
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Обработчики для модального окна мероприятий
    document.getElementById('add-event-btn').addEventListener('click', openEventModal);
    document.getElementById('eventBackBtn').addEventListener('click', closeEventModal);
    document.getElementById('eventDoneBtn').addEventListener('click', addNewEvent);
    document.getElementById('eventNameInput').addEventListener('input', updateEventDoneButton);
    document.getElementById('eventTimeInput').addEventListener('input', updateEventDoneButton);

    // Закрытие модальных окон по клику вне их
    document.getElementById('account-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAccountModal();
        }
    });

    document.getElementById('eventModalOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEventModal();
        }
    });

    // Функции для главного экрана
    function updateCurrentDate() {
        const now = currentSelectedDate;
        const monthNames = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня',
                           'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
        const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        document.getElementById('currentDate').textContent = 
            `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]}`;
    }

    function generateDates() {
        const today = new Date();
        datesScrollEl.innerHTML = '';
        
        // Генерируем даты на 2 недели вперед
        for (let i = -3; i <= 10; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);
            const isActive = date.toDateString() === currentSelectedDate.toDateString();
            
            const dateItem = document.createElement('div');
            dateItem.className = 'date-item' + (isActive ? ' active' : '');
            dateItem.setAttribute('data-date', date.toISOString().split('T')[0]);
            
            const dayNames = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
            const dayName = dayNames[date.getDay()];
            
            dateItem.innerHTML = `
                <div class="date-day">${dayName}</div>
                <div class="date-number">${date.getDate()}</div>
            `;
            
            dateItem.addEventListener('click', function() {
                const dateString = this.getAttribute('data-date');
                currentSelectedDate = new Date(dateString);
                
                document.querySelectorAll('.date-item').forEach(item => {
                    item.classList.remove('active');
                });
                this.classList.add('active');
                
                updateCurrentDate();
                loadTasksForDate(currentSelectedDate);
                updateRoutineCheckmarks();
            });
            
            datesScrollEl.appendChild(dateItem);
        }
    }

    function loadTasksForDate(date) {
        const dateKey = date.toISOString().split('T')[0];
        const tasks = tasksByDate[dateKey] || [];
        
        dailyTasksEl.innerHTML = '';
        
        tasks.forEach((task, index) => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <div class="task-checkbox ${task.completed ? 'checked' : ''}">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-text ${task.completed ? 'checked' : ''}">${task.text}</div>
            `;
            
            const checkbox = taskItem.querySelector('.task-checkbox');
            const taskText = taskItem.querySelector('.task-text');
            
            checkbox.addEventListener('click', function() {
                const isChecked = this.classList.contains('checked');
                this.classList.toggle('checked');
                taskText.classList.toggle('checked');
                
                if (isChecked) {
                    this.innerHTML = '';
                    tasks[index].completed = false;
                } else {
                    this.innerHTML = '<i class="fas fa-check"></i>';
                    tasks[index].completed = true;
                }
                
                // Сохраняем изменения
                tasksByDate[dateKey] = tasks;
                localStorage.setItem('tasksByDate', JSON.stringify(tasksByDate));
                
                updateDailyProgress();
                updateRoutineCheckmarks();
                updateAccountInfo(); // Обновляем статистику в аккаунте
            });
            
            dailyTasksEl.appendChild(taskItem);
        });
        
        updateDailyProgress();
    }

    function generateRoutineTable() {
        // Очищаем таблицу (оставляем заголовок)
        while (routineTableEl.rows.length > 1) {
            routineTableEl.deleteRow(1);
        }
        
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Создаем строки для всего месяца
        const weeks = Math.ceil(daysInMonth / 7);
        let totalCheckboxes = 0;
        let checkedCheckboxes = 0;
        
        for (let week = 0; week < weeks; week++) {
            const row = routineTableEl.insertRow();
            
            for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
                const cell = row.insertCell();
                const dayNumber = week * 7 + dayOfWeek + 1;
                
                if (dayNumber <= daysInMonth) {
                    totalCheckboxes++;
                    const checkbox = document.createElement('div');
                    checkbox.className = 'routine-checkbox';
                    
                    // Создаем уникальный ключ для дня
                    const dateKey = `${year}-${month + 1}-${dayNumber}`;
                    const dateObj = new Date(year, month, dayNumber);
                    
                    // Проверяем, есть ли данные для этого дня
                    if (routineData[dateKey]) {
                        checkbox.classList.add('checked');
                        checkbox.innerHTML = '<i class="fas fa-check"></i>';
                        checkedCheckboxes++;
                    }
                    
                    checkbox.addEventListener('click', function() {
                        this.classList.toggle('checked');
                        
                        if (this.classList.contains('checked')) {
                            this.innerHTML = '<i class="fas fa-check"></i>';
                            routineData[dateKey] = true;
                            checkedCheckboxes++;
                        } else {
                            this.innerHTML = '';
                            delete routineData[dateKey];
                            checkedCheckboxes--;
                        }
                        
                        // Сохраняем в localStorage
                        localStorage.setItem('routineData', JSON.stringify(routineData));
                        updateWeeklyProgress(totalCheckboxes, checkedCheckboxes);
                    });
                    
                    cell.appendChild(checkbox);
                } else {
                    cell.innerHTML = '';
                }
            }
        }
        
        // Обновляем прогресс с правильным количеством чекбоксов
        updateWeeklyProgress(totalCheckboxes, checkedCheckboxes);
    }

    function updateRoutineCheckmarks() {
        // Проверяем, все ли задачи выполнены для текущей даты
        const dateKey = currentSelectedDate.toISOString().split('T')[0];
        const tasks = tasksByDate[dateKey] || [];
        
        const allTasksCompleted = tasks.length > 0 && tasks.every(task => task.completed);
        
        if (allTasksCompleted) {
            // Добавляем галочку в рутину для текущей даты
            const year = currentSelectedDate.getFullYear();
            const month = currentSelectedDate.getMonth() + 1;
            const day = currentSelectedDate.getDate();
            const routineKey = `${year}-${month}-${day}`;
            routineData[routineKey] = true;
            localStorage.setItem('routineData', JSON.stringify(routineData));
            
            // Обновляем отображение рутины
            generateRoutineTable();
        }
    }

    function updateWeeklyProgress(totalDays, completedDays) {
        weeklyProgressEl.textContent = `${completedDays}/${totalDays} выполнено`;
        
        const progressPercentage = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
        weeklyProgressBarEl.style.width = `${progressPercentage}%`;
    }

    function updateDailyProgress() {
        const totalTasks = document.querySelectorAll('#dailyTasks .task-item').length;
        const completedTasks = document.querySelectorAll('#dailyTasks .task-checkbox.checked').length;
        
        dailyProgressEl.textContent = `${completedTasks}/${totalTasks} завершено`;
        
        const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        dailyProgressBarEl.style.width = `${progressPercentage}%`;
    }

    function openModal() {
        modalOverlayEl.style.display = 'block';
        setTimeout(() => {
            modalOverlayEl.classList.add('active');
        }, 10);
        taskInputEl.focus();
        updateDoneButton();
    }

    function closeModal() {
        modalOverlayEl.classList.remove('active');
        setTimeout(() => {
            modalOverlayEl.style.display = 'none';
            taskInputEl.value = '';
        }, 300);
    }

    function updateDoneButton() {
        const taskText = taskInputEl.value.trim();
        doneBtnEl.disabled = taskText === '';
    }

    function addNewTask() {
        const taskText = taskInputEl.value.trim();
        
        if (taskText !== '') {
            const dateKey = currentSelectedDate.toISOString().split('T')[0];
            
            if (!tasksByDate[dateKey]) {
                tasksByDate[dateKey] = [];
            }
            
            tasksByDate[dateKey].push({
                text: taskText,
                completed: false
            });
            
            localStorage.setItem('tasksByDate', JSON.stringify(tasksByDate));
            loadTasksForDate(currentSelectedDate);
            closeModal();
        }
    }

    // Навигация между экранами
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const screenId = this.getAttribute('data-screen');
            
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            
            document.getElementById(screenId).classList.add('active');
            
            document.querySelectorAll('.nav-btn').forEach(navBtn => {
                navBtn.classList.remove('active');
            });
            this.classList.add('active');
            
            if (screenId === 'calendar-screen') {
                updateCalendar();
            }
        });
    });

    // Обработчики событий для главного экрана
    openModalBtnEl.addEventListener('click', openModal);
    backBtnEl.addEventListener('click', closeModal);
    doneBtnEl.addEventListener('click', addNewTask);
    taskInputEl.addEventListener('input', updateDoneButton);
    categoryBtnEl.addEventListener('click', function() {
        alert('Выбор категории');
    });
    timeBtnEl.addEventListener('click', function() {
        alert('Выбор времени');
    });

    modalOverlayEl.addEventListener('click', function(e) {
        if (e.target === modalOverlayEl) {
            closeModal();
        }
    });

    // Инициализация главного экрана
    generateDates();
    generateRoutineTable();
    loadTasksForDate(currentSelectedDate);

    // Код календаря
    let currentCalendarDate = new Date();
    let selectedCalendarDate = new Date();
    const today = new Date();
    
    function populateYearSelect() {
        const yearSelect = document.getElementById('year-select');
        const currentYear = currentCalendarDate.getFullYear();
        
        yearSelect.innerHTML = '';
        
        for (let year = currentYear - 5; year <= currentYear + 5; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) {
                option.selected = true;
            }
            yearSelect.appendChild(option);
        }
    }
    
    function updateCalendar() {
        const monthSelect = document.getElementById('month-select');
        const yearSelect = document.getElementById('year-select');
        const calendarBody = document.getElementById('calendar-body');
        
        const month = parseInt(monthSelect.value);
        const year = parseInt(yearSelect.value);
        
        calendarBody.innerHTML = '';
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        const firstDayOfWeek = firstDay.getDay();
        const adjustedFirstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        
        let date = 1;
        
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');
            
            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                
                if (i === 0 && j < adjustedFirstDayOfWeek) {
                    const prevMonthLastDay = new Date(year, month, 0).getDate();
                    cell.textContent = prevMonthLastDay - adjustedFirstDayOfWeek + j + 1;
                    cell.classList.add('other-month');
                } else if (date > daysInMonth) {
                    cell.textContent = date - daysInMonth;
                    cell.classList.add('other-month');
                    date++;
                } else {
                    cell.textContent = date;
                    
                    // Проверяем, является ли день сегодняшним
                    const isToday = date === today.getDate() && 
                                  month === today.getMonth() && 
                                  year === today.getFullYear();
                    
                    // Проверяем, является ли день выбранным
                    const isSelected = date === selectedCalendarDate.getDate() && 
                                     month === selectedCalendarDate.getMonth() && 
                                     year === selectedCalendarDate.getFullYear();
                    
                    if (isToday) {
                        cell.classList.add('today');
                    }
                    
                    if (isSelected) {
                        cell.classList.add('selected');
                    }
                    
                    // Проверяем, есть ли события на этот день
                    const dateKey = `${year}-${month + 1}-${date}`;
                    if (events[dateKey] && events[dateKey].length > 0) {
                        cell.classList.add('has-event');
                    }
                    
                    // ИСПРАВЛЕНИЕ: Используем правильные месяц и год при клике
                    cell.addEventListener('click', function() {
                        // Берем актуальные значения из селекторов
                        const currentMonth = parseInt(monthSelect.value);
                        const currentYear = parseInt(yearSelect.value);
                        selectedCalendarDate = new Date(currentYear, currentMonth, date);
                        updateCalendar();
                        updateEventsList();
                    });
                    
                    date++;
                }
                
                row.appendChild(cell);
            }
            
            calendarBody.appendChild(row);
            
            if (date > daysInMonth) {
                break;
            }
        }
        
        updateEventsList();
    }
    
    function updateEventsList() {
        const eventsContainer = document.getElementById('events-container');
        const eventsTitle = document.getElementById('events-title');
        
        const dateKey = `${selectedCalendarDate.getFullYear()}-${selectedCalendarDate.getMonth() + 1}-${selectedCalendarDate.getDate()}`;
        const dayEvents = events[dateKey] || [];
        
        const monthNames = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня',
                           'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
        
        // Обновляем заголовок с выбранной датой
        const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        const dayName = dayNames[selectedCalendarDate.getDay()];
        const formattedDate = `${selectedCalendarDate.getDate()} ${monthNames[selectedCalendarDate.getMonth()]}`;
        
        eventsTitle.textContent = `Мероприятия на ${formattedDate}`;
        
        eventsContainer.innerHTML = '';
        
        if (dayEvents.length === 0) {
            eventsContainer.innerHTML = '<div class="no-events">Нет мероприятий на этот день</div>';
        } else {
            dayEvents.forEach((event, index) => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event-item';
                eventElement.innerHTML = `
                    <div class="event-info">
                        <div class="event-time">${event.time}</div>
                        <div class="event-name">${event.name}</div>
                    </div>
                    <div class="event-actions">
                        <button class="event-delete" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                eventsContainer.appendChild(eventElement);
            });

            // Добавляем обработчики для кнопок удаления
            document.querySelectorAll('.event-delete').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    deleteEvent(dateKey, index);
                });
            });
        }
    }

    function deleteEvent(dateKey, index) {
        if (events[dateKey]) {
            events[dateKey].splice(index, 1);
            if (events[dateKey].length === 0) {
                delete events[dateKey];
            }
            localStorage.setItem('calendarEvents', JSON.stringify(events));
            updateCalendar();
            updateEventsList();
        }
    }

    // Кнопка "Сегодня"
    document.getElementById('today-btn').addEventListener('click', function() {
        selectedCalendarDate = new Date();
        const monthSelect = document.getElementById('month-select');
        const yearSelect = document.getElementById('year-select');
        
        monthSelect.value = today.getMonth();
        yearSelect.value = today.getFullYear();
        
        updateCalendar();
        updateEventsList();
    });
    
    document.getElementById('prev-month').addEventListener('click', function() {
        const monthSelect = document.getElementById('month-select');
        const yearSelect = document.getElementById('year-select');
        
        let month = parseInt(monthSelect.value);
        let year = parseInt(yearSelect.value);
        
        month--;
        if (month < 0) {
            month = 11;
            year--;
        }
        
        monthSelect.value = month;
        yearSelect.value = year;
        
        updateCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', function() {
        const monthSelect = document.getElementById('month-select');
        const yearSelect = document.getElementById('year-select');
        
        let month = parseInt(monthSelect.value);
        let year = parseInt(yearSelect.value);
        
        month++;
        if (month > 11) {
            month = 0;
            year++;
        }
        
        monthSelect.value = month;
        yearSelect.value = year;
        
        updateCalendar();
    });
    
    document.getElementById('month-select').addEventListener('change', updateCalendar);
    document.getElementById('year-select').addEventListener('change', updateCalendar);
    
    // Инициализация календаря
    populateYearSelect();
    document.getElementById('month-select').value = today.getMonth();
    document.getElementById('year-select').value = today.getFullYear();
    updateCalendar();

    console.log('Приложение инициализировано');
}

// Показываем экран авторизации при загрузке
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('auth-screen').style.display = 'block';
    document.getElementById('app-screen').style.display = 'none';
});