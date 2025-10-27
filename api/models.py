from django.db import models

class Task(models.Model):
    priority_choices =(('low','Low'),('medium','Medium'),('high','High'))
    status_choices =(('todo','To Do'),('in_progress','In Progress'),('done','Done')) 
    title = models.CharField(max_length =200)
    description= models.TextField(blank=True)
    priority = models.CharField(max_length=10, choices=priority_choices,default='medium')
    status = models.CharField(max_length=15, choices=status_choices,default='todo')
    created_at=models.DateTimeField(auto_now_add=True, null=True, blank=True)
    due_date = models.DateTimeField(null=True,blank=True)
    updated_at=models.DateTimeField(auto_now=True, null=True, blank=True)
    
    class Meta:
        ordering=['created_at']

    def __str__(self):
        return f"{self.title} ({self.status})"

    



