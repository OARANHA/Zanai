import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';
import { getZAIConfig } from './zai-config';

export interface AgentExecutionRequest {
  agentId: string;
  input: string;
  context?: any;
}

export interface AgentExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
}

export class AgentExecutionService {
  private static instance: AgentExecutionService;
  private zai: any = null;

  private constructor() {}

  public static getInstance(): AgentExecutionService {
    if (!AgentExecutionService.instance) {
      AgentExecutionService.instance = new AgentExecutionService();
    }
    return AgentExecutionService.instance;
  }

  private async initializeZAI() {
    if (!this.zai) {
      try {
        console.log('Inicializando ZAI com configuração...');
        const config = getZAIConfig();
        console.log('Configuração ZAI:', JSON.stringify({
          ...config,
          apiKey: config.apiKey ? '***PRESENT***' : '***MISSING***'
        }, null, 2));
        
        // Verificar se a configuração é válida antes de tentar criar
        if (!config.apiKey) {
          throw new Error('API key do Z.ai não está configurada');
        }
        
        console.log('Tentando criar instância Z.ai...');
        this.zai = await ZAI.create(config);
        console.log('ZAI inicializado com sucesso');
      } catch (error) {
        console.error('Erro ao inicializar ZAI:', error);
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
        // Não lançar erro, apenas retornar null para que o sistema continue funcionando
        this.zai = null;
        throw new Error(`Falha ao inicializar serviço de IA: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }
    return this.zai;
  }

  public async executeAgent(request: AgentExecutionRequest): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Buscar configuração do agente
      const agent = await db.agent.findUnique({
        where: { id: request.agentId },
        include: { workspace: true }
      });

      if (!agent) {
        throw new Error('Agente não encontrado');
      }

      // Inicializar ZAI com tratamento de erro robusto
      let zai;
      try {
        zai = await this.initializeZAI();
      } catch (error) {
        console.error('Falha ao inicializar ZAI, usando modo simulado:', error);
        // Retornar uma resposta simulada se o ZAI falhar
        const simulatedResponse = this.generateSimulatedResponse(agent, request.input);
        const executionTime = Date.now() - startTime;
        
        return {
          success: true,
          output: simulatedResponse,
          executionTime
        };
      }

      if (!zai) {
        throw new Error('Serviço de IA não disponível');
      }

      // Preparar prompt com base na configuração do agente
      const systemPrompt = this.buildSystemPrompt(agent);
      
      // Executar o agente com timeout e tratamento de erro
      console.log('Enviando requisição para API Z.ai...');
      const completion = await Promise.race([
        zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: request.input
            }
          ],
          model: 'glm-4.5-flash',
          temperature: 0.7,
          max_tokens: 2000
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na chamada da API Z.ai')), 30000)
        )
      ]);

      console.log('Resposta da API Z.ai recebida');

      // Verificar se a resposta tem a estrutura esperada - ser mais tolerante
      let output = '';
      if (completion && completion.choices && completion.choices[0] && completion.choices[0].message) {
        output = completion.choices[0].message.content || '';
      } else if (completion && completion.choices && completion.choices[0]) {
        // Tentar outros formatos possíveis
        output = completion.choices[0].text || JSON.stringify(completion.choices[0]);
      } else if (completion && completion.content) {
        // Outro formato possível
        output = completion.content;
      } else {
        // Se não encontrar o formato esperado, logar a estrutura completa
        console.warn('Formato de resposta inesperado:', completion);
        output = JSON.stringify(completion);
      }

      const executionTime = Date.now() - startTime;

      // Registrar aprendizado
      await this.recordLearning(agent.id, 'execution', {
        input: request.input,
        output,
        executionTime,
        success: true
      }, 0.9);

      return {
        success: true,
        output,
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('Erro ao executar agente:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');

      // Tentar gerar resposta simulada em caso de erro
      try {
        const agent = await db.agent.findUnique({
          where: { id: request.agentId }
        });
        
        if (agent) {
          const simulatedResponse = this.generateSimulatedResponse(agent, request.input);
          
          return {
            success: true,
            output: `[MODO SIMULADO - IA INDISPONÍVEL]\n\n${simulatedResponse}`,
            executionTime
          };
        }
      } catch (dbError) {
        console.error('Erro ao buscar agente para modo simulado:', dbError);
      }

      // Registrar falha para aprendizado
      await this.recordLearning(request.agentId, 'execution', {
        input: request.input,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        executionTime,
        success: false
      }, 0.1);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        executionTime
      };
    }
  }

  private generateSimulatedResponse(agent: any, input: string): string {
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

  private buildSystemPrompt(agent: any): string {
    let prompt = `Você é ${agent.name}.\n\n`;
    
    if (agent.description) {
      prompt += `Descrição: ${agent.description}\n\n`;
    }

    if (agent.knowledge) {
      prompt += `Conhecimento:\n${agent.knowledge}\n\n`;
    }

    if (agent.config) {
      try {
        const config = JSON.parse(agent.config);
        if (config.capabilities) {
          prompt += `Capacidades: ${config.capabilities.join(', ')}\n\n`;
        }
        if (config.settings) {
          prompt += `Configurações: ${JSON.stringify(config.settings, null, 2)}\n\n`;
        }
      } catch (error) {
        // Ignorar erro de parsing, config pode estar em YAML
      }
    }

    prompt += `Responda de forma precisa, útil e alinhada com sua especialidade.`;
    
    return prompt;
  }

  private async recordLearning(agentId: string, type: string, data: any, confidence: number) {
    try {
      await db.learning.create({
        data: {
          agentId,
          type,
          data: JSON.stringify(data),
          confidence
        }
      });
    } catch (error) {
      console.error('Erro ao registrar aprendizado:', error);
    }
  }

  public async executeComposition(compositionId: string, input: string): Promise<AgentExecutionResult> {
    try {
      // Buscar composição com agentes
      const composition = await db.composition.findUnique({
        where: { id: compositionId },
        include: {
          agents: true,
          workspace: true
        }
      });

      if (!composition || composition.agents.length === 0) {
        throw new Error('Composição não encontrada ou sem agentes');
      }

      // Executar agentes em sequência (pode ser paralelo no futuro)
      const results: string[] = [];
      
      for (const agent of composition.agents) {
        const result = await this.executeAgent({
          agentId: agent.id,
          input: input,
          context: { compositionId, previousResults: results }
        });

        if (result.success && result.output) {
          results.push(`[${agent.name}]: ${result.output}`);
        }
      }

      const executionTime = Date.now();
      
      return {
        success: true,
        output: results.join('\n\n'),
        executionTime
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        executionTime: 0
      };
    }
  }
}