import { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || null);
  const [showLogin, setShowLogin] = useState(true);
  
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        if (response.status === 401) handleLogout();
      }
    } catch (error) {
      console.error('Error fetching tasks', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (newTask) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTask)
      });
      if (response.ok) {
        const savedTask = await response.json();
        setTasks([savedTask, ...tasks]);
      }
    } catch (error) {
      console.error('Error adding task', error);
    }
  };

  const updateTask = async (updatedTask) => {
    try {
      const response = await fetch(`/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedTask)
      });
      if (response.ok) {
        const savedTask = await response.json();
        setTasks(tasks.map(task => task.id === savedTask.id ? savedTask : task));
        setEditingTask(null);
      }
    } catch (error) {
      console.error('Error updating task', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== id));
      }
    } catch (error) {
      console.error('Error deleting task', error);
    }
  };

  const toggleTaskStatus = async (id) => {
    const taskToToggle = tasks.find(task => task.id === id);
    if (!taskToToggle) return;
    
    const updatedStatus = taskToToggle.status === 'Completed' ? 'To Do' : 'Completed';
    
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...taskToToggle, status: updatedStatus })
      });
      if (response.ok) {
        const savedTask = await response.json();
        setTasks(tasks.map(task => task.id === id ? savedTask : task));
      }
    } catch (error) {
      console.error('Error toggling status', error);
    }
  };

  const handleFormSubmit = (task) => {
    if (editingTask) {
      updateTask(task);
    } else {
      addTask(task);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingTask(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
    setTasks([]);
  };

  if (!token) {
    return (
      <div className="app">
        <h1>Task Manager</h1>
        {showLogin ? (
          <Login setToken={setToken} setUsername={setUsername} onSwitchToRegister={() => setShowLogin(false)} />
        ) : (
          <Register setToken={setToken} setUsername={setUsername} onSwitchToLogin={() => setShowLogin(true)} />
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Task Manager</h1>
        <div className="user-controls">
          <span className="welcome-text">Welcome, {username}!</span>
          <button className="btn-secondary logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      
      <TaskForm 
        onSubmit={handleFormSubmit} 
        initialData={editingTask} 
        onCancel={editingTask ? cancelEdit : null} 
      />
      
      <div className="task-section">
        <div className="section-header">
          <h2>Your Tasks</h2>
          <span className="task-count">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
        </div>
        {loading ? (
          <p className="loading-text">Loading tasks...</p>
        ) : (
          <TaskList 
            tasks={tasks} 
            onEdit={handleEdit} 
            onDelete={deleteTask} 
            onToggleStatus={toggleTaskStatus}
          />
        )}
      </div>
    </div>
  );
}

export default App;
