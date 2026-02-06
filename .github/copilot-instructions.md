# VSC Tab - Development Instructions

## Project Overview
VSC Tab is a VS Code extension that allows users to manage multiple projects in a single VS Code window using tabs.

## Architecture
- **extension.ts**: Main entry point, registers commands and tree view
- **projectsProvider.ts**: TreeDataProvider for the projects list, handles add/remove/open operations

## Key Features
1. Projects TreeView in sidebar
2. Add/Remove projects
3. Open projects in current workspace (multi-root)
4. Open projects in new window

## Development
- Use `npm run watch` for development
- Press `F5` to debug the extension
- Projects are stored in globalState

## Testing
- Add projects using the "+" button
- Click on a project to add it to the workspace
- Use context menu for additional options
