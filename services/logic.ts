import { Person, WaiverRule, IncomeLog } from '../types';

export class Fraction {
  n: bigint;
  d: bigint;

  constructor(n: number | bigint, d: number | bigint = 1) {
    if (d === 0 || d === 0n) throw new Error("DivZero");
    this.n = BigInt(n);
    this.d = BigInt(d);
    this.simplify();
  }

  gcd(a: bigint, b: bigint): bigint {
    return b === 0n ? a : this.gcd(b, a % b);
  }

  simplify() {
    const c = this.gcd(this.n < 0n ? -this.n : this.n, this.d);
    this.n /= c;
    this.d /= c;
    if (this.d < 0n) {
      this.n = -this.n;
      this.d = -this.d;
    }
  }

  add(o: Fraction) {
    return new Fraction(this.n * o.d + o.n * this.d, this.d * o.d);
  }

  mul(o: Fraction) {
    return new Fraction(this.n * o.n, this.d * o.d);
  }

  div(o: Fraction) {
    return new Fraction(this.n * o.d, this.d * o.n);
  }

  toString() {
    return this.d === 1n ? `${this.n}` : `${this.n}/${this.d}`;
  }

  toNumber() {
    return Number(this.n) / Number(this.d);
  }

  isZero() {
    return this.n === 0n;
  }
}

// Helper to convert simple object back to Fraction class
const toFrac = (obj: any): Fraction => {
  if (obj instanceof Fraction) return obj;
  if (!obj) return new Fraction(0);
  return new Fraction(obj.n || 0, obj.d || 1);
};

// --- Core Logic ported from original script ---

function isAliveAt(p: Person, date: Date | null): boolean {
  if (!p.deathDate) return true;
  return new Date(p.deathDate) > (date || new Date());
}

function isWaived(p: Person, targetId: number, rules: WaiverRule[]): boolean {
  return rules.some(r => r.whoId === p.id && r.targetId === targetId);
}

function isValidHeir(p: Person | undefined, decedent: Person, rules: WaiverRule[]): boolean {
  if (!p) return false;
  const dDate = decedent.deathDate ? new Date(decedent.deathDate) : new Date();
  return isAliveAt(p, dDate) && !isWaived(p, decedent.id, rules);
}

function getBloodChildren(p: Person, people: Person[]): Person[] {
  return people.filter(c => c.parents.includes(p.id));
}

function getDescendants(
  deceased: Person,
  limitDate: Date,
  rootId: number,
  people: Person[],
  rules: WaiverRule[],
  replacedPerson: Person | null = null
): { person: Person; replaced: Person }[] {
  let subs: { person: Person; replaced: Person }[] = [];
  const currentReplaced = replacedPerson || deceased;

  getBloodChildren(deceased, people).forEach(child => {
    if (isWaived(child, rootId, rules)) return;
    if (isAliveAt(child, limitDate)) {
      subs.push({ person: child, replaced: currentReplaced });
    } else {
      subs = subs.concat(getDescendants(child, limitDate, rootId, people, rules, currentReplaced));
    }
  });
  return subs;
}

function buildDeepTrace(logs: IncomeLog[], currentAmount: any): string {
  // Simplified for this version, we will render this via React components in the UI
  // but keep a string representation for compatibility if needed.
  return "Complex Trace";
}

function cloneIncomeLogs(logs: IncomeLog[]): IncomeLog[] {
  if (!logs) return [];
  // JSON.stringify fails on BigInt, so we use a recursive manual clone
  return logs.map(log => ({
    ...log,
    // Ensure amount is cloned (it contains BigInts)
    amount: { n: log.amount.n, d: log.amount.d },
    // Recursive call for nested logs
    prevLogs: cloneIncomeLogs(log.prevLogs)
  }));
}

// The main calculation function. It receives a clean copy of people/rules and mutates them.
export function performCalculation(peopleData: Person[], rules: WaiverRule[], rootId: number): Person[] {
  // Deep clone to avoid mutating React state directly during calculation
  const people = peopleData.map(p => ({
    ...p,
    share: new Fraction(0),
    // Reset logs
    incomeLog: [] as IncomeLog[]
  }));

  const root = people.find(p => p.id === rootId);
  if (!root || !root.deathDate) return people;

  root.share = new Fraction(1);

  let loopCount = 0;
  while (loopCount++ < 100) {
    // Find people who are dead AND have money to pass on
    let deadHeirs = people
      .filter(p => p.deathDate && !toFrac(p.share).isZero())
      .sort((a, b) => new Date(a.deathDate!).getTime() - new Date(b.deathDate!).getTime());

    if (deadHeirs.length === 0) break;

    // Process the earliest death
    const decedent = deadHeirs[0];
    const estate = toFrac(decedent.share);

    // Logic from original processDeath
    let validSpouse: Person | null = null;
    if (decedent.spouseId) {
      const sp = people.find(p => p.id === decedent.spouseId);
      let isDivorced = false;
      const dDate = new Date(decedent.deathDate!);

      if (sp && sp.divorceDate && new Date(sp.divorceDate) <= dDate) isDivorced = true;
      if (decedent.divorceDate && new Date(decedent.divorceDate) <= dDate) isDivorced = true;

      if (sp && isAliveAt(sp, dDate) && !isWaived(sp, decedent.id, rules) && !isDivorced) {
        validSpouse = sp;
      }
    }

    let heirs: { person: Person; replaced: Person | null }[][] = [];
    let rank = 0;
    let rankName = "";

    // Rank 1: Children / Descendants
    let children = getBloodChildren(decedent, people);
    let rank1Heirs: { person: Person; replaced: Person | null }[][] = [];

    children.forEach(child => {
      if (isWaived(child, decedent.id, rules)) return;
      const dDate = new Date(decedent.deathDate!);

      if (isAliveAt(child, dDate)) {
        rank1Heirs.push([{ person: child, replaced: null }]);
      } else {
        let reps = getDescendants(child, dDate, decedent.id, people, rules);
        if (reps.length > 0) rank1Heirs.push(reps);
      }
    });

    if (rank1Heirs.length > 0) {
      rank = 1;
      rankName = "第Ⅰ順位：直系血親卑親屬";
      heirs = rank1Heirs;
    } else {
      // Rank 2: Parents
      let parents = decedent.parents
        .map(pid => people.find(x => x.id === pid))
        .filter(p => isValidHeir(p, decedent, rules)) as Person[];

      if (parents.length > 0) {
        rank = 2;
        rankName = "第Ⅱ順位：父母";
        heirs = parents.map(p => [{ person: p, replaced: null }]);
      } else {
        // Rank 3: Siblings
        let sibs = people.filter(p =>
          p.id !== decedent.id &&
          p.parents.some(pid => decedent.parents.includes(pid))
        );
        let rank3Heirs = sibs
          .filter(s => isValidHeir(s, decedent, rules))
          .map(s => [{ person: s, replaced: null }]);

        if (rank3Heirs.length > 0) {
          rank = 3;
          rankName = "第Ⅲ順位：兄弟姊妹";
          heirs = rank3Heirs;
        } else {
          // Rank 4: Grandparents
          let gparentsIds: number[] = [];
          decedent.parents.forEach(pid => {
            const p = people.find(x => x.id === pid);
            if (p) {
              gparentsIds = gparentsIds.concat(p.parents);
            }
          });
          // Remove duplicates
          gparentsIds = Array.from(new Set(gparentsIds));

          let gparents = gparentsIds
            .map(gid => people.find(x => x.id === gid))
            .filter(p => isValidHeir(p, decedent, rules)) as Person[];

          if (gparents.length > 0) {
            rank = 4;
            rankName = "第Ⅳ順位：祖父母";
            heirs = gparents.map(p => [{ person: p, replaced: null }]);
          }
        }
      }
    }

    const currentPrevLogs = cloneIncomeLogs(decedent.incomeLog);
    const sourceTraceHtml = decedent.incomeLog.length > 0 ? "inherited" : "original"; // Simplified marker

    // Distribution
    if (validSpouse) {
      let sRatio: Fraction, ratioStr: string;
      if (rank === 1) {
        const total = heirs.length + 1;
        sRatio = new Fraction(1, total);
        ratioStr = `÷ ${total}`;
      } else if (rank === 2 || rank === 3) {
        sRatio = new Fraction(1, 2);
        ratioStr = `× 1/2`;
      } else if (rank === 4) {
        sRatio = new Fraction(2, 3);
        ratioStr = `× 2/3`;
      } else {
        sRatio = new Fraction(1);
        ratioStr = `× 1/1`;
      }
      const amt = estate.mul(sRatio);
      validSpouse.share = toFrac(validSpouse.share).add(amt);
      validSpouse.incomeLog.push({
        from: decedent.name,
        amount: amt,
        amountTxt: amt.toString(),
        parentEstate: estate.toString(),
        ratioStr,
        reason: "配偶分配",
        traceHtml: sourceTraceHtml,
        prevLogs: currentPrevLogs
      });
    }

    if (rank > 0) {
      let hRatio: Fraction, ratioStr: string;
      if (validSpouse) {
        if (rank === 1) {
          const total = heirs.length + 1;
          hRatio = new Fraction(1, total);
          ratioStr = `÷ ${total}`;
        } else if (rank === 2 || rank === 3) {
          hRatio = new Fraction(1, 2).div(new Fraction(heirs.length));
          ratioStr = `× 1/2 ÷ ${heirs.length}`;
        } else if (rank === 4) {
          hRatio = new Fraction(1, 3).div(new Fraction(heirs.length));
          ratioStr = `× 1/3 ÷ ${heirs.length}`;
        } else {
          // Should not happen as rank 1-4 covers Article 1144
          hRatio = new Fraction(1, heirs.length);
          ratioStr = `÷ ${heirs.length}`;
        }
      } else {
        hRatio = new Fraction(1, heirs.length);
        ratioStr = `÷ ${heirs.length}`;
      }

      const amtPerGroup = estate.mul(hRatio);

      // Need to re-find heirs in the 'people' array because deep cloning broke references
      heirs.forEach(group => {
        const subAmt = amtPerGroup.div(new Fraction(group.length));
        group.forEach(hObj => {
          // Find the actual person object in our working set
          const h = people.find(p => p.id === hObj.person.id);
          if (h) {
            let currentRatioStr = ratioStr;
            if (group.length > 1) currentRatioStr += ` ÷ ${group.length} (均分)`;
            h.share = toFrac(h.share).add(subAmt);
            h.incomeLog.push({
              from: decedent.name,
              amount: subAmt,
              amountTxt: subAmt.toString(),
              parentEstate: estate.toString(),
              ratioStr: currentRatioStr,
              reason: hObj.replaced ? `代位 (${hObj.replaced.name})` : rankName,
              traceHtml: sourceTraceHtml,
              prevLogs: currentPrevLogs
            });
          }
        });
      });
    }

    // Decedent's share is now distributed
    decedent.share = new Fraction(0);
  }

  // Final cleanup for export
  return people.map(p => ({
    ...p,
    shareTxt: toFrac(p.share).toString(),
    share: { n: toFrac(p.share).n, d: toFrac(p.share).d }
  }));
}