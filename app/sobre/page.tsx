import { InfoPageLayout } from '@/components/layout/InfoPageLayout';
import { Target, Eye, Zap } from 'lucide-react';

export default function SobrePage() {
  return (
    <InfoPageLayout
      title="Sobre o R.A.I.O"
      subtitle="Transformando dados em decisões inteligentes e oportunidades de crescimento."
    >
      <h2>Nossa Missão</h2>
      <p>Nossa missão é democratizar o acesso à análise de dados avançada para empresas de todos os tamanhos. Acreditamos que cada interação com o cliente é uma fonte valiosa de insights. O R.A.I.O (Robô Analisador e Identificador de Oportunidades) foi criado para extrair esse valor de forma automática e inteligente, permitindo que nossos usuários foquem no que fazem de melhor: gerir seus negócios.</p>
      
      <div className="my-12 grid md:grid-cols-3 gap-8">
        <div className="bg-card p-6 rounded-lg border">
            <Target className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold">Nossa Visão</h3>
            <p className="text-muted-foreground mt-2">Ser a plataforma líder em inteligência de atendimento, capacitando empresas a construir relacionamentos mais fortes e duradouros com seus clientes através da compreensão profunda de suas necessidades.</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
            <Eye className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold">Nosso Foco</h3>
            <p className="text-muted-foreground mt-2">Concentramo-nos em traduzir feedback qualitativo complexo em métricas claras e planos de ação. Transformamos conversas, avaliações e comentários em um mapa estratégico para o seu sucesso.</p>
        </div>
         <div className="bg-card p-6 rounded-lg border">
            <Zap className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold">Nossa Tecnologia</h3>
            <p className="text-muted-foreground mt-2">Utilizamos o que há de mais moderno em inteligência artificial e processamento de linguagem natural para garantir análises rápidas, precisas e, acima de tudo, úteis para o seu dia a dia.</p>
        </div>
      </div>

      <h2>A Jornada</h2>
      <p>O R.A.I.O nasceu da observação de uma dor comum no mercado: o desafio de lidar com o volume crescente de interações digitais. Vimos equipes sobrecarregadas e gestores sem ferramentas para entender o panorama geral. Decidimos criar uma solução que não apenas organiza, mas também interpreta e sugere, atuando como um verdadeiro parceiro estratégico para nossos clientes.</p>
    </InfoPageLayout>
  );
}