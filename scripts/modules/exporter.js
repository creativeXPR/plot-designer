// Export functionality for projects
export class Exporter {
    constructor() {
        this.formats = {
            pdf: {
                name: 'PDF',
                icon: '📄',
                description: 'Printable document with formatting',
                export: this.exportToPDF.bind(this)
            },
            markdown: {
                name: 'Markdown',
                icon: '📝',
                description: 'Plain text with Markdown formatting',
                export: this.exportToMarkdown.bind(this)
            },
            html: {
                name: 'HTML',
                icon: '🌐',
                description: 'Web page with styling',
                export: this.exportToHTML.bind(this)
            },
            json: {
                name: 'JSON',
                icon: '📊',
                description: 'Raw project data',
                export: this.exportToJSON.bind(this)
            }
        };
    }

    async exportProject(project, format = 'pdf') {
        const formatHandler = this.formats[format];
        if (!formatHandler) {
            throw new Error(`Unsupported format: ${format}`);
        }

        return await formatHandler.export(project);
    }

    async exportToPDF(project) {
        // For a real implementation, you would use a library like jsPDF
        // This is a simplified version that creates a downloadable HTML file styled for print
        
        const html = this.generatePDFHTML(project);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        return {
            url,
            filename: `${project.title.replace(/\s+/g, '-').toLowerCase()}.html`,
            type: 'text/html'
        };
    }

    async exportToMarkdown(project) {
        const markdown = this.generateMarkdown(project);
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        return {
            url,
            filename: `${project.title.replace(/\s+/g, '-').toLowerCase()}.md`,
            type: 'text/markdown'
        };
    }

    async exportToHTML(project) {
        const html = this.generateHTML(project);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        return {
            url,
            filename: `${project.title.replace(/\s+/g, '-').toLowerCase()}.html`,
            type: 'text/html'
        };
    }

    async exportToJSON(project) {
        const json = JSON.stringify(project, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        return {
            url,
            filename: `${project.title.replace(/\s+/g, '-').toLowerCase()}.json`,
            type: 'application/json'
        };
    }

    generatePDFHTML(project) {
        const steps = Object.values(project.steps).sort((a, b) => a.order - b.order);
        const date = new Date(project.updatedAt).toLocaleDateString();
        const wordCount = steps.reduce((total, step) => total + (step.wordCount || 0), 0);
        
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${project.title} - Plot Designer Export</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #A89CC8;
        }
        h1 {
            color: #3D3757;
            margin-bottom: 10px;
        }
        .meta {
            color: #666;
            font-size: 14px;
            margin-bottom: 30px;
        }
        .step {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .step-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        .step-icon {
            font-size: 24px;
        }
        .step-title {
            font-size: 18px;
            font-weight: bold;
            color: #3D3757;
        }
        .step-content {
            padding: 15px;
            background: #f9f9f9;
            border-radius: 5px;
            white-space: pre-wrap;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
        @media print {
            body {
                padding: 20px;
            }
            .step {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${project.title}</h1>
        <div class="meta">
            Exported from Plot Designer • ${date} • ${wordCount} words
        </div>
    </div>
    
    ${steps.map(step => `
        <div class="step">
            <div class="step-header">
                <span class="step-icon">${step.icon}</span>
                <span class="step-title">${step.title}</span>
            </div>
            <div class="step-content">${this.escapeHTML(step.content || '(No content)')}</div>
        </div>
    `).join('')}
    
    <div class="footer">
        Created with Plot Designer • ${new Date().getFullYear()}
    </div>
</body>
</html>`;
    }

    generateMarkdown(project) {
        const steps = Object.values(project.steps).sort((a, b) => a.order - b.order);
        const date = new Date(project.updatedAt).toLocaleDateString();
        const wordCount = steps.reduce((total, step) => total + (step.wordCount || 0), 0);
        
        let markdown = `# ${project.title}\n\n`;
        markdown += `*Exported from Plot Designer • ${date} • ${wordCount} words*\n\n`;
        
        steps.forEach(step => {
            markdown += `## ${step.icon} ${step.title}\n\n`;
            markdown += `${step.content || '(No content)'}\n\n`;
            markdown += '---\n\n';
        });
        
        markdown += `*Created with Plot Designer • ${new Date().getFullYear()}*`;
        
        return markdown;
    }

    generateHTML(project) {
        const steps = Object.values(project.steps).sort((a, b) => a.order - b.order);
        const date = new Date(project.updatedAt).toLocaleDateString();
        const wordCount = steps.reduce((total, step) => total + (step.wordCount || 0), 0);
        
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.title} - Plot Designer Export</title>
    <style>
        :root {
            --primary: #A89CC8;
            --text: #3D3757;
            --light: #F2F0F7;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: var(--text);
            background: #fafafa;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, var(--primary) 0%, #9486B8 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        h1 {
            margin: 0 0 10px 0;
            font-size: 2.5em;
        }
        .meta {
            opacity: 0.9;
            font-size: 0.9em;
        }
        .content {
            padding: 40px;
        }
        .step {
            margin-bottom: 30px;
            border-left: 4px solid var(--primary);
            padding-left: 20px;
        }
        .step-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
        }
        .step-icon {
            font-size: 1.5em;
        }
        .step-title {
            font-size: 1.2em;
            font-weight: 600;
            color: var(--text);
        }
        .step-content {
            background: var(--light);
            padding: 20px;
            border-radius: 8px;
            white-space: pre-wrap;
        }
        .footer {
            text-align: center;
            padding: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 0.9em;
        }
        @media (max-width: 600px) {
            .header {
                padding: 20px;
            }
            .content {
                padding: 20px;
            }
            h1 {
                font-size: 1.8em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${project.title}</h1>
            <div class="meta">
                Exported from Plot Designer • ${date} • ${wordCount} words
            </div>
        </div>
        
        <div class="content">
            ${steps.map(step => `
                <div class="step">
                    <div class="step-header">
                        <span class="step-icon">${step.icon}</span>
                        <span class="step-title">${step.title}</span>
                    </div>
                    <div class="step-content">${this.escapeHTML(step.content || '(No content)')}</div>
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            Created with ❄️ Plot Designer • ${new Date().getFullYear()}
        </div>
    </div>
</body>
</html>`;
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, '<br>');
    }

    showExportModal(project) {
        // This would be called from UI to show export options
        // Implementation would depend on your modal system
        console.log('Export project:', project.title);
    }
}

export const exporter = new Exporter();