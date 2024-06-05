from django.db import models
from django.contrib.auth.models import User
from datetime import timedelta, date
from django.core.exceptions import ValidationError

class Habit(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, blank=False, null=False)
    description = models.TextField(blank=True)  # Optional description
    reward = models.TextField(default='Not set yet', blank=True, null=False)  # Optional reward
    streak = models.IntegerField(default=0)
    repeat_after = models.IntegerField(default=1,blank=False, null=False)
    is_active = models.BooleanField(default=True , blank=False, null=False)  # Using 'is_active' for clarity

    def __str__(self):
        return self.name

    def calculate_streaks(self):
        logs = HabitLog.objects.filter(habit=self, status=True).order_by('date')
        if not logs.exists():
            self.streak = 0
            self.save()
            return 0

        block_size = self.repeat_after
        current_block_start_date = logs.first().date
        streak_count = 0
        is_block_complete = False

        for log in logs:
            if log.date > current_block_start_date + timedelta(days=block_size - 1):
                if is_block_complete:
                    streak_count += 1
                current_block_start_date = log.date
                is_block_complete = False
            elif log.date < current_block_start_date:
                # Handle out-of-order logs
                continue
            is_block_complete = True
        
        if is_block_complete:
            streak_count += 1

        self.streak = streak_count
        self.save()
        return streak_count


class HabitLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE)
    status = models.BooleanField(default=False)
    date = models.DateField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'habit', 'date'], name='unique_habit_log')
        ]

    def __str__(self):
        return f"{self.user.username} - {self.habit.name} - {self.date} - {'Complete' if self.status else 'Incomplete'}"

    def save(self, *args, **kwargs):
        if HabitLog.objects.filter(user=self.user, habit=self.habit, date=self.date).exists():
            raise ValidationError('Habit log for this habit on this date already exists.')
        super().save(*args, **kwargs)
        self.habit.calculate_streaks()
        
    def update_habit_log(self, user, habit, date, new_status):
        try:
            habit_log = HabitLog.objects.get(user=user, habit=habit, date=date)
            habit_log.status = new_status
            habit_log.save()
        except HabitLog.DoesNotExist:
            raise ValidationError('Habit log does not exist.')

# Example usage:
# update_habit_log(user_instance, habit_instance, '2023-05-25', True)


    def delete(self, *args, **kwargs):
        habit = self.habit
        super().delete(*args, **kwargs)
        habit.calculate_streaks()