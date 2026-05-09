import Footer from "./Footer";
import Header from "./Header";
import styles from "./Layout.module.css";

export default function AppLayout({ children }) {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.content}>{children}</main>
      <Footer />
    </div>
  );
}
