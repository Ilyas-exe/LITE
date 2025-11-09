// Utility functions for wiki-style note linking

/**
 * Parse content and extract all [[Note Title]] style links
 * @param {string} content - The markdown content
 * @returns {Array} Array of note titles found in links
 */
export const extractNoteLinks = (content) => {
    if (!content) return [];
    const linkRegex = /\[\[([^\]]+)\]\]/g;
    const matches = [];
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
        matches.push(match[1].trim());
    }

    return matches;
};

/**
 * Convert [[Note Title]] links to clickable spans
 * @param {string} content - The markdown content
 * @param {Function} onLinkClick - Callback when link is clicked
 * @returns {JSX} Processed content with clickable links
 */
export const renderNoteLinks = (content, onLinkClick, allNotes = []) => {
    if (!content) return content;

    const parts = [];
    const linkRegex = /\[\[([^\]]+)\]\]/g;
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
        // Add text before the link
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: content.slice(lastIndex, match.index)
            });
        }

        const noteTitle = match[1].trim();
        const linkedNote = allNotes.find(n => n.title === noteTitle);

        // Add the link
        parts.push({
            type: 'link',
            title: noteTitle,
            exists: !!linkedNote,
            noteId: linkedNote?.id
        });

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
        parts.push({
            type: 'text',
            content: content.slice(lastIndex)
        });
    }

    return parts;
};

/**
 * Find all notes that link to the given note
 * @param {string} noteTitle - The title of the note to find backlinks for
 * @param {Array} allNotes - All notes in the knowledge base
 * @returns {Array} Array of notes that link to this note
 */
export const findBacklinks = (noteTitle, allNotes) => {
    if (!noteTitle || !allNotes) return [];

    return allNotes.filter(note => {
        if (!note.content) return false;
        const links = extractNoteLinks(note.content);
        return links.includes(noteTitle);
    });
};

/**
 * Search notes for autocomplete when typing [[
 * @param {string} query - The search query
 * @param {Array} allNotes - All notes in the knowledge base
 * @returns {Array} Matching note titles
 */
export const searchNotesForLink = (query, allNotes) => {
    if (!query || !allNotes) return [];

    const lowerQuery = query.toLowerCase();
    return allNotes
        .filter(note => note.title.toLowerCase().includes(lowerQuery))
        .map(note => note.title)
        .slice(0, 10); // Limit to 10 suggestions
};

/**
 * Insert cursor position in textarea
 * @param {HTMLTextAreaElement} textarea 
 * @param {string} text - Text to insert
 */
export const insertAtCursor = (textarea, text) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;

    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
    textarea.value = newValue;

    // Set cursor position after inserted text
    const newCursorPos = start + text.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
};
