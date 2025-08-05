import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np

def analyze_pricing_from_csv(csv_url, units=120, month=6):
    try:
        # Try reading the file and parsing dates
        df = pd.read_csv(csv_url)
        if 'Date' not in df.columns:
            raise ValueError("CSV must contain a 'Date' column.")

        # Parse Date column robustly
        df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
        df.dropna(subset=['Date'], inplace=True)

        # Normalize column names
        df.columns = df.columns.str.strip()

        # Required columns
        required = ['Units_Sold', 'Price']
        for col in required:
            if col not in df.columns:
                raise ValueError(f"Missing required column: '{col}'")

        # Drop rows with missing data in key columns
        df.dropna(subset=['Units_Sold', 'Price'], inplace=True)

        # Ensure numeric
        df['Units_Sold'] = pd.to_numeric(df['Units_Sold'], errors='coerce')
        df['Price'] = pd.to_numeric(df['Price'], errors='coerce')
        df.dropna(subset=['Units_Sold', 'Price'], inplace=True)

        # Feature engineering
        df['Month_Num'] = df['Date'].dt.month
        df['Month_Str'] = df['Date'].dt.strftime('%b %Y')
        df['Month_Name'] = df['Date'].dt.strftime('%b')

        # Train model
        model = LinearRegression()
        model.fit(df[['Units_Sold', 'Month_Num']], df['Price'])
        predicted_price = model.predict([[units, month]])[0]

        # Legacy format
        price_trend = df[['Month_Num', 'Price']].rename(
            columns={'Month_Num': 'Month'}
        ).to_dict(orient='records')

        # Modern format
        sales_trend = df[['Month_Str', 'Price']].rename(
            columns={'Month_Str': 'month', 'Price': 'price'}
        ).to_dict(orient='records')

        product_perf_df = df.groupby('Month_Str')['Units_Sold'].sum().reset_index().rename(
            columns={'Month_Str': 'month', 'Units_Sold': 'units'}
        )
        product_perf = product_perf_df.to_dict(orient='records')

        seasonal_df = df.groupby('Month_Name')['Units_Sold'].sum().reset_index().rename(
            columns={'Month_Name': 'month', 'Units_Sold': 'sales'}
        )
        seasonal_trend = seasonal_df.to_dict(orient='records')

        price_dist = [
            {"category": "High (>12)", "value": int((df['Price'] > 12).sum())},
            {"category": "Medium (11-12)", "value": int(((df['Price'] >= 11) & (df['Price'] <= 12)).sum())},
            {"category": "Low (<11)", "value": int((df['Price'] < 11).sum())}
        ]

        return {
            "legacy": {
                "For_Units": units,
                "For_Month": month,
                "Suggested_Price": round(predicted_price, 2),
                "Price_Trend": price_trend
            },
            "modern": {
                "salesTrend": sales_trend,
                "productPerformance": [
                    {"product": row["month"], "units": row["units"]}
                    for row in product_perf
                ],
                "seasonalTrends": seasonal_trend,
                "salesDistribution": price_dist
            }
        }

    except Exception as e:
        return {
            "error": str(e),
            "hint": "Ensure the CSV has 'Date', 'Units_Sold', and 'Price' columns with valid data."
        }
