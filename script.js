// Load projects from projects.json and display them
async function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    
    try {
        const response = await fetch('projects.json');
        if (!response.ok) {
            throw new Error('Failed to load projects.json');
        }
        
        const projects = await response.json();
        
        if (projects.length === 0) {
            projectsGrid.innerHTML = `
                <div class="empty-state">
                    <h2>No Projects Yet</h2>
                    <p>Add HTML files to the projects folder and update projects.json to get started!</p>
                </div>
            `;
            return;
        }
        
        projectsGrid.innerHTML = '';
        projects.forEach(project => {
            const card = createProjectCard(project);
            projectsGrid.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading projects:', error);
        projectsGrid.innerHTML = `
            <div class="error">
                <strong>Error:</strong> Could not load projects. Make sure projects.json exists in the root directory.
            </div>
        `;
    }
}

// Create a project card element
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const tagsHTML = project.tags && project.tags.length > 0
        ? project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
        : '';
    
    card.innerHTML = `
        <div class="project-icon">${project.icon || '📄'}</div>
        <h3 class="project-name">${project.name}</h3>
        <p class="project-description">${project.description || 'No description provided'}</p>
        <div class="project-meta">
            ${tagsHTML}
        </div>
    `;
    
    card.addEventListener('click', () => openProjectModal(project.path));
    
    return card;
}

// Open project in modal
function openProjectModal(projectPath) {
    const modal = document.getElementById('projectModal');
    const frame = document.getElementById('projectFrame');
    frame.src = projectPath;
    modal.classList.add('active');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('projectModal');
    modal.classList.remove('active');
}

// Modal close button event listener
document.getElementById('closeModal').addEventListener('click', closeModal);

// Close modal when clicking outside the modal content
document.getElementById('projectModal').addEventListener('click', (e) => {
    if (e.target.id === 'projectModal') {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Load projects when page loads
document.addEventListener('DOMContentLoaded', loadProjects);
