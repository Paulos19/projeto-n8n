'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Bot, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

type PageType = 'termos' | 'privacidade';

interface CompanyInfo {
    companyName: string;
    companyWebsite: string;
    services: string;
    dataCollected: string;
    targetCountry: string;
}

export function ContentEditor() {
    const [selectedPage, setSelectedPage] = useState<PageType>('termos');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Estado para as informações do modal
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
        companyName: 'R.A.I.O',
        companyWebsite: 'https://raio.com.br',
        services: 'Plataforma SaaS de análise de dados de atendimento e feedback de clientes usando IA.',
        dataCollected: 'Nome, e-mail, CPF/CNPJ (identificador), dados de uso da plataforma, avaliações, histórico de conversas com clientes.',
        targetCountry: 'Brasil',
    });

    const fetchContent = useCallback(async (page: PageType) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/legal-content/${page}`);
            if (!res.ok) throw new Error("Conteúdo não encontrado ou falha na API.");
            const data = await res.json();
            setContent(data?.content || '');
        } catch (error) {
            toast.error("Falha ao carregar conteúdo.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContent(selectedPage);
    }, [selectedPage, fetchContent]);

    const handleSave = async () => {
        setIsSaving(true);
        const toastId = toast.loading("Salvando conteúdo...");
        try {
            const res = await fetch(`/api/admin/legal-content/${selectedPage}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            });
            if (!res.ok) throw new Error("Falha ao salvar.");
            toast.success("Conteúdo salvo com sucesso!");
        } catch (error) {
            toast.error("Erro ao salvar o conteúdo.");
        } finally {
            setIsSaving(false);
            toast.dismiss(toastId);
        }
    };
    
    const handleGenerateSuggestion = async (e: FormEvent) => {
        e.preventDefault();
        setIsSuggesting(true);
        const toastId = toast.loading("Gerando sugestão com a IA...");
        try {
            const res = await fetch('/api/admin/legal-content/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pageType: selectedPage, currentContent: content, companyInfo }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Falha ao gerar sugestão.");
            
            setContent(data.suggestion);
            toast.success("Sugestão aplicada ao editor!");
            setIsModalOpen(false); // Fecha o modal após sucesso
        } catch (error: any) {
            toast.error("Erro ao gerar sugestão", { description: error.message });
        } finally {
            setIsSuggesting(false);
            toast.dismiss(toastId);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Editor de Conteúdo</CardTitle>
                        <Select value={selectedPage} onValueChange={(v) => setSelectedPage(v as PageType)} disabled={isLoading || isSuggesting || isSaving}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Selecione uma página" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="termos">Termos de Uso</SelectItem>
                                <SelectItem value="privacidade">Privacidade</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <CardDescription>Edite o conteúdo em Markdown. As alterações serão refletidas publicamente.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? <LoadingSpinner /> : (
                        <Textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="h-[500px] font-mono text-sm"
                            placeholder="Digite o conteúdo em Markdown aqui..."
                        />
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" disabled={isSuggesting || isLoading}>
                                <Bot className="mr-2 h-4 w-4" />
                                Sugerir com IA
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <form onSubmit={handleGenerateSuggestion}>
                                <DialogHeader>
                                    <DialogTitle>Contexto para a Inteligência Artificial</DialogTitle>
                                    <DialogDescription>
                                        Forneça detalhes sobre a sua empresa para gerar um documento mais preciso.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="companyName" className="text-right">Nome da Empresa</Label>
                                        <Input id="companyName" value={companyInfo.companyName} onChange={(e) => setCompanyInfo({...companyInfo, companyName: e.target.value})} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="companyWebsite" className="text-right">Website</Label>
                                        <Input id="companyWebsite" value={companyInfo.companyWebsite} onChange={(e) => setCompanyInfo({...companyInfo, companyWebsite: e.target.value})} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="services" className="text-right">Serviços</Label>
                                        <Textarea id="services" value={companyInfo.services} onChange={(e) => setCompanyInfo({...companyInfo, services: e.target.value})} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="dataCollected" className="text-right">Dados Coletados</Label>
                                        <Textarea id="dataCollected" value={companyInfo.dataCollected} onChange={(e) => setCompanyInfo({...companyInfo, dataCollected: e.target.value})} className="col-span-3" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                                    <Button type="submit" disabled={isSuggesting}>
                                        {isSuggesting ? "Gerando..." : "Gerar Sugestão"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Button onClick={handleSave} disabled={isSaving || isLoading}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "Salvando..." : "Salvar Conteúdo"}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pré-visualização</CardTitle>
                    <CardDescription>Como o conteúdo aparecerá para os usuários.</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none h-[560px] overflow-y-auto border rounded-md p-4">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                </CardContent>
            </Card>
        </div>
    );
}
