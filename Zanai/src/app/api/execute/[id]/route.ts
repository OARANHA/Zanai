import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const executionId = params.id;

    if (!executionId) {
      return NextResponse.json(
        { error: 'Execution ID is required' },
        { status: 400 }
      );
    }

    // Buscar a execução
    const execution = await db.agentExecution.findUnique({
      where: { id: executionId }
    });

    if (!execution) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      );
    }

    // Verificar se a execução está em andamento
    if (execution.status !== 'running') {
      return NextResponse.json(
        { error: 'Execution is not running' },
        { status: 400 }
      );
    }

    // Atualizar o status para 'failed' com mensagem de interrupção
    await db.agentExecution.update({
      where: { id: executionId },
      data: {
        status: 'failed',
        error: 'Execução interrompida pelo usuário',
        completedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Execution stopped successfully'
    });

  } catch (error) {
    console.error('Error stopping execution:', error);
    return NextResponse.json(
      { error: 'Failed to stop execution' },
      { status: 500 }
    );
  }
}