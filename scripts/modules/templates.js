// Template system for Snowflake Method
const TEMPLATES = [
    {
        id: 'basic-snowflake',
        name: 'Basic Snowflake',
        description: 'Standard Snowflake Method structure for any story',
        icon: '❄️',
        color: 'var(--color-primary)',
        steps: [
            { id: 'summary', title: 'One-Sentence Summary', icon: '💡' },
            { id: 'characters', title: 'Main Characters', icon: '👤' },
            { id: 'scenes', title: 'Key Scenes', icon: '🎬' },
            { id: 'notes', title: 'Additional Notes', icon: '📝' }
        ],
        prompts: {
            summary: "Write a one-sentence summary of your entire story. Focus on the core conflict and character goal.",
            characters: "Describe your main characters, their roles, motivations, and character arcs.",
            scenes: "Outline the key scenes that drive your plot forward. Focus on major turning points.",
            notes: "Add any additional notes, themes, research, or ideas that don't fit in other categories."
        }
    },
    {
        id: 'heros-journey',
        name: "Hero's Journey",
        description: 'Classic monomyth structure with 12 stages',
        icon: '🦸',
        color: 'var(--color-accent)',
        steps: [
            { id: 'ordinary-world', title: 'Ordinary World', icon: '🏠' },
            { id: 'call-to-adventure', title: 'Call to Adventure', icon: '📯' },
            { id: 'refusal', title: 'Refusal of the Call', icon: '🙅' },
            { id: 'mentor', title: 'Meeting the Mentor', icon: '🧙' },
            { id: 'crossing', title: 'Crossing the Threshold', icon: '🚪' },
            { id: 'tests', title: 'Tests, Allies, Enemies', icon: '⚔️' },
            { id: 'approach', title: 'Approach to the Inmost Cave', icon: '🏔️' },
            { id: 'ordeal', title: 'The Ordeal', icon: '🔥' },
            { id: 'reward', title: 'Reward', icon: '🏆' },
            { id: 'road-back', title: 'The Road Back', icon: '🛣️' },
            { id: 'resurrection', title: 'Resurrection', icon: '🕊️' },
            { id: 'return', title: 'Return with the Elixir', icon: '🏡' }
        ],
        prompts: {
            'ordinary-world': "Introduce your hero in their ordinary world. What's missing from their life?",
            'call-to-adventure': "What event calls your hero to adventure? What do they stand to gain or lose?",
            'refusal': "Why does your hero initially refuse the call? What fears or obligations hold them back?",
            'mentor': "Who guides your hero? What wisdom or gifts do they provide?",
            'crossing': "What point of no return does your hero cross? How is their world different now?",
            'tests': "What challenges does your hero face? Who helps and who hinders them?",
            'approach': "How does your hero approach their greatest challenge? What preparations do they make?",
            'ordeal': "What is the central crisis or ordeal? How does your hero face death (literal or metaphorical)?",
            'reward': "What does your hero gain from surviving the ordeal? (Knowledge, object, power, etc.)",
            'road-back': "How does your hero begin their return journey? What new challenges emerge?",
            'resurrection': "What final test purifies your hero? How are they transformed?",
            'return': "How does your hero return home changed? What elixir (literal or metaphorical) do they bring?"
        }
    },
    {
        id: 'three-act',
        name: 'Three-Act Structure',
        description: 'Classic beginning, middle, and end structure',
        icon: '🎭',
        color: 'var(--color-success)',
        steps: [
            { id: 'act1-setup', title: 'Act I: Setup', icon: '🎬' },
            { id: 'inciting-incident', title: 'Inciting Incident', icon: '⚡' },
            { id: 'act2-confrontation', title: 'Act II: Confrontation', icon: '⚔️' },
            { id: 'midpoint', title: 'Midpoint', icon: '🎯' },
            { id: 'act3-resolution', title: 'Act III: Resolution', icon: '🎇' },
            { id: 'climax', title: 'Climax', icon: '🔥' },
            { id: 'denouement', title: 'Denouement', icon: '🕊️' }
        ],
        prompts: {
            'act1-setup': "Introduce characters, setting, and the status quo. What's the world like before everything changes?",
            'inciting-incident': "What event disrupts the status quo and sets the story in motion?",
            'act2-confrontation': "How does the protagonist struggle against obstacles? What do they learn?",
            'midpoint': "What major event changes the direction of the story? How are the stakes raised?",
            'act3-resolution': "How is the main conflict resolved? What is the new status quo?",
            'climax': "What is the final, decisive confrontation? How does the protagonist prove their growth?",
            'denouement': "How are loose ends tied up? What is life like for the characters now?"
        }
    },
    {
        id: 'mystery',
        name: 'Mystery/Thriller',
        description: 'Structure for suspenseful stories with reveals',
        icon: '🕵️',
        color: '#8E84B0',
        steps: [
            { id: 'crime', title: 'The Crime', icon: '🔍' },
            { id: 'detective', title: 'The Detective', icon: '🕵️' },
            { id: 'clues', title: 'Clues & Red Herrings', icon: '🧩' },
            { id: 'suspects', title: 'Suspects', icon: '👥' },
            { id: 'breakthrough', title: 'Breakthrough', icon: '💡' },
            { id: 'confrontation', title: 'Confrontation', icon: '⚡' },
            { id: 'resolution', title: 'Resolution', icon: '✅' }
        ],
        prompts: {
            'crime': "What crime or mystery needs solving? What makes it compelling?",
            'detective': "Who is solving the mystery? What's their background and motivation?",
            'clues': "What clues lead toward the truth? What red herrings misdirect?",
            'suspects': "Who are the suspects? What motives and alibis do they have?",
            'breakthrough': "What clue or insight breaks the case open?",
            'confrontation': "How does the detective confront the culprit? What's the final reveal?",
            'resolution': "How is justice served? What are the consequences?"
        }
    },
    {
        id: 'romance',
        name: 'Romance',
        description: 'Structure for love stories and relationships',
        icon: '❤️',
        color: '#F8BBD0',
        steps: [
            { id: 'meet-cute', title: 'Meet Cute', icon: '👋' },
            { id: 'attraction', title: 'Attraction', icon: '💘' },
            { id: 'conflict', title: 'Conflict', icon: '💔' },
            { id: 'dark-moment', title: 'Dark Moment', icon: '🌑' },
            { id: 'realization', title: 'Realization', icon: '💡' },
            { id: 'grand-gesture', title: 'Grand Gesture', icon: '🎁' },
            { id: 'happily-ever-after', title: 'Happily Ever After', icon: '👑' }
        ],
        prompts: {
            'meet-cute': "How do the love interests meet? What's their first impression?",
            'attraction': "What draws them together? What chemistry do they share?",
            'conflict': "What keeps them apart? (External obstacles, internal fears, misunderstandings)",
            'dark-moment': "What makes them believe all is lost? What separates them?",
            'realization': "What do they realize about themselves and each other?",
            'grand-gesture': "How does one prove their love? What sacrifice or effort do they make?",
            'happily-ever-after': "How do they come together? What does their future look like?"
        }
    }
];

export class TemplateManager {
    constructor() {
        this.templates = TEMPLATES;
    }

    getAllTemplates() {
        return this.templates;
    }  

    getTemplate(id) {
        return this.templates.find(t => t.id === id) || this.templates[0];
    }

    createProjectFromTemplate(templateId, title = 'Untitled Project') {
        const template = this.getTemplate(templateId);
        
        const steps = {};
        template.steps.forEach((step, index) => {
            steps[step.id] = {
                title: step.title,
                icon: step.icon,
                content: '',
                order: index,
                completed: false,
                wordCount: 0
            };
        });

        return {
            title,
            templateId,
            description: template.description,
            steps,
            currentStep: template.steps[0].id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            wordCount: 0
        };
    }

    getStepPrompt(templateId, stepId) {
        const template = this.getTemplate(templateId);
        return template.prompts[stepId] || 'Write your content here...';
    }

    getStepConfig(templateId, stepId) {
        const template = this.getTemplate(templateId);
        const step = template.steps.find(s => s.id === stepId);
        return step || { title: 'Step', icon: '📝' };
    }

    renderTemplateCard(template) {
        return `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-icon">${template.icon}</div>
                <h3>${template.name}</h3>
                <p>${template.description}</p>
                <div class="template-meta">
                    <span>${template.steps.length} steps</span>
                    <button class="btn-text use-template" data-template-id="${template.id}">
                        Use Template
                    </button>
                </div>
            </div>
        `;
    }

    renderTemplatesGrid(container) {
        if (!container) return;
        
        container.innerHTML = this.templates
            .map(template => this.renderTemplateCard(template))
            .join('');
    }
}

export const templateManager = new TemplateManager();