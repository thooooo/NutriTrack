const { compose, map, reduce } = R;

const getToken = () => localStorage.getItem('token');

const api = {
    // Add repas
    addMeal: meal =>
        fetch('/api/meals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(meal)
        }).then(res => res.json()),
    
    // Select repas
    getTodayMeals: () =>
        fetch('/api/meals', {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        }).then(res => res.json()),
    
    // Suppr repas
    deleteMeal: (mealId) =>
        fetch(`/api/meals/${mealId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        })
};

// --------------------------------------------------------------------------

// Filtrer et regrouper les repas par date
const groupMealsByDate = meals => {
    return meals.reduce((acc, meal) => {
        const date = meal.date.split('T')[0];
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(meal);
        return acc;
    }, {});
};

// Afficher liste repas
const renderMealsList = meals => {
    const groupedMeals = groupMealsByDate(meals);
    const mealsList = document.getElementById('mealsList');
    mealsList.innerHTML = '';

    Object.entries(groupedMeals)
        .sort((a, b) => new Date(b[0]) - new Date(a[0]))
        .forEach(([date, dayMeals]) => {
            const dateSection = document.createElement('div');
            dateSection.className = 'date-section';
            
            const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            dateSection.innerHTML = `
                <h3 class="date-header">${formattedDate}</h3>
                <div class="meals-container">
                    ${dayMeals.map(meal => `
                        <div class="meal-item">
                            <h4>${meal.name}</h4>
                            <p>Calories: ${meal.calories} kcal</p>
                            <p>Protéines: ${meal.proteins}g</p>
                            <p>Lipides: ${meal.fats}g</p>
                            <p>Glucides: ${meal.carbs}g</p>
                            <button class="delete-meal" data-id="${meal.id}">Supprimer</button>
                        </div>
                    `).join('')}
                </div>
            `;
            mealsList.appendChild(dateSection);
        });

    // Boutons suppr repas
    document.querySelectorAll('.delete-meal').forEach(button => {
        button.addEventListener('click', async (e) => {
            const mealId = e.target.dataset.id;
            try {
                await api.deleteMeal(mealId);
                loadTodayMeals();
            } catch (error) {
                console.error('Error deleting meal:', error);
            }
        });
    });
};

// --------------------------------------------------------------------------

// Init et afficher liste repas
const loadTodayMeals = async () => {
    try {
        const meals = await api.getTodayMeals();
        renderMealsList(meals);
    } catch (error) {
        console.error('Error loading meals:', error);
    }
};

// --------------------------------------------------------------------------

// Ajout repas form submit
document.getElementById('mealForm').addEventListener('submit', async e => {
    e.preventDefault();
    const meal = {
        name: document.getElementById('mealName').value,
        calories: Number(document.getElementById('mealCalories').value),
        proteins: Number(document.getElementById('mealProteins').value),
        fats: Number(document.getElementById('mealFats').value),
        carbs: Number(document.getElementById('mealCarbs').value),
        date: new Date().toISOString()
    };

    try {
        await api.addMeal(meal);
        document.getElementById('mealForm').reset();
        loadTodayMeals();
    } catch (error) {
        alert('Erreur lors de l\'ajout du repas');
    }
});

// Init liste repas au chargement de la page
document.addEventListener('DOMContentLoaded', loadTodayMeals);

// Logout
document.getElementById('logout').addEventListener('click', e => {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/index.html';
});