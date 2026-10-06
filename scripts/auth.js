const SUPABASE_URL =
    "https://zbgiyrqzrxqgasfkxdwr.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_hTPbRPuHXSc57Qpe5iU5tw_1bobphFu";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

/* =========================================================
   SIGN UP
   ========================================================= */

const signupForm =
    document.getElementById("signup-form");


if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const username =
                document
                    .getElementById("username")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            const passwordConfirm =
                document
                    .getElementById("password-confirm")
                    .value;


            if (password !== passwordConfirm) {

                showMessage(
                    "Passwords do not match."
                );

                return;
            }


            if (password.length < 6) {

                showMessage(
                    "Password must be at least 6 characters."
                );

                return;
            }


            const {
                data,
                error
            } =
                await supabaseClient.auth.signUp({

                    email: email,

                    password: password,

                    options: {

                        data: {
                            username: username
                        }

                    }

                });


            if (error) {

                console.error(
                    "Supabase error:",
                    error
                );

                showMessage(
                    error.message
                );

                return;
            }


            console.log(
                "Account created:",
                data
            );


            showMessage(
                "Account created! Check your email to verify your account.",
                true
            );


            signupForm.reset();

        }
    );

}


/* =========================================================
   LOGIN
   ========================================================= */

const loginForm =
    document.getElementById("login-form");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            showMessage(
                "Logging in...",
                true
            );


            const {
                data,
                error
            } =
                await supabaseClient.auth.signInWithPassword({

                    email: email,

                    password: password

                });


            if (error) {

                console.error(
                    "Login error:",
                    error
                );

                showMessage(
                    error.message
                );

                return;
            }


            console.log(
                "Logged in:",
                data
            );


            window.location.href =
                "account.html";

        }
    );

}


/* =========================================================
   ACCOUNT PAGE
   ========================================================= */

async function loadAccountPage() {

    const accountEmail =
        document.getElementById(
            "account-email"
        );


    if (!accountEmail) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();


    if (error || !data.user) {

        window.location.href =
            "login.html";

        return;
    }


    accountEmail.textContent =
        data.user.email;

}

/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

const forgotPasswordForm =
    document.getElementById(
        "forgot-password-form"
    );


if (forgotPasswordForm) {

    forgotPasswordForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const {
                error
            } =
                await supabaseClient.auth.resetPasswordForEmail(
                    email,
                    {
                        redirectTo:
                            window.location.origin +
                            "/reset-password.html"
                    }
                );


            if (error) {

                console.error(
                    "Password reset error:",
                    error
                );

                showMessage(
                    error.message
                );

                return;
            }


            showMessage(
                "Password reset email sent. Check your inbox.",
                true
            );


            forgotPasswordForm.reset();

        }
    );

}

/* =========================================================
   RESET PASSWORD
   ========================================================= */

const resetPasswordForm =
    document.getElementById(
        "reset-password-form"
    );


if (resetPasswordForm) {

    resetPasswordForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const password =
                document
                    .getElementById("password")
                    .value;


            const passwordConfirm =
                document
                    .getElementById("password-confirm")
                    .value;


            if (password !== passwordConfirm) {

                showMessage(
                    "Passwords do not match."
                );

                return;
            }


            if (password.length < 6) {

                showMessage(
                    "Password must be at least 6 characters."
                );

                return;
            }


            const {
                error
            } =
                await supabaseClient.auth.updateUser({

                    password: password

                });


            if (error) {

                console.error(
                    "Password update error:",
                    error
                );

                showMessage(
                    error.message
                );

                return;
            }


            showMessage(
                "Password changed successfully!",
                true
            );


            setTimeout(
                function() {

                    window.location.href =
                        "login.html";

                },
                1500
            );

        }
    );

}

/* =========================================================
   LOGOUT
   ========================================================= */

const logoutButton =
    document.getElementById(
        "logout-button"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function() {

            const {
                error
            } =
                await supabaseClient.auth.signOut();


            if (error) {

                console.error(
                    "Logout error:",
                    error
                );

                showMessage(
                    error.message
                );

                return;
            }


            window.location.href =
                "login.html";

        }
    );

}


/* =========================================================
   RUN ACCOUNT PAGE
   ========================================================= */

loadAccountPage();


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(
    message,
    success = false
) {

    const messageBox =
        document.getElementById(
            "auth-message"
        );


    if (!messageBox) {
        return;
    }


    messageBox.textContent =
        message;


    messageBox.classList.add(
        "show"
    );


    if (success) {

        messageBox.classList.add(
            "success"
        );

    } else {

        messageBox.classList.remove(
            "success"
        );

    }

}