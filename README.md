# Project Library

A modern, responsive static website for GitHub Pages that serves as a library for your HTML projects.

## Features

✨ **Responsive Design** - Works perfectly on desktop, tablet, and mobile
🔍 **Easy Management** - Add projects by editing a simple JSON file
📁 **Project Organization** - Keep all your HTML files in the `projects/` folder
🎨 **Beautiful UI** - Modern dark theme with smooth animations
🚀 **GitHub Pages Ready** - Deploy directly to your GitHub Pages

## Quick Start

1. **Create a project file**: Add your HTML files to the `projects/` folder
   ```
   projects/
   ├── sample.html
   ├── about.html
   └── your-project.html
   ```

2. **Update projects.json**: Add an entry for each project
   ```json
   {
       "name": "Your Project Name",
       "description": "Brief description of what it does",
       "icon": "🎨",
       "path": "projects/your-project.html",
       "tags": ["tag1", "tag2"]
   }
   ```

3. **That's it!** Your project will appear on the main page

## File Structure

```
portfolio-site/
├── index.html           # Main page (entry point)
├── style.css            # Styling
├── script.js            # JavaScript for loading projects
├── projects.json        # Project configuration
├── projects/            # Folder containing your HTML projects
│   ├── sample.html
│   ├── about.html
│   └── [your-projects]
└── README.md            # This file
```

## Deploying to GitHub Pages

1. Rename the `portfolio-site` folder to `[username].github.io`
2. Push it to GitHub
3. Your site will be live at `https://[username].github.io`

Or, if you want it as a project page:
1. Push `portfolio-site` as a repository
2. Enable GitHub Pages in Settings
3. Your site will be at `https://[username].github.io/portfolio-site`

## Customization

### Change colors
Edit the CSS variables at the top of `style.css`:
```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    /* ... more colors */
}
```

### Change header text
Edit the `<header>` section in `index.html`

### Adjust grid layout
Modify the `grid-template-columns` property in `.projects-grid` CSS

## Tips for Success

- 📝 Write clear, descriptive project names
- 🎯 Use relevant emojis as icons
- 🏷️ Add meaningful tags to categorize projects
- 📱 Test projects on mobile to ensure responsiveness
- 🔗 Make sure each HTML file is self-contained

## Supported Project Types

- Interactive games
- Data visualizations
- Portfolios
- Calculators
- Tools and utilities
- Experiments
- Demos
- Documentation pages
- Anything HTML/CSS/JavaScript based!

## Need Help?

Check the `about.html` page in the projects folder for more detailed instructions.

Enjoy building! 🚀
