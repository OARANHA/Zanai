import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const agents = await db.agent.findMany({
      include: {
        workspace: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(agents);
  } catch (error) {
    console.error('Erro ao buscar agentes:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar agentes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, type, config, knowledge, workspaceId } = await request.json();

    if (!name || !workspaceId) {
      return NextResponse.json(
        { error: 'Nome e workspace são obrigatórios' },
        { status: 400 }
      );
    }

    const agent = await db.agent.create({
      data: {
        name,
        description: description || '',
        type: type || 'template',
        config: config || '',
        knowledge: knowledge || '',
        workspaceId,
        status: 'active'
      }
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar agente:', error);
    return NextResponse.json(
      { error: 'Erro ao criar agente' },
      { status: 500 }
    );
  }
}