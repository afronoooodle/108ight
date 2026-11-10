
/* ============================================================
   108IGHT — AUTHENTICATION + ROUTING
============================================================ */

(function () {

    const supabaseClient =
        window.__108IGHT_SUPABASE_CLIENT ||
        window.supabase.createClient(
            "https://zbgiyrqzrxqgasfkxdwr.supabase.co",
            "sb_publishable_hTPbRPuHXSc57Qpe5iU5tw_1bobphFu"
        );


    const overlay = document.getElementById("auth-overlay");
    const content = document.getElementById("auth-content");

    let currentRoute = window.__108IGHT_INITIAL_ROUTE || "/";


    // ========================================================
    // ROUTE HELPERS
    // ========================================================

    function updateTitle(route) {

        const titles = {
            "/": "108IGHT",
            "/login": "108IGHT — Login",
            "/signup": "108IGHT — Sign Up",
            "/forgot-password": "108IGHT — Reset Password",
            "/reset-password": "108IGHT — New Password",
            "/account": "108IGHT — Account"
        };

        document.title =
            titles[route] || "108IGHT";

    }


   
function navigate(route, addHistory = true) {

    const validRoutes = [
        "/",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/account"
    ];

    if (!validRoutes.includes(route)) {
        route = "/";
    }

    if (addHistory) {

        const basePath =
            window.__108IGHT_BASE_PATH || "";

        history.pushState(
            { route: route },
            "",
            basePath + (route === "/" ? "/" : route)
        );

    }

    currentRoute = route;

    updateTitle(route);

    renderRoute();

}



    window.navigate108ight = navigate;


    // ========================================================
    // MESSAGES
    // ========================================================

    function showMessage(message, success = false) {

        const messageBox =
            document.getElementById("auth-message");

        if (!messageBox) {
            return;
        }

        messageBox.textContent = message;

        messageBox.classList.add("show");

        messageBox.classList.toggle(
            "success",
            success
        );

    }


    // ========================================================
    // AUTHENTICATION FORM TEMPLATES
    // ========================================================

    function loginTemplate() {

        return `
            <h1 class="auth-title">Login</h1>

            <form id="login-form" class="auth-form">

                <label for="email">Email</label>

                <input
                    id="email"
                    type="email"
                    autocomplete="username"
                    required
                >

                <label for="password">Password</label>

                <input
                    id="password"
                    type="password"
                    autocomplete="current-password"
                    required
                >

                <button class="auth-button" type="submit">
                    Login
                </button>

            </form>

            <div id="auth-message" class="auth-message"></div>

            <div class="auth-links">

                <a href="/forgot-password" data-auth-route="/forgot-password">
                    Forgot your password?
                </a>

                <a href="/signup" data-auth-route="/signup">
                    Create an account
                </a>

                <a href="/" data-auth-route="/">
                    Back to 108ight
                </a>

            </div>
        `;

    }


    function signupTemplate() {

        return `
            <h1 class="auth-title">Create Account</h1>

            <form id="signup-form" class="auth-form">

                <label for="username">Username</label>

                <input
                    id="username"
                    type="text"
                    autocomplete="username"
                    required
                >

                <label for="email">Email</label>

                <input
                    id="email"
                    type="email"
                    autocomplete="email"
                    required
                >

                <label for="password">Password</label>

                <input
                    id="password"
                    type="password"
                    autocomplete="new-password"
                    required
                >

                <label for="password-confirm">Confirm Password</label>

                <input
                    id="password-confirm"
                    type="password"
                    autocomplete="new-password"
                    required
                >

                <button class="auth-button" type="submit">
                    Create Account
                </button>

            </form>

            <div id="auth-message" class="auth-message"></div>

            <div class="auth-links">

                <a href="/login" data-auth-route="/login">
                    Already have an account?
                </a>

                <a href="/" data-auth-route="/">
                    Back to 108ight
                </a>

            </div>
        `;

    }


    function forgotPasswordTemplate() {

        return `
            <h1 class="auth-title">Reset Password</h1>

            <p class="auth-description">
                Enter the email address connected to your account.
            </p>

            <form id="forgot-password-form" class="auth-form">

                <label for="email">Email</label>

                <input
                    id="email"
                    type="email"
                    autocomplete="email"
                    required
                >

                <button class="auth-button" type="submit">
                    Send Reset Email
                </button>

            </form>

            <div id="auth-message" class="auth-message"></div>

            <div class="auth-links">

                <a href="/login" data-auth-route="/login">
                    Back to Login
                </a>

                <a href="/" data-auth-route="/">
                    Back to 108ight
                </a>

            </div>
        `;

    }


    function resetPasswordTemplate() {

        return `
            <h1 class="auth-title">New Password</h1>

            <form id="reset-password-form" class="auth-form">

                <label for="password">New Password</label>

                <input
                    id="password"
                    type="password"
                    autocomplete="new-password"
                    required
                >

                <label for="password-confirm">Confirm New Password</label>

                <input
                    id="password-confirm"
                    type="password"
                    autocomplete="new-password"
                    required
                >

                <button class="auth-button" type="submit">
                    Change Password
                </button>

            </form>

            <div id="auth-message" class="auth-message"></div>

            <div class="auth-links">

                <a href="/login" data-auth-route="/login">
                    Back to Login
                </a>

            </div>
        `;

    }


    async function accountTemplate() {

        const {
            data,
            error
        } = await supabaseClient.auth.getUser();

        if (error || !data.user) {

            navigate("/login");

            return "";

        }

        const email = data.user.email || "";

        return `
            <h1 class="auth-title">My Account</h1>

            <p class="account-email">
                <strong>Email:</strong>
                <span>${escapeHTML(email)}</span>
            </p>

            <button
                id="logout-button"
                class="logout-button"
                type="button"
            >
                Log Out
            </button>

            <div id="auth-message" class="auth-message"></div>

            <div class="auth-links">

                <a href="/" data-auth-route="/">
                    Back to 108ight
                </a>

            </div>
        `;

    }


    function escapeHTML(value) {

        return String(value).replace(/[&<>"']/g, character => {

            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[character];

        });

    }


    // ========================================================
    // ROUTE RENDERING
    // ========================================================

    async function renderRoute() {

        const authRoutes = [
            "/login",
            "/signup",
            "/forgot-password",
            "/reset-password",
            "/account"
        ];

        const isAuthRoute =
            authRoutes.includes(currentRoute);

        if (!isAuthRoute) {

            overlay.classList.remove("active");

            overlay.setAttribute("aria-hidden", "true");

            if (window.set108ightAuthBarrel) {
                window.set108ightAuthBarrel(false);
            }

            content.innerHTML = "";

            return;

        }


        if (window.set108ightAuthBarrel) {
            window.set108ightAuthBarrel(true);
        }

        overlay.classList.add("active");

        overlay.setAttribute("aria-hidden", "false");


        switch (currentRoute) {

            case "/login":
                content.innerHTML = loginTemplate();
                break;

            case "/signup":
                content.innerHTML = signupTemplate();
                break;

            case "/forgot-password":
                content.innerHTML = forgotPasswordTemplate();
                break;

            case "/reset-password":
                content.innerHTML = resetPasswordTemplate();
                break;

            case "/account":
                content.innerHTML = await accountTemplate();
                break;

        }

    }


    // ========================================================
    // INTERNAL ROUTE LINKS
    // ========================================================

    document.addEventListener("click", event => {

        const link = event.target.closest("[data-auth-route]");

        if (!link) {
            return;
        }

        event.preventDefault();

        navigate(link.dataset.authRoute);

    });


    // ========================================================
    // FORM SUBMISSIONS
    // ========================================================

    document.addEventListener("submit", async event => {

        const form = event.target;

        event.preventDefault();


        // ====================================================
        // SIGN UP
        // ====================================================

        if (form.id === "signup-form") {

            const username =
                document.getElementById("username").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const password =
                document.getElementById("password").value;

            const passwordConfirm =
                document.getElementById("password-confirm").value;


            if (password !== passwordConfirm) {

                showMessage("Passwords do not match.");

                return;

            }

            if (password.length < 6) {

                showMessage("Password must be at least 6 characters.");

                return;

            }


            showMessage("Creating account...", true);

            const { error } =
                await supabaseClient.auth.signUp({

                    email,
                    password,

                    options: {

                        data: {
                            username
                        }

                    }

                });


            if (error) {

                showMessage(error.message);

                return;

            }


            showMessage(
                "Account created! Check your email to verify your account.",
                true
            );

            form.reset();

        }


        // ====================================================
        // LOGIN
        // ====================================================

        if (form.id === "login-form") {

            const email =
                document.getElementById("email").value.trim();

            const password =
                document.getElementById("password").value;


            showMessage("Logging in...", true);


            const { error } =
                await supabaseClient.auth.signInWithPassword({

                    email,
                    password

                });


            if (error) {

                showMessage(error.message);

                return;

            }


            navigate("/account");

        }


        // ====================================================
        // FORGOT PASSWORD
        // ====================================================

        if (form.id === "forgot-password-form") {

            const email =
                document.getElementById("email").value.trim();


            showMessage("Sending reset email...", true);


            const { error } =
                await supabaseClient.auth.resetPasswordForEmail(
                    email,
                    {
                        redirectTo:
    window.location.origin +
    (window.__108IGHT_BASE_PATH || "") +
    "/reset-password"
                    }
                );


            if (error) {

                showMessage(error.message);

                return;

            }


            showMessage(
                "Password reset email sent. Check your inbox.",
                true
            );

            form.reset();

        }


        // ====================================================
        // RESET PASSWORD
        // ====================================================

        if (form.id === "reset-password-form") {

            const password =
                document.getElementById("password").value;

            const passwordConfirm =
                document.getElementById("password-confirm").value;


            if (password !== passwordConfirm) {

                showMessage("Passwords do not match.");

                return;

            }

            if (password.length < 6) {

                showMessage("Password must be at least 6 characters.");

                return;

            }


            showMessage("Changing password...", true);


            const { error } =
                await supabaseClient.auth.updateUser({

                    password

                });


            if (error) {

                showMessage(error.message);

                return;

            }


            showMessage(
                "Password changed successfully!",
                true
            );


            setTimeout(() => {

                navigate("/login");

            }, 1500);

        }

    });


    // ========================================================
    // LOGOUT
    // ========================================================

    document.addEventListener("click", async event => {

        if (event.target.id !== "logout-button") {
            return;
        }

        const { error } =
            await supabaseClient.auth.signOut();

        if (error) {

            showMessage(error.message);

            return;

        }

        navigate("/login");

    });


    // ========================================================
    // BACK / FORWARD BUTTONS
    // ========================================================

    
window.addEventListener("popstate", () => {

    let path = window.location.pathname;

    const basePath =
        window.__108IGHT_BASE_PATH || "";

    if (basePath && path.startsWith(basePath)) {
        path = path.substring(basePath.length) || "/";
    }

    currentRoute = path.replace(/\/+$/, "") || "/";

    updateTitle(currentRoute);

    renderRoute();

});



    // ========================================================
    // INITIAL ROUTE
    // ========================================================

    updateTitle(currentRoute);

    renderRoute();


})();
