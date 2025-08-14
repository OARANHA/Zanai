'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Brain, Plus, Settings, Play, Archive } from 'lucide-react';
import EditAgentDialog from '@/components/agents/EditAgentDialog';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'template' | 'custom' | 'composed';
  config: string;
  knowledge?: string;
  status: 'active' | 'inactive' | 'training';
  workspaceId: string;
  workspace?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [isCreateAgentOpen, setIsCreateAgentOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    type: 'template' as const,
    config: '',
    knowledge: ''
  });

  useEffect(() => {
    loadWorkspaces();
    loadAgents();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const response = await fetch('/api/workspaces');
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
        if (data.length > 0) {
          setSelectedWorkspace(data[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar workspaces:', error);
    }
  };

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error('Erro ao carregar agentes:', error);
    }
  };

  const createAgent = async () => {
    if (!newAgent.name || !selectedWorkspace) return;

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newAgent,
          workspaceId: selectedWorkspace,
        }),
      });

      if (response.ok) {
        await loadAgents();
        setIsCreateAgentOpen(false);
        setNewAgent({
          name: '',
          description: '',
          type: 'template',
          config: '',
          knowledge: ''
        });
      }
    } catch (error) {
      console.error('Erro ao criar agente:', error);
    }
  };

  const toggleArchiveAgent = async (agent: Agent) => {
    try {
      const response = await fetch('/api/agents/' + agent.id + '/archive', {
        method: 'PATCH',
      });

      if (response.ok) {
        await loadAgents();
      }
    } catch (error) {
      console.error('Erro ao arquivar/desarquivar agente:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'training': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'template': return 'bg-blue-100 text-blue-800';
      case 'custom': return 'bg-purple-100 text-purple-800';
      case 'composed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-10 h-10">
                <img
                  src="/hippocampus-logo.png"
                  alt="Zanai Project Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-xl font-bold">Zanai Project</h1>
            </Link>
            <nav className="flex space-x-4">
              <Link href="/agents" className="text-sm font-medium text-primary">
                Agentes
              </Link>
              <Link href="/specialists" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Especialistas
              </Link>
              <Link href="/compositions" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Composições
              </Link>
              <Link href="/learning" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Aprendizado
              </Link>
              <Link href="/studio" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Visual Studio
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecione um workspace" />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((workspace) => (
                  <SelectItem key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Agentes Inteligentes</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie seus agentes de IA e suas configurações
            </p>
          </div>
          <Dialog open={isCreateAgentOpen} onOpenChange={setIsCreateAgentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Agente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Agente</DialogTitle>
                <DialogDescription>
                  Crie um novo agente inteligente com configuração personalizada.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <Input
                      value={newAgent.name}
                      onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                      placeholder="Nome do agente"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tipo</label>
                    <Select value={newAgent.type} onValueChange={(value: any) => setNewAgent({ ...newAgent, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="template">Template</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                        <SelectItem value="composed">Composed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    value={newAgent.description}
                    onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                    placeholder="Descrição do agente"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Configuração (YAML)</label>
                  <Textarea
                    value={newAgent.config}
                    onChange={(e) => setNewAgent({ ...newAgent, config: e.target.value })}
                    placeholder="Configuração em YAML"
                    className="min-h-32 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Conhecimento (Markdown)</label>
                  <Textarea
                    value={newAgent.knowledge}
                    onChange={(e) => setNewAgent({ ...newAgent, knowledge: e.target.value })}
                    placeholder="Conhecimento em Markdown"
                    className="min-h-32"
                  />
                </div>
                <Button onClick={createAgent} className="w-full">
                  Criar Agente
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className={'w-3 h-3 rounded-full ' + getStatusColor(agent.status)} />
                    <Badge className={getTypeColor(agent.type)}>
                      {agent.type}
                    </Badge>
                  </div>
                </div>
                <CardDescription>{agent.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Criado em {new Date(agent.createdAt).toLocaleDateString()}</span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Play className="w-4 h-4" />
                    </Button>
                    <EditAgentDialog agent={agent} onAgentUpdated={loadAgents}>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </EditAgentDialog>
                    <Button size="sm" variant="outline" onClick={() => toggleArchiveAgent(agent)}>
                      {agent.status === 'active' ? <Archive className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {agents.length === 0 && (
          <div className="text-center py-12">
            <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum agente encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro agente inteligente para começar a usar o sistema.
            </p>
            <Dialog open={isCreateAgentOpen} onOpenChange={setIsCreateAgentOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Agente
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        )}
      </main>
    </div>
  );
}