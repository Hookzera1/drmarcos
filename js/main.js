// Inicialização de animações AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar AOS
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });

    // Inicializar Swiper para depoimentos
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

    // Menu mobile toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav ul');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Contador de números
    const counters = document.querySelectorAll('.counter');
    
    if (counters.length > 0) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
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
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    // Formulário de contato com validação e feedback
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulação de envio de formulário
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
            
            setTimeout(() => {
                // Mostrar mensagem de sucesso
                const successMessage = document.createElement('div');
                successMessage.className = 'form-success';
                successMessage.textContent = 'Mensagem enviada com sucesso! Entraremos em contato em breve.';
                
                this.reset();
                this.parentNode.insertBefore(successMessage, this.nextSibling);
                
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                
                // Remover mensagem após 5 segundos
                setTimeout(() => {
                    successMessage.style.opacity = '0';
                    setTimeout(() => successMessage.remove(), 300);
                }, 5000);
            }, 1500);
        });
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

// Animação de entrada para os elementos da página
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (elementPosition < screenPosition) {
            element.classList.add('animated');
        }
    });
}

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// Adicione este código ao arquivo main.js

// Funcionalidade de agendamento aprimorada
document.addEventListener('DOMContentLoaded', function() {
    const scheduleForm = document.getElementById('scheduleForm');
    const checkAppointmentForm = document.getElementById('checkAppointmentForm');
    const scheduleTabs = document.querySelectorAll('.schedule-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Inicializar as abas
    if (scheduleTabs.length > 0) {
        scheduleTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remover classe ativa de todas as abas
                scheduleTabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Adicionar classe ativa à aba clicada
                this.classList.add('active');
                
                // Mostrar o conteúdo correspondente
                const tabId = this.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }
    
    // Inicializar o calendário se existir
    const calendarContainer = document.getElementById('appointment-calendar');
    if (calendarContainer) {
        initializeCalendar(calendarContainer);
    }
    
    // Botão para limpar o formulário
    const resetFormButton = document.getElementById('reset-form');
    if (resetFormButton && scheduleForm) {
        resetFormButton.addEventListener('click', function() {
            scheduleForm.reset();
            document.getElementById('selected-date').textContent = 'Nenhuma';
            document.getElementById('time-slots').innerHTML = '<p class="select-date-message">Selecione uma data para ver os horários disponíveis</p>';
            document.getElementById('meeting-date').value = '';
            document.getElementById('meeting-time').value = '';
        });
    }
    
    // Processar o envio do formulário de agendamento
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            let hasErrors = false;
            
            // Validar campos obrigatórios
            const requiredFields = this.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('invalid');
                    showFieldError(field, 'Campo obrigatório');
                    hasErrors = true;
                }
            });
            
            // Validações específicas
            const email = document.getElementById('email').value;
            const cpfInput = document.getElementById('document');
            const meetingDate = document.getElementById('meeting-date').value;
            const meetingTime = document.getElementById('meeting-time').value;
            
            if (!validateEmail(email)) {
                showFieldError(document.getElementById('email'), 'E-mail inválido');
                hasErrors = true;
            }
            
            if (cpfInput && cpfInput.value && !validateCPF(cpfInput.value)) {
                showFieldError(cpfInput, 'CPF inválido');
                hasErrors = true;
            }
            
            if (!meetingDate || !meetingTime) {
                showMessage('form-error', 'Por favor, selecione uma data e horário para a reunião.');
                hasErrors = true;
            }
            
            const areaCheckboxes = document.querySelectorAll('input[name="area"]:checked');
            if (areaCheckboxes.length === 0) {
                showMessage('form-error', 'Por favor, selecione pelo menos uma área jurídica.');
                hasErrors = true;
            }
            
            if (hasErrors) {
                const firstError = document.querySelector('.invalid, .form-error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }
            
            // Verificar limite de tentativas
            const canMake = AppointmentManager.canMakeAppointment(email);
            if (!canMake.allowed) {
                showMessage('form-error', canMake.message);
                return;
            }
            
            // Registrar tentativa
            AppointmentManager.registerAttempt(email);
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading-indicator"></span> Processando...';
            
            try {
                // Coletar dados do formulário
                const formData = new FormData(this);
                const appointmentData = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    document: formData.get('document'),
                    date: formData.get('meeting-date'),
                    time: formData.get('meeting-time'),
                    type: formData.get('meeting-type'),
                    format: formData.get('format'),
                    areas: formData.getAll('area'),
                    notes: formData.get('notes'),
                    code: generateConfirmationCode(),
                    status: 'pending'
                };
                
                // Registrar o agendamento
                const registeredAppointment = AppointmentManager.registerAppointment(appointmentData);
                
                // Gerar mensagem para o WhatsApp do advogado
                const whatsappMessage = `
*NOVO AGENDAMENTO DE CONSULTA*

📋 *Detalhes do Cliente*
Nome: ${registeredAppointment.name}
E-mail: ${registeredAppointment.email}
Telefone: ${registeredAppointment.phone}
${registeredAppointment.document ? `CPF: ${registeredAppointment.document}` : ''}

📅 *Detalhes da Consulta*
Data: ${registeredAppointment.date}
Horário: ${registeredAppointment.time}
Tipo: ${registeredAppointment.type}
Formato: ${registeredAppointment.format}
Áreas: ${registeredAppointment.areas.join(', ')}

📝 *Observações*
${registeredAppointment.notes || 'Nenhuma observação adicional'}

🔑 *Código do Agendamento*
${registeredAppointment.code}

Para gerenciar este agendamento, responda com:
✅ *CONFIRMAR* - Para aprovar o agendamento
❌ *RECUSAR* - Para recusar o agendamento`;

                // Esconder todo o conteúdo do formulário
                const formContainer = document.getElementById('new-appointment');
                if (formContainer) {
                    formContainer.style.display = 'none';
                }

                // Esconder as abas
                const scheduleTabs = document.querySelector('.schedule-tabs');
                if (scheduleTabs) {
                    scheduleTabs.style.display = 'none';
                }

                // Criar e mostrar a tela de confirmação
                const confirmationHTML = `
                    <div class="appointment-confirmation" data-aos="fade-up">
                        <h3>Confirmação de Agendamento</h3>
                        
                        <div class="appointment-details">
                            <div class="success-icon">
                                <i class="fas fa-clock"></i>
                            </div>
                            <h4>Solicitação de Agendamento Enviada</h4>
                            
                            <div class="status-badge pending">
                                <i class="fas fa-clock"></i> Aguardando Confirmação por WhatsApp
                            </div>
                            
                            <div class="appointment-info">
                                <p>Sua solicitação de agendamento foi enviada com sucesso!</p>
                                <p>O advogado receberá sua solicitação via WhatsApp e confirmará o agendamento em breve.</p>
                            </div>
                            
                            <div class="appointment-details-info">
                                <h5>Detalhes do Agendamento</h5>
                                <p><i class="fas fa-user"></i> <strong>Nome:</strong> ${registeredAppointment.name}</p>
                                <p><i class="fas fa-calendar-alt"></i> <strong>Data:</strong> ${registeredAppointment.date}</p>
                                <p><i class="fas fa-clock"></i> <strong>Horário:</strong> ${registeredAppointment.time}</p>
                                <p><i class="fas fa-map-marker-alt"></i> <strong>Formato:</strong> ${registeredAppointment.format}</p>
                                <p><i class="fas fa-briefcase"></i> <strong>Tipo:</strong> ${registeredAppointment.type}</p>
                                <p><i class="fas fa-balance-scale"></i> <strong>Áreas:</strong> ${registeredAppointment.areas.join(', ')}</p>
                            </div>
                            
                            <div class="appointment-code">
                                <p>Seu código de agendamento:</p>
                                <strong>${registeredAppointment.code}</strong>
                                <p>Guarde este código para consultas futuras</p>
                            </div>
                            
                            <div class="appointment-actions">
                                <button type="button" class="btn btn-outline" onclick="window.location.reload()">
                                    <i class="fas fa-calendar-plus"></i> Novo Agendamento
                                </button>
                            </div>
                        </div>
                    </div>`;

                // Adicionar a confirmação à página
                const parentContainer = formContainer.parentElement;
                if (parentContainer) {
                    parentContainer.innerHTML = confirmationHTML;
                }
                
            } catch (error) {
                console.error('Erro no agendamento:', error);
                showMessage('form-error', 'Ocorreu um erro ao processar seu agendamento. Por favor, tente novamente.');
                
                // Reativar o botão em caso de erro
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
    
    // Processar o formulário de verificação de agendamento
    if (checkAppointmentForm) {
        checkAppointmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar campos
            const email = document.getElementById('check-email').value;
            const code = document.getElementById('check-code').value.toUpperCase(); // Converter para maiúsculas
            let hasErrors = false;
            
            console.log('Tentando consultar agendamento:', { email, code });
            console.log('Agendamentos salvos:', Array.from(AppointmentManager.appointmentsByCode.entries()));
            
            if (!email || !validateEmail(email)) {
                showFieldError(document.getElementById('check-email'), 'E-mail inválido');
                hasErrors = true;
            }
            
            if (!code || code.length < 6) {
                showFieldError(document.getElementById('check-code'), 'Código de agendamento inválido');
                hasErrors = true;
            }
            
            if (hasErrors) {
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading-indicator"></span> Verificando...';
            
            try {
                // Buscar o agendamento
                const appointment = AppointmentManager.findAppointmentByCode(code);
                console.log('Agendamento encontrado:', appointment);
                
                setTimeout(() => {
                    if (appointment && appointment.email === email) {
                        // Esconder o formulário de consulta
                        const checkFormContainer = document.getElementById('checkAppointmentForm');
                        if (checkFormContainer) {
                            checkFormContainer.style.display = 'none';
                        }
                        
                        // Criar HTML dos detalhes do agendamento
                        const appointmentHTML = `
                            <div class="appointment-check-result" data-aos="fade-up">
                                <div class="check-header">
                                    <div class="check-icon ${appointment.status}">
                                        <i class="fas fa-${appointment.status === 'pending' ? 'clock' : appointment.status === 'canceled' ? 'times' : 'check'}"></i>
                                    </div>
                                    <h4>Detalhes do Agendamento</h4>
                                </div>
                                
                                <div class="status-badge ${appointment.status}">
                                    <i class="fas fa-${appointment.status === 'pending' ? 'clock' : appointment.status === 'canceled' ? 'times' : 'check'}"></i>
                                    <span>${appointment.status === 'pending' ? 'Aguardando Confirmação' : appointment.status === 'canceled' ? 'Cancelado' : 'Confirmado'}</span>
                                </div>
                                
                                <div class="check-details">
                                    <div class="detail-item">
                                        <i class="fas fa-user"></i>
                                        <div class="detail-content">
                                            <label>Nome:</label>
                                            <span>${appointment.name}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="detail-item">
                                        <i class="fas fa-envelope"></i>
                                        <div class="detail-content">
                                            <label>E-mail:</label>
                                            <span>${appointment.email}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="detail-item">
                                        <i class="fas fa-phone"></i>
                                        <div class="detail-content">
                                            <label>Telefone:</label>
                                            <span>${appointment.phone}</span>
                                        </div>
                                    </div>
                                    
                                    ${appointment.document ? `
                                        <div class="detail-item">
                                            <i class="fas fa-id-card"></i>
                                            <div class="detail-content">
                                                <label>CPF:</label>
                                                <span>${appointment.document}</span>
                                            </div>
                                        </div>
                                    ` : ''}
                                    
                                    <div class="detail-item">
                                        <i class="fas fa-calendar-alt"></i>
                                        <div class="detail-content">
                                            <label>Data:</label>
                                            <span>${appointment.date}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="detail-item">
                                        <i class="fas fa-clock"></i>
                                        <div class="detail-content">
                                            <label>Horário:</label>
                                            <span>${appointment.time}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="detail-item">
                                        <i class="fas fa-map-marker-alt"></i>
                                        <div class="detail-content">
                                            <label>Formato:</label>
                                            <span>${appointment.format}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="detail-item">
                                        <i class="fas fa-briefcase"></i>
                                        <div class="detail-content">
                                            <label>Tipo:</label>
                                            <span>${appointment.type}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="detail-item">
                                        <i class="fas fa-balance-scale"></i>
                                        <div class="detail-content">
                                            <label>Áreas:</label>
                                            <span>${Array.isArray(appointment.areas) ? appointment.areas.join(', ') : appointment.areas}</span>
                                        </div>
                                    </div>
                                    
                                    ${appointment.notes ? `
                                        <div class="detail-item">
                                            <i class="fas fa-sticky-note"></i>
                                            <div class="detail-content">
                                                <label>Observações:</label>
                                                <span>${appointment.notes}</span>
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                                
                                <div class="check-code">
                                    <label>Código do Agendamento:</label>
                                    <strong>${appointment.code}</strong>
                                </div>
                                
                                <div class="check-actions">
                                    <button type="button" class="btn btn-outline" onclick="switchTab('new-appointment')">
                                        <i class="fas fa-calendar-plus"></i> Novo Agendamento
                                    </button>
                                    ${appointment.status === 'pending' ? `
                                        <button type="button" class="btn btn-danger" id="cancel-appointment">
                                            <i class="fas fa-times"></i> Cancelar Agendamento
                                        </button>
                                    ` : ''}
                                </div>
                            </div>`;
                        
                        // Adicionar os detalhes ao container
                        const checkContainer = document.getElementById('check-appointment');
                        if (checkContainer) {
                            checkContainer.innerHTML = appointmentHTML;
                            
                            // Adicionar funcionalidade ao botão de cancelamento se o agendamento estiver pendente
                            if (appointment.status === 'pending') {
                                const cancelBtn = document.getElementById('cancel-appointment');
                                if (cancelBtn) {
                                    cancelBtn.addEventListener('click', function() {
                                        if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
                                            try {
                                                // Cancelar o agendamento
                                                const canceledAppointment = AppointmentManager.cancelAppointment(code);
                                                
                                                if (canceledAppointment) {
                                                    // Notificar o advogado sobre o cancelamento via WhatsApp
                                                    const lawyerWhatsApp = "5531971700023";
                                                    const cancelMessage = `*CANCELAMENTO DE CONSULTA*\n\n` +
                                                        `*Código:* ${canceledAppointment.code}\n` +
                                                        `*Nome:* ${canceledAppointment.name}\n` +
                                                        `*E-mail:* ${canceledAppointment.email}\n` +
                                                        `*Data:* ${canceledAppointment.date}\n` +
                                                        `*Horário:* ${canceledAppointment.time}\n` +
                                                        `*Motivo:* Cancelado pelo cliente`;
                                                    
                                                    const encodedCancelMessage = encodeURIComponent(cancelMessage);
                                                    const cancelWhatsappLink = `https://wa.me/${lawyerWhatsApp}?text=${encodedCancelMessage}`;
                                                    
                                                    // Abrir WhatsApp em nova aba
                                                    window.open(cancelWhatsappLink, '_blank');
                                                    
                                                    // Mostrar mensagem de confirmação do cancelamento
                                                    checkContainer.innerHTML = `
                                                        <div class="appointment-check-result" data-aos="fade-up">
                                                            <div class="check-header">
                                                                <div class="check-icon canceled">
                                                                    <i class="fas fa-calendar-times"></i>
                                                                </div>
                                                                <h4>Agendamento Cancelado</h4>
                                                            </div>
                                                            
                                                            <div class="status-badge canceled">
                                                                <i class="fas fa-times"></i>
                                                                <span>Cancelado</span>
                                                            </div>
                                                            
                                                            <p class="cancel-message">
                                                                Seu agendamento foi cancelado com sucesso.<br>
                                                                Um e-mail de confirmação foi enviado para ${canceledAppointment.email}.
                                                            </p>
                                                            
                                                            <div class="check-actions">
                                                                <button type="button" class="btn" onclick="switchTab('new-appointment')">
                                                                    <i class="fas fa-calendar-plus"></i> Fazer Novo Agendamento
                                                                </button>
                                                            </div>
                                                        </div>`;
                                                }
                                            } catch (error) {
                                                console.error('Erro ao cancelar agendamento:', error);
                                                showMessage('form-error', 'Ocorreu um erro ao cancelar o agendamento. Por favor, tente novamente.');
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    } else {
                        showMessage('form-error', 'Não foi possível encontrar um agendamento com as informações fornecidas. Verifique o e-mail e o código de confirmação.');
                        this.reset();
                    }
                    
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }, 1500);
            } catch (error) {
                console.error('Erro ao consultar agendamento:', error);
                showMessage('form-error', 'Ocorreu um erro ao consultar o agendamento. Por favor, tente novamente.');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
});

// Função para inicializar o calendário
function initializeCalendar(container) {
    // Obter o mês atual
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    
    // Renderizar o calendário inicial
    renderCalendar(container, currentMonth, currentYear);
    
    // Adicionar navegação do calendário
    const prevMonthBtn = document.createElement('button');
    prevMonthBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevMonthBtn.className = 'calendar-nav prev-month';
    prevMonthBtn.addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(container, currentMonth, currentYear);
    });
    
    const nextMonthBtn = document.createElement('button');
    nextMonthBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextMonthBtn.className = 'calendar-nav next-month';
    nextMonthBtn.addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(container, currentMonth, currentYear);
    });
    
    const calendarHeader = container.querySelector('.calendar-header');
    calendarHeader.prepend(prevMonthBtn);
    calendarHeader.appendChild(nextMonthBtn);
}

// Função para renderizar o calendário
function renderCalendar(container, month, year) {
    const today = new Date();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Domingo, 1 = Segunda, etc.
    
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    // Limpar o container
    container.innerHTML = '';
    
    // Criar cabeçalho do calendário
    const calendarHeader = document.createElement('div');
    calendarHeader.className = 'calendar-header';
    calendarHeader.innerHTML = `<h4>${monthNames[month]} ${year}</h4>`;
    container.appendChild(calendarHeader);
    
    // Criar grid do calendário
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'calendar-grid';
    
    // Adicionar nomes dos dias da semana
    dayNames.forEach(day => {
        const dayNameElement = document.createElement('div');
        dayNameElement.className = 'calendar-day-name';
        dayNameElement.textContent = day;
        calendarGrid.appendChild(dayNameElement);
    });
    
    // Adicionar dias vazios antes do primeiro dia do mês
    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Adicionar os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        // Verificar se é hoje
        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Verificar se é um dia passado
        if (date < new Date(today.setHours(0, 0, 0, 0))) {
            dayElement.classList.add('past');
        } else {
            // Verificar se é fim de semana
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                dayElement.classList.add('weekend');
            } else {
                // Dia disponível para agendamento
                dayElement.classList.add('available');
                dayElement.addEventListener('click', function() {
                    // Remover seleção anterior
                    const selectedDays = document.querySelectorAll('.calendar-day.selected');
                    selectedDays.forEach(day => day.classList.remove('selected'));
                    
                    // Selecionar este dia
                    this.classList.add('selected');
                    
                    // Atualizar a data selecionada
                    const selectedDate = new Date(year, month, day);
                    const formattedDate = selectedDate.toISOString().split('T')[0];
                    document.getElementById('meeting-date').value = formattedDate;
                    
                    // Exibir a data formatada
                    const displayDate = selectedDate.toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                    document.getElementById('selected-date').textContent = displayDate;
                    
                    // Gerar horários disponíveis
                    generateTimeSlots(selectedDate);
                });
            }
        }
        
        calendarGrid.appendChild(dayElement);
    }
    
    container.appendChild(calendarGrid);
    
    // Adicionar estilos CSS inline para o calendário
    const style = document.createElement('style');
    style.textContent = `
        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .calendar-nav {
            background: none;
            border: none;
            color: #1a5276;
            cursor: pointer;
            font-size: 1.2rem;
            padding: 5px 10px;
            transition: all 0.3s ease;
        }
        
        .calendar-nav:hover {
            color: #3498db;
        }
        
        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 5px;
        }
        
        .calendar-day-name {
            text-align: center;
            font-weight: 600;
            color: #7f8c8d;
            padding: 5px 0;
        }
        
        .calendar-day {
            text-align: center;
            padding: 10px 5px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .calendar-day.empty {
            cursor: default;
        }
        
        .calendar-day.today {
            background-color: #e9f7fe;
            font-weight: 600;
            color: #3498db;
            border: 1px solid #3498db;
        }
        
        .calendar-day.past {
            color: #bbb;
            cursor: not-allowed;
        }
        
        .calendar-day.weekend {
            color: #e74c3c;
            cursor: not-allowed;
        }
        
        .calendar-day.available:hover {
            background-color: #f8f9fa;
        }
        
        .calendar-day.selected {
            background-color: #1a5276;
            color: #fff;
        }
    `;
    document.head.appendChild(style);
}

// Função para gerar horários disponíveis
function generateTimeSlots(date) {
    const timeSlotsContainer = document.getElementById('time-slots');
    timeSlotsContainer.innerHTML = '';
    
    // Adicionar indicador de carregamento
    timeSlotsContainer.innerHTML = '<div class="loading-slots"><span class="loading-indicator"></span> Carregando horários disponíveis...</div>';
    
    // Simular carregamento dos horários
    setTimeout(() => {
        timeSlotsContainer.innerHTML = '';
        
        // Horários disponíveis (simulação)
        const availableSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];
        const unavailableSlots = ['10:00', '14:00']; // Simulação de horários ocupados
        const dayOfWeek = date.getDay();
        
        // Se não houver horários disponíveis
        if (availableSlots.length === 0) {
            timeSlotsContainer.innerHTML = `
                <div class="no-slots-message">
                    <i class="fas fa-calendar-times"></i>
                    <p>Não há horários disponíveis para esta data.</p>
                    <p>Por favor, selecione outra data.</p>
                </div>
            `;
            return;
        }
        
        // Criar grid de horários
        const timeGrid = document.createElement('div');
        timeGrid.className = 'time-slots-grid';
        
        // Adicionar períodos do dia
        const periods = {
            'Manhã': availableSlots.filter(time => parseInt(time) < 12),
            'Tarde': availableSlots.filter(time => parseInt(time) >= 12)
        };
        
        Object.entries(periods).forEach(([period, slots]) => {
            if (slots.length === 0) return; // Pular período sem horários
            
            const periodSection = document.createElement('div');
            periodSection.className = 'time-period';
            periodSection.innerHTML = `<h5>${period}</h5>`;
            
            const slotsGrid = document.createElement('div');
            slotsGrid.className = 'slots-grid';
            
            slots.forEach(time => {
                const timeSlot = document.createElement('div');
                timeSlot.className = 'time-slot';
                
                if (unavailableSlots.includes(time)) {
                    timeSlot.classList.add('unavailable');
                    timeSlot.innerHTML = `
                        <span class="time">${time}</span>
                        <span class="status">Indisponível</span>
                    `;
                } else {
                    timeSlot.innerHTML = `
                        <span class="time">${time}</span>
                        <span class="status">Disponível</span>
                    `;
                    timeSlot.addEventListener('click', function() {
                        // Remover seleção anterior
                        document.querySelectorAll('.time-slot').forEach(slot => {
                            slot.classList.remove('selected');
                        });
                        
                        // Selecionar este horário
                        this.classList.add('selected');
                        document.getElementById('meeting-time').value = time;
                        
                        // Feedback visual
                        this.innerHTML = `
                            <span class="time">${time}</span>
                            <span class="status">Selecionado</span>
                            <i class="fas fa-check"></i>
                        `;
                        
                        // Mostrar mensagem de confirmação
                        const confirmationMessage = document.createElement('div');
                        confirmationMessage.className = 'time-confirmation';
                        confirmationMessage.innerHTML = `
                            <i class="fas fa-check-circle"></i>
                            <p>Horário selecionado: ${time}</p>
                        `;
                        
                        // Remover mensagem anterior se existir
                        const existingConfirmation = timeSlotsContainer.querySelector('.time-confirmation');
                        if (existingConfirmation) {
                            existingConfirmation.remove();
                        }
                        
                        timeSlotsContainer.appendChild(confirmationMessage);
                    });
                }
                
                slotsGrid.appendChild(timeSlot);
            });
            
            periodSection.appendChild(slotsGrid);
            timeGrid.appendChild(periodSection);
        });
        
        timeSlotsContainer.appendChild(timeGrid);
        
        // Adicionar legenda
        const legend = document.createElement('div');
        legend.className = 'time-slots-legend';
        legend.innerHTML = `
            <div class="legend-item">
                <span class="legend-color available"></span>
                <span>Disponível</span>
            </div>
            <div class="legend-item">
                <span class="legend-color unavailable"></span>
                <span>Indisponível</span>
            </div>
            <div class="legend-item">
                <span class="legend-color selected"></span>
                <span>Selecionado</span>
            </div>
        `;
        timeSlotsContainer.appendChild(legend);
        
        // Animar entrada dos elementos
        const elements = timeSlotsContainer.querySelectorAll('.time-period, .time-slots-legend');
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.5s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 1000);
}

// Função para mostrar mensagens
function showMessage(type, message) {
    // Remover mensagens anteriores
    const existingMessages = document.querySelectorAll('.form-success, .form-error');
    existingMessages.forEach(msg => msg.remove());
    
    // Criar nova mensagem
    const messageElement = document.createElement('div');
    messageElement.className = type;
    messageElement.innerHTML = message;
    
    // Adicionar ao DOM após o formulário
    const form = document.getElementById('scheduleForm') || document.getElementById('checkAppointmentForm');
    if (form) {
        // Se for uma mensagem de confirmação de agendamento, esconder todo o conteúdo da aba
        if (type === 'form-success' && message.includes('appointment-details')) {
            // Esconder as abas e todo o conteúdo do formulário
            const scheduleTabs = document.querySelector('.schedule-tabs');
            if (scheduleTabs) scheduleTabs.style.display = 'none';
            
            // Esconder o formulário
            form.style.display = 'none';
            
            // Esconder qualquer outro formulário visível
            const allForms = document.querySelectorAll('form');
            allForms.forEach(f => f.style.display = 'none');
            
            // Esconder todas as abas de conteúdo
            const allTabContents = document.querySelectorAll('.tab-content');
            allTabContents.forEach(tab => tab.style.display = 'none');
            
            // Limpar o conteúdo do container e adicionar apenas a mensagem de confirmação
            const contactForm = document.querySelector('.contact-form');
            if (contactForm) {
                // Manter o título original
                const originalTitle = contactForm.querySelector('h3');
                const titleText = originalTitle ? originalTitle.textContent : 'Agende uma Reunião';
                
                // Limpar o conteúdo mantendo apenas o título
                contactForm.innerHTML = '';
                
                // Recriar o título
                const newTitle = document.createElement('h3');
                newTitle.textContent = 'Confirmação de Agendamento';
                contactForm.appendChild(newTitle);
                
                // Adicionar a mensagem de confirmação
                contactForm.appendChild(messageElement);
                
                // Adicionar botão para novo agendamento
                const newAppointmentBtn = document.createElement('button');
                newAppointmentBtn.className = 'btn btn-outline';
                newAppointmentBtn.innerHTML = '<i class="fas fa-plus"></i> Novo Agendamento';
                newAppointmentBtn.style.marginTop = '20px';
                newAppointmentBtn.addEventListener('click', function() {
                    // Recarregar a página para reiniciar o processo
                    window.location.reload();
                });
                contactForm.appendChild(newAppointmentBtn);
            }
        } else {
            // Para outros tipos de mensagem, comportamento normal
            form.parentNode.insertBefore(messageElement, form.nextSibling);
        }
        
        // Rolar para a mensagem
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Função para gerar código de confirmação aleatório
function generateConfirmationCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

// Animações aprimoradas para o sistema de agendamento
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar animação de entrada para os elementos do formulário
    animateFormElements();
    
    // Adicionar efeito de ripple aos botões
    addRippleEffect();
    
    // Adicionar animação ao trocar de abas
    const scheduleTabs = document.querySelectorAll('.schedule-tab');
    if (scheduleTabs.length > 0) {
        scheduleTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Animação de saída para o conteúdo atual
                const activeContent = document.querySelector('.tab-content.active');
                if (activeContent) {
                    activeContent.style.animation = 'fadeOutDown 0.3s forwards';
                    
                    setTimeout(() => {
                        // Remover classe ativa de todas as abas e conteúdos
                        scheduleTabs.forEach(t => t.classList.remove('active'));
                        document.querySelectorAll('.tab-content').forEach(c => {
                            c.classList.remove('active');
                            c.style.animation = '';
                        });
                        
                        // Adicionar classe ativa à aba clicada
                        this.classList.add('active');
                        
                        // Mostrar o conteúdo correspondente com animação
                        const tabId = this.getAttribute('data-tab');
                        const newContent = document.getElementById(tabId);
                        newContent.classList.add('active');
                        newContent.style.animation = 'fadeInUp 0.5s forwards';
                        
                        // Animar os elementos do formulário
                        animateFormElements(newContent);
                    }, 300);
                }
            });
        });
    }
});

// Função para animar elementos do formulário
function animateFormElements(container = document) {
    const elements = container.querySelectorAll('.form-group, .form-actions button');
    
    elements.forEach((element, index) => {
        // Resetar estilos
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        // Aplicar animação com delay baseado no índice
        setTimeout(() => {
            element.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100 + (index * 50));
    });
}

// Função para adicionar efeito de ripple aos botões
function addRippleEffect() {
    const buttons = document.querySelectorAll('.btn, .schedule-tab, .time-slot:not(.unavailable)');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Adicionar estilo para o efeito ripple
    if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            .btn, .schedule-tab, .time-slot:not(.unavailable) {
                position: relative;
                overflow: hidden;
            }
            
            .ripple-effect {
                position: absolute;
                border-radius: 50%;
                background-color: rgba(255, 255, 255, 0.7);
                width: 100px;
                height: 100px;
                margin-top: -50px;
                margin-left: -50px;
                animation: ripple-animation 0.6s ease-out;
                opacity: 0;
            }
            
            @keyframes ripple-animation {
                0% {
                    transform: scale(0.01);
                    opacity: 0.5;
                }
                100% {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Função para formatar e enviar os dados do agendamento para o WhatsApp do advogado
function sendAppointmentToWhatsApp(appointmentData, formattedDate, meetingTypeText, formatText, meetingTime, confirmationCode) {
    // Número do WhatsApp do advogado (extraído do footer)
    const lawyerWhatsApp = "5531971700023"; // Formato: código do país (55) + DDD (31) + número (99218-0253) sem caracteres especiais
    
    // Construir áreas jurídicas selecionadas
    let legalAreas = '';
    if (Array.isArray(appointmentData.area)) {
        legalAreas = appointmentData.area.join(', ');
    } else if (appointmentData.area) {
        legalAreas = appointmentData.area;
    }
    
    // Construir a mensagem para o WhatsApp
    const message = `*NOVO AGENDAMENTO DE CONSULTA*\n\n` +
        `*Código:* ${confirmationCode}\n` +
        `*Nome:* ${appointmentData.name}\n` +
        `*E-mail:* ${appointmentData.email}\n` +
        `*Telefone:* ${appointmentData.phone}\n` +
        `*CPF:* ${appointmentData.document || 'Não informado'}\n` +
        `*Tipo de Consulta:* ${meetingTypeText}\n` +
        `*Áreas:* ${legalAreas || 'Não especificado'}\n` +
        `*Formato:* ${formatText}\n` +
        `*Data:* ${formattedDate}\n` +
        `*Horário:* ${meetingTime}\n` +
        `*Observações:* ${appointmentData.notes || 'Nenhuma'}`;
    
    // Codificar a mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Criar o link do WhatsApp
    const whatsappLink = `https://wa.me/${lawyerWhatsApp}?text=${encodedMessage}`;
    
    // Em um ambiente real, você poderia abrir automaticamente o link ou fornecer instruções
    // para o advogado sobre como acessar os agendamentos
    console.log('Link para WhatsApp gerado:', whatsappLink);
    
    // Retornar o link para uso posterior
    return whatsappLink;
}

// Função para abrir o WhatsApp com a mensagem do agendamento
function openWhatsAppLink(link) {
    // Abrir o link em uma nova aba
    window.open(link, '_blank');
}

// Adicionar estilo para o botão do WhatsApp
document.addEventListener('DOMContentLoaded', function() {
    // Criar estilo para o botão do WhatsApp
    const style = document.createElement('style');
    style.textContent = `
        .btn-whatsapp {
            background-color: #25D366;
            color: white;
            border: none;
        }
        .btn-whatsapp:hover {
            background-color: #128C7E;
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(18, 140, 126, 0.3);
        }
    `;
    document.head.appendChild(style);
});

// Adicionar animações para o formulário de agendamento
document.addEventListener('DOMContentLoaded', function() {
    const scheduleForm = document.getElementById('scheduleForm');
    
    if (scheduleForm) {
        // Adicionar efeito de foco nos campos
        const inputs = scheduleForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            // Criar elemento de destaque para o efeito de foco
            const highlight = document.createElement('span');
            highlight.className = 'input-highlight';
            input.parentNode.appendChild(highlight);
            
            input.addEventListener('focus', function() {
                this.parentNode.classList.add('input-focused');
            });
            
            input.addEventListener('blur', function() {
                this.parentNode.classList.remove('input-focused');
            });
        });
        
        // Adicionar estilo para o efeito de foco
        if (!document.getElementById('focus-style')) {
            const style = document.createElement('style');
            style.id = 'focus-style';
            style.textContent = `
                .form-group {
                    position: relative;
                }
                
                .input-highlight {
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    width: 0;
                    height: 2px;
                    background: linear-gradient(90deg, #3498db, #1a5276);
                    transition: all 0.3s ease;
                    transform: translateX(-50%);
                    z-index: 1;
                    opacity: 0;
                }
                
                .input-focused .input-highlight {
                    width: 100%;
                    opacity: 1;
                }
                
                @keyframes fadeOutDown {
                    from { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                    to { 
                        opacity: 0; 
                        transform: translateY(20px); 
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
});

// Função para formatar telefone
function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 2) {
        if (value.length > 7) {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        } else {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        }
    }
    
    input.value = value;
}

// Função para formatar CPF
function formatCPF(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 3) {
        if (value.length > 6) {
            if (value.length > 9) {
                value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
            } else {
                value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
            }
        } else {
            value = `${value.slice(0, 3)}.${value.slice(3)}`;
        }
    }
    
    input.value = value;
}

// Função para validar CPF
function validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Validação dos dígitos verificadores
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
}

// Função para validar email
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Adicionar validações e formatações aos campos do formulário
document.addEventListener('DOMContentLoaded', function() {
    const scheduleForm = document.getElementById('scheduleForm');
    
    if (scheduleForm) {
        // Formatar telefone
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function() {
                formatPhone(this);
            });
        }
        
        // Formatar CPF
        const cpfInput = document.getElementById('document');
        if (cpfInput) {
            cpfInput.addEventListener('input', function() {
                formatCPF(this);
            });
            
            cpfInput.addEventListener('blur', function() {
                if (this.value && !validateCPF(this.value)) {
                    this.classList.add('invalid');
                    showFieldError(this, 'CPF inválido');
                } else {
                    this.classList.remove('invalid');
                    removeFieldError(this);
                }
            });
        }
        
        // Validar email
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                if (this.value && !validateEmail(this.value)) {
                    this.classList.add('invalid');
                    showFieldError(this, 'E-mail inválido');
                } else {
                    this.classList.remove('invalid');
                    removeFieldError(this);
                }
            });
        }
        
        // Adicionar feedback visual para campos obrigatórios
        const requiredFields = scheduleForm.querySelectorAll('[required]');
        let hasErrors = false; // Definição da variável hasErrors
        
        requiredFields.forEach(field => {
            field.addEventListener('blur', function() {
                if (!this.value.trim()) {
                    this.classList.add('invalid');
                    showFieldError(this, 'Campo obrigatório');
                    hasErrors = true;
                } else {
                    this.classList.remove('invalid');
                    removeFieldError(this);
                    hasErrors = false;
                }
            });
            
            // Adicionar validação em tempo real
            field.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.classList.remove('invalid');
                    removeFieldError(this);
                    hasErrors = false;
                }
            });
        });
        
        // Validação do formulário antes do envio
        scheduleForm.addEventListener('submit', function(e) {
            let hasErrors = false; // Reset hasErrors no início da validação
            
            // Validar campos obrigatórios
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('invalid');
                    showFieldError(field, 'Campo obrigatório');
                    hasErrors = true;
                }
            });
            
            // Validações específicas
            if (emailInput && !validateEmail(emailInput.value)) {
                emailInput.classList.add('invalid');
                showFieldError(emailInput, 'E-mail inválido');
                hasErrors = true;
            }
            
            if (cpfInput && cpfInput.value && !validateCPF(cpfInput.value)) {
                cpfInput.classList.add('invalid');
                showFieldError(cpfInput, 'CPF inválido');
                hasErrors = true;
            }
            
            // Validar data e horário
            const meetingDate = document.getElementById('meeting-date');
            const meetingTime = document.getElementById('meeting-time');
            
            if (meetingDate && !meetingDate.value) {
                showFieldError(meetingDate, 'Selecione uma data');
                hasErrors = true;
            }
            
            if (meetingTime && !meetingTime.value) {
                showFieldError(meetingTime, 'Selecione um horário');
                hasErrors = true;
            }
            
            // Validar áreas jurídicas
            const areaCheckboxes = document.querySelectorAll('input[name="area"]:checked');
            if (areaCheckboxes.length === 0) {
                showMessage('form-error', 'Por favor, selecione pelo menos uma área jurídica.');
                hasErrors = true;
            }
            
            if (hasErrors) {
                e.preventDefault();
                // Rolar até o primeiro erro
                const firstError = document.querySelector('.invalid, .form-error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return false;
            }
        });
    }
});

// Função para mostrar erro no campo
function showFieldError(field, message) {
    removeFieldError(field);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

// Função para remover erro do campo
function removeFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Função para mostrar feedback de sucesso com confete
function showSuccessWithConfetti() {
    // Criar e configurar o canvas para o confete
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
    
    // Criar efeito de confete manualmente
    function createConfetti() {
        const colors = ['#1a5276', '#3498db', '#2ecc71', '#f1c40f', '#e74c3c'];
        const confettiCount = 100;
        const gravity = 0.5;
        const terminalVelocity = 5;
        const drag = 0.075;
        const confettis = [];
        
        for (let i = 0; i < confettiCount; i++) {
            confettis.push({
                color: colors[Math.floor(Math.random() * colors.length)],
                dimensions: {
                    x: Math.random() * 10 + 5,
                    y: Math.random() * 10 + 5,
                },
                position: {
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height - canvas.height,
                },
                rotation: Math.random() * 2 * Math.PI,
                scale: 1,
                velocity: {
                    x: Math.random() * 6 - 3,
                    y: Math.random() * -15 - 5,
                },
            });
        }
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        function update() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            confettis.forEach((confetti, index) => {
                confetti.velocity.x -= confetti.velocity.x * drag;
                confetti.velocity.y = Math.min(confetti.velocity.y + gravity, terminalVelocity);
                confetti.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();
                
                confetti.position.x += confetti.velocity.x;
                confetti.position.y += confetti.velocity.y;
                confetti.rotation += 0.01;
                
                if (confetti.position.y >= canvas.height) {
                    confettis.splice(index, 1);
                }
                
                ctx.save();
                ctx.translate(confetti.position.x, confetti.position.y);
                ctx.rotate(confetti.rotation);
                
                ctx.fillStyle = confetti.color;
                ctx.fillRect(-confetti.dimensions.x / 2, -confetti.dimensions.y / 2, 
                           confetti.dimensions.x, confetti.dimensions.y);
                
                ctx.restore();
            });
            
            if (confettis.length > 0) {
                requestAnimationFrame(update);
            } else {
                canvas.remove();
            }
        }
        
        requestAnimationFrame(update);
    }
    
    createConfetti();
}

// Função para alternar entre as abas
function switchTab(tabId) {
    console.log('Alternando para a aba:', tabId);
    
    // Remover classe ativa de todas as abas e conteúdos
    document.querySelectorAll('.schedule-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    // Adicionar classe ativa à aba selecionada
    const selectedTab = document.querySelector(`[data-tab="${tabId}"]`);
    const selectedContent = document.getElementById(tabId);
    
    if (selectedTab && selectedContent) {
        selectedTab.classList.add('active');
        selectedContent.classList.add('active');
        selectedContent.style.display = 'block';
        
        // Animar a entrada do conteúdo
        selectedContent.style.opacity = '0';
        selectedContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            selectedContent.style.transition = 'all 0.3s ease';
            selectedContent.style.opacity = '1';
            selectedContent.style.transform = 'translateY(0)';
        }, 50);
    }
    
    // Limpar mensagens de erro/sucesso ao trocar de aba
    const messages = document.querySelectorAll('.form-success, .form-error');
    messages.forEach(msg => msg.remove());
    
    // Resetar formulários ao trocar de aba
    if (tabId === 'new-appointment') {
        const scheduleForm = document.getElementById('scheduleForm');
        if (scheduleForm) {
            scheduleForm.reset();
            const selectedDate = document.getElementById('selected-date');
            if (selectedDate) selectedDate.textContent = 'Nenhuma';
            
            const timeSlots = document.getElementById('time-slots');
            if (timeSlots) {
                timeSlots.innerHTML = '<p class="select-date-message">Selecione uma data para ver os horários disponíveis</p>';
            }
            
            const meetingDate = document.getElementById('meeting-date');
            if (meetingDate) meetingDate.value = '';
            
            const meetingTime = document.getElementById('meeting-time');
            if (meetingTime) meetingTime.value = '';
        }
    } else if (tabId === 'check-appointment') {
        // Resetar o formulário de consulta
        const checkForm = document.getElementById('checkAppointmentForm');
        if (checkForm) {
            checkForm.reset();
            checkForm.style.display = 'block';
        }
        
        // Limpar resultados anteriores
        const checkContainer = document.getElementById('check-appointment');
        if (checkContainer) {
            const resultDiv = checkContainer.querySelector('.appointment-check-result');
            if (resultDiv) {
                resultDiv.remove();
            }
        }
        
        // Remover mensagens de erro
        const errorMessages = document.querySelectorAll('.field-error, .form-error');
        errorMessages.forEach(msg => msg.remove());
    }
    
    console.log('Aba alternada com sucesso para:', tabId);
}

// Inicializar as abas
document.addEventListener('DOMContentLoaded', function() {
    const scheduleTabs = document.querySelectorAll('.schedule-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Esconder todos os conteúdos inicialmente
    tabContents.forEach(content => {
        content.style.display = 'none';
    });
    
    if (scheduleTabs.length > 0) {
        scheduleTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                switchTab(tabId);
            });
        });
        
        // Verificar se há um hash na URL para abrir uma aba específica
        const hash = window.location.hash.substring(1);
        if (hash === 'consultar') {
            switchTab('check-appointment');
        } else {
            // Abrir a aba de novo agendamento por padrão
            switchTab('new-appointment');
        }
    }
});

// Sistema de controle de agendamentos
const AppointmentManager = {
    // Armazenar tentativas de agendamento por IP/email
    attempts: new Map(),
    // Limite de tentativas por hora
    maxAttempts: 3,
    // Tempo de bloqueio em minutos
    blockDuration: 60,
    // Cache de agendamentos por código
    appointmentsByCode: new Map(),
    
    // Inicializar dados do localStorage
    init: function() {
        try {
            const savedAppointments = localStorage.getItem('appointments');
            console.log('Dados encontrados no localStorage:', savedAppointments);
            
            if (savedAppointments) {
                const appointments = JSON.parse(savedAppointments);
                appointments.forEach(appointment => {
                    this.appointmentsByCode.set(appointment.code, appointment);
                });
                console.log('Agendamentos carregados:', Array.from(this.appointmentsByCode.entries()));
            } else {
                console.log('Nenhum agendamento encontrado no localStorage');
            }
        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
        }
    },
    
    // Salvar dados no localStorage
    saveToStorage: function() {
        try {
            const appointments = Array.from(this.appointmentsByCode.values());
            localStorage.setItem('appointments', JSON.stringify(appointments));
            console.log('Agendamentos salvos no localStorage:', appointments);
        } catch (error) {
            console.error('Erro ao salvar agendamentos:', error);
        }
    },
    
    // Verificar se o usuário pode fazer um agendamento
    canMakeAppointment: function(email) {
        const now = Date.now();
        const userAttempts = this.attempts.get(email) || { count: 0, lastAttempt: 0, blocked: false };
        
        // Verificar se está bloqueado
        if (userAttempts.blocked) {
            const blockEndTime = userAttempts.lastAttempt + (this.blockDuration * 60 * 1000);
            if (now < blockEndTime) {
                const remainingMinutes = Math.ceil((blockEndTime - now) / (60 * 1000));
                return {
                    allowed: false,
                    message: `Muitas tentativas. Por favor, aguarde ${remainingMinutes} minutos antes de tentar novamente.`
                };
            } else {
                userAttempts.blocked = false;
                userAttempts.count = 0;
            }
        }
        
        // Verificar agendamentos existentes
        const activeAppointments = Array.from(this.appointmentsByCode.values()).filter(app => 
            app.email === email && 
            app.status === 'pending' && 
            new Date(app.date) > new Date()
        );
        
        if (activeAppointments.length >= 2) {
            return {
                allowed: false,
                message: 'Você já possui 2 agendamentos ativos. Por favor, aguarde a realização ou cancele um deles.'
            };
        }
        
        return { allowed: true };
    },
    
    // Registrar tentativa de agendamento
    registerAttempt: function(email) {
        const now = Date.now();
        const userAttempts = this.attempts.get(email) || { count: 0, lastAttempt: 0, blocked: false };
        
        userAttempts.count++;
        userAttempts.lastAttempt = now;
        
        if (userAttempts.count >= this.maxAttempts) {
            userAttempts.blocked = true;
        }
        
        this.attempts.set(email, userAttempts);
    },
    
    // Registrar um novo agendamento
    registerAppointment: function(appointmentData) {
        try {
            console.log('Registrando novo agendamento:', appointmentData);
            
            // Formatar a data para exibição
            const appointmentDate = new Date(appointmentData.date);
            const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            
            // Criar objeto do agendamento com todos os dados necessários
            const appointment = {
                code: appointmentData.code,
                name: appointmentData.name,
                email: appointmentData.email,
                phone: appointmentData.phone,
                document: appointmentData.document,
                date: formattedDate,
                rawDate: appointmentData.date,
                time: appointmentData.time,
                type: appointmentData.type,
                format: appointmentData.format,
                areas: appointmentData.areas,
                notes: appointmentData.notes,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            
            console.log('Objeto do agendamento criado:', appointment);
            
            // Salvar o agendamento usando o código como chave
            this.appointmentsByCode.set(appointment.code, appointment);
            
            // Persistir no localStorage
            this.saveToStorage();
            
            console.log('Agendamento registrado com sucesso');
            return appointment;
        } catch (error) {
            console.error('Erro ao registrar agendamento:', error);
            throw error;
        }
    },
    
    // Buscar agendamento por código
    findAppointmentByCode: function(code) {
        console.log('Buscando agendamento com código:', code);
        console.log('Agendamentos disponíveis:', Array.from(this.appointmentsByCode.entries()));
        
        const appointment = this.appointmentsByCode.get(code);
        console.log('Agendamento encontrado:', appointment);
        
        return appointment;
    },
    
    // Cancelar agendamento
    cancelAppointment: function(code) {
        try {
            console.log('Tentando cancelar agendamento:', code);
            
            const appointment = this.appointmentsByCode.get(code);
            if (appointment) {
                appointment.status = 'canceled';
                appointment.canceledAt = new Date().toISOString();
                this.appointmentsByCode.set(code, appointment);
                
                // Persistir no localStorage
                this.saveToStorage();
                
                console.log('Agendamento cancelado com sucesso:', appointment);
                return appointment;
            }
            
            console.log('Agendamento não encontrado para cancelamento');
            return null;
        } catch (error) {
            console.error('Erro ao cancelar agendamento:', error);
            throw error;
        }
    }
};

// Função para formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Adicionar funcionalidade para o advogado gerenciar agendamentos
async function handleAppointmentAction(code, action) {
    try {
        const appointment = findAppointmentByCode(code);
        if (!appointment) {
            return { success: false, message: 'Agendamento não encontrado.' };
        }
        
        appointment.status = action;
        appointment.updatedAt = new Date().toISOString();
        
        // Gerar mensagem para o cliente
        const clientMessage = `
*ATUALIZAÇÃO DO SEU AGENDAMENTO*

Código: ${appointment.code}
Status: ${action === 'approved' ? 'APROVADO ✅' : 'RECUSADO ❌'}

${action === 'approved' ? `
Seu agendamento foi confirmado para:
📅 Data: ${formatDate(appointment.date)}
⏰ Horário: ${appointment.time}
📍 Formato: ${appointment.format}

Por favor, chegue com 10 minutos de antecedência.
` : `
Infelizmente, não será possível atender você no horário solicitado.
Por favor, tente agendar em outro horário disponível.
`}

Atenciosamente,
Escritório de Advocacia
`;
        
        // Enviar mensagem para o cliente
        const clientWhatsApp = appointment.phone.replace(/\D/g, '');
        const encodedClientMessage = encodeURIComponent(clientMessage);
        const clientWhatsappLink = `https://wa.me/${clientWhatsApp}?text=${encodedClientMessage}`;
        
        return {
            success: true,
            message: `Agendamento ${action === 'approved' ? 'aprovado' : 'recusado'} com sucesso.`,
            whatsappLink: clientWhatsappLink
        };
    } catch (error) {
        console.error('Erro ao processar ação:', error);
        return { success: false, message: 'Erro ao processar a ação.' };
    }
}

// Função auxiliar para encontrar agendamento por código
function findAppointmentByCode(code) {
    for (const [email, appointments] of AppointmentManager.appointmentsByCode) {
        const appointment = appointments.find(app => app.code === code);
        if (appointment) return appointment;
    }
    return null;
}

// Inicializar o AppointmentManager quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando AppointmentManager...');
    AppointmentManager.init();
    console.log('AppointmentManager inicializado. Agendamentos:', Array.from(AppointmentManager.appointmentsByCode.entries()));
});