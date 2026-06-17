"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { ClientModal } from "@/components/clientes/ClientModal";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/repositories/clients";
import type { Client } from "@/lib/types";

type CreateClientButtonProps = Omit<ButtonProps, "onClick"> & {
  onCreated?: (client: Client) => void;
};

export function CreateClientButton({
  children,
  onCreated,
  variant = "primary",
  ...props
}: CreateClientButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)} {...props}>
        {children ?? (
          <>
            <UserPlus className="h-4 w-4" />
            Novo cliente
          </>
        )}
      </Button>
      <ClientModal
        open={open}
        onOpenChange={setOpen}
        onSubmit={async (input) => {
          try {
            const client = await createClient({
              name: input.name,
              bandeira: input.bandeira,
              plan: input.plan,
            });
            onCreated?.(client);
            toast("Cliente criado no Supabase.");
          } catch (error) {
            console.error(error);
            toast("Nao foi possivel criar o cliente.");
          }
        }}
      />
    </>
  );
}
