import Link from "next/link";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <section className={styles.home}>
      <h1 className={styles.title}>Practica 3 - Frontend NextJS</h1>
      <p className={styles.text}>
        Esta es la base inicial del frontend. Desde aqui podemos acceder a las
        pantallas de autenticacion.
      </p>
      <div className={styles.links}>
        <Link className={styles.link} href="/login">
          Ir a login
        </Link>
        <Link className={styles.link} href="/register">
          Ir a register
        </Link>
      </div>
    </section>
  );
}
