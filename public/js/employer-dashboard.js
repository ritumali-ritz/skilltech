/**
 * Employer Dashboard JavaScript
 */

let currentUser = null;
let selectedJobSkills = [];

document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;

    currentUser = getUser();
    if (currentUser.role !== 'employer') {
        window.location.href = 'index.html';
        return;
    }

    // Load skills dropdown
    await loadSkillsDropdown();

    // Setup form
    document.getElementById('postJobForm').addEventListener('submit', handlePostJob);

    // Load initial section
    showSection('post-job');
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
        case 'my-jobs':
            loadMyJobs();
            break;
        case 'applicants':
            loadApplicantsOverview();
            break;
        case 'company':
            loadCompanyProfile();
            break;
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
            option.textContent = `${skill.skill_name} (${skill.category})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading skills:', error);
    }
}

function addJobSkill() {
    const select = document.getElementById('skillSelect');
    const skillId = select.value;
    
    if (!skillId) return;

    const skillName = select.options[select.selectedIndex].text;
    
    if (selectedJobSkills.find(s => s.skill_id === parseInt(skillId))) {
        showAlert('Skill already added', 'error');
        return;
    }

    selectedJobSkills.push({
        skill_id: parseInt(skillId),
        skill_name: skillName
    });

    updateSkillsDisplay();
    select.value = '';
}

function removeJobSkill(skillId) {
    selectedJobSkills = selectedJobSkills.filter(s => s.skill_id !== skillId);
    updateSkillsDisplay();
}

function updateSkillsDisplay() {
    const container = document.getElementById('skillsContainer');
    container.innerHTML = '';

    if (selectedJobSkills.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No skills added yet.</p>';
        return;
    }

    selectedJobSkills.forEach(skill => {
        const tag = document.createElement('div');
        tag.style.cssText = 'display: inline-block; margin: 0.5rem 0.5rem 0.5rem 0; padding: 0.5rem 1rem; background: rgba(99, 102, 241, 0.1); border-radius: 0.5rem;';
        tag.innerHTML = `
            ${skill.skill_name}
            <button onclick="removeJobSkill(${skill.skill_id})" style="margin-left: 0.5rem; background: none; border: none; color: var(--text-error); cursor: pointer;">×</button>
        `;
        container.appendChild(tag);
    });
}

async function handlePostJob(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    if (selectedJobSkills.length === 0) {
        showAlert('Please add at least one required skill', 'error');
        return;
    }

    const data = {
        jobTitle: formData.get('jobTitle'),
        jobDescription: formData.get('jobDescription'),
        jobType: formData.get('jobType'),
        category: formData.get('category'),
        location: formData.get('location') || null,
        salaryMin: formData.get('salaryMin') || null,
        salaryMax: formData.get('salaryMax') || null,
        salaryCurrency: formData.get('salaryCurrency') || 'USD',
        experienceRequired: parseInt(formData.get('experienceRequired')) || 0,
        educationRequired: formData.get('educationRequired') || null,
        skillIds: selectedJobSkills.map(s => s.skill_id)
    };

    try {
        const result = await apiCall('/jobs', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (result.success) {
            showAlert('Job posted successfully! It will be reviewed by admin before going live.', 'success');
            form.reset();
            selectedJobSkills = [];
            updateSkillsDisplay();
        }
    } catch (error) {
        showAlert(error.message || 'Error posting job', 'error');
    }
}

async function loadMyJobs() {
    const container = document.getElementById('myJobsList');
    
    try {
        // Get all jobs (we'll filter by employer on backend or client-side)
        const data = await apiCall('/jobs?limit=100');
        const allJobs = data.data || [];
        
        // Filter jobs by current employer (this should ideally be done on backend)
        // For now, we'll show a message
        container.innerHTML = `
            <div class="glass-card">
                <p style="color: var(--text-secondary);">
                    Your posted jobs will appear here. Note: This requires backend filtering by employer_id.
                </p>
            </div>
        `;
    } catch (error) {
        console.error('Error loading jobs:', error);
        container.innerHTML = '<p style="color: var(--text-error);">Error loading jobs.</p>';
    }
}

async function loadApplicantsOverview() {
    const container = document.getElementById('applicantsContent');
    container.innerHTML = `
        <div class="glass-card">
            <p style="color: var(--text-secondary);">
                Select a job from "My Jobs" to view applicants. This feature requires job selection functionality.
            </p>
        </div>
    `;
}

async function loadCompanyProfile() {
    const container = document.getElementById('companyContent');
    
    try {
        const data = await apiCall('/companies/my-company');
        const company = data.data;

        if (!company) {
            container.innerHTML = `
                <div class="glass-card">
                    <h3 style="margin-bottom: 1.5rem;">Create Company Profile</h3>
                    <form id="companyForm" enctype="multipart/form-data">
                        <div class="form-group">
                            <label>Company Name *</label>
                            <input type="text" name="companyName" required>
                        </div>
                        <div class="form-group">
                            <label>Company Description</label>
                            <textarea name="companyDescription" rows="5"></textarea>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label>Industry</label>
                                <input type="text" name="industry">
                            </div>
                            <div class="form-group">
                                <label>Website</label>
                                <input type="url" name="website">
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label>Location</label>
                                <input type="text" name="location">
                            </div>
                            <div class="form-group">
                                <label>Employee Count</label>
                                <input type="text" name="employeeCount" placeholder="e.g., 50-100">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Founded Year</label>
                            <input type="number" name="foundedYear" min="1900" max="2024">
                        </div>
                        <div class="form-group">
                            <label>Company Logo</label>
                            <input type="file" name="logo" accept="image/*">
                        </div>
                        <div id="alertContainer"></div>
                        <button type="submit" class="btn btn-primary">Save Company Profile</button>
                    </form>
                </div>
            `;

            document.getElementById('companyForm').addEventListener('submit', handleCompanySubmit);
        } else {
            container.innerHTML = `
                <div class="glass-card">
                    <h3 style="margin-bottom: 1.5rem;">Company Profile</h3>
                    <form id="companyForm" enctype="multipart/form-data">
                        <div class="form-group">
                            <label>Company Name *</label>
                            <input type="text" name="companyName" value="${company.company_name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Company Description</label>
                            <textarea name="companyDescription" rows="5">${company.company_description || ''}</textarea>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label>Industry</label>
                                <input type="text" name="industry" value="${company.industry || ''}">
                            </div>
                            <div class="form-group">
                                <label>Website</label>
                                <input type="url" name="website" value="${company.website || ''}">
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label>Location</label>
                                <input type="text" name="location" value="${company.location || ''}">
                            </div>
                            <div class="form-group">
                                <label>Employee Count</label>
                                <input type="text" name="employeeCount" value="${company.employee_count || ''}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Founded Year</label>
                            <input type="number" name="foundedYear" value="${company.founded_year || ''}" min="1900" max="2024">
                        </div>
                        <div class="form-group">
                            <label>Company Logo</label>
                            <input type="file" name="logo" accept="image/*">
                            ${company.logo ? `<p style="margin-top: 0.5rem; color: var(--text-secondary);">Current logo: ${company.logo}</p>` : ''}
                        </div>
                        <div id="alertContainer"></div>
                        <button type="submit" class="btn btn-primary">Update Company Profile</button>
                    </form>
                </div>
            `;

            document.getElementById('companyForm').addEventListener('submit', handleCompanySubmit);
        }
    } catch (error) {
        console.error('Error loading company profile:', error);
        container.innerHTML = '<p style="color: var(--text-error);">Error loading company profile.</p>';
    }
}

async function handleCompanySubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    try {
        const response = await fetch('/api/companies', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showAlert('Company profile saved successfully', 'success');
            loadCompanyProfile();
        } else {
            showAlert('Error saving company profile', 'error');
        }
    } catch (error) {
        showAlert('Error saving company profile', 'error');
    }
}

function showAlert(message, type) {
    const container = document.getElementById('alertContainer');
    if (!container) return;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    container.innerHTML = '';
    container.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function logout() {
    removeToken();
    removeUser();
    window.location.href = 'index.html';
}

