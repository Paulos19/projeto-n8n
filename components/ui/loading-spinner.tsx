// components/ui/loading-spinner.tsx
export function LoadingSpinner({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="flex flex-col justify-center items-center py-10">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-3"></div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}