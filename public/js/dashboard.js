const { compose, map, reduce, prop } = R;

const getToken = () => localStorage.getItem('token');

const api = {
    // Select objectifs
    fetchGoals: () =>
        fetch('/api/goals', {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        }).then(res => res.json()),
    
    // Select repas
    fetchMeals: () =>
        fetch('/api/meals', {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        }).then(res => res.json())
};

// --------------------------------------------------------------------------

// Calcul des calories des repas par jour
const calculateDailyProgress = meals => {
    const today = new Date().toISOString().split('T')[0];
    return meals
        .filter(meal => meal.date.startsWith(today))
        .reduce((acc, meal) => ({
            calories: acc.calories + meal.calories,
            proteins: acc.proteins + meal.proteins,
            fats: acc.fats + meal.fats,
            carbs: acc.carbs + meal.carbs
        }), { calories: 0, proteins: 0, fats: 0, carbs: 0 });
};

// Maj du dashboard
const updateProgressBars = (current, target) => {
    const calculatePercentage = (current, target) => {
        if (!target || target === 0) return 0;
        return Math.min((current / target) * 100, 100);
    };
    
    // Maj de l'objectif le plus récent (id max)
    const latestGoal = Array.isArray(target) && target.length > 0 
        ? target.reduce((latest, goal) => {
            return (!latest || goal.id > latest.id) ? goal : latest;
        }, null)
        : target;
    
    const currentData = current || { calories: 0, proteins: 0, fats: 0, carbs: 0 };
    const targetData = latestGoal || { calories: 0, proteins: 0, fats: 0, carbs: 0 };
    
    // Affichage des barres
    document.getElementById('caloriesProgress').style.width = `${calculatePercentage(currentData.calories, targetData.calories)}%`;
    document.getElementById('proteinsProgress').style.width = `${calculatePercentage(currentData.proteins, targetData.proteins)}%`;
    document.getElementById('fatsProgress').style.width = `${calculatePercentage(currentData.fats, targetData.fats)}%`;
    document.getElementById('carbsProgress').style.width = `${calculatePercentage(currentData.carbs, targetData.carbs)}%`;
    
    // Affichage des valeurs
    document.getElementById('currentCalories').textContent = Math.round(currentData.calories);
    document.getElementById('targetCalories').textContent = targetData.calories;
    document.getElementById('currentProteins').textContent = Math.round(currentData.proteins);
    document.getElementById('targetProteins').textContent = targetData.proteins;
    document.getElementById('currentFats').textContent = Math.round(currentData.fats);
    document.getElementById('targetFats').textContent = targetData.fats;
    document.getElementById('currentCarbs').textContent = Math.round(currentData.carbs);
    document.getElementById('targetCarbs').textContent = targetData.carbs;
};

// --------------------------------------------------------------------------

// Dashboard
const initDashboard = async () => {
    try {
        const [goals, meals] = await Promise.all([
            api.fetchGoals().catch(() => null),
            api.fetchMeals().catch(() => [])
        ]);
        
        const progress = calculateDailyProgress(meals || []);
        updateProgressBars(progress, goals);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        updateProgressBars(null, null);
    }
};

// Refresh dashboard toutes les 30s
const refreshDashboard = () => {
    initDashboard();
};
setInterval(refreshDashboard, 30000);

// Init dashboard au chargement de la page
document.addEventListener('DOMContentLoaded', initDashboard);

// Logout (remove token et redirection vers page de login)
document.getElementById('logout').addEventListener('click', e => {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/index.html';
});