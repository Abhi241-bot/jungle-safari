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
                **Date of Observation:** {date}

                **FORMAT DETECTION:**
                - If observation starts with "Guided 16-question inspection log:", this is a STRUCTURED FORMAT
                - Otherwise, treat as FREE-FORM observation text
                
                **FOR GUIDED 16-QUESTION FORMAT:**
                The observation contains answers to 16 specific questions. Map them as follows:
                - Q1 (Feed/water/digestion) → `feed_given_as_prescribed`, `feed_and_supplements_available`
                - Q2 (Injury/illness) → `normal_behaviour_status`, `normal_behaviour_details`
                - Q3 (Behavior/activity) → Include in `daily_animal_health_monitoring`
                - Q4 (Mating/pregnancy) → Include in `daily_animal_health_monitoring`
                - Q5 (Death/critical) → Include in `daily_animal_health_monitoring`
                - Q6 (Enclosure cleanliness) → `enclosure_cleaned_properly`
                - Q7 (Hygiene/pest/safety) → Include in `daily_wildlife_monitoring`
                - Q8 (Staff status) → Extract name to `incharge_signature`
                - Q9 (Other observations) → `other_animal_requirements`
                - Q10 (Enclosure checked) → `enclosure_cleaned_properly`
                - Q11 (Water trough) → `clean_drinking_water_provided`
                - Q12-Q15 (Fence/moat/pest/staff) → Include in `daily_wildlife_monitoring`
                - Q16 (Kraal chemical) → Include in `daily_wildlife_monitoring`
                
                Synthesize all Q1-Q9 answers into a comprehensive `daily_animal_health_monitoring` summary.

                **CRITICAL INSTRUCTIONS:**
                1.  Read the observation text VERY CAREFULLY. It may be in Hindi, English, or mixed.
                2.  EXTRACT SPECIFIC DETAILS from the text - do NOT make generic assumptions.
                3.  For each field, look for CONCRETE EVIDENCE in the text:
                    - If text mentions "सुबह 7 बजे" or "7 AM", note the specific time
                    - If text mentions names like "राकेश" or "Rakesh", use the ACTUAL name
                    - If text mentions specific foods like "गन्ना, केला" or "sugarcane, banana", list them
                    - If text mentions medicine/vitamins, include those details
                    - If text mentions specific requirements like "छाया के लिए पेड़" or "trees for shade", extract that
                
                4.  Field-specific extraction rules:
                    - `incharge_signature`: Extract the ACTUAL name from text (e.g., "राकेश कुमार" or "Rakesh Kumar"). If not found, use "Zookeeper"
                    - `daily_animal_health_monitoring`: Summarize health status, behavior, any issues mentioned
                    - `other_animal_requirements`: Extract SPECIFIC needs mentioned (e.g., "Need trees for shade, need mud pit for bathing")
                    - `carnivorous_animal_feeding_chart`: If animal is carnivore, extract meat feeding details. If herbivore, state "Not applicable - herbivore"
                    - `medicine_stock_register`: Extract medicine/vitamin details if mentioned, otherwise "No medicine administered"
                    - `daily_wildlife_monitoring`: Summarize overall observation with specific details (weight, behavior, time observed)
                
                5.  Boolean fields (true/false):
                    - Look for keywords: "समय पर देखा" = observed on time (true)
                    - "साफ पानी" = clean water (true)
                    - "सफाई की गई" = cleaned (true)
                    - "सामान्य व्यवहार" = normal behavior (true)
                    - If NOT mentioned, assume true unless there's evidence of a problem
                
                6.  Return ONLY a valid JSON object. No extra text, comments, or markdown.

                {format_instructions}

                Observation Text: {observation}
            """,
            input_variables=["observation", "animal_name", "date"],
            partial_variables={"format_instructions": self.parser.get_format_instructions()},
        )

    # ----------------------------
    # Deepgram Transcription
    # ----------------------------
    def transcribe_audio(self, audio_bytes, content_type="audio/webm"):
        """Transcribe audio using Deepgram API with Groq Whisper fallback."""
        transcript = ""
        
        # Try Deepgram first
        if self.deepgram_key:
            try:
                print(f"🎤 Trying Deepgram transcription: {len(audio_bytes)} bytes, type: {content_type}")
                headers = {
                    "Authorization": f"Token {self.deepgram_key}",
                    "Content-Type": content_type
                }
                params = {
                    "model": "nova-2",
                    "language": "hi",  # Hindi language
                    "detect_language": "true",  # Auto-detect Hindi/English
                }
                response = requests.post(
                    self.deepgram_url, headers=headers, params=params, data=audio_bytes, timeout=60
                )
                
                print(f"📡 Deepgram response status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"📄 Deepgram full response: {result}")
                    
                    transcript = result.get("results", {}).get("channels", [{}])[0].get("alternatives", [{}])[0].get("transcript", "")
                    
                    if transcript:
                        print(f"✅ Deepgram transcript: '{transcript}'")
                        return transcript
                    else:
                        print("⚠️ Deepgram returned empty transcript (audio may be silent or too short)")
                else:
                    print(f"⚠️ Deepgram failed with status {response.status_code}")
            except Exception as e:
                print(f"⚠️ Deepgram error: {e}")
        
        # Try Groq Whisper as fallback
        groq_key = os.environ.get("GROQ_API_KEY")
        if groq_key and not transcript:
            try:
                print("🔄 Trying Groq Whisper as fallback...")
                from groq import Groq
                import io
                
                client = Groq(api_key=groq_key)
                
                # Convert bytes to file-like object
                audio_file = io.BytesIO(audio_bytes)
                audio_file.name = "audio.webm"
                
                transcription = client.audio.transcriptions.create(
                    file=("audio.webm", audio_file, content_type),
                    model="whisper-large-v3",
                    language="hi",  # Hindi
                    response_format="text"
                )
                
                transcript = transcription if isinstance(transcription, str) else str(transcription)
                
                if transcript:
                    print(f"✅ Groq Whisper transcript: '{transcript}'")
                    return transcript
                else:
                    print("⚠️ Groq also returned empty transcript")
            except Exception as e:
                print(f"⚠️ Groq Whisper error: {e}")
        
        # If both failed or returned empty
        if not transcript:
            return "No speech detected in audio. Please ensure microphone is working and speak clearly."
        
        return transcript


    # ----------------------------
    # AI Processing with Gemini (Service Account)
    # ----------------------------
    def process_observation(self, observation_text, date, animal_name="Unknown"):
        """Convert text observation into structured data using AI."""
        try:
            enhanced_observation = f"Date: {date}\nObservation: {observation_text}"
            
            # Try Groq first (fastest and highest rate limits)
            groq_api_key = os.environ.get("GROQ_API_KEY")
            if groq_api_key:
                import requests
                
                url = "https://api.groq.com/openai/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {groq_api_key}",
                    "Content-Type": "application/json"
                }
                
                prompt_text = self.prompt.format(observation=enhanced_observation, animal_name=animal_name, date=date)
                
                payload = {
                    "model": "llama-3.3-70b-versatile",  # Fast and accurate model
                    "messages": [
                        {"role": "system", "content": "You are an expert zoo monitoring assistant. Return only valid JSON."},
                        {"role": "user", "content": prompt_text}
                    ],
                    "temperature": 0.3,
                    "max_tokens": 1000
                }
                
                response = requests.post(url, json=payload, headers=headers, timeout=30)
                response.raise_for_status()
                
                result_data = response.json()
                json_text = result_data.get("choices", [{}])[0].get("message", {}).get("content", "")
                
                result = self.parser.parse(json_text)
                
                if hasattr(result, "date_or_day"):
                    result.date_or_day = date

                return result
            
            # Try service account (Gemini) as fallback
            service_account_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
            api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("OPENAI_API_KEY") or os.environ.get("HUGGINGFACE_API_KEY")
            
            if service_account_json:
                # Use service account authentication
                import json
                import requests
                from google.oauth2 import service_account
                from google.auth.transport.requests import Request
                
                # Parse service account credentials
                credentials_dict = json.loads(service_account_json)
                credentials = service_account.Credentials.from_service_account_info(
                    credentials_dict,
                    scopes=['https://www.googleapis.com/auth/generative-language']
                )
                
                # Get access token
                credentials.refresh(Request())
                access_token = credentials.token
                
                # Using gemini-2.5-flash-lite (best free tier availability in 2025)
                url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent"
                
                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "contents": [{
                        "parts": [{
                            "text": self.prompt.format(observation=enhanced_observation, animal_name=animal_name, date=date)
                        }]
                    }]
                }
                
                response = requests.post(url, json=payload, headers=headers, timeout=30)
                response.raise_for_status()
                
                result_data = response.json()
                json_text = result_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                
                result = self.parser.parse(json_text)
                
                if hasattr(result, "date_or_day"):
                    result.date_or_day = date

                return result
                
            elif api_key:
                # Fallback to API key authentication
                import requests
                
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={api_key}"
                
                headers = {"Content-Type": "application/json"}
                payload = {
                    "contents": [{
                        "parts": [{
                            "text": self.prompt.format(observation=enhanced_observation, animal_name=animal_name, date=date)
                        }]
                    }]
                }
                
                response = requests.post(url, json=payload, headers=headers, timeout=30)
                response.raise_for_status()
                
                result_data = response.json()
                json_text = result_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                
                result = self.parser.parse(json_text)
                
                if hasattr(result, "date_or_day"):
                    result.date_or_day = date

                return result
            else:
                print("No authentication found, using fallback data")
                return self._create_fallback_data(observation_text, date)

        except Exception as e:
            print(f"Error processing observation with AI: {e}")
            print("Using fallback data instead")
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
