import os, json
from openai import OpenAI
from typing import Dict
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_quote_data() -> Dict[str, str]:
    system_prompt = """Generate a powerful and original motivational quote that inspires people.
    The quote should be concise, emotionally uplifting, and suitable for a wide audience.
    Return the result in the following JSON format:
        {
            "quote": "the motivational quote text",
            "author": "author name"
        }
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "Generate a motivational quote"}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        quote_data = json.loads(str(content))
        return quote_data


    except Exception as e:
        print(e)
        return {"quote": "Something",
                "author": "Winnie the Pooh"}