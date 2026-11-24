"""
Fortune Generator Lambda Function
Generates AI-powered tarot fortune interpretations

This Lambda function accepts requests with:
- question: User's question (1-200 characters)
- cards: Array of 3 cards with name and position

Returns:
- fortune: Generated fortune text (>= 100 characters)
- generatedAt: ISO 8601 timestamp
"""

import json
import os
from datetime import datetime
import boto3
from botocore.exceptions import ClientError, BotoCoreError


def handler(event, context):
    """
    Lambda handler for fortune generation
    
    Request Schema:
    {
        "question": "string (1-200 chars)",
        "cards": [
            {"name": "string", "position": "past"},
            {"name": "string", "position": "present"},
            {"name": "string", "position": "future"}
        ]
    }
    
    Response Schema (Success - 200):
    {
        "fortune": "string (>= 100 chars)",
        "generatedAt": "ISO 8601 timestamp"
    }
    
    Response Schema (Error - 400/500):
    {
        "error": "ValidationError | ServerError",
        "message": "string"
    }
    
    Args:
        event: Lambda event object containing request data
        context: Lambda context object
    
    Returns:
        dict: HTTP response with fortune or error
    """
    
    # Handle CORS preflight (OPTIONS request)
    if event.get('httpMethod') == 'OPTIONS' or event.get('requestContext', {}).get('http', {}).get('method') == 'OPTIONS':
        return cors_response(200, {})
    
    # Parse request body
    try:
        body = parse_request_body(event)
    except ValueError as e:
        return error_response(400, str(e))
    
    # Validate input
    try:
        question, cards = validate_request(body)
    except ValueError as e:
        return error_response(400, str(e))
    
    # Generate fortune using AI
    try:
        fortune = generate_fortune(question, cards)
        
        # Validate fortune meets minimum length requirement (>= 100 characters)
        if len(fortune) < 100:
            raise ValueError('Generated fortune too short')
        
        return success_response(fortune)
        
    except ValueError as e:
        print(f'Fortune validation error: {str(e)}')
        return error_response(500, 'Fortune generation failed')
    except Exception as e:
        print(f'Fortune generation error: {str(e)}')
        return error_response(500, 'Fortune generation failed')


def parse_request_body(event):
    """
    Parse request body from Lambda event
    
    Args:
        event: Lambda event object
    
    Returns:
        dict: Parsed request body
    
    Raises:
        ValueError: If JSON is invalid
    """
    body = event.get('body', '{}')
    
    # Handle base64 encoded body if present
    if event.get('isBase64Encoded', False):
        import base64
        body = base64.b64decode(body).decode('utf-8')
    
    try:
        return json.loads(body)
    except json.JSONDecodeError:
        raise ValueError('Invalid JSON in request body')


def validate_request(body):
    """
    Validate request body contains required fields with correct types and values
    
    Args:
        body: Parsed request body
    
    Returns:
        tuple: (question, cards) validated data
    
    Raises:
        ValueError: If validation fails
    """
    # Validate question
    question = body.get('question')
    
    if not question:
        raise ValueError('Question is required')
    
    if not isinstance(question, str):
        raise ValueError('Question must be a string')
    
    # Strip whitespace for validation
    question_trimmed = question.strip()
    
    if len(question_trimmed) == 0:
        raise ValueError('Question cannot be empty')
    
    if len(question) > 200:
        raise ValueError('Question must be 200 characters or less')
    
    # Validate cards
    cards = body.get('cards')
    
    if not cards:
        raise ValueError('Cards are required')
    
    if not isinstance(cards, list):
        raise ValueError('Cards must be an array')
    
    if len(cards) != 3:
        raise ValueError('Must provide exactly 3 cards')
    
    # Validate each card
    valid_positions = {'past', 'present', 'future'}
    positions_seen = set()
    
    for i, card in enumerate(cards):
        if not isinstance(card, dict):
            raise ValueError(f'Card {i + 1} must be an object')
        
        name = card.get('name')
        position = card.get('position')
        
        if not name:
            raise ValueError(f'Card {i + 1} must have a name')
        
        if not isinstance(name, str):
            raise ValueError(f'Card {i + 1} name must be a string')
        
        if not position:
            raise ValueError(f'Card {i + 1} must have a position')
        
        if position not in valid_positions:
            raise ValueError(f'Card {i + 1} position must be past, present, or future')
        
        if position in positions_seen:
            raise ValueError(f'Duplicate position: {position}')
        
        positions_seen.add(position)
    
    return question, cards


def generate_fortune(question, cards):
    """
    Generate AI-powered fortune using AWS Bedrock
    
    Args:
        question: User's question (1-200 characters)
        cards: Array of 3 card objects with 'name' and 'position' keys
    
    Returns:
        str: Generated fortune text (>= 100 characters)
    
    Raises:
        ValueError: If fortune is too short or invalid
        ClientError: If AWS Bedrock API fails
        Exception: For other generation errors
    """
    # Create card lookup by position
    card_lookup = {card['position']: card['name'] for card in cards}
    
    # Build AI prompt
    prompt = build_fortune_prompt(question, card_lookup)
    
    # Call AWS Bedrock with retry logic
    max_retries = 2
    last_error = None
    
    for attempt in range(max_retries + 1):
        try:
            fortune = call_bedrock_claude(prompt)
            
            # Validate fortune content
            if len(fortune) < 100:
                raise ValueError(f'Generated fortune too short: {len(fortune)} characters')
            
            # Ensure fortune mentions key elements (requirements 8.5, 8.6, 8.7)
            fortune_lower = fortune.lower()
            if not any(card['name'].lower() in fortune_lower for card in cards):
                raise ValueError('Fortune must mention at least one card name')
            
            return fortune
            
        except (ClientError, BotoCoreError) as e:
            last_error = e
            print(f'AWS Bedrock error (attempt {attempt + 1}/{max_retries + 1}): {str(e)}')
            if attempt < max_retries:
                # Simple retry without exponential backoff (Lambda handles timeout)
                continue
            else:
                raise Exception(f'AI service failed after {max_retries + 1} attempts') from e
        except Exception as e:
            # Don't retry on validation or unexpected errors
            raise
    
    # This should never be reached due to raise in loop, but for safety
    if last_error:
        raise Exception('AI service failed') from last_error
    raise Exception('AI service failed')


def build_fortune_prompt(question, card_lookup):
    """
    Build the AI prompt for fortune generation
    
    Args:
        question: User's question
        card_lookup: Dictionary mapping position to card name
    
    Returns:
        str: Formatted prompt for AI model
    """
    prompt = f"""You are a mystical tarot reader interpreting a three-card spread in the style of 1909 Rider-Waite symbolism.

User's Question: "{question}"

Cards Drawn:
- Past: {card_lookup['past']}
- Present: {card_lookup['present']}
- Future: {card_lookup['future']}

Provide a cohesive interpretation that:
1. Addresses the user's question directly
2. Explains the significance of each card in its position (past, present, future)
3. Weaves the three cards into a narrative connecting past influences, present circumstances, and future potential
4. Uses evocative, mystical language befitting the Rider-Waite tradition
5. Is at least 150 words (minimum 100 characters required)

Generate the fortune as a single cohesive narrative without headings or sections:"""
    
    return prompt


def call_bedrock_claude(prompt):
    """
    Call AWS Bedrock with Claude model to generate fortune
    
    Args:
        prompt: The formatted prompt for the AI model
    
    Returns:
        str: Generated fortune text
    
    Raises:
        ClientError: If AWS API call fails
        ValueError: If response format is invalid
    """
    # Initialize Bedrock client
    bedrock = boto3.client(
        service_name='bedrock-runtime',
        region_name=os.environ.get('AWS_REGION', 'us-east-1')
    )
    
    # Use Claude 3 Haiku for cost-effective generation
    # Can be configured via environment variable
    model_id = os.environ.get('BEDROCK_MODEL_ID', 'anthropic.claude-3-haiku-20240307-v1:0')
    
    # Prepare request body for Claude model
    request_body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1000,
        "temperature": 0.8,  # Higher temperature for more creative, mystical responses
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }
    
    try:
        # Invoke the model
        response = bedrock.invoke_model(
            modelId=model_id,
            body=json.dumps(request_body)
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        
        # Extract fortune text from Claude response
        if 'content' in response_body and len(response_body['content']) > 0:
            fortune = response_body['content'][0]['text'].strip()
            return fortune
        else:
            raise ValueError('Invalid response format from AI model')
            
    except ClientError as e:
        error_code = e.response.get('Error', {}).get('Code', 'Unknown')
        print(f'AWS Bedrock ClientError: {error_code} - {str(e)}')
        raise
    except Exception as e:
        print(f'Unexpected error calling Bedrock: {str(e)}')
        raise


def generate_fortune_placeholder(question, cards):
    """
    Placeholder fortune generator
    DEPRECATED: Replaced by generate_fortune() in task 10.2
    Kept for reference only
    
    Args:
        question: User's question
        cards: Array of 3 card objects
    
    Returns:
        str: Generated fortune text (>= 100 characters)
    """
    # Create card lookup by position
    card_lookup = {card['position']: card['name'] for card in cards}
    
    fortune = f"""Your question "{question}" is reflected in the cards before you.

In the past, {card_lookup['past']} suggests the foundation from which you come. This card reveals the influences and experiences that have shaped your current path.

In the present, {card_lookup['present']} illuminates your current situation. This card shows the energies and circumstances that surround you now.

Looking to the future, {card_lookup['future']} offers guidance on what may come. This card hints at the potential outcomes and lessons that await.

[Note: This is a placeholder fortune. AI-generated fortunes will be implemented in task 10.2]"""
    
    return fortune


def success_response(fortune):
    """
    Generate successful fortune response
    
    Args:
        fortune: Generated fortune text
    
    Returns:
        dict: HTTP response object
    """
    return {
        'statusCode': 200,
        'headers': get_cors_headers(),
        'body': json.dumps({
            'fortune': fortune,
            'generatedAt': datetime.utcnow().isoformat() + 'Z'
        })
    }


def error_response(status_code, message):
    """
    Generate error response with CORS headers
    
    Args:
        status_code: HTTP status code (400 or 500)
        message: Error message
    
    Returns:
        dict: HTTP response object
    """
    error_type = 'ValidationError' if status_code == 400 else 'ServerError'
    
    return {
        'statusCode': status_code,
        'headers': get_cors_headers(),
        'body': json.dumps({
            'error': error_type,
            'message': message
        })
    }


def cors_response(status_code, body):
    """
    Generate CORS preflight response
    
    Args:
        status_code: HTTP status code
        body: Response body
    
    Returns:
        dict: HTTP response object
    """
    return {
        'statusCode': status_code,
        'headers': get_cors_headers(),
        'body': json.dumps(body) if body else ''
    }


def get_cors_headers():
    """
    Get CORS headers for all responses
    
    Returns:
        dict: CORS headers
    """
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',  # TODO: Configure specific domain in production
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }
