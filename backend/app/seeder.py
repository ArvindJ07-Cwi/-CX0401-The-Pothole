import json
import os
from sqlalchemy.orm import Session
from app.models import GeographicArea, User, ContractorServiceArea
from app.database import SessionLocal

def seed_geo_data():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(GeographicArea).first():
            return
            
        data_path = os.path.join(os.path.dirname(__file__), "geo_data.json")
        if not os.path.exists(data_path):
            print("Warning: geo_data.json not found")
            return
            
        with open(data_path, "r") as f:
            data = json.load(f)
            
        def process_node(name, node_info, parent_id, current_path):
            level = node_info.get("level")
            full_path = f"{current_path} > {name}" if current_path else name
            
            area = GeographicArea(
                name=name,
                level=level,
                parent_id=parent_id,
                full_path=full_path
            )
            db.add(area)
            db.flush() # get ID
            
            children = node_info.get("children", {})
            for child_name, child_info in children.items():
                process_node(child_name, child_info, area.id, full_path)
                
        for root_name, root_info in data.items():
            process_node(root_name, root_info, None, "")
            
        db.commit()
        
        # Migrate existing contractors
        contractors = db.query(User).filter(User.role == "contractor").all()
        for contractor in contractors:
            if contractor.service_area:
                # Find matching city (e.g. Pune City)
                search_name = f"{contractor.service_area} City"
                area = db.query(GeographicArea).filter(GeographicArea.name.ilike(search_name)).first()
                if area:
                    # check if not already linked
                    existing = db.query(ContractorServiceArea).filter_by(contractor_id=contractor.id, area_id=area.id).first()
                    if not existing:
                        svc = ContractorServiceArea(contractor_id=contractor.id, area_id=area.id)
                        db.add(svc)
        db.commit()
        
    finally:
        db.close()
