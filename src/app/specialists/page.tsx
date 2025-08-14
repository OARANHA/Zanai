'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Users, Target, BookOpen, Plus, Settings, Play, Pause, Archive, MessageSquare, Sparkles, Download, BarChart3, Loader2, FolderOpen } from 'lucide-react';
import SpecialistGenerator from '@/components/specialists/SpecialistGenerator';
import CreateAgentDialog from '@/components/agents/CreateAgentDialog';
import AgentDetailsDialog from '@/components/agents/AgentDetailsDialog';
import AgentExecutionDialog from '@/components/agents/AgentExecutionDialog';
import EditAgentDialog from '@/components/agents/EditAgentDialog';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'template' | 'custom' | 'composed';
  status: 'active' | 'inactive' | 'training';
  config: string;
  knowledge?: string;
  createdAt: string;
  workspace?: {
    id: string;
    name: string;
  };
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
  prompt: string;
  skills: string[];
  useCases: string[];
  created: string;
}

interface NewSpecialist {
  category: string;
  specialty: string;
  requirements: string;
}

export default function SpecialistsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  
  // Test data - hardcoded para teste
  const testCategories = [
    { id: 'business', name: 'Business', description: 'Especialistas em análise de negócio', icon: '📊' },
    { id: 'technical', name: 'Technical', description: 'Especialistas técnicos', icon: '⚙️' },
    { id: 'content', name: 'Content', description: 'Especialistas em conteúdo', icon: '✍️' },
    { id: 'legal', name: 'Legal', description: 'Especialistas legais', icon: '⚖️' }
  ];

  const testTemplates = [
    {
      id: 'test-1',
      name: 'Especialista de Teste',
      description: 'Um especialista para testar o sistema',
      category: 'business',
      skills: ['Teste', 'Análise', 'Desenvolvimento'],
      useCases: ['Testar sistema', 'Analisar requisitos', 'Desenvolver soluções'],
      created: new Date().toISOString()
    }
  ];

  // Usar dados de teste por enquanto
  const [categories, setCategories] = useState<SpecialistCategory[]>(testCategories);
  const [templates, setTemplates] = useState<SpecialistTemplate[]>(testTemplates);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateSpecialistOpen, setIsCreateSpecialistOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newSpecialist, setNewSpecialist] = useState<NewSpecialist>({
    category: '',
    specialty: '',
    requirements: ''
  });

  useEffect(() => {
    // Carregar dados iniciais
    loadWorkspaces();
    loadAgents();
    loadSpecialists();
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

  const loadSpecialists = async () => {
    console.log('Carregando especialistas...');
    try {
      const response = await fetch('/api/specialists');
      console.log('Resposta da API:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Dados recebidos:', data);
        setCategories(data.categories);
        setTemplates(data.templates);
      } else {
        console.error('Erro na resposta:', await response.text());
      }
    } catch (error) {
      console.error('Erro ao carregar especialistas:', error);
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

  // Specialist generator functions
  const generateSpecialist = async () => {
    if (!newSpecialist.category || !newSpecialist.specialty || !newSpecialist.requirements) {
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/specialists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSpecialist),
      });

      if (response.ok) {
        const generatedTemplate = await response.json();
        setTemplates(prev => [...prev, generatedTemplate]);
        setIsCreateSpecialistOpen(false);
        setNewSpecialist({
          category: '',
          specialty: '',
          requirements: ''
        });
      }
    } catch (error) {
      console.error('Erro ao gerar especialista:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadSpecialist = async (specialistId: string) => {
    try {
      const response = await fetch('/api/specialists/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ specialistId }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const specialist = templates.find(t => t.id === specialistId);
        a.download = `${specialist?.name || 'specialist'}.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erro ao baixar especialista:', error);
    }
  };

  const generateFolderStructure = async () => {
    try {
      const response = await fetch('/api/specialists/structure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ basePath: '.zanai/specialists' }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Estrutura criada com sucesso!\n\n${result.totalFiles} arquivos gerados em:\n${result.basePath}`);
      } else {
        alert('Erro ao criar estrutura de pastas');
      }
    } catch (error) {
      console.error('Erro ao gerar estrutura:', error);
      alert('Erro ao gerar estrutura de pastas');
    }
  };

  const filteredTemplates = selectedCategory !== 'all' 
    ? templates.filter(template => template.category === selectedCategory)
    : templates;

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || '🤖';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
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
              <h1 className="text-2xl font-bold">Zanai - Especialistas</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/executions">
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Histórico de Execuções
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">
                ← Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="specialists" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="specialists" className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>Gerador de Especialistas</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>Agentes</span>
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

          {/* Specialists Tab */}
          <TabsContent value="specialists" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Gerador de Especialistas</h1>
                <p className="text-muted-foreground mt-2">
                  Crie agentes especialistas personalizados usando IA para diversas áreas de negócio
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={generateFolderStructure}>
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Gerar Estrutura de Pastas
                </Button>
                <Dialog open={isCreateSpecialistOpen} onOpenChange={setIsCreateSpecialistOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Especialista
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Gerar Novo Especialista</DialogTitle>
                      <DialogDescription>
                        Use a IA para criar um template de agente especialista personalizado
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Categoria</label>
                        <Select 
                          value={newSpecialist.category} 
                          onValueChange={(value) => setNewSpecialist({ ...newSpecialist, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center space-x-2">
                                  <span>{category.icon}</span>
                                  <span>{category.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Especialidade</label>
                        <Input
                          value={newSpecialist.specialty}
                          onChange={(e) => setNewSpecialist({ ...newSpecialist, specialty: e.target.value })}
                          placeholder="Ex: Analista Financeiro, Especialista em SEO, etc."
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Requisitos Específicos</label>
                        <Textarea
                          value={newSpecialist.requirements}
                          onChange={(e) => setNewSpecialist({ ...newSpecialist, requirements: e.target.value })}
                          placeholder="Descreva os requisitos específicos para este especialista..."
                          className="min-h-24"
                        />
                      </div>
                      <Button 
                        onClick={generateSpecialist} 
                        className="w-full"
                        disabled={isGenerating || !newSpecialist.category || !newSpecialist.specialty || !newSpecialist.requirements}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Gerar Especialista
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium">Filtrar por categoria:</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </div>
                      <Badge variant="outline">
                        {getCategoryName(template.category)}
                      </Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Habilidades:</h4>
                        <div className="flex flex-wrap gap-1">
                          {template.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Casos de Uso:</h4>
                        <ScrollArea className="h-16">
                          <div className="space-y-1">
                            {template.useCases.map((useCase, index) => (
                              <div key={index} className="text-xs text-muted-foreground">
                                • {useCase}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Criado em {new Date(template.created).toLocaleDateString()}
                        </span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadSpecialist(template.id)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum especialista encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {selectedCategory 
                    ? `Nenhum especialista na categoria "${getCategoryName(selectedCategory)}"`
                    : 'Comece criando seu primeiro especialista'
                  }
                </p>
                <Button onClick={() => setIsCreateSpecialistOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Especialista
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Agentes Inteligentes</h2>
              <div className="flex items-center space-x-2">
                <Link href="/executions">
                  <Button variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Histórico de Execuções
                  </Button>
                </Link>
                <CreateAgentDialog onAgentCreated={loadAgents} />
              </div>
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
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Workspace:</span> {agent.workspace?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Criado em:</span> {new Date(agent.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <AgentExecutionDialog agent={agent}>
                            <Button size="sm" variant="outline" title="Executar Agente">
                              <Play className="w-4 h-4" />
                            </Button>
                          </AgentExecutionDialog>
                          <AgentDetailsDialog agent={agent}>
                            <Button size="sm" variant="outline" title="Ver Detalhes">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </AgentDetailsDialog>
                          <EditAgentDialog agent={agent} onAgentUpdated={loadAgents}>
                            <Button size="sm" variant="outline" title="Configurar Agente">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </EditAgentDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Aprendizado de Agentes</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Treinamento
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Treinamento em Progresso</CardTitle>
                  <CardDescription>
                    Agente aprendendo novos padrões de código
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-sm text-muted-foreground">65% completo</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Visual Studio Tab */}
          <TabsContent value="studio" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Visual Agent Studio</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Projeto
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Projeto E-commerce</CardTitle>
                  <CardDescription>
                    Análise visual de projeto de e-commerce
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="outline">Análise de UI</Badge>
                    <Badge variant="outline">Otimização de UX</Badge>
                    <Badge variant="outline">Recursos de IA</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}