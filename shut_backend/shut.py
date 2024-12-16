import os
import platform
import requests
import time

NODE_API_URL = 'http://192.168.137.8:5000/get-shutdown'

def check_shutdown(unique_id):
    print(f"Listening for shutdown state for user: {unique_id}")

    while True:
        try:
            # Append the unique_id to the URL to get the shutdown state for that user
            response = requests.get(f"{NODE_API_URL}/{unique_id}")
            data = response.json()
            
            if data.get('shutdown'):  # If shutdown is true
                system = platform.system().lower()
                if system == 'windows':
                    os.system("shutdown /s /f /t 0")  # Shutdown Windows immediately
                elif system in ['linux', 'darwin']:
                    os.system("shutdown now")  # Shutdown Linux/macOS immediately
                else:
                    print("Unsupported OS")
        except Exception as e:
            print(f"Error: {e}")
        
        time.sleep(10)  # Wait for 10 seconds before checking again

if __name__ == '__main__':
    # Replace 'USER_ID_PLACEHOLDER' with the actual unique user ID
    unique_id = '8d4419a6-35b4-4182-b7c1-b86137cfe668'
    check_shutdown(unique_id)
