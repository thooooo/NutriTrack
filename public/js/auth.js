const { compose, prop } = R;

// Token
const getToken = () => localStorage.getItem('token');
const setToken = token => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

// --------------------------------------------------------------------------

const api = {
    // Login
    login: credentials => 
        fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        }).then(res => res.json()),
    
    // Register
    register: userData =>
        fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        }).then(res => res.json())
};

// --------------------------------------------------------------------------

// Register form switch
document.getElementById('showRegister').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
});

// Login form switch
document.getElementById('showLogin').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
});

// --------------------------------------------------------------------------

// Login form submit
document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const credentials = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await api.login(credentials);
        if (response.token) {
            setToken(response.token);
            window.location.href = '/dashboard.html';
        }
    } catch (error) {
        alert('Erreur de connexion');
    }
});


// Register form submit
document.getElementById('registerForm').addEventListener('submit', async e => {
    e.preventDefault();
    const userData = {
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value
    };

    try {
        await api.register(userData);
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('loginForm').classList.remove('hidden');
        alert('Inscription réussie !');
    } catch (error) {
        alert('Erreur lors de l\'inscription');
    }
});