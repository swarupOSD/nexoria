import webview
import threading
import time
from app import app
import sys
import os
import webbrowser

def start_server():
    # Disable flask output to keep console clean
    import logging
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)

if __name__ == '__main__':
    # Start the Flask server in a background daemon thread
    server_thread = threading.Thread(target=start_server)
    server_thread.daemon = True
    server_thread.start()

    # Wait a second for the server to spin up
    time.sleep(1.5)

    try:
        # Create a native desktop window
        webview.create_window(
            'Nexoria Universal Downloader', 
            'http://127.0.0.1:5000',
            width=1200, 
            height=800,
            min_size=(900, 600)
        )
        webview.start()
    except Exception as e:
        print(f"Native window failed: {e}. Falling back to browser...")
        webbrowser.open('http://127.0.0.1:5000')
        while True:
            time.sleep(10)
