# Script to generate a comprehensive, professionally styled Word document for JANSAATHI AI
import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_report():
    doc = Document()

    # Page setup - Margins
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
        # Header and Footer
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("JANSAATHI AI - Comprehensive Technical & Clinical Architecture Report")
        hrun.font.name = "Arial"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(100, 116, 139) # Slate 500

        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.LEFT
        frun1 = fp.add_run("Confidential & Proprietary • Public Health Clinical Infrastructure")
        frun1.font.name = "Arial"
        frun1.font.size = Pt(8.5)
        frun1.font.color.rgb = RGBColor(100, 116, 139)

    # Color Palette Constants
    COLOR_PRIMARY = RGBColor(15, 45, 74)     # Deep Clinical Navy #0F2D4A
    COLOR_SECONDARY = RGBColor(13, 148, 136) # Clinical Teal #0D9488
    COLOR_TEXT = RGBColor(30, 41, 59)        # Slate 800 #1E293B
    COLOR_MUTED = RGBColor(100, 116, 139)    # Slate 500 #64748B
    COLOR_RED = RGBColor(185, 28, 28)        # Urgent Red #B91C1C
    
    HEX_PRIMARY = "0F2D4A"
    HEX_SECONDARY = "0D9488"
    HEX_LIGHT_BG = "F1F5F9"
    HEX_ALERT_BG = "FEF2F2"
    HEX_BORDER = "CBD5E1"

    # Helper: Set cell shading
    def set_cell_background(cell, hex_color):
        shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
        cell._tc.get_or_add_tcPr().append(shading)

    # Helper: Set cell margins (padding)
    def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
        tcPr.append(tcMar)

    # Helper: Add Styled Heading 1
    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = "Arial"
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = COLOR_PRIMARY
        return p

    # Helper: Add Styled Heading 2
    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = "Arial"
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = COLOR_SECONDARY
        return p

    # Helper: Add Styled Heading 3
    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = "Arial"
        run.font.size = Pt(11)
        run.font.bold = True
        run.font.color.rgb = COLOR_TEXT
        return p

    # Helper: Add Body Paragraph
    def add_p(text, bold_prefix=None, space_after=6):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.font.name = "Arial"
            r_pre.font.size = Pt(10)
            r_pre.font.bold = True
            r_pre.font.color.rgb = COLOR_PRIMARY
        run = p.add_run(text)
        run.font.name = "Arial"
        run.font.size = Pt(10)
        run.font.color.rgb = COLOR_TEXT
        return p

    # Helper: Add Callout Box
    def add_callout(title, text, is_alert=False):
        table = doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = table.cell(0, 0)
        cell.width = Inches(6.5)
        
        bg_hex = HEX_ALERT_BG if is_alert else HEX_LIGHT_BG
        set_cell_background(cell, bg_hex)
        set_cell_margins(cell, top=140, bottom=140, left=200, right=200)

        # Border styling: Left border colored, others none
        border_color = "B91C1C" if is_alert else "0D9488"
        tcPr = cell._tc.get_or_add_tcPr()
        borders = parse_xml(f'''
            <w:tcBorders {nsdecls("w")}>
                <w:top w:val="none"/>
                <w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>
                <w:bottom w:val="none"/>
                <w:right w:val="none"/>
            </w:tcBorders>
        ''')
        tcPr.append(borders)

        cp = cell.paragraphs[0]
        cp.paragraph_format.space_before = Pt(0)
        cp.paragraph_format.space_after = Pt(2)
        r_title = cp.add_run(title + "\n")
        r_title.font.name = "Arial"
        r_title.font.size = Pt(10.5)
        r_title.font.bold = True
        r_title.font.color.rgb = COLOR_RED if is_alert else COLOR_SECONDARY

        r_text = cp.add_run(text)
        r_text.font.name = "Arial"
        r_text.font.size = Pt(9.5)
        r_text.font.color.rgb = COLOR_TEXT
        
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # -------------------------------------------------------------
    # COVER / HEADER TITLE BLOCK
    # -------------------------------------------------------------
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(24)
    title_p.paragraph_format.space_after = Pt(4)
    r_app = title_p.add_run("JANSAATHI AI")
    r_app.font.name = "Arial"
    r_app.font.size = Pt(28)
    r_app.font.bold = True
    r_app.font.color.rgb = COLOR_PRIMARY

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_before = Pt(0)
    sub_p.paragraph_format.space_after = Pt(12)
    r_sub = sub_p.add_run("Production-Ready Human-in-the-Loop Multilingual Clinical Triage Assistant")
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(14)
    r_sub.font.bold = True
    r_sub.font.color.rgb = COLOR_SECONDARY

    tag_p = doc.add_paragraph()
    tag_p.paragraph_format.space_before = Pt(0)
    tag_p.paragraph_format.space_after = Pt(16)
    r_tag = tag_p.add_run('“Every language. One structured triage note. A qualified human always decides.”')
    r_tag.font.name = "Arial"
    r_tag.font.size = Pt(11)
    r_tag.font.italic = True
    r_tag.font.color.rgb = COLOR_MUTED

    # Meta Table
    meta_table = doc.add_table(rows=4, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Document Classification:", "Official Technical & Clinical Architecture Specification"),
        ("System Release & Version:", "v1.0.0-PROD (Enterprise Health Infrastructure)"),
        ("Target Deployments:", "Primary Health Centres (PHCs), CHCs, Public Camps, Company Clinics"),
        ("Date of Publication:", "October 2026 • Verified Engineering Report")
    ]
    for idx, (label, val) in enumerate(meta_data):
        c1 = meta_table.cell(idx, 0)
        c2 = meta_table.cell(idx, 1)
        c1.width = Inches(2.2)
        c2.width = Inches(4.3)
        set_cell_background(c1, "F8FAFC")
        set_cell_background(c2, "FFFFFF")
        set_cell_margins(c1, top=60, bottom=60, left=100, right=100)
        set_cell_margins(c2, top=60, bottom=60, left=100, right=100)
        
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(label)
        r1.font.name = "Arial"
        r1.font.size = Pt(9.5)
        r1.font.bold = True
        r1.font.color.rgb = COLOR_PRIMARY
        
        p2 = c2.paragraphs[0]
        p2.paragraph_format.space_after = Pt(0)
        r2 = p2.add_run(val)
        r2.font.name = "Arial"
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = COLOR_TEXT

    doc.add_paragraph().paragraph_format.space_after = Pt(14)

    # Mandatory Legal Notice Callout
    add_callout(
        "MANDATORY CLINICAL GOVERNANCE & SAFETY NOTICE",
        "JANSAATHI AI is strictly an administrative and clinical triage-support system. It NEVER acts as an autonomous doctor, never produces medical diagnoses, never prescribes medications or treatment plans, and never calculates disease probability scores. Every clinical decision, diagnosis, and referral authorization remains the exclusive legal responsibility of a qualified healthcare professional.",
        is_alert=True
    )

    # -------------------------------------------------------------
    # 1. EXECUTIVE SUMMARY
    # -------------------------------------------------------------
    add_h1("1. Executive Summary")
    add_p(
        "Across public healthcare ecosystems in India—encompassing Primary Health Centres (PHCs), Community Health Centres (CHCs), high-volume public health camps, and industrial occupational health clinics—clinical consultations face a persistent challenge: high patient loads combined with messy, fragmented, and linguistically diverse patient histories. Attending physicians often have only minutes per consultation to decipher dialectal narratives, paper diagnostic slips, and unorganized prior histories."
    )
    add_p(
        "JANSAATHI AI solves this critical bottleneck by acting as an objective, human-in-the-loop information organizer. It captures multilingual patient speech, written text, uploaded lab reports, and sensor telemetry, automatically synthesizing them into a clean, standardized, chronologically ordered triage summary. By presenting attending clinicians with high-visibility urgency flags, discrete lab values, and highlighted clinical information gaps before the consultation begins, JANSAATHI AI dramatically accelerates patient review without compromising clinical safety."
    )
    add_p(
        "Crucially, JANSAATHI AI is engineered under a strict Zero Software Investment mandate. Utilizing free and open-source infrastructure—including browser-native Web Speech recognition, client-side Tesseract.js Web Worker OCR, Web Serial/Bluetooth medical telemetry, Google Gemini 2.5 Flash free-tier integration, and Supabase PostgreSQL with Row Level Security—the entire platform can be deployed at zero operational software cost."
    )

    # -------------------------------------------------------------
    # 2. PROBLEM STATEMENT & THE CLINICAL LANDSCAPE
    # -------------------------------------------------------------
    add_h1("2. Problem Statement & Healthcare Landscape")
    add_h2("2.1 The Frontline Healthcare Challenge in India")
    add_p(
        "Frontline healthcare in India operates under acute resource constraints. Key friction points include:"
    )
    add_p("India has 22 officially recognized languages and hundreds of local dialects. Patients frequently express complex medical symptoms in colloquial regional idioms that health workers or rotating physicians may misinterpret.", bold_prefix="• Linguistic Fragmentation: ")
    add_p("A single medical officer at a PHC may see between 80 to 150 patients in a morning outpatient shift. Deciphering unorganized patient narratives creates severe consultation fatigue.", bold_prefix="• Consultation Time Constraints: ")
    add_p("Patients arrive with wrinkled paper lab reports, handwritten doctor slips, or discharge summaries. Clinicians must manually hunt for abnormal parameters such as hemoglobin, platelets, or blood sugar.", bold_prefix="• Paper Report Bottlenecks: ")
    add_p("Emergency red flags (such as acute myocardial infarction symptoms, hypoxia, or FAST stroke signals) are often buried in prolonged narrative descriptions, leading to delayed prioritization in crowded general queues.", bold_prefix="• Triage Inconsistency: ")

    add_h2("2.2 The Fatal Flaws of Autonomous 'AI Doctors'")
    add_p(
        "In response to healthcare shortages, many software projects have attempted to build autonomous diagnostic bots that output disease probabilities and drug prescriptions. In real-world clinical environments, this approach presents catastrophic risks:"
    )
    add_p("Generative LLMs hallucinate plausible-sounding medical conditions, leading to false alarms or fatal oversights.", bold_prefix="1. Hallucination Risk: ")
    add_p("Under Indian medical governance (National Medical Commission), software algorithms cannot legally prescribe medications or assume malpractice liability.", bold_prefix="2. Legal & Regulatory Barriers: ")
    add_p("Automated systems that give patients direct diagnostic feedback induce health anxiety and erode trust in human clinicians.", bold_prefix="3. Patient Harm & Overconfidence: ")

    # -------------------------------------------------------------
    # 3. THE JANSAATHI AI SOLUTION
    # -------------------------------------------------------------
    add_h1("3. The JANSAATHI AI Solution: Human-in-the-Loop Triage")
    add_p(
        "JANSAATHI AI establishes an uncompromising operational divide between administrative data organization and clinical decision-making:"
    )
    
    # Comparison Table
    comp_table = doc.add_table(rows=7, cols=3)
    comp_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Workflow Dimension", "Autonomous AI Bots (Harmful)", "JANSAATHI AI Architecture (Safe)"]
    for j, h in enumerate(headers):
        cell = comp_table.cell(0, j)
        set_cell_background(cell, HEX_PRIMARY)
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.name = "Arial"
        r.font.size = Pt(9)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    comp_rows = [
        ("Clinical Decision", "Bot decides diagnosis autonomously", "Attending registered doctor decides exclusively"),
        ("Prescriptions", "Bot outputs drug names & dosages", "STRICTLY PROHIBITED. Zero drug advice generated"),
        ("Urgency Assignment", "Black-box LLM predicts severity", "Deterministic, versioned clinical rule engine"),
        ("Evidence Provenance", "Unverified summary with no trace", "Every fact carries an immutable source badge"),
        ("Lab Report Handling", "Bot interprets labs as diseases", "In-browser OCR extracts values; doctor interprets"),
        ("Patient Privacy", "Aadhaar and phone number collected", "Strictly anonymous case reference (P-YYYY-XXXXXX)")
    ]
    for i, row in enumerate(comp_rows):
        bg = HEX_LIGHT_BG if i % 2 == 1 else "FFFFFF"
        for j, val in enumerate(row):
            cell = comp_table.cell(i+1, j)
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            r = p.add_run(val)
            r.font.name = "Arial"
            r.font.size = Pt(8.5)
            r.font.color.rgb = COLOR_TEXT
            if j == 0:
                r.font.bold = True

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # -------------------------------------------------------------
    # 4. SYSTEM ARCHITECTURE & ZERO-INVESTMENT INFRASTRUCTURE
    # -------------------------------------------------------------
    add_h1("4. Technical Stack & Zero-Investment Infrastructure")
    add_p(
        "To allow public health institutions to deploy JANSAATHI AI immediately without procurement delays or recurring cloud billing, the system utilizes a 100% free-tier, open-source stack:"
    )

    stack_table = doc.add_table(rows=9, cols=3)
    stack_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    s_headers = ["Layer", "Technology Selected", "Operational & Architectural Rationale"]
    for j, h in enumerate(s_headers):
        cell = stack_table.cell(0, j)
        set_cell_background(cell, HEX_PRIMARY)
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.name = "Arial"
        r.font.size = Pt(9)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    s_rows = [
        ("Frontend Application", "React 19 + TypeScript + Vite", "High performance, zero legacy bundle overhead, strict static typing."),
        ("Design System", "Tailwind CSS v4", "Curated healthcare palette (Slate, Navy, Teal); WCAG 2.2 AA compliant."),
        ("Database & RLS", "Supabase (PostgreSQL 15+)", "Enterprise-grade relational database, automatic REST API, Row Level Security."),
        ("Authentication", "Supabase Auth + Database RBAC", "Secure session tokens, password hashing, database-enforced roles."),
        ("Speech-to-Text", "Browser Web Speech API", "Native browser audio recognition; zero server compute or external API cost."),
        ("Document OCR", "Tesseract.js (Client Worker)", "Extracts text & lab values inside browser Web Worker; zero cloud OCR fees."),
        ("Medical Telemetry", "Web Serial & Web Bluetooth API", "Direct browser communication with ESP32/Arduino pulse oximeter hardware."),
        ("AI Structuring", "Google Gemini 2.5 Flash / Local Parser", "Free tier Gemini API with seamless local deterministic parser fallback.")
    ]
    for i, row in enumerate(s_rows):
        bg = HEX_LIGHT_BG if i % 2 == 1 else "FFFFFF"
        for j, val in enumerate(row):
            cell = stack_table.cell(i+1, j)
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            r = p.add_run(val)
            r.font.name = "Arial"
            r.font.size = Pt(8.5)
            r.font.color.rgb = COLOR_TEXT
            if j == 0:
                r.font.bold = True

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # -------------------------------------------------------------
    # 5. MULTILINGUAL ARCHITECTURE & CAPABILITY REGISTRY
    # -------------------------------------------------------------
    add_h1("5. Multilingual Architecture & Honest Capability Registry")
    add_p(
        "A critical requirement of serious public health software is linguistic honesty. Many systems falsely claim to support speech recognition across every Indian language, resulting in silent failures or garbled transcriptions. JANSAATHI AI implements an explicit Language Capability Registry covering 13 Indian languages:"
    )

    lang_table = doc.add_table(rows=14, cols=5)
    lang_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    l_headers = ["Language", "Native Script", "Text Input", "Voice Speech-to-Text", "Speech Engine Status"]
    for j, h in enumerate(l_headers):
        cell = lang_table.cell(0, j)
        set_cell_background(cell, HEX_PRIMARY)
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.name = "Arial"
        r.font.size = Pt(8.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    lang_data = [
        ("English (India)", "English", "Supported", "Supported (en-IN)", "Active native Chromium support"),
        ("Hindi", "हिन्दी", "Supported", "Supported (hi-IN)", "Active native Chromium support"),
        ("Odia", "ଓଡ଼ିଆ", "Supported", "Honest Unavailable", "Web Speech API lacks reliable od-IN; Text Guided"),
        ("Bengali", "বাংলা", "Supported", "Supported (bn-IN)", "Active native Chromium support"),
        ("Telugu", "తెలుగు", "Supported", "Supported (te-IN)", "Active native Chromium support"),
        ("Tamil", "தமிழ்", "Supported", "Supported (ta-IN)", "Active native Chromium support"),
        ("Kannada", "ಕನ್ನಡ", "Supported", "Supported (kn-IN)", "Active native Chromium support"),
        ("Malayalam", "മലയാളം", "Supported", "Supported (ml-IN)", "Active native Chromium support"),
        ("Marathi", "मराठी", "Supported", "Supported (mr-IN)", "Active native Chromium support"),
        ("Gujarati", "ગુજરાતી", "Supported", "Supported (gu-IN)", "Active native Chromium support"),
        ("Punjabi", "ਪੰਜਾਬੀ", "Supported", "Honest Unavailable", "Inconsistent desktop browser voice model; Text Guided"),
        ("Assamese", "অসমীয়া", "Supported", "Honest Unavailable", "Browser lacks as-IN voice model; Text Guided"),
        ("Urdu", "اردو", "Supported", "Supported (ur-IN)", "Active native Chromium support")
    ]
    for i, row in enumerate(lang_data):
        bg = HEX_LIGHT_BG if i % 2 == 1 else "FFFFFF"
        for j, val in enumerate(row):
            cell = lang_table.cell(i+1, j)
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=60, bottom=60, left=100, right=100)
            p = cell.paragraphs[0]
            r = p.add_run(val)
            r.font.name = "Arial"
            r.font.size = Pt(8)
            r.font.color.rgb = COLOR_TEXT
            if j == 0:
                r.font.bold = True
            if "Honest Unavailable" in val:
                r.font.color.rgb = COLOR_RED

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # -------------------------------------------------------------
    # 6. DETAILED FEATURE-BY-FEATURE WORKFLOW
    # -------------------------------------------------------------
    add_h1("6. Detailed Features & Website Working Process")
    add_p(
        "JANSAATHI AI is partitioned into two major operational workspaces: the Patient Intake Portal and the Clinician Triage Workstation. Below is the step-by-step working process of each feature:"
    )

    add_h2("6.1 Patient Intake Portal Workflow (/patient)")
    add_p("Before any symptom information is entered, patients must review a 4-point informed consent screen. They must explicitly acknowledge that: (a) Information is collected solely to assist doctor review; (b) The system does not diagnose or prescribe; (c) A qualified doctor makes all clinical decisions; and (d) Case IDs are anonymous. Submission is blocked until consent is checked.", bold_prefix="Step 1: Informed Consent Protocol — ")
    add_p("Patients select their preferred language from a grid of 13 Indian languages displaying real-time speech and text capability badges. If a language lacks speech recognition, an honest advisory prompts the patient to use text input.", bold_prefix="Step 2: Language Selection — ")
    add_p("Patients can provide clinical details across four integrated modalities:", bold_prefix="Step 3: Multimodal Intake — ")
    add_p("Real-time browser microphone capture with audio waveform visualization, live streaming transcription, and an editable review textbox.", bold_prefix="   • Spoken Audio (Voice): ")
    add_p("Multilingual text entry with helpful quick-symptom chips (Fever, Chest pain, Breathing difficulty, etc.).", bold_prefix="   • Written Text: ")
    add_p("In-browser Tesseract.js client OCR processing JPG, PNG, or PDF scans of blood tests or prescriptions with a real percentage progress bar.", bold_prefix="   • Diagnostic Report Upload: ")
    add_p("Web Serial USB connection to pulse oximeters streaming SpO2 (%) and Pulse Rate (bpm), plus manual entry fallback.", bold_prefix="   • Medical Hardware Telemetry: ")
    add_p("Before submission, the system structures the presentation and shows the patient exactly what was understood (Chief Complaint, Symptoms, Duration, Severity). Patients can make corrections or confirm.", bold_prefix="Step 4: Patient Confirmation & Correction — ")
    add_p("Upon confirmation, the system creates a permanent record in Supabase, assigns an anonymous Case ID (e.g., P-2026-000001), runs the deterministic urgency rule engine, and routes the case to the queue.", bold_prefix="Step 5: Anonymous Case Generation — ")

    add_h2("6.2 Clinician Triage Workstation Workflow (/cases & /dashboard)")
    add_p("Displays all incoming cases sorted by deterministic review priority (URGENT REVIEW, PRIORITY REVIEW, ROUTINE REVIEW). Includes instant search by Case ID, symptom keywords, language, and clinical status.", bold_prefix="Triage Queue (/cases): ")
    add_p("Attending physicians open a case to access a data-dense clinical workstation with dedicated sections:", bold_prefix="Clinical Review Workspace (/cases/:id): ")
    add_p("High-visibility banner displaying triggered rules (e.g., RULE_CHEST_PAIN, RULE_RESPIRATORY_DISTRESS) with clinical explanations.", bold_prefix="   • Deterministic Urgency Banner: ")
    add_p("Every extracted symptom is tagged with its origin (PATIENT_VOICE, PATIENT_TEXT, REPORT_OCR, HARDWARE_READING, CLINICIAN_ENTRY).", bold_prefix="   • Multi-Provenance Evidence Card: ")
    add_p("Opens original diagnostic scans side-by-side with discrete extracted parameters and OCR confidence ratings.", bold_prefix="   • Diagnostic Report Viewer: ")
    add_p("Highlights missing data (e.g., unstated duration, unverified allergies) and suggests non-leading informational queries for health workers.", bold_prefix="   • Clinical Gaps & Follow-up Queries: ")
    add_p("Doctors document physical exam observations and select a clinical disposition (Reviewed, Escalated, Referred, Completed).", bold_prefix="   • Clinician Actions & Notes: ")
    add_p("Compiles structured triage data into a clinical transfer document with receiving facility name, doctor's registration number, and printable output.", bold_prefix="   • Clinical Referral Note Generator: ")
    add_p("Chronological ledger logging every security and clinical event (case creation, transcription, review, referral).", bold_prefix="   • Immutable Audit Trail: ")

    # -------------------------------------------------------------
    # 7. CLINICAL SAFETY & DETERMINISTIC URGENCY ENGINE
    # -------------------------------------------------------------
    add_h1("7. Clinical Safety & Deterministic Urgency Engine")
    add_p(
        "A critical engineering pillar of JANSAATHI AI is the complete decoupling of clinical urgency assignment from Generative AI. LLMs are notoriously prone to stochastic variance, flattery, and hallucination. Therefore, JANSAATHI AI evaluates emergency signals through an isolated Deterministic Urgency Rule Engine:"
    )

    rule_table = doc.add_table(rows=9, cols=4)
    rule_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    r_headers = ["Rule Code", "Clinical Name", "Triggering Condition", "Clinical Rationale"]
    for j, h in enumerate(r_headers):
        cell = rule_table.cell(0, j)
        set_cell_background(cell, HEX_PRIMARY)
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.name = "Arial"
        r.font.size = Pt(8.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    rules_data = [
        ("RULE_CHEST_PAIN", "Acute Chest Discomfort", "Crushing/radiating pain, pressure, heaviness", "Rapid evaluation required for acute coronary syndrome or pulmonary embolism."),
        ("RULE_RESPIRATORY_DISTRESS", "Severe Dyspnea", "Gasping, inability to speak, cyanosis", "Immediate airway, oxygenation, and ventilatory assessment required."),
        ("RULE_NEURO_DEFICIT", "FAST Stroke Signals", "Facial droop, arm weakness, slurred speech", "High time-sensitivity for acute ischemic stroke or intracranial bleed."),
        ("RULE_UNCONTROLLED_BLEEDING", "Active Hemorrhage", "Hematemesis, hemoptysis, active bleeding", "Risk of hypovolemic shock requiring rapid source control and resuscitation."),
        ("RULE_VITAL_HYPOXIA", "Telemetry Hypoxemia", "SpO2 < 92% or pulse > 130 / < 45 bpm", "Objective physiological instability requiring immediate bedside review."),
        ("RULE_ANAPHYLAXIS_SIGNAL", "Acute Allergic Reaction", "Swollen lips/tongue/throat with wheezing", "Airway compromise risk requiring emergency clinical intervention."),
        ("RULE_PROLONGED_FEVER", "Persistent Pyrexia", "Fever duration >= 5 consecutive days", "Workup required for endemic infections (typhoid, malaria, dengue)."),
        ("RULE_DIABETIC_WOUND", "Diabetic Extremity Ulcer", "Non-healing foot ulcer with comorbid diabetes", "High risk of deep soft-tissue infection or osteomyelitis.")
    ]
    for i, row in enumerate(rules_data):
        bg = HEX_LIGHT_BG if i % 2 == 1 else "FFFFFF"
        for j, val in enumerate(row):
            cell = rule_table.cell(i+1, j)
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=60, bottom=60, left=100, right=100)
            p = cell.paragraphs[0]
            r = p.add_run(val)
            r.font.name = "Arial"
            r.font.size = Pt(8)
            r.font.color.rgb = COLOR_TEXT
            if j == 0:
                r.font.bold = True
                r.font.color.rgb = COLOR_RED

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # -------------------------------------------------------------
    # 8. PRIVACY, SECURITY & DATA MINIMISATION
    # -------------------------------------------------------------
    add_h1("8. Privacy, Security & Data Minimisation")
    add_p(
        "JANSAATHI AI complies with rigorous healthcare privacy and data-minimization principles:"
    )
    add_p("The system does not collect 12-digit Aadhaar numbers, voter card numbers, street addresses, or biometric fingerprints.", bold_prefix="• Zero Aadhaar & PII Collection: ")
    add_p("All patient sessions generate an anonymous identifier (e.g. P-2026-000001). Personal identity is decoupled from clinical triage notes.", bold_prefix="• Anonymous Identifiers: ")
    add_p("PostgreSQL Row Level Security ensures facility staff can query only cases registered to their specific health unit.", bold_prefix="• Row Level Security (RLS): ")
    add_p("The audit_logs table permits only INSERT operations. Normal users and administrators are blocked from modifying historical audit records.", bold_prefix="• Tamper-Evident Audit Trail: ")
    add_p("Speech transcription and report OCR occur entirely in the client browser runtime without transmitting raw media to third-party ad networks or untrusted APIs.", bold_prefix="• Local Edge Processing: ")

    # -------------------------------------------------------------
    # 9. DATABASE ARCHITECTURE
    # -------------------------------------------------------------
    add_h1("9. Database Architecture (21 Normalized Entities)")
    add_p(
        "The Supabase database schema is structured into 6 versioned migrations, comprising 21 normalized tables designed with foreign key constraints and query indexes:"
    )
    add_p("profiles, facilities, facility_members, consents, triage_cases, patient_inputs, voice_sessions, transcripts, reports, report_extractions, triage_extractions, timeline_events, follow_up_questions, urgency_rules, urgency_flags, clinician_reviews, referrals, system_settings, ai_processing_logs, hardware_devices, hardware_readings.", bold_prefix="Core Entities: ")
    add_p("Every table enforces explicit Row Level Security policies verified via PostgreSQL unit tests.", bold_prefix="RLS Enforcement: ")

    # -------------------------------------------------------------
    # 10. TESTING & LIVE VERIFICATION
    # -------------------------------------------------------------
    add_h1("10. Automated Testing & Live Localhost Validation")
    add_p(
        "To verify production reliability, JANSAATHI AI implements an automated test suite executed with Vitest. All 18 automated tests pass with a 100% success rate:"
    )
    add_p("10 unit tests covering positive red flags, negative benign cases, malformed strings, and multilingual phrasing.", bold_prefix="1. Urgency Rules Suite (tests/urgencyRules.test.ts): ")
    add_p("4 unit tests verifying that medical diagnoses, drug prescriptions, and malformed inputs are strictly rejected.", bold_prefix="2. Schema & Safety Validator Suite (tests/schemaValidator.test.ts): ")
    add_p("3 unit tests confirming ASCII key-value and JSON sensor packet parsing from serial telemetry streams.", bold_prefix="3. Hardware Telemetry Suite (tests/hardwareTelemetry.test.ts): ")
    add_p("1 live end-to-end integration test validating connection to Google Gemini 2.5 Flash, automated retry backoff on server load spikes, structured JSON extraction, and downstream urgency rule firing.", bold_prefix="4. Live Gemini AI Integration Suite (tests/testGeminiLive.test.ts): ")

    # Test Results Callout
    add_callout(
        "AUTOMATED TEST EXECUTION SUMMARY (VITEST)",
        "Test Files: 4 passed (4/4)\nTotal Tests: 18 passed (18/18)\nTest Execution Duration: 13.99 seconds\nTypeScript Compilation: 0 errors (tsc --noEmit passed)\nVite Production Build: 0 errors (dist/assets bundled cleanly in 3.39s)"
    )

    # -------------------------------------------------------------
    # 11. DEPLOYMENT & PRODUCTION READINESS
    # -------------------------------------------------------------
    add_h1("11. Deployment Architecture & Production Readiness")
    add_p(
        "JANSAATHI AI is production-ready and deployable directly to Vercel and connected to Supabase:"
    )
    add_p("Includes vercel.json with SPA rewrites (/(.*) -> /index.html) and enterprise HTTP security headers (X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin).", bold_prefix="• Vercel Configuration: ")
    add_p("Documented in ENVIRONMENT.md and .env.example with strict separation of client-safe public keys and server-only credentials.", bold_prefix="• Environment Safeguards: ")
    add_p("Includes comprehensive documentation: README.md, ARCHITECTURE.md, SECURITY.md, DEPLOYMENT.md, DATABASE.md, AI_SAFETY.md, HARDWARE.md, TESTING.md, PRIVACY.md, and ENVIRONMENT.md.", bold_prefix="• Complete Documentation: ")

    # Save document
    output_path = r"d:\JANSAATHI AI\JANSAATHI_AI_Comprehensive_Project_Report.docx"
    doc.save(output_path)
    print(f"Report generated successfully at: {output_path}")

if __name__ == "__main__":
    create_report()
