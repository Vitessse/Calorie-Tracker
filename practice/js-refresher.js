const meals = [
  { name: "Oats", calories: 300 },
  { name: "Chicken Rice", calories: 650 },
  { name: "Protein Shake", calories: 200 },
];

const highCalorieMeals = meals.filter((meal) => meal.calories > 400);
console.log(highCalorieMeals);

const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
console.log("Total:", totalCalories);

const totalHighCalorie = highCalorieMeals.reduce((sum, meal) => sum + meal.calories, 0);
console.log("High-calorie total:", totalHighCalorie);