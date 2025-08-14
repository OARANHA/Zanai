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

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [isCreateAgentOpen, setIsCreateAgentOpen] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
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

  useEffect(() => {
    // Carregar dados iniciais
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
                alt="UrbanDev Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold">UrbanDev - Sistema de Gestão Urbana</h1>
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
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
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
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Criar Composição
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Exemplo de Composição</CardTitle>
                  <CardDescription>
                    Combinação de agentes para análise completa de projetos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="outline">Analisador de Código</Badge>
                    <Badge variant="outline">Gerador de API</Badge>
                    <Badge variant="outline">Assistente de Documentação</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-muted-foreground">3 agentes</span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                  <div className={`w-3 h-3 rounded-full ${executionResult.success ? 'bg-green-500' : 'bg-red-500'}`} />
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