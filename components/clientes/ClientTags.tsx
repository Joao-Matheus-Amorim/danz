import { Badge } from "@/components/ui/badge";
import type { ClientTag } from "@/lib/types";
import { CLIENT_TAG_LABEL, CLIENT_TAG_STYLE } from "@/lib/constants";

/** Lista de tags de saúde do cliente (Em dia / Atenção / Crítico). */
export function ClientTags({ tags }: { tags: ClientTag[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <Badge key={t} className={CLIENT_TAG_STYLE[t]}>
          {CLIENT_TAG_LABEL[t]}
        </Badge>
      ))}
    </div>
  );
}
