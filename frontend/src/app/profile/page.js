"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import {
  getProfile,
  getUsage,
  logoutUser,
  updatePassword,
  updateProfile,
} from "../../services/profile";
import styles from "./profile.module.css";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileScreen />
    </ProtectedRoute>
  );
}

function ProfileScreen() {
  const router = useRouter();
  const { accessToken, refreshToken, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [usage, setUsage] = useState(null);
  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password1: "",
    password2: "",
  });
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    loadProfileData();
  }, [accessToken]);

  async function loadProfileData() {
    setLoading(true);
    setPageError("");

    try {
      const [profileData, usageData] = await Promise.all([
        getProfile(accessToken),
        getUsage(accessToken),
      ]);

      const usageInfo = Array.isArray(usageData) ? usageData[0] : usageData.results?.[0];

      setProfile(profileData);
      setUsage(usageInfo || null);
      setProfileForm({
        username: profileData.username || "",
        email: profileData.email || "",
      });
    } catch (error) {
      setPageError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleProfileChange(event) {
    const { name, value } = event.target;
    setProfileForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handlePasswordChange(event) {
    const { name, value } = event.target;
    setPasswordForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!profileForm.username) {
      setProfileError("Debes completar el nombre de usuario.");
      return;
    }

    setProfileSaving(true);

    try {
      const updatedProfile = await updateProfile(
        {
          username: profileForm.username,
          email: profileForm.email,
        },
        accessToken
      );

      setProfile(updatedProfile);
      setProfileForm({
        username: updatedProfile.username || "",
        email: updatedProfile.email || "",
      });
      setProfileSuccess("Perfil actualizado correctamente.");
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    const { current_password, password1, password2 } = passwordForm;

    if (!current_password || !password1 || !password2) {
      setPasswordError("Debes completar todos los campos.");
      return;
    }

    if (password1 !== password2) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    setPasswordSaving(true);

    try {
      await updatePassword(passwordForm, accessToken);
      setPasswordForm({
        current_password: "",
        password1: "",
        password2: "",
      });
      setPasswordSuccess("Contraseña actualizada correctamente.");
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);

    try {
      if (refreshToken) {
        await logoutUser(refreshToken, accessToken);
      }
    } catch (error) {
      // Si falla el logout remoto, cerramos la sesion igualmente en local.
    } finally {
      logout();
      router.push("/login");
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("es-ES");
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Profile</h1>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? "Cerrando sesion..." : "Logout"}
        </button>
      </div>

      {loading ? (
        <div className={styles.stateBox}>
          <p>Cargando perfil...</p>
        </div>
      ) : null}

      {!loading && pageError ? (
        <div className={styles.errorBox}>
          <p>{pageError}</p>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={loadProfileData}
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {!loading && !pageError ? (
        <div className={styles.grid}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Datos del usuario</h2>
            <p className={styles.cardText}>
              Puedes revisar tus datos basicos y cambiar el nombre de usuario.
            </p>

            <form className={styles.form} onSubmit={handleProfileSubmit}>
              <label className={styles.field}>
                <span className={styles.label}>Nombre de usuario</span>
                <input
                  className={styles.input}
                  type="text"
                  name="username"
                  value={profileForm.username}
                  onChange={handleProfileChange}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Email</span>
                <input
                  className={styles.input}
                  type="email"
                  name="email"
                  value={profileForm.email}
                  disabled
                  readOnly
                />
              </label>

              {profileError ? <p className={styles.error}>{profileError}</p> : null}
              {profileSuccess ? <p className={styles.success}>{profileSuccess}</p> : null}

              <button
                className={styles.primaryButton}
                type="submit"
                disabled={profileSaving}
              >
                {profileSaving ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Uso disponible</h2>
            <p className={styles.cardText}>
              Aqui puedes consultar cuantos mensajes has usado y cuantos te quedan.
            </p>

            <div className={styles.usageList}>
              <div className={styles.usageItem}>
                <span className={styles.label}>Usuario</span>
                <span className={styles.value}>{profile?.username || "-"}</span>
              </div>
              <div className={styles.usageItem}>
                <span className={styles.label}>Mensajes usados</span>
                <span className={styles.value}>{usage?.messages_used ?? "-"}</span>
              </div>
              <div className={styles.usageItem}>
                <span className={styles.label}>Limite de mensajes</span>
                <span className={styles.value}>{usage?.messages_limit ?? "-"}</span>
              </div>
              <div className={styles.usageItem}>
                <span className={styles.label}>Fecha de reinicio</span>
                <span className={styles.value}>
                  {usage?.reset_date ? formatDate(usage.reset_date) : "-"}
                </span>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Cambiar contraseña</h2>
            <p className={styles.cardText}>
              Introduce tu contraseña actual y la nueva contraseña.
            </p>

            <form className={styles.form} onSubmit={handlePasswordSubmit}>
              <label className={styles.field}>
                <span className={styles.label}>Contraseña actual</span>
                <input
                  className={styles.input}
                  type="password"
                  name="current_password"
                  value={passwordForm.current_password}
                  onChange={handlePasswordChange}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Nueva contraseña</span>
                <input
                  className={styles.input}
                  type="password"
                  name="password1"
                  value={passwordForm.password1}
                  onChange={handlePasswordChange}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Repetir nueva contraseña</span>
                <input
                  className={styles.input}
                  type="password"
                  name="password2"
                  value={passwordForm.password2}
                  onChange={handlePasswordChange}
                />
              </label>

              {passwordError ? <p className={styles.error}>{passwordError}</p> : null}
              {passwordSuccess ? <p className={styles.success}>{passwordSuccess}</p> : null}

              <button
                className={styles.primaryButton}
                type="submit"
                disabled={passwordSaving}
              >
                {passwordSaving ? "Actualizando..." : "Cambiar contraseña"}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </section>
  );
}
