from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

GAMES = {}

def generate_target(range_max):
    import random
    return random.randint(1, range_max)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/new-game", methods=["POST"])
def new_game():
    import uuid
    
    data = request.get_json()
    range_max = data.get("range", 100)
    
    game_id = str(uuid.uuid4())
    GAMES[game_id] = {
        "target": generate_target(range_max),
        "attempts": 0,
        "range": range_max
    }
    
    return jsonify({
        "message": f"A new game has started. Guess a number between 1 and {range_max}!",
        "attempts": 0,
        "game_id": game_id
    })

@app.route("/api/guess", methods=["POST"])
def guess_number():
    data = request.get_json()
    
    if not data or "guess" not in data:
        return jsonify({"error": "No guess provided."}), 400

    try:
        guess = int(data["guess"])
    except ValueError:
        return jsonify({"error": "Please enter a valid integer."}), 400

    # Get the latest game
    if not GAMES:
        return jsonify({"error": "No active game. Start a new game first."}), 400
    
    game_id = list(GAMES.keys())[-1]
    game = GAMES[game_id]
    target = game["target"]
    range_max = game["range"]

    if guess < 1 or guess > range_max:
        return jsonify({
            "message": f"Please enter a number between 1 and {range_max}.",
            "type": "error"
        })

    game["attempts"] += 1

    if guess < target:
        return jsonify({
            "message": "Too low! Try a higher number.",
            "type": "warning",
            "attempts": game["attempts"]
        })

    if guess > target:
        return jsonify({
            "message": "Too high! Try a lower number.",
            "type": "warning",
            "attempts": game["attempts"]
        })

    return jsonify({
        "message": f"Correct! You guessed the number in {game['attempts']} attempt(s).",
        "type": "success",
        "attempts": game["attempts"]
    })

if __name__ == "__main__":
    app.run(debug=True)
