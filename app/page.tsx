'use client'

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, BarChart2, Users, Brain } from "lucide-react"; // Ícones para cards de exemplo

// --- Removidas as constantes de cor JavaScript ---
// const corDestaque = "#84C1FA";
const corTexto = "#091C53";
const corBackground = "#E8EEFC";
const corHoverBotaoDestaque = "#67B3F9";
const corBackgroundSecaoAlternativa = "#FFFFFF"; // Branco para seções alternadas
const corCardBackground = "#FFFFFF"; // Fundo do card em modo claro
const corCardBorda = "#DDE7F7"; // Borda sutil para cards em modo claro

// --- Cores Modo Escuro ---
const corDestaqueDark = "#3B82F6"; // Azul mais vibrante
const corTextoDark = "#E5E7EB"; // Cinza claro para texto
const corBackgroundDark = "#0A0F1E"; // Um azul bem escuro, quase preto, para o fundo principal
const corHoverBotaoDestaqueDark = "#2563EB";
const corBackgroundSecaoAlternativaDark = "#111827"; // Cinza escuro para seções alternadas
const corCardBackgroundDark = "#1F2937"; // Fundo do card em modo escuro
const corCardBordaDark = "#374151"; // Borda sutil para cards em modo escuro

// --- Classe para Texto em Degradê ---
// Este degradê tenta ser visível tanto no modo claro quanto no escuro.
// Pode ser necessário ajustar as cores do degradê para otimizar o contraste em ambos os temas.
const gradientTextClasses = "bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-teal-400 to-green-400 dark:from-blue-400 dark:via-teal-300 dark:to-green-300";

export default function Home() {
  const sectionClasses = "min-h-screen flex flex-col items-center justify-center p-8 md:p-16 text-foreground"; // Usando text-foreground
  const sectionTitleClasses = `text-4xl md:text-5xl font-bold mb-12 text-center ${gradientTextClasses}`; // Aplicando o degradê

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const cardItemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const cardContainerAnimation = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Exemplo de dados para cards
  const beneficios = [
    { icon: Brain, title: "Insights Inteligentes", description: "Transforme feedback em ações com IA." },
    { icon: CheckCircle, title: "Decisões Assertivas", description: "Baseie suas estratégias em dados concretos." },
    { icon: BarChart2, title: "Otimização Contínua", description: "Melhore processos e a satisfação do cliente." },
    { icon: Users, title: "Foco no Cliente", description: "Entenda profundamente as necessidades dos seus usuários." },
  ];


  return (
    <div className="flex flex-col min-h-screen bg-background"> {/* Usando bg-background */}
      <Navbar />
      <main className="flex-grow">
        {/* Seção Hero */}
        <section id="hero" className={`${sectionClasses} bg-gradient-to-br from-background to-muted dark:from-background dark:to-muted/50`}> {/* Ajuste de gradiente com cores semânticas */}
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className={`text-5xl md:text-7xl font-bold mb-8 ${gradientTextClasses} drop-shadow-lg`}>
              Bem-vindo ao R.A.I.O
            </h1>
            <p className="text-lg md:text-xl text-foreground opacity-80 dark:opacity-70 mb-12 max-w-3xl mx-auto">
              Transforme a gestão do seu negócio com a inteligência e agilidade que só o R.A.I.O oferece. Acesse seu dashboard e descubra um novo universo de possibilidades.
            </p>
            <Link
              href="/dashboard"
              className="bg-primary hover:bg-primary/90 text-primary-foreground 
                         font-semibold px-10 py-4 rounded-lg shadow-xl hover:shadow-2xl 
                         transition-all duration-300 ease-in-out transform hover:scale-105 text-lg" // Usando cores primárias
            >
              Acessar Dashboard
            </Link>
          </motion.div>
        </section>

        {/* Seção Benefícios */}
        <section id="beneficios" className={`${sectionClasses} bg-card`}> {/* Usando bg-card ou bg-muted */}
          <div className="container mx-auto text-center">
            <motion.h2
              className={`${sectionTitleClasses}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
            >
              Benefícios Incríveis
            </motion.h2>
            <motion.p
              className="text-foreground opacity-80 dark:opacity-70 max-w-3xl mx-auto mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
            >
              O R.A.I.O oferece uma análise detalhada do feedback dos seus clientes, identificando pontos fortes, fracos e sugestões de melhoria de forma automática.
            </motion.p>
            
            {/* Cards de Benefícios */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={cardContainerAnimation}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {beneficios.map((beneficio, index) => (
                <motion.div
                  key={index}
                  className="bg-background dark:bg-muted border border-border
                             rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300
                             flex flex-col items-center" // Usando bg-background/muted e border-border
                  variants={cardItemAnimation}
                >
                  <div className="p-3 rounded-full bg-primary text-primary-foreground mb-4"> {/* Usando primary */}
                    <beneficio.icon size={28} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{beneficio.title}</h3>
                  <p className="text-sm text-muted-foreground">{beneficio.description}</p> {/* Usando muted-foreground */}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Seção Funcionalidades */}
        <section id="funcionalidades" className={`${sectionClasses} bg-gradient-to-br from-background to-muted dark:from-background dark:to-muted/50`}> {/* Ajuste de gradiente */}
          <div className="container mx-auto text-center">
            <motion.h2
              className={`${sectionTitleClasses}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
            >
              Funcionalidades Poderosas
            </motion.h2>
            <motion.p
              className="text-foreground opacity-80 dark:opacity-70 max-w-3xl mx-auto mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
            >
              Desde a coleta automatizada de avaliações via WhatsApp até a geração de relatórios visuais e insights acionáveis, o R.A.I.O é a ferramenta completa para entender e aprimorar a experiência do seu cliente.
            </motion.p>
            {/* Adicionar cards ou lista de funcionalidades aqui, similar à seção de benefícios */}
            {/* Exemplo:
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-md">Funcionalidade 1</div>
              <div className="bg-card p-6 rounded-lg shadow-md">Funcionalidade 2</div>
              <div className="bg-card p-6 rounded-lg shadow-md">Funcionalidade 3</div>
            </div>
            */}
          </div>
        </section>

        {/* Seção Sobre o R.A.I.O */}
        <section id="sobre" className={`${sectionClasses} bg-card`}> {/* Usando bg-card ou bg-muted */}
          <div className="container mx-auto text-center max-w-4xl">
            <motion.h2
              className={`${sectionTitleClasses}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
            >
              Sobre o R.A.I.O
            </motion.h2>
            <motion.p
              className="text-foreground opacity-80 dark:opacity-70 leading-relaxed"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
            >
              O R.A.I.O (Respostas Automáticas Inteligentes e Otimizadas) nasceu da necessidade de transformar dados brutos de feedback em conhecimento estratégico. Nossa plataforma utiliza inteligência artificial para processar e analisar avaliações, fornecendo uma visão clara do sentimento do cliente e direcionando melhorias contínuas para o seu negócio prosperar.
            </motion.p>
          </div>
        </section>

        {/* Seção Contato */}
        <section id="contato" className={`${sectionClasses} bg-gradient-to-br from-background to-muted dark:from-background dark:to-muted/50`}> {/* Ajuste de gradiente */}
          <div className="container mx-auto text-center">
            <motion.h2
              className={`${sectionTitleClasses}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
            >
              Pronto para Começar?
            </motion.h2>
            <motion.p
              className="text-lg md:text-xl text-foreground opacity-80 dark:opacity-70 mb-12 max-w-2xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
            >
              Entre em contato para uma demonstração ou para saber mais sobre como o R.A.I.O pode revolucionar seu atendimento.
            </motion.p>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
            >
              <Link
                href="mailto:contato@raio.com"
                className="bg-primary hover:bg-primary/90 text-primary-foreground
                           font-semibold px-10 py-4 rounded-lg shadow-xl hover:shadow-2xl
                           transition-all duration-300 ease-in-out transform hover:scale-105 text-lg" // Usando cores primárias
              >
                Fale Conosco
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}