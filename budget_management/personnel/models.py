from django.db import models
from datetime import datetime


class Wilaya(models.Model):
    code = models.PositiveIntegerField(unique=True ,null=False, blank=False)  # Wilaya code
    name = models.CharField(max_length=100, unique=True)  # Wilaya name in French
    is_south = models.BooleanField()  # True if it's in the south

    def __str__(self):
        return f"{self.code} - {self.name}"


class Grade(models.Model):
    class ProfessionChoices(models.TextChoices):
        TEACHER = "Teacher", "Teacher"
        WORKER = "Worker", "Worker"
        DRIVER = "Driver", "Driver"

    profession = models.CharField(max_length=20, choices=ProfessionChoices.choices)
    name = models.CharField(max_length=50)   
    class Meta:
        unique_together = ('profession', 'name')  
    def __str__(self):
        return f"{self.profession} - {self.name}"


class Personnel(models.Model):
    class ProfessionChoices(models.TextChoices):
        TEACHER = "Teacher", "Teacher"
        WORKER = "Worker", "Worker"
        DRIVER = "Driver", "Driver"

    name = models.CharField(max_length=100)
    profession = models.CharField(max_length=20, choices=ProfessionChoices.choices)
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE)
    account_number = models.CharField(max_length=30, unique=True)
    is_ccp_account = models.BooleanField(default=False)
    address = models.CharField(max_length=255, default="Unknown")
    wilaya = models.ForeignKey(Wilaya, on_delete=models.CASCADE, null=True, blank=True)
    year = models.PositiveIntegerField(default=datetime.now().year)
    def __str__(self):
        return f"{self.name} ({self.profession})"
 


