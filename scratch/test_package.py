import asyncio
import httpx

async def test():
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        # 1. Login
        login_res = await client.post("/api/auth/login", json={
            "email": "agency@test.com",
            "password": "Agency@123"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Logged in.")

        # 2. Create package
        create_res = await client.post("/api/packages/agency/create", headers=headers, json={
            "title": "Test Deposit Package",
            "destination": "Test Valley",
            "price": 25000.0,
            "duration_days": 5,
            "description": "Test description",
            "included_services": '["Meals"]',
            "cover_image": "http://example.com/img.jpg",
            "departure_date": None,
            "is_active": True,
            "itinerary": '[]',
            "deposit_percentage": 60
        })
        print("Create Package response:", create_res.status_code, create_res.json())
        pkg_id = create_res.json()["id"]

        # 3. Update package
        update_res = await client.patch(f"/api/packages/agency/{pkg_id}", headers=headers, json={
            "title": "Test Deposit Package Updated",
            "price": 27500.0,
            "deposit_percentage": 70
        })
        print("Update Package response:", update_res.status_code, update_res.json())

        # 4. Get package to verify
        get_res = await client.get(f"/api/packages/{pkg_id}", headers=headers)
        print("Get Package response:", get_res.status_code, get_res.json())

if __name__ == "__main__":
    asyncio.run(test())
