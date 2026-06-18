"use client";

import * as React from "react";
import { RefreshCw, Plus, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BoardGrid } from "@/components/boards/BoardGrid";
import { KanbanBoard } from "@/components/boards/KanbanBoard";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useRole } from "@/lib/role/RoleContext";
import {
  createBoard,
  createBoardCard,
  deleteBoard,
  deleteBoardCard,
  getBoardDetail,
  listBoards,
  syncTrelloBoard,
  updateBoardCard,
  updateBoardCardPositions,
} from "@/lib/repositories/boards";
import type { Board, BoardCard, BoardColumn } from "@/lib/types";

export default function BoardsPage() {
  const { toast } = useToast();
  const { canEdit, canDelete } = useRole();
  const [boards, setBoards] = React.useState<Board[]>([]);
  const [openBoardId, setOpenBoardId] = React.useState<string | null>(null);
  const [columns, setColumns] = React.useState<BoardColumn[]>([]);
  const [cards, setCards] = React.useState<BoardCard[]>([]);
  const [loadingBoards, setLoadingBoards] = React.useState(true);
  const [loadingBoardDetail, setLoadingBoardDetail] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [boardTitle, setBoardTitle] = React.useState("");
  const [creatingBoard, setCreatingBoard] = React.useState(false);
  const [syncingTrello, setSyncingTrello] = React.useState(false);
  const [boardToDelete, setBoardToDelete] = React.useState<Board | null>(null);
  const [pendingBoardId, setPendingBoardId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    listBoards()
      .then((items) => {
        if (mounted) setBoards(items);
      })
      .catch((error) => {
        console.error(error);
        if (mounted) toast("Nao foi possivel carregar os quadros.");
      })
      .finally(() => {
        if (mounted) setLoadingBoards(false);
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  React.useEffect(() => {
    if (!openBoardId) {
      setColumns([]);
      setCards([]);
      return;
    }

    let mounted = true;
    setLoadingBoardDetail(true);

    getBoardDetail(openBoardId)
      .then((detail) => {
        if (!mounted) return;
        setColumns(detail.columns);
        setCards(detail.cards);
      })
      .catch((error) => {
        console.error(error);
        if (mounted) toast("Nao foi possivel carregar o quadro.");
      })
      .finally(() => {
        if (mounted) setLoadingBoardDetail(false);
      });

    return () => {
      mounted = false;
    };
  }, [openBoardId, toast]);

  const openBoard = boards.find((b) => b.id === openBoardId) ?? null;

  async function submitBoard() {
    if (!boardTitle.trim()) return;

    setCreatingBoard(true);
    try {
      const board = await createBoard(boardTitle);
      setBoards((prev) => [board, ...prev]);
      setBoardTitle("");
      setCreateOpen(false);
      toast("Quadro criado no Supabase.");
    } catch (error) {
      console.error(error);
      toast("Nao foi possivel criar o quadro.");
    } finally {
      setCreatingBoard(false);
    }
  }

  async function refreshBoards() {
    const items = await listBoards();
    setBoards(items);
  }

  async function handleConfirmDeleteBoard() {
    const board = boardToDelete;
    if (!board || pendingBoardId) return;
    const previous = boards;
    setPendingBoardId(board.id);
    setBoards((prev) => prev.filter((item) => item.id !== board.id));

    try {
      await deleteBoard(board.id);
      toast("Quadro excluido.");
      setBoardToDelete(null);
    } catch (error) {
      console.error(error);
      setBoards(previous);
      toast("Nao foi possivel excluir o quadro.");
    } finally {
      setPendingBoardId(null);
    }
  }

  async function submitTrelloSync() {
    if (!canEdit) {
      toast("Apenas perfis com permissao de edicao podem sincronizar o Trello.");
      return;
    }

    setSyncingTrello(true);
    try {
      const result = await syncTrelloBoard();
      await refreshBoards();
      toast(`Trello sincronizado: ${result.lists} listas e ${result.cards} cards.`);
    } catch (error) {
      console.error(error);
      toast(error instanceof Error ? error.message : "Nao foi possivel sincronizar o Trello.");
    } finally {
      setSyncingTrello(false);
    }
  }

  if (openBoard) {
    return (
      <div className="space-y-6">
        <PageHeader
          label="Boards"
          title={openBoard.title}
          subtitle={`${columns.length} listas - ${cards.length} cards - arraste para reorganizar`}
          actions={
            <Button variant="secondary" onClick={() => setOpenBoardId(null)}>
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
          }
        />
        {loadingBoardDetail ? (
          <div className="rounded-2xl border border-white/[0.06] bg-surface-muted p-8 text-center text-sm text-content-muted">
            Carregando quadro...
          </div>
        ) : (
          <KanbanBoard
            columns={columns}
            initialCards={cards}
            canEdit={canEdit}
            canDelete={canDelete}
            onCardsChange={async (nextCards) => {
              setCards(nextCards);
              await updateBoardCardPositions(nextCards);
              setBoards((prev) =>
                prev.map((board) =>
                  board.id === openBoard.id ? { ...board, cardsCount: nextCards.length } : board
                )
              );
            }}
            onCreateCard={async (columnId, title, position) => {
              const card = await createBoardCard({
                boardId: openBoard.id,
                columnId,
                title,
                position,
              });
              setCards((prev) => [...prev, card]);
              setBoards((prev) =>
                prev.map((board) =>
                  board.id === openBoard.id
                    ? { ...board, cardsCount: board.cardsCount + 1 }
                    : board
                )
              );
              toast("Card criado no Supabase.");
            }}
            onUpdateCard={async (cardId, input) => {
              const updated = await updateBoardCard(cardId, {
                boardId: openBoard.id,
                title: input.title,
                description: input.description,
              });
              setCards((prev) =>
                prev.map((card) => (card.id === updated.id ? updated : card))
              );
              toast("Card atualizado.");
            }}
            onDeleteCard={async (card) => {
              await deleteBoardCard(card.id, openBoard.id);
              setCards((prev) => prev.filter((item) => item.id !== card.id));
              setBoards((prev) =>
                prev.map((board) =>
                  board.id === openBoard.id
                    ? { ...board, cardsCount: Math.max(0, board.cardsCount - 1) }
                    : board
                )
              );
              toast("Card excluido.");
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        label="Boards"
        title="QUADROS ESTILO TRELLO"
        subtitle="Organize fluxos visuais com listas, cards, labels e checklists."
        actions={
          <>
            {canEdit && (
              <Button
                variant="secondary"
                onClick={() => void submitTrelloSync()}
                disabled={syncingTrello}
              >
                <RefreshCw className={syncingTrello ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                {syncingTrello ? "Sincronizando..." : "Atualizar do Trello"}
              </Button>
            )}
            {canEdit && (
              <Button variant="primary" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" /> Novo quadro
              </Button>
            )}
          </>
        }
      />
      {loadingBoards ? (
        <div className="rounded-2xl border border-white/[0.06] bg-surface-muted p-8 text-center text-sm text-content-muted">
          Carregando quadros...
        </div>
      ) : (
        <BoardGrid
          boards={boards}
          onOpen={setOpenBoardId}
          onDelete={canDelete ? setBoardToDelete : undefined}
          pendingId={pendingBoardId}
        />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-content">
              Novo quadro
            </DialogTitle>
            <DialogDescription className="text-sm text-content-muted">
              Cria um quadro com as listas padrao e persistencia no Supabase.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="board-title">Nome do quadro</Label>
            <Input
              id="board-title"
              value={boardTitle}
              onChange={(event) => setBoardTitle(event.target.value)}
              placeholder="Ex.: Conteudo mensal"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)} disabled={creatingBoard}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={() => void submitBoard()} disabled={creatingBoard}>
              {creatingBoard ? "Criando..." : "Criar quadro"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={boardToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setBoardToDelete(null);
        }}
        title="Excluir quadro"
        description={
          <>
            Tem certeza que deseja excluir
            {boardToDelete ? ` "${boardToDelete.title}"` : " este quadro"}? As listas
            e os cards do quadro tambem serao removidos. Essa acao nao pode ser
            desfeita.
          </>
        }
        confirmLabel="Excluir quadro"
        pendingLabel="Excluindo..."
        pending={pendingBoardId !== null}
        onConfirm={() => void handleConfirmDeleteBoard()}
      />
    </div>
  );
}
