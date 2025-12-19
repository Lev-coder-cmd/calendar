class Calendar {
    constructor(containerId) {
        this.container = document.querySelector(containerId);
        this.currentDate = new Date();
        this.selectedDate = null;
        this.editingEventId = null; // ID события, которое редактируем
        this.events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
        
        this.months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        
        this.daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        
        this.init();
    }
    
    init() {
        this.renderHeader();
        this.renderCalendar();
        this.setupEventListeners();
        this.updateSelectedDateInfo();
    }
    
    renderHeader() {
        const monthElement = document.querySelector('#currentMonth');
        if (monthElement) {
            monthElement.textContent = `${this.months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        }
    }
    
    renderCalendar() {
        this.container.innerHTML = '';
        
        // Добавляем заголовки дней недели
        this.daysOfWeek.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-header-day';
            dayHeader.textContent = day;
            this.container.appendChild(dayHeader);
        });
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        let firstDayOfWeek = firstDay.getDay();
        if (firstDayOfWeek === 0) firstDayOfWeek = 7;
        
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        
        let dayCounter = 1;
        let nextMonthDay = 1;
        
        for (let i = 1; i <= 42; i++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'day';
            
            let dayNumber, isCurrentMonth, isToday, date;
            
            if (i < firstDayOfWeek) {
                dayNumber = prevMonthLastDay - firstDayOfWeek + i + 1;
                isCurrentMonth = false;
                date = new Date(year, month - 1, dayNumber);
            } else if (dayCounter <= daysInMonth) {
                dayNumber = dayCounter;
                isCurrentMonth = true;
                date = new Date(year, month, dayNumber);
                dayCounter++;
            } else {
                dayNumber = nextMonthDay;
                isCurrentMonth = false;
                date = new Date(year, month + 1, dayNumber);
                nextMonthDay++;
            }
            
            const today = new Date();
            isToday = date.getDate() === today.getDate() &&
                     date.getMonth() === today.getMonth() &&
                     date.getFullYear() === today.getFullYear();
            
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            
            const dateString = this.formatDate(date);
            dayCell.dataset.date = dateString;
            
            if (!isCurrentMonth) dayCell.classList.add('other-month');
            if (isToday) dayCell.classList.add('today');
            if (isWeekend) dayCell.classList.add('day-off');
            if (this.selectedDate && this.formatDate(this.selectedDate) === dateString) {
                dayCell.classList.add('selected');
            }
            if (this.events[dateString]) {
                dayCell.classList.add('has-events');
            }
            
            dayCell.innerHTML = `
                <div class="day-number">${dayNumber}</div>
                <div class="day-events">
                    ${this.renderDayEvents(dateString)}
                </div>
            `;
            
            dayCell.addEventListener('click', () => this.selectDate(date));
            
            this.container.appendChild(dayCell);
        }
        
        this.updateSelectedDateInfo();
    }
    
    // ОБНОВЛЁННЫЙ МЕТОД ДЛЯ ОТОБРАЖЕНИЯ СОБЫТИЙ С КНОПКАМИ
    renderDayEvents(dateString) {
        if (!this.events[dateString]) return '';
        
        const events = this.events[dateString];
        let html = '';
        
        events.slice(0, 2).forEach(event => {
            html += `
                <div class="day-event" 
                     data-event-id="${event.id}"
                     title="${event.title}${event.time ? ' в ' + event.time : ''}">
                    ${event.title}
                </div>
            `;
        });
        
        if (events.length > 2) {
            html += `<div class="day-event-more">+${events.length - 2} еще</div>`;
        }
        
        return html;
    }
    
    selectDate(date) {
        this.selectedDate = date;
        
        document.querySelectorAll('.day').forEach(day => {
            day.classList.remove('selected');
        });
        
        const dateString = this.formatDate(date);
        const selectedDay = document.querySelector(`.day[data-date="${dateString}"]`);
        if (selectedDay) {
            selectedDay.classList.add('selected');
        }
        
        this.updateSelectedDateInfo();
    }
    
    // ОБНОВЛЁННЫЙ МЕТОД ДЛЯ ОТОБРАЖЕНИЯ ИНФОРМАЦИИ О ВЫБРАННОЙ ДАТЕ С КНОПКАМИ
    updateSelectedDateInfo() {
        const dateDisplay = document.querySelector('.date-display');
        const eventsList = document.querySelector('.events-list');
        
        if (!dateDisplay || !eventsList) return;
        
        if (this.selectedDate) {
            const dateString = this.formatDate(this.selectedDate, true);
            dateDisplay.textContent = dateString;
            
            const events = this.events[this.formatDate(this.selectedDate)] || [];
            if (events.length > 0) {
                let eventsHTML = '<ul class="events-list-container">';
                events.forEach(event => {
                    eventsHTML += `
                        <li class="event-item" data-event-id="${event.id}">
                            <div class="event-header">
                                <strong class="event-title">${event.title}</strong>
                                <div class="event-actions">
                                    <button class="edit-event-btn" title="Редактировать">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="delete-event-btn" title="Удалить">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            ${event.time ? `<div class="event-time"><i class="far fa-clock"></i> ${event.time}</div>` : ''}
                            ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
                        </li>
                    `;
                });
                eventsHTML += '</ul>';
                eventsList.innerHTML = eventsHTML;
                
                // Добавляем обработчики для кнопок редактирования и удаления
                this.attachEventActionsListeners();
            } else {
                eventsList.innerHTML = '<p class="no-events">Событий на эту дату нет</p>';
            }
        } else {
            dateDisplay.textContent = 'Дата не выбрана';
            eventsList.innerHTML = '<p class="no-events">Выберите дату для просмотра событий</p>';
        }
    }
    
    // НОВЫЙ МЕТОД: ПРИВЯЗКА ОБРАБОТЧИКОВ К КНОПКАМ СОБЫТИЙ
    attachEventActionsListeners() {
        // Кнопки редактирования
        document.querySelectorAll('.edit-event-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventItem = e.target.closest('.event-item');
                const eventId = parseInt(eventItem.dataset.eventId);
                this.editEvent(eventId);
            });
        });
        
        // Кнопки удаления
        document.querySelectorAll('.delete-event-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventItem = e.target.closest('.event-item');
                const eventId = parseInt(eventItem.dataset.eventId);
                this.confirmDeleteEvent(eventId);
            });
        });
        
        // Клик по событию для быстрого просмотра/редактирования
        document.querySelectorAll('.event-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.event-actions')) {
                    const eventId = parseInt(item.dataset.eventId);
                    this.showEventDetails(eventId);
                }
            });
        });
    }
    
    // НОВЫЙ МЕТОД: ПОДТВЕРЖДЕНИЕ УДАЛЕНИЯ СОБЫТИЯ
    confirmDeleteEvent(eventId) {
        if (confirm('Вы уверены, что хотите удалить это событие?')) {
            this.deleteEvent(eventId);
        }
    }
    
    // НОВЫЙ МЕТОД: УДАЛЕНИЕ СОБЫТИЯ
    deleteEvent(eventId) {
        let eventDeleted = false;
        
        // Ищем событие во всех датах
        for (const dateString in this.events) {
            const eventIndex = this.events[dateString].findIndex(event => event.id === eventId);
            
            if (eventIndex !== -1) {
                // Удаляем событие из массива
                this.events[dateString].splice(eventIndex, 1);
                
                // Если массив событий для этой даты стал пустым, удаляем дату
                if (this.events[dateString].length === 0) {
                    delete this.events[dateString];
                }
                
                eventDeleted = true;
                break;
            }
        }
        
        if (eventDeleted) {
            // Сохраняем в localStorage
            localStorage.setItem('calendarEvents', JSON.stringify(this.events));
            
            // Перерисовываем календарь
            this.renderCalendar();
            this.updateSelectedDateInfo();
            
            // Показываем уведомление
            this.showNotification('Событие успешно удалено', 'success');
        } else {
            this.showNotification('Событие не найдено', 'error');
        }
    }
    
    // НОВЫЙ МЕТОД: РЕДАКТИРОВАНИЕ СОБЫТИЯ
    editEvent(eventId) {
        // Находим событие
        let eventToEdit = null;
        let eventDateString = null;
        
        for (const dateString in this.events) {
            const foundEvent = this.events[dateString].find(event => event.id === eventId);
            if (foundEvent) {
                eventToEdit = foundEvent;
                eventDateString = dateString;
                break;
            }
        }
        
        if (!eventToEdit) {
            this.showNotification('Событие не найдено', 'error');
            return;
        }
        
        // Сохраняем ID редактируемого события
        this.editingEventId = eventId;
        
        // Показываем модальное окно с заполненными данными
        this.showEventModal(eventToEdit, eventDateString);
    }
    
    // ОБНОВЛЁННЫЙ МЕТОД: ПОКАЗ МОДАЛЬНОГО ОКНА (ДЛЯ СОЗДАНИЯ И РЕДАКТИРОВАНИЯ)
    showEventModal(eventData = null, dateString = null) {
        // Если не передана дата, используем выбранную
        const targetDate = dateString ? this.parseDate(dateString) : this.selectedDate;
        
        if (!targetDate && !eventData) {
            alert('Пожалуйста, выберите дату для создания события');
            return;
        }
        
        const modal = document.getElementById('eventModal');
        if (!modal) return;
        
        const isEditing = !!eventData;
        const modalTitle = isEditing ? 'Редактирование события' : 'Создание события';
        const targetDateString = this.formatDate(targetDate, true);
        
        modal.querySelector('.modal-content').innerHTML = `
            <div class="modal-header">
                <h2>${modalTitle}</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <p class="modal-date-info">Дата: ${targetDateString}</p>
                <form id="eventForm">
                    <div class="form-group">
                        <label for="eventTitle">Название события:</label>
                        <input type="text" id="eventTitle" 
                               value="${eventData ? eventData.title : ''}" 
                               required 
                               placeholder="Введите название события">
                    </div>
                    <div class="form-group">
                        <label for="eventTime">Время:</label>
                        <input type="time" id="eventTime" 
                               value="${eventData ? eventData.time : ''}">
                    </div>
                    <div class="form-group">
                        <label for="eventDescription">Описание:</label>
                        <textarea id="eventDescription" 
                                  rows="4" 
                                  placeholder="Введите описание события">${eventData ? eventData.description : ''}</textarea>
                    </div>
                    <div class="form-buttons">
                        <button type="submit" class="button submit-btn">
                            ${isEditing ? 'Сохранить изменения' : 'Создать событие'}
                        </button>
                        <button type="button" class="button cancel-button">Отмена</button>
                        ${isEditing ? `<button type="button" class="button delete-button">Удалить событие</button>` : ''}
                    </div>
                </form>
            </div>
        `;
        
        modal.style.display = 'flex';
        
        // Обработчик формы
        const form = document.getElementById('eventForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEventFormSubmit(isEditing);
        });
        
        // Кнопка отмены
        modal.querySelector('.cancel-button').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Кнопка закрытия
        modal.querySelector('.close-modal').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Кнопка удаления (только в режиме редактирования)
        if (isEditing) {
            modal.querySelector('.delete-button').addEventListener('click', () => {
                if (confirm('Вы уверены, что хотите удалить это событие?')) {
                    this.deleteEvent(this.editingEventId);
                    this.closeModal();
                }
            });
        }
        
        // Закрытие по клику вне модального окна
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }
    
    // ОБНОВЛЁННЫЙ МЕТОД: ОБРАБОТКА ФОРМЫ (ДЛЯ СОЗДАНИЯ И РЕДАКТИРОВАНИЯ)
    handleEventFormSubmit(isEditing = false) {
        const title = document.getElementById('eventTitle').value.trim();
        const time = document.getElementById('eventTime').value;
        const description = document.getElementById('eventDescription').value.trim();
        
        if (!title) {
            this.showNotification('Пожалуйста, введите название события', 'error');
            return;
        }
        
        if (isEditing && this.editingEventId) {
            // Редактирование существующего события
            this.updateEvent(this.editingEventId, {
                title: title,
                time: time,
                description: description
            });
        } else {
            // Создание нового события
            this.createEvent({
                date: this.selectedDate,
                title: title,
                time: time,
                description: description
            });
        }
        
        this.closeModal();
    }
    
    // НОВЫЙ МЕТОД: ОБНОВЛЕНИЕ СОБЫТИЯ
    updateEvent(eventId, updatedData) {
        let eventUpdated = false;
        
        for (const dateString in this.events) {
            const eventIndex = this.events[dateString].findIndex(event => event.id === eventId);
            
            if (eventIndex !== -1) {
                // Обновляем событие
                this.events[dateString][eventIndex] = {
                    ...this.events[dateString][eventIndex],
                    ...updatedData
                };
                
                eventUpdated = true;
                break;
            }
        }
        
        if (eventUpdated) {
            localStorage.setItem('calendarEvents', JSON.stringify(this.events));
            this.renderCalendar();
            this.updateSelectedDateInfo();
            this.showNotification('Событие успешно обновлено', 'success');
        } else {
            this.showNotification('Событие не найдено', 'error');
        }
        
        // Сбрасываем ID редактируемого события
        this.editingEventId = null;
    }
    
    // ОБНОВЛЁННЫЙ МЕТОД: СОЗДАНИЕ СОБЫТИЯ
    createEvent(eventData) {
        const dateString = this.formatDate(eventData.date);
        
        if (!this.events[dateString]) {
            this.events[dateString] = [];
        }
        
        this.events[dateString].push({
            id: Date.now(),
            title: eventData.title,
            description: eventData.description || '',
            time: eventData.time || '',
            date: dateString
        });
        
        localStorage.setItem('calendarEvents', JSON.stringify(this.events));
        this.renderCalendar();
        this.updateSelectedDateInfo();
        this.showNotification('Событие успешно создано', 'success');
    }
    
    // НОВЫЙ МЕТОД: ПОКАЗ ДЕТАЛЕЙ СОБЫТИЯ
    showEventDetails(eventId) {
        // Находим событие
        let eventDetails = null;
        
        for (const dateString in this.events) {
            const foundEvent = this.events[dateString].find(event => event.id === eventId);
            if (foundEvent) {
                eventDetails = foundEvent;
                break;
            }
        }
        
        if (!eventDetails) return;
        
        const modal = document.getElementById('eventModal');
        if (!modal) return;
        
        modal.querySelector('.modal-content').innerHTML = `
            <div class="modal-header">
                <h2>${eventDetails.title}</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="event-details">
                    <p><strong>Дата:</strong> ${this.parseDate(eventDetails.date).toLocaleDateString('ru-RU', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</p>
                    ${eventDetails.time ? `<p><strong>Время:</strong> ${eventDetails.time}</p>` : ''}
                    ${eventDetails.description ? `<p><strong>Описание:</strong> ${eventDetails.description}</p>` : ''}
                </div>
                <div class="form-buttons">
                    <button type="button" class="button edit-button">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                    <button type="button" class="button delete-button">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                    <button type="button" class="button cancel-button">Закрыть</button>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
        
        // Обработчики кнопок
        modal.querySelector('.edit-button').addEventListener('click', () => {
            this.closeModal();
            setTimeout(() => this.editEvent(eventId), 100);
        });
        
        modal.querySelector('.delete-button').addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите удалить это событие?')) {
                this.deleteEvent(eventId);
                this.closeModal();
            }
        });
        
        modal.querySelector('.cancel-button').addEventListener('click', () => {
            this.closeModal();
        });
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            this.closeModal();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }
    
    // НОВЫЙ МЕТОД: ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА
    closeModal() {
        const modal = document.getElementById('eventModal');
        if (modal) {
            modal.style.display = 'none';
            this.editingEventId = null; // Сбрасываем ID редактируемого события
        }
    }
    
    // НОВЫЙ МЕТОД: ПОКАЗ УВЕДОМЛЕНИЙ
    showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="close-notification">&times;</button>
        `;
        
        // Добавляем в тело документа
        document.body.appendChild(notification);
        
        // Показываем с анимацией
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Закрытие по кнопке
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
        
        // Автоматическое закрытие через 3 секунды
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }
    
    // НОВЫЙ МЕТОД: ПАРСИНГ ДАТЫ ИЗ СТРОКИ
    parseDate(dateString) {
        const parts = dateString.split('-');
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    
    // Существующие методы
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderHeader();
        this.renderCalendar();
    }
    
    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderHeader();
        this.renderCalendar();
    }
    
    formatDate(date, readable = false) {
        if (!date) return '';
        
        if (readable) {
            return date.toLocaleDateString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }
    
    setupEventListeners() {
        document.querySelector('.next-month').addEventListener('click', () => this.nextMonth());
        document.querySelector('.previous-month').addEventListener('click', () => this.previousMonth());
        
        const createButton = document.querySelector('#createEvent');
        if (createButton) {
            createButton.addEventListener('click', () => this.showEventModal());
        }
        
        this.updateCurrentDate();
    }
    
    updateCurrentDate() {
        const currentDateElement = document.getElementById('currentDate');
        if (currentDateElement) {
            const now = new Date();
            currentDateElement.textContent = now.toLocaleDateString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }
}

// Инициализация календаря
document.addEventListener('DOMContentLoaded', () => {
    const calendar = new Calendar('.calendar');
    calendar.selectDate(new Date());
});
