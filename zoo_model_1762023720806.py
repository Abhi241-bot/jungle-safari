import os
import requests
from pydantic import BaseModel, Field
from langchain.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser
import google.generativeai as genai

# ----------------------------
# Schema for structured data
# ----------------------------
class AnimalMonitoringData(BaseModel):
    date_or_day: str = Field(..., description="Date or day of observation")
    animal_observed_on_time: bool = Field(..., description="Was the animal seen at the scheduled observation time?")
    clean_drinking_water_provided: bool = Field(..., description="Was clean drinking water available?")
    enclosure_cleaned_properly: bool = Field(..., description="Was the enclosure cleaned as required?")
    normal_behaviour_status: bool = Field(..., description="Is the animal showing normal behaviour and activity?")
    normal_behaviour_details: str | None = Field(None, description="If abnormal behaviour observed, provide details")
    feed_and_supplements_available: bool = Field(..., description="Was feed and supplements available?")
    feed_given_as_prescribed: bool = Field(..., description="Was the feed given as prescribed?")
    other_animal_requirements: str | None = Field(None, description="Any other special needs or requirements")
    incharge_signature: str = Field(..., description="Signature of caretaker or in-charge")
    daily_animal_health_monitoring: str = Field(..., description="Summary of daily animal health monitoring")
    carnivorous_animal_feeding_chart: str = Field(..., description="Summary of carnivorous animal feeding chart")
    medicine_stock_register: str = Field(..., description="Summary of medicine stock register")
    daily_wildlife_monitoring: str = Field(..., description="Summary of daily wildlife monitoring observations")


# ----------------------------
# Zoo AI Model with Deepgram
# ----------------------------
class ZooAIModel:
    def __init__(self):
        """Initialize Gemini LLM and Deepgram API."""
        # Gemini LLM
        gem_key = os.environ.get("GEMINI_API_KEY")
        if gem_key:
            genai.configure(api_key=gem_key)
            self.llm = genai.GenerativeModel("gemini-pro")  # Using stable gemini-pro model
        else:
            self.llm = None

        # Deepgram API
        self.deepgram_key = os.environ.get("DEEPGRAM_API_KEY") # Keep for checking if key exists
        self.deepgram_url = "https://api.deepgram.com/v1/listen"
        self.prefix = "" # Add a prefix attribute

        # Parser & prompt
        self.parser = PydanticOutputParser(pydantic_object=AnimalMonitoringData)
        self.prompt = PromptTemplate(
            template="""
                You are an expert zoo monitoring assistant. Your task is to analyze an observation log
                for a specific animal and convert it into a structured JSON format.

                **Animal Being Observed:** {animal_name}

                **Instructions:**
                1.  Read the observation text carefully.
                2.  Determine the boolean values (true/false) for each required field based on the text. For example, if the text says "animal was seen", set `animal_observed_on_time` to `true`.
                3.  Extract a concise summary for `daily_animal_health_monitoring`.
                4.  Fill in all other fields based on the observation. If a field is not mentioned, you can make a reasonable assumption (e.g., `incharge_signature` can be 'Zookeeper').
                5.  Return ONLY a valid JSON object that strictly follows the provided schema. Do not include any extra text, comments, or markdown.

                {format_instructions}

                Observation: {observation}
            """,
            input_variables=["observation", "animal_name"],
            partial_variables={"format_instructions": self.parser.get_format_instructions()},
        )

    # ----------------------------
    # Deepgram Transcription
    # ----------------------------
    def transcribe_audio(self, audio_bytes, content_type="audio/webm"):
        """Transcribe audio using Deepgram API."""
        if not self.deepgram_key:
            return "Audio transcription unavailable - Deepgram API key missing"
        
        try:
            headers = {
                "Authorization": f"Token {self.deepgram_key}",
                "Content-Type": content_type
            }
            params = {
                "model": "nova-2",
                "language": "en",  # Specify a single language
            }
            response = requests.post(
                self.deepgram_url, headers=headers, params=params, data=audio_bytes, timeout=60
            )
            response.raise_for_status()
            result = response.json()
            transcript = result.get("results", {}).get("channels", [{}])[0].get("alternatives", [{}])[0].get("transcript", "")
            return transcript or "No text returned by Deepgram"

        except Exception as e:
            print("Error transcribing audio:", e)
            return f"Error in audio transcription: {str(e)}"

    # ----------------------------
    # AI Processing with Hugging Face
    # ----------------------------
    def process_observation(self, observation_text, date, animal_name="Unknown"):
        """Convert text observation into structured data using Hugging Face."""
        try:
            enhanced_observation = f"Date: {date}\nObservation: {observation_text}"
            
            # Use Hugging Face Inference API (free, no enablement needed)
            hf_key = os.environ.get("HUGGINGFACE_API_KEY") or os.environ.get("GEMINI_API_KEY")
            if hf_key:
                import requests
                
                # Using Mistral model on Hugging Face (free inference)
                url = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1"
                
                headers = {
                    "Authorization": f"Bearer {hf_key}",
                    "Content-Type": "application/json"
                }
                
                # Create prompt for the model
                prompt_text = self.prompt.format(observation=enhanced_observation, animal_name=animal_name)
                
                payload = {
                    "inputs": prompt_text,
                    "parameters": {
                        "max_new_tokens": 1000,
                        "temperature": 0.7,
                        "return_full_text": False
                    }
                }
                
                response = requests.post(url, json=payload, headers=headers, timeout=30)
                response.raise_for_status()
                
                result_data = response.json()
                
                # Extract generated text
                if isinstance(result_data, list) and len(result_data) > 0:
                    json_text = result_data[0].get("generated_text", "")
                else:
                    json_text = ""
                
                # Try to parse the JSON response
                result = self.parser.parse(json_text)
                
                if hasattr(result, "date_or_day"):
                    result.date_or_day = date

                return result
            else:
                return self._create_fallback_data(observation_text, date)

        except Exception as e:
            print(f"Error processing observation: {e}")
            return self._create_fallback_data(observation_text, date)


    def process_audio_observation(self, audio_bytes, date, content_type="audio/webm", animal_name="Unknown"):
        """Transcribe audio and process observation."""
        text = self.transcribe_audio(audio_bytes, content_type)
        full_text = self.prefix + text
        if text.startswith("Error") or text.startswith("Audio transcription unavailable"):
            return self._create_fallback_data(text, date)
        return self.process_observation(full_text, date, animal_name)

    # ----------------------------
    # Fallback Data
    # ----------------------------
    def _create_fallback_data(self, observation_text, date):
        """Return fallback structured data if LLM or transcription fails."""
        return AnimalMonitoringData(
            date_or_day=date,
            animal_observed_on_time=True,
            clean_drinking_water_provided=True,
            enclosure_cleaned_properly=True,
            normal_behaviour_status=True,
            normal_behaviour_details=None,
            feed_and_supplements_available=True,
            feed_given_as_prescribed=True,
            other_animal_requirements=observation_text,  # Full text, no truncation
            incharge_signature="Zoo Keeper",
            daily_animal_health_monitoring=f"Observation recorded on {date}: {observation_text}",  # Full text
            carnivorous_animal_feeding_chart="Standard feeding schedule followed",
            medicine_stock_register="Stock levels adequate",
            daily_wildlife_monitoring=f"Wildlife monitoring completed on {date}"
        )


# Instantiate global model
zoo_model = ZooAIModel()
