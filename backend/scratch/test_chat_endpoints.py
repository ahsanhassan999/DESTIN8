import urllib.request
import urllib.parse
import json

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

def test_chat():
    print("=== Testing Chat System API (with urllib) ===")
    
    # 1. Login as Traveler
    print("\n1. Logging in as Traveler...")
    status, login_res = make_request(
        f"{API_URL}/api/auth/login",
        method="POST",
        data={"email": "traveler@test.com", "password": "Traveler@123"}
    )
    if status != 200:
        print(f"FAILED: Traveler login failed with status {status}")
        print(login_res)
        return
    
    traveler_token = login_res["access_token"]
    traveler_headers = {"Authorization": f"Bearer {traveler_token}"}
    print("SUCCESS: Traveler logged in.")
    
    # 2. Get packages to retrieve a valid package ID
    print("\n2. Retrieving packages...")
    status, packages = make_request(
        f"{API_URL}/api/packages",
        method="GET",
        headers=traveler_headers
    )
    if status != 200:
        print(f"FAILED: Could not retrieve packages: {packages}")
        return
    
    if not packages:
        print("FAILED: No packages found in the database. Run seed script first.")
        return
    
    # Find a package belonging to Odyssey Travels (agency_id = 87858057)
    pkg = next((p for p in packages if p.get("agency_id") == "87858057"), None)
    if not pkg:
        # Fallback to the first package
        pkg = packages[0]
        print(f"[!] Warning: No package found for Odyssey Travels. Falling back to first package (Agency: {pkg.get('agency_id')})")
    else:
        print(f"SUCCESS: Found package: {pkg['title']} (ID: {pkg['id']})")

    # 3. Create conversation as Traveler
    print("\n3. Creating conversation for the package...")
    status, conv = make_request(
        f"{API_URL}/api/chat/conversations",
        method="POST",
        data={"package_id": pkg["id"]},
        headers=traveler_headers
    )
    if status not in (200, 201):
        print(f"FAILED: Could not create conversation: {conv}")
        return
    
    conv_id = conv["id"]
    print(f"SUCCESS: Conversation created/retrieved (ID: {conv_id})")
    print(f"Conversation Data: {conv}")
    
    # 4. Send a message as Traveler
    print("\n4. Sending a message from Traveler...")
    status, msg = make_request(
        f"{API_URL}/api/chat/conversations/{conv_id}/messages",
        method="POST",
        data={"text": "Hello, I am interested in this package!"},
        headers=traveler_headers
    )
    if status not in (200, 201):
        print(f"FAILED: Traveler message send failed: {msg}")
        return
    
    print(f"SUCCESS: Traveler sent message: {msg}")

    # 5. Login as Agency
    print("\n5. Logging in as Agency...")
    status, agency_login_res = make_request(
        f"{API_URL}/api/auth/login",
        method="POST",
        data={"email": "agency@test.com", "password": "Agency@123"}
    )
    if status != 200:
        print(f"FAILED: Agency login failed with status {status}")
        print(agency_login_res)
        return
    
    agency_token = agency_login_res["access_token"]
    agency_headers = {"Authorization": f"Bearer {agency_token}"}
    print("SUCCESS: Agency logged in.")

    # 6. List conversations as Agency
    print("\n6. Listing conversations for Agency...")
    status, agency_convs = make_request(
        f"{API_URL}/api/chat/conversations",
        method="GET",
        headers=agency_headers
    )
    if status != 200:
        print(f"FAILED: Agency could not list conversations: {agency_convs}")
        return
    
    print(f"SUCCESS: Conversations listed for Agency: {agency_convs}")
    
    # Verify the conversation we just created is there
    found_conv = next((c for c in agency_convs if c["id"] == conv_id), None)
    if not found_conv:
        print(f"FAILED: Conversation {conv_id} not found in Agency list.")
        return
    print(f"SUCCESS: Conversation found in Agency list. Last message: '{found_conv['lastMsg']}'")

    # 7. Send message as Agency
    print("\n7. Sending message from Agency...")
    status, agency_msg = make_request(
        f"{API_URL}/api/chat/conversations/{conv_id}/messages",
        method="POST",
        data={"text": "Hello! I would be happy to help you book this trip."},
        headers=agency_headers
    )
    if status not in (200, 201):
        print(f"FAILED: Agency message send failed: {agency_msg}")
        return
    print(f"SUCCESS: Agency sent message: {agency_msg}")

    # 8. Check conversation history as Traveler
    print("\n8. Checking conversation history as Traveler...")
    status, history = make_request(
        f"{API_URL}/api/chat/conversations/{conv_id}/messages",
        method="GET",
        headers=traveler_headers
    )
    if status != 200:
        print(f"FAILED: Traveler could not retrieve message history: {history}")
        return
    
    print("SUCCESS: Message history retrieved:")
    for m in history:
        sender = "Me (Traveler)" if m["is_me"] else "Agency"
        print(f"  [{m['time']}] {sender}: {m['text']}")

    # 9. Verify constraints: Try to create conversation as Agency (should be forbidden)
    print("\n9. Verifying constraints (Agency trying to initiate conversation)...")
    status, forbidden_res = make_request(
        f"{API_URL}/api/chat/conversations",
        method="POST",
        data={"package_id": pkg["id"]},
        headers=agency_headers
    )
    if status == 403:
        print("SUCCESS: Correctly blocked. Only travelers can initiate conversations.")
    else:
        print(f"FAILED: Expected status 403, got {status}: {forbidden_res}")

if __name__ == "__main__":
    test_chat()
