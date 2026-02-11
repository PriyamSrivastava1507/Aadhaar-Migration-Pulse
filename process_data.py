import pandas as pd
import glob
import os
import json

# paths
RAW_DATA_DIR = 'raw_data'
OUTPUT_FILE = 'aadhaar-dashboard/dashboard/src/assets/dashboard_data.json'

print("--- STARTING AADHAAR MIGRATION ANALYTICS (FINAL V3) ---")

# loads CSV files, cleans pincode types, and sums metric columns
def load_and_process(file_keyword, cols_to_sum, metric_name):
    print(f"Processing {file_keyword} data...")
    files = glob.glob(os.path.join(RAW_DATA_DIR, f"*{file_keyword}*.csv"))
    
    chunk_list = []
    for f in files:
        try:
            # read relevant columns from csv
            df = pd.read_csv(f, usecols=['date', 'state', 'district', 'pincode'] + cols_to_sum, low_memory=False)
            
            # cast pincode to string to prevent type mismatch on merge
            df['pincode'] = df['pincode'].astype(str).str.split('.').str[0]
            
            # parse date column
            df['date'] = pd.to_datetime(df['date'], dayfirst=True, errors='coerce')
            
            # aggregate metric columns
            df[metric_name] = df[cols_to_sum].sum(axis=1)
            chunk_list.append(df[['date', 'state', 'district', 'pincode', metric_name]])
        except Exception as e:
            print(f"Skipping {f}: {e}")

    if not chunk_list: return pd.DataFrame()
    return pd.concat(chunk_list)

# load enrolment and demographic datasets
df_enrol = load_and_process('enrolment', ['age_0_5', 'age_5_17', 'age_18_greater'], 'Enrolments')
df_demo = load_and_process('demographic', ['demo_age_5_17', 'demo_age_17_'], 'Demo_Updates')

# compute month-over-month trend per pincode
print("Calculating Trends...")
df_demo['Month'] = df_demo['date'].dt.to_period('M')

# monthly totals per pincode
monthly = df_demo.groupby(['pincode', 'Month'])['Demo_Updates'].sum().reset_index()
monthly.sort_values(['pincode', 'Month'], inplace=True)

# month-over-month difference
monthly['Diff'] = monthly.groupby('pincode')['Demo_Updates'].diff()

# map each pincode to its latest trend direction
trend_map = {}
latest_status = monthly.groupby('pincode').tail(1)


for _, row in latest_status.iterrows():
    trend_map[row['pincode']] = "Up" if row['Diff'] > 0 else "Down"

print(f"✔ Trends detected: {len(trend_map)}")

# merge enrolment and demographic totals by pincode
print("Aggregating Totals...")
enrol_total = df_enrol.groupby(['pincode', 'state', 'district'])['Enrolments'].sum().reset_index()
demo_total = df_demo.groupby(['pincode', 'state', 'district'])['Demo_Updates'].sum().reset_index()

master = pd.merge(enrol_total, demo_total, on=['pincode', 'state', 'district'], how='outer').fillna(0)

# attach lat/lng from external pincode geocode dataset
print("Fetching Coordinates...")
geo_url = "https://raw.githubusercontent.com/sanand0/pincode/master/data/IN.csv"
geo_data = pd.read_csv(geo_url, dtype=str)

if 'key' in geo_data.columns: 
    geo_data.rename(columns={'key': 'pincode'}, inplace=True)
geo_data.rename(columns={'latitude': 'lat', 'longitude': 'lng'}, inplace=True)

# strip prefix from pincode column
geo_data['pincode'] = geo_data['pincode'].str.replace('IN/', '', regex=False)
geo_data['pincode'] = geo_data['pincode'].astype(str)

# left join to preserve rows without coordinates
final_df = pd.merge(master, geo_data[['pincode', 'lat', 'lng']], on='pincode', how='left')

# fill missing coords with district-level averages
final_df['lat'] = pd.to_numeric(final_df['lat'], errors='coerce')
final_df['lng'] = pd.to_numeric(final_df['lng'], errors='coerce')
district_coords = final_df.groupby(['state', 'district'])[['lat', 'lng']].transform('mean')
final_df['lat'] = final_df['lat'].fillna(district_coords['lat'])
final_df['lng'] = final_df['lng'].fillna(district_coords['lng'])

# drop rows with no usable coordinates
final_df = final_df.dropna(subset=['lat', 'lng'])

# calculate migration score, intensity, and export to JSON
print("Finalizing Analytics...")

final_df['Migration_Score'] = final_df['Demo_Updates'] / (final_df['Enrolments'] + 50)
max_val = final_df['Migration_Score'].quantile(0.99)
if pd.isna(max_val) or max_val == 0: max_val = 1
final_df['Intensity'] = (final_df['Migration_Score'] / max_val).clip(upper=1)

# apply trend labels
final_df['Trend'] = final_df['pincode'].map(trend_map).fillna('Stable')

# zero-fill remaining NaN values
cols_numeric = ['Enrolments', 'Demo_Updates', 'Migration_Score', 'Intensity']
final_df[cols_numeric] = final_df[cols_numeric].fillna(0)

# write output JSON
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
cols = ['pincode', 'state', 'district', 'lat', 'lng', 'Enrolments', 'Demo_Updates', 'Migration_Score', 'Intensity', 'Trend']
data_export = final_df[cols].to_dict(orient='records')

with open(OUTPUT_FILE, 'w') as f:
    json.dump(data_export, f, default=str)

print(f"✔ DONE! JSON saved to {OUTPUT_FILE}")