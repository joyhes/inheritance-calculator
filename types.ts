export interface FractionObj {
  n: bigint;
  d: bigint;
}

export interface IncomeLog {
  from: string;
  amount: FractionObj; // Serialized fraction
  amountTxt: string;
  parentEstate: string;
  ratioStr: string;
  reason: string;
  traceHtml: string;
  prevLogs: IncomeLog[];
}

export interface Person {
  id: number;
  name: string;
  parents: number[];
  spouseId: number | null;
  deathDate: string | null; // ISO string
  divorceDate: string | null; // ISO string
  share: FractionObj; // Serialized fraction
  shareTxt: string;
  incomeLog: IncomeLog[];
  isHeir?: boolean; // For display logic
}

export interface WaiverRule {
  whoId: number;
  targetId: number;
}

export interface AppState {
  people: Person[];
  waiverRules: WaiverRule[];
  nextId: number;
}

export type ModalMode = 'manual' | 'child' | 'spouse' | 'parent' | 'edit';
