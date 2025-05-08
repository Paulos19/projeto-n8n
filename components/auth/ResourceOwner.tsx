import { useSession } from "next-auth/react";

const ResourceOwner = ({ children, resourceUserId }: { 
  children: React.ReactNode,
  resourceUserId: string 
}) => {
  const { data: session } = useSession();
  
  if (session?.user?.id !== resourceUserId) {
    return <div>Acesso não autorizado</div>;
  }

  return <>{children}</>;
};