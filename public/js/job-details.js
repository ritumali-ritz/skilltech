/**
 * Job Details Page JavaScript
 */

let currentJob = null;
let hasApplied = false;
let isSaved = false;

document.addEventListener('DOMContentLoaded', async () => {
    // Update nav based on auth
    if (isAuthenticated()) {
        const loginLink = document.getElementById('loginLink');
        const logoutLink = document.getElementById('logoutLink');
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'inline';
    }

    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('id');

    if (!jobId) {
        window.location.href = 'browse-jobs.html';
        return;
    }

    await loadJobDetails(jobId);
    
    if (isAuthenticated()) {
        await checkApplicationStatus(jobId);
        await checkSavedStatus(jobId);
    }
});

async function loadJobDetails(jobId) {
    const container = document.getElementById('jobDetails');
    
    try {
        const data = await apiCall(`/jobs/${jobId}`);
        currentJob = data.data;

        const skills = currentJob.skills || [];
        const skillsHTML = skills.map(skill => 
            `<span class="skill-tag">${skill.skill_name}</span>`
        ).join('');

        container.innerHTML = `
            <div class="glass-card" style="margin-bottom: 2rem;">
                <h1 style="margin-bottom: 1rem;">${currentJob.job_title}</h1>
                <div class="job-company" style="font-size: 1.1rem; margin-bottom: 1rem;">
                    ${currentJob.company_name || 'Company'}
                </div>
                <div class="job-meta" style="margin-bottom: 1.5rem;">
                    <span>📍 ${currentJob.location || 'Remote'}</span>
                    <span>💼 ${currentJob.job_type.replace('_', ' ')}</span>
                    ${currentJob.salary_min ? `<span>💰 ${formatCurrency(currentJob.salary_min)}${currentJob.salary_max ? ' - ' + formatCurrency(currentJob.salary_max) : '+'}</span>` : ''}
                    <span>📅 Posted: ${formatDate(currentJob.posted_at)}</span>
                </div>
                <div style="margin-top: 1.5rem;">
                    ${isAuthenticated() ? `
                        ${getUser().role === 'job_seeker' ? `
                            ${hasApplied ? 
                                '<button class="btn btn-secondary" disabled>Already Applied</button>' :
                                '<button onclick="applyForJob()" class="btn btn-primary">Apply Now</button>'
                            }
                            <button onclick="toggleSaveJob()" class="btn btn-secondary" style="margin-left: 1rem;">
                                ${isSaved ? 'Unsave Job' : 'Save Job'}
                            </button>
                        ` : ''}
                    ` : `
                        <a href="login.html" class="btn btn-primary">Login to Apply</a>
                    `}
                </div>
            </div>

            <div class="glass-card" style="margin-bottom: 2rem;">
                <h2 style="margin-bottom: 1rem;">Job Description</h2>
                <div style="white-space: pre-wrap; line-height: 1.8;">${currentJob.job_description}</div>
            </div>

            <div class="glass-card" style="margin-bottom: 2rem;">
                <h2 style="margin-bottom: 1rem;">Required Skills</h2>
                <div class="job-skills">${skillsHTML || '<p style="color: var(--text-secondary);">No specific skills listed.</p>'}</div>
            </div>

            <div class="glass-card">
                <h2 style="margin-bottom: 1rem;">Requirements</h2>
                <ul style="list-style: none; padding: 0;">
                    ${currentJob.experience_required ? `<li style="margin-bottom: 0.5rem;">📊 Experience: ${currentJob.experience_required} years</li>` : ''}
                    ${currentJob.education_required ? `<li style="margin-bottom: 0.5rem;">🎓 Education: ${currentJob.education_required}</li>` : ''}
                </ul>
            </div>

            ${currentJob.company_name ? `
                <div class="glass-card" style="margin-top: 2rem;">
                    <h2 style="margin-bottom: 1rem;">About ${currentJob.company_name}</h2>
                    ${currentJob.company_description ? `<p>${currentJob.company_description}</p>` : '<p style="color: var(--text-secondary);">No company description available.</p>'}
                </div>
            ` : ''}
        `;
    } catch (error) {
        console.error('Error loading job details:', error);
        container.innerHTML = '<p style="color: var(--text-error);">Error loading job details. Please try again.</p>';
    }
}

async function checkApplicationStatus(jobId) {
    if (getUser().role !== 'job_seeker') return;

    try {
        const data = await apiCall('/applications/my-applications');
        const applications = data.data || [];
        hasApplied = applications.some(app => app.job_id === parseInt(jobId));
    } catch (error) {
        console.error('Error checking application status:', error);
    }
}

async function checkSavedStatus(jobId) {
    if (getUser().role !== 'job_seeker') return;

    try {
        const data = await apiCall('/users/saved-jobs');
        const savedJobs = data.data || [];
        isSaved = savedJobs.some(job => job.job_id === parseInt(jobId));
    } catch (error) {
        console.error('Error checking saved status:', error);
    }
}

async function applyForJob() {
    if (!isAuthenticated() || getUser().role !== 'job_seeker') {
        window.location.href = 'login.html';
        return;
    }

    const coverLetter = prompt('Enter a cover letter (optional):');
    
    try {
        const result = await apiCall('/applications', {
            method: 'POST',
            body: JSON.stringify({
                jobId: currentJob.job_id,
                coverLetter: coverLetter || null
            })
        });

        if (result.success) {
            showAlert('Application submitted successfully!', 'success');
            hasApplied = true;
            loadJobDetails(currentJob.job_id);
        }
    } catch (error) {
        showAlert(error.message || 'Error submitting application', 'error');
    }
}

async function toggleSaveJob() {
    if (!isAuthenticated() || getUser().role !== 'job_seeker') return;

    try {
        if (isSaved) {
            await apiCall(`/users/saved-jobs/${currentJob.job_id}`, { method: 'DELETE' });
            isSaved = false;
            showAlert('Job removed from saved list', 'success');
        } else {
            await apiCall('/users/saved-jobs', {
                method: 'POST',
                body: JSON.stringify({ jobId: currentJob.job_id })
            });
            isSaved = true;
            showAlert('Job saved successfully', 'success');
        }
        loadJobDetails(currentJob.job_id);
    } catch (error) {
        showAlert('Error updating saved jobs', 'error');
    }
}

function logout() {
    removeToken();
    removeUser();
    window.location.href = 'index.html';
}

