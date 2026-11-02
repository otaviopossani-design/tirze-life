from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

def generate_medical_report(patient_name: str, report_data: dict, output_filename: str = "relatorio_tirzepatida.pdf"):
    doc = SimpleDocTemplate(output_filename, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    story = []
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontSize=18, textColor=colors.HexColor('#0F172A'), spaceAfter=6)
    subtitle_style = ParagraphStyle('DocSubtitle', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#64748B'), spaceAfter=20)
    section_heading = ParagraphStyle('SectionHeading', parent=styles['Heading2'], fontSize=12, textColor=colors.HexColor('#0284C7'), spaceBefore=12, spaceAfter=6)
    body_style = ParagraphStyle('DocBody', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#334155'), spaceAfter=6)

    story.append(Paragraph("Relatório Clínico de Acompanhamento — Tirzepatida", title_style))
    story.append(Paragraph(f"Paciente: {patient_name} | Gerado em: {datetime.now().strftime('%d/%m/%Y')}", subtitle_style))

    story.append(Paragraph("1. Posologia e Farmacocinética Ativa", section_heading))
    summary_text = f"Dose atual: <b>{report_data.get('current_dose', '2.5')} mg</b>. Concentração sérica estimada: <b>{report_data.get('active_mg', '0')} mg</b>. Adesão estrita à rotação anatômica e regra de afastamento umbilical."
    story.append(Paragraph(summary_text, body_style))

    story.append(Paragraph("2. Histórico de Eventos Sociais e Sintomas", section_heading))
    table_data = [["Data", "Evento Social / Exceção", "Náusea (1-5)", "Azia (1-5)", "Ajuste Hídrico"]]
    for event in report_data.get('events_history', []):
        table_data.append([
            event.get('date', '-'),
            event.get('type', '-'),
            str(event.get('nausea', 1)),
            str(event.get('acidity', 1)),
            f"+{event.get('water_added_ml', 0)} ml"
        ])

    t = Table(table_data, colWidths=[90, 180, 80, 80, 90])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('ALIGN', (2, 0), (-1, -1), 'CENTER'),
    ]))
    story.append(t)
    story.append(Spacer(1, 15))

    story.append(Paragraph("3. Adesão Nutricional e Proteção de Massa Magra", section_heading))
    nutrition_text = f"Média de consumo proteico: <b>{report_data.get('avg_protein', '0')}g/dia</b>. Hidratação média: <b>{report_data.get('avg_water', '0')} ml/dia</b>. Tratamento mantido sem interrupções por eventos adversos."
    story.append(Paragraph(nutrition_text, body_style))

    doc.build(story)
    return output_filename