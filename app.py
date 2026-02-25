from flask import Flask, request, jsonify, render_template
import json
import os

app = Flask(__name__)
TASKS_FILE = "tasks.json"

from typing import List, Dict, Any

def load_tasks() -> List[Dict[str, Any]]:
    """Load tasks from the JSON file."""
    if not os.path.exists(TASKS_FILE):
        return []
    try:
        with open(TASKS_FILE, "r") as file:
            return json.load(file) or []
    except (json.JSONDecodeError, IOError):
        return []

def save_tasks(tasks):
    """Save tasks to the JSON file."""
    try:
        with open(TASKS_FILE, "w") as file:
            json.dump(tasks, file, indent=4)
    except IOError:
        pass

# Route for rendering UI
@app.route('/')
def index():
    return render_template('index.html')

# API Endpoints
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = load_tasks()
    # Inject an ID (1-based index) for frontend referencing
    for i, task in enumerate(tasks):
        task['id'] = i + 1
    return jsonify({"tasks": tasks})

@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.json
    title = data.get('title', '').strip()
    time_str = data.get('time', '')
    category = data.get('category', 'General')
    
    if not title:
        return jsonify({"error": "Task title cannot be empty"}), 400
        
    tasks = load_tasks()
    tasks.append({
        "title": title, 
        "completed": False,
        "time": time_str,
        "category": category
    })
    save_tasks(tasks)
    
    return jsonify({"message": "Task added successfully"}), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    tasks = load_tasks()
    
    if 1 <= task_id <= len(tasks):
        data = request.json
        # Only support updating completed status right now
        if 'completed' in data:
            tasks[task_id - 1]['completed'] = bool(data['completed'])
            save_tasks(tasks)
            return jsonify({"message": "Task updated successfully"}), 200
            
    return jsonify({"error": "Task not found"}), 404

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    tasks = load_tasks()
    
    if 1 <= task_id <= len(tasks):
        tasks.pop(task_id - 1)
        save_tasks(tasks)
        return jsonify({"message": "Task deleted successfully"}), 200
        
    return jsonify({"error": "Task not found"}), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)