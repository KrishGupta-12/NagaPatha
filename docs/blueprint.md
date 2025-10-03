# **App Name**: RetroSnake

## Core Features:

- Classic Snake Gameplay: Implement core mechanics: snake movement, food consumption, growth, and collision detection with walls and itself.
- Scoring System: Track and display current score and best score. Award +1 point per food eaten.
- User Authentication: Allow players to log in with Google or as a guest account to track their high scores.
- Cloud Firestore Leaderboard: Store player name and high score in Cloud Firestore. Display the top 10 global scores.
- Game Analytics: Track game-related events in order to improve user experience.
- Mobile-Friendly Controls: Implement swipe controls for direction changes on mobile devices.
- Dynamic Difficulty Adjustment: An AI tool which adjusts the game's difficulty level according to the user's playing ability.

## Style Guidelines:

- Primary color: Deep green (#32CD32), evoking the classic arcade snake theme, slightly desaturated.
- Background color: Dark green (#1E3A28), almost black, to maintain focus on the snake and food.
- Accent color: Bright yellow (#FFD700) to highlight the food and important UI elements.
- Font: 'Space Grotesk' sans-serif for headlines and shorter blocks of text and 'Inter' sans-serif for body
- Pixel-style icons for UI elements, such as the leaderboard button and power-up indicators.
- Retro grid layout with clearly defined boundaries for gameplay.
- Smooth snake movement between grid spaces, with food items flashing or pulsing.