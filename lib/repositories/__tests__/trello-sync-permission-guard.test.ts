import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("trello sync permission guard", () => {
  const boardsPage = read("app/(app)/boards/page.tsx");
  const syncRoute = read("app/api/trello/sync/route.ts");

  it("keeps the Trello sync UI behind board edit permission", () => {
    const submitSync = boardsPage.slice(
      boardsPage.indexOf("async function submitTrelloSync"),
      boardsPage.indexOf("if (openBoard)")
    );

    expect(submitSync).toContain("if (!canEdit)");
    expect(submitSync).toContain("return;");
    expect(boardsPage).toContain("{canEdit && (");
    expect(boardsPage).toContain("Atualizar do Trello");
    expect(boardsPage).toContain("Novo quadro");
  });

  it("keeps the Trello sync API behind editor roles before writes", () => {
    expect(syncRoute).toContain('.select("workspace_id, role")');
    expect(syncRoute).toContain('["owner", "admin", "gestor"].includes(String(membership.role))');
    expect(syncRoute).toContain("Apenas perfis com permissao de edicao podem sincronizar o Trello.");

    const permissionCheckIndex = syncRoute.indexOf('["owner", "admin", "gestor"]');
    const trelloFetchIndex = syncRoute.indexOf("trelloRequest<TrelloBoard>");
    const boardWriteIndex = syncRoute.indexOf('upsertByExternalId<{ id: string }>(supabase, "boards"');

    expect(permissionCheckIndex).toBeGreaterThan(-1);
    expect(trelloFetchIndex).toBeGreaterThan(permissionCheckIndex);
    expect(boardWriteIndex).toBeGreaterThan(permissionCheckIndex);
  });
});
