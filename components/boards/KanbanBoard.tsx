"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { KanbanColumn } from "@/components/boards/KanbanColumn";
import { KanbanCard } from "@/components/boards/KanbanCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import type { BoardCard, BoardColumn } from "@/lib/types";

export function KanbanBoard({
  columns,
  initialCards,
  onCardsChange,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
  canEdit = true,
  canDelete = true,
}: {
  columns: BoardColumn[];
  initialCards: BoardCard[];
  onCardsChange?: (cards: BoardCard[]) => Promise<void> | void;
  onCreateCard?: (columnId: string, title: string, position: number) => Promise<void> | void;
  onUpdateCard?: (
    cardId: string,
    input: { title: string; description?: string }
  ) => Promise<void> | void;
  onDeleteCard?: (card: BoardCard) => Promise<void> | void;
  canEdit?: boolean;
  canDelete?: boolean;
}) {
  const { toast } = useToast();
  const [cards, setCards] = React.useState<BoardCard[]>(initialCards);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [targetColumnId, setTargetColumnId] = React.useState<string | null>(null);
  const [cardTitle, setCardTitle] = React.useState("");
  const [creatingCard, setCreatingCard] = React.useState(false);
  const [editingCard, setEditingCard] = React.useState<BoardCard | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [savingCard, setSavingCard] = React.useState(false);
  const [cardToDelete, setCardToDelete] = React.useState<BoardCard | null>(null);
  const [pendingCardId, setPendingCardId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  React.useEffect(() => {
    if (!editingCard) return;
    setEditTitle(editingCard.title);
    setEditDescription(editingCard.description ?? "");
  }, [editingCard]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const cardsOf = React.useCallback(
    (columnId: string) =>
      cards
        .filter((c) => c.columnId === columnId)
        .sort((a, b) => a.order - b.order),
    [cards]
  );

  const findColumnId = React.useCallback(
    (id: string): string | undefined => {
      if (columns.some((c) => c.id === id)) return id;
      return cards.find((c) => c.id === id)?.columnId;
    },
    [cards, columns]
  );

  function buildNextCards(activeId: string, overId: string): BoardCard[] | null {
    const activeCol = findColumnId(activeId);
    const overCol = findColumnId(overId);
    if (!activeCol || !overCol || activeId === overId) return null;

    const activeCard = cards.find((c) => c.id === activeId);
    if (!activeCard) return null;

    if (activeCol === overCol) {
      const col = cards
        .filter((c) => c.columnId === activeCol)
        .sort((a, b) => a.order - b.order);
      const oldIndex = col.findIndex((c) => c.id === activeId);
      const newIndex =
        overId === overCol ? col.length - 1 : col.findIndex((c) => c.id === overId);
      if (oldIndex === -1 || newIndex === -1) return null;
      const reordered = arrayMove(col, oldIndex, newIndex).map((c, i) => ({
        ...c,
        order: i,
      }));
      return cards.map((c) => reordered.find((r) => r.id === c.id) ?? c);
    }

    const destCards = cards
      .filter((c) => c.columnId === overCol && c.id !== activeId)
      .sort((a, b) => a.order - b.order);
    const overIndex = destCards.findIndex((c) => c.id === overId);
    const insertIndex = overIndex === -1 ? destCards.length : overIndex;
    destCards.splice(insertIndex, 0, { ...activeCard, columnId: overCol });

    const reorderedDest = destCards.map((c, i) => ({ ...c, order: i }));
    let result = cards.map((c) => reorderedDest.find((r) => r.id === c.id) ?? c);

    const reorderedSrc = result
      .filter((c) => c.columnId === activeCol)
      .sort((a, b) => a.order - b.order)
      .map((c, i) => ({ ...c, order: i }));
    result = result.map((c) => reorderedSrc.find((r) => r.id === c.id) ?? c);

    return result;
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || !canEdit) return;

    const previousCards = cards;
    const nextCards = buildNextCards(String(active.id), String(over.id));
    if (!nextCards) return;

    setCards(nextCards);
    try {
      await onCardsChange?.(nextCards);
    } catch (error) {
      console.error(error);
      setCards(previousCards);
      toast("Nao foi possivel salvar a movimentacao do card.");
    }
  }

  async function submitCard() {
    if (!targetColumnId || !cardTitle.trim()) return;
    const position = cardsOf(targetColumnId).length;

    setCreatingCard(true);
    try {
      await onCreateCard?.(targetColumnId, cardTitle, position);
      setCardTitle("");
      setTargetColumnId(null);
    } catch (error) {
      console.error(error);
      toast("Nao foi possivel criar o card.");
    } finally {
      setCreatingCard(false);
    }
  }

  async function submitEditCard() {
    if (!editingCard || !editTitle.trim() || savingCard) return;

    setSavingCard(true);
    try {
      await onUpdateCard?.(editingCard.id, {
        title: editTitle,
        description: editDescription,
      });
      setEditingCard(null);
    } catch (error) {
      console.error(error);
      toast("Nao foi possivel salvar o card.");
    } finally {
      setSavingCard(false);
    }
  }

  async function confirmDeleteCard() {
    const card = cardToDelete;
    if (!card || pendingCardId) return;

    setPendingCardId(card.id);
    try {
      await onDeleteCard?.(card);
      setCardToDelete(null);
    } catch (error) {
      console.error(error);
      toast("Nao foi possivel excluir o card.");
    } finally {
      setPendingCardId(null);
    }
  }

  const activeCard = cards.find((c) => c.id === activeId) ?? null;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
        onDragEnd={(event) => void onDragEnd(event)}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              cards={cardsOf(col.id)}
              onCreateCard={canEdit ? setTargetColumnId : undefined}
              onEditCard={canEdit && onUpdateCard ? setEditingCard : undefined}
              onDeleteCard={canDelete && onDeleteCard ? setCardToDelete : undefined}
              pendingCardId={pendingCardId}
              canDrag={canEdit}
            />
          ))}
        </div>
        <DragOverlay>
          {activeCard ? <KanbanCard card={activeCard} /> : null}
        </DragOverlay>
      </DndContext>

      <Dialog open={targetColumnId !== null} onOpenChange={(open) => !open && setTargetColumnId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-content">
              Novo card
            </DialogTitle>
            <DialogDescription className="text-sm text-content-muted">
              Cria um card persistido na lista selecionada.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="card-title">Titulo do card</Label>
            <Input
              id="card-title"
              value={cardTitle}
              onChange={(event) => setCardTitle(event.target.value)}
              placeholder="Ex.: Revisar criativos"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTargetColumnId(null)} disabled={creatingCard}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={() => void submitCard()} disabled={creatingCard}>
              {creatingCard ? "Criando..." : "Criar card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editingCard !== null}
        onOpenChange={(open) => {
          if (!open && !savingCard) setEditingCard(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-content">
              Editar card
            </DialogTitle>
            <DialogDescription className="text-sm text-content-muted">
              Atualize o titulo e a descricao do card.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-card-title">Titulo do card</Label>
              <Input
                id="edit-card-title"
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                placeholder="Ex.: Revisar criativos"
                disabled={savingCard}
              />
            </div>
            <div>
              <Label htmlFor="edit-card-description">Descricao</Label>
              <Textarea
                id="edit-card-description"
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                placeholder="Detalhes, contexto ou checklist do card."
                rows={4}
                disabled={savingCard}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingCard(null)} disabled={savingCard}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={() => void submitEditCard()} disabled={savingCard}>
              {savingCard ? "Salvando..." : "Salvar card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={cardToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setCardToDelete(null);
        }}
        title="Excluir card"
        description={
          <>
            Tem certeza que deseja excluir
            {cardToDelete ? ` "${cardToDelete.title}"` : " este card"}? Essa acao nao
            pode ser desfeita.
          </>
        }
        confirmLabel="Excluir card"
        pendingLabel="Excluindo..."
        pending={pendingCardId !== null}
        onConfirm={() => void confirmDeleteCard()}
      />
    </>
  );
}
