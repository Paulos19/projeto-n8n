'use client'

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { Icon: Facebook, href: "#", label: "Facebook" },
    { Icon: Twitter, href: "#", label: "Twitter" },
    { Icon: Instagram, href: "#", label: "Instagram" },
    { Icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  const footerSections = [
    {
      title: "Empresa",
      links: [
        { href: "#sobre", label: "Sobre Nós" },
        { href: "#carreiras", label: "Carreiras" },
        { href: "#imprensa", label: "Imprensa" },
      ],
    },
    {
      title: "Recursos",
      links: [
        { href: "#blog", label: "Blog" },
        { href: "#faq", label: "FAQ" },
        { href: "#suporte", label: "Suporte" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "#termos", label: "Termos de Serviço" },
        { href: "#privacidade", label: "Política de Privacidade" },
      ],
    },
  ];

  return (
    <footer className="bg-card text-card-foreground pt-16 pb-8"> {}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="mb-6 md:mb-0 lg:col-span-1">
            <Link href="/" className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-green-300 mb-2 inline-block"> {}
              R.A.I.O
            </Link>
            <p className="text-sm text-muted-foreground"> {}
              Potencialize seu negócio com insights e gerenciamento inteligente.
            </p>
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors" 
                  aria-label={social.label}
                  whileHover={{ y: -2, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.Icon size={24} />
                </motion.a>
              ))}
            </div>
          </div>

          {}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h5 className="text-lg font-semibold text-foreground mb-4">{section.title}</h5> {}
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href={link.href}
                        className="hover:text-primary transition-colors text-sm text-muted-foreground" 
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 text-center"> {}
          <p className="text-sm text-muted-foreground"> {}
            &copy; {currentYear} R.A.I.O. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}