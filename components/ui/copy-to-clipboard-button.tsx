'use client';

import { useState, HTMLAttributes } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assumindo que você tem um utilitário cn

interface CopyToClipboardButtonProps extends HTMLAttributes<HTMLButtonElement> {
  textToCopy: string;
  buttonText?: string;
  copiedText?: string;
  iconSize?: number;
}

export function CopyToClipboardButton({
  textToCopy,
  buttonText = "Copiar",
  copiedText = "Copiado!",
  iconSize = 16,
  className,
  ...props
}: CopyToClipboardButtonProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = async () => {
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setHasCopied(true);
      setTimeout(() => {
        setHasCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Falha ao copiar texto: ', error);
      // Considere adicionar um feedback de erro para o usuário, ex: toast
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("p-1.5 h-auto flex items-center gap-1 text-xs", className)}
      onClick={onCopy}
      disabled={!textToCopy}
      {...props}
    >
      {hasCopied ? (
        <Check size={iconSize} className="text-green-500" />
      ) : (
        <Copy size={iconSize} />
      )}
      <span className="sr-only">{hasCopied ? copiedText : buttonText}</span>
    </Button>
  );
}