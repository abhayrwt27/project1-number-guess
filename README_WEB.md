# Number Guessing Game - Web Version

A beautiful, interactive web-based number guessing game with a Python Flask backend and animated frontend.

## Features

✨ **Interactive UI** - Beautiful dark-themed interface with smooth animations
🔢 **Floating Numbers** - Animated numbers drifting across the background
⭐ **Twinkling Stars** - Dynamic starfield background
🌀 **Gradient Orbs** - Floating animated gradient effects
📱 **Fully Responsive** - Works on desktop, tablet, and mobile devices
🎮 **Smooth Gameplay** - Real-time feedback with engaging animations

## How to Run

### Prerequisites
- Python 3.7+
- pip (Python package manager)

### Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Flask server:**
   ```bash
   python app.py
   ```

3. **Open in browser:**
   Visit `http://localhost:5000` in your web browser

### Play the Game

- Enter a number between 1 and 100
- The game will tell you if your guess is too high or too low
- Try to guess the correct number in as few attempts as possible
- Click "New Game" to start over

## Project Structure

```
project1-number-guess/
├── app.py                 # Flask backend with game logic
├── requirements.txt       # Python dependencies
├── templates/
│   └── index.html        # HTML template with game UI
└── static/
    ├── style.css         # Animated styling
    └── script.js         # Frontend logic
```

## Technologies Used

- **Backend:** Python + Flask
- **Frontend:** HTML5, CSS3, JavaScript
- **Styling:** Custom CSS with animations and gradients

## Game Logic

The game generates a random number between 1-100 and tracks your attempts. It provides real-time feedback:
- 🟡 **Too Low** - Your guess is lower than the target
- 🟡 **Too High** - Your guess is higher than the target
- 🟢 **Correct** - You've guessed the number!

Enjoy the game! 🎮
