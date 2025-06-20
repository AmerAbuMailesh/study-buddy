import os, json
from openai import OpenAI
from typing import Dict
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_quote_data() -> Dict[str, str]:
    system_prompt = """You are a quote generator that provides diverse, inspiring quotes from various sources including:
    - Historical figures and leaders
    - Philosophers and thinkers
    - Scientists and inventors
    - Artists and writers
    - Athletes and performers
    - Fictional characters from literature, movies, and TV shows
    
    Always provide real, existing quotes with accurate attribution. Vary the themes, time periods, and sources.
    Return the result in the following JSON format:
        {
            "quote": "the motivational quote text",
            "author": "author name"
        }
    """

    # Create more varied user prompts
    user_prompts = [
        "Give me an inspiring quote about perseverance",
        "Share a motivational quote about success",
        "Provide a quote about learning and growth",
        "Give me a quote about courage and bravery",
        "Share a quote about creativity and innovation",
        "Provide a quote about friendship and relationships",
        "Give me a quote about wisdom and knowledge",
        "Share a quote about dreams and aspirations",
        "Provide a quote about change and transformation",
        "Give me a quote about leadership and influence"
    ]
    
    import random
    user_prompt = random.choice(user_prompts)

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Fixed model name
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.9,  # Increased for more variety
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        quote_data = json.loads(str(content))
        return quote_data


    except Exception as e:
        print(e)
        return {"quote": "Something",
                "author": "Winnie the Pooh"}