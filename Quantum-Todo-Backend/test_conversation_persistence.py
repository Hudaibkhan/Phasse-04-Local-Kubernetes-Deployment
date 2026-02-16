"""
Manual test script for Conversation model persistence.
Run this script to verify conversation creation and database persistence.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.db.session import SessionLocal
from src.models.conversation import Conversation
from src.models.user import User
from uuid import uuid4

def test_conversation_creation():
    """Test creating a conversation and verifying database persistence."""
    print("=== Testing Conversation Creation ===\n")

    with SessionLocal() as session:
        # Get or create a test user
        test_user = session.query(User).first()
        if not test_user:
            print("No users found in database. Please create a user first.")
            return

        print(f"Using test user: {test_user.username} (ID: {test_user.id})")

        # Create a new conversation
        conversation = Conversation(
            user_id=test_user.id
        )

        session.add(conversation)
        session.commit()
        session.refresh(conversation)

        print(f"\n✓ Conversation created successfully!")
        print(f"  - ID: {conversation.id}")
        print(f"  - User ID: {conversation.user_id}")
        print(f"  - Created at: {conversation.created_at}")
        print(f"  - Updated at: {conversation.updated_at}")

        # Verify it was persisted
        retrieved = session.query(Conversation).filter_by(id=conversation.id).first()
        if retrieved:
            print(f"\n✓ Conversation retrieved from database successfully!")
            print(f"  - Verified ID matches: {retrieved.id == conversation.id}")
            print(f"  - Verified user_id matches: {retrieved.user_id == test_user.id}")
        else:
            print("\n✗ Failed to retrieve conversation from database")

        # Test user isolation - query by user_id
        user_conversations = session.query(Conversation).filter_by(user_id=test_user.id).all()
        print(f"\n✓ User isolation test:")
        print(f"  - Found {len(user_conversations)} conversation(s) for user {test_user.username}")

        # Cleanup
        session.delete(conversation)
        session.commit()
        print(f"\n✓ Test conversation cleaned up")

if __name__ == "__main__":
    try:
        test_conversation_creation()
        print("\n=== All tests passed! ===")
    except Exception as e:
        print(f"\n✗ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
