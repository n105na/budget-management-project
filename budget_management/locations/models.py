from django.db import models
from personnel.models import Wilaya  # Import Wilaya from your personnel app

class WilayaDistance(models.Model):
    wilaya_from = models.ForeignKey(Wilaya, on_delete=models.CASCADE, related_name="from_wilaya")
    wilaya_to = models.ForeignKey(Wilaya, on_delete=models.CASCADE, related_name="to_wilaya")
    distance_km = models.FloatField()

    class Meta:
        unique_together = ('wilaya_from', 'wilaya_to')  # Ensure unique distances

    def __str__(self):
        return f"Distance from {self.wilaya_from.name} to {self.wilaya_to.name}: {self.distance_km} km"
