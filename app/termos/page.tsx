import { InfoPageLayout } from '@/components/layout/InfoPageLayout';

export default function TermosPage() {
  const lastUpdated = "12 de Junho de 2025";
  return (
    <InfoPageLayout
      title="Termos de Serviço"
      subtitle={`Última atualização: ${lastUpdated}`}
    >
      <h2>1. Aceitação dos Termos</h2>
      <p>Ao acessar e utilizar a plataforma R.A.I.O ("Serviço"), você concorda em cumprir e estar vinculado a estes Termos de Serviço. Se você não concorda com estes termos, não utilize o Serviço.</p>

      <h2>2. Descrição do Serviço</h2>
      <p>O R.A.I.O. é uma plataforma de software como serviço (SaaS) que utiliza inteligência artificial para analisar dados de interações de clientes, gerar relatórios e fornecer insights para auxiliar na tomada de decisões de negócios.</p>

      <h2>3. Uso da Conta</h2>
      <p>Você é responsável por manter a segurança de sua conta e senha. A empresa não pode e não será responsável por qualquer perda ou dano decorrente de sua falha em cumprir esta obrigação de segurança. Você é responsável por todo o conteúdo postado e atividade que ocorra em sua conta.</p>

      <h2>4. Uso Aceitável</h2>
      <p>Você concorda em não usar o Serviço para quaisquer fins ilegais ou não autorizados. Você não deve, no uso do Serviço, violar quaisquer leis em sua jurisdição (incluindo, mas não se limitando a, leis de direitos autorais).</p>

      <h2>5. Pagamento, Reembolso, Upgrade e Downgrade</h2>
      <p>O Serviço é cobrado antecipadamente, de acordo com o plano selecionado, e não é reembolsável. Não haverá reembolsos ou créditos por meses parciais de serviço, reembolsos de upgrade/downgrade ou reembolsos por meses não utilizados com uma conta aberta.</p>
      
      <h2>6. Cancelamento e Rescisão</h2>
      <p>Você é o único responsável por cancelar adequadamente sua conta. A empresa, a seu exclusivo critério, tem o direito de suspender ou encerrar sua conta e recusar todo e qualquer uso atual ou futuro do Serviço, por qualquer motivo, a qualquer momento.</p>

      <h2>7. Modificações no Serviço e Preços</h2>
      <p>A empresa reserva-se o direito de, a qualquer momento e de tempos em tempos, modificar ou descontinuar, temporária ou permanentemente, o Serviço (ou qualquer parte dele) com ou sem aviso prévio. Os preços de todos os Serviços, incluindo, mas não se limitando a, taxas de planos de assinatura mensal, estão sujeitos a alterações mediante aviso prévio de 30 dias de nossa parte.</p>

      <h2>8. Limitação de Responsabilidade</h2>
      <p>Você entende e concorda expressamente que a empresa não será responsável por quaisquer danos diretos, indiretos, incidentais, especiais, consequenciais ou exemplares, incluindo, mas não se limitando a, danos por lucros cessantes, boa vontade, uso, dados ou outras perdas intangíveis.</p>
    </InfoPageLayout>
  );
}