// Note templates for quick creation
export const noteTemplates = [
    {
        id: 'blank',
        name: 'Blank Note',
        icon: '📄',
        description: 'Start with an empty note',
        content: ''
    },
    {
        id: 'meeting',
        name: 'Meeting Notes',
        icon: '📝',
        description: 'Document meeting discussions',
        content: `# Meeting Notes

## Date
${new Date().toLocaleDateString()}

## Attendees
- 

## Agenda
1. 
2. 
3. 

## Discussion Points
- 

## Action Items
- [ ] 
- [ ] 

## Next Meeting
- Date: 
- Time: `
    },
    {
        id: 'project',
        name: 'Project Plan',
        icon: '📋',
        description: 'Plan and track projects',
        content: `# Project Plan

## Overview
**Project Name:** 
**Start Date:** ${new Date().toLocaleDateString()}
**End Date:** 
**Status:** 🟡 In Planning

## Objectives
- 

## Scope
### In Scope
- 

### Out of Scope
- 

## Milestones
- [ ] Milestone 1 - 
- [ ] Milestone 2 - 
- [ ] Milestone 3 - 

## Resources
- 

## Risks
- 

## Success Criteria
- `
    },
    {
        id: 'daily',
        name: 'Daily Log',
        icon: '📅',
        description: 'Track daily progress',
        content: `# Daily Log - ${new Date().toLocaleDateString()}

## Today's Goals
- [ ] 
- [ ] 
- [ ] 

## Completed Tasks
✅ 

## Notes
- 

## Tomorrow's Plan
- 

## Mood / Energy
😊 / 🔋🔋🔋`
    },
    {
        id: 'code',
        name: 'Code Snippet',
        icon: '💻',
        description: 'Save code examples',
        content: `# Code Snippet

## Title


## Language
\`\`\`javascript

\`\`\`

## Description


## Use Case


## Notes
- `
    },
    {
        id: 'research',
        name: 'Research Notes',
        icon: '🔬',
        description: 'Document research findings',
        content: `# Research Notes

## Topic


## Sources
1. 
2. 

## Key Findings
- 

## Summary


## Questions
- 

## Next Steps
- `
    },
    {
        id: 'bug',
        name: 'Bug Report',
        icon: '🐛',
        description: 'Track and document bugs',
        content: `# Bug Report

## Title


## Severity
🔴 Critical / 🟡 Medium / 🟢 Low

## Description


## Steps to Reproduce
1. 
2. 
3. 

## Expected Behavior


## Actual Behavior


## Environment
- OS: 
- Browser: 
- Version: 

## Screenshots


## Solution
- [ ] Identified
- [ ] Fixed
- [ ] Tested

## Notes
`
    },
    {
        id: 'interview',
        name: 'Interview Prep',
        icon: '💼',
        description: 'Prepare for interviews',
        content: `# Interview Preparation

## Company


## Position


## Interview Date
${new Date().toLocaleDateString()}

## Company Research
- 
- 

## Key Questions to Ask
1. 
2. 
3. 

## Technical Topics to Review
- [ ] 
- [ ] 

## Behavioral Questions Prep
**Tell me about yourself:**


**Why this company?**


**Biggest strength:**


**Biggest weakness:**


## Notes After Interview
`
    },
    {
        id: 'learning',
        name: 'Learning Notes',
        icon: '📚',
        description: 'Document what you learn',
        content: `# Learning Notes

## Topic


## Date
${new Date().toLocaleDateString()}

## Key Concepts
1. 
2. 
3. 

## Examples


## Summary


## Related Topics
- 

## Practice Exercises
- [ ] 
- [ ] 

## Resources
- `
    },
    {
        id: 'idea',
        name: 'Idea / Brainstorm',
        icon: '💡',
        description: 'Capture ideas and thoughts',
        content: `# Idea

## Title


## Category


## Description


## Why This Matters


## Potential Challenges
- 

## Next Steps
- [ ] 
- [ ] 

## Resources Needed


## Timeline
`
    }
];

export const getTemplateById = (id) => {
    return noteTemplates.find(template => template.id === id) || noteTemplates[0];
};
