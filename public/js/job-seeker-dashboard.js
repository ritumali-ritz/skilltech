/**
 * Job Seeker Dashboard JavaScript
 */

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;

    currentUser = getUser();
    if (currentUser.role !== 'job_seeker') {
        window.location.href = 'index.html';
        return;
    }

    // Load initial section
    showSection('recommendations');
});

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Show selected section
    const section = document.getElementById(sectionName);
    if (section) {
        section.classList.remove('hidden');
    }

    // Update active menu item
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    event?.target?.classList.add('active');

    // Load section data
    switch (sectionName) {
        case 'recommendations':
            loadRecommendations();
            break;
        case 'applications':
            loadApplications();
            break;
        case 'saved':
            loadSavedJobs();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

// Load recommended jobs
async function loadRecommendations() {
    const container = document.getElementById('recommendationsList');
    
    try {
        const data = await apiCall(`/jobs/recommended/${currentUser.userId}`);
        const jobs = data.data || [];

        if (jobs.length === 0) {
            container.innerHTML = `
                <div class="glass-card">
                    <p style="text-align: center; color: var(--text-secondary);">
                        No recommendations available. Add skills to your profile to get personalized job recommendations!
                    </p>
                    <div style="text-align: center; margin-top: 1rem;">
                        <a href="#" onclick="showSection('profile'); return false;" class="btn btn-primary">Update Profile</a>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        jobs.forEach(job => {
            const card = createJobCardWithMatch(job);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading recommendations:', error);
        container.innerHTML = '<p style="color: var(--text-error);">Error loading recommendations. Please try again.</p>';
    }
}

function createJobCardWithMatch(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    
    const matchScore = job.matchScore || 0;
    const matchClass = matchScore >= 70 ? 'high' : matchScore >= 40 ? 'medium' : 'low';
    
    const skills = job.skills || [];
    const skillsHTML = skills.slice(0, 5).map(skill => 
        `<span class="skill-tag">${skill.skill_name}</span>`
    ).join('');

    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
            <div>
                <div class="job-title">${job.job_title}</div>
                <div class="job-company">${job.company_name || 'Company'}</div>
            </div>
            <span class="match-badge ${matchClass}">${matchScore}% Match</span>
        </div>
        <div class="job-meta">
            <span>📍 ${job.location || 'Remote'}</span>
            <span>💼 ${job.job_type.replace('_', ' ')}</span>
            ${job.salary_min ? `<span>💰 ${formatCurrency(job.salary_min)}${job.salary_max ? ' - ' + formatCurrency(job.salary_max) : '+'}</span>` : ''}
        </div>
        <div class="job-skills">${skillsHTML}</div>
        <div style="margin-top: 1rem;">
            <a href="/job-details.html?id=${job.job_id}" class="btn btn-primary">View Details</a>
        </div>
    `;

    return card;
}

// Load applications
async function loadApplications() {
    const container = document.getElementById('applicationsList');
    
    try {
        const data = await apiCall('/applications/my-applications');
        const applications = data.data || [];

        if (applications.length === 0) {
            container.innerHTML = `
                <div class="glass-card">
                    <p style="text-align: center; color: var(--text-secondary);">
                        You haven't applied to any jobs yet. Start browsing jobs to apply!
                    </p>
                    <div style="text-align: center; margin-top: 1rem;">
                        <a href="browse-jobs.html" class="btn btn-primary">Browse Jobs</a>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        applications.forEach(app => {
            const card = createApplicationCard(app);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading applications:', error);
        container.innerHTML = '<p style="color: var(--text-error);">Error loading applications.</p>';
    }
}

function createApplicationCard(application) {
    const card = document.createElement('div');
    card.className = 'job-card';
    
    const statusColors = {
        'pending': '#fbbf24',
        'reviewing': '#3b82f6',
        'accepted': '#22c55e',
        'rejected': '#ef4444',
        'withdrawn': '#94a3b8'
    };

    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
                <div class="job-title">${application.job_title}</div>
                <div class="job-company">${application.company_name || 'Company'}</div>
            </div>
            <span style="padding: 0.5rem 1rem; border-radius: 2rem; font-weight: 600; font-size: 0.875rem; background: ${statusColors[application.status]}20; color: ${statusColors[application.status]};">
                ${application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </span>
        </div>
        <div class="job-meta" style="margin-top: 1rem;">
            <span>📍 ${application.location || 'Remote'}</span>
            <span>💼 ${application.job_type.replace('_', ' ')}</span>
            <span>📅 Applied: ${formatDate(application.applied_at)}</span>
        </div>
        <div style="margin-top: 1rem;">
            <a href="job-details.html?id=${application.job_id}" class="btn btn-secondary">View Job</a>
        </div>
    `;

    return card;
}

// Load saved jobs
async function loadSavedJobs() {
    const container = document.getElementById('savedJobsList');
    
    try {
        const data = await apiCall('/users/saved-jobs');
        const jobs = data.data || [];

        if (jobs.length === 0) {
            container.innerHTML = `
                <div class="glass-card">
                    <p style="text-align: center; color: var(--text-secondary);">
                        You haven't saved any jobs yet. Start browsing and save jobs you're interested in!
                    </p>
                    <div style="text-align: center; margin-top: 1rem;">
                        <a href="browse-jobs.html" class="btn btn-primary">Browse Jobs</a>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        jobs.forEach(job => {
            const card = createSavedJobCard(job);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading saved jobs:', error);
        container.innerHTML = '<p style="color: var(--text-error);">Error loading saved jobs.</p>';
    }
}

function createSavedJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    
    const skills = job.skills || [];
    const skillsHTML = skills.slice(0, 5).map(skill => 
        `<span class="skill-tag">${skill.skill_name}</span>`
    ).join('');

    card.innerHTML = `
        <div class="job-title">${job.job_title}</div>
        <div class="job-company">${job.company_name || 'Company'}</div>
        <div class="job-meta">
            <span>📍 ${job.location || 'Remote'}</span>
            <span>💼 ${job.job_type.replace('_', ' ')}</span>
            ${job.salary_min ? `<span>💰 ${formatCurrency(job.salary_min)}${job.salary_max ? ' - ' + formatCurrency(job.salary_max) : '+'}</span>` : ''}
        </div>
        <div class="job-skills">${skillsHTML}</div>
        <div style="margin-top: 1rem; display: flex; gap: 1rem;">
            <a href="/job-details.html?id=${job.job_id}" class="btn btn-primary">View Details</a>
            <button onclick="removeSavedJob(${job.job_id})" class="btn btn-secondary">Remove</button>
        </div>
    `;

    return card;
}

async function removeSavedJob(jobId) {
    try {
        await apiCall(`/users/saved-jobs/${jobId}`, { method: 'DELETE' });
        showAlert('Job removed from saved list', 'success');
        loadSavedJobs();
    } catch (error) {
        showAlert('Error removing job', 'error');
    }
}

// Load profile
async function loadProfile() {
    const container = document.getElementById('profileContent');
    
    try {
        const data = await apiCall('/users/profile');
        const user = data.data;
        const profile = user.profile || {};

        container.innerHTML = `
            <div class="glass-card">
                <h3 style="margin-bottom: 1.5rem;">Personal Information</h3>
                <form id="profileForm" enctype="multipart/form-data">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label>First Name</label>
                            <input type="text" name="firstName" value="${user.first_name || ''}">
                        </div>
                        <div class="form-group">
                            <label>Last Name</label>
                            <input type="text" name="lastName" value="${user.last_name || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" value="${user.email}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="tel" name="phone" value="${user.phone || ''}">
                    </div>
                    <div class="form-group">
                        <label>Profile Photo</label>
                        <input type="file" name="profilePhoto" accept="image/*">
                    </div>
                    <div class="form-group">
                        <label>Bio</label>
                        <textarea name="bio" rows="4">${profile.bio || ''}</textarea>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label>Current Position</label>
                            <input type="text" name="currentPosition" value="${profile.current_position || ''}">
                        </div>
                        <div class="form-group">
                            <label>Experience (Years)</label>
                            <input type="number" name="experienceYears" value="${profile.experience_years || 0}">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label>Education Level</label>
                            <input type="text" name="educationLevel" value="${profile.education_level || ''}">
                        </div>
                        <div class="form-group">
                            <label>Location</label>
                            <input type="text" name="location" value="${profile.location || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Resume (PDF)</label>
                        <input type="file" name="resume" accept=".pdf">
                    </div>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </form>
            </div>
            <div class="glass-card" style="margin-top: 2rem;">
                <h3 style="margin-bottom: 1.5rem;">My Skills</h3>
                <div id="skillsList"></div>
                <div style="margin-top: 1rem;">
                    <select id="skillSelect" class="form-group" style="display: inline-block; width: auto; margin-right: 1rem;">
                        <option value="">Select a skill...</option>
                    </select>
                    <button onclick="addSkill()" class="btn btn-primary">Add Skill</button>
                </div>
            </div>
        `;

        // Load skills dropdown
        await loadSkillsDropdown();
        await loadUserSkills();
        
        // Setup form submission
        document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    } catch (error) {
        console.error('Error loading profile:', error);
        container.innerHTML = '<p style="color: var(--text-error);">Error loading profile.</p>';
    }
}

async function loadSkillsDropdown() {
    try {
        const data = await apiCall('/skills');
        const skills = data.data || [];
        const select = document.getElementById('skillSelect');
        
        skills.forEach(skill => {
            const option = document.createElement('option');
            option.value = skill.skill_id;
            option.textContent = skill.skill_name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading skills:', error);
    }
}

async function loadUserSkills() {
    try {
        const data = await apiCall('/users/profile');
        const skills = data.data.skills || [];
        const container = document.getElementById('skillsList');
        
        if (skills.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No skills added yet.</p>';
            return;
        }

        container.innerHTML = '';
        skills.forEach(skill => {
            const tag = document.createElement('div');
            tag.style.cssText = 'display: inline-block; margin: 0.5rem; padding: 0.5rem 1rem; background: rgba(99, 102, 241, 0.1); border-radius: 0.5rem;';
            tag.innerHTML = `
                ${skill.skill_name} (${skill.proficiency_level})
                <button onclick="removeSkill(${skill.skill_id})" style="margin-left: 0.5rem; background: none; border: none; color: var(--text-error); cursor: pointer;">×</button>
            `;
            container.appendChild(tag);
        });
    } catch (error) {
        console.error('Error loading user skills:', error);
    }
}

async function addSkill() {
    const skillId = document.getElementById('skillSelect').value;
    if (!skillId) return;

    try {
        await apiCall('/users/skills', {
            method: 'POST',
            body: JSON.stringify({ skillId })
        });
        showAlert('Skill added successfully', 'success');
        loadUserSkills();
    } catch (error) {
        showAlert('Error adding skill', 'error');
    }
}

async function removeSkill(skillId) {
    try {
        await apiCall(`/users/skills/${skillId}`, { method: 'DELETE' });
        showAlert('Skill removed', 'success');
        loadUserSkills();
    } catch (error) {
        showAlert('Error removing skill', 'error');
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    try {
        const response = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showAlert('Profile updated successfully', 'success');
        } else {
            showAlert('Error updating profile', 'error');
        }
    } catch (error) {
        showAlert('Error updating profile', 'error');
    }
}

function logout() {
    removeToken();
    removeUser();
    window.location.href = 'index.html';
}

