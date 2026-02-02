/**
 * Register Page JavaScript
 * Handles user registration with validation
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordStrengthDiv = document.getElementById('passwordStrength');
    const passwordMatchDiv = document.getElementById('passwordMatch');

    // Check URL for role parameter
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    if (roleParam) {
        const roleRadio = document.querySelector(`input[value="${roleParam}"]`);
        if (roleRadio) roleRadio.checked = true;
    }

    // Password strength checker
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        if (password.length > 0) {
            const { strength, feedback } = checkPasswordStrength(password);
            const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
            const strengthColors = ['#ef4444', '#f97316', '#fbbf24', '#22c55e', '#16a34a'];
            
            passwordStrengthDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="flex: 1; height: 4px; background: var(--border-color); border-radius: 2px; overflow: hidden;">
                        <div style="height: 100%; width: ${(strength / 5) * 100}%; background: ${strengthColors[strength - 1] || strengthColors[0]}; transition: all 0.3s;"></div>
                    </div>
                    <span style="color: ${strengthColors[strength - 1] || strengthColors[0]}; font-weight: 600;">
                        ${strengthLabels[strength - 1] || 'Very Weak'}
                    </span>
                </div>
                ${feedback.length > 0 ? `<div style="margin-top: 0.5rem; color: var(--text-secondary); font-size: 0.75rem;">Missing: ${feedback.join(', ')}</div>` : ''}
            `;
        } else {
            passwordStrengthDiv.innerHTML = '';
        }
    });

    // Password match checker
    confirmPasswordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword.length > 0) {
            if (password === confirmPassword) {
                passwordMatchDiv.innerHTML = '<span style="color: #22c55e;">✓ Passwords match</span>';
            } else {
                passwordMatchDiv.innerHTML = '<span style="color: #ef4444;">✗ Passwords do not match</span>';
            }
        } else {
            passwordMatchDiv.innerHTML = '';
        }
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            phone: formData.get('phone') || null
        };

        // Validation
        if (data.password !== formData.get('confirmPassword')) {
            showAlert('Passwords do not match', 'error');
            return;
        }

        const { strength } = checkPasswordStrength(data.password);
        if (strength < 3) {
            showAlert('Password is too weak. Please use a stronger password.', 'error');
            return;
        }

        try {
            const result = await apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (result.success) {
                // Store token and user data
                setToken(result.data.token);
                setUser(result.data);

                showAlert('Registration successful! Redirecting...', 'success');
                
                // Redirect based on role
                setTimeout(() => {
                    redirectByRole();
                }, 1500);
            }
        } catch (error) {
            showAlert(error.message || 'Registration failed. Please try again.', 'error');
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

