# File: modules/forecast_model.py
from prophet import Prophet
import pandas as pd

def forecast_sales_from_csv(csv_url, months=3):
    try:
        # Load CSV from URL or path
        df = pd.read_csv(csv_url)
        
        # Ensure required column exists
        if 'Date' not in df.columns or 'Units_Sold' not in df.columns:
            raise ValueError("CSV must contain 'Date' and 'Units_Sold' columns.")
        
        # Clean and convert
        df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
        df['Units_Sold'] = pd.to_numeric(df['Units_Sold'], errors='coerce')
        df.dropna(subset=['Date', 'Units_Sold'], inplace=True)

        # Prepare for Prophet
        df = df.rename(columns={'Date': 'ds', 'Units_Sold': 'y'})

        # Model and predict
        model = Prophet()
        model.fit(df)
        future = model.make_future_dataframe(periods=months, freq='M')
        forecast = model.predict(future)

        # Format forecast
        forecast_output = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(months)
        forecast_records = forecast_output.to_dict(orient='records')

        # Format modern chart-friendly output
        modern_forecast = [
            {
                "month": pd.to_datetime(row["ds"]).strftime("%b %Y"),
                "forecast": round(row["yhat"], 2),
                "lower": round(row["yhat_lower"], 2),
                "upper": round(row["yhat_upper"], 2)
            }
            for row in forecast_records
        ]

        return {
            "forecast_summary": {
                "next_n_months": months,
                "records": modern_forecast
            }
        }

    except Exception as e:
        return {
            "error": str(e),
            "hint": "Ensure the CSV has 'Date' and 'Units_Sold' columns with valid data."
        }
