from django.core.management.base import BaseCommand
from locations.models import WilayaDistance
from personnel.models import Wilaya

class Command(BaseCommand):
    help = "Populate WilayaDistance table with distances from Sidi Bel Abbès"

    # Define distances from Sidi Bel Abbès to all other wilayas
    DISTANCES = {
        "Adrar": 1200, "Chlef": 480, "Laghouat": 800, "Oum El Bouaghi": 650,
        "Batna": 700, "Béjaïa": 520, "Biskra": 820, "Béchar": 750,
        "Blida": 450, "Bouira": 530, "Tamanrasset": 2000, "Tébessa": 880,
        "Tlemcen": 120, "Tiaret": 250, "Tizi Ouzou": 570, "Alger": 500,
        "Djelfa": 600, "Jijel": 580, "Sétif": 600, "Saïda": 180,
        "Skikda": 750, "Sidi Bel Abbès": 0, "Annaba": 900, "Guelma": 800,
        "Constantine": 700, "Médéa": 470, "Mostaganem": 250, "M'Sila": 720,
        "Mascara": 170, "Ouargla": 1100, "Oran": 180, "El Bayadh": 450,
        "Illizi": 1900, "Bordj Bou Arreridj": 620, "Boumerdès": 510,
        "El Tarf": 960, "Tindouf": 1500, "Tissemsilt": 360, "El Oued": 1200,
        "Khenchela": 800, "Souk Ahras": 850, "Tipaza": 500, "Mila": 680,
        "Aïn Defla": 440, "Naâma": 500, "Aïn Témouchent": 170, "Ghardaïa": 1100,
        "Relizane": 230,"Timimoun": 1300, "Bordj Badji Mokhtar": 1800, "Ouled Djellal": 950,
        "Béni Abbès": 900, "In Salah": 1600, "In Guezzam": 2200,
        "Touggourt": 1100, "Djanet": 2100, "El M'Ghair": 1150, "El Menia": 1450
    }

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting WilayaDistance population...")

        try:
            WilayaDistance.objects.all().delete()  # Clear old data
            self.stdout.write("Deleted existing WilayaDistance records.")

            # Get Wilaya for "Sidi Bel Abbès"
            try:
                wilaya_from = Wilaya.objects.get(name="Sidi Bel Abbès")
                self.stdout.write(f"Found Wilaya: {wilaya_from}")
            except Wilaya.DoesNotExist:
                self.stdout.write(self.style.ERROR("Wilaya 'Sidi Bel Abbès' does not exist. Check the database."))
                return  # Exit if the main Wilaya is missing

            # Track missing Wilayas
            missing_wilayas = []
            distances_to_insert = []

            for wilaya_name, distance in self.DISTANCES.items():
                if wilaya_name == "Sidi Bel Abbès":  # Skip itself
                    continue

                try:
                    wilaya_to = Wilaya.objects.get(name=wilaya_name)
                    distances_to_insert.append(WilayaDistance(
                        wilaya_from=wilaya_from,
                        wilaya_to=wilaya_to,
                        distance_km=distance
                    ))
                except Wilaya.DoesNotExist:
                    missing_wilayas.append(wilaya_name)

            # Bulk insert valid distances
            if distances_to_insert:
                WilayaDistance.objects.bulk_create(distances_to_insert)
                self.stdout.write(self.style.SUCCESS(f"Inserted {len(distances_to_insert)} distance records successfully!"))

            # Report missing Wilayas
            if missing_wilayas:
                self.stdout.write(self.style.ERROR(f"Error: The following Wilayas are missing in the database:\n{missing_wilayas}"))
            else:
                self.stdout.write(self.style.SUCCESS("All Wilayas matched successfully!"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Unexpected error: {e}"))
