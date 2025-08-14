import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { compositionId, input } = await request.json();

    if (!compositionId || !input) {
      return NextResponse.json(
        { error: 'Composition ID e input são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar a composição com seus agentes
    const composition = await db.composition.findUnique({
      where: { id: compositionId },
      include: {
        agents: true,
        workspace: true
      }
    });

    if (!composition) {
      return NextResponse.json(
        { error: 'Composição não encontrada' },
        { status: 404 }
      );
    }

    if (composition.status !== 'active') {
      return NextResponse.json(
        { error: 'Composição não está ativa' },
        { status: 400 }
      );
    }

    if (composition.agents.length === 0) {
      return NextResponse.json(
        { error: 'Composição não possui agentes' },
        { status: 400 }
      );
    }

    // Inicializar ZAI SDK
    const zai = await ZAI.create();

    // Executar cada agente na composição
    const results = [];
    for (const agent of composition.agents) {
      try {
        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `Você é um agente especializado chamado ${agent.name}. ${agent.description || ''}`
            },
            {
              role: 'user',
              content: input
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        });

        results.push({
          agentId: agent.id,
          agentName: agent.name,
          result: completion.choices[0]?.message?.content || 'Sem resposta'
        });
      } catch (error) {
        console.error(`Erro ao executar agente ${agent.name}:`, error);
        results.push({
          agentId: agent.id,
          agentName: agent.name,
          error: error.message || 'Erro ao executar agente'
        });
      }
    }

    // Criar registro de execução
    await db.execution.create({
      data: {
        compositionId: composition.id,
        input,
        results: JSON.stringify(results),
        status: 'completed'
      }
    });

    return NextResponse.json({
      compositionId,
      input,
      results,
      executedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao executar composição:', error);
    return NextResponse.json(
      { error: 'Erro ao executar composição' },
      { status: 500 }
    );
  }
}