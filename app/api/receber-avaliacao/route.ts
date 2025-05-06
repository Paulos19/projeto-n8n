// app/api/receber-avaliacao/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Interface para tipar os dados da avaliação (permanece a mesma)
export interface AvaliacaoData {
  nota_cliente: number;
  pontos_fortes: string[];
  pontos_fracos: string[];
  tempo_resposta: string;
  clareza_comunicacao: string;
  resolucao_problema: string;
  sugestoes_melhoria: string[];
  resumo_atendimento: string;
  remoteJid?: string;
}

// Em um aplicativo real, você armazenaria isso em um banco de dados.
let ultimaAvaliacaoRecebida: AvaliacaoData | null = null;

export async function POST(request: NextRequest) {
  try {
    // 1. Lê o corpo da requisição como um objeto JSON.
    //    Ele deve ter uma chave "text" contendo a string JSON do formulário.
    const requestBody = await request.json();
    console.log('Corpo da requisição recebido pela API:', requestBody);

    if (!requestBody.text || typeof requestBody.text !== 'string') {
      console.error('Campo "text" ausente ou não é uma string no corpo da requisição.');
      return NextResponse.json(
        { message: 'Corpo da requisição inválido: campo "text" contendo a string JSON é esperado.' },
        { status: 400 }
      );
    }

    // 2. Faz o parse da string JSON que está dentro do campo "text".
    const formularioString: string = requestBody.text;
    const parsedData: AvaliacaoData = JSON.parse(formularioString);
    console.log('Dados do formulário (após parse do campo "text"):', parsedData);

    // 3. Validação básica para garantir que os campos de array existam
    //    (O nó "Formatar Formulário" no N8N já deve estar fazendo isso)
    const validatedData: AvaliacaoData = {
      ...parsedData,
      nota_cliente: parsedData.nota_cliente !== undefined ? Number(parsedData.nota_cliente) : 0,
      pontos_fortes: Array.isArray(parsedData.pontos_fortes) ? parsedData.pontos_fortes : [],
      pontos_fracos: Array.isArray(parsedData.pontos_fracos) ? parsedData.pontos_fracos : [],
      sugestoes_melhoria: Array.isArray(parsedData.sugestoes_melhoria) ? parsedData.sugestoes_melhoria : [],
      // Adiciona o remoteJid se ele foi incluído no objeto JSON 'formulario_formatado' pelo N8N
      // Se o 'remoteJid' estiver em um nível diferente no requestBody (fora do 'text'), ajuste aqui.
      // Por agora, vamos supor que ele está dentro do JSON de 'formulario_formatado'.
      remoteJid: parsedData.remoteJid || undefined,
    };

    ultimaAvaliacaoRecebida = validatedData;

    return NextResponse.json({ message: 'Dados recebidos e processados com sucesso!', dataRecebida: validatedData }, { status: 200 });

  } catch (error) {
    console.error('Erro ao processar a requisição POST:', error);
    let errorMessage = 'Erro desconhecido ao processar dados.';
    if (error instanceof SyntaxError) {
      errorMessage = 'Erro de parsing do JSON no campo "text". Verifique se a string JSON é válida.';
      console.error("Conteúdo do campo 'text' que causou o erro de parsing:", (await request.json().catch(() => ({}))).text || "Não foi possível ler o campo 'text'");
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Erro ao receber dados', error: errorMessage }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  // Endpoint para o frontend buscar a última avaliação (permanece o mesmo)
  if (ultimaAvaliacaoRecebida) {
    return NextResponse.json(ultimaAvaliacaoRecebida, { status: 200 });
  } else {
    return NextResponse.json({ message: 'Nenhuma avaliação disponível ainda.' }, { status: 404 });
  }
}