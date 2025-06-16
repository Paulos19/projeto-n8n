import { InfoPageLayout } from '@/components/layout/InfoPageLayout';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

async function getLegalContent(pageType: 'termos' | 'privacidade') {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    try {
        const res = await fetch(`${baseUrl}/api/legal-content/${pageType}`, {
            cache: 'no-store'
        });
        if (!res.ok) return { content: `# Erro\n\nNão foi possível carregar o conteúdo.` };
        return res.json();
    } catch (error) {
        console.error(`Failed to fetch ${pageType}`, error);
        return { content: `# Erro\n\nFalha de conexão ao buscar o conteúdo.` };
    }
}

export default async function PrivacidadePage() {
    const { content, updatedAt } = await getLegalContent('privacidade');
     const lastUpdated = updatedAt 
        ? new Date(updatedAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' }) 
        : "Data não disponível";

    return (
        <InfoPageLayout
            title="Política de Privacidade"
            subtitle={`Última atualização: ${lastUpdated}`}
        >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </InfoPageLayout>
    );
}
