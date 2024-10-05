import csv
import json
import sys
from typing import List, Dict

def csv_to_typescript(input_file: str, output_file: str) -> None:
    # Read CSV file
    with open(input_file, 'r', newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        data: List[Dict[str, str]] = list(reader)

    # Generate TypeScript interface
    keys = data[0].keys()
    interface = f"interface DataRow {{\n"
    for key in keys:
        interface += f"  {key}: string;\n"
    interface += "}\n\n"

    # Convert data to TypeScript array
    ts_data = json.dumps(data, indent=2)
    ts_array = f"const data: DataRow[] = {ts_data};\n"

    # Write to TypeScript file
    with open(output_file, 'w', encoding='utf-8') as tsfile:
        tsfile.write(interface)
        tsfile.write(ts_array)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py <input_csv_file> <output_ts_file>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    csv_to_typescript(input_file, output_file)
    print(f"Conversion complete. TypeScript file saved as {output_file}")