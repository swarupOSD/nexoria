import os
import time
import json
import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.bot')

# Configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
NEXORIA_API_URL = os.getenv('NEXORIA_API_URL', 'http://localhost:5000/api/posts')
ADMIN_TOKEN = os.getenv('ADMIN_TOKEN')
TARGET_URL = "https://an1.com/tags/MOD/"

# Validate setup
if not GEMINI_API_KEY:
    print("❌ ERROR: GEMINI_API_KEY is missing in .env.bot")
    exit(1)
if not ADMIN_TOKEN:
    print("❌ ERROR: ADMIN_TOKEN is missing in .env.bot")
    exit(1)

# Initialize Gemini AI
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-flash-latest')

def get_category_id(app_title):
    """
    Dummy mapping function. You can fetch categories from Nexoria API dynamically,
    but for now, we'll return a static fallback category ID if needed, 
    or you can configure this to fetch from your backend.
    """
    # NOTE: You need to replace this with a real Category ObjectId from your MongoDB!
    # For now, it will require a manual edit in this script or fetching from /api/categories
    return os.getenv('DEFAULT_CATEGORY_ID', '665123456789abcdef123456')

def scrape_an1_mods(page=1):
    """Scrape a page from an1.com/tags/MOD/ and extract app links"""
    url = f"{TARGET_URL}page/{page}/" if page > 1 else TARGET_URL
    print(f"🔍 Scraping {url}...")
    
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Failed to fetch page. Status code: {response.status_code}")
        return []
        
    soup = BeautifulSoup(response.text, 'html.parser')
    apps = []
    
    # Find all app containers on an1.com
    # Structure typically: <div class="app_list">... <div class="item">...
    items = soup.find_all('div', class_='item')
    
    for item in items:
        try:
            link_tag = item.find('a')
            app_url = link_tag['href']
            
            img_tag = item.find('img')
            icon_url = img_tag['src']
            
            name_tag = item.find('div', class_='name')
            a_tag = name_tag.find('a')
            title = a_tag.find('span').text.strip() if a_tag.find('span') else a_tag.text.strip()
            
            # Since version is not explicitly in the HTML, we can extract it or default to 1.0
            version = "1.0" 
            
            apps.append({
                'title': title,
                'version': version,
                'icon_url': icon_url,
                'source_url': a_tag['href']
            })
        except Exception as e:
            print(f"⚠️ Failed to parse an item: {e}")
            
    return apps

def generate_seo_content(app_title, version, retries=0):
    """Use Gemini AI to write an SEO friendly description and extract features"""
    print(f"🤖 Generating AI content for {app_title}...")
    
    prompt = f"""
    You are an expert SEO content writer for a Mod APK website. 
    Write a 300-word engaging description for the android game/app "{app_title} Mod APK (Version {version})".
    Also, provide exactly 3 bullet points of Mod features.
    
    Return the response ONLY in this exact JSON format, no markdown blocks:
    {{
      "description": "HTML formatted description string (use <p>, <h2>, <strong>)",
      "modFeatures": ["feature 1", "feature 2", "feature 3"],
      "seoTitle": "catchy SEO title under 60 characters",
      "seoDescription": "meta description under 160 characters",
      "tags": ["tag1", "tag2", "tag3", "tag4"]
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text
        # Clean markdown formatting if gemini adds it
        if text.startswith('```json'):
            text = text[7:-3]
            
        data = json.loads(text.strip())
        return data
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg and retries < 2:
            print("⏳ Google API Rate Limit hit. Waiting 20 seconds before retrying...")
            time.sleep(20)
            return generate_seo_content(app_title, version, retries + 1)
            
        print(f"❌ AI Generation Failed: {e}")
        return None

def upload_to_nexoria(app_data, ai_data):
    """Post the generated app to Nexoria Backend via API"""
    print(f"🚀 Uploading {app_data['title']} to Nexoria...")
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {ADMIN_TOKEN}'
    }
    
    # Format slug
    slug = app_data['title'].lower().replace(' ', '-').replace('/', '-') + f"-{int(time.time())}"
    
    payload = {
        "title": app_data['title'],
        "slug": slug,
        "featuredImage": app_data['icon_url'],
        "appLogo": app_data['icon_url'],
        "version": app_data['version'],
        "content": ai_data.get('description', f"<p>Download {app_data['title']} Mod APK.</p>"),
        "description": ai_data.get('seoDescription', ''),
        "modFeatures": ai_data.get('modFeatures', []),
        "category": get_category_id(app_data['title']),
        "tags": ai_data.get('tags', []),
        "seoTitle": ai_data.get('seoTitle', app_data['title']),
        "seoDescription": ai_data.get('seoDescription', ''),
        "status": "Draft", # Important: Save as Draft so Admin can review before publishing!
        "appType": "Free",
        "downloadLinks": [
            {
                "label": "Direct Download",
                "url": app_data['source_url'], # Might need an intermediate scraper to get the actual file URL
                "type": "primary",
                "priority": 1
            }
        ]
    }
    
    try:
        res = requests.post(NEXORIA_API_URL, json=payload, headers=headers)
        if res.status_code == 201:
            print(f"✅ Success! '{app_data['title']}' added to Drafts.")
        else:
            print(f"❌ Upload Failed! Status: {res.status_code}, Response: {res.text}")
    except Exception as e:
        print(f"❌ Upload Request Failed: {e}")

def main():
    print("==================================================")
    print("🤖 NEXORIA AI AUTO-SCRAPER BOT INITIALIZED 🤖")
    print("==================================================")
    
    apps = scrape_an1_mods(page=1)
    print(f"Found {len(apps)} apps on page 1.")
    
    # Process only the first 2 apps as a test run
    for app in apps[:2]:
        time.sleep(2) # Prevent rate limiting
        ai_data = generate_seo_content(app['title'], app['version'])
        if ai_data:
            upload_to_nexoria(app, ai_data)
            
    print("🎉 Bot Run Completed!")

if __name__ == "__main__":
    main()
