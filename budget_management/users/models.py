from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        DOYEN = "Doyen", "Doyen"
        COMMISSION = "Commission", "Commission"
        SECRETAIRE_GENERALE = "Secretaire Generale", "Secretaire Generale"
        COMPTABLE = "Comptable", "Comptable"

    role = models.CharField(max_length=50, choices=Role.choices, default=Role.DOYEN)

    def is_viewer(self):
        return self.role in {self.Role.DOYEN, self.Role.COMMISSION}

    def is_editor(self):
        return self.role in {self.Role.SECRETAIRE_GENERALE, self.Role.COMPTABLE}
    def __str__(self):
       return self.username  # Or: return f"{self.first_name} {self.last_name}"
