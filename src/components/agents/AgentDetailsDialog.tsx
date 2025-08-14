'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Settings, Play, FileText, Code } from 'lucide-react';

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

interface AgentDetailsDialogProps {
  agent: Agent;
  children: React.ReactNode;
}

export default function AgentDetailsDialog({ agent, children }: AgentDetailsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  const formatConfig = (config: string) => {
    if (!config || config.trim() === '') {
      return 'Nenhuma configuração definida';
    }
    return config;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{agent.name}</DialogTitle>
              <DialogDescription className="mt-2">
                {agent.description}
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
              <Badge className={getTypeColor(agent.type)}>
                {agent.type}
              </Badge>
            </div>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="knowledge">Conhecimento</TabsTrigger>
            <TabsTrigger value="actions">Ações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Status</h4>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                  <span className="capitalize">{agent.status}</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Tipo</h4>
                <Badge className={getTypeColor(agent.type)}>
                  {agent.type}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Workspace</h4>
                <p>{agent.workspace?.name || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Criado em</h4>
                <p>{new Date(agent.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="config" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Configuração YAML</h4>
              <ScrollArea className="h-64 w-full border rounded-md p-4 bg-muted/50">
                <pre className="text-sm whitespace-pre-wrap">
                  {formatConfig(agent.config)}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="knowledge" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Base de Conhecimento</h4>
              <ScrollArea className="h-64 w-full border rounded-md p-4 bg-muted/50">
                {agent.knowledge ? (
                  <div className="prose prose-sm max-w-none">
                    <pre className="text-sm whitespace-pre-wrap">
                      {agent.knowledge}
                    </pre>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    Nenhuma base de conhecimento definida para este agente.
                  </p>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Button className="w-full justify-start" size="lg">
                <Play className="w-4 h-4 mr-2" />
                Executar Agente
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Settings className="w-4 h-4 mr-2" />
                Editar Configuração
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <FileText className="w-4 h-4 mr-2" />
                Ver Histórico de Execuções
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Code className="w-4 h-4 mr-2" />
                Exportar Configuração
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}