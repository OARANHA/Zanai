'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Users, Target, BookOpen, Plus, Settings, Play, Pause, Archive, MessageSquare, Sparkles, Shield, Building, Loader2, TrendingUp, Activity, Zap } from 'lucide-react';

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

interface SpecialistCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface SpecialistTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  skills: string[];
  useCases: string[];
  created: string;
}

interface Composition {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  workspaceId: string;
  agents?: any[];
}
export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [specialists, setSpecialists] = useState<SpecialistTemplate[]>([]);
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug: Log component state
  console.log('Component state:', {
    agents: agents.length,
    workspaces: workspaces.length,
    specialists: specialists.length,
    compositions: compositions.length,
    loading,
    error
  });

  // Funções de carregamento de dados
  const loadWorkspaces = async () => {
    try {
      console.log('Fetching workspaces from API...');
      const response = await fetch('/api/workspaces');
      console.log('Workspaces API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Workspaces data received:', data);
        setWorkspaces(data);
      } else {
        console.error('Workspaces API response not ok:', response.status);
        throw new Error(`API response: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao carregar workspaces:', error);
      // Fallback para dados de teste
      setWorkspaces([
        {
          id: 'test-workspace',
          name: 'Workspace Principal',
          description: 'Ambiente de trabalho principal',
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  const loadAgents = async () => {
    try {
      console.log('Fetching agents from API...');
      const response = await fetch('/api/agents');
      console.log('Agents API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Agents data received:', data);
        setAgents(data);
      } else {
        console.error('Agents API response not ok:', response.status);
        throw new Error(`API response: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao carregar agentes:', error);
      // Fallback para dados de teste
      setAgents([
        {
          id: 'test-agent',
          name: 'Agente de Teste',
          description: 'Agente para demonstração',
          type: 'template' as const,
          config: '',
          status: 'active' as const,
          workspaceId: 'test-workspace',
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };
    const loadCompositions = async () => {
    try {
      console.log('Fetching compositions from API...');
      const response = await fetch('/api/compositions');
      console.log('Compositions API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Compositions data received:', data);
        // Mapear os dados para o formato esperado
        const mappedCompositions = data.map((comp: any) => ({
          id: comp.id,
          name: comp.name,
          description: comp.description,
          status: comp.status,
          createdAt: comp.createdAt,
          updatedAt: comp.updatedAt,
          workspaceId: comp.workspaceId,
          agents: comp.agents || []
        }));
        setCompositions(mappedCompositions);
      } else {
        console.error('Compositions API response not ok:', response.status);
        throw new Error(`API response: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao carregar composições:', error);
      // Fallback para dados de teste
      setCompositions([
        {
          id: 'test-comp-1',
          name: 'Pipeline de Desenvolvimento',
          description: 'Fluxo completo para análise e desenvolvimento',
          status: 'active' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          workspaceId: 'test-workspace',
          agents: []
        }
      ]);
    }
  };

  const loadSpecialists = async () => {
    try {
      console.log('Fetching specialists from API...');
      const response = await fetch('/api/specialists');
      console.log('Specialists API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Specialists data received:', data);
        setSpecialists(data.templates || []);
      } else {
        console.error('Specialists API response not ok:', response.status);
        throw new Error(`API response: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao carregar especialistas:', error);
      // Fallback para dados de teste
      setSpecialists([
        {
          id: 'test-1',
          name: 'Business Analyst',
          description: 'Especialista em análise de negócios',
          category: 'business',
          skills: ['Análise de Dados', 'Gestão de Projetos', 'Consultoria'],
          useCases: ['Planejamento Estratégico', 'Análise de Mercado', 'Otimização de Processos'],
          created: new Date().toISOString()
        },
        {
          id: 'test-2',
          name: 'Technical Specialist',
          description: 'Especialista em integrações técnicas',
          category: 'technical',
          skills: ['API Integration', 'Security', 'Risk Management'],
          useCases: ['Payment Integration', 'Security Audits', 'System Architecture'],
          created: new Date().toISOString()
        }
      ]);
    }
  };
    const loadData = async () => {
    console.log('Starting loadData...');
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading workspaces...');
      await loadWorkspaces();
      console.log('Workspaces loaded:', workspaces.length);
      
      console.log('Loading agents...');
      await loadAgents();
      console.log('Agents loaded:', agents.length);
      
      console.log('Loading specialists...');
      await loadSpecialists();
      console.log('Specialists loaded:', specialists.length);
      
      console.log('Loading compositions...');
      await loadCompositions();
      console.log('Compositions loaded:', compositions.length);
      
      console.log('All data loaded successfully');
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Component mounted, calling loadData...');
    loadData();
  }, []);

  // Log when data changes
  useEffect(() => {
    console.log('Data updated:', {
      agents: agents.length,
      workspaces: workspaces.length,
      specialists: specialists.length,
      compositions: compositions.length
    });
  }, [agents, workspaces, specialists, compositions]);
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

  const getCompositionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeAgents = agents.filter(agent => agent.status === 'active').length;
  const totalAgents = agents.length;
  const activeCompositions = compositions.filter(comp => comp.status === 'active').length;
  const totalCompositions = compositions.length;

  // Debug: Log calculated values
  console.log('Calculated values:', {
    activeAgents,
    totalAgents,
    activeCompositions,
    totalCompositions
  });
    // Loading state component
  const LoadingCard = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );

  // Error state component
  const ErrorState = () => (
    <div className="text-center py-12">
      <div className="text-red-500 mb-4">
        <Shield className="w-12 h-12 mx-auto" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Erro ao Carregar Dados</h3>
      <p className="text-muted-foreground mb-4">{error}</p>
      <Button onClick={loadData} variant="outline">
        <Loader2 className="w-4 h-4 mr-2" />
        Tentar Novamente
      </Button>
    </div>
  );

  // Simple test component
  const TestComponent = () => (
    <div className="p-4 bg-blue-100 rounded">
      <h3 className="font-bold">Test Component</h3>
      <p>If you can see this, the component is working!</p>
      <p>Data: Agents={totalAgents}, Workspaces={workspaces.length}</p>
    </div>
  );
    return (
    <div className="min-h-screen bg-background">
      {/* Debug info - remove later */}
      <div className="bg-yellow-100 p-2 text-sm">
        Debug: Loading: {loading ? 'Yes' : 'No'}, Error: {error || 'None'}, 
        Agents: {totalAgents}, Workspaces: {workspaces.length}, 
        Compositions: {totalCompositions}, Specialists: {specialists.length}
      </div>
      
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
            <Link href="/agents">
              <Button>
                <Brain className="w-4 h-4 mr-2" />
                Gerenciar Agentes
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Test Component - Remove later */}
        <TestComponent />
        
        {/* Stats Overview */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <ErrorState />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Total de Agentes</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalAgents}</div>
                <p className="text-sm text-muted-foreground">Agentes cadastrados</p>
                {totalAgents > 0 && (
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{activeAgents} ativos
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Agentes Ativos</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{activeAgents}</div>
                <p className="text-sm text-muted-foreground">Em operação</p>
                {totalAgents > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {Math.round((activeAgents / totalAgents) * 100)}% de eficiência
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Composições</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{totalCompositions}</div>
                <p className="text-sm text-muted-foreground">Fluxos de trabalho</p>
                {totalCompositions > 0 && (
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{activeCompositions} ativos
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Workspaces</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{workspaces.length}</div>
                <p className="text-sm text-muted-foreground">Ambientes de trabalho</p>
                {workspaces.length > 0 && (
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{workspaces.length} ativos
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
		        {/* Tabs for different sections */}
        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="agents">Agentes</TabsTrigger>
            <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
            <TabsTrigger value="compositions">Composições</TabsTrigger>
            <TabsTrigger value="specialists">Especialistas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="agents" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Agentes</h2>
              <Link href="/agents">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Agente
                </Button>
              </Link>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <LoadingCard key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                  <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                      </div>
                      <CardDescription>{agent.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <Badge className={getTypeColor(agent.type)}>
                          {agent.type === 'template' ? 'Template' : 
                           agent.type === 'custom' ? 'Custom' : 'Composed'}
                        </Badge>
                        {agent.workspace && (
                          <Badge variant="outline">
                            {agent.workspace.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {new Date(agent.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Settings className="w-3 h-3" />
                          </Button>
                          {agent.status === 'active' ? (
                            <Button size="sm" variant="outline">
                              <Pause className="w-3 h-3" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline">
                              <Play className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="workspaces" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Workspaces</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Workspace
              </Button>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <LoadingCard key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workspaces.map((workspace) => (
                  <Card key={workspace.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{workspace.name}</CardTitle>
                      <CardDescription>{workspace.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {new Date(workspace.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Settings className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Users className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="compositions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Composições</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Composição
              </Button>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => <LoadingCard key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {compositions.map((composition) => (
                  <Card key={composition.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{composition.name}</CardTitle>
                        <Badge className={getCompositionStatusColor(composition.status)}>
                          {composition.status === 'active' ? 'Ativo' : 
                           composition.status === 'draft' ? 'Rascunho' : 'Inativo'}
                        </Badge>
                      </div>
                      <CardDescription>{composition.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {composition.agents?.length || 0} agentes
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Settings className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Play className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="specialists" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Especialistas</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Especialista
              </Button>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <LoadingCard key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {specialists.map((specialist) => (
                  <Card key={specialist.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{specialist.name}</CardTitle>
                      <CardDescription>{specialist.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Habilidades:</h4>
                          <div className="flex flex-wrap gap-1">
                            {specialist.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {specialist.skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{specialist.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Casos de uso:</h4>
                          <div className="flex flex-wrap gap-1">
                            {specialist.useCases.slice(0, 2).map((useCase, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {useCase}
                              </Badge>
                            ))}
                            {specialist.useCases.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{specialist.useCases.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {new Date(specialist.created).toLocaleDateString()}
                          </span>
                          <Button size="sm" variant="outline">
                            <Sparkles className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}