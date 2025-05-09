'use client'

import React, { useState, useEffect, useRef } from "react"; // Adicionado useRef e useEffect
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"; // Adicionado useScroll, useTransform, AnimatePresence
import { CheckCircle, BarChart2, Users, Brain, Zap, Target, Lightbulb, ArrowRight } from "lucide-react"; // Ícones para cards de exemplo e Hero

// --- Removidas as constantes de cor JavaScript não utilizadas ---

// --- Classe para Texto em Degradê ---
const gradientTextClasses = "bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-teal-400 to-green-400 dark:from-blue-400 dark:via-teal-300 dark:to-green-300";

// Componente para cada letra do acrônimo R.A.I.O
const AcronymLetter = ({ char, fullWord }: { char: string; fullWord: string }) => {
  const revealedPart = fullWord.substring(1); // Pega o restante da palavra, ex: "obô" de "Robô"

  return (
    <motion.div
      className="relative inline-flex items-end cursor-default select-none" // Mudado para items-end para melhor alinhamento com tamanhos diferentes
      whileHover="hover" // Propaga o estado "hover" para os motion.span filhos
      // style={{ marginRight: '0.05em' }} // Ajuste conforme necessário
    >
      <motion.span
        className="letter-char text-inherit" // Estilos como font-weight serão herdados do h1
        variants={{
          hover: { scale: 1.05, transition: { duration: 0.2 } } // Animação sutil na letra principal
        }}
      >
        {char}
      </motion.span>
      <motion.span
        className="revealed-text-suffix text-inherit overflow-hidden whitespace-nowrap text-[0.5em] leading-none" // Adicionado text-[0.5em] e leading-none
        style={{ marginLeft: '0.02em', paddingBottom: '0.12em' }} // Pequeno espaço e ajuste no padding-bottom para alinhar melhor com items-end
        initial={{ width: 0, opacity: 0 }} // Começa escondido
        variants={{
          hover: { // No hover do motion.div pai
            width: 'auto', // Expande a largura para mostrar o texto
            opacity: 1,    // Torna visível
            transition: { duration: 0.3, ease: 'easeOut', delay: 0.05 } // Animação suave com um pequeno delay
          }
        }}
      >
        {revealedPart}
      </motion.span>
    </motion.div>
  );
};

// Componente para Focos Luminosos
const LuminousSpot = ({ className, style }: { className?: string; style?: React.CSSProperties }) => {
  return (
    <motion.div
      className={`luminous-spot ${className || ''}`}
      style={style}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: [0, 0.3, 0.6, 0.3, 0], scale: [0.5, 1, 1.2, 1, 0.5], rotate: [0, 10, -5, 10, 0] }}
      transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
    />
  );
};


export default function Home() {
  const sectionClasses = "min-h-screen flex flex-col items-center justify-center p-8 md:p-16 text-foreground overflow-hidden"; // Adicionado overflow-hidden para parallax
  const sectionTitleClasses = `text-4xl md:text-5xl font-bold mb-12 text-center ${gradientTextClasses}`;

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

  const acronymParts = [
    { char: "R", fullWord: "Robô" },
    { char: "A", fullWord: "Analisador" },
    { char: "I", fullWord: "Identificador" },
    { char: "O", fullWord: "Oportunidades" },
  ];

  // Exemplo de dados para cards
  const beneficios = [
    { icon: Brain, title: "Insights Inteligentes", description: "Transforme feedback em ações com IA." },
    { icon: CheckCircle, title: "Decisões Assertivas", description: "Baseie suas estratégias em dados concretos." },
    { icon: BarChart2, title: "Otimização Contínua", description: "Melhore processos e a satisfação do cliente." },
    { icon: Users, title: "Foco no Cliente", description: "Entenda profundamente as necessidades dos seus usuários." },
  ];

  // Parallax para a seção Hero
  const heroRef = useRef(null);
  const { scrollYProgress: heroScrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"], // Anima enquanto a seção está entrando e saindo do topo
  });

  const heroBgOpacity = useTransform(heroScrollYProgress, [0, 0.5, 1], [1, 0.5, 0.3]);
  const heroTextY = useTransform(heroScrollYProgress, [0, 1], ["0%", "50%"]); // Texto se move mais devagar
  const heroSubtitleOpacity = useTransform(heroScrollYProgress, [0, 0.5, 0.8], [1, 1, 0]);


  // Luminous spots configuration
  const spots = [
    { top: '10%', left: '15%', width: '150px', height: '150px', animationDelay: '0s' },
    { top: '20%', left: '75%', width: '200px', height: '200px', animationDelay: '1s' },
    { top: '65%', left: '10%', width: '120px', height: '120px', animationDelay: '2s' },
    { top: '70%', left: '80%', width: '180px', height: '180px', animationDelay: '0.5s' },
    { top: '40%', left: '45%', width: '250px', height: '250px', animationDelay: '1.5s', opacityClass: 'opacity-30 dark:opacity-20' }, // Central e maior
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow">
        {/* Seção Hero */}
        <motion.section
          ref={heroRef}
          id="hero"
          className={`${sectionClasses} relative bg-gradient-to-br from-background to-muted dark:from-background dark:to-muted/50`}
          style={{ opacity: heroBgOpacity }}
        >
          {/* Luminous Spots */}
          {spots.map((spot, index) => (
            <LuminousSpot
              key={index}
              className={spot.opacityClass}
              style={{
                top: spot.top,
                left: spot.left,
                width: spot.width,
                height: spot.height,
                animationDelay: spot.animationDelay,
                // As animações de pulse-glow e subtle-float serão aplicadas pela classe .luminous-spot
              }}
            />
          ))}

          <motion.div
            className="relative z-10 text-center flex flex-col items-center"
            style={{ y: heroTextY }} // Aplicando parallax ao container do texto
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <motion.h1
              className="text-6xl md:text-8xl lg:text-9xl font-extrabold mb-6 tracking-tighter 
                         flex flex-wrap items-baseline justify-center" // Adicionado flex, flex-wrap, items-baseline, justify-center
              variants={fadeIn}
            >
              {acronymParts.map((part, index) => (
                <React.Fragment key={part.char}>
                  <AcronymLetter char={part.char} fullWord={part.fullWord} />
                  {index < acronymParts.length - 1 && (
                    <motion.span
                      className="text-primary/50 dark:text-primary/40" // Estilo para o ponto
                      style={{ margin: '0 0.05em' }} // Espaçamento para o ponto, ajuste se o tracking-tighter estiver ativo
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }} // Delay para os pontos aparecerem
                    >
                      .
                    </motion.span>
                  )}
                </React.Fragment>
              ))}
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-foreground/80 dark:text-foreground/70 mb-10 max-w-3xl mx-auto leading-relaxed"
              style={{ opacity: heroSubtitleOpacity }} // Parallax para o subtítulo
              variants={fadeIn}
            >
              <span className={`${gradientTextClasses} font-semibold`}>Robô Analisador e Identificador de Oportunidades</span><br/>
              Transforme dados em decisões, feedback em crescimento. Descubra o poder da IA para otimizar sua performance.
            </motion.p>
            <motion.div variants={fadeIn}>
              <Link
                href="/dashboard"
                className="bg-primary hover:bg-primary/90 text-primary-foreground 
                           font-bold px-10 py-4 rounded-lg shadow-xl hover:shadow-2xl 
                           transition-all duration-300 ease-in-out transform hover:scale-105 text-lg
                           inline-flex items-center group"
              >
                Acessar Dashboard
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div 
              className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full"
              variants={cardContainerAnimation}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {[
                { icon: Zap, title: "Agilidade", text: "Respostas e análises em tempo recorde." },
                { icon: Target, title: "Precisão", text: "IA focada nos seus objetivos de negócio." },
                { icon: Lightbulb, title: "Inovação", text: "Descubra novas oportunidades e insights." },
              ].map(item => (
                <motion.div 
                  key={item.title} 
                  className="bg-background/70 dark:bg-muted/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 shadow-lg text-center"
                  variants={cardItemAnimation}
                >
                  <item.icon className={`h-10 w-10 mx-auto mb-3 ${gradientTextClasses} stroke-[1.5px]`} />
                  <h3 className="text-xl font-semibold mb-1 text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Seção Benefícios */}
        {/* Para aplicar parallax aqui, você usaria um padrão similar ao da Seção Hero:
            1. Adicione um `useRef` para a section.
            2. Use `useScroll` e `useTransform` para criar animações baseadas no scroll.
            3. Aplique os valores transformados aos `style` dos elementos `motion.*`.
            Exemplo:
            const beneficiosRef = useRef(null);
            const { scrollYProgress: beneficiosScrollY } = useScroll({ target: beneficiosRef, offset: ["start end", "end start"] });
            const beneficiosTitleY = useTransform(beneficiosScrollY, [0, 0.5], ['50px', '0px']);
            const beneficiosTitleOpacity = useTransform(beneficiosScrollY, [0, 0.5], [0, 1]);
            ...
            <motion.section ref={beneficiosRef} id="beneficios" className={`${sectionClasses} bg-card`}>
              <motion.h2 style={{ y: beneficiosTitleY, opacity: beneficiosTitleOpacity }} ...>
        */}
        <section id="beneficios" className={`${sectionClasses} bg-card`}>
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
            {/* ... existing code ... */}
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
                             flex flex-col items-center"
                  variants={cardItemAnimation}
                >
                  <div className="p-3 rounded-full bg-primary text-primary-foreground mb-4">
                    <beneficio.icon size={28} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{beneficio.title}</h3>
                  <p className="text-sm text-muted-foreground">{beneficio.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Seção Funcionalidades */}
        {/* Aplicar parallax de forma similar */}
        <section id="funcionalidades" className={`${sectionClasses} bg-gradient-to-br from-background to-muted dark:from-background dark:to-muted/50`}>
          {/* ... existing code ... */}
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
        {/* Aplicar parallax de forma similar */}
        <section id="sobre" className={`${sectionClasses} bg-card`}>
          {/* ... existing code ... */}
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
        {/* Aplicar parallax de forma similar */}
        <section id="contato" className={`${sectionClasses} bg-gradient-to-br from-background to-muted dark:from-background dark:to-muted/50`}>
          {/* ... existing code ... */}
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
                           transition-all duration-300 ease-in-out transform hover:scale-105 text-lg"
              >
                Fale Conosco
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      {/* Para o Footer, o parallax pode ser um pouco diferente, talvez um efeito "sticky" ou de revelação sutil.
          Você pode envolvê-lo em um <motion.footer> e aplicar transformações baseadas no scrollYProgress geral da página
          ou de um ref específico próximo ao final da página.
      */}
      <Footer />
    </div>
  );
}