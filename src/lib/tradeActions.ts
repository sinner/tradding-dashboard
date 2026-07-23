import type { LucideIcon } from 'lucide-react';
import {
  ArrowDownRight,
  ArrowUpRight,
  CirclePause,
  Hand,
  HelpCircle,
} from 'lucide-react';

export type TradeSide = 'long' | 'short' | 'wait' | 'hold' | 'other';

export function classifyAction(action: string): TradeSide {
  const a = action.toLowerCase();
  if (a.includes('wait')) return 'wait';
  if (a.includes('hold')) return 'hold';
  if (a.includes('short') || a.includes('sell')) return 'short';
  if (a.includes('long') || a.includes('buy') || a === 'add') return 'long';
  return 'other';
}

export const SIDE_META: Record<
  TradeSide,
  { label: string; Icon: LucideIcon; tone: string; title: string; body: string[] }
> = {
  long: {
    label: 'Long',
    Icon: ArrowUpRight,
    tone: 'text-bull',
    title: 'Go long (futures)',
    body: [
      'Long means you profit if BTC goes up.',
      'You buy a futures contract now and plan to sell later at a higher price.',
      'Use this when the report’s bias/setup expects a rise, and entry / stop / targets are listed.',
    ],
  },
  short: {
    label: 'Short',
    Icon: ArrowDownRight,
    tone: 'text-bear',
    title: 'Go short (futures)',
    body: [
      'Short means you profit if BTC goes down.',
      'You sell a futures contract now and plan to buy it back later cheaper.',
      'Use this when the report expects weakness (bearish / range-bear tilt) and lists entry below, stop above, and downside targets.',
    ],
  },
  wait: {
    label: 'Wait',
    Icon: CirclePause,
    tone: 'text-signal',
    title: 'Wait',
    body: [
      'Do not open a new long or short yet.',
      'Conditions are unclear or risk/reward is poor — stand aside until a cleaner trigger.',
    ],
  },
  hold: {
    label: 'Hold',
    Icon: Hand,
    tone: 'text-signal',
    title: 'Hold',
    body: [
      'Keep the existing position; do not flip long↔short.',
      'Common for spot / core stacks. Reassess only if stop or invalidate levels fire.',
    ],
  },
  other: {
    label: 'Action',
    Icon: HelpCircle,
    tone: 'text-ink',
    title: 'Suggested action',
    body: [
      'Follow the report’s action label together with entry, stop, and targets for this horizon.',
    ],
  },
};
