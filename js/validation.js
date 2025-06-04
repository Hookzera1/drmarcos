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
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    appointments.push(appointmentData);
    localStorage.setItem('appointments', JSON.stringify(appointments));
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
        alert(`Você está temporariamente bloqueado. Tente novamente em ${formatBlockTime(timeLeft)}`);
        return false;
    }
    
    const form = event.target;
    const cpfInput = form.querySelector('#cpf');
    const emailInput = form.querySelector('#email');
    const phoneInput = form.querySelector('#phone');
    
    // Formata os campos
    cpfInput.value = formatCPF(cpfInput.value);
    phoneInput.value = formatPhone(phoneInput.value);
    
    // Valida os campos
    if (!validateCPF(cpfInput.value)) {
        alert('CPF inválido');
        attempts++;
        checkAttempts();
        return false;
    }
    
    if (!validateEmail(emailInput.value)) {
        alert('E-mail inválido');
        attempts++;
        checkAttempts();
        return false;
    }
    
    if (!validatePhone(phoneInput.value)) {
        alert('Telefone inválido');
        attempts++;
        checkAttempts();
        return false;
    }
    
    // Se chegou aqui, o formulário é válido
    const appointmentData = {
        code: generateAppointmentCode(),
        name: form.querySelector('#name').value,
        cpf: cpfInput.value,
        email: emailInput.value,
        phone: phoneInput.value,
        subject: form.querySelector('#subject').value,
        message: form.querySelector('#message').value,
        preferredDate: form.querySelector('#preferredDate').value,
        preferredTime: form.querySelector('#preferredTime').value,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Salva o agendamento
    saveAppointment(appointmentData);
    
    // Redireciona para o WhatsApp
    const message = `Olá! Gostaria de agendar uma consulta.\n\n*Código:* ${appointmentData.code}\n*Nome:* ${appointmentData.name}\n*Assunto:* ${appointmentData.subject}\n*Data Preferencial:* ${appointmentData.preferredDate}\n*Horário Preferencial:* ${appointmentData.preferredTime}\n\n${appointmentData.message}`;
    const whatsappUrl = `https://wa.me/5531992180253?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;
    
    return false;
}

// Função para verificar número de tentativas
function checkAttempts() {
    if (attempts >= MAX_ATTEMPTS) {
        blockEndTime = Date.now() + BLOCK_DURATION;
        const blockMessage = document.createElement('div');
        blockMessage.className = 'form-error blocked';
        blockMessage.textContent = `Muitas tentativas. Tente novamente em ${formatBlockTime(BLOCK_DURATION)}`;
        document.querySelector('#appointmentForm').appendChild(blockMessage);
        updateBlockMessage();
    } else {
        const attemptsLeft = MAX_ATTEMPTS - attempts;
        const attemptsMessage = document.createElement('div');
        attemptsMessage.className = 'form-error attempts';
        attemptsMessage.textContent = `Você tem mais ${attemptsLeft} tentativa${attemptsLeft > 1 ? 's' : ''}.`;
        document.querySelector('#appointmentForm').appendChild(attemptsMessage);
    }
}

// Adiciona os event listeners para formatação em tempo real
document.addEventListener('DOMContentLoaded', function() {
    const cpfInput = document.querySelector('#cpf');
    const phoneInput = document.querySelector('#phone');
    
    if (cpfInput) {
        cpfInput.addEventListener('input', function() {
            this.value = formatCPF(this.value);
        });
    }
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            this.value = formatPhone(this.value);
        });
    }
}); 