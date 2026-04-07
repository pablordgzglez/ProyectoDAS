const loginForm = document.getElementById("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(loginForm);
        const username = formData.get("username");
        const password = formData.get("password");
        const message = document.getElementById("login-message");

        message.textContent = "";
        message.style.color = "red";

        try {
            const response = await fetch("http://127.0.0.1:8000/api/auth/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                message.textContent = "Usuario o contraseña incorrectos.";
                message.style.color = "red";
                return;
            }

            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);
            localStorage.setItem("username", username);

            message.textContent = "Login correcto.";
            message.style.color = "green";
        } catch (error) {
            message.textContent = "Error al conectar con el servidor.";
            message.style.color = "red";
        }
    });
}

const registerForm = document.getElementById("register-form");

if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(registerForm);
        const username = formData.get("username");
        const email = formData.get("email");
        const password1 = formData.get("password1");
        const password2 = formData.get("password2");
        const message = document.getElementById("register-message");

        message.textContent = "";
        message.style.color = "red";

        if (password1 !== password2) {
            message.textContent = "Las contraseñas no coinciden.";
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/users/register/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password1: password1,
                    password2: password2
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.username) {
                    message.textContent = data.username[0];
                } else if (data.email) {
                    message.textContent = data.email[0];
                } else if (data.password1) {
                    message.textContent = data.password1[0];
                } else if (data.password2) {
                    message.textContent = data.password2[0];
                } else {
                    message.textContent = "Error en el registro.";
                }
                return;
            }

            message.textContent = "Usuario creado correctamente.";
            message.style.color = "green";
            registerForm.reset();

        } catch (error) {
            message.textContent = "Error al conectar con el servidor.";
            message.style.color = "red";
        }
    });
}