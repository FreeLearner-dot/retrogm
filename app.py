from flask import Flask, render_template, request, session, redirect, url_for, jsonify
import sqlite3
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv() 

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY","dev-secret")

# app.secret_key = os.environ.get('SESSION_SECRET')
if not app.secret_key:
    raise RuntimeError('SESSION_SECRET environment variable must be set for security')

# Database setup
def init_db():
    conn = sqlite3.connect('game_scores.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS scores
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  player_name TEXT NOT NULL,
                  game_name TEXT NOT NULL,
                  score INTEGER NOT NULL,
                  time_taken INTEGER NOT NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/player_name', methods=['GET', 'POST'])
def player_name():
    if request.method == 'POST':
        name = request.form.get('player_name', '').strip()
        
        # Validate player name
        if not name or len(name) > 20 or len(name) < 1:
            return render_template('player_name.html', error='Player name must be 1-20 characters')
        
        # Basic sanitization - allow alphanumeric, spaces, and common symbols
        import re
        if not re.match(r'^[a-zA-Z0-9\s\-_]+$', name):
            return render_template('player_name.html', error='Player name contains invalid characters')
        
        session['player_name'] = name
        return redirect(url_for('game_select'))
    return render_template('player_name.html')

@app.route('/games')
def game_select():
    if 'player_name' not in session:
        return redirect(url_for('player_name'))
    return render_template('game_select.html', player_name=session['player_name'])

# Game identifier mapping
GAME_MAPPING = {
    'stack': 'Stack Game',
    'runner': 'Avoidance Runner', 
    'bouncing': 'Bouncing Ball',
    'shooter': 'Target Shooter'
}

@app.route('/game/<game_name>')
def game(game_name):
    if 'player_name' not in session:
        return redirect(url_for('player_name'))
    
    # Whitelist allowed games to prevent path traversal
    if game_name not in GAME_MAPPING:
        return redirect(url_for('game_select'))
    
    return render_template(f'games/{game_name}.html', game_name=game_name, player_name=session['player_name'])


# High Score Board Route
@app.route('/highscores')
def highscores():
    conn = sqlite3.connect('game_scores.db')
    c = conn.cursor()
    c.execute('''SELECT player_name, game_name, score, time_taken, created_at 
                 FROM scores WHERE score = (
                     SELECT MAX(score) FROM scores s2 WHERE s2.game_name = scores.game_name
                 )
                 GROUP BY game_name, player_name
                 ORDER BY score DESC, time_taken ASC LIMIT 50''')
    highscores = c.fetchall()
    conn.close()
    return render_template('highscores.html', highscores=highscores)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/save_score', methods=['POST'])
def save_score():
    if 'player_name' not in session:
        return jsonify({'error': 'Player name not set'}), 400
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400
    
    game_name = data.get('game_name')
    score = data.get('score')
    time_taken = data.get('time_taken')
    
    # Validate required fields and types
    if not game_name or not isinstance(score, (int, float)) or not isinstance(time_taken, (int, float)):
        return jsonify({'error': 'Invalid data provided'}), 400
    
    # Map slug to display name if needed, or validate display name
    if game_name in GAME_MAPPING:
        # Convert slug to display name for storage
        game_name = GAME_MAPPING[game_name]
    elif game_name not in GAME_MAPPING.values():
        return jsonify({'error': 'Invalid game name'}), 400
    
    # Convert to integers and validate bounds
    score = int(score)
    time_taken = int(time_taken)
    
    # Sanity check bounds (prevent obviously fraudulent scores)
    if score < 0 or score > 1000000:  # Max score of 1 million
        return jsonify({'error': 'Invalid score range'}), 400
    
    if time_taken < 0 or time_taken > 86400:  # Max time of 24 hours
        return jsonify({'error': 'Invalid time range'}), 400
    
    conn = sqlite3.connect('game_scores.db')
    c = conn.cursor()
    c.execute('INSERT INTO scores (player_name, game_name, score, time_taken) VALUES (?, ?, ?, ?)',
              (session['player_name'], game_name, score, time_taken))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

if __name__ == '__main__':
    init_db()
    app.debug = True
    app.run(debug=True, host='0.0.0.0', port=5000)