import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await db.agent.findUnique({
      where: { id: params.id },
      include: {
        workspace: true
      }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Criar objeto de exportação
    const exportData = {
      metadata: {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        agentId: agent.id,
        agentName: agent.name
      },
      agent: {
        name: agent.name,
        description: agent.description,
        type: agent.type,
        config: agent.config,
        knowledge: agent.knowledge,
        status: agent.status
      },
      workspace: {
        name: agent.workspace.name,
        description: agent.workspace.description
      }
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Error exporting agent:', error);
    return NextResponse.json(
      { error: 'Failed to export agent' },
      { status: 500 }
    );
  }
}