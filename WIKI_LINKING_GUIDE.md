# 🔗 Wiki-Style Note Linking - User Guide

## Overview
Priority #9 implementation complete! Your LITE Knowledge Base now supports **wiki-style internal linking** between notes, just like Wikipedia or Notion.

## ✨ Features Implemented

### 1. **Wiki Link Syntax** `[[Note Title]]`
- Use double square brackets to link to other notes
- Example: `See [[Meeting Notes]] for more details`
- Links are clickable in preview mode
- Visual indicators:
  - 🔗 Blue badge = Valid link (note exists)
  - ❌ Red badge = Broken link (note not found)

### 2. **Smart Autocomplete**
When editing a note, type `[[` and an autocomplete menu appears:
- Shows matching note titles as you type
- Navigate with ↑↓ arrow keys
- Select with Enter
- Cancel with Esc
- Automatically searches all notes in your knowledge base

### 3. **Quick Link Button**
In edit mode, click the **🔗 LINK** button in the toolbar to:
- Insert `[[]]` at cursor position
- Automatically position cursor between brackets
- Start typing to trigger autocomplete

### 4. **Backlinks Panel**
At the bottom of each note, see:
- **Which notes link TO this note**
- Click any backlink to navigate to that note
- Preview snippets of linking notes
- Counter shows total number of backlinks

### 5. **Navigation**
- Click any wiki link to jump to that note
- Backlinks are also clickable
- Works in both sidebar and grid view modes
- Seamless navigation between linked notes

## 🎯 Use Cases

### Personal Wiki
```markdown
# Project Alpha

## Overview
This project uses [[Tech Stack]] and follows [[Development Process]].

## Team
- Lead: [[John Doe Profile]]
- Designer: [[Jane Smith Profile]]

## Related
- [[Sprint Planning Notes]]
- [[Bug Tracking]]
```

### Meeting Notes
```markdown
# Weekly Sync - Nov 9, 2025

## Action Items
- Update [[Product Roadmap]]
- Review [[Q4 Goals]]
- Fix issues in [[Bug Report Template]]

## Attendees
See [[Team Directory]]
```

### Learning Notes
```markdown
# React Hooks

## Related Concepts
- [[JavaScript Closures]]
- [[Functional Programming]]
- [[React Component Lifecycle]]

## Examples
Detailed examples in [[React Hooks Cheatsheet]]
```

### Research & References
```markdown
# AI Research Paper Summary

## Key Ideas
1. [[Neural Networks]] architecture
2. [[Transformer Models]] explained
3. Comparison with [[Traditional ML]]

## Code Implementations
See [[Python ML Examples]]
```

## 🛠️ Technical Implementation

### Frontend Components
1. **`noteLinking.js`** - Core linking utilities
   - `extractNoteLinks()` - Parse `[[]]` syntax
   - `renderNoteLinks()` - Convert to clickable elements
   - `findBacklinks()` - Discover reverse links
   - `searchNotesForLink()` - Autocomplete search

2. **`NoteLinkAutocomplete.jsx`** - Autocomplete dropdown
   - Keyboard navigation (↑↓, Enter, Esc)
   - Real-time note search
   - Smart positioning

3. **`BacklinksPanel.jsx`** - Backlinks display
   - Shows notes linking to current note
   - Click to navigate
   - Preview snippets

4. **`Viewer.jsx`** (Enhanced)
   - Wiki link detection in textarea
   - Autocomplete trigger on `[[`
   - Custom markdown renderer for clickable links
   - 🔗 LINK button in toolbar

5. **`KnowledgeBasePage.jsx`** (Enhanced)
   - `getAllNotes()` - Flatten tree structure
   - `handleNavigateToNote()` - Cross-note navigation
   - Pass note data to Viewer

### How It Works

#### 1. Editing Phase
```
User types "[[" → 
Trigger autocomplete → 
Search all notes → 
Display suggestions → 
User selects → 
Insert "[[Note Title]]"
```

#### 2. Preview Phase
```
Markdown with [[links]] → 
Parse content → 
Find [[Note Title]] patterns → 
Check if note exists → 
Render as clickable badge → 
Click → Navigate to note
```

#### 3. Backlinks Calculation
```
Current note: "Project Alpha"
Scan all notes' content → 
Find [[Project Alpha]] mentions → 
Display as backlinks → 
Click backlink → Navigate
```

## 📝 Best Practices

### Naming Conventions
- Use **descriptive note titles** (they become link text)
- Keep titles unique and specific
- Example: `"2025 Q4 Goals"` better than `"Goals"`

### Link Organization
- Create an **index note** linking to main topics
- Use backlinks to find **orphaned notes** (no incoming links)
- Build **concept maps** by linking related notes

### Template Integration
- Note templates already support wiki links
- Example: Meeting Notes template has `## Related Notes` section
- Add `[[]]` links in templates for quick reference

### Search Integration
- Use search to find notes before linking
- Autocomplete searches titles (not content)
- Create notes with consistent naming for easier linking

## 🚀 Workflow Examples

### Creating a Knowledge Graph
1. Create central "Index" note
2. Link to main categories: `[[Projects]]`, `[[People]]`, `[[Resources]]`
3. Each category links to specific items
4. Backlinks show connections automatically

### Daily Note Workflow
1. Create daily log: "2025-11-09"
2. Reference ongoing projects: `[[Project Alpha]]`, `[[Bug Fixes]]`
3. Link to people: `[[Meeting with John]]`
4. Check backlinks to see what references today's note

### Project Documentation
1. Project overview note with `[[Architecture]]`, `[[API Docs]]`, `[[Changelog]]`
2. Each linked note references back to project
3. Use backlinks to track all project-related notes
4. Navigate graph-style between docs

## 🎨 Visual Guide

### Wiki Link States
- **Valid Link**: `🔗 Note Title` (blue badge, clickable)
- **Broken Link**: `❌ Note Title` (red badge, disabled)
- **In Edit Mode**: `[[Note Title]]` (raw syntax, autocomplete available)

### Autocomplete UI
```
┌─────────────────────────────────┐
│ Link to note (↑↓ Enter Esc)    │
├─────────────────────────────────┤
│ 📄 Project Alpha                │ ← Selected
│ 📄 Project Beta                 │
│ 📄 Project Gamma                │
└─────────────────────────────────┘
```

### Backlinks Panel
```
🔗 BACKLINKS (3)

┌─────────────────────────────────┐
│ 📄 Sprint Planning              │
│ "Review [[Project Alpha]]..."   │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 📄 Weekly Sync                  │
│ "Update [[Project Alpha]]..."   │
└─────────────────────────────────┘
```

## 🔮 Future Enhancements (Post-Priority)
- Graph visualization of note connections
- Auto-suggest links based on content similarity
- Rename note → update all links automatically
- Orphaned notes finder
- Most-linked notes analytics
- Tag system integration with linking

## ✅ Testing Checklist

Test the wiki linking feature:

1. **Basic Linking**
   - [ ] Create note "Test Note A"
   - [ ] Create note "Test Note B"
   - [ ] In "Test Note A", type `[[Test Note B]]`
   - [ ] Verify blue link badge appears in preview
   - [ ] Click link → should navigate to "Test Note B"

2. **Autocomplete**
   - [ ] In edit mode, type `[[`
   - [ ] Verify autocomplete dropdown appears
   - [ ] Type partial note name
   - [ ] Verify suggestions update
   - [ ] Use arrow keys to navigate
   - [ ] Press Enter to select
   - [ ] Verify `[[Note Title]]` inserted

3. **Backlinks**
   - [ ] Create note "Main Topic"
   - [ ] Create note "Reference 1" with `[[Main Topic]]`
   - [ ] Create note "Reference 2" with `[[Main Topic]]`
   - [ ] Open "Main Topic"
   - [ ] Scroll to bottom
   - [ ] Verify backlinks panel shows "Reference 1" and "Reference 2"
   - [ ] Click backlink → should navigate to that note

4. **Broken Links**
   - [ ] Create note with `[[Nonexistent Note]]`
   - [ ] Verify red badge appears
   - [ ] Verify ❌ icon shown
   - [ ] Verify "Note not found" tooltip
   - [ ] Verify link is not clickable

5. **Quick Link Button**
   - [ ] Enter edit mode
   - [ ] Click 🔗 LINK button
   - [ ] Verify `[[]]` inserted
   - [ ] Verify cursor between brackets
   - [ ] Verify autocomplete triggered

## 🎓 Pro Tips

1. **Create Hub Notes**: Central notes that link to many related topics
2. **Use Consistent Naming**: Makes autocomplete more effective
3. **Check Backlinks Regularly**: Discover unexpected connections
4. **Start Simple**: Begin with obvious connections, expand naturally
5. **Template Power**: Add common links to templates for consistency
6. **Cross-Reference**: When taking meeting notes, link to relevant projects/people
7. **Weekly Review**: Check for orphaned notes using backlinks (notes with 0 backlinks)

## 🌟 Integration with Existing Features

### Works With:
- ✅ Note Templates - Add `[[]]` links in templates
- ✅ Search - Find notes before linking
- ✅ Export - Wiki links preserved in MD/PDF exports
- ✅ Version History - Link changes tracked in versions
- ✅ Mobile View - Fully responsive wiki links
- ✅ Keyboard Shortcuts - Navigate with Ctrl+K, edit with Ctrl+E

### Lawtor Aesthetic Maintained
- Pure black background (#0a0a0a)
- Minimal, clean link badges
- Blue accent for valid links
- Red accent for broken links
- No decorative effects - focus on function

---

**Priority #9 Complete!** 🎉

Your knowledge base is now a **connected wiki** where notes form a web of knowledge. Start linking related concepts, and watch your personal knowledge graph grow!

Next Priority: #10-13 (Post-deployment features)
