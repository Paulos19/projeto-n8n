'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion';
import { Zap, Target, BarChartBig, Lightbulb, ArrowRight, ChevronUp, Menu, X, BotMessageSquare, SearchCheck, TrendingUp, UploadCloud, CheckCircle } from 'lucide-react';

// Importando Navbar e Footer existentes
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// --- Configurações Globais de Animação e Estilo ---
const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-500";
// Estilo padrão para botões
const standardButtonClasses = "px-8 py-3 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 inline-flex items-center justify-center";

const fadeIn = (direction = 'up', delay = 0, duration = 0.5) => ({
  hidden: {
    opacity: 0,
    y: direction === 'up' ? 20 : direction === 'down' ? -20 : 0,
    x: direction === 'left' ? 20 : direction === 'right' ? -20 : 0,
  },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: {
      delay,
      duration,
      ease: 'easeOut',
    },
  },
});

const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

// --- Componentes de UI ---

// Botão Personalizado (Estilo Padrão)
const Button = ({ children, onClick, className, icon: Icon, iconPosition = 'right' }: { children: React.ReactNode, onClick?: () => void, className?: string, icon?: React.ElementType, iconPosition?: 'left' | 'right' }) => {
  return (
    <motion.button
      onClick={onClick}
      className={`${standardButtonClasses} ${className || ''}`} // Adicionado className opcional
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {Icon && iconPosition === 'left' && <Icon size={20} className="mr-2" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={20} className="ml-2" />}
    </motion.button>
  );
};

// Card de Funcionalidade
const FeatureCard = ({ icon: Icon, title, description, index }: { icon: React.ElementType, title: string, description: string, index: number }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  return (
    <motion.div
      ref={ref}
      className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl hover:shadow-sky-500/30 transition-shadow duration-300 flex flex-col items-center text-center"
      initial="hidden"
      animate={controls}
      variants={fadeIn('up', index * 0.15, 0.6)}
    >
      <div className="p-4 bg-gradient-to-br from-sky-500 to-cyan-400 rounded-full inline-block mb-6">
        <Icon size={32} className="text-white" />
      </div>
      <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
    </motion.div>
  );
};

// --- Componentes de Layout (AGORA IMPORTADOS) ---
// Navbar e Footer são importados do início do arquivo.

// Scroll to Top Button
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (typeof window !== 'undefined' && window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', toggleVisibility);
      return () => window.removeEventListener('scroll', toggleVisibility);
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-sky-600 hover:bg-sky-700 text-white p-4 rounded-full shadow-lg z-40"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3 }}
          aria-label="Voltar ao topo"
        >
          <ChevronUp size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};


// --- Seções da Página ---

// Seção Hero
const HeroSection = () => {
  const title = "R.A.I.O";
  const subtitle = "Desvende o Potencial dos Seus Dados com Inteligência Artificial";
  const description = "O R.A.I.O é a plataforma SaaS que transforma feedback de clientes e dados de mercado em insights acionáveis, impulsionando o crescimento e a inovação do seu negócio.";

  const titleVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const letterVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', damping: 12, stiffness: 200 },
    },
  };
  
  const redirectToDashboard = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 dark:from-slate-900 via-sky-50 dark:via-slate-800 to-emerald-50 dark:to-slate-900 py-20 pt-32 md:pt-20 relative overflow-hidden">
      {/* Elementos de fundo decorativos */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-sky-300/30 dark:bg-sky-700/30 rounded-full filter blur-3xl opacity-70 animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-emerald-300/30 dark:bg-emerald-700/30 rounded-full filter blur-3xl opacity-70 animate-pulse animation-delay-2000"></div>
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.h1
          className="text-7xl md:text-8xl lg:text-9xl font-extrabold mb-6"
          variants={titleVariants}
          initial="hidden"
          animate="visible"
        >
          {title.split("").map((char, index) => (
            <motion.span key={index} variants={letterVariant} className={gradientText}>
              {char}
            </motion.span>
          ))}
        </motion.h1>
        <motion.h2 
          className="text-2xl md:text-3xl lg:text-4xl font-semibold text-slate-700 dark:text-slate-200 mb-8 max-w-3xl mx-auto"
          variants={fadeIn('up', 0.5, 0.7)}
          initial="hidden"
          animate="visible"
        >
          {subtitle}
        </motion.h2>
        <motion.p 
          className="text-lg text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed"
          variants={fadeIn('up', 0.8, 0.7)}
          initial="hidden"
          animate="visible"
        >
          {description}
        </motion.p>
        <motion.div
          variants={fadeIn('up', 1.1, 0.7)}
          initial="hidden"
          animate="visible"
        >
          <Button onClick={redirectToDashboard} icon={ArrowRight}>
            Acessar o Dashboard
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

// Seção Problema/Solução
const ProblemSolutionSection = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);
  
  const redirectToDashboard = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  return (
    <section id="problema" className="py-20 bg-white dark:bg-slate-800">
      <div className="container mx-auto px-6">
        <motion.div 
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={staggerContainer(0.2)}
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-center mb-6 text-slate-800 dark:text-white"
            variants={fadeIn('up')}
          >
            O Volume de Dados te <span className={gradientText}>Sobrecarrega?</span>
          </motion.h2>
          <motion.p 
            className="text-xl text-slate-600 dark:text-slate-300 text-center max-w-3xl mx-auto mb-16 leading-relaxed"
            variants={fadeIn('up')}
          >
            Empresas coletam montanhas de feedback e dados de mercado, mas extrair valor real é um desafio constante. A sobrecarga de informações pode levar a oportunidades perdidas e decisões lentas.
          </motion.p>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeIn('right')}>
              <img 
                src="https://placehold.co/600x400/E2E8F0/4A5568?text=Visualiza%C3%A7%C3%A3o+de+Dados+Simplificada" 
                alt="Visualização de dados complexos se tornando claros e compreensíveis" 
                className="rounded-xl shadow-xl w-full h-auto"
                onError={(e) => {
                    const target = e.currentTarget;
                    target.src = 'https://placehold.co/600x400/E2E8F0/4A5568?text=Erro+ao+carregar+imagem';
                    target.alt = 'Erro ao carregar imagem de visualização de dados';
                }}
              />
            </motion.div>
            <motion.div variants={fadeIn('left')}>
              <h3 className="text-3xl font-semibold text-slate-800 dark:text-white mb-4">R.A.I.O: A Clareza que Você Precisa</h3>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                Nossa Inteligência Artificial analisa, categoriza e prioriza automaticamente grandes volumes de texto e dados não estruturados.
              </p>
              <ul className="space-y-3 text-lg text-slate-600 dark:text-slate-300">
                <motion.li className="flex items-start" variants={fadeIn('left', 0.1)}>
                  <CheckCircle size={24} className="text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                  <span>Identifique tendências emergentes e sentimentos de clientes em tempo real.</span>
                </motion.li>
                <motion.li className="flex items-start" variants={fadeIn('left', 0.2)}>
                  <CheckCircle size={24} className="text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                  <span>Descubra oportunidades de inovação e melhoria de produtos/serviços.</span>
                </motion.li>
                <motion.li className="flex items-start" variants={fadeIn('left', 0.3)}>
                  <CheckCircle size={24} className="text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                  <span>Tome decisões estratégicas com base em evidências, não em suposições.</span>
                </motion.li>
              </ul>
              <motion.div variants={fadeIn('up', 0.4)} className="mt-8">
                <Button onClick={redirectToDashboard} className="bg-transparent border-2 border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white">
                  Explore a Solução
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Seção Funcionalidades
const FeaturesSection = () => {
  const features = [
    {
      icon: BotMessageSquare,
      title: "Análise de Sentimento Avançada",
      description: "Compreenda as emoções e opiniões por trás do feedback do cliente com alta precisão, identificando nuances e contextos.",
    },
    {
      icon: SearchCheck,
      title: "Identificação de Tópicos Chave",
      description: "Extraia automaticamente os temas e assuntos mais relevantes das conversas, e-mails e avaliações.",
    },
    {
      icon: TrendingUp,
      title: "Detecção de Tendências e Padrões",
      description: "Antecipe movimentos de mercado e necessidades dos clientes ao identificar padrões e tendências emergentes nos dados.",
    },
    {
      icon: Target,
      title: "Priorização Inteligente de Insights",
      description: "Filtre o ruído e concentre-se nos insights mais críticos e acionáveis para o seu negócio através de dashboards intuitivos.",
    },
  ];

  return (
    <section id="funcionalidades" className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-6">
        <motion.h2 
          className="text-4xl md:text-5xl font-bold text-center mb-6 text-slate-800 dark:text-white"
          variants={fadeIn('up')} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
        >
          Funcionalidades <span className={gradientText}>Poderosas</span>
        </motion.h2>
        <motion.p 
          className="text-xl text-slate-600 dark:text-slate-300 text-center max-w-3xl mx-auto mb-16 leading-relaxed"
          variants={fadeIn('up', 0.1)} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
        >
          O R.A.I.O está equipado com ferramentas de IA de ponta para transformar a maneira como você interage e compreende seus dados.
        </motion.p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Seção Como Funciona
const HowItWorksSection = () => {
  const steps = [
    {
      icon: UploadCloud,
      title: "1. Coleta de Dados",
      description: "Integre facilmente suas fontes de dados: feedback de clientes, redes sociais, e-mails, pesquisas e mais.",
    },
    {
      icon: Zap,
      title: "2. Processamento com IA",
      description: "Nossa IA analisa, classifica e extrai insights valiosos dos dados brutos em tempo real.",
    },
    {
      icon: BarChartBig,
      title: "3. Visualização e Ação",
      description: "Acesse dashboards interativos, relatórios personalizados e alertas para tomar decisões informadas.",
    },
  ];

  return (
    <section id="como-funciona" className="py-20 bg-white dark:bg-slate-800">
      <div className="container mx-auto px-6">
        <motion.h2 
          className="text-4xl md:text-5xl font-bold text-center mb-6 text-slate-800 dark:text-white"
          variants={fadeIn('up')} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
        >
          Como o R.A.I.O <span className={gradientText}>Transforma</span> Seus Dados
        </motion.h2>
        <motion.p 
          className="text-xl text-slate-600 dark:text-slate-300 text-center max-w-3xl mx-auto mb-16 leading-relaxed"
          variants={fadeIn('up', 0.1)} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
        >
          Um processo simples e poderoso, projetado para entregar valor rapidamente e de forma contínua.
        </motion.p>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-center"
              variants={fadeIn('up', index * 0.2, 0.6)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <div className="inline-block p-5 bg-gradient-to-br from-sky-100 to-emerald-100 dark:from-sky-800 dark:to-emerald-800 rounded-full mb-6">
                 <step.icon size={40} className={`${gradientText}`} />
              </div>
              <h3 className="text-2xl font-semibold text-slate-800 dark:text-white mb-3">{step.title}</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};


// Seção CTA Final
const CtaSection = () => {
  const redirectToDashboard = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  return (
    <section id="contato" className="py-20 bg-gradient-to-br from-sky-600 via-cyan-500 to-emerald-500 text-white">
      <div className="container mx-auto px-6 text-center">
        <motion.h2 
          className="text-4xl md:text-5xl font-bold mb-6"
          variants={fadeIn('up')} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
        >
          Pronto para Iluminar Suas Decisões?
        </motion.h2>
        <motion.p 
          className="text-xl text-sky-100/90 max-w-2xl mx-auto mb-10 leading-relaxed"
          variants={fadeIn('up', 0.1)} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
        >
          Descubra como o R.A.I.O pode revolucionar sua análise de dados e impulsionar resultados. Acesse a plataforma e veja o poder da IA em ação.
        </motion.p>
        <motion.div 
          className="space-y-4 sm:space-y-0 sm:space-x-6 flex flex-col sm:flex-row justify-center items-center"
          variants={fadeIn('up', 0.2)} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
        >
          <Button 
            onClick={redirectToDashboard}
            className="bg-white text-sky-600 hover:bg-slate-100 px-10 py-4 text-lg" // Estilo diferenciado para o CTA principal
            icon={Lightbulb}
          >
            Acessar Dashboard
          </Button>
        </motion.div>
      </div>
    </section>
  );
};


// Componente Principal da Aplicação
const App = () => {

  return (
    <div className="font-sans antialiased text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 selection:bg-sky-300/70 selection:text-sky-900">
      <Navbar /> {/* Navbar importada */}
      <main>
        <HeroSection />
        <ProblemSolutionSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CtaSection />
      </main>
      <Footer /> {/* Footer importado */}
      <ScrollToTopButton />
    </div>
  );
};

export default App;

