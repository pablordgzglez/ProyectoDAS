"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../auth.module.css";
import { registerUser } from "../../services/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password1: "",
    password2: "",
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

    const { username, email, password1, password2 } = formData;

    if (!username || !email || !password1 || !password2) {
      setError("Debes completar todos los campos.");
      return;
    }

    if (password1 !== password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      await registerUser(formData);
      router.push("/login");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Register</h1>
        <p className={styles.text}>
          Crea tu cuenta para acceder a la plataforma.
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
            <span>Email</span>
            <input
              className={styles.input}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </label>

          <label className={styles.field}>
            <span>Contraseña</span>
            <input
              className={styles.input}
              type="password"
              name="password1"
              value={formData.password1}
              onChange={handleChange}
            />
          </label>

          <label className={styles.field}>
            <span>Repetir contraseña</span>
            <input
              className={styles.input}
              type="password"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>
      </div>
    </section>
  );
}
