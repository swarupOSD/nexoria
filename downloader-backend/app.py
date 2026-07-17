from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
import yt_dlp
import os
import threading
import json
import time
import subprocess
import shutil
import sys
import socket
import speech_recognition as sr
import static_ffmpeg
from pytubefix import YouTube
from datetime import datetime

# Initialize static ffmpeg binaries (downloads if missing, adds to PATH)
static_ffmpeg.add_paths()

# Increase recursion depth for some complex playlists
sys.setrecursionlimit(2000)

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)  # Enable CORS for all routes (to allow Vercel to access APIs)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_FILE = os.path.join(BASE_DIR, 'profile.json')
HISTORY_FILE = os.path.join(BASE_DIR, 'history.json')
SETTINGS_FILE = os.path.join(BASE_DIR, 'settings.json')
DEFAULT_DOWNLOAD_DIR = os.path.join(BASE_DIR, 'Downloads')
AVATARS_DIR = os.path.join(BASE_DIR, 'static', 'avatars')

for d in [DEFAULT_DOWNLOAD_DIR, AVATARS_DIR]:
    if not os.path.exists(d): os.makedirs(d)

progress_tracker = {}

# --- Database Helpers ---
def load_json(filepath, default):
    if not os.path.exists(filepath): return default
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except: return default

def save_json(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)

def get_settings():
    return load_json(SETTINGS_FILE, {'download_path': DEFAULT_DOWNLOAD_DIR})

def add_to_history(video_info):
    history = load_json(HISTORY_FILE, [])
    if not any(v.get('id') == video_info.get('id') for v in history):
        history.insert(0, video_info)
        save_json(HISTORY_FILE, history[:50])

# --- YT-DLP Hooks & Utils ---
def my_hook(d):
    url = d.get('info_dict', {}).get('original_url', 'unknown')
    if d['status'] == 'downloading':
        try:
            percent = d.get('_percent_str', '0%').strip()
            speed = d.get('_speed_str', '---').strip()
            eta = d.get('_eta_str', '---').strip()
            percent_clean = percent.replace('\x1b[0;94m', '').replace('\x1b[0m', '')
            speed_clean = speed.replace('\x1b[0;92m', '').replace('\x1b[0m', '')
            eta_clean = eta.replace('\x1b[0;33m', '').replace('\x1b[0m', '')
            progress_tracker[url] = {'percent': percent_clean, 'speed': speed_clean, 'eta': eta_clean}
        except: pass
    elif d['status'] == 'finished':
        progress_tracker[url] = {'percent': '99.9%', 'speed': 'Done', 'eta': '0s'}

def format_size(bytes_val):
    if not bytes_val: return "Unknown Size"
    return f"{bytes_val / (1024*1024):.1f} MB"

def extract_clean_formats(info):
    formats = []
    best_audio = next((f for f in info.get('formats', []) if f.get('vcodec') == 'none' and f.get('ext') in ['m4a', 'webm']), None)
    audio_size = best_audio.get('filesize') or best_audio.get('filesize_approx') or 0 if best_audio else 0
    added_res = set()
    
    for f in reversed(info.get('formats', [])):
        res = f.get('height')
        ext = f.get('ext')
        if ext == 'mp4' and res is not None and res not in added_res:
            vcodec = f.get('vcodec')
            if vcodec != 'none':
                added_res.add(res)
                has_audio = f.get('acodec') != 'none'
                if has_audio:
                    size = f.get('filesize') or f.get('filesize_approx')
                    format_id = f.get('format_id')
                else:
                    v_size = f.get('filesize') or f.get('filesize_approx') or 0
                    size = v_size + audio_size if v_size else None
                    format_id = f"{f.get('format_id')}+bestaudio[ext=m4a]/bestaudio"
                
                formats.append({
                    'id': format_id,
                    'resolution': f"{res}p Video (MP4)",
                    'size': format_size(size),
                    'type': 'video'
                })
    
    # If no MP4 format was found (e.g., some Instagram links only have 'best'), add a generic fallback
    if not any(f['type'] == 'video' for f in formats):
        formats.append({
            'id': 'best',
            'resolution': "Best Quality (Default)",
            'size': 'Varies',
            'type': 'video'
        })
    
    formats.append({
        'id': 'audio-320', 'resolution': "High Quality Audio (320kbps MP3)",
        'size': format_size(audio_size * 2.5 if audio_size else None) if audio_size else 'Varies', 'type': 'audio'
    })
    formats.append({
        'id': 'audio-128', 'resolution': "Medium Quality Audio (128kbps MP3)",
        'size': format_size(audio_size), 'type': 'audio'
    })
    formats.append({
        'id': 'audio-64', 'resolution': "Low Quality Audio (64kbps MP3)",
        'size': format_size(audio_size * 0.5 if audio_size else None) if audio_size else 'Varies', 'type': 'audio'
    })
    return formats

# --- Main App Routes ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/profile', methods=['GET', 'POST'])
def profile_route():
    default_profile = {
        'name': 'Pro User',
        'bio': 'Downloading master',
        'gender': 'Not Specified',
        'avatar': ''
    }
    if request.method == 'POST':
        data = request.json
        save_json(PROFILE_FILE, data)
        return jsonify({'status': 'success'})
    return jsonify(load_json(PROFILE_FILE, default_profile))

@app.route('/info', methods=['POST'])
def get_info():
    url = request.json.get('url')
    if not url: return jsonify({'error': 'URL is required'}), 400
        
    try:
        ydl_opts = {
            'quiet': True, 
            'extract_flat': 'in_playlist', 
            'extractor_args': {'youtube': {'player_client': ['android', 'web']}}
        }
        cookie_file = os.path.join(BASE_DIR, 'cookies.txt')
        if os.path.exists(cookie_file):
            ydl_opts['cookiefile'] = cookie_file

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            if 'entries' in info:
                entries = [{'title': e.get('title'), 'url': e.get('url')} for e in info['entries']]
                return jsonify({'is_playlist': True, 'title': info.get('title'), 'entries': entries})
            else:
                return jsonify({
                    'is_playlist': False, 'id': info.get('id'), 'title': info.get('title', 'Unknown Title'),
                    'thumbnail': info.get('thumbnail'), 'duration': info.get('duration_string'),
                    'channel': info.get('uploader', 'Unknown Channel'), 'views': info.get('view_count', 0),
                    'formats': extract_clean_formats(info)
                })
    except Exception as e:
        # Fallback to pytubefix if yt-dlp fails
        try:
            yt = YouTube(url)
            formats = []
            for s in yt.streams:
                formats.append({
                    'id': str(s.itag),
                    'resolution': getattr(s, 'resolution', '') or 'Audio',
                    'size': round(s.filesize / 1024 / 1024, 1) if getattr(s, 'filesize', 0) else 0,
                    'type': 'video' if s.includes_video_track else 'audio',
                    'ext': s.subtype,
                    'vcodec': getattr(s, 'video_codec', ''),
                    'acodec': getattr(s, 'audio_codec', '')
                })
            return jsonify({
                'is_playlist': False, 'id': yt.video_id, 'title': yt.title,
                'thumbnail': yt.thumbnail_url, 'duration': str(yt.length),
                'channel': yt.author, 'views': yt.views,
                'formats': formats
            })
        except Exception as fallback_e:
            return jsonify({'error': f"yt-dlp error: {str(e)} | pytubefix error: {str(fallback_e)}"}), 500

@app.route('/api/upload-cookies', methods=['POST'])
def upload_cookies():
    try:
        if 'cookies' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['cookies']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        dest_path = os.path.join(BASE_DIR, 'cookies.txt')
        new_content = file.read().decode('utf-8', errors='ignore')
        
        # Always overwrite to prevent corrupted cookie files
        with open(dest_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
        return jsonify({'success': True, 'message': 'Cookies updated successfully!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def parse_time_to_seconds(t_str):
    if not t_str: return 0
    try:
        parts = str(t_str).split(':')
        if len(parts) == 3:
            return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])
        elif len(parts) == 2:
            return int(parts[0]) * 60 + float(parts[1])
        else:
            return float(parts[0])
    except:
        return 0

def cleanup_old_files():
    """Deletes files older than 30 minutes in the download directories to save server space."""
    settings = get_settings()
    base_dir = settings.get('download_path', DEFAULT_DOWNLOAD_DIR)
    categories = ['Videos', 'Music', 'Shorts_Reels', 'GIFs']
    now = time.time()
    for cat in categories:
        cat_dir = os.path.join(base_dir, cat)
        if os.path.exists(cat_dir):
            for file in os.listdir(cat_dir):
                file_path = os.path.join(cat_dir, file)
                if os.path.isfile(file_path):
                    if os.stat(file_path).st_mtime < now - 1800: # 1800 seconds = 30 minutes
                        try:
                            os.remove(file_path)
                            print(f"Cleaned up old file: {file_path}")
                        except:
                            pass

def download_task(url, format_id, media_type, start_time, end_time, title, thumbnail, schedule_time=None, volume_boost=False, download_subtitles=False, ai_transcription=False):
    try:
        # Handle Scheduled Time
        if schedule_time:
            now = datetime.now()
            target = datetime.strptime(schedule_time, "%H:%M").replace(year=now.year, month=now.month, day=now.day)
            if target < now:
                target = target.replace(day=now.day + 1)
            
            wait_seconds = (target - now).total_seconds()
            progress_tracker[url] = f'Scheduled for {schedule_time}'
            time.sleep(wait_seconds)
            progress_tracker[url] = '0%'

        settings = get_settings()
        base_download_dir = settings.get('download_path', DEFAULT_DOWNLOAD_DIR)
        
        is_audio = (media_type == 'audio')
        is_gif = (media_type == 'gif')
        
        # Determine category folder
        if is_audio:
            category_dir = 'Music'
        elif is_gif:
            category_dir = 'GIFs'
        else:
            # Need to figure out if it's a short video. We'll do it after extraction or assume it's Videos.
            category_dir = 'Videos'
            
        download_dir = os.path.join(base_download_dir, category_dir)
        if not os.path.exists(download_dir): os.makedirs(download_dir)
            
        ydl_opts = {
            'outtmpl': os.path.join(download_dir, '%(title)s.%(ext)s'),
            'progress_hooks': [my_hook], 'noplaylist': True,
            'extractor_args': {'youtube': {'player_client': ['android', 'web']}}
        }
        cookie_file = os.path.join(BASE_DIR, 'cookies.txt')
        if os.path.exists(cookie_file):
            ydl_opts['cookiefile'] = cookie_file
        
        if start_time and end_time:
            s_sec = parse_time_to_seconds(start_time)
            e_sec = parse_time_to_seconds(end_time)
            ydl_opts['download_ranges'] = yt_dlp.utils.download_range_func(None, [(s_sec, e_sec)])
            ydl_opts['force_keyframes_at_cuts'] = True


        if volume_boost and not is_gif:
            ydl_opts['postprocessor_args'] = ['-af', 'volume=2.0']
            
        if download_subtitles and not is_audio and not is_gif:
            ydl_opts.update({
                'writesubtitles': True,
                'writeautomaticsub': True,
                'subtitleslangs': ['en', 'bn'],
                'embedsubtitles': True
            })

        if is_audio:
            quality = '192'
            if format_id.startswith('audio-'): quality = format_id.split('-')[1]
            ydl_opts.update({
                'format': 'bestaudio/best',
                'writethumbnail': True,
                'postprocessors': [
                    {'key': 'FFmpegExtractAudio', 'preferredcodec': 'mp3', 'preferredquality': quality},
                    {'key': 'EmbedThumbnail', 'already_have_thumbnail': False}
                ]
            })
        else:
            ydl_opts.update({'format': format_id, 'merge_output_format': 'mp4'})
            
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=True)
            downloaded_file = ydl.prepare_filename(info_dict)
            base_name, _ = os.path.splitext(downloaded_file)
            
            if is_audio:
                final_path = base_name + '.mp3'
                type_label = 'Audio (MP3)'
            elif is_gif:
                progress_tracker[url] = 'Converting to GIF...'
                import subprocess
                mp4_file = base_name + '.mp4'
                final_path = base_name + '.gif'
                subprocess.run([FFMPEG_PATH, '-i', mp4_file, '-vf', 'fps=15,scale=480:-1:flags=lanczos', '-y', final_path], check=True)
                if os.path.exists(mp4_file):
                    os.remove(mp4_file)
                type_label = 'Animated GIF'
            else:
                final_path = base_name + '.mp4'
                type_label = 'Video (MP4)'
                
                # Smart Auto-Organizer for Shorts/Reels
                duration = info_dict.get('duration', 0)
                if duration and duration <= 65:
                    shorts_dir = os.path.join(base_download_dir, 'Shorts_Reels')
                    if not os.path.exists(shorts_dir): os.makedirs(shorts_dir)
                    new_path = os.path.join(shorts_dir, os.path.basename(final_path))
                    shutil.move(final_path, new_path)
                    final_path = new_path
                    type_label = 'Short/Reel (MP4)'
        
        if ai_transcription and not is_gif:
            progress_tracker[url] = 'Generating AI Transcription...'
            try:
                # Need a wav file for SpeechRecognition
                wav_file = os.path.join(base_download_dir, 'temp_audio_for_ai.wav')
                subprocess.run([FFMPEG_PATH, '-i', final_path, '-ar', '16000', '-ac', '1', '-y', wav_file], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                
                recognizer = sr.Recognizer()
                with sr.AudioFile(wav_file) as source:
                    audio_data = recognizer.record(source, duration=180) # Process first 3 minutes only to save time
                text = recognizer.recognize_google(audio_data)
                
                txt_path = os.path.splitext(final_path)[0] + '_Transcription.txt'
                with open(txt_path, 'w', encoding='utf-8') as f:
                    f.write(f"AI Transcription for: {title}\n\n")
                    f.write(text)
                    
                if os.path.exists(wav_file):
                    os.remove(wav_file)
            except Exception as e:
                print(f"Transcription Error: {e}")

        progress_tracker[url] = f'Completed|{os.path.basename(final_path)}'
        
        add_to_history({
            'id': str(time.time()), 'title': title, 'thumbnail': thumbnail,
            'url': url, 'type': type_label, 
            'date': time.strftime("%Y-%m-%d %H:%M"),
            'file_path': final_path
        })
    except Exception as e:
        progress_tracker[url] = f'Error: {str(e)}'

@app.route('/api/search', methods=['POST'])
def search_yt():
    query = request.json.get('query')
    if not query: return jsonify({'error': 'Query required'}), 400
    try:
        ydl_opts = {'quiet': True, 'extract_flat': True}
        cookie_file = os.path.join(BASE_DIR, 'cookies.txt')
        if os.path.exists(cookie_file):
            ydl_opts['cookiefile'] = cookie_file
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"ytsearch5:{query}", download=False)
            entries = [{'title': e.get('title'), 'url': e.get('url'), 'thumbnail': e.get('thumbnails', [{}])[0].get('url')} for e in info.get('entries', [])]
            return jsonify({'results': entries})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/play-file', methods=['POST'])
def play_file():
    path = request.json.get('path')
    if path and os.path.exists(path):
        if sys.platform == "win32":
            os.startfile(path)
        return jsonify({'status': 'success'})
    return jsonify({'error': 'File not found'}), 404

@app.route('/api/open-folder', methods=['POST'])
def open_folder():
    path = request.json.get('path')
    if path:
        folder = os.path.dirname(path)
        if os.path.exists(folder):
            if sys.platform == "win32":
                os.startfile(folder)
            return jsonify({'status': 'success'})
    return jsonify({'error': 'Folder not found'}), 404

@app.route('/api/local-ip', methods=['GET'])
def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return jsonify({'ip': ip})
    except:
        return jsonify({'ip': '127.0.0.1'})

@app.route('/download-file/<path:filename>')
def serve_downloaded_file(filename):
    settings = get_settings()
    d_path = settings.get('download_path', DEFAULT_DOWNLOAD_DIR)
    return send_from_directory(d_path, filename, as_attachment=True)

@app.route('/api/media', methods=['GET'])
def get_media_library():
    settings = get_settings()
    base_dir = settings.get('download_path', DEFAULT_DOWNLOAD_DIR)
    media_files = []
    
    categories = ['Videos', 'Music', 'Shorts_Reels', 'GIFs']
    for category in categories:
        cat_dir = os.path.join(base_dir, category)
        if os.path.exists(cat_dir):
            for file in os.listdir(cat_dir):
                if file.endswith(('.mp4', '.mp3', '.m4a', '.gif')):
                    media_files.append({
                        'name': file,
                        'category': category,
                        'path': f"{category}/{file}"
                    })
    return jsonify(media_files)

@app.route('/download', methods=['POST'])
def start_download():
    # Run cleanup to save space before a new download
    threading.Thread(target=cleanup_old_files).start()
    
    data = request.json
    url = data.get('url')
    format_id = data.get('format_id')
    
    if not url or not format_id: return jsonify({'error': 'URL and Format ID are required'}), 400
    progress_tracker[url] = '0%'
    
    thread = threading.Thread(target=download_task, args=(
        url, format_id, data.get('type', 'video'),
        data.get('start_time'), data.get('end_time'), data.get('title', 'Unknown'), data.get('thumbnail', ''),
        data.get('schedule_time'), data.get('volume_boost', False), data.get('download_subtitles', False),
        data.get('ai_transcription', False)
    ))
    thread.daemon = True
    thread.start()
    return jsonify({'status': 'started'})

def batch_download_worker(urls):
    for url in urls:
        progress_tracker['batch_status'] = f'Downloading {url}...'
        try:
            ydl_opts_info = {'quiet': True}
            cookie_file = os.path.join(BASE_DIR, 'cookies.txt')
            if os.path.exists(cookie_file):
                ydl_opts_info['cookiefile'] = cookie_file
            with yt_dlp.YoutubeDL(ydl_opts_info) as ydl:
                info = ydl.extract_info(url, download=False)
                title = info.get('title', 'Unknown')
                thumbnail = info.get('thumbnail', '')
            
            progress_tracker[url] = '0%'
            download_task(url, 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best', 'video', None, None, title, thumbnail, None, False, False, False)
            while progress_tracker.get(url) not in ['Completed'] and not progress_tracker.get(url, '').startswith('Error'):
                time.sleep(1)
        except Exception as e:
            progress_tracker[url] = f'Error: {str(e)}'
            
    progress_tracker['batch_status'] = 'All Completed'

@app.route('/batch-download', methods=['POST'])
def batch_download():
    urls = [u.strip() for u in request.json.get('urls', '').split('\n') if u.strip()]
    if not urls: return jsonify({'error': 'No valid URLs'}), 400
    
    progress_tracker['batch_status'] = 'Starting Batch...'
    progress_tracker['batch_urls'] = urls
    for u in urls: progress_tracker[u] = 'Pending'
    
    thread = threading.Thread(target=batch_download_worker, args=(urls,))
    thread.daemon = True
    thread.start()
    
    return jsonify({'status': 'started', 'urls': urls})

@app.route('/progress')
def get_progress():
    url = request.args.get('url')
    if url == 'batch':
        urls_status = {}
        for u in progress_tracker.get('batch_urls', []):
            st = progress_tracker.get(u, 'Pending')
            if isinstance(st, dict): st = st.get('percent', 'Downloading...')
            urls_status[u] = st
        return jsonify({
            'status': progress_tracker.get('batch_status', ''),
            'urls': urls_status
        })
        
    val = progress_tracker.get(url, {'percent': '0%', 'speed': '---', 'eta': '---'})
    if isinstance(val, str):
        return jsonify({'progress': {'percent': val, 'speed': '', 'eta': ''}})
    return jsonify({'progress': val})

@app.route('/api/list-dir', methods=['POST'])
def list_dir():
    try:
        path = request.json.get('path', '').strip()
        
        # If no path, return root or Windows drives
        if not path:
            if sys.platform == "win32":
                import string
                from ctypes import windll
                drives = []
                bitmask = windll.kernel32.GetLogicalDrives()
                for letter in string.ascii_uppercase:
                    if bitmask & 1:
                        drives.append(f"{letter}:\\")
                    bitmask >>= 1
                return jsonify({'current': '', 'parent': '', 'dirs': drives})
            else:
                return jsonify({'current': '/', 'parent': '/', 'dirs': [d for d in os.listdir('/') if os.path.isdir(os.path.join('/', d))]})
            
        if not os.path.exists(path):
            return jsonify({'error': 'Path not found'}), 400
            
        # Get parent path
        parent = os.path.dirname(path) if path.strip('\\') else ''
        if parent == path: # e.g. C:\
            parent = ''
            
        dirs = []
        try:
            for item in os.listdir(path):
                full_path = os.path.join(path, item)
                if os.path.isdir(full_path):
                    dirs.append(item)
        except PermissionError:
            pass # Ignore folders we can't access
            
        return jsonify({'current': path, 'parent': parent, 'dirs': sorted(dirs)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload-avatar', methods=['POST'])
def upload_avatar():
    try:
        if 'avatar' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['avatar']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        filename = os.path.basename(file.filename)
        dest_path = os.path.join(AVATARS_DIR, filename)
        file.save(dest_path)
        return jsonify({'url': f'/static/avatars/{filename}'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    history = load_json(HISTORY_FILE, [])
    total_dls = len(history)
    last_dl = history[0]['date'] if total_dls > 0 else 'Never'
    
    # We estimate 25MB per file since we didn't save exact sizes in history previously.
    # In a real app, we'd sum up actual file sizes on disk in the download_path.
    settings = get_settings()
    d_path = settings.get('download_path', DEFAULT_DOWNLOAD_DIR)
    total_bytes = 0
    if os.path.exists(d_path):
        for f in os.listdir(d_path):
            fp = os.path.join(d_path, f)
            if os.path.isfile(fp):
                total_bytes += os.path.getsize(fp)
                
    total_gb = total_bytes / (1024**3)
    
    return jsonify({
        'total_downloads': total_dls,
        'total_storage': f"{total_gb:.2f} GB",
        'last_download': last_dl
    })

@app.route('/api/history', methods=['GET'])
def get_history_route():
    return jsonify(load_json(HISTORY_FILE, []))

@app.route('/api/settings', methods=['GET', 'POST'])
def settings_route():
    if request.method == 'POST':
        save_json(SETTINGS_FILE, request.json)
        return jsonify({'status': 'success'})
    return jsonify(get_settings())

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)
