import asyncio
import httpx

async def test():
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        # 1. Login as Odyssey Travels
        login_res = await client.post("/api/auth/login", json={
            "email": "agency@test.com",
            "password": "Agency@123" # default seeded password
        })
        if login_res.status_code != 200:
            print("Failed to login:", login_res.json())
            return
        
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Logged in successfully. Token obtained.")

        # 2. Get bank details
        get_res = await client.get("/api/bookings/agency/bank-details", headers=headers)
        print("GET Bank details response:", get_res.status_code, get_res.json())

        # 3. Save bank details
        patch_res = await client.patch("/api/bookings/agency/bank-details", headers=headers, json={
            "bank_name": "Meezan Bank Limited",
            "account_title": "Odyssey Travels",
            "account_number": "PK98MEZN00120304050607",
            "branch_code": "0987"
        })
        print("PATCH Bank details response:", patch_res.status_code, patch_res.json())

        # 4. Get bank details again to verify
        get_res2 = await client.get("/api/bookings/agency/bank-details", headers=headers)
        print("GET Bank details response after save:", get_res2.status_code, get_res2.json())

if __name__ == "__main__":
    asyncio.run(test())
