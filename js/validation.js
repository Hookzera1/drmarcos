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
    if (isTimeBlocked(meetingDateInput.value, meetingTimeInput.value)) {
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
    
    try {
        // Salvar agendamento
        saveAppointment(appointmentData);
        
        // Limpar tentativas após sucesso
        attempts = 0;
        
        // Formatar data para exibição
        const formattedDate = new Date(appointmentData.meetingDate).toLocaleDateString('pt-BR');
        
        // Criar container para os detalhes se não existir
        let resultContainer = document.querySelector('#appointment-result');
        if (!resultContainer) {
            resultContainer = document.createElement('div');
            resultContainer.id = 'appointment-result';
            form.parentNode.insertBefore(resultContainer, form.nextSibling);
        }
        
        // Limpar resultados anteriores
        resultContainer.innerHTML = '';
        
        // Mostrar detalhes do agendamento
        const appointmentDetails = document.createElement('div');
        appointmentDetails.className = 'appointment-details';
        appointmentDetails.innerHTML = `
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h4>Agendamento Realizado com Sucesso!</h4>
            <div class="status-badge pending">
                <i class="fas fa-clock"></i>
                <span>Aguardando Confirmação</span>
            </div>
            <div class="appointment-code">
                <p>Guarde seu código de agendamento:</p>
                <strong>${appointmentData.code}</strong>
            </div>
            <div class="appointment-info">
                <p><strong>Nome:</strong> ${appointmentData.name}</p>
                <p><strong>Data:</strong> ${formattedDate}</p>
                <p><strong>Horário:</strong> ${appointmentData.meetingTime}</p>
                <p><strong>Tipo:</strong> ${appointmentData.meetingType}</p>
                <p><strong>Formato:</strong> ${appointmentData.format}</p>
                ${appointmentData.notes ? `<p><strong>Observações:</strong> ${appointmentData.notes}</p>` : ''}
            </div>
            <div class="appointment-message">
                <p>Seu agendamento foi recebido e está aguardando confirmação.</p>
                <p>Em breve você receberá uma confirmação via WhatsApp.</p>
            </div>
            <div class="appointment-actions">
                <a href="https://wa.me/5531992180253" target="_blank" class="btn btn-whatsapp">
                    <i class="fab fa-whatsapp"></i> Contatar via WhatsApp
                </a>
            </div>
        `;
        
        // Adicionar detalhes ao container
        resultContainer.appendChild(appointmentDetails);
        
        // Esconder o formulário
        form.style.display = 'none';
        
        // Redirecionar para WhatsApp
        const whatsappMessage = encodeURIComponent(
            `Olá Dr. Marcos! Acabei de fazer um agendamento pelo site.\n\n` +
            `Código: ${appointmentData.code}\n` +
            `Nome: ${appointmentData.name}\n` +
            `Data: ${formattedDate}\n` +
            `Horário: ${appointmentData.meetingTime}\n` +
            `Tipo: ${appointmentData.meetingType}\n` +
            `Formato: ${appointmentData.format}`
        );
        
        window.open(`https://wa.me/5531992180253?text=${whatsappMessage}`, '_blank');
        
        return false;
    } catch (error) {
        console.error('Erro ao salvar agendamento:', error);
        showMessage('error', 'Ocorreu um erro ao salvar o agendamento. Por favor, tente novamente.');
        return false;
    }
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
    
    // Encontrar o formulário ativo
    const activeTab = document.querySelector('.tab-content.active');
    const form = activeTab.querySelector('form');
    
    if (form) {
        // Remover mensagem anterior se existir
        const existingMessage = activeTab.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Inserir nova mensagem
        form.insertBefore(messageContainer, form.firstChild);
        
        // Remover mensagem após 5 segundos
        setTimeout(() => {
            messageContainer.remove();
        }, 5000);
    }
}

// Função para consultar agendamento
function checkAppointment(event) {
    event.preventDefault();
    
    const form = event.target;
    const emailInput = form.querySelector('#check-email');
    const codeInput = form.querySelector('#check-code');
    
    // Limpar mensagens de erro anteriores
    removeFieldError(emailInput);
    removeFieldError(codeInput);
    
    // Validar campos
    if (!emailInput.value.trim()) {
        showFieldError(emailInput, 'E-mail é obrigatório');
        return false;
    }
    
    if (!validateEmail(emailInput.value)) {
        showFieldError(emailInput, 'E-mail inválido');
        return false;
    }
    
    if (!codeInput.value.trim()) {
        showFieldError(codeInput, 'Código de agendamento é obrigatório');
        return false;
    }
    
    try {
        // Buscar agendamentos
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        const appointment = appointments.find(a => 
            a.email.toLowerCase() === emailInput.value.toLowerCase() && 
            a.code.toUpperCase() === codeInput.value.toUpperCase()
        );
        
        if (!appointment) {
            showMessage('error', 'Agendamento não encontrado. Verifique o e-mail e código informados.');
            return false;
        }
        
        // Formatar status para exibição
        const statusMap = {
            'pending': 'Pendente',
            'approved': 'Aprovado',
            'cancelled': 'Cancelado'
        };

        const statusIconMap = {
            'pending': 'clock',
            'approved': 'check',
            'cancelled': 'times'
        };

        const statusColorMap = {
            'pending': '#856404',
            'approved': '#155724',
            'cancelled': '#721c24'
        };
        
        // Formatar data para exibição
        const formattedDate = new Date(appointment.meetingDate).toLocaleDateString('pt-BR');
        
        // Criar container para os detalhes se não existir
        let resultContainer = document.querySelector('#appointment-result');
        if (!resultContainer) {
            resultContainer = document.createElement('div');
            resultContainer.id = 'appointment-result';
            form.parentNode.insertBefore(resultContainer, form.nextSibling);
        }
        
        // Limpar resultados anteriores
        resultContainer.innerHTML = '';
        
        // Mostrar detalhes do agendamento
        const appointmentDetails = document.createElement('div');
        appointmentDetails.className = 'appointment-details';
        appointmentDetails.innerHTML = `
            <h4>Detalhes do Agendamento</h4>
            <div class="status-badge ${appointment.status}">
                <i class="fas fa-${statusIconMap[appointment.status]}"></i>
                <span>${statusMap[appointment.status]}</span>
            </div>
            <div class="appointment-code">
                <p>Código do agendamento:</p>
                <strong>${appointment.code}</strong>
            </div>
            <div class="appointment-info">
                <p><strong>Nome:</strong> ${appointment.name}</p>
                <p><strong>Data:</strong> ${formattedDate}</p>
                <p><strong>Horário:</strong> ${appointment.meetingTime}</p>
                <p><strong>Tipo:</strong> ${appointment.meetingType}</p>
                <p><strong>Formato:</strong> ${appointment.format}</p>
                ${appointment.notes ? `<p><strong>Observações:</strong> ${appointment.notes}</p>` : ''}
                <p><strong>Agendado em:</strong> ${new Date(appointment.createdAt).toLocaleString('pt-BR')}</p>
            </div>
            ${appointment.status !== 'cancelled' ? `
                <div class="appointment-actions">
                    <button type="button" class="btn btn-danger" onclick="handleCancelAppointment('${appointment.code}')">
                        <i class="fas fa-times"></i> Cancelar Agendamento
                    </button>
                    <a href="https://wa.me/5531992180253" target="_blank" class="btn btn-whatsapp">
                        <i class="fab fa-whatsapp"></i> Contatar via WhatsApp
                    </a>
                </div>
            ` : `
                <div class="appointment-cancelled-message">
                    <i class="fas fa-info-circle"></i>
                    <p>Este agendamento foi cancelado em ${new Date(appointment.cancelledAt || appointment.updatedAt || appointment.createdAt).toLocaleString('pt-BR')}</p>
                </div>
            `}
        `;
        
        // Adicionar detalhes ao container
        resultContainer.appendChild(appointmentDetails);
        
        // Esconder o formulário após sucesso
        form.style.display = 'none';
        
        return false;
    } catch (error) {
        console.error('Erro ao consultar agendamento:', error);
        showMessage('error', 'Ocorreu um erro ao consultar o agendamento. Por favor, tente novamente.');
        return false;
    }
}

// Função para lidar com o cancelamento de agendamento
function handleCancelAppointment(code) {
    if (!code) {
        showMessage('error', 'Código de agendamento inválido');
        return;
    }

    if (confirm('Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.')) {
        try {
            const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
            const appointmentIndex = appointments.findIndex(a => a.code === code);
            
            if (appointmentIndex === -1) {
                showMessage('error', 'Agendamento não encontrado');
                return;
            }
            
            // Atualizar status e adicionar data de cancelamento
            const appointment = appointments[appointmentIndex];
            appointment.status = 'cancelled';
            appointment.cancelledAt = new Date().toISOString();
            appointments[appointmentIndex] = appointment;
            
            // Remover bloqueio do horário
            removeBlockedTime(appointment.meetingDate, appointment.meetingTime);
            
            // Salvar alterações
            localStorage.setItem('appointments', JSON.stringify(appointments));
            
            // Mostrar mensagem de sucesso com animação
            const resultContainer = document.querySelector('#appointment-result');
            if (resultContainer) {
                const successMessage = document.createElement('div');
                successMessage.className = 'cancellation-success';
                successMessage.innerHTML = `
                    <div class="cancellation-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h4>Agendamento Cancelado</h4>
                    <p>O agendamento foi cancelado com sucesso.</p>
                    <button type="button" class="btn btn-outline" onclick="resetConsultaForm()">
                        <i class="fas fa-search"></i> Consultar outro agendamento
                    </button>
                `;
                
                // Substituir conteúdo atual com animação
                resultContainer.style.opacity = '0';
                setTimeout(() => {
                    resultContainer.innerHTML = '';
                    resultContainer.appendChild(successMessage);
                    resultContainer.style.opacity = '1';
                }, 300);
            }
        } catch (error) {
            console.error('Erro ao cancelar agendamento:', error);
            showMessage('error', 'Ocorreu um erro ao cancelar o agendamento. Por favor, tente novamente.');
        }
    }
}

// Função para resetar o formulário de consulta
function resetConsultaForm() {
    const checkForm = document.querySelector('#checkAppointmentForm');
    const resultContainer = document.querySelector('#appointment-result');
    
    if (checkForm) {
        checkForm.reset();
        checkForm.style.display = 'block';
    }
    
    if (resultContainer) {
        resultContainer.innerHTML = '';
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