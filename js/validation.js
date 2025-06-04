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
    phone = phone.replace(/[^\d]/g, '');
    return phone.length >= 10 && phone.length <= 11;
}

// Função para formatar CPF
function formatCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para formatar telefone
function formatPhone(phone) {
    phone = phone.replace(/[^\d]/g, '');
    if (phone.length === 11) {
        return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}

// Contador de tentativas
let attempts = 0;
const MAX_ATTEMPTS = 3;
const BLOCK_DURATION = 30 * 60 * 1000; // 30 minutos em milissegundos
let blockEndTime = 0;

// Função para verificar se o usuário está bloqueado
function isBlocked() {
    if (blockEndTime === 0) return false;
    const now = Date.now();
    if (now >= blockEndTime) {
        blockEndTime = 0;
        attempts = 0;
        return false;
    }
    return true;
}

// Função para formatar o tempo restante de bloqueio
function formatBlockTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
}

// Função para atualizar a mensagem de bloqueio
function updateBlockMessage() {
    const blockMessage = document.querySelector('.form-error.blocked');
    if (blockMessage && isBlocked()) {
        const timeLeft = blockEndTime - Date.now();
        blockMessage.textContent = `Muitas tentativas. Tente novamente em ${formatBlockTime(timeLeft)}`;
        if (timeLeft > 0) {
            setTimeout(updateBlockMessage, 1000);
        }
    }
}

// Função para salvar agendamento no localStorage
function saveAppointment(appointmentData) {
    // Salvar o agendamento
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    appointments.push(appointmentData);
    localStorage.setItem('appointments', JSON.stringify(appointments));

    // Bloquear o horário
    saveBlockedTime(appointmentData.meetingDate, appointmentData.meetingTime);
}

// Função para cancelar agendamento
function cancelAppointment(code) {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const appointmentIndex = appointments.findIndex(a => a.code === code);
    
    if (appointmentIndex !== -1) {
        const appointment = appointments[appointmentIndex];
        // Remover o bloqueio do horário
        removeBlockedTime(appointment.meetingDate, appointment.meetingTime);
        
        // Atualizar status do agendamento
        appointment.status = 'cancelled';
        appointments[appointmentIndex] = appointment;
        localStorage.setItem('appointments', JSON.stringify(appointments));
        return true;
    }
    return false;
}

// Função para gerar código único de agendamento
function generateAppointmentCode() {
    return 'AGD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Função para validar e enviar o formulário
function handleSubmit(event) {
    event.preventDefault();
    
    if (isBlocked()) {
        const timeLeft = blockEndTime - Date.now();
        showMessage('error', `Você está temporariamente bloqueado. Tente novamente em ${formatBlockTime(timeLeft)}`);
        return false;
    }
    
    const form = event.target;
    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const phoneInput = form.querySelector('#phone');
    const documentInput = form.querySelector('#document');
    const meetingTypeInput = form.querySelector('#meeting-type');
    const meetingDateInput = form.querySelector('#meeting-date');
    const meetingTimeInput = form.querySelector('#meeting-time');
    const notesInput = form.querySelector('#notes');
    
    // Validar campos obrigatórios
    if (!nameInput.value.trim()) {
        showFieldError(nameInput, 'Nome é obrigatório');
        attempts++;
        checkAttempts();
        return false;
    }
    
    if (!emailInput.value.trim()) {
        showFieldError(emailInput, 'E-mail é obrigatório');
        attempts++;
        checkAttempts();
        return false;
    }
    
    if (!validateEmail(emailInput.value)) {
        showFieldError(emailInput, 'E-mail inválido');
        attempts++;
        checkAttempts();
        return false;
    }
    
    if (!phoneInput.value.trim()) {
        showFieldError(phoneInput, 'Telefone é obrigatório');
        attempts++;
        checkAttempts();
        return false;
    }
    
    if (!validatePhone(phoneInput.value)) {
        showFieldError(phoneInput, 'Telefone inválido');
        attempts++;
        checkAttempts();
        return false;
    }
    
    if (documentInput.value && !validateCPF(documentInput.value)) {
        showFieldError(documentInput, 'CPF inválido');
        attempts++;
        checkAttempts();
        return false;
    }
    
    if (!meetingTypeInput.value) {
        showFieldError(meetingTypeInput, 'Selecione o tipo de reunião');
        attempts++;
        checkAttempts();
        return false;
    }
    
    if (!meetingDateInput.value) {
        showMessage('error', 'Selecione uma data para a reunião');
        attempts++;
        checkAttempts();
        return false;
    }
    
    if (!meetingTimeInput.value) {
        showMessage('error', 'Selecione um horário para a reunião');
        attempts++;
        checkAttempts();
        return false;
    }
    
    // Verificar se o horário ainda está disponível
    const meetingDate = meetingDateInput.value;
    const meetingTime = meetingTimeInput.value;
    
    if (isTimeBlocked(meetingDate, meetingTime)) {
        showMessage('error', 'Este horário já foi reservado. Por favor, escolha outro horário.');
        return false;
    }

    // Se chegou aqui, o formulário é válido
    const appointmentData = {
        code: generateAppointmentCode(),
        name: nameInput.value,
        email: emailInput.value,
        phone: formatPhone(phoneInput.value),
        document: documentInput.value ? formatCPF(documentInput.value) : '',
        meetingType: meetingTypeInput.value,
        meetingDate: meetingDateInput.value,
        meetingTime: meetingTimeInput.value,
        format: form.querySelector('input[name="format"]:checked').value,
        notes: notesInput.value,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Salvar agendamento
    saveAppointment(appointmentData);
    
    // Limpar tentativas após sucesso
    attempts = 0;
    
    // Mostrar mensagem de sucesso com o código
    showMessage('success', `Agendamento realizado com sucesso! Seu código é: ${appointmentData.code}`);
    
    // Limpar formulário
    form.reset();
    
    // Atualizar visualização do calendário
    const selectedDate = document.getElementById('meeting-date').value;
    if (selectedDate) {
        generateTimeSlots(selectedDate);
    }
    
    // Redirecionar para WhatsApp
    const whatsappMessage = encodeURIComponent(
        `Olá Dr. Marcos! Acabei de fazer um agendamento pelo site.\n\n` +
        `Código: ${appointmentData.code}\n` +
        `Nome: ${appointmentData.name}\n` +
        `Data: ${appointmentData.meetingDate}\n` +
        `Horário: ${appointmentData.meetingTime}\n` +
        `Tipo: ${appointmentData.meetingType}\n` +
        `Formato: ${appointmentData.format}`
    );
    
    window.open(`https://wa.me/5531992180253?text=${whatsappMessage}`, '_blank');
    
    return false;
}

// Função para verificar número de tentativas
function checkAttempts() {
    if (attempts >= MAX_ATTEMPTS) {
        blockEndTime = Date.now() + BLOCK_DURATION;
        showMessage('error', `Muitas tentativas. Tente novamente em ${formatBlockTime(BLOCK_DURATION)}`);
        updateBlockMessage();
    } else {
        const attemptsLeft = MAX_ATTEMPTS - attempts;
        showMessage('warning', `Tentativa ${attempts}/${MAX_ATTEMPTS}. Restam ${attemptsLeft} tentativas.`);
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

// Função para mostrar mensagem
function showMessage(type, message) {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message message-${type}`;
    messageContainer.textContent = message;
    
    const form = document.querySelector('#scheduleForm');
    const existingMessage = form.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    form.insertBefore(messageContainer, form.firstChild);
    
    setTimeout(() => {
        messageContainer.remove();
    }, 5000);
}

// Função para consultar agendamento
function checkAppointment(event) {
    event.preventDefault();
    
    const form = event.target;
    const emailInput = form.querySelector('#check-email');
    const codeInput = form.querySelector('#check-code');
    
    if (!emailInput.value.trim() || !validateEmail(emailInput.value)) {
        showFieldError(emailInput, 'E-mail inválido');
        return false;
    }
    
    if (!codeInput.value.trim()) {
        showFieldError(codeInput, 'Código de agendamento é obrigatório');
        return false;
    }
    
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const appointment = appointments.find(a => 
        a.email === emailInput.value && 
        a.code === codeInput.value
    );
    
    if (!appointment) {
        showMessage('error', 'Agendamento não encontrado');
        return false;
    }
    
    // Mostrar detalhes do agendamento
    const appointmentDetails = document.createElement('div');
    appointmentDetails.className = 'appointment-details';
    appointmentDetails.innerHTML = `
        <h4>Detalhes do Agendamento</h4>
        <div class="status-badge ${appointment.status}">
            <i class="fas fa-clock"></i>
            <span>${appointment.status === 'pending' ? 'Pendente' : 
                   appointment.status === 'approved' ? 'Aprovado' : 'Cancelado'}</span>
        </div>
        <div class="appointment-info">
            <p><strong>Nome:</strong> ${appointment.name}</p>
            <p><strong>Data:</strong> ${new Date(appointment.meetingDate).toLocaleDateString('pt-BR')}</p>
            <p><strong>Horário:</strong> ${appointment.meetingTime}</p>
            <p><strong>Tipo:</strong> ${appointment.meetingType}</p>
            <p><strong>Formato:</strong> ${appointment.format}</p>
        </div>
        ${appointment.status !== 'cancelled' ? `
            <button class="btn btn-danger" onclick="handleCancelAppointment('${appointment.code}')">
                Cancelar Agendamento
            </button>
        ` : ''}
    `;
    
    const resultContainer = document.querySelector('#check-appointment');
    const existingDetails = resultContainer.querySelector('.appointment-details');
    if (existingDetails) {
        existingDetails.remove();
    }
    
    form.appendChild(appointmentDetails);
    
    return false;
}

// Função para lidar com o cancelamento de agendamento
function handleCancelAppointment(code) {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        if (cancelAppointment(code)) {
            showMessage('success', 'Agendamento cancelado com sucesso!');
            // Recarregar os detalhes do agendamento
            const checkForm = document.querySelector('#checkAppointmentForm');
            if (checkForm) {
                checkAppointment.call(checkForm, { preventDefault: () => {} });
            }
            // Atualizar visualização do calendário se estiver visível
            const selectedDate = document.getElementById('meeting-date').value;
            if (selectedDate) {
                generateTimeSlots(selectedDate);
            }
        } else {
            showMessage('error', 'Não foi possível cancelar o agendamento');
        }
    }
}

// Inicializar eventos
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