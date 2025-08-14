import * as vscode from 'vscode';
import axios from 'axios';

interface Agent {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
}

export class AgentProvider implements vscode.TreeDataProvider<AgentItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<AgentItem | undefined | null | void> = new vscode.EventEmitter<AgentItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<AgentItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private agents: Agent[] = [];
  private workspaceId: string = '';
  private serverUrl: string = '';

  constructor() {
    this.loadConfiguration();
  }

  private loadConfiguration() {
    const config = vscode.workspace.getConfiguration('zanai');
    this.workspaceId = config.get('workspaceId', '');
    this.serverUrl = config.get('serverUrl', 'http://localhost:3000');
  }

  refresh(): void {
    this.loadConfiguration();
    this.loadAgents();
  }

  async loadAgents() {
    if (!this.workspaceId) {
      return;
    }

    try {
      const response = await axios.post(`${this.serverUrl}/api/vscode`, {
        action: 'get_agents',
        workspaceId: this.workspaceId
      });

      this.agents = response.data.agents;
      this._onDidChangeTreeData.fire();
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  }

  getTreeItem(element: AgentItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: AgentItem): Thenable<AgentItem[]> {
    if (!element) {
      return Promise.resolve(this.getAgents());
    }
    return Promise.resolve([]);
  }

  private getAgents(): AgentItem[] {
    return this.agents.map(agent => new AgentItem(
      agent,
      vscode.TreeItemCollapsibleState.None
    ));
  }

  async executeAgent(agentId: string) {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) {
      vscode.window.showErrorMessage('Agent not found');
      return;
    }

    const input = await vscode.window.showInputBox({
      prompt: `Enter input for ${agent.name}`,
      placeHolder: 'What do you want the agent to do?'
    });

    if (!input) return;

    try {
      await axios.post(`${this.serverUrl}/api/vscode`, {
        action: 'execute_agent',
        data: {
          agentId: agent.id,
          input: input,
          context: {} // Context would be provided by VS Code extension
        },
        workspaceId: this.workspaceId
      });

      vscode.window.showInformationMessage(`Executing ${agent.name}...`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to execute agent: ${error.message}`);
    }
  }

  async viewAgentDetails(agentId: string) {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) return;

    const panel = vscode.window.createWebviewPanel(
      'agentDetails',
      `Agent: ${agent.name}`,
      vscode.ViewColumn.Beside,
      {}
    );

    panel.webview.html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Agent Details</title>
        <style>
          body { font-family: var(--vscode-font-family); padding: 20px; }
          h1 { color: var(--vscode-foreground); }
          h2 { color: var(--vscode-foreground); border-bottom: 1px solid var(--vscode-panel-border); }
          .info { margin: 10px 0; }
          .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
          .status.active { background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); }
          .status.inactive { background: var(--vscode-errorForeground); color: var(--vscode-editor-background); }
          button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 8px 16px; margin: 4px; cursor: pointer; }
          button:hover { background: var(--vscode-button-hoverBackground); }
        </style>
      </head>
      <body>
        <h1>${agent.name}</h1>
        
        <div class="info">
          <strong>Type:</strong> ${agent.type}
        </div>
        
        <div class="info">
          <strong>Status:</strong> 
          <span class="status ${agent.status}">${agent.status}</span>
        </div>
        
        <div class="info">
          <strong>Description:</strong> ${agent.description || 'No description available'}
        </div>
        
        <h2>Actions</h2>
        <button onclick="executeAgent()">Execute Agent</button>
        <button onclick="closePanel()">Close</button>
        
        <script>
          const vscode = acquireVsCodeApi();
          
          function executeAgent() {
            vscode.postMessage({
              command: 'executeAgent',
              agentId: '${agent.id}'
            });
          }
          
          function closePanel() {
            vscode.postMessage({
              command: 'closePanel'
            });
          }
          
          window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
              case 'updateStatus':
                document.querySelector('.status').textContent = message.status;
                document.querySelector('.status').className = 'status ' + message.status.toLowerCase();
                break;
            }
          });
        </script>
      </body>
      </html>
    `;

    panel.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'executeAgent':
          await this.executeAgent(message.agentId);
          break;
        case 'closePanel':
          panel.dispose();
          break;
      }
    });
  }
}

class AgentItem extends vscode.TreeItem {
  constructor(
    public readonly agent: Agent,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(agent.name, collapsibleState);
    this.tooltip = `${agent.name} (${agent.type})`;
    this.description = agent.description;
    this.contextValue = agent.status;
    
    // Set icon based on status
    this.iconPath = new vscode.ThemeIcon(
      agent.status === 'active' ? 'shield' : 'shield-off'
    );
    
    // Set command for double-click
    this.command = {
      command: 'zanai.executeAgent',
      title: 'Execute Agent',
      arguments: [agent.id]
    };
  }
}