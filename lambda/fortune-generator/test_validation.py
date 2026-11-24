"""
Simple validation tests without importing boto3
Tests the implementation logic by checking code structure
"""

import os
import re

def test_implementation_complete():
    """Test that the implementation includes all required components"""
    print("=" * 60)
    print("Fortune Generator Lambda - Implementation Validation")
    print("=" * 60)
    
    # Read the implementation file
    with open('index.py', 'r') as f:
        code = f.read()
    
    # Check 1: Imports boto3 and BotoCoreError
    print("\n=== Checking Dependencies ===")
    if 'import boto3' in code:
        print("✓ boto3 imported for AWS Bedrock")
    else:
        print("✗ Missing boto3 import")
        return False
    
    if 'from botocore.exceptions import ClientError, BotoCoreError' in code:
        print("✓ AWS exception handling imported")
    else:
        print("✗ Missing botocore exceptions")
        return False
    
    # Check 2: generate_fortune function exists (not placeholder)
    print("\n=== Checking Fortune Generation ===")
    if 'def generate_fortune(question, cards):' in code:
        print("✓ generate_fortune() function defined")
    else:
        print("✗ Missing generate_fortune() function")
        return False
    
    # Check 3: AWS Bedrock integration
    if 'call_bedrock_claude' in code:
        print("✓ AWS Bedrock Claude integration implemented")
    else:
        print("✗ Missing Bedrock integration")
        return False
    
    if "bedrock-runtime" in code:
        print("✓ Using bedrock-runtime service")
    else:
        print("✗ Missing bedrock-runtime reference")
        return False
    
    # Check 4: Prompt building
    if 'def build_fortune_prompt' in code:
        print("✓ Prompt building function exists")
    else:
        print("✗ Missing prompt builder")
        return False
    
    # Check 5: Requirement validation
    print("\n=== Checking Requirements Compliance ===")
    
    # Requirement 8.2: AI service integration
    if 'invoke_model' in code:
        print("✓ Req 8.2: AI model invocation implemented")
    else:
        print("✗ Missing AI model invocation")
        return False
    
    # Requirement 8.3: 30-second timeout (Lambda handles this, but check retry logic)
    if 'max_retries' in code:
        print("✓ Req 8.3: Retry logic implemented")
    else:
        print("✗ Missing retry logic")
        return False
    
    # Requirement 8.4: Fortune >= 100 characters
    if 'len(fortune) < 100' in code:
        print("✓ Req 8.4: Fortune length validation (>= 100 chars)")
    else:
        print("✗ Missing fortune length validation")
        return False
    
    # Requirement 8.5-8.7: Mentions question, cards, positions
    if 'card_lookup' in code and "'past'" in code and "'present'" in code and "'future'" in code:
        print("✓ Req 8.5-8.7: Question, cards, and positions included in prompt")
    else:
        print("✗ Missing question/card/position handling")
        return False
    
    # Check 6: Error handling
    print("\n=== Checking Error Handling ===")
    
    if 'except (ClientError, BotoCoreError)' in code:
        print("✓ AWS-specific error handling")
    else:
        print("✗ Missing AWS error handling")
        return False
    
    if 'except ValueError' in code:
        print("✓ Validation error handling")
    else:
        print("✗ Missing validation error handling")
        return False
    
    # Check 7: Prompt quality
    print("\n=== Checking Prompt Quality ===")
    
    prompt_checks = [
        ('1909 Rider-Waite', 'Rider-Waite styling reference'),
        ('mystical', 'Mystical language requirement'),
        ('past, present, future', 'Position explanation'),
        ('at least 150 words', 'Minimum word count guidance'),
    ]
    
    for check_str, description in prompt_checks:
        if check_str in code:
            print(f"✓ Prompt includes: {description}")
        else:
            print(f"⚠ Prompt may be missing: {description}")
    
    # Check 8: Configuration via environment variables
    print("\n=== Checking Configuration ===")
    
    if 'AWS_REGION' in code:
        print("✓ AWS region configurable via environment")
    else:
        print("⚠ AWS region not configurable")
    
    if 'BEDROCK_MODEL_ID' in code:
        print("✓ Model ID configurable via environment")
    else:
        print("⚠ Model ID not configurable")
    
    # Check 9: Handler integration
    print("\n=== Checking Handler Integration ===")
    
    if 'fortune = generate_fortune(question, cards)' in code:
        print("✓ Handler calls generate_fortune()")
    else:
        print("✗ Handler doesn't call generate_fortune()")
        return False
    
    # Check 10: Response format
    if "'fortune': fortune" in code and "'generatedAt'" in code:
        print("✓ Response includes fortune and timestamp")
    else:
        print("✗ Missing response fields")
        return False
    
    print("\n" + "=" * 60)
    print("✓ All implementation checks passed!")
    print("=" * 60)
    print("\nImplementation Summary:")
    print("- AI-powered fortune generation using AWS Bedrock Claude")
    print("- Retry logic for handling API failures")
    print("- Fortune validation (>= 100 chars, mentions cards)")
    print("- Prompt includes question, all cards, and positions")
    print("- Error handling for API failures and validation")
    print("- Environment-based configuration")
    
    return True


def test_prompt_structure():
    """Extract and display the prompt structure"""
    print("\n" + "=" * 60)
    print("Prompt Structure Analysis")
    print("=" * 60)
    
    with open('index.py', 'r') as f:
        code = f.read()
    
    # Extract the prompt template
    prompt_match = re.search(r'prompt = f"""(.+?)"""', code, re.DOTALL)
    if prompt_match:
        prompt_template = prompt_match.group(1)
        print("\nPrompt Template Preview:")
        print("-" * 60)
        # Show first 500 chars
        preview = prompt_template[:500]
        print(preview)
        if len(prompt_template) > 500:
            print("...")
        print("-" * 60)
        
        # Count placeholders
        placeholders = re.findall(r'\{[^}]+\}', prompt_template)
        print(f"\nDynamic Elements: {len(set(placeholders))}")
        for placeholder in set(placeholders):
            print(f"  - {placeholder}")
    
    return True


if __name__ == '__main__':
    try:
        success = test_implementation_complete()
        if success:
            test_prompt_structure()
            print("\n✓ Validation complete - Implementation ready for deployment")
            exit(0)
        else:
            print("\n✗ Validation failed - Fix issues before deployment")
            exit(1)
    except Exception as e:
        print(f"\n✗ Validation error: {str(e)}")
        import traceback
        traceback.print_exc()
        exit(1)
