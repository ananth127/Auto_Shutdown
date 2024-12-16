import os
import platform
import requests
import time

# Node.js API URL to check the shutdown state
NODE_API_URL = 'http://localhost:5000/get-shutdown'

def check_shutdown():
    print("Started listening for shutdown state...")  # Indication that the script is listening
    
    while True:
        try:
            print("Fetching shutdown state...")  # Indication that a fetch is occurring
            
            # Fetch the shutdown state from the Node.js API
            response = requests.get(NODE_API_URL)
            data = response.json()
            shutdown_value = data.get('shutdown', False)

            if shutdown_value:
                system_platform = platform.system().lower()

                if system_platform == 'windows':
                    print("Shutdown state is ON. Shutting down Windows...")
                    os.system("shutdown /s /f /t 0")  # For Windows
                elif system_platform == 'linux' or system_platform == 'darwin':
                    print("Shutdown state is ON. Shutting down Linux/macOS...")
                    os.system("shutdown now")  # For Linux and macOS
                else:
                    print("Unsupported Operating System")
            else:
                print("Shutdown state is OFF. No action taken.")

            time.sleep(10)  # Check every 10 seconds

        except Exception as e:
            print(f"Error: {str(e)}")
            time.sleep(10)  # Retry after a brief pause

if __name__ == '__main__':
    check_shutdown()
