import { useState } from "react";
import axios from "axios";

function Signup({ onBack, onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("BUYER");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/signup",
        {
          name: name,
          email: email,
          phone: phone,
          password: password,
          role: role
        }
      );

      console.log("Signup response:", response.data);

      setMessage("Account created successfully!");

      setTimeout(() => {
        onLogin(response.data.user);
      }, 1000);

    } catch (error) {
      console.error("Signup error:", error);

      if (error.response) {
        setError(
          error.response.data.message ||
          "Could not create account"
        );
      } else {
        setError(
          "Cannot connect to the backend. Make sure server.js is running."
        );
      }
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>

      <div style={styles.card}>

        <h1 style={styles.logo}>
          LUSSO<span>.</span>
        </h1>

        <p style={styles.subtitle}>
          Create your account
        </p>

        <form onSubmit={handleSignup}>

          <label style={styles.label}>
            Full Name
          </label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={styles.input}
          />


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
            Phone
          </label>

          <input
            type="tel"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={styles.input}
          />


          <label style={styles.label}>
            Password
          </label>

          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={styles.input}
          />


          <label style={styles.label}>
            I want to
          </label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={styles.input}
          >
            <option value="BUYER">
              Buy & Bid
            </option>

            <option value="SELLER">
              Sell Items
            </option>
          </select>


          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}


          {message && (
            <div style={styles.success}>
              {message}
            </div>
          )}


          <button
            type="submit"
            disabled={loading}
            style={styles.primaryButton}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>


        <p style={styles.bottomText}>
          Already have an account?
        </p>

        <button
          type="button"
          onClick={onBack}
          style={styles.secondaryButton}
        >
          ← Back to Login
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
    padding: "30px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box"
  },

  card: {
    width: "420px",
    maxWidth: "100%",
    background: "#ffffff",
    padding: "40px",
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
    marginBottom: "30px"
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
    marginBottom: "18px",
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
    cursor: "pointer",
    marginTop: "5px"
  },

  secondaryButton: {
    width: "100%",
    padding: "12px",
    background: "transparent",
    border: "none",
    color: "#d96c7b",
    cursor: "pointer",
    fontSize: "14px"
  },

  bottomText: {
    textAlign: "center",
    color: "#777",
    marginTop: "25px",
    marginBottom: "5px"
  },

  error: {
    color: "#c0392b",
    background: "#fdecea",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "15px"
  },

  success: {
    color: "#218c5a",
    background: "#eaf8f0",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "15px"
  }
};

export default Signup;