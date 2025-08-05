### File: modules/inventory_model.py
from math import sqrt

def calculate_eoq(demand_rate, ordering_cost, holding_cost):
    eoq = sqrt((2 * demand_rate * ordering_cost) / holding_cost)
    return round(eoq, 2)

