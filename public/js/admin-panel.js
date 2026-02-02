/**
 * Admin Panel JavaScript
 */

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;

    currentUser = getUser();
    if (currentUser.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    showSection('analytics');
});

function showSection(sectionName) {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.add('hidden');
    });

    const section = document.getElementById(sectionName);
    if (section) {
        section.classList.remove('hidden');
    }

    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    event?.target?.classList.add('active');

    switch (sectionName) {
        case 'analytics':
            loadAnalytics();
            break;
        case 'users':
            loadUsers();
            break;
        case 'jobs':
            loadJobs();
            break;
    }
}

async function loadAnalytics() {
    const container = document.getElementById('analyticsContent');
    
    try {
        const data = await apiCall('/admin/analytics');
        const analytics = data.data;

        let userStats = '';
        if (analytics.users) {
            analytics.users.forEach(stat => {
                userStats += `<div class="stat-item">
                    <div class="stat-number">${stat.total}</div>
                    <div class="stat-label">${stat.role.replace('_', ' ')}</div>
                </div>`;
            });
        }

        let jobStats = '';
        if (analytics.jobs) {
            analytics.jobs.forEach(stat => {
                jobStats += `<div class="stat-item">
                    <div class="stat-number">${stat.total}</div>
                    <div class="stat-label">${stat.status}</div>
                </div>`;
            });
        }

        container.innerHTML = `
            <div class="glass-card" style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1.5rem;">User Statistics</h3>
                <div class="stats">${userStats}</div>
            </div>
            <div class="glass-card" style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1.5rem;">Job Statistics</h3>
                <div class="stats">${jobStats}</div>
            </div>
            <div class="glass-card">
                <h3 style="margin-bottom: 1.5rem;">Application Statistics</h3>
                <div class="stats">
                    ${analytics.applications ? analytics.applications.map(stat => `
                        <div class="stat-item">
                            <div class="stat-number">${stat.total}</div>
                            <div class="stat-label">${stat.status}</div>
                        </div>
                    `).join('') : ''}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading analytics:', error);
        container.innerHTML = '<p style="color: var(--text-error);">Error loading analytics.</p>';
    }
}

async function loadUsers() {
    const container = document.getElementById('usersList');
    showLoading(container);

    try {
        const search = document.getElementById('userSearch')?.value || '';
        const role = document.getElementById('userRoleFilter')?.value || '';

        const params = new URLSearchParams({
            page: 1,
            limit: 20,
            ...(search && { search }),
            ...(role && { role })
        });

        const data = await apiCall(`/admin/users?${params}`);
        const users = data.data || [];

        if (users.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No users found.</p>';
            return;
        }

        container.innerHTML = '';
        users.forEach(user => {
            const card = createUserCard(user);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading users:', error);
        container.innerHTML = '<p style="color: var(--text-error);">Error loading users.</p>';
    }
}

function createUserCard(user) {
    const card = document.createElement('div');
    card.className = 'job-card';
    
    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
                <div class="job-title">${user.first_name} ${user.last_name}</div>
                <div class="job-company">${user.email}</div>
                <div style="margin-top: 0.5rem;">
                    <span class="skill-tag">${user.role.replace('_', ' ')}</span>
                    <span class="skill-tag" style="background: ${user.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${user.is_active ? '#22c55e' : '#ef4444'};">
                        ${user.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>
            <div>
                <button onclick="toggleUserStatus(${user.user_id}, ${user.is_active})" class="btn btn-secondary" style="margin-bottom: 0.5rem;">
                    ${user.is_active ? 'Deactivate' : 'Activate'}
                </button>
            </div>
        </div>
    `;

    return card;
}

async function toggleUserStatus(userId, currentStatus) {
    try {
        await apiCall(`/admin/users/${userId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ isActive: !currentStatus })
        });
        showAlert(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
        loadUsers();
    } catch (error) {
        showAlert('Error updating user status', 'error');
    }
}

async function loadJobs() {
    const container = document.getElementById('jobsList');
    showLoading(container);

    try {
        const status = document.getElementById('jobStatusFilter')?.value || '';

        const params = new URLSearchParams({
            page: 1,
            limit: 20,
            ...(status && { status })
        });

        const data = await apiCall(`/admin/jobs?${params}`);
        const jobs = data.data || [];

        if (jobs.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No jobs found.</p>';
            return;
        }

        container.innerHTML = '';
        jobs.forEach(job => {
            const card = createJobCard(job);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading jobs:', error);
        container.innerHTML = '<p style="color: var(--text-error);">Error loading jobs.</p>';
    }
}

function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    
    const statusColors = {
        'pending': '#fbbf24',
        'active': '#22c55e',
        'closed': '#94a3b8',
        'rejected': '#ef4444'
    };

    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
                <div class="job-title">${job.job_title}</div>
                <div class="job-company">${job.company_name || 'Company'} • Posted by ${job.first_name} ${job.last_name}</div>
                <div style="margin-top: 0.5rem;">
                    <span class="skill-tag" style="background: ${statusColors[job.status]}20; color: ${statusColors[job.status]};">
                        ${job.status}
                    </span>
                </div>
            </div>
            <div>
                ${job.status === 'pending' ? `
                    <button onclick="updateJobStatus(${job.job_id}, 'active')" class="btn btn-primary" style="margin-bottom: 0.5rem;">Approve</button>
                    <button onclick="updateJobStatus(${job.job_id}, 'rejected')" class="btn btn-secondary">Reject</button>
                ` : `
                    <select onchange="updateJobStatus(${job.job_id}, this.value)" class="btn btn-secondary" style="margin-bottom: 0.5rem;">
                        <option value="active" ${job.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="closed" ${job.status === 'closed' ? 'selected' : ''}>Closed</option>
                        <option value="rejected" ${job.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                `}
                <button onclick="deleteJob(${job.job_id})" class="btn btn-secondary" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: #ef4444;">Delete</button>
            </div>
        </div>
    `;

    return card;
}

async function updateJobStatus(jobId, status) {
    try {
        await apiCall(`/admin/jobs/${jobId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        showAlert('Job status updated successfully', 'success');
        loadJobs();
    } catch (error) {
        showAlert('Error updating job status', 'error');
    }
}

async function deleteJob(jobId) {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
        return;
    }

    try {
        await apiCall(`/admin/jobs/${jobId}`, { method: 'DELETE' });
        showAlert('Job deleted successfully', 'success');
        loadJobs();
    } catch (error) {
        showAlert('Error deleting job', 'error');
    }
}

function logout() {
    removeToken();
    removeUser();
    window.location.href = 'index.html';
}

