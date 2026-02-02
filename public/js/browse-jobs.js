/**
 * Browse Jobs Page JavaScript
 */

let currentPage = 1;
let currentFilters = {};

document.addEventListener('DOMContentLoaded', () => {
    // Load URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search');
    const category = urlParams.get('category');
    const location = urlParams.get('location');

    if (search) document.getElementById('searchInput').value = search;
    if (category) document.getElementById('categoryFilter').value = category;
    if (location) document.getElementById('locationFilter').value = location;

    loadJobs();
});

function applyFilters() {
    currentPage = 1;
    currentFilters = {
        search: document.getElementById('searchInput').value,
        category: document.getElementById('categoryFilter').value,
        jobType: document.getElementById('jobTypeFilter').value,
        location: document.getElementById('locationFilter').value
    };
    loadJobs();
}

async function loadJobs() {
    const container = document.getElementById('jobsList');
    showLoading(container);

    try {
        const params = new URLSearchParams({
            page: currentPage,
            limit: '10',
            ...currentFilters
        });

        const data = await apiCall(`/jobs?${params}`);
        const jobs = data.data || [];
        const pagination = data.pagination || {};

        if (jobs.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No jobs found. Try adjusting your filters.</p>';
            return;
        }

        container.innerHTML = '';
        jobs.forEach(job => {
            const card = createJobCard(job);
            container.appendChild(card);
        });

        // Update pagination
        updatePagination(pagination);
    } catch (error) {
        console.error('Error loading jobs:', error);
        container.innerHTML = '<p style="color: var(--text-error);">Error loading jobs. Please try again.</p>';
    }
}

function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    card.onclick = () => window.location.href = `/job-details.html?id=${job.job_id}`;

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
        <div style="margin-top: 1rem;">
            <a href="job-details.html?id=${job.job_id}" class="btn btn-primary" onclick="event.stopPropagation()">View Details</a>
        </div>
    `;

    return card;
}

function updatePagination(pagination) {
    const container = document.getElementById('pagination');
    if (!pagination.pages || pagination.pages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    if (currentPage > 1) {
        html += `<button onclick="changePage(${currentPage - 1})" class="btn btn-secondary">Previous</button> `;
    }

    for (let i = 1; i <= pagination.pages; i++) {
        if (i === currentPage) {
            html += `<button class="btn btn-primary" style="margin: 0 0.25rem;">${i}</button> `;
        } else if (i === 1 || i === pagination.pages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button onclick="changePage(${i})" class="btn btn-secondary" style="margin: 0 0.25rem;">${i}</button> `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<span style="margin: 0 0.25rem;">...</span> `;
        }
    }

    if (currentPage < pagination.pages) {
        html += `<button onclick="changePage(${currentPage + 1})" class="btn btn-secondary">Next</button>`;
    }

    container.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    loadJobs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Check auth status on page load
document.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) {
        const loginLink = document.getElementById('loginLink');
        const logoutLink = document.getElementById('logoutLink');
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'inline';
    }
});

function logout() {
    removeToken();
    removeUser();
    window.location.href = 'index.html';
}

