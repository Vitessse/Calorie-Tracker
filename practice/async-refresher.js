// Simulates a real API call using a Promise that resolves after a delay
function fakeFetchMeal(foodName) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (foodName === "unknown-food") {
        reject(new Error("Food not found"));
      } else {
        resolve({ name: foodName, calories: 450 });
      }
    }, 1000); // simulates 1 second network delay
  });
}

// This is how you'll write real API calls in your app
async function logMeal(foodName) {
  try {
    console.log(`Fetching ${foodName}...`);
    const meal = await fakeFetchMeal(foodName);
    console.log(`Got it: ${meal.name} - ${meal.calories} kcal`);
    return meal;
  } catch (error) {
    console.error(`Failed to fetch ${foodName}:`, error.message);
    return null;
  }
}

// Loops through multiple foods, one at a time, collecting only successful results
async function logMultipleMeals(foodNames) {
  const successfulMeals = [];

  for (const foodName of foodNames) {
    const meal = await logMeal(foodName); // wait for each one before moving to the next

    if (meal !== null) {
      successfulMeals.push(meal);
    }
  }

  const totalCalories = successfulMeals.reduce((sum, meal) => sum + meal.calories, 0);

  console.log("\n--- Summary ---");
  console.log("Successful meals:", successfulMeals.map((m) => m.name));
  console.log("Total calories:", totalCalories);

  return successfulMeals;
}

// Run it
logMultipleMeals(["Oats", "Chicken Rice", "unknown-food"]);