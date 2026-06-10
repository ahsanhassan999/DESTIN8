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

def test_prepayment_blocking():
    print("=== Starting Destin8 Pre-Payment Chat Blocking & Sales Stage Verification ===")

    # 1. Register and login a traveler
    print("\n1. Registering traveler...")
    traveler_email = generate_random_email()
    status, trav_reg = make_request(
        f"{API_URL}/api/auth/register/traveler",
        method="POST",
        data={
            "name": "Test Traveler Chat",
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
            "agency_name": "Test Chat Agency Ltd",
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
    
    # Login as admin to approve agency
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
    
    # Login as agency
    status, ag_login = make_request(
        f"{API_URL}/api/auth/login",
        method="POST",
        data={"email": agency_email, "password": "Password@123"}
    )
    agency_token = ag_login["access_token"]
    agency_headers = {"Authorization": f"Bearer {agency_token}"}
    print("SUCCESS: Agency registered and approved.")

    # 3. Create a package as agency
    print("\n3. Creating package...")
    status, pkg = make_request(
        f"{API_URL}/api/packages/agency/create",
        method="POST",
        data={
            "title": "Kashmir Meadows Test",
            "destination": "Neelum Valley",
            "price": 800.0,
            "duration_days": 5,
            "description": "Fabulous Meadows Tour",
            "included_services": "[]",
            "cover_image": None,
            "departure_date": "2026-08-01",
            "is_active": True,
            "itinerary": "[]",
            "deposit_percentage": 50,
            "refund_deadline_days": 7
        },
        headers=agency_headers
    )
    pkg_id = pkg["id"]
    print(f"SUCCESS: Package created (ID: {pkg_id})")

    # 4. Open traveler chat
    print("\n4. Opening traveler chat conversation...")
    status, conv = make_request(
        f"{API_URL}/api/chat/conversations",
        method="POST",
        data={"package_id": pkg_id},
        headers=traveler_headers
    )
    conv_id = conv["id"]
    print(f"SUCCESS: Chat conversation created (ID: {conv_id})")

    # 5. Check admin conversation list (expect presale)
    print("\n5. Checking Admin conversation list for presale...")
    status, admin_convs = make_request(
        f"{API_URL}/api/admin/chat/conversations",
        method="GET",
        headers=admin_headers
    )
    if status != 200:
        print(f"FAILED: Retrieving admin conversations failed with status {status}: {admin_convs}")
        return
    admin_conv = next((c for c in admin_convs if c["id"] == conv_id), None)
    if not admin_conv:
        print("FAILED: Could not find conversation in admin chat supervision list.")
        return
    print(f"Admin Conversation Stage: {admin_conv['sale_stage']}")
    if admin_conv["sale_stage"] != "presale":
        print("FAILED: Expected sale stage to be 'presale'.")
        return
    print("SUCCESS: Conversation starts in 'presale' stage.")

    # 6. Test Pre-Payment Chat Blocking (sharing details should be rejected)
    print("\n6. Testing pre-payment contact info blocking...")
    blocked_messages = [
        "Call me at +923001234567 to discuss",
        "My WhatsApp is 0321-7654321",
        "Reach me at test@example.com",
        "Visit our profile on instagram.com/mypage",
        "Contact handle is @agency_insta",
        "whatsapp zero three zero zero one two three four five six seven"
    ]
    for msg in blocked_messages:
        status, res = make_request(
            f"{API_URL}/api/chat/conversations/{conv_id}/messages",
            method="POST",
            data={"text": msg},
            headers=traveler_headers
        )
        if status != 400:
            print(f"FAILED: Expected message to be blocked, but status was {status}. Text: {msg}")
            return
        else:
            print(f"BLOCKED: '{msg}' (Error: {res['detail']})")
    print("SUCCESS: All contact details blocked in pre-payment chat.")

    # 7. Test standard message (should succeed)
    print("\n7. Sending a permitted message...")
    status, Permitted = make_request(
        f"{API_URL}/api/chat/conversations/{conv_id}/messages",
        method="POST",
        data={"text": "Is this package suitable for families?"},
        headers=traveler_headers
    )
    if status not in (200, 201):
        print(f"FAILED: Permitted message failed: {Permitted}")
        return
    print(f"SUCCESS: Permitted message sent: '{Permitted['text']}'")

    # 8. Create booking and pay deposit (Transition to postsale)
    print("\n8. Creating booking and paying 50% deposit...")
    status, b_res = make_request(
        f"{API_URL}/api/bookings",
        method="POST",
        data={
            "package_id": pkg_id,
            "num_travelers": 1,
            "travel_date": "2026-08-01"
        },
        headers=traveler_headers
    )
    booking_id = b_res["id"]
    
    # Pay deposit
    status, pay_res = make_request(
        f"{API_URL}/api/bookings/{booking_id}/pay",
        method="POST",
        data={"card_number": "4242424242424242", "expiry_month": 12, "expiry_year": 2030, "cvv": "123"},
        headers=traveler_headers
    )
    if status != 200:
        print(f"FAILED: Paying deposit failed: {pay_res}")
        return
    print("SUCCESS: Deposit paid. Booking is now confirmed.")

    # 9. Check admin conversation list (expect postsale)
    print("\n9. Checking Admin conversation list for postsale...")
    status, admin_convs2 = make_request(
        f"{API_URL}/api/admin/chat/conversations",
        method="GET",
        headers=admin_headers
    )
    admin_conv2 = next((c for c in admin_convs2 if c["id"] == conv_id), None)
    print(f"Admin Conversation Stage: {admin_conv2['sale_stage']}")
    if admin_conv2["sale_stage"] != "postsale":
        print("FAILED: Expected sale stage to be 'postsale'.")
        return
    print("SUCCESS: Conversation transitioned to 'postsale' stage.")

    # 10. Test Post-Payment Chat Permitted details (sharing details should succeed)
    print("\n10. Testing post-payment contact sharing...")
    for msg in blocked_messages:
        status, res = make_request(
            f"{API_URL}/api/chat/conversations/{conv_id}/messages",
            method="POST",
            data={"text": msg},
            headers=traveler_headers
        )
        if status not in (200, 201):
            print(f"FAILED: Expected message to be allowed, but status was {status}. Error: {res}")
            return
        else:
            print(f"ALLOWED: '{msg}'")
    print("SUCCESS: Contact details are successfully shared post-payment.")

    print("\n=== All Pre-Payment Blocking & Sales Stage Tests Passed Successfully! ===")

if __name__ == "__main__":
    test_prepayment_blocking()
