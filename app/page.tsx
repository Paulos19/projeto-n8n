import Navbar from "@/components/layout/Navbar"; // Ajuste o caminho se necessário
import Footer from "@/components/layout/Footer"; // Ajuste o caminho se necessário

export default function Home() {
  const sectionClasses = "min-h-screen flex items-center justify-center p-8 text-white";
  const sectionTitleClasses = "text-4xl md:text-5xl font-bold mb-8 text-center";
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-green-300";

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Navbar />
      <main className="flex-grow">
        {/* Seção Hero */}
        <section id="hero" className={`${sectionClasses} bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900`}>
          <div className="text-center">
            <h1 className={`${sectionTitleClasses} ${gradientText} drop-shadow-lg`}>
              Bem-vindo ao R.A.I.O
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Transforme a gestão do seu negócio com a inteligência e agilidade que só o R.A.I.O oferece. Acesse seu dashboard e descubra um novo universo de possibilidades.
            </p>
            {/* Adicionar CTA Button aqui depois */}
          </div>
        </section>

        {/* Seção Benefícios */}
        <section id="beneficios" className={`${sectionClasses} bg-gray-800`}>
          <div className="text-center">
            <h2 className={`${sectionTitleClasses} ${gradientText}`}>Benefícios Incríveis</h2>
            <p className="text-gray-300">Conteúdo sobre os benefícios do R.A.I.O...</p>
          </div>
        </section>

        {/* Seção Funcionalidades */}
        <section id="funcionalidades" className={`${sectionClasses} bg-gray-900`}>
          <div className="text-center">
            <h2 className={`${sectionTitleClasses} ${gradientText}`}>Funcionalidades Poderosas</h2>
            <p className="text-gray-300">Detalhes das funcionalidades...</p>
          </div>
        </section>

        {/* Seção Possibilidades / Como Funciona */}
        <section id="possibilidades" className={`${sectionClasses} bg-gray-800`}>
          <div className="text-center">
            <h2 className={`${sectionTitleClasses} ${gradientText}`}>Explore as Possibilidades</h2>
            <p className="text-gray-300">Como o R.A.I.O pode ajudar seu negócio...</p>
          </div>
        </section>

        {/* Seção Depoimentos (Opcional, mas bom para UI/UX) */}
        <section id="depoimentos" className={`${sectionClasses} bg-gray-900`}>
          <div className="text-center">
            <h2 className={`${sectionTitleClasses} ${gradientText}`}>O Que Nossos Clientes Dizem</h2>
            <p className="text-gray-300">Depoimentos de clientes satisfeitos...</p>
          </div>
        </section>

        {/* Seção CTA (Call to Action) / Planos */}
        <section id="cta" className={`${sectionClasses} bg-gradient-to-tr from-indigo-900 via-blue-900 to-gray-900`}>
          <div className="text-center">
            <h2 className={`${sectionTitleClasses} ${gradientText}`}>Pronto para Começar?</h2>
            <p className="text-gray-300">Informações sobre planos ou um CTA final...</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}