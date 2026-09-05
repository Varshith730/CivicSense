"""
Augment NYC 311 training set with diverse citizen phrased complaints
to ensure high accuracy on conversational inputs as well as administrative logs.
"""
import pandas as pd
import numpy as np

train_path = "c:/PROJECTS/Sustainability/civicsense-ai/data/processed/complaints_train.csv"
train_df = pd.read_csv(train_path)

conversational_examples = [
    # Garbage / Waste
    ("Garbage has been accumulating near the hostel for three days and nobody collected it", "Garbage / Waste"),
    ("Trash bins are overflowing on the street corner creating foul smell and unhygienic conditions", "Garbage / Waste"),
    ("Huge pile of waste and plastic dumped near the market entrance", "Garbage / Waste"),
    ("Rotting food waste and garbage attracting stray dogs and flies outside building", "Garbage / Waste"),
    ("Sanitation workers have not picked up rubbish for a week now", "Garbage / Waste"),
    ("Illegal trash dumping in the open vacant plot near our residential colony", "Garbage / Waste"),
    ("Debris and household garbage scattered all over the pedestrian pavement", "Garbage / Waste"),
    ("Overflowing community garbage container spilling trash onto main road", "Garbage / Waste"),

    # Pothole / Road Damage
    ("Huge pothole on the middle of the road causing traffic jams and vehicle damage", "Pothole / Road Damage"),
    ("Dangerous deep crater and potholes formed on the road after rain", "Pothole / Road Damage"),
    ("Cracked pavement and broken road surface outside the government school", "Pothole / Road Damage"),
    ("Motorcycle slipped due to an unmarked deep pothole on the highway", "Pothole / Road Damage"),
    ("Road has completely disintegrated with loose gravel and multiple potholes", "Pothole / Road Damage"),
    ("Asphalt is broken and sunken causing severe risk of accidents to commuters", "Pothole / Road Damage"),

    # Water Leakage / Sanitation
    ("Water pipeline burst and leaking clean drinking water on the road since morning", "Water Leakage / Sanitation"),
    ("Continuous water leakage from main municipal pipe wasting gallons of potable water", "Water Leakage / Sanitation"),
    ("Sewage pipe leaking dirty wastewater in front of our residential gate", "Water Leakage / Sanitation"),
    ("Severe water shortage because the underground pipeline is broken and gushing water", "Water Leakage / Sanitation"),
    ("Low water pressure caused by massive underground pipeline fracture", "Water Leakage / Sanitation"),
    ("Broken public tap leaking water constantly into the storm drain", "Water Leakage / Sanitation"),

    # Broken Streetlight
    ("Streetlights on 4th cross road are not working and it is pitch dark at night", "Broken Streetlight"),
    ("Non functioning street light poles making the street very unsafe for women walking at night", "Broken Streetlight"),
    ("All the lights along the main avenue are flickering and completely dead", "Broken Streetlight"),
    ("Broken lamp post with hanging wires outside our building gate", "Broken Streetlight"),
    ("Streetlight bulb has fused and the lane is in total darkness since five days", "Broken Streetlight"),
    ("Traffic signal is turned off causing chaotic collisions at the intersection", "Broken Streetlight"),

    # Drainage / Flooding
    ("Drain is blocked with silt causing dirty stormwater to flood the residential road", "Drainage / Flooding"),
    ("Waterlogging in our area after moderate rain because the gutter is choked", "Drainage / Flooding"),
    ("Manhole overflowing with black sewage water flooding the entire neighborhood", "Drainage / Flooding"),
    ("Blocked drainage culvert resulting in knee deep stagnant flood water", "Drainage / Flooding"),
    ("Stormwater drain clogged with plastic bags causing overflow during monsoon", "Drainage / Flooding"),

    # Fallen Tree / Vegetation
    ("Large tree branch fell on the electric wires during the storm", "Fallen Tree / Vegetation"),
    ("Old banyan tree collapsed across the road blocking all ambulance and vehicle movement", "Fallen Tree / Vegetation"),
    ("Dangerous heavy branch hanging loosely and about to fall on pedestrians", "Fallen Tree / Vegetation"),
    ("Overgrown roadside shrubs and tree branches completely obstructing traffic vision", "Fallen Tree / Vegetation"),
    ("Fallen tree trunk lying across the pavement preventing walking", "Fallen Tree / Vegetation"),

    # Pollution
    ("Heavy black smoke and toxic air pollution from factory chimney nearby", "Pollution"),
    ("Intense burning of garbage and plastic releasing toxic fumes in the evening", "Pollution"),
    ("Chemical smell and foul industrial air causing breathing difficulties in our colony", "Pollution"),
    ("Excessive vehicle exhaust and smog making air quality unbreathable", "Pollution"),
    ("Factory dumping untreated chemical liquid and polluting the nearby local stream", "Pollution")
]

# Replicate examples with minor linguistic variations to provide strong priors for conversational syntax
augmented_rows = []
for text, cat in conversational_examples:
    for prefix in ["", "Please resolve: ", "Urgent complaint: ", "Reporting issue: ", "Complaint regarding "]:
        augmented_rows.append({"text": prefix + text, "category": cat})

aug_df = pd.DataFrame(augmented_rows)
combined_df = pd.concat([train_df, aug_df], ignore_index=True)

combined_df.to_csv(train_path, index=False)
print(f"Augmented training set now has {len(combined_df)} records.")
