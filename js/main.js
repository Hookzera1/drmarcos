// Inicialização de animações AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar AOS
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });

    // Função para animar contadores
    function animateCounter(counter) {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 segundos
        const step = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    }

    // Observar elementos com classe .counter
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    // Observar todos os contadores
    document.querySelectorAll('.counter').forEach(counter => {
        counterObserver.observe(counter);
    });

    // Inicializar Swiper para depoimentos
    if (document.querySelector('.testimonial-slider')) {
        const testimonialSwiper = new Swiper('.testimonial-slider', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
    }

    // Menu mobile toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
        });
    }

    // Inicializar calendário se estiver na página de contato
    if (document.getElementById('appointment-calendar')) {
        initializeCalendar();
    }
});

// Efeito de parallax para o hero
window.addEventListener('scroll', function() {
    const scrollPosition = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero) {
        hero.style.backgroundPositionY = scrollPosition * 0.5 + 'px';
    }
});

// Função para obter horários bloqueados do localStorage
function getBlockedTimes() {
    return JSON.parse(localStorage.getItem('blockedTimes')) || {};
}

// Função para salvar horários bloqueados no localStorage
function saveBlockedTime(date, time) {
    const blockedTimes = getBlockedTimes();
    if (!blockedTimes[date]) {
        blockedTimes[date] = [];
    }
    blockedTimes[date].push(time);
    localStorage.setItem('blockedTimes', JSON.stringify(blockedTimes));
}

// Função para remover horário bloqueado
function removeBlockedTime(date, time) {
    const blockedTimes = getBlockedTimes();
    if (blockedTimes[date]) {
        blockedTimes[date] = blockedTimes[date].filter(t => t !== time);
        if (blockedTimes[date].length === 0) {
            delete blockedTimes[date];
        }
        localStorage.setItem('blockedTimes', JSON.stringify(blockedTimes));
    }
}

// Função para verificar se um horário está bloqueado
function isTimeBlocked(date, time) {
    const blockedTimes = getBlockedTimes();
    return blockedTimes[date] && blockedTimes[date].includes(time);
}

// Função para renderizar o calendário
function renderCalendar(month, year) {
    const calendarContainer = document.getElementById('appointment-calendar');
    if (!calendarContainer) return;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    let calendarHTML = `
        <div class="calendar-header">
            <button type="button" class="calendar-nav" onclick="changeMonth(-1)"><i class="fas fa-chevron-left"></i></button>
            <h4>${monthNames[month]} ${year}</h4>
            <button type="button" class="calendar-nav" onclick="changeMonth(1)"><i class="fas fa-chevron-right"></i></button>
        </div>
        <div class="calendar-grid">
            <div class="calendar-day-name">Dom</div>
            <div class="calendar-day-name">Seg</div>
            <div class="calendar-day-name">Ter</div>
            <div class="calendar-day-name">Qua</div>
            <div class="calendar-day-name">Qui</div>
            <div class="calendar-day-name">Sex</div>
            <div class="calendar-day-name">Sáb</div>
    `;
    
    // Dias vazios no início do mês
    for (let i = 0; i < startDay; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
    }
    
    // Dias do mês
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= totalDays; day++) {
        const currentDate = new Date(year, month, day);
        const dateString = currentDate.toISOString().split('T')[0];
        const isToday = currentDate.getTime() === today.getTime();
        const isPast = currentDate < today;
        const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
        
        let classes = ['calendar-day'];
        if (isToday) classes.push('today');
        if (isPast || isWeekend) classes.push('past');
        if (!isPast && !isWeekend) classes.push('available');
        
        calendarHTML += `
            <div class="${classes.join(' ')}" 
                 data-date="${dateString}" 
                 onclick="${!isPast && !isWeekend ? `selectDate('${dateString}')` : ''}">${day}</div>
        `;
    }
    
    // Dias vazios no final do mês
    const endDay = (startDay + totalDays) % 7;
    if (endDay > 0) {
        for (let i = endDay; i < 7; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }
    }
    
    calendarHTML += '</div>';
    calendarContainer.innerHTML = calendarHTML;
}

// Função para selecionar uma data
function selectDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Não permitir datas passadas
    if (date < today) {
        showMessage('error', 'Não é possível selecionar datas passadas');
        return;
    }
    
    // Não permitir fins de semana
    if (date.getDay() === 0 || date.getDay() === 6) {
        showMessage('error', 'Não é possível agendar em finais de semana');
        return;
    }
    
    // Remover seleção anterior
    const selectedDay = document.querySelector('.calendar-day.selected');
    if (selectedDay) {
        selectedDay.classList.remove('selected');
    }
    
    // Adicionar seleção atual
    const dayElement = document.querySelector(`[data-date="${dateString}"]`);
    if (dayElement) {
        dayElement.classList.add('selected');
    }
    
    // Atualizar campos
    document.getElementById('selected-date').textContent = new Date(dateString).toLocaleDateString('pt-BR');
    document.getElementById('meeting-date').value = dateString;
    
    // Gerar horários
    generateTimeSlots(dateString);
}

// Função para gerar horários disponíveis
function generateTimeSlots(dateString) {
    const timeSlotsContainer = document.getElementById('time-slots');
    if (!timeSlotsContainer) return;
    
    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
    ];
    
    let slotsHTML = '';
    
    // Verificar horários bloqueados
    const blockedTimes = JSON.parse(localStorage.getItem('blockedTimes') || '{}');
    const dateBlockedTimes = blockedTimes[dateString] || [];
    
    timeSlots.forEach(time => {
        const isBlocked = dateBlockedTimes.includes(time);
        const classes = ['time-slot'];
        if (isBlocked) classes.push('unavailable');
        
        slotsHTML += `
            <div class="${classes.join(' ')}"
                 data-time="${time}"
                 onclick="${!isBlocked ? `selectTime('${time}')` : ''}">${time}</div>
        `;
    });
    
    timeSlotsContainer.innerHTML = slotsHTML;
}

// Função para selecionar um horário
function selectTime(time) {
    // Remover seleção anterior
    const selectedSlot = document.querySelector('.time-slot.selected');
    if (selectedSlot) {
        selectedSlot.classList.remove('selected');
    }
    
    // Adicionar nova seleção
    const timeSlot = document.querySelector(`.time-slot[data-time="${time}"]`);
    if (timeSlot) {
        timeSlot.classList.add('selected');
    }
    
    // Atualizar campo oculto
    document.getElementById('meeting-time').value = time;
}

// Função para mudar o mês
function changeMonth(delta) {
    currentMonth += delta;
    
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    
    renderCalendar(currentMonth, currentYear);
}

// Inicializar calendário
function initializeCalendar() {
    const today = new Date();
    renderCalendar(today.getMonth(), today.getFullYear());
}

// Função para formatar data
function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

// Função para formatar telefone
function formatPhone(phone) {
    phone = phone.replace(/\D/g, '');
    return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
}

// Função para formatar CPF
function formatCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para validar CPF
function validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

// Função para validar email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Função para validar telefone
function validatePhone(phone) {
    phone = phone.replace(/\D/g, '');
    return phone.length >= 10 && phone.length <= 11;
}

// Função para mostrar mensagem
function showMessage(type, message) {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message message-${type}`;
    messageContainer.textContent = message;
    
    const form = document.querySelector('#scheduleForm');
    if (form) {
        const existingMessage = form.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        form.insertBefore(messageContainer, form.firstChild);
        
        setTimeout(() => {
            messageContainer.remove();
        }, 5000);
    }
}

// Função para mostrar erro no campo
function showFieldError(field, message) {
    removeFieldError(field);
    field.classList.add('invalid');
    const errorSpan = document.createElement('span');
    errorSpan.className = 'field-error';
    errorSpan.textContent = message;
    field.parentNode.appendChild(errorSpan);
}

// Função para remover erro do campo
function removeFieldError(field) {
    field.classList.remove('invalid');
    const errorSpan = field.parentNode.querySelector('.field-error');
    if (errorSpan) {
        errorSpan.remove();
    }
}

// Inicializar eventos quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Formatar campos ao digitar
    const documentInput = document.querySelector('#document');
    if (documentInput) {
        documentInput.addEventListener('input', function() {
            this.value = formatCPF(this.value);
        });
    }
    
    const phoneInput = document.querySelector('#phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            this.value = formatPhone(this.value);
        });
    }
    
    // Remover erro ao corrigir campo
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            removeFieldError(this);
        });
    });
    
    // Alternar entre abas
    const tabs = document.querySelectorAll('.schedule-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Atualizar abas ativas
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Atualizar conteúdo ativo
            const contents = document.querySelectorAll('.tab-content');
            contents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Inicializar formulários
    const scheduleForm = document.querySelector('#scheduleForm');
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', handleSubmit);
    }
    
    const checkForm = document.querySelector('#checkAppointmentForm');
    if (checkForm) {
        checkForm.addEventListener('submit', checkAppointment);
    }
});

// Inicializar calendário quando o DOM estiver pronto
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', function() {
    renderCalendar(currentMonth, currentYear);
    
    // Resetar formulário
    const resetButton = document.getElementById('reset-form');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            const form = document.getElementById('scheduleForm');
            if (form) {
                form.reset();
                
                // Limpar seleções do calendário
                const selectedDay = document.querySelector('.calendar-day.selected');
                if (selectedDay) {
                    selectedDay.classList.remove('selected');
                }
                
                // Resetar display de data
                document.getElementById('selected-date').textContent = 'Nenhuma';
                document.getElementById('meeting-date').value = '';
                
                // Limpar horários
                const timeSlotsContainer = document.getElementById('time-slots');
                if (timeSlotsContainer) {
                    timeSlotsContainer.innerHTML = '<p class="select-date-message">Selecione uma data para ver os horários disponíveis</p>';
                }
                document.getElementById('meeting-time').value = '';
            }
        });
    }
});