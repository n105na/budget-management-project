from django.db import models

class Wilaya(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Grade(models.Model):
    class ProfessionChoices(models.TextChoices):
        TEACHER = "Teacher", "Teacher"
        WORKER = "Worker", "Worker"
        DRIVER = "Driver", "Driver"

    profession = models.CharField(max_length=20, choices=ProfessionChoices.choices)
    name = models.CharField(max_length=50, unique=True)  #the grade name 

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

    def __str__(self):
        return f"{self.name} ({self.profession})"
 


