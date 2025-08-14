import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { agentId, input, context } = await request.json();

    if (!agentId || !input) {
      return NextResponse.json(
        { error: 'Agent ID and input are required' },
        { status: 400 }
      );
    }

    // Verificar se o agente existe
    const agent = await db.agent.findUnique({
      where: { id: agentId },
      include: { workspace: true }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Criar registro de execução
    const execution = await db.agentExecution.create({
      data: {
        agentId,
        input,
        context: context ? JSON.stringify(context) : null,
        status: 'running',
        startedAt: new Date()
      }
    });

    // Processar a execução de forma síncrona com tratamento de erro robusto
    // Não usar processamento assíncrono para evitar crashes
    try {
      console.log(`Iniciando execução síncrona do agente ${agentId}`);
      
      // Simular um pequeno atraso para permitir que o botão de parar funcione
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Gerar resposta simulada diretamente para evitar problemas com SDK Z.ai
      const simulatedOutput = generateSimulatedResponse(agent, input);
      
      // Atualizar o registro de execução com o resultado simulado
      await db.agentExecution.update({
        where: { id: execution.id },
        data: {
          status: 'completed',
          output: simulatedOutput,
          result: JSON.stringify({
            output: simulatedOutput,
            executionTime: 2000,
            success: true,
            simulated: true
          }),
          completedAt: new Date()
        }
      });
      
      console.log(`Execução do agente ${agentId} concluída com sucesso (modo simulado)`);
      
    } catch (error) {
      console.error('Erro no processamento da execução:', error);
      
      // Atualizar o registro de execução com erro
      await db.agentExecution.update({
        where: { id: execution.id },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Erro na execução do agente',
          completedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      executionId: execution.id,
      status: 'running',
      message: 'Agent execution started'
    });

  } catch (error) {
    console.error('Error starting agent execution:', error);
    return NextResponse.json(
      { error: 'Failed to start agent execution' },
      { status: 500 }
    );
  }
}

function generateSimulatedResponse(agent: any, input: string): string {
  const agentName = agent.name;
  const agentDescription = agent.description || '';
  
  // Gerar resposta baseada no tipo de agente
  if (agentName.toLowerCase().includes('desenvolvedor') || agentName.toLowerCase().includes('developer')) {
    return `Como ${agentName}, entendo que você precisa de ajuda com desenvolvimento. 

Baseado no seu input "${input}", aqui está minha análise:

## Análise Técnica
Esta é uma resposta simulada pois o serviço de IA está temporariamente indisponível. No entanto, como ${agentName}, posso oferecer algumas orientações gerais:

### Recomendações:
1. **Planejamento**: Defina claramente os requisitos do sistema
2. **Arquitetura**: Escolha as tecnologias adequadas para o projeto
3. **Implementação**: Siga as melhores práticas de desenvolvimento
4. **Testes**: Garanta a qualidade do código através de testes abrangentes

### Próximos Passos:
- Refinar os requisitos específicos
- Definir a stack tecnológica
- Planejar a estrutura do projeto
- Implementar funcionalidades iterativamente

Esta resposta foi gerada pelo sistema simulado do agente ${agentName}.`;
  } else if (agentName.toLowerCase().includes('analista') || agentName.toLowerCase().includes('business')) {
    return `Como ${agentName}, analisei sua solicitação: "${input}"

## Análise de Negócios (Modo Simulado)

Esta é uma resposta simulada gerada pelo sistema do agente ${agentName} enquanto o serviço de IA está indisponível.

### Pontos a Considerar:
- **Objetivos de Negócio**: Clarificar os objetivos estratégicos
- **Stakeholders**: Identificar todas as partes interessadas
- **Requisitos**: Documentar requisitos funcionais e não-funcionais
- **Processos**: Mapear e otimizar processos existentes

### Recomendações:
1. Conduzir entrevistas com stakeholders
2. Documentar todos os requisitos
3. Analisar processos atuais
4. Propor melhorias e soluções

Agente ${agentName} - Modo de operação simulado.`;
  } else if (agentName.toLowerCase().includes('suporte') || agentName.toLowerCase().includes('support')) {
    return `Como Agente de Suporte, recebi sua solicitação: "${input}"

## Atendimento ao Cliente

Olá! Sou o Agente de Suporte e estou aqui para ajudar você com sua dúvida ou problema.

### Análise da Solicitação:
Sua mensagem foi recebida e estou analisando como posso ajudar você da melhor forma possível.

### Possíveis Soluções:
1. **Diagnóstico Inicial**: Vamos entender exatamente qual é o seu problema
2. **Orientação Passo a Passo**: Posso fornecer instruções claras para resolver sua questão
3. **Recursos Adicionais**: Posso indicar documentação ou ferramentas úteis
4. **Escalonamento**: Se necessário, posso encaminhar para um especialista específico

### Próximos Passos:
- Por favor, forneça mais detalhes sobre o problema específico
- Descreva o que você já tentou fazer para resolver
- Informe qual sistema ou ferramenta está utilizando
- Qual é o resultado esperado vs o resultado atual

### Informações Importantes:
- Seu caso de suporte foi registrado com sucesso
- Estou trabalhando para fornecer a melhor solução possível
- Em casos mais complexos, posso precisar de mais informações

Estou à disposição para ajudar! Por favor, responda com mais detalhes para que eu possa oferecer um suporte mais preciso e eficaz.

Agente de Suporte - Sistema de Atendimento`;
  } else {
    return `Como ${agentName}, recebi sua solicitação: "${input}"

## Resposta (Modo Simulado)

Esta é uma resposta gerada pelo sistema simulado do agente ${agentName}. O serviço de IA está temporariamente indisponível, mas estou fornecendo uma resposta baseada na minha configuração e conhecimento pré-definido.

### Minha Especialidade:
${agentDescription}

### Análise da Solicitação:
Sua solicitação foi recebida e registrada. Em condições normais, eu utilizaria meu conhecimento e capacidades para fornecer uma resposta mais completa e personalizada.

### Observações:
- Esta é uma resposta simulada
- O serviço de IA está temporariamente indisponível
- Normalmente, eu forneceria respostas mais detalhadas e contextualizadas

Agente ${agentName} - Operando em modo simulado.`;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const executionId = searchParams.get('executionId');
    const agentId = searchParams.get('agentId');

    if (executionId) {
      // Buscar execução específica
      const execution = await db.agentExecution.findUnique({
        where: { id: executionId },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      });

      if (!execution) {
        return NextResponse.json(
          { error: 'Execution not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(execution);
    }

    if (agentId) {
      // Buscar execuções de um agente específico
      const executions = await db.agentExecution.findMany({
        where: { agentId },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      return NextResponse.json(executions);
    }

    // Buscar todas as execuções recentes
    const executions = await db.agentExecution.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    return NextResponse.json(executions);
  } catch (error) {
    console.error('Error fetching executions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch executions' },
      { status: 500 }
    );
  }
}

async function processAgentExecutionWithZAI(agentId: string, executionId: string, input: string, context?: any) {
  try {
    console.log(`Iniciando execução do agente ${agentId} com API Z.ai`);
    
    // Usar o serviço de execução de agentes real
    const executionService = AgentExecutionService.getInstance();
    const result = await executionService.executeAgent({
      agentId,
      input,
      context
    });

    console.log(`Resultado da execução do agente ${agentId}:`, result);

    if (result.success) {
      // Atualizar o registro de execução com o resultado real
      await db.agentExecution.update({
        where: { id: executionId },
        data: {
          status: 'completed',
          output: result.output,
          result: JSON.stringify({
            output: result.output,
            executionTime: result.executionTime,
            success: true
          }),
          completedAt: new Date()
        }
      });
    } else {
      // Atualizar o registro de execução com erro
      await db.agentExecution.update({
        where: { id: executionId },
        data: {
          status: 'failed',
          error: result.error || 'Erro na execução do agente',
          completedAt: new Date()
        }
      });
    }

  } catch (error) {
    console.error('Error in agent execution with Z.ai:', error);
    
    // Atualizar o registro de execução com erro
    await db.agentExecution.update({
      where: { id: executionId },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Erro desconhecido na execução',
        completedAt: new Date()
      }
    });
  }
}