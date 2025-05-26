from datetime import datetime, timedelta

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from users.permissions import RoleBasedPermission 

from .filters import MissionFilter
from .models import GradePayment, Mission, MissionPersonnel, Budget
from .serializers import (
    GradePaymentSerializer, 
    MissionSerializer, 
    MissionPersonnelSerializer, 
    BudgetSerializer, 
    MissionWithPersonnelSerializer, 
    MissionWithPersonnelCRUDSerializer
)
from decimal import Decimal
from .permissions import IsDashboardViewer
from rest_framework import generics


class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['year']
    ordering_fields = ['added_on', 'amount']
    permission_classes = [IsAuthenticated]

class GradePaymentViewSet(viewsets.ModelViewSet):
    queryset = GradePayment.objects.all()
    serializer_class = GradePaymentSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    

class MissionViewSet(viewsets.ModelViewSet):
    queryset = Mission.objects.all()
    serializer_class = MissionSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]

    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        'destination_name': ['exact'],
        'transport_type': ['exact'],
    }
    filterset_class = MissionFilter
    ordering_fields = ['destination_wilaya', 'transport_type']

    def get_queryset(self):
        queryset = super().get_queryset()
        filter_type = self.request.query_params.get('filter', None)
        now = datetime.now()

        if filter_type == 'this_week':
            start = now - timedelta(days=now.weekday())
            end = start + timedelta(days=6)
            queryset = queryset.filter(date_departure__range=(start.date(), end.date()))

        elif filter_type == 'this_month':
            start = now.replace(day=1)
            end = (start.replace(month=start.month + 1, day=1) if start.month < 12 else start.replace(year=start.year + 1, month=1, day=1)) - timedelta(days=1)
            queryset = queryset.filter(date_departure__range=(start.date(), end.date()))

        elif filter_type == 'this_quarter':
            quarter = (now.month - 1) // 3 + 1
            start_month = 3 * (quarter - 1) + 1
            start = now.replace(month=start_month, day=1)
            end = (start.replace(month=start_month + 3, day=1) if quarter < 4 else start.replace(year=now.year + 1, month=1, day=1)) - timedelta(days=1)
            queryset = queryset.filter(date_departure__range=(start.date(), end.date()))

        elif filter_type == 'this_year':
            start = now.replace(month=1, day=1)
            end = now.replace(month=12, day=31)
            queryset = queryset.filter(date_departure__range=(start.date(), end.date()))

        return queryset


class MissionPersonnelViewSet(viewsets.ModelViewSet):
    queryset = MissionPersonnel.objects.all().select_related("mission", "personnel")
    serializer_class = MissionPersonnelSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated,IsDashboardViewer])
def dashboard_metrics(request):
    now = datetime.now()
    filter_type = request.query_params.get("filter", "this_year")

    if filter_type == "this_week":
        start = now - timedelta(days=now.weekday())
        end = start + timedelta(days=6)
    elif filter_type == "this_month":
        start = now.replace(day=1)
        end = (start.replace(month=start.month + 1, day=1)
               if start.month < 12 else start.replace(year=now.year + 1, month=1, day=1)) - timedelta(days=1)
    elif filter_type == "this_quarter":
        quarter = (now.month - 1) // 3 + 1
        start_month = 3 * (quarter - 1) + 1
        start = now.replace(month=start_month, day=1)
        end = (start.replace(month=start_month + 3, day=1)
               if quarter < 4 else start.replace(year=now.year + 1, month=1, day=1)) - timedelta(days=1)
    else:  # "this_year"
        start = now.replace(month=1, day=1)
        end = now.replace(month=12, day=31)

    missions = Mission.objects.filter(date_departure__range=(start.date(), end.date()))
    mission_personnel = MissionPersonnel.objects.filter(
        mission__date_departure__range=(start.date(), end.date())
    ).select_related("personnel", "mission")

    total_missions = missions.count()
    total_participations = mission_personnel.count()
    unique_personnel = mission_personnel.values("personnel").distinct().count()

    total_spent = sum(Decimal(mp.total_payment or 0) for mp in mission_personnel)

    # Filter all budget entries for the year
    budgets = Budget.objects.filter(year=now.year)
    total_budget = sum(b.amount for b in budgets)

    if total_budget > 0:
        remaining_budget = total_budget - total_spent
        percent_used = (total_spent / total_budget) * 100
    else:
        remaining_budget = Decimal("0.00")
        percent_used = 0

    return Response({
        "filter": filter_type,
        "start": start.date(),
        "end": end.date(),
        "total_missions": total_missions,
        "total_participations": total_participations,
        "unique_personnel": unique_personnel,
        "total_spent": float(total_spent),
        "budget_amount": float(total_budget) if total_budget else 0,
        "remaining_budget": float(remaining_budget),
        "percent_used": round(percent_used, 2),
        "is_overspent": total_spent > total_budget if total_budget > 0 else None,
        "warning": "Budget exceeded!" if total_spent > total_budget else None
    })


class GroupedMissionsView(generics.ListAPIView):
    serializer_class = MissionWithPersonnelSerializer

    def get_queryset(self):
        return Mission.objects.all()


# MAIN VIEWSET FOR MISSION WITH PERSONNEL CRUD
class MissionWithPersonnelViewSet(viewsets.ModelViewSet):
    """
    ViewSet for creating, updating, and retrieving missions with personnel assignments.
    This allows creating a mission and assigning personnel in a single API call.
    """
    queryset = Mission.objects.all().select_related('destination_wilaya').prefetch_related('missionpersonnel_set__personnel')
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        'transport_type': ['exact'],
        'funding_type': ['exact'],
        'mission_nature': ['exact'],
        'year': ['exact'],
    }
    filterset_class = MissionFilter
    ordering_fields = ['date_departure', 'date_arrival', 'destination_wilaya']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return MissionWithPersonnelCRUDSerializer
        elif self.action in ['list', 'retrieve']:
            return MissionWithPersonnelSerializer
        return MissionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        filter_type = self.request.query_params.get('filter', None)
        now = datetime.now()

        if filter_type == 'this_week':
            start = now - timedelta(days=now.weekday())
            end = start + timedelta(days=6)
            queryset = queryset.filter(date_departure__range=(start.date(), end.date()))

        elif filter_type == 'this_month':
            start = now.replace(day=1)
            end = (start.replace(month=start.month + 1, day=1) if start.month < 12 else start.replace(year=start.year + 1, month=1, day=1)) - timedelta(days=1)
            queryset = queryset.filter(date_departure__range=(start.date(), end.date()))

        elif filter_type == 'this_quarter':
            quarter = (now.month - 1) // 3 + 1
            start_month = 3 * (quarter - 1) + 1
            start = now.replace(month=start_month, day=1)
            end = (start.replace(month=start_month + 3, day=1) if quarter < 4 else start.replace(year=now.year + 1, month=1, day=1)) - timedelta(days=1)
            queryset = queryset.filter(date_departure__range=(start.date(), end.date()))

        elif filter_type == 'this_year':
            start = now.replace(month=1, day=1)
            end = now.replace(month=12, day=31)
            queryset = queryset.filter(date_departure__range=(start.date(), end.date()))

        return queryset
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.permissions import AllowAny
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from io import BytesIO
from personnel.models import Personnel
from .models import MissionPersonnel, Mission
from decimal import Decimal
from datetime import datetime

logger = logging.getLogger(__name__)

class GeneratePersonnelReportView(APIView):
    permission_classes = [AllowAny]  # Adjust as needed (e.g., IsAuthenticated)
    parser_classes = [JSONParser]

    def get(self, request, id, year=None):
        try:
            # Validate inputs
            if not id:
                response = Response({'error': 'Personnel ID is required'}, status=400)
                logger.info("Status Code: %s", response.status_code)
                print("Status Code:", response.status_code)
                return response

            try:
                id = int(id)
                year = int(year) if year else datetime.now().year
            except (TypeError, ValueError):
                response = Response({'error': 'Invalid ID or year'}, status=400)
                logger.info("Status Code: %s", response.status_code)
                print("Status Code:", response.status_code)
                return response

            # Get personnel
            personnel = get_object_or_404(Personnel, id=id)

            # Get mission records
            mission_records = MissionPersonnel.objects.filter(
                personnel=personnel,
                mission__year=year
            ).select_related('mission', 'mission__destination_wilaya').order_by('mission__date_departure')

            # Create PDF
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=36)
            elements = []
            styles = getSampleStyleSheet()

            # Title
            elements.append(Paragraph(
                "<para align=center><b>REPUBLIQUE ALGERIENNE DEMOCRATIQUE ET POPULAIRE</b></para>",
                styles['Title']
            ))
            elements.append(Paragraph(
                "<para align=center><b>Faculté des Sciences Exactes</b></para>",
                styles['Heading2']
            ))
            elements.append(Spacer(1, 20))
            elements.append(Paragraph(
                f"<para align=center><b>RAPPORT DE MISSIONS - ANNÉE {year}</b></para>",
                styles['Heading2']
            ))
            elements.append(Spacer(1, 20))

            # Personnel Details
            details_data = [
                ['Nom et Prénom:', personnel.name],
                ['Profession:', personnel.profession or 'N/A'],
                ['Grade:', personnel.grade.name if personnel.grade else 'N/A'],
                ['Numéro de Compte:', personnel.account_number or 'N/A'],
                ['Type de Compte:', 'CCP' if personnel.is_ccp_account else 'Bancaire'],
                ['Adresse:', personnel.address or 'N/A'],
                ['Wilaya:', personnel.wilaya.name if personnel.wilaya else 'N/A'],
                ['Année:', str(year)],
            ]

            details_table = Table(details_data, colWidths=[2*inch, 4*inch])
            details_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPENDING', (0, 0), (-1, -1), 12),
                ('BACKGROUND', (1, 0), (1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            elements.append(details_table)
            elements.append(Spacer(1, 20))

            if mission_records.exists():
                # Mission Summary
                elements.append(Paragraph("<b>RÉSUMÉ DES MISSIONS</b>", styles['Heading3']))
                elements.append(Spacer(1, 10))

                # Calculate totals
                total_missions = mission_records.count()
                total_transport = sum(record.transport_payment for record in mission_records)
                total_meals = sum(record.meal_payment for record in mission_records)
                total_lodging = sum(record.lodging_payment or Decimal('0') for record in mission_records)
                grand_total = sum(record.total_payment for record in mission_records)

                summary_data = [
                    ['Nombre total de missions:', str(total_missions)],
                    ['Total frais de transport:', f"{total_transport:.2f} DA"],
                    ['Total frais de repas:', f"{total_meals:.2f} DA"],
                    ['Total frais d\'hébergement:', f"{total_lodging:.2f} DA"],
                    ['MONTANT TOTAL:', f"{grand_total:.2f} DA"]
                ]

                summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
                summary_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (0, -1), colors.lightblue),
                    ('BACKGROUND', (0, -1), (-1, -1), colors.lightgreen),
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                    ('FONTNAME', (1, 0), (1, -2), 'Helvetica'),
                    ('FONTNAME', (1, -1), (1, -1), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('BOTTOMPENDING', (0, 0), (-1, -1), 12),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black)
                ]))
                elements.append(summary_table)
                elements.append(Spacer(1, 20))

                # Detailed Mission List
                elements.append(Paragraph("<b>DÉTAIL DES MISSIONS</b>", styles['Heading3']))
                elements.append(Spacer(1, 10))

                mission_data = [
                    ['Date Départ', 'Date Arrivée', 'Destination', 'Nature', 'Transport', 'Financement', 'Montant Total (DA)']
                ]

                for record in mission_records:
                    mission = record.mission
                    mission_data.append([
                        mission.date_departure.strftime('%d/%m/%Y'),
                        mission.date_arrival.strftime('%d/%m/%Y'),
                        mission.destination_wilaya.name,
                        dict(Mission.MISSION_NATURE_CHOICES).get(mission.mission_nature, mission.mission_nature),
                        dict(Mission.TRANSPORT_CHOICES).get(mission.transport_type, mission.transport_type),
                        dict(Mission.FUNDING_CHOICES).get(mission.funding_type, mission.funding_type),
                        f"{record.total_payment:.2f}"
                    ])

                mission_table = Table(mission_data, colWidths=[0.8*inch, 0.8*inch, 1.2*inch, 1*inch, 1*inch, 1*inch, 1*inch])
                mission_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 8),
                    ('BOTTOMPENDING', (0, 0), (-1, -1), 6),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('BACKGROUND', (-1, 1), (-1, -1), colors.lightgreen),
                ]))
                elements.append(mission_table)
                elements.append(Spacer(1, 20))

                # Payment Breakdown
                elements.append(Paragraph("<b>DÉTAIL DES PAIEMENTS PAR MISSION</b>", styles['Heading3']))
                elements.append(Spacer(1, 10))

                breakdown_data = [
                    ['Mission', 'Transport (DA)', 'Repas (DA)', 'Hébergement (DA)', 'Total (DA)']
                ]

                for i, record in enumerate(mission_records, 1):
                    breakdown_data.append([
                        f"Mission {i}",
                        f"{record.transport_payment:.2f}",
                        f"{record.meal_payment:.2f}",
                        f"{record.lodging_payment or Decimal('0'):.2f}",
                        f"{record.total_payment:.2f}"
                    ])

                breakdown_data.append([
                    'TOTAL',
                    f"{total_transport:.2f}",
                    f"{total_meals:.2f}",
                    f"{total_lodging:.2f}",
                    f"{grand_total:.2f}"
                ])

                breakdown_table = Table(breakdown_data, colWidths=[1.5*inch, 1.2*inch, 1.2*inch, 1.2*inch, 1.2*inch])
                breakdown_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                    ('BACKGROUND', (0, -1), (-1, -1), colors.lightgreen),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                    ('FONTNAME', (0, 1), (-1, -2), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 9),
                    ('BOTTOMPENDING', (0, 0), (-1, -1), 8),
                    ('BACKGROUND', (0, 1), (-1, -2), colors.beige),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ]))
                elements.append(breakdown_table)
            else:
                elements.append(Paragraph(
                    f"<para align=center><b>Aucune mission trouvée pour l'année {year}</b></para>",
                    styles['Normal']
                ))

            # Footer
            elements.append(Spacer(1, 30))
            elements.append(Paragraph(
                f"<para align=center>Rapport généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}</para>",
                styles['Normal']
            ))

            # Build PDF
            doc.build(elements)
            buffer.seek(0)

            # Create response
            response = HttpResponse(buffer, content_type='application/pdf', status=200)
            clean_name = personnel.name.replace(' ', '_').replace(',', '').replace('.', '')
            filename = f"rapport_missions_{clean_name}_{year}.pdf"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            logger.info("Status Code: %s", response.status_code)
            print("Status Code:", response.status_code)
            return response

        except Personnel.DoesNotExist:
            response = Response({'error': 'Personnel not found'}, status=404)
            logger.info("Status Code: %s", response.status_code)
            print("Status Code:", response.status_code)
            return response
        except Exception as e:
            response = Response({'error': f'Failed to generate report: {str(e)}'}, status=500)
            logger.error("Status Code: %s, Error: %s", response.status_code, str(e))
            print("Status Code:", response.status_code)
            return response

class GenerateMissionReportView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]

    def get(self, request, mission_id):
        try:
            # Validate input
            if not mission_id:
                response = Response({'error': 'Mission ID is required'}, status=400)
                logger.info("Status Code: %s", response.status_code)
                print("Status Code:", response.status_code)
                return response

            try:
                mission_id = int(mission_id)
            except (TypeError, ValueError):
                response = Response({'error': 'Invalid mission ID'}, status=400)
                logger.info("Status Code: %s", response.status_code)
                print("Status Code:", response.status_code)
                return response

            # Get mission
            mission = get_object_or_404(Mission, id=mission_id)
            mission_personnel = MissionPersonnel.objects.filter(mission=mission).select_related('personnel')

            # Create PDF
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=36)
            elements = []
            styles = getSampleStyleSheet()

            # Title
            elements.append(Paragraph(
                "<para align=center><b>REPUBLIQUE ALGERIENNE DEMOCRATIQUE ET POPULAIRE</b></para>",
                styles['Title']
            ))
            elements.append(Paragraph(
                "<para align=center><b>Faculté des Sciences Exactes</b></para>",
                styles['Heading2']
            ))
            elements.append(Spacer(1, 20))
            elements.append(Paragraph(
                "<para align=center><b>RAPPORT DE MISSION</b></para>",
                styles['Heading2']
            ))
            elements.append(Spacer(1, 20))

            # Mission Details
            mission_details = [
                ['Destination:', mission.destination_wilaya.name],
                ['Nature de la mission:', dict(Mission.MISSION_NATURE_CHOICES).get(mission.mission_nature, mission.mission_nature)],
                ['Date de départ:', mission.date_departure.strftime('%d/%m/%Y')],
                ['Date d’arrivée:', mission.date_arrival.strftime('%d/%m/%Y')],
                ['Heure de départ:', mission.time_departure.strftime('%H:%M')],
                ['Heure d’arrivée:', mission.time_arrival.strftime('%H:%M')],
                ['Type de transport:', dict(Mission.TRANSPORT_CHOICES).get(mission.transport_type, mission.transport_type)],
                ['Type de financement:', dict(Mission.FUNDING_CHOICES).get(mission.funding_type, mission.funding_type)],
                ['Nuits d’hébergement:', str(mission.nights_stayed)],
                ['Repas couverts:', str(mission.meals_covered)]
            ]

            mission_table = Table(mission_details, colWidths=[2.5*inch, 3.5*inch])
            mission_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('BACKGROUND', (1, 0), (1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            elements.append(mission_table)
            elements.append(Spacer(1, 20))

            # Personnel List
            if mission_personnel.exists():
                elements.append(Paragraph("<b>PERSONNEL ASSIGNÉ</b>", styles['Heading3']))
                elements.append(Spacer(1, 10))

                personnel_data = [
                    ['Nom', 'Profession', 'Grade', 'Transport', 'Repas', 'Hébergement', 'Total']
                ]

                total_mission_cost = Decimal('0')

                for mp in mission_personnel:
                    p = mp.personnel
                    personnel_data.append([
                        p.name,
                        p.profession or 'N/A',
                        p.grade.name if p.grade else 'N/A',
                        f"{mp.transport_payment:.2f}",
                        f"{mp.meal_payment:.2f}",
                        f"{mp.lodging_payment or Decimal('0'):.2f}",
                        f"{mp.total_payment:.2f}"
                    ])
                    total_mission_cost += mp.total_payment

                personnel_data.append([
                    'TOTAL', '', '', '', '', '', f"{total_mission_cost:.2f} DA"
                ])

                personnel_table = Table(personnel_data, colWidths=[2*inch, 1.5*inch, 1*inch, 0.8*inch, 0.8*inch, 1*inch, 1*inch])
                personnel_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                    ('BACKGROUND', (0, -1), (-1, -1), colors.lightgreen),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                    ('FONTNAME', (0, 1), (-1, -2), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 9),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                    ('BACKGROUND', (0, 1), (-1, -2), colors.beige),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ]))
                elements.append(personnel_table)

            # Footer
            elements.append(Spacer(1, 30))
            elements.append(Paragraph(
                f"<para align=center>Rapport généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}</para>",
                styles['Normal']
            ))

            # Build PDF
            doc.build(elements)
            buffer.seek(0)

            # Create response
            response = HttpResponse(buffer, content_type='application/pdf', status=200)
            filename = f"rapport_mission_{mission.destination_wilaya.name}_{mission.date_departure.strftime('%Y%m%d')}.pdf"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            logger.info("Status Code: %s", response.status_code)
            print("Status Code:", response.status_code)
            return response

        except Mission.DoesNotExist:
            response = Response({'error': 'Mission not found'}, status=404)
            logger.info("Status Code: %s", response.status_code)
            print("Status Code:", response.status_code)
            return response
        except Exception as e:
            response = Response({'error': f'Failed to generate report: {str(e)}'}, status=500)
            logger.error("Status Code: %s, Error: %s", response.status_code, str(e))
            print("Status Code:", response.status_code)
            return response