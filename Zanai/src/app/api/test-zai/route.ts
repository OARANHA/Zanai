import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { getZAIConfig } from '@/lib/zai-config';

export async function GET(request: NextRequest) {
  try {
    console.log('Iniciando teste do Z.ai SDK...');
    
    // Verificar configuração
    const config = getZAIConfig();
    console.log('Configuração Z.ai:', JSON.stringify({
      ...config,
      apiKey: config.apiKey ? '***' : 'MISSING'
    }, null, 2));
    
    // Tentar inicializar Z.ai
    console.log('Tentando criar instância Z.ai...');
    const zai = await ZAI.create(config);
    console.log('Z.ai criado com sucesso');
    
    // Tentar uma chamada simples
    console.log('Tentando chamada de teste...');
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente útil.'
        },
        {
          role: 'user',
          content: 'Diga apenas "Teste bem sucedido"'
        }
      ],
      model: 'glm-4.5-flash',
      temperature: 0.7,
      max_tokens: 50
    });
    
    console.log('Resposta recebida:', JSON.stringify(completion, null, 2));
    
    const response = completion.choices?.[0]?.message?.content || 'Sem resposta';
    
    return NextResponse.json({
      success: true,
      response,
      config: {
        hasApiKey: !!config.apiKey,
        model: config.model,
        baseUrl: config.baseUrl
      }
    });
    
  } catch (error) {
    console.error('Erro no teste Z.ai:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}