import { useState } from "react";
import axios from "axios";

function Login({ onBack, onSignup, onLogin }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");

    try {

      const response = await axios.post(
        "http://localhost:5000/login",
        {
          email,
          password
        }
      );

      setMessage("Login successful!");

      setTimeout(() => {
        onLogin(response.data.user);
      }, 500);

    } catch (error) {

      if (error.response) {
        setError(error.response.data.message);
      } else {
        setError("Cannot connect to server");
      }

    }
  };


  return (
    <div style={styles.page}>

      <div style={styles.card}>

        <h1 style={styles.logo}>
          LUSSO<span>.</span>
        </h1>

        <p style={styles.subtitle}>
          Welcome back
        </p>


        <form onSubmit={handleLogin}>

          <label style={styles.label}>
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />


          <label style={styles.label}>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />


          {error && (
            <p style={styles.error}>
              {error}
            </p>
          )}


          {message && (
            <p style={styles.success}>
              {message}
            </p>
          )}


          <button
            type="submit"
            style={styles.primaryButton}
          >
            Log in
          </button>

        </form>


        <div style={styles.divider}>
          Don't have an account?
        </div>


        <button
          onClick={onSignup}
          style={styles.signupButton}
        >
          Create an Account
        </button>


        <button
          onClick={onBack}
          style={styles.backButton}
        >
          ← Back to Home
        </button>

      </div>

    </div>
  );
}


const styles = {

  page: {
    minHeight: "100vh",
    background: "#fff7f8",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
    padding: "30px",
    boxSizing: "border-box"
  },

  card: {
    width: "420px",
    maxWidth: "100%",
    background: "#ffffff",
    padding: "45px 40px",
    borderRadius: "25px",
    boxShadow: "0 15px 45px rgba(0,0,0,0.08)",
    boxSizing: "border-box"
  },

  logo: {
    textAlign: "center",
    fontSize: "32px",
    letterSpacing: "3px",
    margin: "0"
  },

  subtitle: {
    textAlign: "center",
    color: "#777",
    marginBottom: "35px"
  },

  label: {
    display: "block",
    marginBottom: "7px",
    color: "#333",
    fontSize: "14px"
  },

  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    fontSize: "15px",
    boxSizing: "border-box"
  },

  primaryButton: {
    width: "100%",
    padding: "15px",
    background: "#d96c7b",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer"
  },

  signupButton: {
    width: "100%",
    padding: "14px",
    background: "#fce3e7",
    color: "#c75b6b",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer"
  },

  backButton: {
    width: "100%",
    marginTop: "15px",
    padding: "10px",
    background: "transparent",
    border: "none",
    color: "#777",
    cursor: "pointer"
  },

  divider: {
    textAlign: "center",
    color: "#888",
    fontSize: "14px",
    marginTop: "25px",
    marginBottom: "12px"
  },

  error: {
    color: "#c0392b",
    background: "#fdecea",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "14px"
  },

  success: {
    color: "#218c5a",
    background: "#eaf8f0",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "14px"
  }

};

export default Login;