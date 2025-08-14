'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';

interface CreateAgentDialogProps {
  onAgentCreated: () => void;
}

interface Workspace {
  id: string;
  name: string;
}

export default function CreateAgentDialog({ onAgentCreated }: CreateAgentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'template',
    workspaceId: ''
  });

  const loadWorkspaces = async () => {
    try {
      const response = await fetch('/api/workspaces');
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
        if (data.length > 0 && !formData.workspaceId) {
          setFormData(prev => ({ ...prev, workspaceId: data[0].id }));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar workspaces:', error);
    }
  };

  const handleCreateAgent = async () => {
    if (!formData.name || !formData.workspaceId) {
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onAgentCreated();
        setIsOpen(false);
        setFormData({
          name: '',
          description: '',
          type: 'template',
          workspaceId: workspaces[0]?.id || ''
        });
      } else {
        const error = await response.json();
        alert(`Erro ao criar agente: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao criar agente:', error);
      alert('Erro ao criar agente');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      loadWorkspaces();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Novo Agente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white dark:bg-slate-800 border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Criar Novo Agente
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Crie um novo agente inteligente para automatizar tarefas
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome do Agente</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Assistente de Código"
              className="bg-slate-50 dark:bg-slate-700 border-0"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva as funcionalidades do agente..."
              className="min-h-20 bg-slate-50 dark:bg-slate-700 border-0"
            />
          </div>
          <div>
            <Label htmlFor="type" className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger className="bg-slate-50 dark:bg-slate-700 border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="template">Template</SelectItem>
                <SelectItem value="custom">Customizado</SelectItem>
                <SelectItem value="composed">Composto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="workspace" className="text-sm font-medium text-slate-700 dark:text-slate-300">Workspace</Label>
            <Select value={formData.workspaceId} onValueChange={(value) => setFormData({ ...formData, workspaceId: value })}>
              <SelectTrigger className="bg-slate-50 dark:bg-slate-700 border-0">
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
          <Button 
            onClick={handleCreateAgent} 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
            disabled={isCreating || !formData.name || !formData.workspaceId}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Agente'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}