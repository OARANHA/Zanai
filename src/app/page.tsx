'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Brain, Users, Target, BookOpen, Plus, Settings, Play, Pause, Archive, MessageSquare, Sparkles, Shield, Building } from 'lucide-react';
import EditAgentDialog from '@/components/agents/EditAgentDialog';

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

interface Composition {
  id: string;
  name: string;
  description: string;
  agents: string[];
  status: 'active' | 'inactive';
  workspaceId: string;
  createdAt: string;
}

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [isCreateAgentOpen, setIsCreateAgentOpen] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [isCreateCompositionOpen, setIsCreateCompositionOpen] = useState(false);
  const [isExecuteAgentOpen, setIsExecuteAgentOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [executionInput, setExecutionInput] = useState('');
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    type: 'template' as const,
    config: '',
    knowledge: ''
  });
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    description: '',
    config: '{}'
  });
  const [newComposition, setNewComposition] = useState({
    name: '',
    description: '',
    agents: [] as string[]
  });

  useEffect(() => {
    // Carregar dados iniciais
    loadWorkspaces();
    loadAgents();
    loadCompositions();
    
    // Criar dados de exemplo se não existirem
    setTimeout(() => {
      if (agents.length === 0) {
        createSampleAgents();
      }
      if (compositions.length === 0) {
        createSampleComposition();
      }
    }, 1000);
  }, []);

  const createSampleAgents = async () => {
    const sampleAgents = [
      {
        name: 'Analisador de Código',
        description: 'Analisa código fonte e identifica problemas de qualidade e segurança',
        type: 'template' as const,
        config: `model: gpt-4
temperature: 0.3
max_tokens: 2000
system_prompt: |
  Você é um especialista em análise de código.
  Analise o código fornecido e identifique:
  1. Problemas de segurança
  2. Oportunidades de otimização
  3. Boas práticas de programação
  4. Possíveis bugs`.replace(/`/g, '\\`'),
        knowledge: '# Guia de Análise de Código\n## Foco Principal\n- Segurança\n- Performance\n- Qualidade\n- Manutenibilidade',
        workspaceId: selectedWorkspace || 'default'
      },
      {
        name: 'Gerador de API',
        description: 'Cria endpoints de API RESTful a partir de especificações',
        type: 'template' as const,
        config: `model: gpt-4
temperature: 0.2
max_tokens: 3000
system_prompt: |
  Você é um especialista em desenvolvimento de APIs.
  Gere código para endpoints RESTful completos incluindo:
  1. Rotas e controladores
  2. Validação de dados
  3. Tratamento de erros
  4. Documentação`.replace(/`/g, '\\`'),
        knowledge: '# Padrões de API\n## REST\n- Métodos HTTP padrão\n- Respostas JSON\n- Códigos de status HTTP\n## Segurança\n- Validação de input\n- Autenticação',
        workspaceId: selectedWorkspace || 'default'
      },
      {
        name: 'Assistente de Documentação',
        description: 'Gera documentação técnica e guias de usuário',
        type: 'template' as const,
        config: `model: gpt-4
temperature: 0.4
max_tokens: 2500
system_prompt: |
  Você é um especialista em documentação técnica.
  Crie documentação clara e completa incluindo:
  1. Descrição funcional
  2. Guia de instalação
  3. Exemplos de uso
  4. Referência de API`.replace(/`/g, '\\`'),
        knowledge: '# Padrões de Documentação\n## Estrutura\n- Visão geral\n- Instalação\n- Uso básico\n- Exemplos avançados\n## Formatos\n- Markdown\n- Code blocks\n- Links úteis',
        workspaceId: selectedWorkspace || 'default'
      }
    ];

    for (const agent of sampleAgents) {
      try {
        await fetch('/api/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(agent),
        });
      } catch (error) {
        console.error('Erro ao criar agente de exemplo:', error);
      }
    }
    
    // Recarregar agentes após criar
    setTimeout(loadAgents, 500);
  };

  const createSampleComposition = async () => {
    // Esperar um pouco para garantir que os agentes foram criados
    setTimeout(async () => {
      const activeAgents = agents.filter(agent => agent.status === 'active');
      if (activeAgents.length >= 3) {
        const sampleComposition = {
          name: 'Pipeline Completo de Desenvolvimento',
          description: 'Fluxo completo para análise, geração e documentação de projetos',
          agents: activeAgents.slice(0, 3).map(agent => agent.id),
          workspaceId: selectedWorkspace || 'default'
        };

        try {
          await fetch('/api/compositions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(sampleComposition),
          });
          
          // Recarregar composições após criar
          setTimeout(loadCompositions, 500);
        } catch (error) {
          console.error('Erro ao criar composição de exemplo:', error);
        }
      }
    }, 1500);
  };

  const loadCompositions = async () => {
    try {
      const response = await fetch('/api/compositions');
      if (response.ok) {
        const data = await response.json();
        setCompositions(data);
      }
    } catch (error) {
      console.error('Erro ao carregar composições:', error);
    }
  };

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

  const createComposition = async () => {
    if (!newComposition.name || !selectedWorkspace) return;

    try {
      const response = await fetch('/api/compositions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newComposition,
          workspaceId: selectedWorkspace,
        }),
      });

      if (response.ok) {
        await loadCompositions();
        setIsCreateCompositionOpen(false);
        setNewComposition({
          name: '',
          description: '',
          agents: []
        });
      }
    } catch (error) {
      console.error('Erro ao criar composição:', error);
    }
  };

  const createWorkspace = async () => {
    if (!newWorkspace.name) return;

    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWorkspace),
      });

      if (response.ok) {
        await loadWorkspaces();
        setIsCreateWorkspaceOpen(false);
        setNewWorkspace({
          name: '',
          description: '',
          config: '{}'
        });
      }
    } catch (error) {
      console.error('Erro ao criar workspace:', error);
    }
  };

  const executeComposition = async (composition: Composition) => {
    try {
      const response = await fetch('/api/compositions/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          compositionId: composition.id,
          input: 'Executar composição'
        }),
      });

      const result = await response.json();
      console.log('Resultado da composição:', result);
    } catch (error) {
      console.error('Erro ao executar composição:', error);
    }
  };

  const toggleArchiveComposition = async (composition: Composition) => {
    try {
      const response = await fetch('/api/compositions/' + composition.id + '/archive', {
        method: 'PATCH',
      });

      if (response.ok) {
        await loadCompositions();
      }
    } catch (error) {
      console.error('Erro ao arquivar/desarquivar composição:', error);
    }
  };

  const executeAgent = async () => {
    if (!selectedAgent || !executionInput) return;

    setIsExecuting(true);
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          input: executionInput
        }),
      });

      const result = await response.json();
      setExecutionResult(result);
    } catch (error) {
      console.error('Erro ao executar agente:', error);
      setExecutionResult({
        success: false,
        error: 'Erro ao executar agente'
      });
    } finally {
      setIsExecuting(false);
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

  const openExecuteDialog = (agent: Agent) => {
    setSelectedAgent(agent);
    setExecutionInput('');
    setExecutionResult(null);
    setIsExecuteAgentOpen(true);
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
            <div className="relative w-10 h-10">
              <img
                src="/hippocampus-logo.png"
                alt="Zanai Project Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold">Zanai Project - Sistema de Gestão de IA</h1>
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
            <Dialog open={isCreateWorkspaceOpen} onOpenChange={setIsCreateWorkspaceOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Workspace
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Workspace</DialogTitle>
                  <DialogDescription>
                    Crie um novo workspace para organizar seus agentes e composições.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <Input
                      value={newWorkspace.name}
                      onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                      placeholder="Nome do workspace"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea
                      value={newWorkspace.description}
                      onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                      placeholder="Descrição do workspace"
                    />
                  </div>
                  <Button onClick={createWorkspace} className="w-full">
                    Criar Workspace
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="agents" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>Agentes</span>
            </TabsTrigger>
            <TabsTrigger value="specialists" className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>Especialistas</span>
            </TabsTrigger>
            <TabsTrigger value="composition" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Composição</span>
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Aprendizado</span>
            </TabsTrigger>
            <TabsTrigger value="studio" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Visual Studio</span>
            </TabsTrigger>
          </TabsList>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Agentes Inteligentes</h2>
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
                        <Button size="sm" variant="outline" onClick={() => openExecuteDialog(agent)}>
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
          </TabsContent>

          {/* Specialists Tab */}
          <TabsContent value="specialists" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Gerador de Especialistas</h2>
                <p className="text-muted-foreground mt-2">
                  Crie agentes especialistas personalizados usando IA para diversas áreas de negócio
                </p>
              </div>
              <Link href="/specialists">
                <Button>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Abrir Gerador de Especialistas
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">📊</span>
                    <CardTitle className="text-lg">Business Specialists</CardTitle>
                  </div>
                  <CardDescription>
                    Analistas de negócio, especialistas em marketing e automação de vendas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="secondary">Business Analyst</Badge>
                    <Badge variant="secondary">Marketing Specialist</Badge>
                    <Badge variant="secondary">Sales Automator</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">⚙️</span>
                    <CardTitle className="text-lg">Technical Specialists</CardTitle>
                  </div>
                  <CardDescription>
                    Especialistas em integrações técnicas, segurança e gestão de riscos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="secondary">Payment Integration</Badge>
                    <Badge variant="secondary">Risk Manager</Badge>
                    <Badge variant="secondary">Security Specialist</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">✍️</span>
                    <CardTitle className="text-lg">Content Specialists</CardTitle>
                  </div>
                  <CardDescription>
                    Especialistas em criação de conteúdo, SEO e copywriting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="secondary">Content Marketer</Badge>
                    <Badge variant="secondary">Copywriter</Badge>
                    <Badge variant="secondary">SEO Specialist</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">⚖️</span>
                    <CardTitle className="text-lg">Legal Specialists</CardTitle>
                  </div>
                  <CardDescription>
                    Especialistas em aspectos legais e conformidade regulatória
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="secondary">Legal Advisor</Badge>
                    <Badge variant="secondary">Compliance Officer</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center py-8">
              <Link href="/specialists">
                <Button size="lg">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Gerar Novos Especialistas com IA
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Composition Tab */}
          <TabsContent value="composition" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Composição de Agentes</h2>
              <Dialog open={isCreateCompositionOpen} onOpenChange={setIsCreateCompositionOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Composição
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Nova Composição</DialogTitle>
                    <DialogDescription>
                      Combine múltiplos agentes para criar fluxos de trabalho complexos.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Nome</label>
                      <Input
                        value={newComposition.name}
                        onChange={(e) => setNewComposition({ ...newComposition, name: e.target.value })}
                        placeholder="Nome da composição"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Descrição</label>
                      <Textarea
                        value={newComposition.description}
                        onChange={(e) => setNewComposition({ ...newComposition, description: e.target.value })}
                        placeholder="Descrição da composição"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Agentes Disponíveis</label>
                      <div className="space-y-2 mt-2">
                        {agents.filter(agent => agent.status === 'active').map((agent) => (
                          <div key={agent.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={'agent-' + agent.id}
                              checked={newComposition.agents.includes(agent.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewComposition({
                                    ...newComposition,
                                    agents: [...newComposition.agents, agent.id]
                                  });
                                } else {
                                  setNewComposition({
                                    ...newComposition,
                                    agents: newComposition.agents.filter(id => id !== agent.id)
                                  });
                                }
                              }}
                            />
                            <label htmlFor={'agent-' + agent.id} className="text-sm">
                              {agent.name} - {agent.description}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button onClick={createComposition} className="w-full">
                      Criar Composição
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {compositions.map((composition) => (
                <Card key={composition.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{composition.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <div className={'w-3 h-3 rounded-full ' + (composition.status === 'active' ? 'bg-green-500' : 'bg-gray-500')} />
                        <Badge variant={composition.status === 'active' ? 'default' : 'secondary'}>
                          {composition.status}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{composition.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Agentes na composição:</p>
                      <div className="flex flex-wrap gap-1">
                        {composition.agents.map((agentId) => {
                          const agent = agents.find(a => a.id === agentId);
                          return agent ? (
                            <Badge key={agentId} variant="outline" className="text-xs">
                              {agent.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-muted-foreground">
                        Criado em {new Date(composition.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => executeComposition(composition)}>
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toggleArchiveComposition(composition)}>
                          {composition.status === 'active' ? <Archive className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {compositions.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma composição encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  Crie sua primeira composição combinando múltiplos agentes para fluxos de trabalho complexos.
                </p>
                <Dialog open={isCreateCompositionOpen} onOpenChange={setIsCreateCompositionOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeira Composição
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            )}
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Sistema de Aprendizado</h2>
              <Button>
                <BookOpen className="w-4 h-4 mr-2" />
                Ver Estatísticas
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total de Execuções</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">0</div>
                  <p className="text-sm text-muted-foreground">Execuções realizadas</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Taxa de Sucesso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">100%</div>
                  <p className="text-sm text-muted-foreground">Sucesso nas execuções</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Agentes Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{agents.length}</div>
                  <p className="text-sm text-muted-foreground">Agentes em aprendizado</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tempo Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">0ms</div>
                  <p className="text-sm text-muted-foreground">Tempo de execução</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Registros de Aprendizado Recentes</CardTitle>
                <CardDescription>
                  Atividades de aprendizado dos agentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Nenhum registro ainda</h4>
                      <p className="text-sm text-muted-foreground">
                        Os registros aparecerão aqui quando os agentes começarem a executar
                      </p>
                    </div>
                    <Badge variant="outline">Aguardando</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visual Studio Tab */}
          <TabsContent value="studio" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Visual Agent Studio</h2>
              <Button>
                <Target className="w-4 h-4 mr-2" />
                Abrir Studio
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Canvas Visual</CardTitle>
                  <CardDescription>
                    Arraste e solte agentes para criar composições visuais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 mb-4">Arraste agentes para esta área</p>
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Agente
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Propriedades do Agente</CardTitle>
                  <CardDescription>
                    Configure as propriedades do agente selecionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Nome</label>
                      <Input placeholder="Selecione um agente" disabled />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Descrição</label>
                      <Textarea placeholder="Selecione um agente" disabled />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Configuração</label>
                      <Textarea placeholder="Selecione um agente" disabled className="min-h-32 font-mono text-sm" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Execute Agent Dialog */}
      <Dialog open={isExecuteAgentOpen} onOpenChange={setIsExecuteAgentOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Executar Agente: {selectedAgent?.name}</DialogTitle>
            <DialogDescription>
              Interaja com o agente inteligente para obter respostas e assistência.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Input</label>
              <Textarea
                value={executionInput}
                onChange={(e) => setExecutionInput(e.target.value)}
                placeholder="Digite sua pergunta ou comando para o agente..."
                className="min-h-24"
              />
            </div>
            
            <div className="flex justify-between items-center">
              <Button 
                onClick={executeAgent} 
                disabled={!executionInput || isExecuting}
                className="flex items-center space-x-2"
              >
                {isExecuting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Executando...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    <span>Executar</span>
                  </>
                )}
              </Button>
              
              {executionResult && (
                <div className="text-sm text-muted-foreground">
                  Tempo de execução: {executionResult.executionTime}ms
                </div>
              )}
            </div>

            {executionResult && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={'w-3 h-3 rounded-full ' + (executionResult.success ? 'bg-green-500' : 'bg-red-500')} />
                  <span className="font-medium">
                    {executionResult.success ? 'Execução bem-sucedida' : 'Erro na execução'}
                  </span>
                </div>
                
                {executionResult.success ? (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">{executionResult.output}</pre>
                  </div>
                ) : (
                  <div className="bg-red-50 p-3 rounded-md">
                    <p className="text-sm text-red-800">{executionResult.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}