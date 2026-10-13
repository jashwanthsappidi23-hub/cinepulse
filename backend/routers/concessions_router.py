from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import ConcessionItem

router = APIRouter(prefix="/api/concessions", tags=["Concessions / F&B"])

@router.get("")
def list_concession_items(category: str = None, db: Session = Depends(get_db)):
    query = db.query(ConcessionItem).filter(ConcessionItem.is_active == True)
    if category and category.lower() != "all":
        query = query.filter(ConcessionItem.category.ilike(f"%{category.strip()}%"))

    items = query.order_by(ConcessionItem.price.asc()).all()
    return [
        {
            "item_id": it.item_id,
            "item_name": it.item_name,
            "category": it.category,
            "price": float(it.price),
            "stock_quantity": it.stock_quantity,
            "image_url": it.image_url,
            "is_in_stock": it.stock_quantity > 0
        }
        for it in items
    ]

@router.get("/categories")
def list_concession_categories(db: Session = Depends(get_db)):
    cats = db.query(ConcessionItem.category).filter(ConcessionItem.is_active == True).distinct().all()
    return sorted([c[0] for c in cats])
