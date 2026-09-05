"""
CivicSense AI — Recommendation Engine (GWMC Warangal Edition)
Routes complaints to official GWMC departmental wings.
"""

# Official GWMC departmental routing
DEPARTMENT_MAP = {
    "Garbage / Waste":            "GWMC Solid Waste & Sanitation Wing",
    "Pothole / Road Damage":      "GWMC Engineering & Town Planning Department",
    "Water Leakage / Sanitation": "GWMC Mission Bhagiratha Water Works Division",
    "Broken Streetlight":         "GWMC Electrical & Street Lighting Wing",
    "Drainage / Flooding":        "GWMC Stormwater & Nala Maintenance Wing",
    "Pollution":                  "Telangana State Pollution Control Board (TSPCB) – Warangal",
    "Fallen Tree / Vegetation":   "GWMC Horticulture & Green Spaces Division",
    "Other Infrastructure":       "GWMC General Services — Municipal Commissioner Office",
}

ACTION_TEMPLATES = {
    "Garbage / Waste": {
        "LOW":      "Schedule routine GWMC waste collection vehicle for this ward in the next service cycle.",
        "MEDIUM":   "Dispatch GWMC Solid Waste Wing collection vehicle to the reported location within 48 hours. Alert ward sanitation supervisor.",
        "HIGH":     "Prioritise immediate waste removal. Inspect for illegal dumping near Warangal residential zones. Notify GWMC Zonal Commissioner.",
        "CRITICAL": "URGENT: Deploy GWMC emergency waste clearance team. Assess disease outbreak risk near populated locality. Issue public advisory if required.",
    },
    "Pothole / Road Damage": {
        "LOW":      "Log for next GWMC road maintenance cycle. Mark GPS coordinates for scheduled repair.",
        "MEDIUM":   "GWMC Engineering Division to inspect and schedule repair within 5–7 working days. Place road hazard cones immediately.",
        "HIGH":     "Deploy GWMC road repair crew within 48 hours. Install warning signs to prevent accidents near school/hospital zones.",
        "CRITICAL": "URGENT: Cordon off road section. Dispatch GWMC emergency repair team. Consider temporary closure. Coordinate with Traffic Police Warangal.",
    },
    "Water Leakage / Sanitation": {
        "LOW":      "Schedule GWMC Mission Bhagiratha plumber inspection in next maintenance round.",
        "MEDIUM":   "Dispatch GWMC Water Works technician to repair within 48 hours. Prevent water wastage on public roads.",
        "HIGH":     "Immediately dispatch GWMC Mission Bhagiratha repair team. Assess contamination risk of drinking water supply.",
        "CRITICAL": "URGENT: Shut off water supply to affected section. Deploy GWMC emergency repair team. Test water quality for contamination. Alert Health Officer.",
    },
    "Broken Streetlight": {
        "LOW":      "Log for next GWMC Street Lighting Wing scheduled maintenance round.",
        "MEDIUM":   "Assign GWMC electrician to inspect and replace defective streetlight within 3–5 days.",
        "HIGH":     "Dispatch GWMC electrician within 24 hours. Streetlight outage in high-traffic/crime-prone areas is a public safety emergency.",
        "CRITICAL": "URGENT: Immediate GWMC electrical inspection. Risk of exposed live wiring. Alert Police Warangal for area safety patrol.",
    },
    "Drainage / Flooding": {
        "LOW":      "Inspect reported nala for silt blockage in GWMC next maintenance cycle.",
        "MEDIUM":   "GWMC Nala Maintenance Wing to clear drainage blockage within 48 hours to prevent waterlogging.",
        "HIGH":     "Immediately dispatch GWMC drainage team. Flooding may cause property damage and public health hazard in Warangal residential colonies.",
        "CRITICAL": "URGENT: GWMC Emergency flood response required. Coordinate with Warangal Disaster Management. Evacuate affected residents if necessary.",
    },
    "Pollution": {
        "LOW":      "Monitor reported pollution source. Schedule TSPCB Warangal field inspection.",
        "MEDIUM":   "Dispatch TSPCB Environment Officer to assess and document pollution source within 48 hours.",
        "HIGH":     "Conduct immediate TSPCB site inspection. Issue statutory notice to responsible party. Collect air/water samples for lab analysis.",
        "CRITICAL": "URGENT: Activate TSPCB Warangal emergency response. Restrict public access if health risk confirmed. Issue GWMC public health advisory.",
    },
    "Fallen Tree / Vegetation": {
        "LOW":      "Log for scheduled GWMC Horticulture Division vegetation removal.",
        "MEDIUM":   "Dispatch GWMC tree removal team to clear fallen tree/branches within 24 hours.",
        "HIGH":     "Immediate GWMC Horticulture team deployment. Fallen tree near electricity wires requires coordination with TSSPDCL Warangal.",
        "CRITICAL": "URGENT: Deploy GWMC emergency tree clearance team. Coordinate with TSSPDCL for live wire risk. Block road if safety compromised. Alert Traffic Police.",
    },
    "Other Infrastructure": {
        "LOW":      "Log the complaint at GWMC General Services desk for inspection.",
        "MEDIUM":   "GWMC field officer to inspect within 48 hours and coordinate with the relevant division.",
        "HIGH":     "Escalate to GWMC Zonal Commissioner. Dispatch multi-department team to assess and remediate.",
        "CRITICAL": "URGENT: Escalate to GWMC Municipal Commissioner. Emergency multi-department response required.",
    },
}


def build_recommendation(issue_category: str, severity_level: str) -> dict:
    dept = DEPARTMENT_MAP.get(issue_category, DEPARTMENT_MAP["Other Infrastructure"])
    actions = ACTION_TEMPLATES.get(issue_category, ACTION_TEMPLATES["Other Infrastructure"])
    action = actions.get(severity_level.upper(), actions["MEDIUM"])

    return {
        "department": dept,
        "action_recommendation": action,
        "escalation_contact": "GWMC Commissioner, Warangal | gwmc.gov.in | 1800-599-4977",
        "city": "Warangal (GWMC)",
    }
