/**
 * Login Page JavaScript
 * Handles user authentication
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');

    // Check if already logged in
    if (isAuthenticated()) {
        redirectByRole();
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            const result = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (result.success) {
                // Store token and user data
                setToken(result.data.token);
                setUser(result.data);

                showAlert('Login successful! Redirecting...', 'success');
                
                // Redirect based on role
                setTimeout(() => {
                    redirectByRole();
                }, 1000);
            }
        } catch (error) {
            showAlert(error.message || 'Login failed. Please check your credentials.', 'error');
        }
    });
});

function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);
}

