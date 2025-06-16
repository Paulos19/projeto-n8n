import { InfoPageLayout } from '@/components/layout/InfoPageLayout';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

async function getLegalContent(pageType: 'termos' | 'privacidade') {
    // A URL deve ser absoluta ao fazer fetch no lado do servidor
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    try {
        const res = await fetch(`${baseUrl}/api/legal-content/${pageType}`, {
            cache: 'no-store' // Garante que o conteúdo seja sempre o mais recente
        });
        if (!res.ok) return { content: `# Erro\n\nNão foi possível carregar o conteúdo.` };
        return res.json();
    } catch (error) {
        console.error(`Failed to fetch ${pageType}`, error);
        return { content: `# Erro\n\nFalha de conexão ao buscar o conteúdo.` };
    }
}

export default async function TermosPage() {
    const { content, updatedAt } = await getLegalContent('termos');
    const lastUpdated = updatedAt 
        ? new Date(updatedAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' }) 
        : "Data não disponível";

    return (
        <InfoPageLayout
            title="Termos de Serviço"
            subtitle={`Última atualização: ${lastUpdated}`}
        >
           <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </InfoPageLayout>
    );
}
