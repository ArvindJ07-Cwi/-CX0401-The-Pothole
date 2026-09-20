from app.database import SessionLocal
from app.models import User, Complaint, Assignment
from app.auth import get_password_hash
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient
from app.main import app

def setup_test_data(db: Session):
    db.query(Assignment).delete()
    db.query(Complaint).delete()
    db.query(User).delete()

    auth = User(name="Auth", email="auth@test.com", password_hash=get_password_hash("test"), role="authority")
    cit = User(name="Cit", email="cit@test.com", password_hash=get_password_hash("test"), role="citizen")
    con_pune = User(name="Pune Con", email="conpune@test.com", password_hash=get_password_hash("test"), role="contractor", service_area="Pune")
    con_mumbai = User(name="Mumbai Con", email="conmumbai@test.com", password_hash=get_password_hash("test"), role="contractor", service_area="Mumbai")
    
    db.add_all([auth, cit, con_pune, con_mumbai])
    db.commit()
    
    comp_pune = Complaint(citizen_id=cit.id, title="Pothole in Pune", description="Bad", address="Shivaji Nagar, Pune", severity="medium")
    db.add(comp_pune)
    db.commit()
    
    return auth, comp_pune, con_pune, con_mumbai

def test_service_area():
    db = SessionLocal()
    auth, comp, con_pune, con_mumbai = setup_test_data(db)
    
    client = TestClient(app)
    # Login authority
    resp = client.post("/api/auth/login", data={"username": "auth@test.com", "password": "test"})
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Assign to matching contractor (Pune)
    resp = client.post(f"/api/complaints/{comp.id}/assign", json={"contractor_id": con_pune.id}, headers=headers)
    assert resp.status_code == 200, f"Expected success for matching area, got: {resp.json()}"
    
    # Try assigning to mismatching contractor (Mumbai)
    resp = client.post(f"/api/complaints/{comp.id}/assign", json={"contractor_id": con_mumbai.id}, headers=headers)
    assert resp.status_code == 400, f"Expected 400 for mismatching area, got: {resp.status_code}"
    assert "does not match complaint location" in resp.json()["detail"]
    
    print("Service area validation tests passed.")

if __name__ == "__main__":
    test_service_area()
