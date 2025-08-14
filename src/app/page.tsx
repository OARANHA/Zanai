'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, BookOpen, Brain, Building, Loader2, Plus, Shield, Sparkles, Target, TrendingUp, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
  const [isClient, setIsClient] = useState(false);

  // Garantir que o código só execute no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Só carregar dados se estiver no cliente
  useEffect(() => {
    if (isClient) {
      console.log('Component mounted on client, calling loadData...');
      loadData();
    }
  }, [isClient]);

  // Debug: Log component state - apenas no cliente
  if (isClient) {
    console.log('Component state:', {
      agents: agents.length,
      workspaces: workspaces.length,
      specialists: specialists.length,
      compositions: compositions.length,
      loading,
      error
    });
  }

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
        return data;
      } else {
        console.error('Workspaces API response not ok:', response.status);
        throw new Error(`API response: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao carregar workspaces:', error);
      // Fallback para dados de teste
      const fallbackData = [{
        id: 'test-workspace',
        name: 'Workspace Principal',
        description: 'Ambiente de trabalho principal',
        createdAt: new Date().toISOString()
      }];
      setWorkspaces(fallbackData);
      return fallbackData;
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
        return data;
      } else {
        console.error('Agents API response not ok:', response.status);
        throw new Error(`API response: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao carregar agentes:', error);
      // Fallback para dados de teste
      const fallbackData = [{
        id: 'test-agent',
        name: 'Agente de Teste',
        description: 'Agente para demonstração',
        type: 'template' as const,
        config: '',
        status: 'active' as const,
        workspaceId: 'test-workspace',
        createdAt: new Date().toISOString()
      }];
      setAgents(fallbackData);
      return fallbackData;
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
        return mappedCompositions;
      } else {
        console.error('Compositions API response not ok:', response.status);
        throw new Error(`API response: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao carregar composições:', error);
      // Fallback para dados de teste
      const fallbackData = [{
        id: 'test-comp-1',
        name: 'Pipeline de Desenvolvimento',
        description: 'Fluxo completo para análise e desenvolvimento',
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        workspaceId: 'test-workspace',
        agents: []
      }];
      setCompositions(fallbackData);
      return fallbackData;
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
        return data.templates || [];
      } else {
        console.error('Specialists API response not ok:', response.status);
        throw new Error(`API response: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao carregar especialistas:', error);
      // Fallback para dados de teste
      const fallbackData = [
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
      ];
      setSpecialists(fallbackData);
      return fallbackData;
    }
  };

  const loadData = async () => {
    console.log('Starting loadData...');
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading all data in parallel...');
      // Carregar todos os dados em paralelo
      const [workspacesData, agentsData, specialistsData, compositionsData] = await Promise.all([
        loadWorkspaces(),
        loadAgents(),
        loadSpecialists(),
        loadCompositions()
      ]);
      
      console.log('All data loaded successfully:', {
        workspaces: workspacesData?.length || 0,
        agents: agentsData?.length || 0,
        specialists: specialistsData?.length || 0,
        compositions: compositionsData?.length || 0
      });
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Log when data changes - apenas no cliente
  useEffect(() => {
    if (isClient) {
      console.log('Data updated:', {
        agents: agents.length,
        workspaces: workspaces.length,
        specialists: specialists.length,
        compositions: compositions.length
      });
      console.log('Actual data:', {
        agents,
        workspaces,
        specialists,
        compositions
      });
    }
  }, [agents, workspaces, specialists, compositions, isClient]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Debug info - remove later */}
      <div className="bg-yellow-100 dark:bg-yellow-900 p-2 text-sm border-b">
        Debug: Loading: {loading ? 'Yes' : 'No'}, Error: {error || 'None'}, 
        Agents: {totalAgents}, Workspaces: {workspaces.length}, 
        Compositions: {totalCompositions}, Specialists: {specialists.length}
      </div>
      
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative w-10 h-10">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Zanai Project
              </h1>
              <p className="text-sm text-muted-foreground">Sistema de Gestão de IA</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/agents">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Brain className="w-4 h-4 mr-2" />
                Gerenciar Agentes
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
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
            <Card className="border-l-4 border-l-blue-500 bg-white dark:bg-slate-800 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Total de Agentes</CardTitle>
                <Brain className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{totalAgents}</div>
                <p className="text-sm text-muted-foreground">Agentes cadastrados</p>
                {totalAgents > 0 && (
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{activeAgents} ativos
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500 bg-white dark:bg-slate-800 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Agentes Ativos</CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
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
            
            <Card className="border-l-4 border-l-purple-500 bg-white dark:bg-slate-800 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Composições</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
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
            
            <Card className="border-l-4 border-l-orange-500 bg-white dark:bg-slate-800 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Workspaces</CardTitle>
                <Building className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{workspaces.length}</div>
                <p className="text-sm text-muted-foreground">Ambientes ativos</p>
                {workspaces.length > 0 && (
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <Zap className="h-3 w-3 mr-1" />
                    Todos operacionais
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Navigation */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-slate-800 p-1 rounded-lg shadow-lg">
            <TabsTrigger value="overview" className="flex items-center space-x-2 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900">
              <Brain className="w-4 h-4" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center space-x-2 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900">
              <Brain className="w-4 h-4" />
              <span>Agentes</span>
            </TabsTrigger>
            <TabsTrigger value="specialists" className="flex items-center space-x-2 data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900">
              <Sparkles className="w-4 h-4" />
              <span>Especialistas</span>
            </TabsTrigger>
            <TabsTrigger value="composition" className="flex items-center space-x-2 data-[state=active]:bg-orange-100 dark:data-[state=active]:bg-orange-900">
              <Users className="w-4 h-4" />
              <span>Composição</span>
            </TabsTrigger>
            <TabsTrigger value="studio" className="flex items-center space-x-2 data-[state=active]:bg-red-100 dark:data-[state=active]:bg-red-900">
              <Target className="w-4 h-4" />
              <span>Visual Studio</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Bem-vindo ao Zanai Project
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Sistema completo de gestão de agentes de IA para automação de processos, 
                geração de especialistas e composição de fluxos de trabalho complexos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/agents">
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-800 border-2 border-transparent hover:border-blue-500">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">Agentes Inteligentes</CardTitle>
                    </div>
                    <CardDescription>
                      Gerencie seus agentes de IA com configurações avançadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{totalAgents} agentes</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {activeAgents} ativos
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/specialists">
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-800 border-2 border-transparent hover:border-purple-500">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">Gerador de Especialistas</CardTitle>
                    </div>
                    <CardDescription>
                      Crie especialistas personalizados usando IA para diversas áreas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">12 categorias</span>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        IA Powered
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/compositions">
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-800 border-2 border-transparent hover:border-green-500">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">Composição de Agentes</CardTitle>
                    </div>
                    <CardDescription>
                      Combine múltiplos agentes para fluxos de trabalho complexos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Workflow</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Multi-agent
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/learning">
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-800 border-2 border-transparent hover:border-orange-500">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">Sistema de Aprendizado</CardTitle>
                    </div>
                    <CardDescription>
                      Acompanhe métricas e evolução do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Analytics</span>
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        Real-time
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/studio">
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-800 border-2 border-transparent hover:border-red-500">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">Visual Studio</CardTitle>
                    </div>
                    <CardDescription>
                      Ambiente de desenvolvimento integrado com IA
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">IDE</span>
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        AI Enhanced
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Card className="hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800 border-2 border-transparent hover:border-gray-500">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">Segurança</CardTitle>
                  </div>
                  <CardDescription>
                    Controle de acesso e criptografia de dados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Enterprise</span>
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      Seguro
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Agents Tab - Quick Preview */}
          <TabsContent value="agents" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Agentes Inteligentes</h2>
              <Link href="/agents">
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  Ver Todos os Agentes
                  <Brain className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.slice(0, 3).map((agent) => (
                <Card key={agent.id} className="hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800">
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
                      <Link href="/agents">
                        <Button size="sm" variant="outline">
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {agents.length === 0 && (
              <div className="text-center py-12">
                <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Comece a usar agentes</h3>
                <p className="text-muted-foreground mb-4">
                  Crie seus primeiros agentes de IA para automatizar tarefas.
                </p>
                <Link href="/agents">
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Agente
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Specialists Tab - Quick Preview */}
          <TabsContent value="specialists" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Gerador de Especialistas</h2>
                <p className="text-muted-foreground mt-2">
                  Crie agentes especialistas personalizados usando IA para diversas áreas de negócio
                </p>
              </div>
              <Link href="/specialists">
                <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Abrir Gerador
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">📊</span>
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

              <Card className="hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">⚙️</span>
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

              <Card className="hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">✍️</span>
                    <CardTitle className="text-lg">Content Specialists</CardTitle>
                  </div>
                  <CardDescription>
                    Especialistas em marketing de conteúdo, copywriting e SEO
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
            </div>

            <div className="text-center py-8">
              <Link href="/specialists">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Gerar Novos Especialistas com IA
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Composition Tab - Quick Preview */}
          <TabsContent value="composition" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Composição de Agentes</h2>
              <Link href="/compositions">
                <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Gerenciar Composições
                </Button>
              </Link>
            </div>

            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Combine Agentes Poderosos</h3>
              <p className="text-muted-foreground mb-4">
                Cria fluxos de trabalho complexos combinando múltiplos agentes especializados
              </p>
              <Link href="/compositions">
                <Button size="lg" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                  <Users className="w-5 h-5 mr-2" />
                  Começar a Compor
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Studio Tab - Quick Preview */}
          <TabsContent value="studio" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Visual Studio</h2>
              <Link href="/studio">
                <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700">
                  <Target className="w-4 h-4 mr-2" />
                  Abrir Studio
                </Button>
              </Link>
            </div>

            <div className="text-center py-12">
              <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Desenvolvimento Amplificado por IA</h3>
              <p className="text-muted-foreground mb-4">
                Ambiente de desenvolvimento integrado com assistentes de IA inteligentes
              </p>
              <Link href="/studio">
                <Button size="lg" className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700">
                  <Target className="w-5 h-5 mr-2" />
                  Abrir Ambiente de Trabalho
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}