'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Loader2, CheckCircle, XCircle, Clock, FileText, Settings, Square } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'template' | 'custom' | 'composed';
  status: 'active' | 'inactive' | 'training';
}

interface AgentExecutionDialogProps {
  agent: Agent;
  children: React.ReactNode;
}

interface Execution {
  id: string;
  input: string;
  output?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  error?: string;
  result?: string;
}

export default function AgentExecutionDialog({ agent, children }: AgentExecutionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [input, setInput] = useState('');
  const [currentExecution, setCurrentExecution] = useState<Execution | null>(null);
  const [executionHistory, setExecutionHistory] = useState<Execution[]>([]);
  const [activeTab, setActiveTab] = useState('execute');

  const loadExecutionHistory = async () => {
    try {
      const response = await fetch(`/api/execute?agentId=${agent.id}`);
      if (response.ok) {
        const data = await response.json();
        setExecutionHistory(data);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de execuções:', error);
    }
  };

  const executeAgent = async () => {
    if (!input.trim()) return;

    setIsExecuting(true);
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agent.id,
          input: input.trim(),
          context: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentExecution({
          id: result.executionId,
          input: input.trim(),
          status: 'running',
          startedAt: new Date().toISOString()
        });
        setInput('');
        setActiveTab('results');
        
        // Iniciar polling para verificar o status
        pollExecutionStatus(result.executionId);
      } else {
        const error = await response.json();
        alert(`Erro ao executar agente: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao executar agente:', error);
      alert('Erro ao executar agente');
    } finally {
      setIsExecuting(false);
    }
  };

  const stopExecution = async () => {
    if (!currentExecution || currentExecution.status !== 'running') return;

    try {
      const response = await fetch(`/api/execute/${currentExecution.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCurrentExecution({
          ...currentExecution,
          status: 'failed',
          error: 'Execução interrompida pelo usuário',
          completedAt: new Date().toISOString()
        });
        loadExecutionHistory();
      }
    } catch (error) {
      console.error('Erro ao parar execução:', error);
    }
  };

  const pollExecutionStatus = async (executionId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/execute?executionId=${executionId}`);
        if (response.ok) {
          const execution: Execution = await response.json();
          setCurrentExecution(execution);
          
          if (execution.status === 'completed' || execution.status === 'failed') {
            clearInterval(pollInterval);
            loadExecutionHistory(); // Recarregar histórico
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status da execução:', error);
        clearInterval(pollInterval);
      }
    }, 1000);

    // Limpar polling após 30 segundos
    setTimeout(() => clearInterval(pollInterval), 30000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'running': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (startedAt?: string, completedAt?: string) => {
    if (!startedAt) return '-';
    if (!completedAt) return 'Em execução...';
    
    const start = new Date(startedAt).getTime();
    const end = new Date(completedAt).getTime();
    const duration = end - start;
    
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
    return `${(duration / 60000).toFixed(1)}min`;
  };

  useEffect(() => {
    if (isOpen) {
      loadExecutionHistory();
    }
  }, [isOpen, agent.id]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-white dark:bg-slate-800 border-0 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Executar Agente: {agent.name}
              </DialogTitle>
              <DialogDescription className="mt-2 text-muted-foreground">
                {agent.description}
              </DialogDescription>
            </div>
            <Badge className={
              agent.status === 'active' 
                ? 'bg-green-100 text-green-800 border-0' 
                : agent.status === 'inactive' 
                ? 'bg-gray-100 text-gray-800 border-0' 
                : 'bg-blue-100 text-blue-800 border-0'
            }>
              {agent.status}
            </Badge>
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-slate-800 p-1 rounded-lg shadow-lg">
            <TabsTrigger value="execute" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all">
              Executar Agente
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all">
              Resultado Atual
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all">
              Histórico
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="execute" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-slate-700 dark:text-slate-300">
                  Input para o Agente
                </label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Descreva o que você deseja que o agente faça..."
                  className="min-h-32 bg-slate-50 dark:bg-slate-700 border-0"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Digite uma instrução clara para o agente processar
                </div>
                <Button 
                  onClick={executeAgent} 
                  disabled={isExecuting || !input.trim() || agent.status !== 'active'}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Executando...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Executar Agente
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4">
            {currentExecution ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(currentExecution.status)}
                    <Badge className={getStatusColor(currentExecution.status)}>
                      {currentExecution.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Duração: {formatDuration(currentExecution.startedAt, currentExecution.completedAt)}
                  </div>
                </div>
                
                <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      <FileText className="w-5 h-5 mr-2" />
                      Input
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-md">
                      <pre className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                        {currentExecution.input}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
                
                {currentExecution.status === 'running' && (
                  <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          <span className="text-slate-700 dark:text-slate-300">Processando sua solicitação...</span>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={stopExecution}
                          className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all"
                        >
                          <Square className="w-4 h-4 mr-2" />
                          Parar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {currentExecution.output && (
                  <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                        Output
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64 w-full border rounded-md p-4 bg-slate-50 dark:bg-slate-700">
                        <div className="prose prose-sm max-w-none">
                          <pre className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                            {currentExecution.output}
                          </pre>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
                
                {currentExecution.error && (
                  <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                        <XCircle className="w-5 h-5 mr-2 text-red-500" />
                        Erro
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                        <p className="text-sm text-red-800 dark:text-red-300">{currentExecution.error}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Play className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma Execução Atual</h3>
                <p className="text-muted-foreground mb-4">
                  Execute o agente para ver os resultados aqui
                </p>
                <Button onClick={() => setActiveTab('execute')} 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all">
                  Ir para Execução
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Histórico de Execuções</h3>
                <Button variant="outline" size="sm" onClick={loadExecutionHistory} 
                  className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 hover:from-blue-100 hover:to-purple-100 dark:hover:from-slate-600 dark:hover:to-slate-500 border-blue-200 dark:border-slate-500 text-blue-700 dark:text-blue-300">
                  <Settings className="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
              </div>
              
              {executionHistory.length > 0 ? (
                <div className="space-y-3">
                  {executionHistory.map((execution) => (
                    <Card key={execution.id} className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 bg-white dark:bg-slate-800 border-0 shadow-md">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getStatusIcon(execution.status)}
                              <Badge className={getStatusColor(execution.status)}>
                                {execution.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(execution.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm">
                              <div className="font-medium mb-1 text-slate-700 dark:text-slate-300">Input:</div>
                              <div className="text-muted-foreground line-clamp-2">
                                {execution.input}
                              </div>
                            </div>
                            {execution.output && (
                              <div className="text-sm mt-2">
                                <div className="font-medium mb-1 text-slate-700 dark:text-slate-300">Output:</div>
                                <div className="text-muted-foreground line-clamp-2">
                                  {execution.output}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground ml-4">
                            {formatDuration(execution.startedAt, execution.completedAt)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum Histórico</h3>
                  <p className="text-muted-foreground">
                    Este agente ainda não foi executado
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}