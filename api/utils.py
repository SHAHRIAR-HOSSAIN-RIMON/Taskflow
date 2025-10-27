from __future__ import annotations
from collections import Counter
from datetime import datetime
from typing import Dict, Any, Iterable, Optional

from django.utils import timezone

from .models import Task

# Priority ordering helper so sorting is consistent across code paths
PRIORITY_ORDER = {"high": 0, "medium": 1, "low": 2}


def _to_aware(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if timezone.is_naive(dt):
        return timezone.make_aware(dt, timezone=timezone.get_current_timezone())
    return dt


def compute_stats(qs: Iterable[Task]) -> Dict[str, Any]:
    """
    Compute basic statistics over a queryset/iterable of Task objects.

    Returns:
        {
            "total": int,
            "by_status": {todo,in_progress,done},
            "by_priority": {low,medium,high},
            "overdue": int,
            "next_due": ISO8601 or None,
        }
    """
    now = timezone.now()

    total = 0
    status_counts: Counter[str] = Counter()
    priority_counts: Counter[str] = Counter()
    next_due: Optional[datetime] = None
    overdue = 0

    for t in qs:
        total += 1
        status_counts[t.status] += 1
        priority_counts[t.priority] += 1

        due = _to_aware(t.due_date)
        if due is not None:
            if due < now and t.status != "done":
                overdue += 1
            if next_due is None or (due < next_due and due >= now):
                next_due = due

    result = {
        "total": total,
        "by_status": {
            "todo": status_counts.get("todo", 0),
            "in_progress": status_counts.get("in_progress", 0),
            "done": status_counts.get("done", 0),
        },
        "by_priority": {
            "low": priority_counts.get("low", 0),
            "medium": priority_counts.get("medium", 0),
            "high": priority_counts.get("high", 0),
        },
        "overdue": overdue,
        "next_due": next_due.isoformat().replace("+00:00", "Z") if next_due else None,
    }
    return result


def priority_key(priority: str) -> int:
    """Return integer key for priority ordering (lower = higher priority)."""
    return PRIORITY_ORDER.get(priority, 99)
