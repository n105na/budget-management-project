from django.core.management.base import BaseCommand
from personnel.models import Wilaya

# Wilaya data with code, name in French, Arabic name, longitude, latitude, and is_south flag
WILAYAS = [
    (1, "Adrar", "أدرار", 27.87, -0.28, True),
    (2, "Chlef", "الشلف", 36.17, 1.33, False),
    (3, "Laghouat", "الأغواط", 33.80, 2.87, True),
    (4, "Oum El Bouaghi", "أم البواقي", 35.88, 7.11, False),
    (5, "Batna", "باتنة", 35.55, 6.17, False),
    (6, "Béjaïa", "بجاية", 36.75, 5.07, False),
    (7, "Biskra", "بسكرة", 34.85, 5.73, True),
    (8, "Béchar", "بشار", 31.62, -2.22, True),
    (9, "Blida", "البليدة", 36.48, 2.83, False),
    (10, "Bouira", "البويرة", 36.38, 3.90, False),
    (11, "Tamanrasset", "تمنراست", 22.78, 5.52, True),
    (12, "Tébessa", "تبسة", 35.40, 8.12, False),
    (13, "Tlemcen", "تلمسان", 34.88, -1.32, False),
    (14, "Tiaret", "تيارت", 35.37, 1.32, False),
    (15, "Tizi Ouzou", "تيزي وزو", 36.71, 4.05, False),
    (16, "Alger", "الجزائر", 36.75, 3.06, False),
    (17, "Djelfa", "الجلفة", 34.67, 3.26, True),
    (18, "Jijel", "جيجل", 36.82, 5.77, False),
    (19, "Sétif", "سطيف", 36.18, 5.41, False),
    (20, "Saïda", "سعيدة", 34.83, 0.15, False),
    (21, "Skikda", "سكيكدة", 36.87, 6.91, False),
    (22, "Sidi Bel Abbès", "سيدي بلعباس", 35.20, -0.63, False),
    (23, "Annaba", "عنابة", 36.90, 7.77, False),
    (24, "Guelma", "قالمة", 36.46, 7.43, False),
    (25, "Constantine", "قسنطينة", 36.37, 6.61, False),
    (26, "Médéa", "المدية", 36.27, 2.75, False),
    (27, "Mostaganem", "مستغانم", 35.93, 0.09, False),
    (28, "M'Sila", "المسيلة", 35.71, 4.52, False),
    (29, "Mascara", "معسكر", 35.40, 0.14, False),
    (30, "Ouargla", "ورقلة", 31.95, 5.33, True),
    (31, "Oran", "وهران", 35.70, -0.63, False),
    (32, "El Bayadh", "البيض", 32.63, 1.01, True),
    (33, "Illizi", "إليزي", 26.50, 8.47, True),
    (34, "Bordj Bou Arreridj", "برج بوعريريج", 36.07, 4.76, False),
    (35, "Boumerdès", "بومرداس", 36.77, 3.48, False),
    (36, "El Tarf", "الطارف", 36.77, 8.31, False),
    (37, "Tindouf", "تندوف", 27.67, -8.15, True),
    (38, "Tissemsilt", "تيسمسيلت", 35.60, 1.81, False),
    (39, "El Oued", "الوادي", 33.37, 6.86, True),
    (40, "Khenchela", "خنشلة", 35.43, 7.15, False),
    (41, "Souk Ahras", "سوق أهراس", 36.29, 7.95, False),
    (42, "Tipaza", "تيبازة", 36.60, 2.45, False),
    (43, "Mila", "ميلة", 36.45, 6.26, False),
    (44, "Aïn Defla", "عين الدفلى", 36.26, 2.41, False),
    (45, "Naâma", "النعامة", 33.26, -0.31, True),
    (46, "Aïn Témouchent", "عين تموشنت", 35.30, -1.14, False),
    (47, "Ghardaïa", "غرداية", 32.49, 3.67, True),
    (48, "Relizane", "غليزان", 35.73, 0.55, False),
    (49, "Timimoun", "تيميمون", 29.26, 0.26, True),
    (50, "Bordj Badji Mokhtar", "برج باجي مختار", 21.38, 0.93, True),
    (51, "Ouled Djellal", "أولاد جلال", 34.43, 5.00, True),
    (52, "Béni Abbès", "بني عباس", 30.12, -2.17, True),
    (53, "In Salah", "عين صالح", 27.25, 2.51, True),
    (54, "In Guezzam", "عين قزام", 19.57, 5.77, True),
    (55, "Touggourt", "تقرت", 33.10, 6.07, True),
    (56, "Djanet", "جانت", 24.56, 9.48, True),
    (57, "El M'Ghair", "المغير", 33.96, 5.91, True),
    (58, "El Menia", "المنيعة", 32.35, 3.62, True)
]

class Command(BaseCommand):
    help = 'Insert or update all Algerian wilayas'

    def handle(self, *args, **kwargs):
        for wilaya_data in WILAYAS:
            code, name, ar_name, latitude, longitude, is_south = wilaya_data
            defaults = {
                "name": name,
                "ar_name": ar_name,
                "latitude": latitude,
                "longitude": longitude,
                "is_south": is_south,
            }
            Wilaya.objects.update_or_create(code=code, defaults=defaults)

        self.stdout.write(self.style.SUCCESS('Successfully inserted/updated {} wilayas'.format(len(WILAYAS))))
