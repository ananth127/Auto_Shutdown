import os
import platform
import requests
import time

NODE_API_URL = 'https://auto-shutdown-alpha.vercel.app/get-shutdown'

def check_shutdown(unique_id):
    print(f"Listening for shutdown state for user: {unique_id}")

    while True:
        try:
            response = requests.get(f"{NODE_API_URL}/{unique_id}")
            response.raise_for_status()
            data = response.json()
            if data.get('shutdown'):  # If shutdown is true
                system = platform.system().lower()
                url = "https://auto-shutdown-alpha.vercel.app/toggle-shutdown"
                data = {"uniqueId": unique_id, "shutdown": False}
                response = requests.post(url, json=data)
                if response.status_code == 200:
                    if system == 'windows':
                        time.sleep(5)
                        os.system("shutdown /s /f /t 0")  # Shutdown Windows immediately
                    elif system in ['linux', 'darwin']:
                        os.system("shutdown now")  # Shutdown Linux/macOS immediately
                else:
                    print(f"Failed to update shutdown state. Status code: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"Network error: {e}")
        except Exception as e:
            print(f"Error: {e}")

        time.sleep(10)

if __name__ == '__main__':
    unique_id = 'USER_ID_PLACEHOLDER'
    check_shutdown(unique_id)
