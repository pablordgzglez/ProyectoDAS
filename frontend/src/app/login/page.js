"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../auth.module.css";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!formData.username || !formData.password) {
      setError("Debes completar usuario y contraseña.");
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser(formData);

      login(data);
      router.push("/chat");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Login</h1>
        <p className={styles.text}>
          Accede con tu nombre de usuario y tu contraseña.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Usuario</span>
            <input
              className={styles.input}
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </label>

          <label className={styles.field}>
            <span>Contraseña</span>
            <input
              className={styles.input}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </section>
  );
}
