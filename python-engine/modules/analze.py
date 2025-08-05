# modules/pricing_model.py
import pandas as pd
from sklearn.linear_model import LinearRegression

def analyze_pricing_from_csv(csv_url):
    df = pd.read_csv(csv_url, parse_dates=['Date'], dayfirst=True)
    df['Month'] = df['Date'].dt.strftime('%b %Y')  # For x-axis labels

    # ML prediction
    X = df[['Units_Sold', 'Date']]
    X['Month_Num'] = df['Date'].dt.month
    y = df['Price']

    model = LinearRegression()
    model.fit(df[['Units_Sold', 'Month_Num']], y)

    # Return all data for plotting
    sales_trend = df[['Month', 'Price']].rename(columns={'Price': 'price'}).to_dict(orient='records')
    product_perf = df.groupby('Month').agg({'Units_Sold': 'sum'}).reset_index()
    product_perf.columns = ['month', 'units']

    seasonal = df.copy()
    seasonal['month'] = df['Date'].dt.strftime('%b')
    seasonal = seasonal.groupby('month').agg({'Units_Sold': 'sum'}).reset_index()
    seasonal.columns = ['month', 'sales']

    distribution = [
        {"category": "High", "value": int((df['Price'] > 12).sum())},
        {"category": "Medium", "value": int(((df['Price'] <= 12) & (df['Price'] > 11)).sum())},
        {"category": "Low", "value": int((df['Price'] <= 11).sum())}
    ]

    return {
        "salesTrend": sales_trend,
        "productPerformance": product_perf.to_dict(orient='records'),
        "seasonalTrends": seasonal.to_dict(orient='records'),
        "salesDistribution": distribution,
    }
