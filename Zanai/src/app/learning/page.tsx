'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, BarChart3, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function LearningPage() {
  const [stats, setStats] = useState({
    totalExecutions: 0,
    successRate: 100,
    averageResponseTime: 1.2,
    activeAgents: 0
  });

  useEffect(() => {
    // Simular carregamento de estatísticas
    const loadStats = async () => {
      try {
        const response = await fetch('/api/agents');
        if (response.ok) {
          const agents = await response.json();
          setStats(prev => ({
            ...prev,
            activeAgents: agents.filter(agent => agent.status === 'active').length
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    };

    loadStats();
  }, []);

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
              <Link href="/learning" className="text-sm font-medium text-primary">
                Aprendizado
              </Link>
              <Link href="/studio" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Visual Studio
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Sistema de Aprendizado</h1>
            <p className="text-muted-foreground mt-2">
              Acompanhe o desempenho e evolução dos seus agentes de IA
            </p>
          </div>
          <Button>
            <BookOpen className="w-4 h-4 mr-2" />
            Ver Estatísticas Detalhadas
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total de Execuções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalExecutions}</div>
              <p className="text-sm text-muted-foreground">Execuções realizadas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Taxa de Sucesso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.successRate}%</div>
              <p className="text-sm text-muted-foreground">Média de acertos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tempo Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.averageResponseTime}s</div>
              <p className="text-sm text-muted-foreground">Resposta média</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agentes Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.activeAgents}</div>
              <p className="text-sm text-muted-foreground">Em operação</p>
            </CardContent>
          </Card>
        </div>

        {/* Learning Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <CardTitle className="text-lg">Análise de Desempenho</CardTitle>
              </div>
              <CardDescription>
                Acompanhe métricas detalhadas de performance de cada agente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Precisão</span>
                  <span className="font-medium">94%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Velocidade</span>
                  <span className="font-medium">1.2s</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Satisfação</span>
                  <span className="font-medium">4.8/5</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Target className="w-8 h-8 text-green-600" />
                <CardTitle className="text-lg">Otimização Automática</CardTitle>
              </div>
              <CardDescription>
                Melhorias automáticas baseadas em padrões de uso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Otimizações</span>
                  <span className="font-medium">23</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Improvements</span>
                  <span className="font-medium">+15%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Efficiency</span>
                  <span className="font-medium">89%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <CardTitle className="text-lg">Evolução Contínua</CardTitle>
              </div>
              <CardDescription>
                Aprendizado contínuo e adaptação a novos cenários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Model Updates</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>New Skills</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Adaptation</span>
                  <span className="font-medium">96%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas atualizações e melhorias do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Agente otimizado automaticamente</p>
                  <p className="text-xs text-muted-foreground">Analisador de Código - melhoria de 12% na precisão</p>
                </div>
                <span className="text-xs text-muted-foreground">2 min atrás</span>
              </div>
              
              <div className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Novo padrão identificado</p>
                  <p className="text-xs text-muted-foreground">Padrão de otimização de API detectado e aplicado</p>
                </div>
                <span className="text-xs text-muted-foreground">15 min atrás</span>
              </div>
              
              <div className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Modelo atualizado</p>
                  <p className="text-xs text-muted-foreground">Assistente de Documentação - nova versão disponível</p>
                </div>
                <span className="text-xs text-muted-foreground">1 hora atrás</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}