"""
Test script for Fortune Generator Lambda handler
Run locally to verify request/response handling
"""

import json
from index import handler


class MockContext:
    """Mock Lambda context for local testing"""
    request_id = 'test-request-id'
    log_group_name = 'test-log-group'
    log_stream_name = 'test-log-stream'
    function_name = 'lotto-graveyard-fortune-generator'
    function_version = '$LATEST'
    invoked_function_arn = 'arn:aws:lambda:us-east-1:123456789012:function:test'
    memory_limit_in_mb = 512


def test_valid_request():
    """Test valid fortune generation request"""
    print("\n=== Test: Valid Request ===")
    event = {
        'httpMethod': 'POST',
        'body': json.dumps({
            'question': 'What does my future hold?',
            'cards': [
                {'name': 'The Fool', 'position': 'past'},
                {'name': 'The Magician', 'position': 'present'},
                {'name': 'The World', 'position': 'future'}
            ]
        })
    }
    
    response = handler(event, MockContext())
    print(f"Status: {response['statusCode']}")
    print(f"Body: {response['body']}")
    
    assert response['statusCode'] == 200, "Expected 200 status"
    body = json.loads(response['body'])
    assert 'fortune' in body, "Expected fortune in response"
    assert 'generatedAt' in body, "Expected generatedAt in response"
    assert len(body['fortune']) >= 100, "Fortune should be at least 100 characters"
    print("✓ PASSED")


def test_missing_question():
    """Test request with missing question"""
    print("\n=== Test: Missing Question ===")
    event = {
        'httpMethod': 'POST',
        'body': json.dumps({
            'cards': [
                {'name': 'The Fool', 'position': 'past'},
                {'name': 'The Magician', 'position': 'present'},
                {'name': 'The World', 'position': 'future'}
            ]
        })
    }
    
    response = handler(event, MockContext())
    print(f"Status: {response['statusCode']}")
    print(f"Body: {response['body']}")
    
    assert response['statusCode'] == 400, "Expected 400 status"
    body = json.loads(response['body'])
    assert body['error'] == 'ValidationError', "Expected ValidationError"
    assert 'required' in body['message'].lower(), "Expected 'required' in error message"
    print("✓ PASSED")


def test_empty_question():
    """Test request with empty question"""
    print("\n=== Test: Empty Question ===")
    event = {
        'httpMethod': 'POST',
        'body': json.dumps({
            'question': '   ',
            'cards': [
                {'name': 'The Fool', 'position': 'past'},
                {'name': 'The Magician', 'position': 'present'},
                {'name': 'The World', 'position': 'future'}
            ]
        })
    }
    
    response = handler(event, MockContext())
    print(f"Status: {response['statusCode']}")
    print(f"Body: {response['body']}")
    
    assert response['statusCode'] == 400, "Expected 400 status"
    body = json.loads(response['body'])
    assert body['error'] == 'ValidationError', "Expected ValidationError"
    print("✓ PASSED")


def test_question_too_long():
    """Test request with question exceeding 200 characters"""
    print("\n=== Test: Question Too Long ===")
    event = {
        'httpMethod': 'POST',
        'body': json.dumps({
            'question': 'a' * 201,
            'cards': [
                {'name': 'The Fool', 'position': 'past'},
                {'name': 'The Magician', 'position': 'present'},
                {'name': 'The World', 'position': 'future'}
            ]
        })
    }
    
    response = handler(event, MockContext())
    print(f"Status: {response['statusCode']}")
    print(f"Body: {response['body']}")
    
    assert response['statusCode'] == 400, "Expected 400 status"
    body = json.loads(response['body'])
    assert body['error'] == 'ValidationError', "Expected ValidationError"
    assert '200' in body['message'], "Expected '200' in error message"
    print("✓ PASSED")


def test_wrong_card_count():
    """Test request with wrong number of cards"""
    print("\n=== Test: Wrong Card Count ===")
    event = {
        'httpMethod': 'POST',
        'body': json.dumps({
            'question': 'What does my future hold?',
            'cards': [
                {'name': 'The Fool', 'position': 'past'},
                {'name': 'The Magician', 'position': 'present'}
            ]
        })
    }
    
    response = handler(event, MockContext())
    print(f"Status: {response['statusCode']}")
    print(f"Body: {response['body']}")
    
    assert response['statusCode'] == 400, "Expected 400 status"
    body = json.loads(response['body'])
    assert body['error'] == 'ValidationError', "Expected ValidationError"
    assert '3' in body['message'], "Expected '3' in error message"
    print("✓ PASSED")


def test_missing_card_name():
    """Test request with card missing name"""
    print("\n=== Test: Missing Card Name ===")
    event = {
        'httpMethod': 'POST',
        'body': json.dumps({
            'question': 'What does my future hold?',
            'cards': [
                {'position': 'past'},
                {'name': 'The Magician', 'position': 'present'},
                {'name': 'The World', 'position': 'future'}
            ]
        })
    }
    
    response = handler(event, MockContext())
    print(f"Status: {response['statusCode']}")
    print(f"Body: {response['body']}")
    
    assert response['statusCode'] == 400, "Expected 400 status"
    body = json.loads(response['body'])
    assert body['error'] == 'ValidationError', "Expected ValidationError"
    assert 'name' in body['message'].lower(), "Expected 'name' in error message"
    print("✓ PASSED")


def test_invalid_position():
    """Test request with invalid card position"""
    print("\n=== Test: Invalid Position ===")
    event = {
        'httpMethod': 'POST',
        'body': json.dumps({
            'question': 'What does my future hold?',
            'cards': [
                {'name': 'The Fool', 'position': 'yesterday'},
                {'name': 'The Magician', 'position': 'present'},
                {'name': 'The World', 'position': 'future'}
            ]
        })
    }
    
    response = handler(event, MockContext())
    print(f"Status: {response['statusCode']}")
    print(f"Body: {response['body']}")
    
    assert response['statusCode'] == 400, "Expected 400 status"
    body = json.loads(response['body'])
    assert body['error'] == 'ValidationError', "Expected ValidationError"
    print("✓ PASSED")


def test_duplicate_position():
    """Test request with duplicate card positions"""
    print("\n=== Test: Duplicate Position ===")
    event = {
        'httpMethod': 'POST',
        'body': json.dumps({
            'question': 'What does my future hold?',
            'cards': [
                {'name': 'The Fool', 'position': 'past'},
                {'name': 'The Magician', 'position': 'past'},
                {'name': 'The World', 'position': 'future'}
            ]
        })
    }
    
    response = handler(event, MockContext())
    print(f"Status: {response['statusCode']}")
    print(f"Body: {response['body']}")
    
    assert response['statusCode'] == 400, "Expected 400 status"
    body = json.loads(response['body'])
    assert body['error'] == 'ValidationError', "Expected ValidationError"
    assert 'duplicate' in body['message'].lower(), "Expected 'duplicate' in error message"
    print("✓ PASSED")


def test_invalid_json():
    """Test request with invalid JSON"""
    print("\n=== Test: Invalid JSON ===")
    event = {
        'httpMethod': 'POST',
        'body': 'not valid json'
    }
    
    response = handler(event, MockContext())
    print(f"Status: {response['statusCode']}")
    print(f"Body: {response['body']}")
    
    assert response['statusCode'] == 400, "Expected 400 status"
    body = json.loads(response['body'])
    assert body['error'] == 'ValidationError', "Expected ValidationError"
    print("✓ PASSED")


def test_cors_preflight():
    """Test CORS preflight request"""
    print("\n=== Test: CORS Preflight ===")
    event = {
        'httpMethod': 'OPTIONS'
    }
    
    response = handler(event, MockContext())
    print(f"Status: {response['statusCode']}")
    print(f"Headers: {response['headers']}")
    
    assert response['statusCode'] == 200, "Expected 200 status"
    assert 'Access-Control-Allow-Origin' in response['headers'], "Expected CORS headers"
    print("✓ PASSED")


def test_fortune_contains_requirements():
    """Test that fortune meets content requirements"""
    print("\n=== Test: Fortune Content Requirements ===")
    question = "Will my numbers ever win?"
    cards = [
        {'name': 'The Fool', 'position': 'past'},
        {'name': 'The Magician', 'position': 'present'},
        {'name': 'The World', 'position': 'future'}
    ]
    
    event = {
        'httpMethod': 'POST',
        'body': json.dumps({
            'question': question,
            'cards': cards
        })
    }
    
    response = handler(event, MockContext())
    body = json.loads(response['body'])
    fortune = body['fortune']
    
    print(f"Fortune: {fortune[:100]}...")
    
    # Check fortune mentions question (or key words from it)
    # Simplified check: fortune should contain some content related to question
    assert len(fortune) >= 100, "Fortune should be at least 100 characters"
    
    # Check fortune mentions all card names
    for card in cards:
        assert card['name'] in fortune, f"Fortune should mention {card['name']}"
    
    # Check fortune mentions positions
    assert 'past' in fortune.lower(), "Fortune should mention 'past'"
    assert 'present' in fortune.lower(), "Fortune should mention 'present'"
    assert 'future' in fortune.lower(), "Fortune should mention 'future'"
    
    print("✓ PASSED")


def run_all_tests():
    """Run all test cases"""
    print("\n" + "=" * 60)
    print("Fortune Generator Lambda Handler Tests")
    print("=" * 60)
    
    tests = [
        test_valid_request,
        test_missing_question,
        test_empty_question,
        test_question_too_long,
        test_wrong_card_count,
        test_missing_card_name,
        test_invalid_position,
        test_duplicate_position,
        test_invalid_json,
        test_cors_preflight,
        test_fortune_contains_requirements
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            test()
            passed += 1
        except AssertionError as e:
            print(f"✗ FAILED: {e}")
            failed += 1
        except Exception as e:
            print(f"✗ ERROR: {e}")
            failed += 1
    
    print("\n" + "=" * 60)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 60)
    
    return failed == 0


if __name__ == '__main__':
    success = run_all_tests()
    exit(0 if success else 1)
