const { compose, groupBy, map, reduce, prop } = R;

const getToken = () => localStorage.getItem('token');

const api = {
    // Select repas
    fetchMeals: () =>
        fetch('/api/meals', {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        }).then(res => res.json()),
    
    // Select objectifs
    fetchGoals: () =>
        fetch('/api/goals', {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        }).then(res => res.json())
};

// --------------------------------------------------------------------------

// Filtrer et regrouper les repas par date
const groupMealsByDate = meals => {
    const groups = {};
    meals.forEach(meal => {
        const date = meal.date.split('T')[0];
        if (!groups[date]) {
            groups[date] = {
                calories: 0,
                proteins: 0,
                fats: 0,
                carbs: 0
            };
        }
        groups[date].calories += meal.calories;
        groups[date].proteins += meal.proteins;
        groups[date].fats += meal.fats;
        groups[date].carbs += meal.carbs;
    });
    return groups;
};

// --------------------------------------------------------------------------

// Graphique barre calories et calories restante jusqu'à l'objectif
const createCaloriesChart = (data, goalCalories) => {
    const ctx = document.getElementById('caloriesChart').getContext('2d');
    const dates = Object.keys(data).sort();
    const consumedCalories = dates.map(date => data[date].calories);
    const remainingCalories = dates.map(date => 
        Math.max(0, goalCalories - data[date].calories)
    );

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates.map(date => new Date(date).toLocaleDateString('fr-FR')),
            datasets: [
                {
                    label: 'Calories consommées',
                    data: consumedCalories,
                    backgroundColor: '#007bff',
                },
                {
                    label: 'Calories manquantes',
                    data: remainingCalories,
                    backgroundColor: '#e9ecef',
                    stack: 'stack0'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Calories (kcal)'
                    },
                    stacked: true
                },
                x: {
                    stacked: true
                }
            }
        }
    });
};

// --------------------------------------------------------------------------

// Graphique camembert nutrition (part en Glucides, Lipides, Protéines)
const createNutritionChart = (data) => {
    const ctx = document.getElementById('nutritionChart').getContext('2d');
    const today = new Date().toISOString().split('T')[0];
    const todayData = data[today] || { proteins: 0, fats: 0, carbs: 0 };

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Protéines', 'Lipides', 'Glucides'],
            datasets: [{
                data: [
                    todayData.proteins,
                    todayData.fats,
                    todayData.carbs
                ],
                backgroundColor: [
                    '#28a745',
                    '#ffc107',
                    '#17a2b8'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
};

// --------------------------------------------------------------------------

// Init graphs
const initStatistics = async () => {
    try {
        const [meals, goals] = await Promise.all([
            api.fetchMeals(),
            api.fetchGoals()
        ]);
        
        const latestGoal = goals.reduce((latest, goal) => 
            (!latest || goal.id > latest.id) ? goal : latest
        , null);
        
        const groupedData = groupMealsByDate(meals);
        createCaloriesChart(groupedData, latestGoal?.calories || 0);
        createNutritionChart(groupedData);
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
};

// Init graphs au chargement de la page
document.addEventListener('DOMContentLoaded', initStatistics);

// Logout
document.getElementById('logout').addEventListener('click', e => {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/index.html';
});