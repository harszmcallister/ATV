import os
import json
from pydantic import BaseModel, Field
from typing import List
from google import genai
from google.genai import types

class MicroScene(BaseModel):
    step_id: int = Field(..., description="Sequential chunk ID across the timeline.")
    start_time_seconds: float = Field(..., description="Start timestamp for this specific caption chunk.")
    end_time_seconds: float = Field(..., description="End timestamp for this specific caption chunk.")
    spoken_phrase: str = Field(..., description="The exact transcription text in its native original language script.")
    visible_animals: List[str] = Field(..., description="List of animal filenames.")
    selected_stickman_pose: str = Field(..., description="Filename of the stickman pose.")
    text_overlay: str = Field(..., description="The exact words in its native original language script to display on screen.")

class AnimalComparison(BaseModel):
    topic_name: str = Field(..., description="E.g., 'Frog vs Toad'")
    item_a_title_en: str = Field(..., description="Title of the first item in English (e.g., 'Frog')")
    item_a_title_te: str = Field(..., description="Title of the first item in Telugu (e.g., 'కప్ప')")
    item_b_title_en: str = Field(..., description="Title of the second item in English (e.g., 'Toad')")
    item_b_title_te: str = Field(..., description="Title of the second item in Telugu (e.g., 'గోదురు కప్ప')")
    steps: List[MicroScene] = Field(..., description="The granular step-by-step sequence.")

class VideoManifest(BaseModel):
    video_title: str = Field(default="Animal Comparisons Layout")
    comparisons: List[AnimalComparison] = Field(..., description="List of comparisons detected.")

def generate_precise_manifest():
    public_dir = "./public"
    animals_dir = os.path.join(public_dir, "animals")
    stickman_dir = os.path.join(public_dir, "stickman")
    audio_path = os.path.join(public_dir, "audio/narration.mp3")
    output_manifest_path = "./video_manifest.json"
    
    valid_extensions = ('.png', '.jpg', '.jpeg', '.webp', '.jpg.png')
    
    try:
        available_animals = [f for f in os.listdir(animals_dir) if f.lower().endswith(valid_extensions)]
        available_stickmen = [f for f in os.listdir(stickman_dir) if f.lower().endswith(valid_extensions)]
    except FileNotFoundError as e:
        print(f"Error: Asset directories not found. {e}")
        return

    client = genai.Client()
    uploaded_audio = client.files.upload(file=audio_path)

    prompt = f"""
    You are an automated video editing coordinator.
    Listen to the audio narration and create a precise timeline manifest.

    CRITICAL LANGUAGE RULE:
    - DO NOT TRANSLATE THE AUDIO TO ENGLISH. 
    - If the audio is in Telugu, write the transcription in the Telugu script (e.g., "ఇది కప్ప").
    - If the audio is in Spanish, write it in Spanish.
    - The fields `spoken_phrase` and `text_overlay` MUST preserve the exact native language script as heard in the audio file and no words should be skipped or altered.

    CRITICAL TITLE RULES:
    - Identify the two items being compared in each topic.
    - Provide their titles in both English (`item_a_title_en`, `item_b_title_en`) and Telugu (`item_a_title_te`, `item_b_title_te`).


    CRITICAL VISIBILITY RULES FOR ANIMALS:
    - Step 1 (Intro Animal A): Set `visible_animals` to ONLY include Animal A's filename. Stickman must be pointing left.
    - Step 2 (Intro Animal B): Set `visible_animals` to include BOTH Animal A AND Animal B filenames. Stickman must be pointing right.
    - Step 3 (Question): Set `visible_animals` to include BOTH filenames. Stickman must be wondering.
    - Step 4 (Explain Animal A): Set `visible_animals` to include BOTH filenames. Stickman must be explaining left.
    - Step 5 (Explain Animal B): Set `visible_animals` to include BOTH filenames. Stickman must be explaining right.

    CRITICAL CAPTION RULES:
    - Break long native language sentences i.e `text_overlay` down into multiple sequential timeline blocks with precise micro-timestamps (max 6 to 8 words at a time) so they don't overflow the screen width.
    - Maintain the stickman's pose and the visible animals as per the visibility rules above for each micro-timestamp block.

    STRICT ASSET FILENAMES:
    - Available Animal Files: {available_animals}
    - Available Stickman Files: {available_stickmen}

    TIMING RULES:
    steps must be sequential and non-overlapping:
    - start_time_seconds of the step should be equal to end_time_seconds of the previous step.
    - The first step of first topic_name should start at 0.0 seconds.

    topic_name timings:
    - start_time_seconds of the first step of each topic_name should be equal to end_time_seconds of the last step of the previous topic_name.
    """

    print("Generating manifest preserving native script...")
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[uploaded_audio, prompt],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=VideoManifest,
            temperature=0.1
        ),
    )

    # ensure_ascii=False saves the native script directly without converting it to \uXXXX strings
    with open(output_manifest_path, "w", encoding="utf-8") as f:
        json.dump(json.loads(response.text), f, indent=2, ensure_ascii=False)
        
    client.files.delete(name=uploaded_audio.name)
    print("Done!")

if __name__ == "__main__":
    generate_precise_manifest()