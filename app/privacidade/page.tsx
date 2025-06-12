import { InfoPageLayout } from '@/components/layout/InfoPageLayout';

export default function PrivacidadePage() {
    const lastUpdated = "12 de Junho de 2025";
  return (
    <InfoPageLayout
      title="Política de Privacidade"
      subtitle={`Sua privacidade é importante para nós. Última atualização: ${lastUpdated}`}
    >
        <h2>1. Coleta de Informações</h2>
        <p>Coletamos informações que você nos fornece diretamente, como quando você cria uma conta, e informações que obtemos do uso de nossos serviços. Isso inclui nome, e-mail, informações de pagamento e os dados que você processa através de nossa plataforma (como conversas de clientes).</p>

        <h2>2. Uso das Informações</h2>
        <p>Usamos as informações que coletamos para fornecer, manter, proteger e melhorar nossos serviços, para desenvolver novos e para proteger a R.A.I.O e nossos usuários. Também usamos essas informações para oferecer a você conteúdo personalizado – como resultados de relatórios e análises mais relevantes.</p>

        <h2>3. Compartilhamento de Informações</h2>
        <p>Nós não compartilhamos informações pessoais com empresas, organizações e indivíduos externos à R.A.I.O, exceto nas seguintes circunstâncias:</p>
        <ul>
            <li>Com seu consentimento.</li>
            <li>Para processamento externo (fornecemos informações pessoais aos nossos afiliados ou outras empresas ou pessoas confiáveis para processá-las para nós, com base em nossas instruções e em conformidade com nossa Política de Privacidade).</li>
            <li>Por motivos legais (se acreditarmos de boa-fé que o acesso, uso, preservação ou divulgação das informações é razoavelmente necessário para cumprir qualquer lei, regulamentação, processo legal ou solicitação governamental aplicável).</li>
        </ul>

        <h2>4. Segurança da Informação</h2>
        <p>Trabalhamos duro para proteger a R.A.I.O e nossos usuários de acesso não autorizado ou alteração, divulgação ou destruição não autorizada das informações que mantemos. Em particular:</p>
        <ul>
            <li>Criptografamos muitos de nossos serviços usando SSL.</li>
            <li>Analisamos nossa coleta de informações, práticas de armazenamento e processamento, incluindo medidas de segurança física, para proteger contra acesso não autorizado aos sistemas.</li>
            <li>Restringimos o acesso a informações pessoais a funcionários, contratados e agentes da R.A.I.O que precisam saber essas informações para processá-las para nós e que estão sujeitos a rigorosas obrigações contratuais de confidencialidade.</li>
        </ul>

        <h2>5. Seus Direitos</h2>
        <p>Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Você pode gerenciar as informações da sua conta diretamente nas configurações do seu dashboard ou entrando em contato com nosso suporte.</p>
    </InfoPageLayout>
  );
}