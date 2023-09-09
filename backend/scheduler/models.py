from django.db import models

# Create your models here.
class SharedData(models.Model):
    isSchedulerStarted = models.BooleanField(default=False)
    cookies = models.JSONField(null=True)

    def __str__(self):
        return f"{self.id} - {self.isSchedulerStarted}"
    
class Course(models.Model):
    sub_and_crse_code = models.CharField(max_length=10, null=False)
    created_at = models.DateTimeField(null=False, auto_now_add=True)

    def format(self):
        return {
            "sub_and_crse_code": self.sub_and_crse_code,
            "id": self.id,
            "created_at": self.created_at
        }
    
class Section(models.Model):
    sect_code = models.CharField(max_length=5, null=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sections')
    created_at = models.DateTimeField(null=False, auto_now_add=True)

    def format(self):
        return {
            "sect_code": self.sect_code,
            "id": self.id,
            "course_id": self.course_id,
            "created_at": self.created_at
        }