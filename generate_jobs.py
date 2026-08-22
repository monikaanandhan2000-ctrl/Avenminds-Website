import json, random

random.seed(42)

CATEGORIES = [
    ("it-and-software", "IT & Software"),
    ("non-it-and-business", "Non-IT & Business"),
    ("banking-and-finance", "Banking & Finance"),
    ("teaching-and-training", "Teaching & Training"),
    ("marketing-and-sales", "Marketing & Sales"),
    ("hr-and-admin", "HR & Admin"),
    ("media-and-production", "Media & Production"),
    ("real-estate-and-construction", "Real Estate & Construction"),
    ("logistics-and-supply-chain", "Logistics & Supply Chain"),
    ("customer-support-and-operations", "Customer Support & Operations"),
]

ROLES = {
    "it-and-software": [
        "Full Stack Developer", "Mobile App Developer (Flutter)", "Mobile App Developer (React Native)",
        "AI/ML Engineer", "Data Scientist", "Cloud & DevOps Engineer", "Site Reliability Engineer",
        "UI/UX Designer", "QA & Test Engineer", "Automation Test Engineer", "Blockchain Developer",
        "IoT Solutions Engineer", "Backend Developer (Node.js)", "Backend Developer (Python/Django)",
        "Backend Developer (Java/Spring Boot)", "Frontend Developer (React)", "Frontend Developer (Angular)",
        "Database Administrator", "Cybersecurity Analyst", "Network Engineer", "System Administrator",
        "Product Manager - Tech", "Technical Architect", "Embedded Systems Engineer", "Game Developer",
        "Data Engineer", "Business Intelligence Developer", "ERP Consultant (SAP)", "WordPress Developer",
        "Salesforce Developer",
    ],
    "non-it-and-business": [
        "Business Analyst", "Operations Executive", "Administrative Coordinator", "Project Coordinator",
        "Data Entry Specialist", "Office Manager", "Business Development Executive", "Client Relations Executive",
        "Strategy Analyst", "Process Improvement Executive", "Executive Assistant", "Facilities Coordinator",
        "Vendor Management Executive", "Procurement Executive", "Business Operations Manager",
    ],
    "banking-and-finance": [
        "Accounts Executive", "GST & Tax Consultant", "Financial Analyst", "Bookkeeping Associate",
        "Payroll Executive", "Audit Assistant", "Loan Processing Executive", "Investment Advisory Associate",
        "Credit Analyst", "Finance Manager", "Chartered Accountant Associate", "Treasury Executive",
        "Compliance Officer - Finance", "Accounts Payable Specialist", "Accounts Receivable Specialist",
    ],
    "teaching-and-training": [
        "IT Course Trainer", "Competitive Exam Faculty (Bank/SSC)", "Soft Skills Trainer",
        "Spoken English Trainer", "Academic Content Developer", "Corporate Trainer", "Career Counsellor",
        "Online Tutor", "Curriculum Designer", "Placement Coordinator", "Mathematics Faculty",
        "Science Faculty", "Language Trainer (French/German)", "Vocational Skills Trainer",
    ],
    "marketing-and-sales": [
        "Digital Marketing Executive", "SEO Specialist", "Social Media Manager", "Ads Campaign Manager",
        "Content Writer", "Sales Executive", "Field Sales Representative", "Brand Strategist",
        "Performance Marketing Manager", "Email Marketing Specialist", "Growth Marketing Executive",
        "Inside Sales Executive", "Key Account Manager", "Marketing Analyst", "Copywriter",
    ],
    "hr-and-admin": [
        "HR Recruiter", "HR Generalist", "Talent Acquisition Specialist", "Payroll & Compliance Officer",
        "Employee Engagement Executive", "HR Intern", "Onboarding Coordinator", "People Operations Executive",
        "HR Business Partner", "Learning & Development Executive", "HR Manager", "Compensation & Benefits Analyst",
    ],
    "media-and-production": [
        "Video Editor", "Photographer", "Videographer", "Graphic Designer", "Motion Graphics Artist",
        "Script Writer", "Podcast Producer", "Production Assistant", "Sound Engineer", "Creative Director",
        "3D Animator", "Studio Manager",
    ],
    "real-estate-and-construction": [
        "Site Engineer", "Architect", "Interior Designer", "Real Estate Sales Consultant",
        "Construction Project Manager", "Civil Site Supervisor", "Quantity Surveyor", "Land Acquisition Executive",
        "Property Manager", "Structural Engineer", "Estimation Engineer",
    ],
    "logistics-and-supply-chain": [
        "Logistics Coordinator", "Import-Export Documentation Executive", "Warehouse Supervisor",
        "Freight Forwarding Executive", "Supply Chain Analyst", "Transport Operations Executive",
        "Customs Clearance Executive", "Fleet Manager", "Inventory Control Executive", "Procurement Logistics Executive",
    ],
    "customer-support-and-operations": [
        "Customer Support Executive", "Technical Support Engineer", "Voice Process Associate",
        "Chat Support Executive", "Operations Executive", "Front Office Executive",
        "Customer Success Manager", "Help Desk Associate", "Escalations Specialist", "Back Office Executive",
    ],
}

LOCATIONS = [
    ("Chennai, TN", "Onsite"),
    ("Vellore, TN", "Onsite"),
    ("Coimbatore, TN", "Onsite"),
    ("Madurai, TN", "Onsite"),
    ("Trichy, TN", "Onsite"),
    ("Bengaluru, KA", "Onsite"),
    ("Hyderabad, TS", "Onsite"),
    ("Remote", "Remote"),
    ("Hybrid — Vellore", "Hybrid"),
    ("Hybrid — Chennai", "Hybrid"),
]

EXP_BANDS = [
    ("Fresher", "0 Yrs"),
    ("0–1 Yrs", "0-1"),
    ("1–3 Yrs", "1-3"),
    ("2–4 Yrs", "2-4"),
    ("3–5 Yrs", "3-5"),
    ("5–8 Yrs", "5-8"),
]

SENIORITY = ["Trainee", "Associate", "", "Senior", "Lead"]  # "" = no prefix (mid-level)

EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Internship"]

def make_title(base, seniority):
    if seniority == "":
        return base
    if seniority == "Trainee":
        return f"{base} (Trainee)"
    if seniority == "Associate":
        return f"Associate {base}" if not base.split()[0] in ("Chief","Head") else base
    return f"{seniority} {base}"

RESP_BANK = [
    "own end-to-end delivery of assigned tasks within agreed timelines and quality benchmarks",
    "collaborate closely with cross-functional teams including product, design and operations",
    "maintain clear, structured documentation for every process, decision and deliverable",
    "proactively flag risks, blockers or dependencies to the reporting manager well in advance",
    "participate in daily stand-ups, weekly reviews and monthly planning sessions",
    "continuously look for opportunities to improve existing workflows and reduce turnaround time",
    "support onboarding and knowledge-sharing for new team members joining the function",
    "prepare periodic reports and dashboards to track progress against goals",
    "engage directly with internal and external stakeholders to gather requirements",
    "ensure all work adheres to AvenMinds' internal quality and compliance standards",
]

BENEFIT_BANK = [
    "a collaborative, feedback-driven culture where ideas are heard regardless of designation",
    "structured onboarding along with role-specific training in the first 30 days",
    "clear growth pathways with periodic performance reviews and skill-based increments",
    "exposure to multiple industries given AvenMinds' cross-sector project portfolio",
    "flexible working arrangements depending on the nature of the role",
    "a supportive leadership team that invests in continuous learning and certification support",
    "the opportunity to work alongside experienced mentors across IT, finance, media and more",
]

def wrap_lines(paragraphs, target_lines=30):
    # paragraphs: list of strings; ensure total newline-separated "lines" ~ >=30 when rendered
    return "\n\n".join(paragraphs)

def article(word):
    return "an" if word[0].lower() in "aeiou" else "a"

def build_description(title, cat_label, location, mode, exp_label, emp_type, company="AvenMinds"):
    resp = random.sample(RESP_BANK, 6)
    benefits = random.sample(BENEFIT_BANK, 4)

    intro = (f"{company} is hiring a {title} to join our {cat_label} team. This is {article(emp_type)} {emp_type} position "
              f"based out of {location}, working in {article(mode)} {mode.lower()} setup, and is open to candidates with "
              f"{exp_label} of relevant experience. As a next-gen transformation partner working across IT, "
              f"EdTech, marketing, HR, finance, media, real estate and logistics, the {title} will play a "
              f"direct role in delivering high-quality outcomes for our clients and internal stakeholders.")

    who = (f"You bring {exp_label} of hands-on experience relevant to the {cat_label} domain, and you are "
           f"comfortable working in {article(mode)} {mode.lower()} environment out of "
           f"{('anywhere, fully remote' if mode == 'Remote' else location)}. You communicate clearly, take "
           f"ownership of your work without needing constant supervision, and enjoy working in a fast-moving, "
           f"multi-industry environment where priorities can shift week to week. Strong problem-solving "
           f"ability, attention to detail and a genuine willingness to learn new tools and processes are "
           f"essential for succeeding in this role.")

    apply_note = (f"Click Apply Now on this page to submit your full application, or use the Refer a "
                  f"Candidate option if you'd like to recommend someone else for this {title} opening. Our "
                  f"recruitment team typically reviews applications within 5-7 working days and will reach "
                  f"out directly if your profile is shortlisted for the next round.")

    sections = [
        ("About the Role", intro),
        ("Key Responsibilities", "\n".join(f"- As the {title}, you will {r}." for r in resp)),
        ("Who You Are", who),
        ("Experience & Qualification", "\n".join([
            f"- Experience level required: {exp_label}",
            f"- Employment type: {emp_type}",
            f"- Work location: {location}",
            f"- Work mode: {mode}",
            f"- A relevant degree or certification in the {cat_label} field is preferred, though we place equal weight on demonstrated skills and portfolio work for the right candidate.",
        ])),
        ("Life at AvenMinds", f"When you join us as a {title}, you get:\n" + "\n".join(f"- {b[0].upper() + b[1:]}." for b in benefits)),
        ("How to Apply", apply_note),
    ]

    blocks = []
    for heading, body in sections:
        blocks.append(heading)
        blocks.append(body)
    return "\n\n".join(blocks)

jobs = []
jid = 1
VARIANTS_PER_COMBO = 2  # multiply openings per role/seniority to exceed 1000 total
for cat_key, cat_label in CATEGORIES:
    roles = ROLES[cat_key]
    for base in roles:
        for seniority in SENIORITY:
            title = make_title(base, seniority)
            for _ in range(VARIANTS_PER_COMBO):
                loc, mode = random.choice(LOCATIONS)
                exp_label, exp_sort = random.choice(EXP_BANDS)
                emp_type = random.choice(EMPLOYMENT_TYPES)
                posted_days = random.randint(0, 45)
                desc = build_description(title, cat_label, loc, mode, exp_label, emp_type)
                jobs.append({
                    "id": f"J{jid:05d}",
                    "title": title,
                    "category": cat_key,
                    "categoryLabel": cat_label,
                    "location": loc,
                    "mode": mode,
                    "experience": exp_label,
                    "expSort": exp_sort,
                    "employmentType": emp_type,
                    "postedDaysAgo": posted_days,
                    "description": desc,
                })
                jid += 1

print("Total jobs generated:", len(jobs))
with open("/home/claude/avenminds-careers/data/jobs.json", "w", encoding="utf-8") as f:
    json.dump(jobs, f, ensure_ascii=False, indent=0)
