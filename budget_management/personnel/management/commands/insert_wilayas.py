from django.core.management.base import BaseCommand
from personnel.models import Wilaya

# Wilaya data with only code, name (French), and is_south flag
WILAYAS = [
    (1, "Adrar", True),
    (2, "Chlef", False),
    (3, "Laghouat", True),
    (4, "Oum El Bouaghi", False),
    (5, "Batna", False),
    (6, "Béjaïa", False),
    (7, "Biskra", True),
    (8, "Béchar", True),
    (9, "Blida", False),
    (10, "Bouira", False),
    (11, "Tamanrasset", True),
    (12, "Tébessa", False),
    (13, "Tlemcen", False),
    (14, "Tiaret", False),
    (15, "Tizi Ouzou", False),
    (16, "Alger", False),
    (17, "Djelfa", True),
    (18, "Jijel", False),
    (19, "Sétif", False),
    (20, "Saïda", False),
    (21, "Skikda", False),
    (22, "Sidi Bel Abbès", False),
    (23, "Annaba", False),
    (24, "Guelma", False),
    (25, "Constantine", False),
    (26, "Médéa", False),
    (27, "Mostaganem", False),
    (28, "M'Sila", False),
    (29, "Mascara", False),
    (30, "Ouargla", True),
    (31, "Oran", False),
    (32, "El Bayadh", True),
    (33, "Illizi", True),
    (34, "Bordj Bou Arreridj", False),
    (35, "Boumerdès", False),
    (36, "El Tarf", False),
    (37, "Tindouf", True),
    (38, "Tissemsilt", False),
    (39, "El Oued", True),
    (40, "Khenchela", False),
    (41, "Souk Ahras", False),
    (42, "Tipaza", False),
    (43, "Mila", False),
    (44, "Aïn Defla", False),
    (45, "Naâma", True),
    (46, "Aïn Témouchent", False),
    (47, "Ghardaïa", True),
    (48, "Relizane", False),
    (49, "Timimoun", True),
    (50, "Bordj Badji Mokhtar", True),
    (51, "Ouled Djellal", True),
    (52, "Béni Abbès", True),
    (53, "In Salah", True),
    (54, "In Guezzam", True),
    (55, "Touggourt", True),
    (56, "Djanet", True),
    (57, "El M'Ghair", True),
    (58, "El Menia", True),
]

class Command(BaseCommand):
    help = 'Insert or update simplified wilaya data'

    def handle(self, *args, **kwargs):
        for wilaya_data in WILAYAS:
            code, name, is_south = wilaya_data
            defaults = {
                "name": name,
                "is_south": is_south,
            }
            Wilaya.objects.update_or_create(code=code, defaults=defaults)

        self.stdout.write(self.style.SUCCESS('Successfully inserted/updated {} wilayas'.format(len(WILAYAS))))
