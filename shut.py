import os
import platform
import requests
import time

NODE_API_URL = 'http://localhost:5000/get-shutdown'

def check_shutdown():
    unique_id = 'USER_ID_PLACEHOLDER'
    print(f"Listening for shutdown state for user: {unique_id}")

    while True:
        try:
            response = requests.get(NODE_API_URL)
            data = response.json()
            if data.get('shutdown'):
                system = platform.system().lower()
                if system == 'windows':
                    os.system("shutdown /s /f /t 0")
                elif system in ['linux', 'darwin']:
                    os.system("shutdown now")
                else:
                    print("Unsupported OS")
        except Exception as e:
            print(f"Error: {e}")
        time.sleep(10)

if __name__ == '__main__':
    check_shutdown()
