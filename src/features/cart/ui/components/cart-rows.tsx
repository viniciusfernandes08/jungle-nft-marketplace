import { Icon } from "@/components/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { QuantityStepper } from "@/features/nfts/ui/components/detail/quantity-stepper";
import { MAX_QUANTITY_PER_ORDER } from "@/features/nfts/domain/nft-rules";
import { formatEth, mulEthByInt } from "@/shared/domain/eth";
import type { CartItem } from "../../domain/cart";
import { describeIssue, type QuoteIssue, type QuoteLine } from "../../domain/quote";

export type CartRowData = { item: CartItem; line: QuoteLine; issue?: QuoteIssue };

type RowProps = {
  row: CartRowData;
  onQuantity: (item: CartItem, quantity: number) => void;
  onRemove: (row: CartRowData) => void;
};

function maxFor({ item, line }: CartRowData) {
  const limit = Math.min(line.available, MAX_QUANTITY_PER_ORDER);
  return limit >= item.quantity ? limit : item.quantity;
}

const lineTotal = ({ item, line }: CartRowData) => formatEth(mulEthByInt(line.unitPriceEth, item.quantity));

function IssueNotice({ row, onQuantity }: { row: CartRowData; onQuantity: RowProps["onQuantity"] }) {
  if (!row.issue) return null;
  const canAdjust = row.issue.code === "INSUFFICIENT_STOCK" && row.line.available > 0;
  return (
    <p role="alert" className="mt-1 text-micro text-destructive">
      {describeIssue(row.issue, row.line)}{" "}
      {canAdjust && (
        <button
          type="button"
          onClick={() => onQuantity(row.item, row.line.available)}
          className="font-bold underline"
        >
          Ajustar para {row.line.available}
        </button>
      )}
    </p>
  );
}

function RemoveButton({ row, onRemove }: Pick<RowProps, "row" | "onRemove">) {
  return (
    <button
      type="button"
      aria-label={`Remover ${row.line.name} do carrinho`}
      onClick={() => onRemove(row)}
      className="grid size-9 place-items-center text-primary"
    >
      <Icon name="trash" className="size-5" />
    </button>
  );
}

export function CartTableRow({ row, onQuantity, onRemove }: RowProps) {
  const { item, line } = row;
  return (
    <tr className="bg-card">
      <td className="align-middle">
        <div className="flex items-center gap-4">
          <img src={line.imageUrl} alt="" width={70} height={70} loading="lazy" decoding="async" className="size-17.5 shrink-0 object-cover rounded-[6px]" />
          <div>
            <p className="text-body font-bold">{line.name}</p>
            <p className="text-small text-muted-foreground">
              ID do token: #{line.tokenId} · Edição {line.editionLabel}
            </p>
            <IssueNotice row={row} onQuantity={onQuantity} />
          </div>
        </div>
      </td>
      <td className="p-2 text-body font-bold text-primary">{formatEth(line.unitPriceEth)} ETH</td>
      <td className="p-2">
        <QuantityStepper compact value={item.quantity} max={maxFor(row)} onChange={(q) => onQuantity(item, q)} />
      </td>
      <td className="p-2 text-body font-bold text-primary">{lineTotal(row)} ETH</td>
      <td className="p-2 pr-4">
        <RemoveButton row={row} onRemove={onRemove} />
      </td>
    </tr>
  );
}

export function CartListItem({ row, onQuantity, onRemove }: RowProps) {
  const { item, line } = row;
  return (
    <li className="flex overflow-hidden rounded-lg bg-card">
      <img src={line.imageUrl} alt="" width={100} height={100} loading="lazy" decoding="async" className="w-[100px] shrink-0 object-cover" />
      <div className="flex min-w-0 flex-1 flex-col gap-1 p-3">
        <p className="truncate text-small font-bold">{line.name}</p>
        <p className="text-small text-muted-foreground">Edição: {line.editionLabel}</p>
        <p className="text-subheading font-bold text-primary">{lineTotal(row)} ETH</p>
        <IssueNotice row={row} onQuantity={onQuantity} />
      </div>
      <div className="flex flex-col items-end justify-between p-3">
        <RemoveButton row={row} onRemove={onRemove} />
        <QuantityStepper compact value={item.quantity} max={maxFor(row)} onChange={(q) => onQuantity(item, q)} className="gap-2" />
      </div>
    </li>
  );
}

export function CartRowsSkeleton({ count }: { count: number }) {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3">
      {Array.from({ length: Math.max(1, Math.min(count, 4)) }, (_, i) => (
        <Skeleton key={i} className="h-[86px] w-full !rounded-lg lg:h-[70px] lg:!rounded-none" />
      ))}
    </div>
  );
}
