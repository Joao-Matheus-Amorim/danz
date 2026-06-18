import { describe, it, expect } from "vitest";
import {
  createClient,
  deleteClient,
  listClients,
  updateClient,
} from "@/lib/repositories/clients";

// Sem env de Supabase nos testes, os repositorios operam no store mock mutavel.
describe("clients repository (mock mode)", () => {
  it("creates a client with uppercased name and trimmed bandeira", async () => {
    const created = await createClient({
      name: "  padaria do ze ",
      bandeira: " Sorriso ",
      plan: "Pro",
    });

    expect(created.name).toBe("PADARIA DO ZE");
    expect(created.bandeira).toBe("Sorriso");
    expect(created.plan).toBe("Pro");
    expect(created.status).toBe("ativo");

    const list = await listClients();
    expect(list.some((client) => client.id === created.id)).toBe(true);
  });

  it("updates an existing client", async () => {
    const created = await createClient({
      name: "acme",
      bandeira: "-",
      plan: "Essencial",
    });

    const updated = await updateClient(created.id, {
      name: "acme dois",
      bandeira: "Nova",
      plan: "Premium",
      status: "pausado",
      managerId: null,
    });

    expect(updated.name).toBe("ACME DOIS");
    expect(updated.bandeira).toBe("Nova");
    expect(updated.plan).toBe("Premium");
    expect(updated.status).toBe("pausado");
  });

  it("rejects an empty name on update", async () => {
    const created = await createClient({
      name: "x",
      bandeira: "-",
      plan: "Essencial",
    });

    await expect(
      updateClient(created.id, {
        name: "   ",
        bandeira: "-",
        plan: "Essencial",
        status: "ativo",
        managerId: null,
      })
    ).rejects.toThrow();
  });

  it("deletes a client", async () => {
    const created = await createClient({
      name: "temp",
      bandeira: "-",
      plan: "Essencial",
    });

    await deleteClient(created.id);

    const list = await listClients();
    expect(list.some((client) => client.id === created.id)).toBe(false);
  });
});
