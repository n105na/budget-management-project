from django.db import models
from personnel.models import Grade  # Import the Grade model
from personnel.models import Wilaya
from personnel.models import Personnel
from datetime import timedelta
#from .models import Mission

class GradePayment(models.Model):
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE)
    meal_payment_north = models.DecimalField(max_digits=10, decimal_places=2)
    meal_payment_south = models.DecimalField(max_digits=10, decimal_places=2)
    lodging_payment_north = models.DecimalField(max_digits=10, decimal_places=2)
    lodging_payment_south = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.grade.name} - Payments"






class Mission(models.Model):
    TRANSPORT_CHOICES = [
        ('Personal Car', 'Voiture personnelle'),
        ('Bus', 'Bus'),
        ('Taxi', 'Taxi'),
        ('Faculty Driver', 'Chauffeur de la faculté'),
        ('other', 'autre'),
    ]

    FUNDING_CHOICES = [
        ('100% Funded', '100% financé'),
        ('25% Funding', '25% financé'),
    ]

    MISSION_NATURE_CHOICES = [
        ('Thesis Discussion', 'Soutenance de thèse'),
        ('Forum', 'Forum'),
        ('Administrative Task', 'Tâche administrative'),
        ('Other', 'Autre'),
    ]

    date_arrival = models.DateField()
    date_departure = models.DateField()
    transport_type = models.CharField(max_length=50, choices=TRANSPORT_CHOICES)
    destination_wilaya = models.ForeignKey(Wilaya, on_delete=models.CASCADE)
    time_departure = models.TimeField()
    time_arrival = models.TimeField()
    funding_type = models.CharField(max_length=30, choices=FUNDING_CHOICES)
    mission_nature = models.CharField(max_length=50, choices=MISSION_NATURE_CHOICES)

    @property
    def nights_stayed(self):
        """Calculates the number of nights stayed based on date difference"""
        return (self.date_arrival - self.date_departure).days

    
    
    @property
    def meals_covered(self):
        """Calculates the number of meals covered based on mission duration."""
    
        total_meals = 0
        current_date = self.date_departure  # Start from the departure date
    
        while current_date <= self.date_arrival:
            if current_date == self.date_departure:  # Departure day
                if self.time_departure.hour < 6:
                    total_meals += 3  # Left early, all meals covered
                elif self.time_departure.hour < 12:
                    total_meals += 2  # Left before noon, lunch and dinner covered
                elif self.time_departure.hour < 18:
                    total_meals += 1  # Left before evening, only dinner covered
            elif current_date == self.date_arrival:  # Return day
                if self.time_arrival.hour >= 19:
                    total_meals += 3  # Returned after dinner, all meals covered
                elif self.time_arrival.hour >= 12:
                    total_meals += 2  # Returned after lunch, breakfast and lunch covered
                elif self.time_arrival.hour >= 6:
                    total_meals += 1  # Returned after breakfast, only breakfast covered
            else:  # Full days in between
                total_meals += 3  # Each full day covers 3 meals
    
            current_date += timedelta(days=1)  # Move to the next day
    
        return total_meals
    
        
        


class MissionPersonnel(models.Model):
    mission = models.ForeignKey(Mission, on_delete=models.CASCADE)
    personnel = models.ForeignKey(Personnel, on_delete=models.CASCADE)
    transport_payment = models.DecimalField(max_digits=10, decimal_places=2)
    meal_payment = models.DecimalField(max_digits=10, decimal_places=2)
    lodging_payment = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    @property
    def total_payment(self):
        """Calculates total payment based on funding type"""
        total = self.transport_payment + self.meal_payment
        if self.lodging_payment:
            total += self.lodging_payment

        # Apply funding adjustment
        if self.mission.funding_type.strip().lower() == "25% financé":
            return round(total * 0.25, 2)  # Only 25% is covered
        return round(total, 2)  # Fully funded

    def __str__(self):
        return f"{self.personnel.name} - {self.mission.mission_nature} ({self.total_payment} DA)"
