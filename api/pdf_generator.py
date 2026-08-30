"""
PDF Generation utilities for Resume Analyzer.
Converted from Flask app's PDF generation functions.
"""
import io
import math
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.graphics.shapes import Drawing, Group, Line, Rect, String


def create_roadmap_diagram(roadmap_data):
    """Create a flowchart/timeline diagram showing skill progression"""
    diagram_data = roadmap_data.get('diagram_structure', {})
    nodes = diagram_data.get('nodes', [])
    connections = diagram_data.get('connections', [])
    timeline = diagram_data.get('timeline', [])
    
    # If no diagram data, create from phases
    if not nodes and roadmap_data.get('phases'):
        nodes = []
        connections = []
        month_counter = 1
        skill_positions = {}
        
        for phase in roadmap_data.get('phases', []):
            skills = phase.get('skills_covered', [])
            phase_num = phase.get('phase_number', 1)
            duration_weeks = phase.get('duration_weeks', 4)
            months = math.ceil(duration_weeks / 4)
            
            for i, skill in enumerate(skills):
                position = len(nodes) + 1
                nodes.append({
                    'skill': skill,
                    'phase': f"Phase {phase_num}",
                    'month': month_counter,
                    'dependencies': [],
                    'position': position
                })
                skill_positions[skill] = position
                month_counter += 0.5  # Space skills within phase
            
            month_counter = math.ceil(month_counter)
        
        # Create connections based on phase order
        for i in range(len(nodes) - 1):
            connections.append({
                'from': nodes[i]['skill'],
                'to': nodes[i + 1]['skill'],
                'type': 'dependency'
            })
    
    # Create drawing
    width = 7.5 * inch
    height = 5 * inch
    drawing = Drawing(width, height)
    
    # Background
    bg = Rect(0, 0, width, height, fillColor=colors.HexColor('#F8FAFC'), strokeColor=colors.HexColor('#E5E7EB'))
    drawing.add(bg)
    
    # Title
    title = String(width/2, height - 0.5*inch, "Learning Roadmap Diagram", 
                   textAnchor='middle', fontSize=16, fillColor=colors.HexColor('#4F46E5'), fontName='Helvetica-Bold')
    drawing.add(title)
    
    if not nodes:
        # No data message
        msg = String(width/2, height/2, "Diagram data not available", 
                     textAnchor='middle', fontSize=12, fillColor=colors.grey)
        drawing.add(msg)
        return drawing
    
    # Organize nodes by month
    nodes_by_month = {}
    for node in nodes:
        month = node.get('month', 1)
        if month not in nodes_by_month:
            nodes_by_month[month] = []
        nodes_by_month[month].append(node)
    
    max_month = max(nodes_by_month.keys()) if nodes_by_month else 1
    month_width = (width - 2*inch) / max(1, max_month)
    node_height = 0.6 * inch
    vertical_spacing = 0.8 * inch
    
    # Draw timeline
    timeline_y = height - 1.5*inch
    timeline_line = Line(1*inch, timeline_y, width - 1*inch, timeline_y, 
                         strokeColor=colors.HexColor('#4F46E5'), strokeWidth=2)
    drawing.add(timeline_line)
    
    # Draw month markers
    for month in range(1, max_month + 1):
        x = 1*inch + (month - 0.5) * month_width
        # Month label
        month_label = String(x, timeline_y + 0.2*inch, f"{month}M", 
                            textAnchor='middle', fontSize=10, fillColor=colors.HexColor('#7C3AED'), fontName='Helvetica-Bold')
        drawing.add(month_label)
        # Vertical line
        month_line = Line(x, timeline_y, x, timeline_y - 0.1*inch, 
                         strokeColor=colors.HexColor('#7C3AED'), strokeWidth=1)
        drawing.add(month_line)
    
    # Draw nodes (skills)
    node_y_positions = {}
    for month, month_nodes in nodes_by_month.items():
        x = 1*inch + (month - 0.5) * month_width
        num_nodes = len(month_nodes)
        
        for i, node in enumerate(month_nodes):
            # Calculate vertical position (distribute nodes vertically)
            if num_nodes == 1:
                y = timeline_y - 1.5*inch
            else:
                spacing = min(vertical_spacing, (timeline_y - 0.5*inch) / num_nodes)
                y = timeline_y - 0.5*inch - (i * spacing) - (node_height / 2)
            
            node_y_positions[node['skill']] = (x, y)
            
            # Draw node box
            box_width = min(1.2*inch, month_width - 0.2*inch)
            box = Rect(x - box_width/2, y - node_height/2, box_width, node_height,
                      fillColor=colors.HexColor('#4F46E5'), strokeColor=colors.HexColor('#2D1B69'), strokeWidth=1)
            drawing.add(box)
            
            # Skill name (truncate if too long)
            skill_name = node['skill']
            if len(skill_name) > 15:
                skill_name = skill_name[:12] + "..."
            skill_text = String(x, y, skill_name, 
                               textAnchor='middle', fontSize=8, fillColor=colors.white, fontName='Helvetica-Bold')
            drawing.add(skill_text)
            
            # Phase label
            phase = node.get('phase', '')
            if phase:
                phase_text = String(x, y - node_height/2 - 0.1*inch, phase, 
                                   textAnchor='middle', fontSize=7, fillColor=colors.HexColor('#7C3AED'), fontName='Helvetica')
                drawing.add(phase_text)
    
    # Draw connections (arrows)
    for conn in connections:
        from_skill = conn.get('from', '')
        to_skill = conn.get('to', '')
        
        if from_skill in node_y_positions and to_skill in node_y_positions:
            x1, y1 = node_y_positions[from_skill]
            x2, y2 = node_y_positions[to_skill]
            
            # Only draw if to_skill is to the right of from_skill
            if x2 > x1:
                # Draw arrow line
                arrow = Line(x1 + 0.6*inch, y1, x2 - 0.6*inch, y2,
                            strokeColor=colors.HexColor('#9333EA'), strokeWidth=1.5)
                drawing.add(arrow)
                
                # Draw arrowhead
                arrow_length = 0.15*inch
                angle = math.atan2(y2 - y1, x2 - x1)
                arrow_x = x2 - 0.6*inch
                arrow_y = y2
                
                # Arrowhead points
                arrow_x1 = arrow_x - arrow_length * math.cos(angle - math.pi/6)
                arrow_y1 = arrow_y - arrow_length * math.sin(angle - math.pi/6)
                arrow_x2 = arrow_x - arrow_length * math.cos(angle + math.pi/6)
                arrow_y2 = arrow_y - arrow_length * math.sin(angle + math.pi/6)
                
                arrowhead = Group()
                arrowhead.add(Line(arrow_x, arrow_y, arrow_x1, arrow_y1, 
                                  strokeColor=colors.HexColor('#9333EA'), strokeWidth=1.5))
                arrowhead.add(Line(arrow_x, arrow_y, arrow_x2, arrow_y2, 
                                  strokeColor=colors.HexColor('#9333EA'), strokeWidth=1.5))
                drawing.add(arrowhead)
    
    # Legend
    legend_y = 0.3*inch
    legend_x = 0.5*inch
    
    # Legend box
    legend_box = Rect(legend_x, legend_y, 2*inch, 0.4*inch,
                     fillColor=colors.white, strokeColor=colors.HexColor('#E5E7EB'), strokeWidth=1)
    drawing.add(legend_box)
    
    # Legend text
    legend_title = String(legend_x + 0.1*inch, legend_y + 0.25*inch, "Legend:", 
                         fontSize=9, fillColor=colors.black, fontName='Helvetica-Bold')
    drawing.add(legend_title)
    
    # Legend items
    legend_items = [
        ("Boxes = Skills", legend_x + 0.1*inch, legend_y + 0.1*inch),
        ("Arrows = Dependencies", legend_x + 1.1*inch, legend_y + 0.1*inch)
    ]
    for text, x_pos, y_pos in legend_items:
        legend_item = String(x_pos, y_pos, text, 
                            fontSize=7, fillColor=colors.grey, fontName='Helvetica')
        drawing.add(legend_item)
    
    return drawing


def generate_roadmap_pdf(roadmap_data, basic_info=None):
    """Generate PDF for learning roadmap"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#4F46E5'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#4F46E5'),
        spaceAfter=12,
        fontName='Helvetica-Bold'
    )
    
    subheading_style = ParagraphStyle(
        'CustomSubHeading',
        parent=styles['Heading3'],
        fontSize=14,
        textColor=colors.HexColor('#7C3AED'),
        spaceAfter=8,
        fontName='Helvetica-Bold'
    )
    
    # Title
    story.append(Paragraph(roadmap_data.get('roadmap_title', 'Learning Roadmap'), title_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Applicant Info - Table Format
    if basic_info:
        story.append(Paragraph("Applicant Information", heading_style))
        info_data = []
        if basic_info.get('full_name'):
            info_data.append(['Name:', basic_info.get('full_name', 'N/A')])
        if basic_info.get('email'):
            info_data.append(['Email:', basic_info.get('email')])
        if basic_info.get('contact_number'):
            info_data.append(['Contact:', basic_info.get('contact_number')])
        if basic_info.get('linkedin'):
            info_data.append(['LinkedIn:', basic_info.get('linkedin')])
        if basic_info.get('github'):
            info_data.append(['GitHub:', basic_info.get('github')])
        
        if info_data:
            info_table = Table(info_data, colWidths=[2*inch, 4*inch])
            info_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F3F4F6')),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#E5E7EB')),
            ]))
            story.append(info_table)
            story.append(Spacer(1, 0.2*inch))
    
    # Overview
    story.append(Paragraph("Overview", heading_style))
    story.append(Paragraph(roadmap_data.get('overview', ''), styles['Normal']))
    story.append(Spacer(1, 0.2*inch))
    
    # Duration Info
    duration_text = f"<b>Total Duration:</b> {roadmap_data.get('total_duration_weeks', 0)} weeks ({roadmap_data.get('total_duration_months', 0)} months)<br/>"
    duration_text += f"<b>Study Time:</b> {roadmap_data.get('study_hours_per_day', 2.5)} hours/day, {roadmap_data.get('study_hours_per_week', 17.5)} hours/week"
    story.append(Paragraph(duration_text, styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    # Roadmap Diagram
    story.append(Paragraph("Learning Roadmap Diagram", heading_style))
    story.append(Spacer(1, 0.1*inch))
    diagram = create_roadmap_diagram(roadmap_data)
    story.append(diagram)
    story.append(Spacer(1, 0.3*inch))
    
    # Phases
    phases = roadmap_data.get('phases', [])
    for phase in phases:
        story.append(Paragraph(f"Phase {phase.get('phase_number', 0)}: {phase.get('phase_name', '')}", heading_style))
        story.append(Paragraph(f"<b>Duration:</b> {phase.get('duration_weeks', 0)} weeks", styles['Normal']))
        story.append(Paragraph(phase.get('description', ''), styles['Normal']))
        story.append(Spacer(1, 0.1*inch))
        
        # Learning Objectives
        if phase.get('learning_objectives'):
            story.append(Paragraph("Learning Objectives:", subheading_style))
            for obj in phase.get('learning_objectives', []):
                story.append(Paragraph(f"• {obj}", styles['Normal']))
            story.append(Spacer(1, 0.1*inch))
        
        # Skills Covered
        if phase.get('skills_covered'):
            story.append(Paragraph("Skills Covered:", subheading_style))
            skills_text = ", ".join(phase.get('skills_covered', []))
            story.append(Paragraph(skills_text, styles['Normal']))
            story.append(Spacer(1, 0.1*inch))
        
        # Resources
        if phase.get('resources'):
            story.append(Paragraph("Resources:", subheading_style))
            for resource in phase.get('resources', []):
                res_text = f"<b>{resource.get('type', '').title()}:</b> {resource.get('title', '')}"
                if resource.get('estimated_hours'):
                    res_text += f" ({resource.get('estimated_hours')} hours)"
                story.append(Paragraph(res_text, styles['Normal']))
            story.append(Spacer(1, 0.1*inch))
        
        # Projects
        if phase.get('projects'):
            story.append(Paragraph("Projects:", subheading_style))
            for project in phase.get('projects', []):
                proj_text = f"<b>{project.get('title', '')}</b> - {project.get('difficulty', '').title()}"
                if project.get('estimated_hours'):
                    proj_text += f" ({project.get('estimated_hours')} hours)"
                story.append(Paragraph(proj_text, styles['Normal']))
                story.append(Paragraph(project.get('description', ''), styles['Normal']))
            story.append(Spacer(1, 0.1*inch))
        
        story.append(Spacer(1, 0.2*inch))
    
    # Interview Preparation
    interview_prep = roadmap_data.get('interview_preparation', {})
    if interview_prep:
        story.append(PageBreak())
        story.append(Paragraph("Interview Preparation", heading_style))
        story.append(Paragraph(f"<b>Timeline:</b> {interview_prep.get('timeline_weeks', 2)} weeks", styles['Normal']))
        
        if interview_prep.get('topics'):
            story.append(Paragraph("Topics to Cover:", subheading_style))
            for topic in interview_prep.get('topics', []):
                story.append(Paragraph(f"• {topic}", styles['Normal']))
        
        if interview_prep.get('practice_resources'):
            story.append(Paragraph("Practice Resources:", subheading_style))
            for resource in interview_prep.get('practice_resources', []):
                res_text = f"<b>{resource.get('name', '')}</b> - {resource.get('description', '')}"
                story.append(Paragraph(res_text, styles['Normal']))
    
    # Key Takeaways
    if roadmap_data.get('key_takeaways'):
        story.append(Spacer(1, 0.2*inch))
        story.append(Paragraph("Key Takeaways", heading_style))
        for takeaway in roadmap_data.get('key_takeaways', []):
            story.append(Paragraph(f"• {takeaway}", styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    return buffer


def generate_complete_report_pdf(result, basic_info=None, roadmap=None):
    """Generate complete PDF report with analysis and roadmap"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#4F46E5'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#4F46E5'),
        spaceAfter=12,
        fontName='Helvetica-Bold'
    )
    
    # Title
    story.append(Paragraph("Resume Analysis Report", title_style))
    story.append(Paragraph(f"Generated on: {datetime.now().strftime('%B %d, %Y')}", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    # Applicant Information - Vertical Table Format
    if basic_info:
        story.append(Paragraph("Applicant Information", heading_style))
        info_data = []
        if basic_info.get('full_name'):
            info_data.append(['Full Name:', basic_info.get('full_name', 'N/A')])
        if basic_info.get('contact_number'):
            info_data.append(['Contact Number:', basic_info.get('contact_number', 'N/A')])
        if basic_info.get('email'):
            info_data.append(['Email:', basic_info.get('email', 'N/A')])
        if basic_info.get('github'):
            info_data.append(['GitHub:', basic_info.get('github', 'N/A')])
        if basic_info.get('linkedin'):
            info_data.append(['LinkedIn:', basic_info.get('linkedin', 'N/A')])
        
        if info_data:
            info_table = Table(info_data, colWidths=[2*inch, 4*inch])
            info_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F3F4F6')),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#E5E7EB')),
            ]))
            story.append(info_table)
            story.append(Spacer(1, 0.2*inch))
    
    # Analysis Section
    if result and not result.get('error'):
        story.append(PageBreak())
        story.append(Paragraph("Analysis Results", heading_style))
        story.append(Spacer(1, 0.1*inch))
        
        # Match Score
        story.append(Paragraph("Match Score", heading_style))
        score_text = f"<b>Match Score: {result.get('match_score', 0)}/100</b>"
        story.append(Paragraph(score_text, styles['Normal']))
        if result.get('summary'):
            story.append(Paragraph(result.get('summary', ''), styles['Normal']))
        story.append(Spacer(1, 0.2*inch))
        
        # Matching Skills
        if result.get('matching_skills'):
            story.append(Paragraph("Matching Skills", heading_style))
            skills_text = ", ".join(result.get('matching_skills', []))
            story.append(Paragraph(skills_text, styles['Normal']))
            story.append(Spacer(1, 0.2*inch))
        
        # Missing Skills
        if result.get('missing_skills'):
            story.append(Paragraph("Missing Skills", heading_style))
            skills_text = ", ".join(result.get('missing_skills', []))
            story.append(Paragraph(skills_text, styles['Normal']))
            story.append(Spacer(1, 0.2*inch))
        
        # Strengths
        if result.get('strengths'):
            story.append(Paragraph("Strengths", heading_style))
            for strength in result.get('strengths', []):
                story.append(Paragraph(f"• {strength}", styles['Normal']))
            story.append(Spacer(1, 0.2*inch))
        
        # Weaknesses
        if result.get('weaknesses'):
            story.append(Paragraph("Areas for Improvement", heading_style))
            for weakness in result.get('weaknesses', []):
                story.append(Paragraph(f"• {weakness}", styles['Normal']))
            story.append(Spacer(1, 0.2*inch))
        
        # Recommendations
        if result.get('recommendations'):
            story.append(Paragraph("Recommendations", heading_style))
            for rec in result.get('recommendations', []):
                story.append(Paragraph(f"• {rec}", styles['Normal']))
            story.append(Spacer(1, 0.2*inch))
        
        # Recommended Learning Videos - Simple Format
        if result.get('youtube_videos') and len(result.get('youtube_videos', [])) > 0:
            story.append(PageBreak())
            story.append(Paragraph("Recommended Learning Videos", heading_style))
            story.append(Spacer(1, 0.1*inch))
            
            for i, video in enumerate(result.get('youtube_videos', []), 1):
                video_title = video.get('title', 'Untitled Video')
                video_url = video.get('url', '')
                
                # Video name with link
                if video_url:
                    video_text = f"<b>{i}. {video_title}</b><br/>"
                    display_url = video_url
                    if len(display_url) > 70:
                        display_url = display_url[:67] + "..."
                    video_text += f'<link href="{video_url}" color="red"><u>{display_url}</u></link>'
                else:
                    video_text = f"<b>{i}. {video_title}</b>"
                
                story.append(Paragraph(video_text, styles['Normal']))
                story.append(Spacer(1, 0.15*inch))
        
        # Recommended Projects - Simple Format
        if result.get('project_suggestions') and len(result.get('project_suggestions', [])) > 0:
            story.append(PageBreak())
            story.append(Paragraph("Recommended Projects", heading_style))
            story.append(Spacer(1, 0.1*inch))
            
            for i, project in enumerate(result.get('project_suggestions', []), 1):
                project_title = project.get('title', 'Untitled Project')
                project_desc = project.get('description', '')
                project_github = project.get('github_url', '')
                project_youtube = project.get('youtube_url', '')
                
                # Project Title
                project_text = f"<b>{i}. {project_title}</b><br/>"
                
                # Description
                if project_desc:
                    project_text += f"{project_desc}<br/>"
                
                # Links
                links_text = ""
                if project_youtube:
                    youtube_display = project_youtube
                    if len(youtube_display) > 70:
                        youtube_display = youtube_display[:67] + "..."
                    links_text += f'<link href="{project_youtube}" color="red"><u>YouTube: {youtube_display}</u></link>'
                if project_github:
                    if links_text:
                        links_text += " | "
                    github_display = project_github
                    if len(github_display) > 70:
                        github_display = github_display[:67] + "..."
                    links_text += f'<link href="{project_github}" color="blue"><u>GitHub: {github_display}</u></link>'
                
                if links_text:
                    project_text += f"<br/>{links_text}"
                
                story.append(Paragraph(project_text, styles['Normal']))
                story.append(Spacer(1, 0.2*inch))
    
    doc.build(story)
    buffer.seek(0)
    return buffer
