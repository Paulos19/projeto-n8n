'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AddSellerPage() {
  const [name, setName] = useState('');
  const [evolutionInstanceName, setEvolutionInstanceName] = useState('');
  const [evolutionApiKey, setEvolutionApiKey] = useState('');
  const [sellerWhatsAppNumber, setSellerWhatsAppNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!evolutionInstanceName || !evolutionApiKey || !sellerWhatsAppNumber) {
      setError('Por favor, preencha todos os campos obrigatórios: Nome da Instância Evolution, API Key da Evolution e Número do WhatsApp.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/sellers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name || undefined, // Envia undefined se vazio para que o backend possa tratar como null
          evolutionInstanceName,
          evolutionApiKey,
          sellerWhatsAppNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Falha ao adicionar vendedor.');
      }

      setSuccessMessage('Vendedor adicionado com sucesso! Redirecionando...');
      // Limpar formulário
      setName('');
      setEvolutionInstanceName('');
      setEvolutionApiKey('');
      setSellerWhatsAppNumber('');
      
      // Opcional: redirecionar para a lista de vendedores ou dashboard
      setTimeout(() => {
        router.push('/dashboard/sellers'); // Ou para onde fizer sentido
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  // Estilos básicos inline para demonstração. Use classes CSS em um projeto real.
  const inputStyle = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none";
  const labelStyle = "block text-sm font-medium text-slate-700";
  const buttonStyle = "mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-slate-400";


  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Adicionar Novo Vendedor</h1>
      
      {error && <p className="mb-4 text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
      {successMessage && <p className="mb-4 text-green-600 bg-green-100 p-3 rounded-md">{successMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className={labelStyle}>
            Nome do Vendedor (Opcional):
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputStyle}
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="evolutionInstanceName" className={labelStyle}>
            Nome da Instância Evolution (Ex: "Atendente01"):<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="evolutionInstanceName"
            value={evolutionInstanceName}
            onChange={(e) => setEvolutionInstanceName(e.target.value)}
            className={inputStyle}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="evolutionApiKey" className={labelStyle}>
            API Key da Evolution (da instância do vendedor):<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="evolutionApiKey"
            value={evolutionApiKey}
            onChange={(e) => setEvolutionApiKey(e.target.value)}
            className={inputStyle}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="sellerWhatsAppNumber" className={labelStyle}>
            Número do WhatsApp do Vendedor (Ex: 55119XXXXXXXX):<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="sellerWhatsAppNumber"
            value={sellerWhatsAppNumber}
            onChange={(e) => setSellerWhatsAppNumber(e.target.value)}
            placeholder="Formato internacional: 55DDDNUMERO"
            className={inputStyle}
            required
            disabled={isLoading}
          />
        </div>
        <button type="submit" className={buttonStyle} disabled={isLoading}>
          {isLoading ? 'Adicionando...' : 'Adicionar Vendedor'}
        </button>
      </form>
    </div>
  );
}