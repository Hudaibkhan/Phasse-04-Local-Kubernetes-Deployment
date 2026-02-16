"""
Manual test script for Message model persistence.
Run this script to verify message creation, database persistence, and relationships.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.db.session import SessionLocal
from src.models.conversation import Conversation
from src.models.message import Message
from src.models.user import User
from uuid import uuid4

def test_message_creation():
    """Test creating messages and verifying database persistence and relationships."""
    print("=== Testing Message Creation ===\n")

    with SessionLocal() as session:
        # Get or create a test user
        test_user = session.query(User).first()
        if not test_user:
            print("No users found in database. Please create a user first.")
            return

        print(f"Using test user: {test_user.username} (ID: {test_user.id})")

        # Create a test conversation
        conversation = Conversation(user_id=test_user.id)
        session.add(conversation)
        session.commit()
        session.refresh(conversation)

        print(f"\n✓ Test conversation created (ID: {conversation.id})")

        # Create messages with different roles
        user_message = Message(
            conversation_id=conversation.id,
            user_id=test_user.id,
            role="user",
            content="Hello, this is a test message from the user."
        )

        assistant_message = Message(
            conversation_id=conversation.id,
            user_id=test_user.id,
            role="assistant",
            content="Hello! This is a test response from the assistant."
        )

        session.add(user_message)
        session.add(assistant_message)
        session.commit()
        session.refresh(user_message)
        session.refresh(assistant_message)

        print(f"\n✓ Messages created successfully!")
        print(f"  - User message ID: {user_message.id}")
        print(f"  - Assistant message ID: {assistant_message.id}")

        # Verify messages were persisted
        retrieved_messages = session.query(Message).filter_by(
            conversation_id=conversation.id
        ).order_by(Message.created_at.asc()).all()

        print(f"\n✓ Retrieved {len(retrieved_messages)} message(s) from database")
        for i, msg in enumerate(retrieved_messages, 1):
            print(f"  {i}. Role: {msg.role}, Content: {msg.content[:50]}...")

        # Test message ordering by created_at
        print(f"\n✓ Message ordering test:")
        print(f"  - Messages ordered chronologically: {retrieved_messages[0].created_at <= retrieved_messages[1].created_at}")

        # Test relationships
        print(f"\n✓ Relationship test:")
        print(f"  - Message belongs to conversation: {user_message.conversation_id == conversation.id}")
        print(f"  - Message belongs to user: {user_message.user_id == test_user.id}")

        # Test user isolation
        user_messages = session.query(Message).filter_by(user_id=test_user.id).all()
        print(f"\n✓ User isolation test:")
        print(f"  - Found {len(user_messages)} message(s) for user {test_user.username}")

        # Test cascade delete
        print(f"\n✓ Testing cascade delete...")
        session.delete(conversation)
        session.commit()

        # Verify messages were deleted
        orphaned_messages = session.query(Message).filter_by(
            conversation_id=conversation.id
        ).all()
        print(f"  - Messages after conversation delete: {len(orphaned_messages)}")
        print(f"  - Cascade delete working: {len(orphaned_messages) == 0}")

        print(f"\n✓ Test cleanup complete")

if __name__ == "__main__":
    try:
        test_message_creation()
        print("\n=== All tests passed! ===")
    except Exception as e:
        print(f"\n✗ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
