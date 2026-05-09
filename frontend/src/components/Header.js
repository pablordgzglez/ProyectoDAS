import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/">
          DAS Frontend
        </Link>
        <nav className={styles.nav}>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
          <Link href="/chat">Chat</Link>
          <Link href="/profile">Profile</Link>
        </nav>
      </div>
    </header>
  );
}
