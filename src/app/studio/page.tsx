'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Play, Settings, Download, Upload, Code, FileText, GitBranch, Lightbulb, Zap } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description: string;
  language: string;
  framework: string;
  status: 'active' | 'inactive' | 'deployed';
  lastSynced: string;
  createdAt: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'template' | 'custom' | 'composed';
  status: 'active' | 'inactive' | 'training';
}

export default function StudioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    language: '',
    framework: ''
  });

  useEffect(() => {
    loadProjects();
    loadAgents();
  }, []);

  const loadProjects = async () => {
    try {
      // Simular projetos por enquanto
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'API de E-commerce',
          description: 'API RESTful para plataforma de e-commerce',
          language: 'TypeScript',
          framework: 'Next.js',
          status: 'active',
          lastSynced: new Date().toISOString(),
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          name: 'Dashboard Analytics',
          description: 'Dashboard de análise de dados em tempo real',
          language: 'JavaScript',
          framework: 'React',
          status: 'deployed',
          lastSynced: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setProjects(mockProjects);
      if (mockProjects.length > 0) {
        setSelectedProject(mockProjects[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    }
  };

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data.filter(agent => agent.status === 'active'));
      }
    } catch (error) {
      console.error('Erro ao carregar agentes:', error);
    }
  };

  const createProject = async () => {
    if (!newProject.name) return;

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      language: newProject.language,
      framework: newProject.framework,
      status: 'active',
      lastSynced: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    setProjects([...projects, project]);
    setIsCreateProjectOpen(false);
    setNewProject({
      name: '',
      description: '',
      language: '',
      framework: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'deployed': return 'bg-blue-500';
      default: return 'bg-gray-500';
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
              <Link href="/agents" className="text-sm font-medium text-muted-foreground hover:text-foreground">
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
              <Link href="/studio" className="text-sm font-medium text-primary">
                Visual Studio
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
              <DialogTrigger asChild>
                <Button>
                  Novo Projeto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Projeto</DialogTitle>
                  <DialogDescription>
                    Configure um novo projeto para integração com agentes de IA
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <Input
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      placeholder="Nome do projeto"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Descrição do projeto"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Linguagem</label>
                      <Input
                        value={newProject.language}
                        onChange={(e) => setNewProject({ ...newProject, language: e.target.value })}
                        placeholder="Ex: TypeScript"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Framework</label>
                      <Input
                        value={newProject.framework}
                        onChange={(e) => setNewProject({ ...newProject, framework: e.target.value })}
                        placeholder="Ex: Next.js"
                      />
                    </div>
                  </div>
                  <Button onClick={createProject} className="w-full">
                    Criar Projeto
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Visual Studio</h1>
          <p className="text-muted-foreground mt-2">
            Ambiente de desenvolvimento integrado com agentes de IA
          </p>
        </div>

        <Tabs defaultValue="workspace" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="workspace">Workspace</TabsTrigger>
            <TabsTrigger value="agents">Agentes IA</TabsTrigger>
            <TabsTrigger value="automation">Automação</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="workspace" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Projetos</CardTitle>
                    <CardDescription>Seus projetos ativos</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedProject === project.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedProject(project.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{project.name}</h4>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span>{project.language} • {project.framework}</span>
                          <span>{new Date(project.lastSynced).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Workspace Area */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Área de Trabalho</CardTitle>
                        <CardDescription>
                          {projects.find(p => p.id === selectedProject)?.name || 'Selecione um projeto'}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Upload className="w-4 h-4 mr-1" />
                          Sync
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Code className="w-4 h-4" />
                          <span className="font-medium">Editor de Código</span>
                        </div>
                        <Textarea
                          placeholder="Seu código aparecerá aqui..."
                          className="min-h-64 font-mono text-sm"
                          defaultValue={`// Exemplo de código integrado com IA
function processData(data) {
  // Agentes de IA podem ajudar a otimizar esta função
  return data.map(item => ({
    ...item,
    processed: true,
    timestamp: new Date().toISOString()
  }));
}`}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Sugestões de IA</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-sm">
                                <Lightbulb className="w-4 h-4 text-yellow-500" />
                                <span>Otimize o loop de processamento</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <Zap className="w-4 h-4 text-blue-500" />
                                <span>Adicione tratamento de erros</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Ações Rápidas</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <Button size="sm" variant="outline" className="w-full justify-start">
                                <GitBranch className="w-4 h-4 mr-2" />
                                Gerar Branch
                              </Button>
                              <Button size="sm" variant="outline" className="w-full justify-start">
                                <Play className="w-4 h-4 mr-2" />
                                Executar Testes
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <Badge variant="outline">{agent.type}</Badge>
                    </div>
                    <CardDescription>{agent.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <Play className="w-4 h-4 mr-1" />
                        Usar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automação de Desenvolvimento</CardTitle>
                <CardDescription>
                  Configure fluxos de trabalho automatizados com agentes de IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Fluxos Disponíveis</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Code Review Automático</p>
                          <p className="text-sm text-muted-foreground">Análise automática de pull requests</p>
                        </div>
                        <Button size="sm">Ativar</Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Test Generation</p>
                          <p className="text-sm text-muted-foreground">Geração automática de testes</p>
                        </div>
                        <Button size="sm">Ativar</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Atividade Recente</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Code review completed - 2 min ago</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Tests generated - 15 min ago</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Documentation updated - 1 hour ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Linhas de Código</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">15,234</div>
                  <p className="text-sm text-muted-foreground">Total gerado</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bugs Corrigidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">247</div>
                  <p className="text-sm text-muted-foreground">Este mês</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tempo Economizado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">124h</div>
                  <p className="text-sm text-muted-foreground">Automação</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Eficiência</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">94%</div>
                  <p className="text-sm text-muted-foreground">Melhoria</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}