from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT, TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from io import BytesIO
import io  # Ensure io module is imported for the new function
import os
from typing import Optional
from datetime import datetime
from reportlab.graphics.shapes import Drawing, Line, Rect, String, Circle
from reportlab.graphics import renderPDF
from reportlab.lib.colors import Color, toColor, black, white, blue, green, HexColor

from models.meeting import MeetingAnalysisJSON # Import the data model

# We'll no longer define global styles to avoid conflicts
# Instead, we'll create styles only when needed inside functions

def create_simple_line_chart(data_points, width=500, height=200, title="Chart"):
    """Create a simple line chart using ReportLab Drawing objects."""
    drawing = Drawing(width, height)
    
    # If we don't have at least 2 data points, return empty drawing
    if not data_points or len(data_points) < 2:
        return drawing
    
    # Layout parameters
    margin_left = 50
    margin_bottom = 40
    margin_top = 30
    margin_right = 30
    plot_width = width - margin_left - margin_right
    plot_height = height - margin_bottom - margin_top
    
    # Add chart title
    drawing.add(String(width/2, height-10, title, textAnchor="middle", fontSize=12))
    
    # Add axes
    drawing.add(Line(margin_left, margin_bottom, margin_left, height-margin_top, 
                     strokeColor=colors.black, strokeWidth=1))
    drawing.add(Line(margin_left, margin_bottom, width-margin_right, margin_bottom, 
                     strokeColor=colors.black, strokeWidth=1))
    
    # Add Y-axis labels (percentages)
    for i in range(5):
        y_value = i * 25  # 0, 25, 50, 75, 100
        y_pos = margin_bottom + (plot_height * y_value / 100)
        drawing.add(Line(margin_left-5, y_pos, margin_left, y_pos, 
                         strokeColor=colors.black, strokeWidth=1))
        drawing.add(String(margin_left-10, y_pos, f"{y_value}%", 
                           textAnchor="end", fontSize=8))
    
    # Prepare data points
    x_values = []
    y_values = []
    
    for i, point in enumerate(data_points):
        # For sentiment timeline, we use timestamp and sentiment values
        if hasattr(point, 'timestamp') and hasattr(point, 'sentiment'):
            x_values.append(point.timestamp)
            y_values.append(point.sentiment * 100)  # Convert to percentage
    
    # Normalize x values
    if x_values:
        x_min = min(x_values)
        x_max = max(x_values)
        x_range = max(x_max - x_min, 1)  # Avoid division by zero
        
        # Draw X-axis labels
        num_labels = min(len(x_values), 6)
        for i in range(num_labels):
            label_x = x_min + (i * x_range / (num_labels-1)) if num_labels > 1 else x_min
            x_pos = margin_left + (plot_width * (label_x - x_min) / x_range) if x_range > 0 else margin_left
            
            # Convert to minutes for display
            minutes = int(label_x / 60)
            drawing.add(Line(x_pos, margin_bottom, x_pos, margin_bottom-5, 
                           strokeColor=colors.black, strokeWidth=1))
            drawing.add(String(x_pos, margin_bottom-15, f"{minutes} min", 
                             textAnchor="middle", fontSize=8))
        
        # Draw the line chart
        for i in range(len(x_values) - 1):
            x1 = margin_left + (plot_width * (x_values[i] - x_min) / x_range)
            y1 = margin_bottom + (plot_height * y_values[i] / 100)
            x2 = margin_left + (plot_width * (x_values[i+1] - x_min) / x_range)
            y2 = margin_bottom + (plot_height * y_values[i+1] / 100)
            
            drawing.add(Line(x1, y1, x2, y2, strokeColor=HexColor('#3b82f6'), strokeWidth=2))
            
            # Add dots for data points
            drawing.add(Circle(x1, y1, 3, fillColor=HexColor('#3b82f6'), strokeColor=None))
        
        # Add the last point's dot
        if x_values:
            last_x = margin_left + (plot_width * (x_values[-1] - x_min) / x_range)
            last_y = margin_bottom + (plot_height * y_values[-1] / 100)
            drawing.add(Circle(last_x, last_y, 3, fillColor=HexColor('#3b82f6'), strokeColor=None))
    
    return drawing

def create_simple_bar_chart(labels, values, width=500, height=200, title="Chart"):
    """Create a simple bar chart using ReportLab Drawing objects."""
    drawing = Drawing(width, height)
    
    if not labels or not values or len(labels) != len(values):
        return drawing
    
    # Layout parameters
    margin_left = 60
    margin_bottom = 50
    margin_top = 30
    margin_right = 20
    plot_width = width - margin_left - margin_right
    plot_height = height - margin_bottom - margin_top
    
    # Add chart title
    drawing.add(String(width/2, height-10, title, textAnchor="middle", fontSize=12))
    
    # Add Y-axis
    drawing.add(Line(margin_left, margin_bottom, margin_left, height-margin_top, 
                     strokeColor=colors.black, strokeWidth=1))
    
    # Find maximum value for scaling
    max_value = max(values) if values else 0
    max_scale = ((max_value // 5) + 1) * 5  # Round up to nearest 5
    
    # Add Y-axis labels
    for i in range(6):
        y_value = i * max_scale / 5
        y_pos = margin_bottom + (plot_height * y_value / max_scale)
        drawing.add(Line(margin_left-5, y_pos, margin_left, y_pos, 
                         strokeColor=colors.black, strokeWidth=1))
        drawing.add(String(margin_left-10, y_pos, f"{int(y_value)}", 
                           textAnchor="end", fontSize=8))
    
    # Draw bars
    bar_count = len(labels)
    bar_width = plot_width / (bar_count * 2)  # Space between bars
    bar_colors = [HexColor('#60a5fa'), HexColor('#38bdf8'), HexColor('#34d399'), HexColor('#a78bfa')]
    
    for i, (label, value) in enumerate(zip(labels, values)):
        bar_height = plot_height * value / max_scale if max_scale > 0 else 0
        x_pos = margin_left + i * (plot_width / bar_count) + bar_width/2
        
        # Draw bar
        bar_color = bar_colors[i % len(bar_colors)]  # Cycle through colors
        drawing.add(Rect(x_pos, margin_bottom, bar_width, bar_height, 
                        fillColor=bar_color, strokeColor=None))
        
        # Add value on top of bar
        drawing.add(String(x_pos + bar_width/2, margin_bottom + bar_height + 5, 
                           str(int(value)), textAnchor="middle", fontSize=8))
        
        # Add label below bar
        drawing.add(String(x_pos + bar_width/2, margin_bottom-15, 
                           label, textAnchor="middle", fontSize=8))
    
    return drawing

def create_progress_bar(value, width=200, height=20, color='#3b82f6'):
    """Create a progress bar drawing for a percentage value."""
    drawing = Drawing(width, height)
    
    # Background (gray bar)
    drawing.add(Rect(0, 0, width, height, fillColor=colors.lightgrey, strokeColor=None))
    
    # Foreground (colored progress)
    progress_width = (value / 100) * width
    drawing.add(Rect(0, 0, progress_width, height, fillColor=HexColor(color), strokeColor=None))
    
    return drawing

def generate_pdf_report(analysis_data: MeetingAnalysisJSON, file_name: str) -> BytesIO:
    """Generates a PDF report from the meeting analysis data that matches dashboard display.

    Args:
        analysis_data: The MeetingAnalysisJSON object containing analysis results.
        file_name: The original file name of the meeting source.

    Returns:
        A BytesIO buffer containing the generated PDF.
    """
    from reportlab.lib.colors import Color, toColor, black, white
    from reportlab.graphics.shapes import Drawing, Rect
    from reportlab.graphics import renderPDF
    from reportlab.lib.pagesizes import letter
    from reportlab.graphics.charts.lineplots import LinePlot
    from reportlab.graphics.charts.barcharts import VerticalBarChart
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                        leftMargin=0.5*inch, rightMargin=0.5*inch,
                        topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    story = []

    # --- Create Fresh Styles ---
    # Create a new stylesheet each time to avoid conflicts
    styles = getSampleStyleSheet()
    
    # Add custom styles for our PDF
    basic_style_dict = {
        'Title': ParagraphStyle(
            name='Title', 
            parent=styles['Heading1'], 
            fontSize=18, 
            alignment=TA_CENTER, 
            spaceAfter=10
        ),
        'Subtitle': ParagraphStyle(
            name='Subtitle', 
            parent=styles['Normal'], 
            fontSize=12, 
            alignment=TA_CENTER, 
            textColor=toColor('#71717a')
        ),
        'SectionTitle': ParagraphStyle(
            name='SectionTitle', 
            parent=styles['Heading2'], 
            fontSize=16, 
            spaceBefore=20, 
            spaceAfter=10,
            textColor=toColor('#111827')
        ),
        'SubsectionTitle': ParagraphStyle(
            name='SubsectionTitle',
            parent=styles['Heading3'],
            fontSize=14,
            spaceBefore=10,
            spaceAfter=5
        ),
        'ActionItem': ParagraphStyle(
            name='ActionItem', 
            parent=styles['Normal'], 
            leftIndent=0.25*inch
        ),
        'CardTitle': ParagraphStyle(
            name='CardTitle', 
            parent=styles['Heading3'], 
            fontSize=12, 
            textColor=white
        ),
        'CardValue': ParagraphStyle(
            name='CardValue', 
            parent=styles['Heading1'], 
            fontSize=22, 
            textColor=white,
            alignment=TA_CENTER
        ),
        'CardLabel': ParagraphStyle(
            name='CardLabel', 
            parent=styles['Normal'], 
            fontSize=9, 
            textColor=toColor('#ffffff80')
        ),
        'Summary': ParagraphStyle(
            name='Summary', 
            parent=styles['Normal'], 
            spaceAfter=10
        ),
        'TopicItem': ParagraphStyle(
            name='TopicItem', 
            parent=styles['Normal'], 
            leftIndent=0.25*inch, 
            spaceBefore=2
        ),
        'Justify': ParagraphStyle(
            name='Justify', 
            alignment=TA_JUSTIFY
        ),
        'Center': ParagraphStyle(
            name='Center', 
            alignment=TA_CENTER
        ),
        'MetricLabel': ParagraphStyle(
            name='MetricLabel',
            parent=styles['Normal'],
            fontSize=10,
            textColor=toColor('#4b5563')
        ),
        'MetricValue': ParagraphStyle(
            name='MetricValue',
            parent=styles['Heading3'],
            fontSize=14,
            textColor=toColor('#111827')
        )
    }
    
    # Now add each style, checking if it already exists
    for style_name, style in basic_style_dict.items():
        if style_name not in styles:
            styles.add(style)
    
    # --- Extract Meeting Title from metadata ---
    meeting_title = "Meeting Analysis"
    if hasattr(analysis_data, 'meeting_title') and analysis_data.meeting_title:
        meeting_title = analysis_data.meeting_title
    elif analysis_data.metadata and hasattr(analysis_data.metadata, 'get'):
        # Try to get from metadata
        if 'meeting_title' in analysis_data.metadata:
            meeting_title = analysis_data.metadata['meeting_title']
        elif 'title' in analysis_data.metadata:
            meeting_title = analysis_data.metadata['title']
    
    # If all else fails, use a cleaner filename
    if meeting_title == "Meeting Analysis" and file_name:
        # Try to clean up the filename if it looks like a standard recording name
        if "Recording" in file_name:
            meeting_title = "Meeting Recording"
        else:
            # Remove file extensions for cleaner display
            meeting_title = os.path.splitext(os.path.basename(file_name))[0]
            # Remove transcript suffix if present
            meeting_title = meeting_title.replace(".transcript", "")
    
    # --- Title and Date ---
    story.append(Paragraph(f"Meeting Analysis: {meeting_title}", styles['Title']))
    
    # Add date if available
    meeting_date = ""
    if hasattr(analysis_data, 'date') and analysis_data.date:
        meeting_date = analysis_data.date
    elif analysis_data.metadata and hasattr(analysis_data.metadata, 'get'):
        meeting_date = analysis_data.metadata.get('date', '')
    
    if meeting_date:
        try:
            # Try to format the date nicely if it's in ISO format
            from datetime import datetime
            date_obj = datetime.fromisoformat(meeting_date.replace('Z', '+00:00'))
            formatted_date = date_obj.strftime("%B %d, %Y at %I:%M %p")
            story.append(Paragraph(f"Recorded on {formatted_date}", styles['Subtitle']))
        except:
            # If date parsing fails, just use the raw string
            story.append(Paragraph(f"Recorded on {meeting_date}", styles['Subtitle']))
    
    story.append(Spacer(1, 0.3*inch))
    
    # --- Current Meeting Section (Metric Cards) ---
    # Define colors that match the UI
    card_colors = {
        "sentiment": '#3b82f6',    # Blue 
        "engagement": '#06b6d4',   # Cyan
        "speaker": '#6366f1',      # Indigo
        "duration": '#3b82f6',     # Blue
    }
    
    # Calculate card dimensions for 2x2 grid
    card_width = (doc.width - 0.3*inch) / 2  # Leave small gap between cards
    card_height = 1.2*inch
    
    # Row 1: Sentiment and Engagement
    row1 = []
    
    # --- Overall Sentiment Card ---
    sentiment_value = 0
    if analysis_data.sentiment and hasattr(analysis_data.sentiment, 'overall') and analysis_data.sentiment.overall is not None:
        sentiment_value = int(analysis_data.sentiment.overall * 100)
    
    sentiment_table = Table(
        [[Paragraph("Overall Sentiment", styles['CardTitle'])], 
         [Paragraph(f"{sentiment_value}%", styles['CardValue'])],
         [Paragraph("Sentiment score from analysis", styles['CardLabel'])]],
        colWidths=[card_width-20],
        rowHeights=[20, 40, 15]
    )
    sentiment_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), toColor(card_colors['sentiment'])),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,1), (0,1), 'CENTER'),
    ]))
    row1.append(sentiment_table)
    
    # --- Engagement Card ---
    engagement_value = 0
    if analysis_data.metadata and hasattr(analysis_data.metadata, 'get'):
        engagement_value = int(float(analysis_data.metadata.get('engagement_score', 0)))
    
    engagement_table = Table(
        [[Paragraph("Average Engagement", styles['CardTitle'])], 
         [Paragraph(f"{engagement_value}%", styles['CardValue'])],
         [Paragraph("Overall participant engagement", styles['CardLabel'])]],
        colWidths=[card_width-20],
        rowHeights=[20, 40, 15]
    )
    engagement_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), toColor(card_colors['engagement'])),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,1), (0,1), 'CENTER'),
    ]))
    row1.append(engagement_table)
    
    # Row 2: Speaker and Duration
    row2 = []
    
    # --- Current Speaker Card ---
    speaker_name = "None"
    speaker_sentiment = 0
    if hasattr(analysis_data, 'last_speaker') and analysis_data.last_speaker:
        speaker_name = analysis_data.last_speaker
        # Try to get speaker sentiment
        if analysis_data.speakers:
            for speaker in analysis_data.speakers:
                if speaker.name == speaker_name and hasattr(speaker, 'sentiment'):
                    speaker_sentiment = int(speaker.sentiment * 100)
                    break
    
    speaker_table = Table(
        [[Paragraph("Current Speaker", styles['CardTitle'])], 
         [Paragraph(speaker_name, styles['CardValue'])],
         [Paragraph(f"Sentiment: {speaker_sentiment}%", styles['CardLabel'])]],
        colWidths=[card_width-20],
        rowHeights=[20, 40, 15]
    )
    speaker_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), toColor(card_colors['speaker'])),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,1), (0,1), 'CENTER'),
    ]))
    row2.append(speaker_table)
    
    # --- Duration Card ---
    duration_str = "00:00:00"
    if hasattr(analysis_data, 'duration') and analysis_data.duration is not None:
        duration_secs = analysis_data.duration
        hours = int(duration_secs // 3600)
        minutes = int((duration_secs % 3600) // 60)
        seconds = int(duration_secs % 60)
        duration_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    
    duration_table = Table(
        [[Paragraph("Meeting Duration", styles['CardTitle'])], 
         [Paragraph(duration_str, styles['CardValue'])],
         [Paragraph("Total meeting time", styles['CardLabel'])]],
        colWidths=[card_width-20],
        rowHeights=[20, 40, 15]
    )
    duration_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), toColor(card_colors['duration'])),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,1), (0,1), 'CENTER'),
    ]))
    row2.append(duration_table)
    
    # Create row tables
    row1_table = Table([row1], colWidths=[card_width, card_width])
    row1_table.setStyle(TableStyle([
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    
    row2_table = Table([row2], colWidths=[card_width, card_width])
    row2_table.setStyle(TableStyle([
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    
    # Add metric cards to the story
    story.append(row1_table)
    story.append(Spacer(1, 0.1*inch))
    story.append(row2_table)
    story.append(Spacer(1, 0.4*inch))
    
    # --- Meeting Summary --- 
    if analysis_data.summary:
        story.append(Paragraph("Meeting Summary", styles['SectionTitle']))
        story.append(Paragraph(analysis_data.summary, styles['Summary']))
        story.append(Spacer(1, 0.2*inch))
    
    # --- Sentiment Overview --- (Following UI order)
    if analysis_data.sentiment:
        story.append(Paragraph("Meeting Sentiment Overview", styles['SectionTitle']))
        story.append(Paragraph("Sentiment trend over time.", styles['MetricLabel']))
        
        # Add sentiment chart if timeline is available
        if hasattr(analysis_data.sentiment, 'timeline') and analysis_data.sentiment.timeline:
            # Generate the sentiment chart using direct ReportLab drawing
            sentiment_chart = create_simple_line_chart(
                analysis_data.sentiment.timeline, 
                width=500, 
                height=200, 
                title="Sentiment Timeline"
            )
            story.append(sentiment_chart)
        
        story.append(Spacer(1, 0.2*inch))
    
    # --- Meeting Participation ---
    if hasattr(analysis_data, 'participants') and analysis_data.participants:
        story.append(Paragraph("Meeting Participation", styles['SectionTitle']))
        story.append(Paragraph("Participation breakdown.", styles['MetricLabel']))
        
        # Create visualization of participant stats with direct drawing
        if hasattr(analysis_data.participants, 'totalParticipants'):
            labels = ['Total', 'Active', 'Speaking', 'Reacting']
            values = [
                analysis_data.participants.totalParticipants or 0,
                analysis_data.participants.activeParticipants or 0,
                analysis_data.participants.speakingParticipants or 0,
                analysis_data.participants.reactingParticipants or 0
            ]
            
            participation_chart = create_simple_bar_chart(
                labels,
                values,
                width=500,
                height=200,
                title="Participant Breakdown"
            )
            story.append(participation_chart)
        
        # Add more detailed metrics
        if hasattr(analysis_data.participants, 'totalParticipants') and analysis_data.participants.totalParticipants:
            total = analysis_data.participants.totalParticipants
            active = analysis_data.participants.activeParticipants or 0
            
            # Calculate overall participation percentage if possible
            if total > 0:
                overall_participation = 100 * active / total
                speaking_participants = analysis_data.participants.speakingParticipants or 0
                speaking_percentage = 100 * speaking_participants / total if total > 0 else 0
                
                story.append(Spacer(1, 0.2*inch))
                
                # Create participation metrics similar to the UI layout
                data = [
                    [Paragraph("Overall Participation", styles['MetricLabel']), 
                     Paragraph(f"{int(overall_participation)}%", styles['MetricValue'])],
                    [Paragraph(f"{active} out of {total} participants engaged in the meeting", styles['MetricLabel']), ""],
                    ["", ""],
                    [Paragraph("Speaking Participation", styles['MetricLabel']), 
                     Paragraph(f"{int(speaking_percentage)}%", styles['MetricValue'])],
                    [Paragraph(f"{speaking_participants} participants spoke during the meeting", styles['MetricLabel']), ""]
                ]
                
                participation_metrics = Table(data, colWidths=[4*inch, 2*inch])
                participation_metrics.setStyle(TableStyle([
                    ('VALIGN', (0,0), (-1,-1), 'TOP'),
                    ('ALIGN', (1,0), (1,-1), 'RIGHT'),
                    ('LEFTPADDING', (0,0), (-1,-1), 0),
                    ('RIGHTPADDING', (0,0), (-1,-1), 0),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
                ]))
                story.append(participation_metrics)
        
        story.append(Spacer(1, 0.2*inch))
    
    # --- Speaker Analysis ---
    if analysis_data.speakers:
        story.append(Paragraph("Speaker Analysis", styles['SectionTitle']))
        
        # Create a table for speaker data
        speaker_data = []
        speaker_data.append(["Speaker", "Speaking Time", "Sentiment"])
        
        for speaker in analysis_data.speakers:
            # Format speaking time safely
            speaking_time = "00:00"
            if hasattr(speaker, 'speakingTime') and speaker.speakingTime is not None:
                minutes = int(speaker.speakingTime // 60)
                seconds = int(speaker.speakingTime % 60)
                speaking_time = f"{minutes:02d}:{seconds:02d}"
            elif hasattr(speaker, 'speaking_time') and speaker.speaking_time is not None:
                minutes = int(speaker.speaking_time // 60)
                seconds = int(speaker.speaking_time % 60)
                speaking_time = f"{minutes:02d}:{seconds:02d}"
            
            # Format sentiment as percentage
            sentiment_pct = "N/A"
            if hasattr(speaker, 'sentiment') and speaker.sentiment is not None:
                sentiment_pct = f"{int(speaker.sentiment * 100)}%"
            elif hasattr(speaker, 'sentiment_score') and speaker.sentiment_score is not None:
                sentiment_pct = f"{int(speaker.sentiment_score * 100)}%"
            
            speaker_data.append([speaker.name, speaking_time, sentiment_pct])
        
        if len(speaker_data) > 1:
            table_style = TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.lightblue),
                ('TEXTCOLOR', (0,0), (-1,0), colors.black),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0,0), (-1,0), 12),
                ('BACKGROUND', (0,1), (-1,-1), colors.white),
                ('GRID', (0,0), (-1,-1), 1, colors.lightgrey),
                ('BOX', (0,0), (-1,-1), 1, colors.black)
            ])
            speaker_table = Table(speaker_data, colWidths=[3*inch, 1.5*inch, 1.5*inch])
            speaker_table.setStyle(table_style)
            story.append(speaker_table)
            story.append(Spacer(1, 0.2*inch))
    
    # --- Topics Analysis --- 
    if analysis_data.topics and hasattr(analysis_data.topics, 'topics') and analysis_data.topics.topics:
        story.append(Paragraph("AI-Powered Topic Analysis", styles['SectionTitle']))
        
        # Create a table for topic data
        topic_data = []
        topic_data.append(["Topic", "Percentage", "Keywords"])
        
        for topic in analysis_data.topics.topics:
            # Handle keywords display
            keywords_text = "N/A"
            if hasattr(topic, 'keywords') and topic.keywords:
                keywords_text = ", ".join(topic.keywords[:5])  # Limit to first 5 keywords for space
            
            percentage_text = f"{topic.percentage:.1f}%" if hasattr(topic, 'percentage') else "N/A"
            
            topic_data.append([topic.name, percentage_text, keywords_text])
        
        if len(topic_data) > 1:
            table_style = TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.lightblue),
                ('TEXTCOLOR', (0,0), (-1,0), colors.black),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0,0), (-1,0), 12),
                ('BACKGROUND', (0,1), (-1,-1), colors.white),
                ('GRID', (0,0), (-1,-1), 1, colors.lightgrey),
                ('BOX', (0,0), (-1,-1), 1, colors.black),
                ('WORDWRAP', (0,0), (-1,-1), True),
                ('ALIGN', (0,1), (0,-1), 'LEFT')
            ])
            
            topic_table = Table(topic_data, colWidths=[2*inch, 1*inch, 3*inch])
            topic_table.setStyle(table_style)
            story.append(topic_table)
        story.append(Spacer(1, 0.2*inch))

    # --- Action Items --- 
    if analysis_data.action_items:
        story.append(Paragraph("Action Items", styles['SectionTitle']))
        for item in analysis_data.action_items:
            story.append(Paragraph(f"• {item}", styles['ActionItem']))
        story.append(Spacer(1, 0.2*inch))
        
    # --- Reactions Analysis ---
    if hasattr(analysis_data, 'reactions') and analysis_data.reactions:
        story.append(Paragraph("Meeting Reactions Analysis", styles['SectionTitle']))
        
        # Create a table for reactions data
        reactions_data = []
        reactions_data.append(["Reaction", "Count"])
        
        if hasattr(analysis_data.reactions, 'reactions'):
            for reaction in analysis_data.reactions.reactions:
                reactions_data.append([reaction.name, str(reaction.count)])
        
        if len(reactions_data) > 1:
            table_style = TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.lightblue),
                ('TEXTCOLOR', (0,0), (-1,0), colors.black),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0,0), (-1,0), 12),
                ('BACKGROUND', (0,1), (-1,-1), colors.white),
                ('GRID', (0,0), (-1,-1), 1, colors.lightgrey),
                ('BOX', (0,0), (-1,-1), 1, colors.black)
            ])
            
            reactions_table = Table(reactions_data, colWidths=[3*inch, 3*inch])
            reactions_table.setStyle(table_style)
            story.append(reactions_table)
        story.append(Spacer(1, 0.2*inch))
        
    # --- AI Insights --- 
    if analysis_data.insights:
        story.append(Paragraph("Additional AI Insights", styles['SectionTitle']))
        story.append(Paragraph(analysis_data.insights, styles['Justify']))
        story.append(Spacer(1, 0.2*inch))

    # --- Build PDF --- 
    try:
        print("Building PDF report...")
        doc.build(story)
        print("PDF report built successfully.")
        buffer.seek(0) # Rewind buffer to the beginning
        return buffer
    except Exception as e:
        print(f"Error building PDF: {e}")
        raise RuntimeError(f"PDF generation failed: {e}")

def generate_pdf_from_file(analysis_data: dict, meeting_id: str, version: Optional[int] = None) -> io.BytesIO:
    """
    Generate a PDF report from analysis data loaded directly from a file.
    
    Args:
        analysis_data: The analysis data in dictionary form
        meeting_id: The meeting ID (logical ID)
        version: Optional version number
        
    Returns:
        io.BytesIO: A buffer containing the generated PDF
    """
    # Import at the top of the function to avoid reference errors
    from models.meeting import MeetingAnalysisJSON
    
    print(f"Generating PDF from file data for meeting {meeting_id}, version: {version or 'latest'}")
    
    # If version is specified, check if it exists in previous_versions
    if version is not None and "previous_versions" in analysis_data:
        for v in analysis_data.get("previous_versions", []):
            if v.get("version") == version:
                # Create a simplified version of the analysis data with the historical version
                compact_data = {
                    "meeting_title": analysis_data.get("meeting_title", meeting_id),
                    "meetingId": meeting_id,
                    "summary": v.get("summary", ""),
                    "date": v.get("timestamp", ""),
                    "sentiment": v.get("sentiment", {"overall": 0}),
                    "topics": {"topics": [{"name": t, "percentage": 0} for t in v.get("topics", [])]},
                    "action_items": v.get("action_items", []),
                    "version_info": {
                        "version": version,
                        "is_historical": True,
                        "current_version": analysis_data.get("version", 1)
                    }
                }
                analysis_data = compact_data
                break
    
    # Set a default meeting title if not present
    if "meeting_title" not in analysis_data:
        analysis_data["meeting_title"] = meeting_id
    
    # Make sure we have a metadata field to avoid errors
    if "metadata" not in analysis_data:
        analysis_data["metadata"] = {}
    
    # Extract filename from original data or use a default
    filename = analysis_data.get("metadata", {}).get("source_file", f"meeting_{meeting_id}")
    
    try:
        # Check if analysis_data is already a MeetingAnalysisJSON object
        if isinstance(analysis_data, MeetingAnalysisJSON):
            print(f"Data is already a MeetingAnalysisJSON object for {meeting_id}")
            analysis_obj = analysis_data
        else:
            # Convert the dictionary to a MeetingAnalysisJSON object
            # Make sure all required fields exist
            required_fields = {
                "metadata": {},
                "summary": "",
                "action_items": [],
                "duration": 0,
                "sentiment": {"overall": 0},
                "speakers": [],
                "topics": {"topics": []},
                "participants": None,
            }
            
            # Ensure required fields exist with defaults if missing
            for field, default in required_fields.items():
                if field not in analysis_data:
                    analysis_data[field] = default
            
            analysis_obj = MeetingAnalysisJSON(**analysis_data)
            print(f"Successfully converted data to MeetingAnalysisJSON object for {meeting_id}")
        
        # Generate the PDF with the Pydantic model
        return generate_pdf_report(analysis_obj, filename)
    except Exception as e:
        print(f"Error converting data to MeetingAnalysisJSON: {e}")
        print(f"Attempting fallback with direct dictionary usage for {meeting_id}")
        
        # Use the dictionary directly with the regular generate_pdf_report
        try:
            # Create a minimal data structure that matches what generate_pdf_report expects
            minimal_data = MeetingAnalysisJSON(
                meeting_title=analysis_data.get("meeting_title", meeting_id),
                metadata=analysis_data.get("metadata", {}),
                summary=analysis_data.get("summary", ""),
                action_items=analysis_data.get("action_items", []),
                duration=analysis_data.get("duration", 0),
                sentiment={"overall": analysis_data.get("sentiment", {}).get("overall", 0) if isinstance(analysis_data.get("sentiment"), dict) else 0},
                speakers=[],
                topics={"topics": []}
            )
            return generate_pdf_report(minimal_data, filename)
        except Exception as fallback_error:
            print(f"Fallback also failed: {fallback_error}")
            raise RuntimeError(f"PDF generation failed: {fallback_error}")

# Note: Need to import ParagraphStyle for the custom styles added

# Example Usage (requires analysis_data object):
# if __name__ == "__main__":
#     # Create a dummy MeetingAnalysisJSON object
#     dummy_data = MeetingAnalysisJSON(
#         metadata={"source_file": "test_meeting.vtt"},
#         summary="The meeting discussed project alpha progress and blockers.",
#         action_items=["Alice to schedule follow-up", "Bob to update budget sheet"],
#         duration=3665.0,
#         participants=ParticipantStatsOutput(totalParticipants=5),
#         sentiment=SentimentAnalysisOutput(overall=0.75),
#         topics=TopicsOutput(topics=[
#             TopicAnalysisOutput(name="0_project_alpha_progress", percentage=60.5, keywords=["alpha", "progress", "timeline"]),
#             TopicAnalysisOutput(name="1_budget_blockers_review", percentage=39.5, keywords=["budget", "blockers", "resources"])
#         ]),
#         insights="Overall engagement seemed high during the progress update."
#     )
#     
#     try:
#         pdf_buffer = generate_pdf_report(dummy_data, "test_meeting.vtt")
#         output_filename = "meeting_report_test.pdf"
#         with open(output_filename, "wb") as f:
#             f.write(pdf_buffer.read())
#         print(f"Test PDF saved as: {output_filename}")
#     except Exception as e:
#         print(f"Test PDF generation failed: {e}") 