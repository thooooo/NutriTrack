const { compose } = R;

const getToken = () => localStorage.getItem('token');

const api = {
    // Select objectifs
    fetchGoals: () =>
        fetch('/api/goals', {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        }).then(res => res.json()),
    
    // Maj objectifs
    updateGoals: goals =>
        fetch('/api/goals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(goals)
        }).then(res => res.json())
};

// --------------------------------------------------------------------------

// Init objectifs
const loadGoals = async () => {
    try {
        const goals = await api.fetchGoals();
        document.getElementById('calories').value = goals.calories;
        document.getElementById('proteins').value = goals.proteins;
        document.getElementById('fats').value = goals.fats;
        document.getElementById('carbs').value = goals.carbs;
    } catch (error) {
        console.error('Error loading goals:', error);
    }
};

// Form objectifs submit
document.getElementById('goalsForm').addEventListener('submit', async e => {
    e.preventDefault();
    const goals = {
        calories: Number(document.getElementById('calories').value),
        proteins: Number(document.getElementById('proteins').value),
        fats: Number(document.getElementById('fats').value),
        carbs: Number(document.getElementById('carbs').value)
    };

    try {
        await api.updateGoals(goals);
        alert('Objectifs mis à jour avec succès !');
    } catch (error) {
        alert('Erreur lors de la mise à jour des objectifs');
    }
});

// Init objectifs au chargement de la page
document.addEventListener('DOMContentLoaded', loadGoals);

// Logout
document.getElementById('logout').addEventListener('click', e => {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/index.html';
});