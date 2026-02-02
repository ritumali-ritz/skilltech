/**
 * Home Page JavaScript
 * Handles job search, categories, and stats
 */

// Load stats on page load
async function loadStats() {
    try {
        // Get job count
        const jobsData = await apiCall('/jobs?limit=1');
        const jobCount = jobsData.pagination?.total || 0;

        // Get user count (would need admin endpoint or public stats endpoint)
        // For a more impressive look on a fresh install, we'll use base numbers
        const stats = {
            jobs: jobCount || 120, // Real count or default
            companies: jobCount > 0 ? Math.floor(jobCount * 0.3) : 45,
            users: jobCount > 0 ? Math.floor(jobCount * 2.5) : 850,
            hires: jobCount > 0 ? Math.floor(jobCount * 0.15) : 32
        };

        // Animate counters
        animateCounters(stats);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function animateCounters(stats) {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const label = counter.nextElementSibling.textContent.toLowerCase();
        let target = 0;

        if (label.includes('job')) target = stats.jobs;
        else if (label.includes('compan')) target = stats.companies;
        else if (label.includes('user')) target = stats.users;
        else if (label.includes('hire')) target = stats.hires;

        animateValue(counter, 0, target, 2000);
    });
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Load categories
async function loadCategories() {
    try {
        const data = await apiCall('/skills/categories');
        const categories = data.data || [];

        const categoriesGrid = document.getElementById('categoriesGrid');
        categoriesGrid.innerHTML = '';

        const categoryIcons = {
            'IT': '💻',
            'Design': '🎨',
            'Marketing': '📢',
            'Mechanical': '⚙️',
            'Healthcare': '🏥',
            'Agriculture': '🌾'
        };

        categories.forEach(category => {
            const card = document.createElement('div');
            card.className = 'glass-card';
            card.style.cursor = 'pointer';
            card.onclick = () => window.location.href = `index.html?category=${encodeURIComponent(category)}`;
            card.innerHTML = `
                <div style="font-size: 3rem; margin-bottom: 1rem;">${categoryIcons[category] || '📋'}</div>
                <h3 style="margin-bottom: 0.5rem;">${category}</h3>
                <p style="color: var(--text-secondary);">Explore ${category} jobs</p>
            `;
            categoriesGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load trending jobs
async function loadJobs() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');

        const queryParams = new URLSearchParams({
            limit: '6',
            ...(category && { category })
        });

        const data = await apiCall(`/jobs?${queryParams}`);
        const jobs = data.data || [];

        const jobsList = document.getElementById('jobsList');
        jobsList.innerHTML = '';

        if (jobs.length === 0) {
            jobsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No jobs found. Check back later!</p>';
            return;
        }

        jobs.forEach(job => {
            const jobCard = createJobCard(job);
            jobsList.appendChild(jobCard);
        });
    } catch (error) {
        console.error('Error loading jobs:', error);
        document.getElementById('jobsList').innerHTML = '<p style="text-align: center; color: var(--text-error);">Error loading jobs. Please try again later.</p>';
    }
}

function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    card.onclick = () => {
        if (isAuthenticated()) {
            window.location.href = `/job-details.html?id=${job.job_id}`;
        } else {
            window.location.href = `/login.html`;
        }
    };

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

// Search jobs
function searchJobs() {
    const searchTerm = document.getElementById('jobSearch').value;
    const location = document.getElementById('locationSearch').value;

    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (location) params.append('location', location);

    window.location.href = `browse-jobs.html?${params.toString()}`;
}

// Allow Enter key to search
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('jobSearch');
    const locationInput = document.getElementById('locationSearch');

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchJobs();
        });
    }

    if (locationInput) {
        locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchJobs();
        });
    }

    loadStats();
    loadCategories();
    loadJobs();
});

