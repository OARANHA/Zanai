# Zanai VS Code Extension

A powerful VS Code extension that integrates with the Zanai AI system, bringing intelligent agent capabilities directly into your development environment.

## Features

### 🚀 Core Integration
- **Real-time Communication**: WebSocket-based connection to Zanai server
- **Context Synchronization**: Automatic sync of your code context with Zanai
- **Agent Execution**: Run AI agents directly from VS Code
- **Bidirectional Communication**: Seamless interaction between VS Code and web interface

### 🤖 Agent Management
- **Agent Tree View**: Browse and manage your agents in the explorer
- **Quick Execution**: Execute agents with custom input
- **Agent Details**: View detailed information about each agent
- **Status Monitoring**: Real-time status updates for agent executions

### 📊 Context Awareness
- **Code Analysis**: Automatic analysis of your project structure
- **Pattern Recognition**: Identify and learn from code patterns
- **Dependency Tracking**: Understand project dependencies and technologies
- **File Context**: Access to active files and project structure

### 🔧 Developer Experience
- **Auto-sync**: Automatically sync context when files change
- **Notifications**: Configurable notifications for agent activities
- **Configuration**: Easy setup through VS Code settings
- **Web Integration**: Direct access to Zanai web interface

## Installation

### Prerequisites
- Node.js (v16 or higher)
- VS Code (v1.74 or higher)
- Zanai server running (see [Zanai Web Interface](../README-ZANAI.md))

### Install Extension
1. Clone this repository
2. Navigate to the `vscode-extension` directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Compile the extension:
   ```bash
   npm run compile
   ```
5. Open VS Code and run:
   ```bash
   code --install-extension .
   ```

## Configuration

### VS Code Settings
Configure the extension through VS Code settings (`Ctrl/Cmd + ,`):

```json
{
  "zanai.serverUrl": "http://localhost:3000",
  "zanai.workspaceId": "your-workspace-id",
  "zanai.autoSync": true,
  "zanai.showNotifications": true
}
```

### Required Settings
- **`zanai.serverUrl`**: URL of your Zanai server (default: `http://localhost:3000`)
- **`zanai.workspaceId`**: Your Zanai workspace ID (get from web interface)

### Optional Settings
- **`zanai.autoSync`**: Automatically sync context when files change (default: `true`)
- **`zanai.showNotifications`**: Show notifications for agent activities (default: `true`)

## Usage

### Getting Started
1. **Connect to Server**: Press `Ctrl+Shift+P` and run `Zanai: Connect to Server`
2. **Configure Workspace**: Enter your workspace ID when prompted
3. **Explore Agents**: Check the "Zanai Agents" view in the explorer

### Basic Operations

#### Connect to Server
- Command: `Zanai: Connect to Server`
- Status bar shows connection status
- Automatically loads available agents

#### Execute Agent
- **From Tree View**: Right-click on agent → Execute Agent
- **From Command Palette**: `Zanai: Execute Agent`
- **Double-click**: Double-click any agent in the tree view

#### Sync Context
- **Automatic**: Context syncs automatically when files change (if enabled)
- **Manual**: `Zanai: Sync Context` command
- **Real-time**: Context updates synced across all connected clients

#### View Agent Details
- **From Tree View**: Right-click on agent → View Agent Details
- Opens detailed agent information panel
- Shows agent configuration, status, and capabilities

### Advanced Features

#### Project Analysis
The extension automatically analyzes your project:
- **Technology Detection**: Identifies frameworks, libraries, and tools
- **Architecture Analysis**: Detects patterns and project structure
- **Dependency Mapping**: Tracks project dependencies
- **Code Complexity**: Analyzes code complexity metrics

#### Context Persistence
- **Agent Memory**: Agents remember past interactions and learn from them
- **Project Context**: Maintains project-specific knowledge
- **Pattern Learning**: Identifies and remembers code patterns
- **Decision Tracking**: Records architectural and implementation decisions

#### Real-time Collaboration
- **Multi-client Support**: Multiple VS Code instances can connect
- **Context Sharing**: Context shared between VS Code and web interface
- **Live Updates**: Real-time updates across all connected clients
- **Synchronized Execution**: Agent executions visible to all clients

## Commands

| Command | Description |
|---------|-------------|
| `Zanai: Connect to Server` | Connect to Zanai server |
| `Zanai: Disconnect` | Disconnect from server |
| `Zanai: Sync Context` | Manually sync current context |
| `Zanai: Execute Agent` | Execute selected agent |
| `Zanai: Show Available Agents` | List available agents |
| `Zanai: Open Web Interface` | Open Zanai web interface |
| `Zanai: Refresh Agents` | Refresh agent list |
| `Zanai: View Agent Details` | View detailed agent information |

## API Reference

### WebSocket Events
The extension uses WebSocket events for real-time communication:

#### Client → Server
- `register_workspace`: Register client to workspace
- `vscode_context_sync`: Sync VS Code context
- `execute_agent`: Execute an agent
- `request_context_update`: Request context update
- `workspace_message`: Send message to workspace

#### Server → Client
- `connected`: Connection established
- `vscode_context_update`: Context updated
- `agent_execution_started`: Agent execution started
- `agent_execution_completed`: Agent execution completed
- `agent_execution_error`: Agent execution failed
- `context_update_requested`: Context update requested
- `workspace_message`: Workspace message received

### HTTP API
The extension also uses HTTP API endpoints:

#### Endpoints
- `POST /api/vscode`: VS Code integration operations
- `POST /api/context`: Context persistence operations
- `POST /api/code-analysis`: Code analysis operations

## Development

### Project Structure
```
vscode-extension/
├── src/
│   ├── extension.ts          # Main extension entry point
│   └── agentProvider.ts      # Agent tree view provider
├── package.json              # Extension manifest
├── tsconfig.json            # TypeScript configuration
└── README.md               # This file
```

### Building
```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Run tests
npm test
```

### Debugging
1. Open the extension folder in VS Code
2. Press `F5` to launch a new VS Code instance with the extension loaded
3. Use the debugger to set breakpoints and inspect code

## Troubleshooting

### Common Issues

#### Connection Failed
- **Problem**: Cannot connect to Zanai server
- **Solution**: 
  - Check if server is running at the specified URL
  - Verify server URL in settings
  - Check network connectivity

#### Workspace ID Not Found
- **Problem**: Invalid workspace ID
- **Solution**: 
  - Get correct workspace ID from Zanai web interface
  - Update workspace ID in settings

#### Agents Not Loading
- **Problem**: No agents appear in tree view
- **Solution**: 
  - Ensure you're connected to server
  - Check workspace permissions
  - Refresh agent list

#### Context Sync Issues
- **Problem**: Context not syncing properly
- **Solution**: 
  - Check file permissions
  - Verify auto-sync is enabled
  - Try manual sync

### Debug Mode
Enable debug logging by setting:
```json
{
  "zanai.debug": true
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please:
1. Check the [troubleshooting section](#troubleshooting)
2. Open an issue on GitHub
3. Join our community discussions

---

**Zanai VS Code Extension** - Bringing AI-powered development assistance directly to your editor! 🚀