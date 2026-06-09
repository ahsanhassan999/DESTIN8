import urllib.request
import urllib.parse
import json
import random
import sys

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
    print("=== Starting Destin8 Refunds, Locking & Ticketing System Verification Tests ===")
    
    # Generate unique emails
    rand_id = random.randint(10000, 99999)
    traveler_email = f"traveler_{rand_id}@test.com"
    agency_email = f"agency_{rand_id}@test.com"
    
    # 1. Register Traveler
    print("\n1. Registering traveler...")
    status, res = make_request(
        f"{API_URL}/api/auth/register/traveler",
        method="POST",
        data={
            "name": "Test Traveler",
            "email": traveler_email,
            "password": "Password@123",
            "confirm_password": "Password@123"
        }
    )
    if status != 201:
        print(f"FAILED: Traveler registration failed with status {status}: {res}")
        return
    print("SUCCESS: Traveler registered.")
    
    # 2. Register Agency
    print("\n2. Registering agency...")
    status, res = make_request(
        f"{API_URL}/api/auth/register/agency",
        method="POST",
        data={
            "agency_name": "Paradise Tours",
            "owner_name": "John Paradise",
            "email": agency_email,
            "password": "Password@123",
            "confirm_password": "Password@123",
            "phone": "03001234567",
            "business_address": "123 Paradise Street",
            "license_number": f"LIC-{rand_id}"
        }
    )
    if status != 201:
        print(f"FAILED: Agency registration failed with status {status}: {res}")
        return
    agency_id = res["user_id"]
    print(f"SUCCESS: Agency registered (ID: {agency_id}).")
    
    # 3. Login as Admin & Approve Agency
    print("\n3. Logging in as Admin to approve agency...")
    status, login_res = make_request(
        f"{API_URL}/api/auth/login",
        method="POST",
        data={"email": "admin@destin8.com", "password": "Admin@123"}
    )
    if status != 200:
        print(f"FAILED: Admin login failed: {login_res}")
        return
    admin_headers = {"Authorization": f"Bearer {login_res['access_token']}"}
    
    status, res = make_request(
        f"{API_URL}/api/admin/agencies/{agency_id}/status",
        method="PATCH",
        data={"status": "approved"},
        headers=admin_headers
    )
    if status != 200:
        print(f"FAILED: Approving agency failed: {res}")
        return
    print("SUCCESS: Agency approved by admin.")
    
    # 4. Login as Agency & Create Package
    print("\n4. Logging in as Agency to create package...")
    status, login_res = make_request(
        f"{API_URL}/api/auth/login",
        method="POST",
        data={"email": agency_email, "password": "Password@123"}
    )
    if status != 200:
        print(f"FAILED: Agency login failed: {login_res}")
        return
    agency_headers = {"Authorization": f"Bearer {login_res['access_token']}"}
    
    status, pkg_res = make_request(
        f"{API_URL}/api/packages/agency/create",
        method="POST",
        data={
            "title": "Paradise Escape",
            "destination": "Maldives",
            "price": 1000.0,
            "duration_days": 5,
            "description": "Escape to paradise.",
            "refund_deadline_days": 5,
            "deposit_percentage": 50
        },
        headers=agency_headers
    )
    if status != 201:
        print(f"FAILED: Creating package failed: {pkg_res}")
        return
    pkg_id = pkg_res["id"]
    print(f"SUCCESS: Package created (ID: {pkg_id}).")
    
    # 5. Traveler Payment Success (Unverified Agency Escrow)
    print("\n5. Logging in as Traveler to book and pay...")
    status, login_res = make_request(
        f"{API_URL}/api/auth/login",
        method="POST",
        data={"email": traveler_email, "password": "Password@123"}
    )
    if status != 200:
        print(f"FAILED: Traveler login failed: {login_res}")
        return
    traveler_headers = {"Authorization": f"Bearer {login_res['access_token']}"}
    
    # Create booking
    status, booking_res = make_request(
        f"{API_URL}/api/bookings",
        method="POST",
        data={
            "package_id": pkg_id,
            "num_travelers": 1,
            "travel_date": "2026-07-20"  # Far in the future
        },
        headers=traveler_headers
    )
    if status != 200:
        print(f"FAILED: Creating booking failed: {booking_res}")
        return
    booking_id = booking_res["id"]
    print(f"SUCCESS: Booking created (ID: {booking_id}).")
    
    # Pay for booking
    status, pay_res = make_request(
        f"{API_URL}/api/bookings/{booking_id}/pay",
        method="POST",
        data={
            "card_number": "4242424242424242",
            "expiry_month": 12,
            "expiry_year": 2030,
            "cvv": "123",
            "save_card": False
        },
        headers=traveler_headers
    )
    if status != 200:
        print(f"FAILED: Paying for booking failed: {pay_res}")
        return
    print(f"SUCCESS: Traveler payment succeeded! Payout status on transaction should be 'pending'.")
    
    # 6. Verify Agency Wallet: Withheld Balance
    print("\n6. Checking Agency Wallet...")
    status, wallet_res = make_request(
        f"{API_URL}/api/bookings/agency/wallet",
        method="GET",
        headers=agency_headers
    )
    if status != 200:
        print(f"FAILED: Fetching agency wallet failed: {wallet_res}")
        return
    
    print(f"Wallet Total: {wallet_res['total_balance']}, Withdrawn: {wallet_res['withdrawn_balance']}, Withheld: {wallet_res['withheld_balance']}")
    if wallet_res["withheld_balance"] <= 0 or wallet_res["withdrawn_balance"] != 0:
        print(f"FAILED: Wallet balances are incorrect. Expected withheld > 0 and withdrawn == 0.")
        return
    print("SUCCESS: Payout is held in escrow.")
    
    # 7. Verify Bank Account & Release Escrow Payouts
    print("\n7. Submitting and verifying Agency Bank Details...")
    status, bank_sub_res = make_request(
        f"{API_URL}/api/bookings/agency/bank-details",
        method="PATCH",
        data={
            "bank_name": "Maldives National Bank",
            "account_title": "Paradise Tours Ltd",
            "account_number": "1234567890",
            "branch_code": "MNB001"
        },
        headers=agency_headers
    )
    if status != 200:
        print(f"FAILED: Submitting bank details failed: {bank_sub_res}")
        return
    
    # Admin verifies bank account
    status, verify_res = make_request(
        f"{API_URL}/api/admin/payments/bank-verifications/{agency_id}",
        method="PATCH",
        data={"action": "verify"},
        headers=admin_headers
    )
    if status != 200:
        print(f"FAILED: Verifying bank details failed: {verify_res}")
        return
    print("SUCCESS: Bank details verified by Admin.")
    
    # Check wallet again: withheld should have moved to withdrawn
    status, wallet_res2 = make_request(
        f"{API_URL}/api/bookings/agency/wallet",
        method="GET",
        headers=agency_headers
    )
    print(f"Wallet Total: {wallet_res2['total_balance']}, Withdrawn: {wallet_res2['withdrawn_balance']}, Withheld: {wallet_res2['withheld_balance']}")
    if wallet_res2["withheld_balance"] != 0 or wallet_res2["withdrawn_balance"] <= 0:
        print(f"FAILED: Wallet did not release pending payouts upon bank verification.")
        return
    print("SUCCESS: Held payouts successfully released to withdrawn balance.")
    
    # 8. Test Refund Limit - Cancellation WITHIN Deadline (Refundable)
    print("\n8. Testing Booking Cancellation WITHIN deadline (Refundable)...")
    # Travel date: 2026-08-15 (future, within window)
    status, booking_win_res = make_request(
        f"{API_URL}/api/bookings",
        method="POST",
        data={
            "package_id": pkg_id,
            "num_travelers": 1,
            "travel_date": "2026-08-15"
        },
        headers=traveler_headers
    )
    b_win_id = booking_win_res["id"]
    
    # Pay
    make_request(
        f"{API_URL}/api/bookings/{b_win_id}/pay",
        method="POST",
        data={"card_number": "4242424242424242", "expiry_month": 12, "expiry_year": 2030, "cvv": "123"},
        headers=traveler_headers
    )
    
    # Cancel (with reason)
    reason_encoded = urllib.parse.quote("Schedule clash")
    status, cancel_win_res = make_request(
        f"{API_URL}/api/bookings/{b_win_id}?cancel_reason={reason_encoded}",
        method="DELETE",
        headers=traveler_headers
    )
    if status != 200:
        print(f"FAILED: Cancelling booking failed: {cancel_win_res}")
        return
    print(f"Cancel Response: {cancel_win_res}")
    if not cancel_win_res.get("refunded"):
        print(f"FAILED: Expected cancellation to be refundable.")
        return
    print("SUCCESS: Cancellation within window refunded successfully.")
    
    # 9. Test Refund Limit - Cancellation PAST Deadline (Non-Refundable)
    print("\n9. Testing Booking Cancellation PAST deadline (Non-refundable)...")
    # Let's create a travel date 2 days in the future. Today is June 9, 2026, let's use June 11, 2026
    status, booking_past_res = make_request(
        f"{API_URL}/api/bookings",
        method="POST",
        data={
            "package_id": pkg_id,
            "num_travelers": 1,
            "travel_date": "2026-06-11"
        },
        headers=traveler_headers
    )
    b_past_id = booking_past_res["id"]
    
    # Pay
    make_request(
        f"{API_URL}/api/bookings/{b_past_id}/pay",
        method="POST",
        data={"card_number": "4242424242424242", "expiry_month": 12, "expiry_year": 2030, "cvv": "123"},
        headers=traveler_headers
    )
    
    # Cancel (with reason)
    reason_encoded = urllib.parse.quote("Sickness")
    status, cancel_past_res = make_request(
        f"{API_URL}/api/bookings/{b_past_id}?cancel_reason={reason_encoded}",
        method="DELETE",
        headers=traveler_headers
    )
    if status != 200:
        print(f"FAILED: Cancelling booking failed: {cancel_past_res}")
        return
    print(f"Cancel Response: {cancel_past_res}")
    if cancel_past_res.get("refunded"):
        print(f"FAILED: Expected cancellation past deadline to be non-refundable.")
        return
    print("SUCCESS: Cancellation past window withheld deposit successfully.")
    
    # 10. Test Package Modification WITHIN deadline notification
    print("\n10. Testing Package Edit within window sends traveler chat notifications...")
    # Create booking within window (e.g. 15 days out)
    status, b_notif_res = make_request(
        f"{API_URL}/api/bookings",
        method="POST",
        data={
            "package_id": pkg_id,
            "num_travelers": 1,
            "travel_date": "2026-09-01"
        },
        headers=traveler_headers
    )
    b_notif_id = b_notif_res["id"]
    
    # Pay
    make_request(
        f"{API_URL}/api/bookings/{b_notif_id}/pay",
        method="POST",
        data={"card_number": "4242424242424242", "expiry_month": 12, "expiry_year": 2030, "cvv": "123"},
        headers=traveler_headers
    )
    
    # Agency updates package
    status, edit_res = make_request(
        f"{API_URL}/api/packages/agency/{pkg_id}",
        method="PATCH",
        data={"title": "Paradise Escape Deluxe"},
        headers=agency_headers
    )
    if status != 200:
        print(f"FAILED: Updating package failed: {edit_res}")
        return
    print("SUCCESS: Package updated directly.")
    
    # Retrieve traveler chats to verify system warning message was sent
    status, chats_res = make_request(
        f"{API_URL}/api/chat/conversations",
        method="GET",
        headers=traveler_headers
    )
    if status != 200:
        print(f"FAILED: Fetching chats failed: {chats_res}")
        return
        
    # Find active chat for this package
    conv_id = None
    for c in chats_res:
        if c["package_id"] == pkg_id:
            conv_id = c["id"]
            break
            
    if not conv_id:
        print("FAILED: No chat conversation was created for notification.")
        return
        
    status, msgs_res = make_request(
        f"{API_URL}/api/chat/conversations/{conv_id}/messages",
        method="GET",
        headers=traveler_headers
    )
    sys_msgs = [m for m in msgs_res if m["sender_role"] == "system"]
    if not sys_msgs:
        print("FAILED: No system message warning was found in traveler chat.")
        return
    print(f"System Message found: {sys_msgs[-1]['text']}")
    print("SUCCESS: Chat warning notification generated.")
    
    # 11. Test Package Locking PAST deadline
    print("\n11. Testing Package Locking past deadline...")
    # We have `b_past_id` which travel_date is 2026-06-11 (in 2 days, limit is 5 days). This booking is past refund window, and confirmed!
    # Even though booking status is cancelled now (we cancelled it in step 9), let's create a CONFIRMED booking past the deadline to lock the package.
    status, b_lock_res = make_request(
        f"{API_URL}/api/bookings",
        method="POST",
        data={
            "package_id": pkg_id,
            "num_travelers": 1,
            "travel_date": "2026-06-12"
        },
        headers=traveler_headers
    )
    b_lock_id = b_lock_res["id"]
    
    # Pay
    make_request(
        f"{API_URL}/api/bookings/{b_lock_id}/pay",
        method="POST",
        data={"card_number": "4242424242424242", "expiry_month": 12, "expiry_year": 2030, "cvv": "123"},
        headers=traveler_headers
    )
    
    # Now that there is a confirmed booking past the refund window, the package should be LOCKED.
    # Attempt direct update
    status, edit_fail_res = make_request(
        f"{API_URL}/api/packages/agency/{pkg_id}",
        method="PATCH",
        data={"title": "Paradise Escape - Attempt Locked Update"},
        headers=agency_headers
    )
    if status == 400:
        print(f"SUCCESS: Direct package update blocked. Message: {edit_fail_res['detail']}")
    else:
        print(f"FAILED: Package update was not blocked, got status {status}: {edit_fail_res}")
        return
        
    # Attempt deletion
    status, del_fail_res = make_request(
        f"{API_URL}/api/packages/agency/{pkg_id}",
        method="DELETE",
        headers=agency_headers
    )
    if status == 400:
        print(f"SUCCESS: Direct package deletion blocked. Message: {del_fail_res['detail']}")
    else:
        print(f"FAILED: Package deletion was not blocked, got status {status}: {del_fail_res}")
        return
        
    # 12. Test Support Ticketing and Admin Approval
    print("\n12. Submitting Compensation Ticket and Admin Approval...")
    # Submit ticket
    proposed_changes_json = json.dumps({"title": "Paradise Escapes Super Deluxe", "price": 1500.0})
    status, ticket_res = make_request(
        f"{API_URL}/api/packages/tickets",
        method="POST",
        data={
            "package_id": pkg_id,
            "ticket_type": "compensation_request",
            "subject": "Change Paradise Escape Title & Price",
            "description": "Requesting title update and price increase due to high resort rates.",
            "proposed_changes": proposed_changes_json,
            "compensation_offer": "We will provide all travelers with free Maldives snorkeling passes worth $100."
        },
        headers=agency_headers
    )
    if status != 201:
        print(f"FAILED: Creating ticket failed: {ticket_res}")
        return
    ticket_id = ticket_res["id"]
    print(f"SUCCESS: Compensation ticket filed (ID: {ticket_id}, Status: {ticket_res['status']}).")
    
    # Admin lists tickets
    status, tickets_res = make_request(
        f"{API_URL}/api/admin/tickets",
        method="GET",
        headers=admin_headers
    )
    if status != 200 or not any(t["id"] == ticket_id for t in tickets_res):
        print(f"FAILED: Admin could not retrieve new ticket in dashboard list: {tickets_res}")
        return
        
    # Admin approves the ticket
    status, action_res = make_request(
        f"{API_URL}/api/admin/tickets/{ticket_id}/action",
        method="PATCH",
        data={"action": "approve", "notes": "Snorkeling passes are acceptable compensation."},
        headers=admin_headers
    )
    if status != 200:
        print(f"FAILED: Admin action on ticket failed: {action_res}")
        return
    print("SUCCESS: Admin approved ticket.")
    
    # Check that package is updated with proposed changes!
    status, final_pkg_res = make_request(
        f"{API_URL}/api/packages/{pkg_id}",
        method="GET",
        headers=traveler_headers
    )
    print(f"Updated Package Title: {final_pkg_res['title']}, Price: {final_pkg_res['price']}")
    if final_pkg_res["title"] == "Paradise Escapes Super Deluxe" and abs(final_pkg_res["price"] - 1650.0) < 0.01:  # 1500 + 10% markup = 1650
        print("SUCCESS: Proposed changes successfully merged and saved to Package!")
    else:
        print(f"FAILED: Proposed changes were not applied to Package correctly.")
        return

    print("\n=== All Tests Passed Successfully! ===")

if __name__ == "__main__":
    run_tests()
