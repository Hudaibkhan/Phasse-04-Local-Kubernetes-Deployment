from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from sqlmodel import Session, select
from ..db.session import get_session
from ..models.tag import Tag, TagCreate, TagUpdate, TagRead
from ..models.user import User
from ..middleware.auth import get_current_user_id

router = APIRouter(prefix="/tags", tags=["tags"])


@router.post("/", response_model=TagRead)
def create_tag(
    *,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(get_current_user_id),
    tag: TagCreate
):
    """Create a new tag for the current user."""
    from uuid import UUID
    user_id = UUID(current_user_id)

    # Create tag with all required fields explicitly
    db_tag = Tag(
        name=tag.name,
        color=tag.color if tag.color else "gray",
        user_id=user_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    session.add(db_tag)
    session.commit()
    session.refresh(db_tag)
    return db_tag


@router.get("/", response_model=List[TagRead])
def read_tags(
    *,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(get_current_user_id),
    offset: int = 0,
    limit: int = 100
):
    """Retrieve tags for the current user."""
    from uuid import UUID
    user_id = UUID(current_user_id)

    tags = session.exec(
        select(Tag).where(Tag.user_id == user_id).offset(offset).limit(limit)
    ).all()
    return tags


@router.get("/{tag_id}", response_model=TagRead)
def read_tag(
    *,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(get_current_user_id),
    tag_id: str  # Using str to handle UUID
):
    """Get a specific tag by ID."""
    from uuid import UUID
    user_id = UUID(current_user_id)

    tag = session.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    if tag.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return tag


@router.put("/{tag_id}", response_model=TagRead)
def update_tag(
    *,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(get_current_user_id),
    tag_id: str,  # Using str to handle UUID
    tag: TagUpdate
):
    """Update a specific tag by ID."""
    from uuid import UUID
    user_id = UUID(current_user_id)

    db_tag = session.get(Tag, tag_id)
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    if db_tag.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    update_data = tag.model_dump(exclude_unset=True)
    db_tag.sqlmodel_update(update_data)
    session.add(db_tag)
    session.commit()
    session.refresh(db_tag)
    return db_tag


@router.delete("/{tag_id}")
def delete_tag(
    *,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(get_current_user_id),
    tag_id: str  # Using str to handle UUID
):
    """Delete a specific tag by ID."""
    from uuid import UUID
    user_id = UUID(current_user_id)

    tag = session.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    if tag.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    session.delete(tag)
    session.commit()
    return {"message": "Tag deleted successfully"}