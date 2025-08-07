 
from prophet import Prophet
import pandas as pd

def forecast_sales(csv_path="data/sales.csv", months=3):
    df = pd.read_csv(csv_path, parse_dates=['Date'], dayfirst=True)
    df.rename(columns={"Date": "ds", "Units_Sold": "y"}, inplace=True)

    model = Prophet()
    model.fit(df)

    future = model.make_future_dataframe(periods=months, freq='M')
    forecast = model.predict(future)

    return forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(months).to_dict(orient='records')
