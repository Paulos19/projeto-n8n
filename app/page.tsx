'use client'

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer"; // Certifique-se que o Footer também suporte dark mode
import Link from "next/link";
import { motion } from "framer-motion";

// Cores modo claro
const corDestaque = "#84C1FA";
const corTexto = "#091C53";
const corBackground = "#E8EEFC";
const corHoverBotaoDestaque = "#67B3F9";
const corBackgroundSecaoAlternativa = "#FFFFFF";

// Cores modo escuro (exemplo, use sua paleta escura anterior)
const corDestaqueDark = "#3B82F6"; // Ex: blue-500
const corTextoDark = "#D1D5DB"; // Ex: gray-300
const corBackgroundDark = "#111827"; // Ex: gray-900
const corHoverBotaoDestaqueDark = "#2563EB"; // Ex: blue-600
const corBackgroundSecaoAlternativaDark = "#1F2937"; // Ex: gray-800


export default function Home() {
  const sectionClasses = `min-h-screen flex items-center justify-center p-8 text-[${corTexto}] dark:text-[${corTextoDark}]`;
  const sectionTitleClasses = `text-4xl md:text-5xl font-bold mb-8 text-center text-[${corDestaque}] dark:text-[${corDestaqueDark}]`;

  // Configurações de animação (opcional, exemplo)
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className={`flex flex-col min-h-screen bg-[${corBackground}] dark:bg-[${corBackgroundDark}]`}>
      <Navbar />
      <main className="flex-grow">
        {/* Seção Hero */}
        <section id="hero" className={`${sectionClasses} bg-[${corBackground}] dark:bg-[${corBackgroundDark}]`}>
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className={`${sectionTitleClasses} drop-shadow-md`}>
              Bem-vindo ao R.A.I.O
            </h1>
            <p className={`text-lg md:text-xl text-[${corTexto}] dark:text-[${corTextoDark}] opacity-90 mb-10 max-w-2xl mx-auto`}>
              Transforme a gestão do seu negócio com a inteligência e agilidade que só o R.A.I.O oferece. Acesse seu dashboard e descubra um novo universo de possibilidades.
            </p>
            <Link
              href="/dashboard"
              className={`bg-[${corDestaque}] hover:bg-[${corHoverBotaoDestaque}] text-[${corTexto}] dark:bg-[${corDestaqueDark}] dark:hover:bg-[${corHoverBotaoDestaqueDark}] dark:text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 text-lg`}
            >
              Acessar Dashboard
            </Link>
          </motion.div>
        </section>

        {/* Seção Benefícios */}
        <section id="beneficios" className={`${sectionClasses} bg-[${corBackgroundSecaoAlternativa}] dark:bg-[${corBackgroundSecaoAlternativaDark}]`}>
          <motion.div
            className="text-center container mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
          >
            <h2 className={`${sectionTitleClasses}`}>Benefícios Incríveis</h2>
            <p className={`text-[${corTexto}] dark:text-[${corTextoDark}] opacity-90 max-w-3xl mx-auto`}>
              O R.A.I.O oferece uma análise detalhada do feedback dos seus clientes, identificando pontos fortes, fracos e sugestões de melhoria de forma automática. Economize tempo, melhore a satisfação do cliente e tome decisões baseadas em dados concretos.
            </p>
            {/* Adicionar cards ou ícones de benefícios aqui */}
          </motion.div>
        </section>

        {/* Seção Funcionalidades */}
        <section id="funcionalidades" className={`${sectionClasses} bg-[${corBackground}] dark:bg-[${corBackgroundDark}]`}>
          <motion.div
            className="text-center container mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
          >
            <h2 className={`${sectionTitleClasses}`}>Funcionalidades Poderosas</h2>
            <p className={`text-[${corTexto}] opacity-90 max-w-3xl mx-auto`}>
              Desde a coleta automatizada de avaliações via WhatsApp até a geração de relatórios visuais e insights acionáveis, o R.A.I.O é a ferramenta completa para entender e aprimorar a experiência do seu cliente.
            </p>
            {/* Adicionar cards ou lista de funcionalidades aqui */}
          </motion.div>
        </section>

        {/* Seção Sobre o R.A.I.O (anteriormente Possibilidades) */}
        <section id="sobre" className={`${sectionClasses} bg-[${corBackgroundSecaoAlternativa}] dark:bg-[${corBackgroundSecaoAlternativaDark}]`}>
          <motion.div
            className="text-center container mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
          >
            <h2 className={`${sectionTitleClasses}`}>Sobre o R.A.I.O</h2>
            <p className={`text-[${corTexto}] opacity-90 max-w-3xl mx-auto`}>
              O R.A.I.O nasceu da necessidade de transformar dados brutos de feedback em conhecimento estratégico. Nossa plataforma utiliza inteligência artificial para processar e analisar avaliações, fornecendo uma visão clara do sentimento do cliente e direcionando melhorias contínuas.
            </p>
          </motion.div>
        </section>

        {/* Seção Contato (anteriormente CTA) */}
        <section id="contato" className={`${sectionClasses} bg-[${corBackground}] dark:bg-[${corBackgroundDark}]`}>
          <motion.div
            className="text-center container mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
          >
            <h2 className={`${sectionTitleClasses}`}>Pronto para Começar?</h2>
            <p className={`text-lg md:text-xl text-[${corTexto}] dark:text-[${corTextoDark}] opacity-90 mb-10 max-w-2xl mx-auto`}>
              Entre em contato para uma demonstração ou para saber mais sobre como o R.A.I.O pode revolucionar seu atendimento.
            </p>
            <Link
              href="mailto:contato@raio.com"
              className={`bg-[${corDestaque}] hover:bg-[${corHoverBotaoDestaque}] text-[${corTexto}] dark:bg-[${corDestaqueDark}] dark:hover:bg-[${corHoverBotaoDestaqueDark}] dark:text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 text-lg`}
            >
              Fale Conosco
            </Link>
          </motion.div>
        </section>
      </main>
      <Footer /> {/* Lembre-se de atualizar o Footer também! */}
    </div>
  );
}