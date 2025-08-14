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

    // Processar a execução de forma assíncrona
    processAgentExecution(agentId, execution.id, input, context).catch(error => {
      console.error('Error processing agent execution:', error);
    });

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

async function processAgentExecution(agentId: string, executionId: string, input: string, context?: any) {
  try {
    // Buscar o agente novamente para garantir dados atualizados
    const agent = await db.agent.findUnique({
      where: { id: agentId }
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    // Simular processamento do agente
    // Em um sistema real, aqui seria a integração com o motor de IA
    const result = await simulateAgentProcessing(agent, input, context);

    // Atualizar o registro de execução com o resultado
    await db.agentExecution.update({
      where: { id: executionId },
      data: {
        status: 'completed',
        output: result.output,
        result: JSON.stringify(result),
        completedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error in agent execution:', error);
    
    // Atualizar o registro de execução com erro
    await db.agentExecution.update({
      where: { id: executionId },
      data: {
        status: 'failed',
        error: error.message,
        completedAt: new Date()
      }
    });
  }
}

async function simulateAgentProcessing(agent: any, input: string, context?: any): Promise<any> {
  // Simulação de processamento - em produção, isso seria substituído
  // pela integração real com o motor de IA ou com o Z.ai API
  
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000)); // Simular tempo de processamento

  const agentType = agent.type;
  const agentName = agent.name.toLowerCase();

  // Gerar resposta baseada no tipo do agente
  let response = '';

  if (agentName.includes('documentação') || agentName.includes('documentation')) {
    response = `Com base na sua solicitação "${input}", gerei a seguinte documentação:

## Documentação Técnica

### Descrição
Análise e documentação técnica completa para o requisito solicitado.

### Estrutura
- Visão geral do sistema
- Componentes principais
- Fluxos de dados
- Requisitos funcionais
- Requisitos não-funcionais

### Recomendações
1. Seguir padrões de documentação da empresa
2. Manter documentação atualizada
3. Incluir exemplos práticos
4. Documentar APIs e interfaces

### Próximos Passos
- Revisar documentação com stakeholders
- Validar requisitos técnicos
- Planejar implementação`;
  } else if (agentName.includes('código') || agentName.includes('code')) {
    response = `Análise de código para "${input}":

## Resultados da Análise

### Qualidade do Código
- **Complexidade**: Moderada
- **Manutenibilidade**: Boa
- **Performance**: Adequada

### Issues Encontradas
1. Linha 45: Variável não utilizada
2. Linha 78: Possível null pointer exception
3. Linha 120: Código duplicado

### Sugestões de Melhoria
\`\`\`javascript
// Refatorar função para melhor legibilidade
function optimizedFunction(params) {
  const result = params.map(item => {
    return processItem(item);
  });
  return result.filter(Boolean);
}
\`\`\`

### Métricas
- Coverage: 85%
- Complexidade Ciclomática: 12
- Linhas de Código: 234

### Recomendações
- Adicionar testes unitários
- Implementar tratamento de erros
- Otimizar performance crítica`;
  } else if (agentName.includes('api') || agentName.includes('gerador')) {
    response = `Design de API para "${input}":

## Especificação da API

### Endpoint: /api/v1/resource
- **Método**: POST
- **Descrição**: Criar novo recurso
- **Autenticação**: Bearer Token

### Request Body
\`\`\`json
{
  "name": "string",
  "description": "string",
  "type": "string",
  "metadata": {}
}
\`\`\`

### Response
\`\`\`json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
\`\`\`

### Status Codes
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 409: Conflict
- 500: Internal Server Error

### Validações
- name: required, min 3 chars
- description: optional, max 500 chars
- type: required, enum values

### Segurança
- Rate limiting: 100 req/min
- Input sanitization
- SQL injection protection
- CORS configured

### Documentação
- OpenAPI 3.0 disponível em /docs
- Exemplos em /examples
- Teste em /sandbox`;
  } else {
    // Resposta genérica para outros tipos de agentes
    response = `Processando sua solicitação: "${input}"

## Análise Completa

### Contexto
- Agente: ${agent.name}
- Tipo: ${agent.type}
- Input: ${input}
- Contexto Adicional: ${context ? JSON.stringify(context) : 'Nenhum'}

### Análise
Sua solicitação foi processada com sucesso. Com base nas configurações do agente e no contexto fornecido, identifiquei os seguintes pontos:

1. **Requisitos Principais**: Identificados e analisados
2. **Contexto Aplicado**: Considerado no processamento
3. **Solução Proposta**: Alinhada com as melhores práticas

### Resultados
- Status: Concluído com sucesso
- Tempo de Processamento: ${(Math.random() * 3 + 1).toFixed(2)}s
- Confiança: ${(Math.random() * 0.3 + 0.7).toFixed(2)}%

### Recomendações
1. Revisar os resultados gerados
2. Validar com os requisitos originais
3. Considerar contexto adicional se necessário
4. Iterar sobre o processo se preciso

### Próximos Passos
- Implementar as sugestões
- Monitorar resultados
- Coletar feedback para melhoria contínua`;
  }

  return {
    output: response,
    metadata: {
      agentType: agent.type,
      processingTime: Math.random() * 3 + 1,
      confidence: Math.random() * 0.3 + 0.7,
      timestamp: new Date().toISOString()
    },
    suggestions: [
      'Revisar resultados gerados',
      'Validar com requisitos originais',
      'Considerar contexto adicional',
      'Iterar se necessário'
    ]
  };
}