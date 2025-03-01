import React, { useState, useEffect, useCallback } from "react";
import './style.css';


function App() {
  const [expenses, setExpenses] = useState([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [comments, setComments] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const fetchExpenses = useCallback(async () => {
    const res = await fetch("http://localhost:5000/expenses", {
      headers: { Authorization: token },
    });
    const data = await res.json();
    setExpenses(data);
  }, [token]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `http://localhost:5000/expenses/${editingId}` : "http://localhost:5000/expenses";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ category, amount, comments }),
    });

    setCategory("");
    setAmount("");
    setComments("");
    setEditingId(null);
    fetchExpenses();
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/expenses/${id}`, {
      method: "DELETE",
      headers: { Authorization: token },
    });
    fetchExpenses();
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const url = isSignup ? "http://localhost:5000/signup" : "http://localhost:5000/login";

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
    }
  };

  return token ? (
    <div>
      <h1>Expense Tracker</h1>
      <button onClick={() => { localStorage.removeItem("token"); setToken(null); }}>Logout</button>
      <form onSubmit={handleSubmit}>
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" required />
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" required />
        <input type="text" value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Comments (optional)" />
        <button type="submit">{editingId ? "Update" : "Add"} Expense</button>
      </form>

      <table border="1">
        <thead>
          <tr><th>Category</th><th>Amount</th><th>Created At</th><th>Comments</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {expenses.map(expense => (
            <tr key={expense.id}>
              <td>{expense.category}</td>
              <td>{expense.amount}</td>
              <td>{new Date(expense.created_at).toLocaleString()}</td>
              <td>{expense.comments}</td>
              <td><button onClick={() => setEditingId(expense.id)}>Edit</button> <button onClick={() => handleDelete(expense.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <form onSubmit={handleAuth}>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit">{isSignup ? "Sign Up" : "Login"}</button>
      <p onClick={() => setIsSignup(!isSignup)}>{isSignup ? "Already have an account? Login" : "Don't have an account? Sign up"}</p>
    </form>
  );
}

export default App;
