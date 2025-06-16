import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { isAdmin } from '@/lib/auth-utils';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Configuração da API do Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Chave da API do Gemini não configurada!');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.5,
    topP: 0.95,
    maxOutputTokens: 4096, // Aumentado para textos legais mais longos
  },
  safetySettings: [
     { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
     { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
     { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
     { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ]
});


export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
  }

  try {
    const { pageType, currentContent, companyInfo } = await request.json();

    if (!pageType || !companyInfo) {
      return NextResponse.json({ message: 'Dados insuficientes para gerar sugestão.' }, { status: 400 });
    }

    const pageName = pageType === 'termos' ? 'Termos de Uso' : 'Política de Privacidade';
    const legislation = companyInfo.targetCountry === 'Brasil' ? 'com foco na Lei Geral de Proteção de Dados (LGPD)' : '';

    // Prompt Aprimorado com Contexto de Negócio
    const prompt = `
      Aja como um especialista em redação de documentos legais para empresas de tecnologia (SaaS) que operam no ${companyInfo.targetCountry}.
      Sua tarefa é revisar, reescrever e aprimorar o seguinte texto para a página de "${pageName}" da empresa "${companyInfo.companyName}".

      **Contexto da Empresa:**
      - **Nome:** ${companyInfo.companyName}
      - **Website:** ${companyInfo.companyWebsite}
      - **Serviço Principal:** ${companyInfo.services}
      - **Dados de Usuário Coletados:** ${companyInfo.dataCollected}

      **Instruções:**
      1.  O tom deve ser profissional, claro e objetivo para o usuário final.
      2.  Garanta que o conteúdo seja abrangente e cubra os pontos essenciais para uma empresa de SaaS.
      3.  Se a legislação for do Brasil, assegure conformidade com os princípios da LGPD.
      4.  Incorpore as informações de contexto da empresa de forma natural no documento.
      5.  Se o texto atual estiver vazio ou muito simples, gere um documento completo e robusto a partir do zero.
      6.  **Formato de Saída:** Retorne **APENAS** o texto completo e revisado em formato Markdown. Não inclua comentários, introduções ou notas de rodapé como "Texto Revisado:", apenas o documento final.

      **Texto Atual para Revisão:**
      ---
      ${currentContent || `(O documento está vazio. Crie uma nova ${pageName} com base no contexto fornecido.)`}
      ---
    `;

    const result = await model.generateContent(prompt);
    const suggestion = result.response.text();

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("Erro ao gerar sugestão com IA:", error);
    return NextResponse.json({ message: 'Erro ao gerar sugestão.' }, { status: 500 });
  }
}
