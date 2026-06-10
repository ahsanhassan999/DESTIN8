import urllib.request
import urllib.parse
import json
import random
import string

API_URL = "http://localhost:8000"

def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    headers["Content-Type"] = "application/json"
    
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")
        
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode("utf-8")
            if res_data:
                return response.status, json.loads(res_data)
            return response.status, {}
    except urllib.error.HTTPError as e:
        res_data = e.read().decode("utf-8")
        try:
            return e.code, json.loads(res_data)
        except:
            return e.code, {"detail": res_data}

def generate_random_email():
    domain = "".join(random.choices(string.ascii_lowercase, k=5))
    return f"user_{domain}@test.com"

def test_reviews():
    print("=== Starting Destin8 Traveler Reviews Verification ===")

    # 1. Register and login traveler
    print("\n1. Registering traveler...")
    traveler_email = generate_random_email()
    status, trav_reg = make_request(
        f"{API_URL}/api/auth/register/traveler",
        method="POST",
        data={
            "name": "Test Review Traveler",
            "email": traveler_email,
            "password": "Password@123",
            "confirm_password": "Password@123"
        }
    )
    if status not in (200, 201):
        print(f"FAILED: Traveler registration failed: {trav_reg}")
        return
        
    status, trav_login = make_request(
        f"{API_URL}/api/auth/login",
        method="POST",
        data={"email": traveler_email, "password": "Password@123"}
    )
    traveler_token = trav_login["access_token"]
    traveler_headers = {"Authorization": f"Bearer {traveler_token}"}
    print("SUCCESS: Traveler logged in.")

    # 2. Register, login, and approve agency
    print("\n2. Registering agency...")
    agency_email = generate_random_email()
    status, ag_reg = make_request(
        f"{API_URL}/api/auth/register/agency",
        method="POST",
        data={
            "agency_name": "Test Review Agency",
            "owner_name": "Agency Owner",
            "email": agency_email,
            "password": "Password@123",
            "confirm_password": "Password@123",
            "phone": "03001234567",
            "business_address": "Main St, Karachi",
            "license_number": "LIC-998822"
        }
    )
    agency_id = ag_reg["user_id"]
    
    # Approve agency via admin
    status, admin_login = make_request(
        f"{API_URL}/api/auth/login",
        method="POST",
        data={"email": "admin@destin8.com", "password": "Admin@123"}
    )
    admin_token = admin_login["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    status, _ = make_request(
        f"{API_URL}/api/admin/agencies/{agency_id}/status",
        method="PATCH",
        data={"status": "approved", "reason": "Verified license details"},
        headers=admin_headers
    )
    
    # Login agency
    status, ag_login = make_request(
        f"{API_URL}/api/auth/login",
        method="POST",
        data={"email": agency_email, "password": "Password@123"}
    )
    agency_token = ag_login["access_token"]
    agency_headers = {"Authorization": f"Bearer {agency_token}"}
    print("SUCCESS: Agency approved and logged in.")

    # 3. Create a package
    print("\n3. Creating package...")
    status, pkg = make_request(
        f"{API_URL}/api/packages/agency/create",
        method="POST",
        data={
            "title": "Kaghan Autumn Special",
            "destination": "Kaghan Valley",
            "price": 600.0,
            "duration_days": 4,
            "description": "Lovely scenic tour of Kaghan during autumn colors.",
            "included_services": "[]",
            "cover_image": None,
            "departure_date": "2026-10-10",
            "is_active": True,
            "itinerary": "[]",
            "deposit_percentage": 50,
            "refund_deadline_days": 7
        },
        headers=agency_headers
    )
    pkg_id = pkg["id"]
    print(f"SUCCESS: Package created (ID: {pkg_id})")

    # 4. Fetch empty reviews
    print("\n4. Fetching initial empty reviews...")
    status, reviews = make_request(
        f"{API_URL}/api/packages/{pkg_id}/reviews",
        method="GET",
        headers=traveler_headers
    )
    print(f"SUCCESS: Reviews list: {reviews}")
    if len(reviews) != 0:
        print("FAILED: Expected 0 reviews initially.")
        return

    # 5. Submit valid review
    print("\n5. Submitting review (5 stars)...")
    status, res = make_request(
        f"{API_URL}/api/packages/{pkg_id}/reviews",
        method="POST",
        data={"rating": 5, "comment": "Absolutely wonderful trip, highly recommended!"},
        headers=traveler_headers
    )
    if status != 201:
        print(f"FAILED: Submitting review failed: {res}")
        return
    print(f"SUCCESS: Review submitted successfully: {res}")

    # 6. Attempt duplicate review
    print("\n6. Testing duplicate review block...")
    status, res2 = make_request(
        f"{API_URL}/api/packages/{pkg_id}/reviews",
        method="POST",
        data={"rating": 4, "comment": "Trying to write a duplicate review."},
        headers=traveler_headers
    )
    if status != 400:
        print(f"FAILED: Expected 400 for duplicate review, got {status}: {res2}")
        return
    print(f"SUCCESS: Duplicate review correctly blocked: {res2}")

    # 7. Submit invalid rating (6 stars)
    print("\n7. Testing invalid rating (6 stars) block...")
    # Generate another traveler to avoid duplicate check
    traveler_email_2 = generate_random_email()
    make_request(
        f"{API_URL}/api/auth/register/traveler",
        method="POST",
        data={"name": "Traveler Two", "email": traveler_email_2, "password": "Password@123", "confirm_password": "Password@123"}
    )
    _, login_2 = make_request(f"{API_URL}/api/auth/login", method="POST", data={"email": traveler_email_2, "password": "Password@123"})
    headers_2 = {"Authorization": f"Bearer {login_2['access_token']}"}

    status, res3 = make_request(
        f"{API_URL}/api/packages/{pkg_id}/reviews",
        method="POST",
        data={"rating": 6, "comment": "Too high!"},
        headers=headers_2
    )
    if status != 422:
        print(f"FAILED: Expected 422 for invalid rating range, got {status}: {res3}")
        return
    print(f"SUCCESS: Invalid rating correctly blocked: {res3}")

    # 8. Fetch and verify reviews list
    print("\n8. Fetching and verifying reviews...")
    status, final_reviews = make_request(
        f"{API_URL}/api/packages/{pkg_id}/reviews",
        method="GET",
        headers=traveler_headers
    )
    if len(final_reviews) != 1:
        print(f"FAILED: Expected 1 review, got {len(final_reviews)}")
        return
    print(f"SUCCESS: Found review: {final_reviews[0]}")
    assert final_reviews[0]["rating"] == 5
    assert final_reviews[0]["comment"] == "Absolutely wonderful trip, highly recommended!"
    assert final_reviews[0]["user_name"] == "Test Review Traveler"

    print("\n=== All Traveler Reviews Verification Tests Passed Successfully! ===")

if __name__ == "__main__":
    test_reviews()
