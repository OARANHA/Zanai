'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Play, Archive, Clock, Settings, Zap, Filter, Search } from 'lucide-react';
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

interface Composition {
  id: string;
  name: string;
  description: string;
  agents: string[];
  status: 'active' | 'inactive';
  workspaceId: string;
  createdAt: string;
  lastExecuted?: string;
  executionCount?: number;
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function CompositionsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [isCreateCompositionOpen, setIsCreateCompositionOpen] = useState(false);
  const [newComposition, setNewComposition] = useState({
    name: '',
    description: '',
    agents: [] as string[]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'lastExecuted'>('created');
  const [isExecuting, setIsExecuting] = useState<string | null>(null);

  useEffect(() => {
    loadWorkspaces();
    loadAgents();
    loadCompositions();
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

  const executeComposition = async (composition: Composition) => {
    setIsExecuting(composition.id);
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
      
      // Update composition with execution info
      setCompositions(prev => prev.map(c => 
        c.id === composition.id 
          ? { 
              ...c, 
              lastExecuted: new Date().toISOString(),
              executionCount: (c.executionCount || 0) + 1
            }
          : c
      ));
    } catch (error) {
      console.error('Erro ao executar composição:', error);
    } finally {
      setIsExecuting(null);
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

  // Filter and sort compositions
  const filteredCompositions = compositions
    .filter(composition => {
      const matchesSearch = composition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           composition.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || composition.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastExecuted':
          if (!a.lastExecuted && !b.lastExecuted) return 0;
          if (!a.lastExecuted) return 1;
          if (!b.lastExecuted) return -1;
          return new Date(b.lastExecuted).getTime() - new Date(a.lastExecuted).getTime();
        case 'created':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

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
              <Link href="/agents" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Agentes
              </Link>
              <Link href="/specialists" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Especialistas
              </Link>
              <Link href="/compositions" className="text-sm font-medium text-primary">
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
            <h1 className="text-3xl font-bold">Composição de Agentes</h1>
            <p className="text-muted-foreground mt-2">
              Combine múltiplos agentes para criar fluxos de trabalho complexos
            </p>
          </div>
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
                  <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                    {agents.filter(agent => agent.status === 'active').map((agent) => (
                      <div key={agent.id} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
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
                        <label htmlFor={'agent-' + agent.id} className="text-sm cursor-pointer flex-1">
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-muted-foreground text-xs">{agent.description}</div>
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

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar composições..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="inactive">Inativas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: 'name' | 'created' | 'lastExecuted') => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="created">Data Criação</SelectItem>
                <SelectItem value="lastExecuted">Última Execução</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Composições</p>
                  <p className="text-2xl font-bold">{compositions.length}</p>
                </div>
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ativas</p>
                  <p className="text-2xl font-bold">{compositions.filter(c => c.status === 'active').length}</p>
                </div>
                <Zap className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Execuções Totais</p>
                  <p className="text-2xl font-bold">
                    {compositions.reduce((sum, c) => sum + (c.executionCount || 0), 0)}
                  </p>
                </div>
                <Play className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompositions.map((composition) => (
            <Card key={composition.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{composition.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className={'w-3 h-3 rounded-full ' + (composition.status === 'active' ? 'bg-green-500' : 'bg-gray-500')} />
                    <Badge variant={composition.status === 'active' ? 'default' : 'secondary'}>
                      {composition.status === 'active' ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                </div>
                <CardDescription>{composition.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Agentes na composição:</p>
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
                  
                  {/* Execution Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                    <div className="flex items-center space-x-4">
                      {composition.executionCount && composition.executionCount > 0 && (
                        <div className="flex items-center space-x-1">
                          <Play className="w-3 h-3" />
                          <span>{composition.executionCount} execuções</span>
                        </div>
                      )}
                      {composition.lastExecuted && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Executada {new Date(composition.lastExecuted).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-muted-foreground">
                    Criado em {new Date(composition.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => executeComposition(composition)}
                      disabled={composition.status !== 'active' || isExecuting === composition.id}
                      title={composition.status !== 'active' ? "Composição inativa" : "Executar composição"}
                    >
                      {isExecuting === composition.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => toggleArchiveComposition(composition)}
                      title={composition.status === 'active' ? "Arquivar composição" : "Ativar composição"}
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCompositions.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {compositions.length === 0 ? "Nenhuma composição encontrada" : "Nenhuma composição corresponde aos filtros"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {compositions.length === 0 
                ? "Crie sua primeira composição combinando múltiplos agentes para fluxos de trabalho complexos."
                : "Tente ajustar seus filtros para encontrar composições."
              }
            </p>
            {compositions.length === 0 && (
              <Dialog open={isCreateCompositionOpen} onOpenChange={setIsCreateCompositionOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Composição
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </div>
        )}
      </main>
    </div>
  );
}