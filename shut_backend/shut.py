import os
import platform
import requests
import time

NODE_API_URL = 'http://localhost:5000/get-shutdown'

def check_shutdown(unique_id):
    print(f"Listening for shutdown state for user: {unique_id}")

    while True:
        try:
            # Append the unique_id to the URL to get the shutdown state for that user
            response = requests.get(f"{NODE_API_URL}/{unique_id}")
            response.raise_for_status()  # Ensure a successful response
            data = response.json()
            print(data)
            if data.get('shutdown'):  # If shutdown is true
                system = platform.system().lower()
                if system == 'windows':
                    print("!!!!!!!! SHUTING DOWN !!!!!!!!   in 5 secs")
                    time.sleep(5)
                    os.system("shutdown /s /f /t 0")  # Shutdown Windows immediately
                elif system in ['linux', 'darwin']:
                    os.system("shutdown now")  # Shutdown Linux/macOS immediately
                else:
                    print("Unsupported OS")
        except requests.exceptions.RequestException as e:
            print(f"Network error: {e}")
        except Exception as e:
            print(f"Error: {e}")

        time.sleep(10)  # Wait for 10 seconds before checking again

if __name__ == '__main__':
    # Replace "chang the value" with the actual unique user ID
    unique_id = 'USER_ID_PLACEHOLDER'
    check_shutdown(unique_id)
