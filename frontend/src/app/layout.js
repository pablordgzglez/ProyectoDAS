import AppLayout from "../components/Layout";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "Practica 3 DAS",
  description: "Frontend base en NextJS para la practica 3",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
