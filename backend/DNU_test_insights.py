#!/usr/bin/env python
"""
Test script for insights.py to validate that action items, insights, and feedback are generated correctly.
"""

import sys
import os
import time

# Add the parent directory to the path so we can import services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the generate_ai_insights function
from services.insights import generate_ai_insights

def test_insights_generation():
    """Test the generate_ai_insights function with a sample transcript."""
    print("Testing insights generation with simple test transcript...")
    
    # Simple test transcript that should generate insights, action items, and feedback
    test_transcript = """
    Speaker1: Welcome everyone to our meeting about the recipe generation project.
    Speaker2: Thanks for having us. So we're using a large language model to generate recipes from HTML input, but we're hitting token limits.
    Speaker1: What's the current limit you're hitting?
    Speaker2: The maximum context is 28,000 tokens, and our HTML is too large.
    Speaker1: Could you cut the HTML in half?
    Speaker2: That's what I did, and it seems to be working better now.
    Speaker1: Are you concerned about the SVG icons causing issues with the Markdown output?
    Speaker2: Yes, I think they might be interfering with the model's ability to generate clean output.
    Speaker1: Have you considered using a different recipe?
    Speaker2: That's a good suggestion. This one might have too many tokens.
    Speaker3: I can help troubleshoot the issue if you want, just let me know.
    Speaker2: Thanks, I'll reach out if I need assistance.
    Speaker1: Let's run the model again with the changes and see what happens.
    Speaker2: I'm optimistic it won't error out, but I'm not sure if it will provide a useful output.
    Speaker1: If it works, what's the next step?
    Speaker2: I'll extract the ingredients, steps, time, and effort from the generated text.
    Speaker1: Any other recipes you're considering as alternatives?
    Speaker2: I'm open to suggestions if you have any that might be more suitable.
    """
    
    try:
        # Call the function with the test transcript
        start_time = time.time()
        result = generate_ai_insights(test_transcript)
        end_time = time.time()
        
        print(f"Insights generation completed in {end_time - start_time:.2f} seconds.")
        
        # Print the results
        print("\n=== SUMMARY ===")
        print(result.summary or "No summary generated.")
        
        print("\n=== ACTION ITEMS ===")
        if result.action_items and len(result.action_items) > 0:
            for i, item in enumerate(result.action_items, 1):
                print(f"{i}. {item}")
        else:
            print("No action items generated.")
        
        print("\n=== OTHER INSIGHTS (Topic Analysis & Feedback) ===")
        print(result.other_insights or "No other insights generated.")
        
        # Validate the results
        validation_results = []
        if not result.summary:
            validation_results.append("❌ Summary is missing")
        else:
            validation_results.append("✅ Summary generated")
            
        if not result.action_items or len(result.action_items) == 0:
            validation_results.append("❌ Action items are missing")
        else:
            validation_results.append(f"✅ {len(result.action_items)} action items generated")
            
        if not result.other_insights:
            validation_results.append("❌ Topic Analysis/Feedback is missing")
        else:
            # Check if both topic analysis and feedback are present
            has_topic_analysis = "Topic Analysis:" in result.other_insights
            has_feedback = "Feedback/Insights:" in result.other_insights
            
            if has_topic_analysis and has_feedback:
                validation_results.append("✅ Both Topic Analysis and Feedback sections generated")
            elif has_topic_analysis:
                validation_results.append("⚠️ Topic Analysis generated but Feedback is missing")
            elif has_feedback:
                validation_results.append("⚠️ Feedback generated but Topic Analysis is missing")
            else:
                validation_results.append("❌ Neither Topic Analysis nor Feedback sections found")
        
        print("\n=== VALIDATION RESULTS ===")
        for result in validation_results:
            print(result)
            
    except Exception as e:
        print(f"Error testing insights generation: {e}")

if __name__ == "__main__":
    test_insights_generation() 