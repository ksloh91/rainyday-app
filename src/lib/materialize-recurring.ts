import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import {
  advanceNextDue,
  endOfDay,
  startOfDay,
  type RecurringRule,
} from "@/lib/recurring";
import { getFirebaseDb } from "@/lib/firebase";

const MAX_CATCH_UP = 60;

export async function materializeDueRecurringRules(
  userId: string,
  rules: RecurringRule[],
): Promise<number> {
  const db = getFirebaseDb();
  const todayEnd = endOfDay();
  let created = 0;

  for (const rule of rules) {
    if (!rule.active) continue;

    let due = startOfDay(rule.nextDueAt);
    let iterations = 0;
    const txCol = collection(db, "users", userId, "transactions");
    const ruleRef = doc(db, "users", userId, "recurringRules", rule.id);

    while (
      due.getTime() <= todayEnd.getTime() &&
      iterations < MAX_CATCH_UP &&
      (!rule.endDate || due.getTime() <= startOfDay(rule.endDate).getTime())
    ) {
      await addDoc(txCol, {
        amount: rule.amount,
        description: rule.description,
        merchant: rule.merchant,
        type: rule.type,
        category: rule.category,
        paymentMethod: rule.paymentMethod,
        currency: rule.currency,
        occurredAt: Timestamp.fromDate(due),
        recurringRuleId: rule.id,
        createdAt: serverTimestamp(),
      });
      created += 1;
      due = advanceNextDue(due, rule.frequency, rule.startDate);
      iterations += 1;
    }

    if (due.getTime() !== rule.nextDueAt.getTime()) {
      await updateDoc(ruleRef, {
        nextDueAt: Timestamp.fromDate(due),
        updatedAt: serverTimestamp(),
      });
    }
  }

  return created;
}
