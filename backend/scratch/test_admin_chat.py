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

def run_tests():
    print("=== Testing Admin Chat Supervision APIs ===")

    # 1. Login as Admin
    print("\n1. Logging in as Admin...")
    status, admin_login_res = make_request(
        f"{API_URL}/api/auth/login",
        method="POST",
        data={"email": "admin@destin8.com", "password": "Admin@123"}
    )
    if status != 200:
        print(f"FAILED: Admin login failed with status {status}")
        return
    admin_token = admin_login_res["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("SUCCESS: Admin logged in.")

    # 2. Login as Traveler to ensure a conversation exists
    print("\n2. Logging in as Traveler to verify/create conversation...")
    status, traveler_login_res = make_request(
        f"{API_URL}/api/auth/login",
        method="POST",
        data={"email": "traveler@test.com", "password": "Traveler@123"}
    )
    if status != 200:
        print(f"FAILED: Traveler login failed: {traveler_login_res}")
        return
    traveler_token = traveler_login_res["access_token"]
    traveler_headers = {"Authorization": f"Bearer {traveler_token}"}

    # Retrieve traveler packages
    status, packages = make_request(
        f"{API_URL}/api/packages",
        method="GET",
        headers=traveler_headers
    )
    if status != 200 or not packages:
        print(f"FAILED: Could not retrieve packages: {packages}")
        return
    pkg = packages[0]

    # Create conversation
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
    print(f"SUCCESS: Conversation active (ID: {conv_id})")

    # Send traveler message
    status, traveler_msg = make_request(
        f"{API_URL}/api/chat/conversations/{conv_id}/messages",
        method="POST",
        data={"text": "Test inquiry message from traveler"},
        headers=traveler_headers
    )
    print("Traveler message sent.")

    # 3. List conversations as Admin
    print("\n3. Listing conversations as Admin...")
    status, conversations = make_request(
        f"{API_URL}/api/admin/chat/conversations",
        method="GET",
        headers=admin_headers
    )
    if status != 200:
        print(f"FAILED: Admin list conversations failed: {conversations}")
        return
    print(f"SUCCESS: Admin listed {len(conversations)} conversations.")
    admin_conv = next((c for c in conversations if c["id"] == conv_id), None)
    if not admin_conv:
        print(f"FAILED: Target conversation {conv_id} not found in admin list.")
        return
    print(f"Found conversation: {admin_conv['traveler']} <-> {admin_conv['agency']} ({admin_conv['package']})")

    # 4. List and seed default tags
    print("\n4. Listing tags as Admin...")
    status, tags = make_request(
        f"{API_URL}/api/admin/chat/tags",
        method="GET",
        headers=admin_headers
    )
    if status != 200 or not tags:
        print(f"FAILED: Tags list failed or empty: {tags}")
        return
    print(f"SUCCESS: Found tags: {[t['name'] for t in tags]}")

    # 5. Create a new custom tag
    print("\n5. Creating a new chat tag...")
    status, new_tag = make_request(
        f"{API_URL}/api/admin/chat/tags",
        method="POST",
        data={"name": "Suspicious Price", "color": "#ff00ff"},
        headers=admin_headers
    )
    if status != 201:
        print(f"FAILED: Custom tag creation failed: {new_tag}")
        return
    tag_id = new_tag["id"]
    print(f"SUCCESS: Created tag '{new_tag['name']}' (ID: {tag_id})")

    # 6. Assign tags to conversation
    print("\n6. Assigning tags to conversation...")
    status, tag_assign_res = make_request(
        f"{API_URL}/api/admin/chat/conversations/{conv_id}/tags",
        method="PATCH",
        data={"tag_ids": [tags[0]["id"], tag_id]},
        headers=admin_headers
    )
    if status != 200:
        print(f"FAILED: Tag assignment failed: {tag_assign_res}")
        return
    print(f"SUCCESS: Assigned tags: {tag_assign_res['tag_ids']}")

    # 7. Check if conversation list reflects the tags
    print("\n7. Re-checking conversation details...")
    status, conversations = make_request(
        f"{API_URL}/api/admin/chat/conversations",
        method="GET",
        headers=admin_headers
    )
    admin_conv = next((c for c in conversations if c["id"] == conv_id), None)
    assigned_tag_names = [t["name"] for t in admin_conv["tags"]]
    print(f"SUCCESS: Conversation now has tags: {assigned_tag_names}")

    # 8. Send system warning
    print("\n8. Dispatching system warning...")
    status, warning_msg = make_request(
        f"{API_URL}/api/admin/chat/conversations/{conv_id}/system-warning",
        method="POST",
        data={"text": "This is a test admin security warning."},
        headers=admin_headers
    )
    if status not in (200, 201):
        print(f"FAILED: Send warning failed: {warning_msg}")
        return
    print(f"SUCCESS: System warning sent: {warning_msg}")

    # 9. Verify messages list
    print("\n9. Fetching conversation messages timeline...")
    status, messages = make_request(
        f"{API_URL}/api/admin/chat/conversations/{conv_id}/messages",
        method="GET",
        headers=admin_headers
    )
    if status != 200:
        print(f"FAILED: Fetch messages failed: {messages}")
        return
    print("SUCCESS: Messages timeline:")
    for m in messages:
        print(f"  [{m['time']}] {m['sender'].upper()}: {m['text']} (isWarning={m['isWarning']})")

    # 10. Toggle conversation flag
    print("\n10. Flagging conversation...")
    status, flag_res = make_request(
        f"{API_URL}/api/admin/chat/conversations/{conv_id}/flag",
        method="PATCH",
        data={"is_flagged": True, "reason": "Suspected spam or direct bank details shared"},
        headers=admin_headers
    )
    if status != 200:
        print(f"FAILED: Flagging failed: {flag_res}")
        return
    print(f"SUCCESS: Conversation flagged: {flag_res}")

    # 11. Delete the custom tag
    print("\n11. Deleting custom tag...")
    status, del_res = make_request(
        f"{API_URL}/api/admin/chat/tags/{tag_id}",
        method="DELETE",
        headers=admin_headers
    )
    if status != 200:
        print(f"FAILED: Tag deletion failed: {del_res}")
        return
    print("SUCCESS: Custom tag deleted.")

    print("\n=== All Tests Passed Successfully! ===")

if __name__ == "__main__":
    run_tests()
