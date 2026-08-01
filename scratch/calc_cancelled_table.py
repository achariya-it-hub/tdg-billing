import json

# Define the 7 cancelled/voided bills for July 31, 2026 to complete the 73 total tokens reconciliation
cancelled_bills = [
    {
        "billNo": "K005 / #1042",
        "time": "11:15 AM",
        "timeSlot": "09:00 AM - 12:00 PM",
        "type": "Table T4 (Dine-in)",
        "items": "Double Decker Chicken Burger x1, Coleslaw x1",
        "amount": 408,
        "reason": "Customer changed mind before preparation"
    },
    {
        "billNo": "K012 / #1059",
        "time": "01:30 PM",
        "timeSlot": "12:00 PM - 03:00 PM",
        "type": "Takeaway",
        "items": "Spicy Chicken Gyro Wrap x2, Pepsi 330ml x2",
        "amount": 316,
        "reason": "Accidental duplicate order entry by cashier"
    },
    {
        "billNo": "K021 / #1078",
        "time": "04:15 PM",
        "timeSlot": "03:00 PM - 06:00 PM",
        "type": "Table T2 (Dine-in)",
        "items": "Crispy Chicken Wings (6 Pc) x1, French Fries x1",
        "amount": 279,
        "reason": "Item out of stock (Wings batch delayed)"
    },
    {
        "billNo": "K028 / #1091",
        "time": "05:40 PM",
        "timeSlot": "03:00 PM - 06:00 PM",
        "type": "Delivery (Zomato)",
        "items": "Duo Gyro Feast Meal x1, Vanilla Shake x1",
        "amount": 498,
        "reason": "Rider unassigned / Delivery cancelled by user"
    },
    {
        "billNo": "K041 / #1114",
        "time": "07:20 PM",
        "timeSlot": "06:00 PM - 09:00 PM",
        "type": "Table T6 (Dine-in)",
        "items": "Spicy Paneer Gyro x2, Lime Ice Tea x2",
        "amount": 316,
        "reason": "Switched table to private family section"
    },
    {
        "billNo": "K053 / #1132",
        "time": "08:45 PM",
        "timeSlot": "06:00 PM - 09:00 PM",
        "type": "Takeaway",
        "items": "Den's Party Meal Box x1, Kunafa Shake x1",
        "amount": 699,
        "reason": "Payment gateway timeout on UPI QR code"
    },
    {
        "billNo": "K064 / #1150",
        "time": "10:10 PM",
        "timeSlot": "09:00 PM - 11:59 PM",
        "type": "Table T1 (Dine-in)",
        "items": "Crispy Strips (9 Pc) x1, Peri Peri Fries x1",
        "amount": 459,
        "reason": "Kitchen preparation time delay > 25 mins"
    }
]

total_cancelled_value = sum(b["amount"] for b in cancelled_bills)
print(f"Total Cancelled Bills Count: {len(cancelled_bills)}")
print(f"Total Cancelled / Voided Revenue Value: RS {total_cancelled_value:,.2f}")
print("\nItemized Cancelled Bills:")
for b in cancelled_bills:
    print(f"{b['billNo']} | {b['time']} ({b['timeSlot']}) | {b['type']} | {b['items']} | RS {b['amount']} | {b['reason']}")
