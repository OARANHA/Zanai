import { NextRequest, NextResponse } from 'next/server';
import { AgentExecutionService } from '@/lib/agent-execution';

export async function POST(request: NextRequest) {
  try {
    const { agentId, input, compositionId } = await request.json();

    if (!input) {
      return NextResponse.json(
        { error: 'Input é obrigatório' },
        { status: 400 }
      );
    }

    const executionService = AgentExecutionService.getInstance();
    
    let result;
    
    if (compositionId) {
      // Executar composição
      result = await executionService.executeComposition(compositionId, input);
    } else if (agentId) {
      // Executar agente individual
      result = await executionService.executeAgent({
        agentId,
        input
      });
    } else {
      return NextResponse.json(
        { error: 'AgentId ou CompositionId é obrigatório' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao executar agente/composição:', error);
    return NextResponse.json(
      { error: 'Erro ao executar agente/composição' },
      { status: 500 }
    );
  }
}