import { CheckCircle, BarChart2, Users, Brain, Zap, Target, Lightbulb, UploadCloud, MessageSquareText, PieChart, Settings2, LucideIcon } from "lucide-react";

export interface AcronymPart {
  char: string;
  fullWord: string;
}

export interface HeroFeature {
  icon: LucideIcon;
  title: string;
  text: string;
}

export interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  details?: string[]; 
}

export interface HowItWorksStep {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface FaqItemData {
  question: string;
  answer: string;
}

export const acronymPartsData: AcronymPart[] = [
  { char: "R", fullWord: "Robô" },
  { char: "A", fullWord: "Analisador" },
  { char: "I", fullWord: "Identificador" },
  { char: "O", fullWord: "Oportunidades" },
];

export const heroFeaturesData: HeroFeature[] = [
  { icon: Zap, title: "Performance Extrema", text: "Análises ultra-rápidas para decisões ágeis." },
  { icon: Target, title: "Precisão Cirúrgica", text: "IA calibrada para os seus objetivos estratégicos." },
  { icon: Lightbulb, title: "Inovação Contínua", text: "Descubra insights e oportunidades ocultas." },
];

export const benefitsData: Benefit[] = [
  { icon: Brain, title: "Insights Preditivos", description: "Antecipe tendências e necessidades com IA avançada." },
  { icon: CheckCircle, title: "Decisões Validadas", description: "Estratégias embasadas em dados concretos e análises profundas." },
  { icon: BarChart2, title: "Otimização Dinâmica", description: "Ajuste processos em tempo real para máxima eficiência." },
  { icon: Users, title: "Experiência Personalizada", description: "Compreenda e atenda cada cliente de forma única." },
];

export const featuresData: Feature[] = [
  { icon: MessageSquareText, title: "Análise de Sentimento Avançada", description: "Compreenda o tom e a emoção por trás de cada feedback do cliente." },
  { icon: PieChart, title: "Dashboards Personalizáveis", description: "Visualize os dados que mais importam para o seu negócio de forma intuitiva." },
  { icon: UploadCloud, title: "Integração Multi-Canal", description: "Colete feedback de diversas fontes como WhatsApp, E-mail e mais." },
  { icon: Settings2, title: "Automação de Respostas e Alertas", description: "Configure fluxos para otimizar a gestão de feedback e identificar prioridades." },
  { icon: Brain, title: "Identificação de Tendências Emergentes", description: "Nossa IA detecta padrões e tópicos relevantes antes que se tornem mainstream." },
  { icon: Target, title: "Segmentação Inteligente de Clientes", description: "Agrupe clientes com base em seus feedbacks e comportamentos para ações direcionadas." },
];

export const howItWorksStepsData: HowItWorksStep[] = [
  { icon: UploadCloud, title: "1. Coleta Inteligente", description: "Integração multi-canal para capturar feedback de forma fluida e centralizada." },
  { icon: MessageSquareText, title: "2. Análise Semântica Profunda", description: "Nossa IA decifra nuances, sentimentos e intenções com precisão incomparável." },
  { icon: PieChart, title: "3. Dashboards Interativos", description: "Métricas e tendências visualizadas de forma clara, acionável e personalizável." },
  { icon: Settings2, title: "4. Automação Estratégica", description: "Insights que geram ações, alertas e otimizações automáticas para impulsionar resultados." },
];

export const faqItemsData: FaqItemData[] = [
  {
    question: "O que torna o R.A.I.O diferente de outras ferramentas de análise?",
    answer: "O R.A.I.O se destaca pela sua IA especializada em linguagem natural para o mercado brasileiro, integrações profundas e foco em transformar feedback em ações estratégicas e preditivas, não apenas relatórios."
  },
  {
    question: "Quais canais de coleta de feedback o R.A.I.O suporta?",
    answer: "Inicialmente, focamos em uma integração robusta com WhatsApp. Estamos expandindo ativamente para incluir e-mail, formulários web, redes sociais e outras plataformas de comunicação com o cliente."
  },
  {
    question: "A IA do R.A.I.O consegue entender gírias e regionalismos?",
    answer: "Sim! Nossa IA é continuamente treinada com um vasto corpus de texto em português brasileiro, incluindo variações regionais, gírias e linguagem informal, garantindo alta precisão na análise."
  },
  {
    question: "Como o R.A.I.O garante a segurança dos dados dos meus clientes?",
    answer: "A segurança é nossa prioridade. Utilizamos criptografia de ponta, seguimos as melhores práticas de segurança de dados e estamos em conformidade com a LGPD para proteger todas as informações processadas."
  },
  {
    question: "É possível personalizar os relatórios e dashboards?",
    answer: "Com certeza. O R.A.I.O oferece um alto grau de personalização para que os dashboards e relatórios reflitam as métricas e KPIs mais importantes para o seu negócio específico."
  }
];