from __future__ import annotations
import random
from datetime import timedelta

from django.core.management.base import BaseCommand, CommandParser
from django.utils import timezone

from api.models import Task


TITLES = [
    "Write docs", "Fix bug", "Refactor module", "Design API",
    "Code review", "Prepare release", "Improve tests", "Update dependencies",
]
DESCRIPTIONS = [
    "Short task description.",
    "Follow up with the team.",
    "Make sure to cover edge cases.",
    "Coordinate with frontend.",
    "Document the changes in README.",
]
PRIORITIES = ["low", "medium", "high"]
STATUSES = ["todo", "in_progress", "done"]


class Command(BaseCommand):
    help = "Seed the database with sample tasks (for local development)."

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument("--count", type=int, default=20, help="Number of tasks to create (default: 20)")
        parser.add_argument(
            "--delete", action="store_true", help="Delete existing tasks before seeding"
        )

    def handle(self, *args, **options):
        count = options["count"]
        do_delete = options["delete"]

        if do_delete:
            deleted, _ = Task.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Deleted {deleted} existing tasks."))

        created = 0
        now = timezone.now()
        for _ in range(count):
            title = random.choice(TITLES)
            desc = random.choice(DESCRIPTIONS)
            priority = random.choices(PRIORITIES, weights=[2, 5, 3], k=1)[0]
            status = random.choices(STATUSES, weights=[5, 3, 2], k=1)[0]

            # Random due date: some past, some soon, some later
            days_offset = random.randint(-5, 15)
            hours_offset = random.randint(0, 8)
            due_date = now + timedelta(days=days_offset, hours=hours_offset)

            Task.objects.create(
                title=title,
                description=desc,
                priority=priority,
                status=status,
                due_date=due_date,
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f"Created {created} tasks."))
