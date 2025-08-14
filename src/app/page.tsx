'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Users, Target, BookOpen, Plus, Settings, Play, Pause, Archive, MessageSquare, Sparkles, Shield, Building } from 'lucide-react';

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

  const activeAgents = agents.filter(agent => agent.status === 'active').length;
  const totalAgents = agents.length;

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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total de Agentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalAgents}</div>
              <p className="text-sm text-muted-foreground">Agentes cadastrados</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agentes Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{activeAgents}</div>
              <p className="text-sm text-muted-foreground">Em operação</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workspaces</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{workspaces.length}</div>
              <p className="text-sm text-muted-foreground">Ambientes ativos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Eficiência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">98%</div>
              <p className="text-sm text-muted-foreground">Sistema operacional</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Navigation */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>Visão Geral</span>
            </TabsTrigger>
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
            <TabsTrigger value="studio" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Visual Studio</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Bem-vindo ao Zanai Project</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Sistema completo de gestão de agentes de IA para automação de processos, 
                geração de especialistas e composição de fluxos de trabalho complexos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/agents">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Brain className="w-8 h-8 text-blue-600" />
                      <CardTitle className="text-lg">Agentes Inteligentes</CardTitle>
                    </div>
                    <CardDescription>
                      Gerencie seus agentes de IA com configurações avançadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{totalAgents} agentes</span>
                      <Badge variant="outline">{activeAgents} ativos</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/specialists">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-8 h-8 text-purple-600" />
                      <CardTitle className="text-lg">Gerador de Especialistas</CardTitle>
                    </div>
                    <CardDescription>
                      Crie especialistas personalizados usando IA para diversas áreas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">12 categorias</span>
                      <Badge variant="outline">IA Powered</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/compositions">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Users className="w-8 h-8 text-green-600" />
                      <CardTitle className="text-lg">Composição de Agentes</CardTitle>
                    </div>
                    <CardDescription>
                      Combine múltiplos agentes para fluxos de trabalho complexos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Workflow</span>
                      <Badge variant="outline">Multi-agent</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/learning">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-8 h-8 text-orange-600" />
                      <CardTitle className="text-lg">Sistema de Aprendizado</CardTitle>
                    </div>
                    <CardDescription>
                      Acompanhe métricas e evolução do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Analytics</span>
                      <Badge variant="outline">Real-time</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/studio">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Target className="w-8 h-8 text-red-600" />
                      <CardTitle className="text-lg">Visual Studio</CardTitle>
                    </div>
                    <CardDescription>
                      Ambiente de desenvolvimento integrado com IA
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">IDE</span>
                      <Badge variant="outline">AI Enhanced</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-8 h-8 text-gray-600" />
                    <CardTitle className="text-lg">Segurança</CardTitle>
                  </div>
                  <CardDescription>
                    Controle de acesso e criptografia de dados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Enterprise</span>
                    <Badge variant="outline">Seguro</Badge>
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
                <Button>
                  Ver Todos os Agentes
                  <Brain className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.slice(0, 3).map((agent) => (
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
                  <Button>
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
                <Button>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Abrir Gerador
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
                <Button size="lg">
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
                <Button>
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
                <Button size="lg">
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
                <Button>
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
                <Button size="lg">
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